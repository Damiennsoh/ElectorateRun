import React, { useState } from 'react';
import { FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { RichTextEditor } from '../common/RichTextEditor';
import { Toggle } from '../common/Toggle';
import { BallotQuestion } from '../../types';

interface EditBallotModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: BallotQuestion;
  onSave: (updatedQuestion: BallotQuestion) => void;
  onDelete: (id: string) => void;
}

export const EditBallotModal: React.FC<EditBallotModalProps> = ({
  isOpen,
  onClose,
  question,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description);
  const [minSelections, setMinSelections] = useState(question.min_selections);
  const [maxSelections, setMaxSelections] = useState(question.max_selections);
  const [randomizeOptions, setRandomizeOptions] = useState(question.randomize_options);

  const handleSave = () => {
    onSave({
      ...question,
      title,
      description,
      min_selections: minSelections,
      max_selections: maxSelections,
      randomize_options: randomizeOptions,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Ballot Question"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => onDelete(question.id)}
            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <FiTrash2 /> Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#00D02D] text-white px-6 py-2 rounded font-bold hover:bg-[#00B026] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Type Section */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Type</label>
          <div className="text-gray-600 text-[15px] mb-4">
            {question.type === 'multiple_choice' ? 'Multiple Choice - Voters can select one or many options' : question.type === 'ranked_choice' ? 'Ranked Choice (IRV) - Voters will rank options by preference' : 'Yes/No Question'}
          </div>
          
          {question.type === 'ranked_choice' && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4 flex items-center gap-3">
              <FiAlertTriangle className="text-orange-500 text-xl" />
              <p className="text-orange-700 text-sm">
                Ranked Choice (IRV) question results will determine a <span className="font-bold">single winner</span>. If more than one winner is required, we recommend using the multiple choice question type. <a href="#" className="text-orange-500 hover:underline">Learn More</a>
              </p>
            </div>
          )}

          <div className="bg-[#F0F9FF] border-l-4 border-[#00AEEF] p-4 flex items-center gap-2 text-sm text-gray-700">
            <span>Voters can select a <span className="font-bold">maximum</span> of</span>
            <input
              type="number"
              value={maxSelections}
              onChange={(e) => setMaxSelections(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
            />
            <span>and a <span className="font-bold">minimum</span> of</span>
            <input
              type="number"
              value={minSelections}
              onChange={(e) => setMinSelections(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
            />
            <span>option(s)</span>
          </div>
        </div>

        {/* Title Section */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all"
            placeholder="New Multiple Choice Question"
          />
        </div>

        {/* Description Section */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
          <div className="border border-gray-300 rounded overflow-hidden">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Enter question description..."
            />
          </div>
        </div>

        {/* Randomize Options Section */}
        <div className="border border-gray-200 rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-800 text-[15px]">Randomize options?</h4>
              <p className="text-sm text-gray-500">Randomly sorts the list of options on the ballot for each voter</p>
            </div>
            <Toggle
              enabled={randomizeOptions}
              onChange={setRandomizeOptions}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
