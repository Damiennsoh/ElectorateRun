import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle, FiCheckCircle, FiSave, FiTrash2 } from 'react-icons/fi';
import { ElectionSidebarLayout } from '../../components/layout/ElectionSidebarLayout';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { Toggle } from '../../components/common/Toggle';

export const RankedChoiceQuestion: React.FC = () => {
  const { id, questionId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('New Ranked Choice Question');
  const [description, setDescription] = useState('');
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/ballot');
    }, 2000);
  };

  return (
    <ElectionSidebarLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/ballot')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#333]">Edit Ballot Question</h1>
            <p className="text-sm text-gray-500">Ranked Choice (IRV)</p>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <div className="fixed bottom-6 left-6 bg-[#00D02D] text-white px-6 py-4 rounded shadow-lg flex items-center gap-3 z-[100] animate-fade-in-up">
            <FiCheckCircle className="text-2xl" />
            <span className="text-xl font-bold italic">Question added to ballot!</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Type Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Type</label>
              <div className="text-gray-600 text-[15px] mb-4">
                Ranked Choice (IRV) - Voters will rank options by preference
              </div>
              
              <div className="bg-orange-50 border-l-4 border-orange-400 p-5 flex items-start gap-4">
                <FiAlertTriangle className="text-orange-500 text-2xl mt-0.5" />
                <p className="text-orange-800 text-[15px] leading-relaxed">
                  Ranked Choice (IRV) question results will determine a <span className="font-bold">single winner</span>. If more than one winner is required, we recommend using the multiple choice question type. <a href="#" className="text-orange-600 font-bold hover:underline">Learn More »</a>
                </p>
              </div>
            </div>

            {/* Title Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all text-lg"
                placeholder="New Ranked Choice Question"
              />
            </div>

            {/* Description Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter question description..."
                />
              </div>
            </div>

            {/* Randomize Options Section */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Randomize options?</h4>
                  <p className="text-gray-500">Randomly sorts the list of options on the ballot for each voter</p>
                </div>
                <Toggle
                  enabled={randomizeOptions}
                  onChange={setRandomizeOptions}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-[#00D02D] text-white px-10 py-3 rounded-md font-bold hover:bg-[#00B026] transition-colors shadow-sm flex items-center gap-2"
            >
              <FiSave className="text-lg" />
              Save
            </button>
            <button
              className="bg-red-600 text-white px-6 py-3 rounded-md font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiTrash2 className="text-lg" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </ElectionSidebarLayout>
  );
};
