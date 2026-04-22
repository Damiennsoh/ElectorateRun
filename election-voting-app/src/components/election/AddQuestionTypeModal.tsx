import React from 'react';
import { Modal } from '../common/Modal';
import { FiList, FiBarChart2 } from 'react-icons/fi';

interface AddQuestionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'multiple_choice' | 'ranked_choice') => void;
}

export const AddQuestionTypeModal: React.FC<AddQuestionTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Ballot Question"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        <div className="text-center px-4">
          <p className="text-[19px] text-gray-800">
            What type of question would you like to add to the ballot?
          </p>
        </div>

        <div className="space-y-3">
          {/* Multiple Choice */}
          <div className="border border-gray-200 rounded p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-2xl text-gray-800">
                <FiList />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-[15px]">Multiple Choice</h4>
                <p className="text-sm text-gray-500">Voters select one or more options from a list</p>
              </div>
            </div>
            <button
              onClick={() => onSelectType('multiple_choice')}
              className="bg-[#00D02D] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-[#00B026] transition-colors"
            >
              Select
            </button>
          </div>

          {/* Ranked Choice (IRV) */}
          <div className="border border-gray-200 rounded p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-2xl text-gray-800">
                <FiBarChart2 />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-[15px]">Ranked Choice (IRV)</h4>
                <p className="text-sm text-gray-500">Voters rank options by preference. Results will be determined using Instant Run-off Voting. <a href="#" className="text-[#00AEEF] hover:underline">Learn More</a></p>
              </div>
            </div>
            <button
              onClick={() => onSelectType('ranked_choice')}
              className="bg-[#00D02D] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-[#00B026] transition-colors"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
