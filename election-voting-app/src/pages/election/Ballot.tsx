import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiList, FiPlus, FiUploadCloud, FiMoreVertical, FiTrash2, FiDownload, FiPaperclip, FiUsers, FiEdit, FiCheckCircle, FiEdit3, FiLoader } from 'react-icons/fi';
import { ElectionSidebarLayout } from '../../components/layout/ElectionSidebarLayout';
import { EditBallotModal } from '../../components/election/EditBallotModal';
import { BulkAddModal } from '../../components/election/BulkAddModal';
import { AddOptionTypeModal } from '../../components/election/AddOptionTypeModal';
import { ImportBallotModal } from '../../components/election/ImportBallotModal';
import { AddQuestionTypeModal } from '../../components/election/AddQuestionTypeModal';
import { EditOptionModal } from '../../components/election/EditOptionModal';
import { OptionDetailsModal } from '../../components/election/OptionDetailsModal';
import { api } from '../../utils/api';
import { BallotQuestion, CandidateOption, Election } from '../../types';

export const Ballot: React.FC = () => {
  const { id: electionId } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<BallotQuestion[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<BallotQuestion | null>(null);
  const [bulkAddQuestion, setBulkAddQuestion] = useState<BallotQuestion | null>(null);
  const [addingOptionType, setAddingOptionType] = useState<BallotQuestion | null>(null);
  const [editingOption, setEditingOption] = useState<{ question: BallotQuestion, option?: CandidateOption } | null>(null);
  const [viewingOption, setViewingOption] = useState<{ question: BallotQuestion, option: CandidateOption } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddQuestionTypeModal, setShowAddQuestionTypeModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (electionId) {
      fetchData(electionId);
    }
  }, [electionId]);

  const fetchData = async (id: string) => {
    try {
      const [questionsData, electionData] = await Promise.all([
        api.getBallotQuestions(id),
        api.getElectionById(id)
      ]);
      setQuestions(questionsData as unknown as BallotQuestion[]);
      setElection(electionData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (type: 'multiple_choice' | 'ranked_choice' | 'yes_no') => {
    if (!electionId) return;
    
    try {
      const newQuestionData = {
        election_id: electionId,
        title: type === 'multiple_choice' ? 'New Multiple Choice Question' : type === 'ranked_choice' ? 'New Ranked Choice Question' : 'New Yes/No Question',
        description: '',
        type: type,
        min_selections: 1,
        max_selections: 1,
        randomize_options: false,
        order_index: questions.length
      };

      const newQuestion = await api.createBallotQuestion(newQuestionData);
      const questionWithEmptyOptions = { ...newQuestion, candidate_options: [] };
      
      setQuestions([...questions, questionWithEmptyOptions]);
      setShowAddQuestionTypeModal(false);

      if (type === 'ranked_choice') {
        window.location.href = `/election/${electionId}/ballot/ranked-choice/${newQuestion.id}`;
      } else {
        setEditingQuestion(questionWithEmptyOptions);
        triggerSuccess('Question added to ballot!');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    }
  };

  const handleSaveQuestion = async (updatedQuestion: BallotQuestion) => {
    try {
      const { candidate_options, ...updateData } = updatedQuestion;
      await api.updateBallotQuestion(updatedQuestion.id, updateData);
      setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
      setEditingQuestion(null);
      triggerSuccess('Question updated successfully!');
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await api.deleteBallotQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
      setEditingQuestion(null);
      triggerSuccess('Question deleted successfully!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const handleBulkAddOptions = async (options: string[]) => {
    if (!bulkAddQuestion || !electionId) return;
    
    try {
      const newOptionsData = options.map((opt, index) => ({
        ballot_question_id: bulkAddQuestion.id,
        title: opt,
        short_description: '',
        description: '',
        type: 'standard' as const,
        order_index: (bulkAddQuestion.candidate_options?.length || 0) + index
      }));

      const addedOptions = await api.bulkCreateCandidateOptions(newOptionsData);
      
      setQuestions(questions.map(q => 
        q.id === bulkAddQuestion.id 
          ? { ...q, candidate_options: [...(q.candidate_options || []), ...addedOptions] }
          : q
      ));
      setBulkAddQuestion(null);
      triggerSuccess('Options added successfully!');
    } catch (error) {
      console.error('Error bulk adding options:', error);
      alert('Failed to add options');
    }
  };

  const handleAddOption = (type: 'standard' | 'write-in') => {
    if (!addingOptionType) return;
    setEditingOption({ 
      question: addingOptionType,
      option: {
        id: '', // Will be generated by Supabase
        ballot_question_id: addingOptionType.id,
        title: type === 'write-in' ? 'Write-In' : 'New Option',
        short_description: '',
        description: '',
        type: type,
        order_index: addingOptionType.candidate_options?.length || 0
      }
    });
    setAddingOptionType(null);
  };

  const handleSaveOption = async (updatedOption: CandidateOption) => {
    if (!editingOption) return;
    const { question } = editingOption;
    
    try {
      let savedOption;
      if (updatedOption.id) {
        savedOption = await api.updateCandidateOption(updatedOption.id, updatedOption);
      } else {
        const { id, ...createData } = updatedOption;
        savedOption = await api.createCandidateOption(createData);
      }

      setQuestions(questions.map(q => {
        if (q.id === question.id) {
          const options = q.candidate_options || [];
          const optionExists = options.find(o => o.id === savedOption.id);
          const newOptions = optionExists 
            ? options.map(o => o.id === savedOption.id ? savedOption : o)
            : [...options, savedOption];
          return { ...q, candidate_options: newOptions };
        }
        return q;
      }));
      setEditingOption(null);
      triggerSuccess('Option saved successfully!');
    } catch (error) {
      console.error('Error saving option:', error);
      alert('Failed to save option');
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!editingOption) return;
    const { question } = editingOption;
    
    try {
      await api.deleteCandidateOption(optionId);
      setQuestions(questions.map(q => 
        q.id === question.id 
          ? { ...q, candidate_options: (q.candidate_options || []).filter(o => o.id !== optionId) }
          : q
      ));
      setEditingOption(null);
      triggerSuccess('Option deleted successfully!');
    } catch (error) {
      console.error('Error deleting option:', error);
      alert('Failed to delete option');
    }
  };

  const handleAddAttachment = async (questionId: string, file: File) => {
    try {
      const url = await api.uploadFile(file, 'attachments');
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const newAttachments = [...(question.attachments || []), { name: file.name, url }];
      await api.updateBallotQuestion(questionId, { attachments: newAttachments });
      
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, attachments: newAttachments } : q
      ));
      triggerSuccess('Attachment added!');
    } catch (error) {
      console.error('Error adding attachment:', error);
      alert('Failed to upload attachment');
    }
  };

  const handleDeleteAttachment = async (questionId: string, attachmentUrl: string) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const newAttachments = (question.attachments || []).filter((a: any) => a.url !== attachmentUrl);
      await api.updateBallotQuestion(questionId, { attachments: newAttachments });
      
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, attachments: newAttachments } : q
      ));
      triggerSuccess('Attachment removed!');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Failed to remove attachment');
    }
  };

  const triggerSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  if (loading) {
    return (
      <ElectionSidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading ballot...</div>
        </div>
      </ElectionSidebarLayout>
    );
  }

  return (
    <ElectionSidebarLayout>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FiList className="text-gray-400 text-xl" />
            <h1 className="text-xl font-bold text-[#333]">Ballot</h1>
            {election && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                election.status === 'completed' ? 'bg-[#00AEEF] text-white' :
                election.status === 'active' ? 'bg-[#00D02D] text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {election.status}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-400 text-[#00AEEF] rounded hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <FiUploadCloud className="text-lg" />
              Import
            </button>
            <button 
              onClick={() => setShowAddQuestionTypeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00D02D] text-white rounded hover:bg-[#00B026] transition-colors text-sm font-bold shadow-sm"
            >
              <FiPlus className="text-lg" />
              Add Question
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors bg-white shadow-sm"
              >
                <FiMoreVertical className="text-gray-600" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10 py-1">
                  <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Actions</p>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiDownload className="text-gray-400" />
                    Export Ballot
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-500">
              Your ballot is empty. Click "Add Question" to get started.
            </div>
          ) : (
            questions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question} 
                electionStatus={election?.status}
                onEdit={() => {
                  if (question.type === 'ranked_choice') {
                    window.location.href = `/election/${electionId}/ballot/ranked-choice/${question.id}`;
                  } else {
                    setEditingQuestion(question);
                  }
                }}
                onBulkAdd={() => setBulkAddQuestion(question)}
                onAddOption={() => setAddingOptionType(question)}
                onEditOption={(option) => setEditingOption({ question, option })}
                onViewOption={(option) => setViewingOption({ question, option })}
                onDelete={() => handleDeleteQuestion(question.id)}
                onAddAttachment={(file) => handleAddAttachment(question.id, file)}
                onDeleteAttachment={(url) => handleDeleteAttachment(question.id, url)}
              />
            ))
          )}
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed bottom-6 left-6 bg-[#00D02D] text-white px-6 py-4 rounded shadow-lg flex items-center gap-3 z-[100] animate-fade-in-up">
            <FiCheckCircle className="text-2xl" />
            <span className="text-xl font-bold italic">{successMessage}</span>
          </div>
        )}

        {editingQuestion && (
          <EditBallotModal
            isOpen={!!editingQuestion}
            onClose={() => setEditingQuestion(null)}
            question={editingQuestion}
            onSave={handleSaveQuestion}
            onDelete={handleDeleteQuestion}
          />
        )}

        {bulkAddQuestion && (
          <BulkAddModal
            isOpen={!!bulkAddQuestion}
            onClose={() => setBulkAddQuestion(null)}
            questionTitle={bulkAddQuestion.title}
            onSave={handleBulkAddOptions}
          />
        )}

        {addingOptionType && (
          <AddOptionTypeModal
            isOpen={!!addingOptionType}
            onClose={() => setAddingOptionType(null)}
            questionTitle={addingOptionType.title}
            onSelectType={handleAddOption}
          />
        )}

        {editingOption && (
          <EditOptionModal
            isOpen={!!editingOption}
            onClose={() => setEditingOption(null)}
            questionTitle={editingOption.question.title}
            option={editingOption.option}
            onSave={handleSaveOption}
            onDelete={handleDeleteOption}
          />
        )}

        <ImportBallotModal 
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={async (type, data) => {
            if (!electionId) return;

            try {
              if (type === 'questions') {
                const questionsToInsert = data.map((q, idx) => ({
                    ...q,
                    election_id: electionId,
                    order_index: questions.length + idx
                }));
                await api.bulkCreateBallotQuestions(questionsToInsert);
              } else {
                // Find question IDs by title
                const optionsToInsert = data.map(opt => {
                    const question = questions.find(q => q.title.toLowerCase() === opt.question_title.toLowerCase());
                    if (!question) {
                        console.warn(`No question found matching title: ${opt.question_title}`);
                        return null;
                    }
                    const { question_title, ...rest } = opt;
                    return {
                        ...rest,
                        ballot_question_id: question.id
                    };
                }).filter(Boolean);

                if (optionsToInsert.length > 0) {
                    await api.bulkCreateCandidateOptions(optionsToInsert);
                } else {
                    alert('No matching questions found for the options in the CSV.');
                }
              }
              await fetchData(electionId);
              triggerSuccess('Import completed successfully!');
            } catch (error) {
              console.error('Import processing error:', error);
              throw error;
            }
          }}
        />

        {viewingOption && (
          <OptionDetailsModal
            isOpen={!!viewingOption}
            onClose={() => setViewingOption(null)}
            questionTitle={viewingOption.question.title}
            option={viewingOption.option}
          />
        )}

        <AddQuestionTypeModal
          isOpen={showAddQuestionTypeModal}
          onClose={() => setShowAddQuestionTypeModal(false)}
          onSelectType={handleAddQuestion}
        />
      </div>
    </ElectionSidebarLayout>
  );
};

