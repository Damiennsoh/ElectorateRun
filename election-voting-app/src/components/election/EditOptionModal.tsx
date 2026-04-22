import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { RichTextEditor } from '../common/RichTextEditor';
import { FiCheckCircle, FiTrash2, FiCamera, FiLoader } from 'react-icons/fi';
import { CandidateOption } from '../../types';
import { api } from '../../utils/api';

interface EditOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionTitle: string;
  option?: CandidateOption;
  onSave: (updatedOption: CandidateOption) => void;
  onDelete?: (id: string) => void;
}

export const EditOptionModal: React.FC<EditOptionModalProps> = ({
  isOpen,
  onClose,
  questionTitle,
  option,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(option?.title || 'New Option');
  const [shortDescription, setShortDescription] = useState(option?.short_description || '');
  const [description, setDescription] = useState(option?.description || '');
  const [photoUrl, setPhotoUrl] = useState(option?.photo_url || '');
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit.');
      return;
    }

    setUploading(true);
    try {
      const url = await api.uploadFile(file, 'candidates');
      setPhotoUrl(url);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSave({
      ...option,
      id: option?.id || '',
      ballot_question_id: option?.ballot_question_id || '',
      title,
      short_description: shortDescription,
      description,
      photo_url: photoUrl,
      type: option?.type || 'standard',
      order_index: option?.order_index || 0,
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1000);
  };

  const handleDelete = () => {
    if (option?.id && onDelete) {
      if (window.confirm('Are you sure you want to delete this option?')) {
        onDelete(option.id);
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Option"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 relative">
        {/* Success Alert */}
        {showSuccess && (
          <div className="absolute -top-12 left-0 right-0 bg-[#00D02D] text-white px-6 py-4 rounded shadow-lg flex items-center gap-3 z-50 animate-fade-in-down">
            <FiCheckCircle className="text-2xl" />
            <span className="text-xl font-bold italic">Option Saved!</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className="bg-[#00AEEF] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
            <FiCheckCircle /> Standard Option
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Question Title */}
          <div className="md:col-span-3">
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Question</label>
            <div className="text-gray-800 text-[17px] font-medium">{questionTitle}</div>
          </div>

          {/* Title and Photo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all text-gray-800 bg-[#F8FAFC]"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Photo</label>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Candidate" className="w-full h-full object-cover" />
                ) : uploading ? (
                  <FiLoader className="text-gray-400 animate-spin text-xl" />
                ) : (
                  <FiCamera className="text-gray-400 text-xl" />
                )}
              </div>
              <div className="flex-1">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors shadow-sm uppercase"
                >
                  {uploading ? 'Uploading...' : 'Choose File'}
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                  accept="image/*"
                />
                <p className="text-[10px] text-gray-400 mt-1">2MB Max. JPG, PNG, GIF</p>
              </div>
            </div>
          </div>

          {/* Short Description */}
          <div className="md:col-span-3">
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Short Description</label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={200}
              className="w-full h-24 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all resize-none bg-[#F8FAFC]"
              placeholder="A brief summary of the option/candidate..."
            />
            <div className="text-right text-[11px] text-gray-400 mt-1 italic">
              Max Length: 200 characters. ({200 - shortDescription.length} remaining)
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-3">
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Description</label>
            <div className="border border-gray-300 rounded overflow-hidden">
              <RichTextEditor
                value={description}
                onChange={setDescription}
                maxLength={5000}
              />
            </div>
            <div className="text-left text-[11px] text-gray-400 mt-1 italic">
              Max Length: 5,000 characters. ({5000 - description.length} remaining)
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="bg-[#00D02D] text-white px-8 py-2 rounded font-bold hover:bg-[#00B026] transition-colors shadow-sm disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {option?.id && (
            <button
              onClick={handleDelete}
              className="bg-[#FF0000] text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiTrash2 /> Delete
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
