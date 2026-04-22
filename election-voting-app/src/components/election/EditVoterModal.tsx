import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Voter } from '../../types';

interface EditVoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  voter: Voter | null;
  onSave: (voterData: any) => Promise<void>;
}

export const EditVoterModal: React.FC<EditVoterModalProps> = ({ isOpen, onClose, voter, onSave }) => {
  const [voterData, setVoterData] = useState({
    name: '',
    voter_identifier: '',
    email: '',
    vote_weight: 1
  });

  useEffect(() => {
    if (voter) {
      setVoterData({
        name: voter.name || '',
        voter_identifier: voter.voter_identifier || '',
        email: voter.email || '',
        vote_weight: voter.vote_weight || 1
      });
    }
  }, [voter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voter) {
      onSave({ ...voterData, id: voter.id });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Voter">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            required
            value={voterData.name}
            onChange={(e) => setVoterData({ ...voterData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Voter ID</label>
          <input
            type="text"
            required
            value={voterData.voter_identifier}
            onChange={(e) => setVoterData({ ...voterData, voter_identifier: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-500 bg-gray-50"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            value={voterData.email}
            onChange={(e) => setVoterData({ ...voterData, email: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vote Weight</label>
          <input
            type="number"
            min="1"
            value={voterData.vote_weight}
            onChange={(e) => setVoterData({ ...voterData, vote_weight: parseInt(e.target.value) || 1 })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-[#00D02D] text-white rounded font-medium">Save Changes</button>
        </div>
      </form>
    </Modal>
  );
};
