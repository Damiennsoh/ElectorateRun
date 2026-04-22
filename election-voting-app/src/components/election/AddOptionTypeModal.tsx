import React from 'react';
import { Modal } from '../common/Modal';
import { FiCheckCircle, FiEdit3 } from 'react-icons/fi';

interface AddOptionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionTitle: string;
  onSelectType: (type: 'standard' | 'write-in') => void;
}

export const AddOptionTypeModal: React.FC<AddOptionTypeModalProps> = ({
  isOpen,
  onClose,
  questionTitle,
  onSelectType,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Option"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        <div className="text-center px-4">
          <p className="text-[19px] text-gray-800">
            What type of option do you want to add to the question <span className="font-bold">{questionTitle}</span>?
          </p>
        </div>

        <div className="space-y-3">
          {/* Standard Option */}
          <div className="border border-gray-200 rounded p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-2xl text-gray-800">
                <FiCheckCircle />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-[15px]">Standard Option</h4>
                <p className="text-sm text-gray-500">A Candidate, Measure, Yes/No, Approve/Disapprove, etc.</p>
              </div>
            </div>
            <button
              onClick={() => onSelectType('standard')}
              className="bg-[#00D02D] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-[#00B026] transition-colors"
            >
              Select
            </button>
          </div>

          {/* Write-In Option */}
          <div className="border border-gray-200 rounded p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-2xl text-gray-800">
                <FiEdit3 />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-[15px]">Write-In Option</h4>
                <p className="text-sm text-gray-500">Voters can type in a response to the question.</p>
              </div>
            </div>
            <button
              onClick={() => onSelectType('write-in')}
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
