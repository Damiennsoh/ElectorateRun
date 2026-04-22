import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { FiZap } from 'react-icons/fi';

interface AddVoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (voter: any) => void;
}

export const AddVoterModal: React.FC<AddVoterModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [voterIdentifier, setVoterIdentifier] = useState('');
  const [voterKey, setVoterKey] = useState('');
  const [email, setEmail] = useState('');

  const generateRandom = (setter: (val: string) => void) => {
    setter(Math.random().toString(36).substr(2, 8).toUpperCase());
  };

  const handleAdd = () => {
    onAdd({ 
      name, 
      voter_identifier: voterIdentifier, 
      voter_key: voterKey, 
      email 
    });
    // Clear form
    setName('');
    setVoterIdentifier('');
    setVoterKey('');
    setEmail('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Voter"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 py-2">
        {/* Name */}
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all"
            placeholder="Voter's Name"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Voter ID */}
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1 uppercase tracking-wide flex items-center gap-1">
              Voter ID <span className="text-gray-400">?</span>
            </label>
            <div className="flex">
              <input
                type="text"
                value={voterIdentifier}
                onChange={(e) => setVoterIdentifier(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all bg-gray-50"
                placeholder="Voter ID"
              />
              <button 
                onClick={() => generateRandom(setVoterIdentifier)}
                className="px-3 py-2 bg-blue-50 border border-l-0 border-gray-300 rounded-r text-[#00AEEF] hover:bg-blue-100 transition-colors"
                title="Generate Random"
              >
                <FiZap />
              </button>
            </div>
          </div>

          {/* Voter Key */}
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1 uppercase tracking-wide flex items-center gap-1">
              Voter Key <span className="text-gray-400">?</span>
            </label>
            <div className="flex">
              <input
                type="text"
                value={voterKey}
                onChange={(e) => setVoterKey(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all bg-gray-50"
                placeholder="Voter Key"
              />
              <button 
                onClick={() => generateRandom(setVoterKey)}
                className="px-3 py-2 bg-blue-50 border border-l-0 border-gray-300 rounded-r text-[#00AEEF] hover:bg-blue-100 transition-colors"
                title="Generate Random"
              >
                <FiZap />
              </button>
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1 uppercase tracking-wide flex items-center gap-1">
            Email Address <span className="text-gray-400">?</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all bg-gray-50"
            placeholder="Voter's Email Address"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1 uppercase tracking-wide flex items-center gap-1">
            Vote Weight <span className="text-gray-400">?</span>
          </label>
          <div className="bg-[#E6F7FF] border border-[#BBE7FF] p-3 text-[14px] text-[#00AEEF] rounded">
            Weighted voting is disabled in the <a href="#" className="underline">election settings</a>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={handleAdd}
            className="bg-[#00D02D] text-white px-6 py-2 rounded font-bold hover:bg-[#00B026] transition-colors"
          >
            Add Voter
          </button>
          <button
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded font-bold hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
