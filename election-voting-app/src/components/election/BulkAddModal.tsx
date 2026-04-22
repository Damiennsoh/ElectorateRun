import React, { useState } from 'react';
import { Modal } from '../common/Modal';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionTitle: string;
  onSave: (options: string[]) => void;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({
  isOpen,
  onClose,
  questionTitle,
  onSave,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const options = text.split('\n').map(opt => opt.trim()).filter(opt => opt !== '');
    onSave(options);
    setText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Bulk Options"
      maxWidth="max-w-xl"
      footer={
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="bg-[#00D02D] text-white px-6 py-2 rounded font-bold hover:bg-[#00B026] transition-colors"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded font-bold hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Question</label>
          <div className="text-gray-800 text-[15px]">{questionTitle}</div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Options <span className="font-normal text-gray-500">List one option per line (Max. of 30 options)</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all resize-none"
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
      </div>
    </Modal>
  );
};
