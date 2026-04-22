import React from 'react';
import { Modal } from '../common/Modal';
import { FiCheckCircle, FiUser, FiX } from 'react-icons/fi';
import { CandidateOption } from '../../types';

interface OptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionTitle: string;
  option?: CandidateOption;
}

export const OptionDetailsModal: React.FC<OptionDetailsModalProps> = ({
  isOpen,
  onClose,
  questionTitle,
  option,
}) => {
  if (!option) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Option Details"
      maxWidth="max-w-4xl"
      headerClassName="bg-[#00AEEF] text-white"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-[#00D02D] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
            <FiCheckCircle /> Standard Option
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Question Title */}
          <div className="md:col-span-3">
            <label className="block text-sm font-bold text-gray-900 mb-1">Question</label>
            <div className="bg-[#F8FAFC] border border-gray-200 rounded px-4 py-2 text-gray-700 text-[17px]">
              {questionTitle}
            </div>
          </div>

          {/* Title and Photo */}
          <div className="md:col-span-2">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Title</label>
                <div className="bg-[#F8FAFC] border border-gray-200 rounded px-4 py-2 text-gray-700 text-[17px]">
                  {option.title}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Short Description</label>
                <div className="bg-[#F8FAFC] border border-gray-200 rounded px-4 py-2 text-gray-700 text-[17px] min-h-[100px]">
                  {option.short_description || <span className="text-gray-400 italic">No short description provided</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-900 mb-1">Photo</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm aspect-square flex items-center justify-center">
              {option.photo_url ? (
                <img src={option.photo_url} alt={option.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-200 flex flex-col items-center">
                  <FiUser className="text-6xl" />
                  <span className="text-xs uppercase font-bold mt-2">No photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-3">
            <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
            <div 
              className="bg-[#E6F7FF] border border-[#BBE7FF] rounded px-4 py-3 text-[#00AEEF] text-[15px] min-h-[50px] rich-text-content"
              dangerouslySetInnerHTML={{ __html: option.description || 'No description provided' }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