interface QuestionCardProps {
  question: BallotQuestion;
  electionStatus?: string;
  onEdit: () => void;
  onBulkAdd: () => void;
  onAddOption: () => void;
  onEditOption: (option: CandidateOption) => void;
  onViewOption: (option: CandidateOption) => void;
  onDelete: () => void;
  onAddAttachment: (file: File) => void;
  onDeleteAttachment: (url: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  electionStatus,
  onEdit, 
  onBulkAdd, 
  onAddOption,
  onEditOption,
  onViewOption,
  onDelete,
  onAddAttachment,
  onDeleteAttachment
}) => {
  const [activeTab, setActiveTab] = useState<'options' | 'details' | 'attachments'>('options');
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [openOptionMenuId, setOpenOptionMenuId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const options = question.candidate_options || [];
  const attachments = (question.attachments as any[]) || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 3 * 1024 * 1024) {
      alert('Max file size: 3MB');
      return;
    }

    setUploading(true);
    try {
      await onAddAttachment(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isCompleted = electionStatus === 'completed';

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#333] mb-1">{question.title}</h3>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-tight">
              {question.type === 'multiple_choice' ? 'Multiple Choice' : question.type === 'ranked_choice' ? 'Ranked Choice' : 'Yes/No'}
            </p>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowCardMenu(!showCardMenu)}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400"
            >
              <FiMoreVertical />
            </button>
            {showCardMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-10 py-1 overflow-hidden">
                <button 
                  onClick={() => {
                    onEdit();
                    setShowCardMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiEdit className="text-gray-400" />
                  Edit
                </button>
                <button 
                  onClick={() => {
                    onBulkAdd();
                    setShowCardMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiUsers className="text-[#333]" />
                  Bulk Add Options
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => {
                    onDelete();
                    setShowCardMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiTrash2 className="text-gray-400" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Description</h4>
          <div className="bg-[#F8FAFC] border border-gray-100 rounded p-4 text-[15px] text-gray-600 leading-relaxed rich-text-content">
            {question.description ? (
              <div dangerouslySetInnerHTML={{ __html: question.description }} />
            ) : (
              <span className="italic text-gray-400">No description provided for this question.</span>
            )}
          </div>
        </div>

        {/* Rules Section */}
        <div className="mb-6">
          <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Rules</h4>
          <div className="border border-gray-100 rounded overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              <div className="px-4 py-3 text-sm text-gray-600">
                Voters are required to select a <span className="font-bold">minimum of {question.min_selections}</span> option(s)
              </div>
              <div className="px-4 py-3 text-sm text-gray-600">
                {question.max_selections === 1 ? (
                  <>Voters can select <span className="font-bold">only 1</span> option</>
                ) : (
                  <>Voters can select a <span className="font-bold">maximum of {question.max_selections}</span> options</>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Options Selection Tabs (Only show edit tools if not completed) */}
        {!isCompleted && (
          <div className="flex border-b border-gray-200 mb-6 bg-gray-50/50 p-1 rounded-t">
            <button
              onClick={() => setActiveTab('options')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors rounded ${
                activeTab === 'options'
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiList className="text-gray-400" />
              Options ({options.length})
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors rounded ${
                activeTab === 'attachments'
                  ? 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiPaperclip className="text-gray-400" />
              Attachments ({attachments.length})
            </button>
          </div>
        )}

        {/* Options Content */}
        <div className="space-y-4">
          <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Options</h4>
          {options.length === 0 ? (
            <div className="bg-[#E6F7FF] border border-[#BBE7FF] p-4 text-[15px] text-[#00AEEF] text-center rounded">
              Click the "Add Option" button below to add an option to this question
            </div>
          ) : (
            <div className="border border-gray-100 rounded divide-y divide-gray-100">
              {options.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {option.photo_url ? (
                        <img src={option.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-300">
                          {option.type === 'write-in' ? <FiEdit3 className="text-xl" /> : <FiUsers className="text-xl" />}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-800 font-bold block">{option.title}</span>
                      <span className="text-[11px] text-gray-400 uppercase font-black">{option.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onViewOption(option)}
                      className="px-3 py-1.5 border border-[#00AEEF] text-[#00AEEF] rounded text-[11px] font-black uppercase hover:bg-blue-50 transition-colors mr-2"
                    >
                      Details
                    </button>
                    
                    {!isCompleted && (
                      <div className="relative">
                        <button 
                          onClick={() => setOpenOptionMenuId(openOptionMenuId === option.id ? null : option.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 transition-all rounded bg-gray-100/50"
                        >
                          <FiMoreVertical />
                        </button>
                        
                        {openOptionMenuId === option.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-xl z-[50] py-1">
                            <button 
                              onClick={() => {
                                onEditOption(option);
                                setOpenOptionMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <FiEdit className="text-gray-400" />
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                onEditOption(option); // Edit for deletion
                                setOpenOptionMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <FiTrash2 className="text-gray-400" />
                              Manage
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!isCompleted && (
            <button 
              onClick={onAddOption}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#00D02D] text-white rounded hover:bg-[#00B026] transition-colors text-sm font-bold shadow-sm"
            >
              <FiPlus className="text-lg" />
              Add Option
            </button>
          )}

          {/* Attachments (Show in flat list if completed) */}
          {activeTab === 'attachments' && !isCompleted && (
             <div className="mt-8 pt-8 border-t border-gray-100 space-y-6">
                <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Attachments ({attachments.length}/3)</h4>
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file: any, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded group">
                        <div className="flex items-center gap-3">
                          <FiPaperclip className="text-[#00AEEF]" />
                          <span className="text-sm font-bold text-gray-700">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={file.url} target="_blank" rel="noreferrer" className="text-xs text-[#00AEEF] font-bold hover:underline">View</a>
                          <button 
                            onClick={() => onDeleteAttachment(file.url)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {attachments.length < 3 && (
                  <div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00AEEF] text-white rounded hover:bg-[#009CD6] transition-colors text-sm font-bold shadow-sm disabled:opacity-50"
                    >
                      {uploading ? <FiLoader className="animate-spin" /> : <FiPaperclip className="text-lg" />}
                      {uploading ? 'Uploading...' : 'Select File....'}
                    </button>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.gif,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt"
                    />
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
