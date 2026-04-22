import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import { api } from '../../../utils/api';

export const DeleteElection: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this election? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.deleteElection(id);
      navigate('/dashboard');
    } catch (err) {
      console.error("Error deleting election:", err);
      alert('Failed to delete election.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white p-6">
      <div className="border border-gray-200 rounded overflow-hidden shadow-sm">
        <div className="bg-[#ff0000] px-4 py-3 flex items-center gap-2">
          <FiTrash2 className="text-white text-lg" />
          <h3 className="text-[16px] font-bold text-white">Delete Election</h3>
        </div>
        
        <div className="p-6 bg-white">
          <p className="text-[14px] text-[#333] mb-6 leading-relaxed">
            Are you sure you want to delete this election? This action is not reversible. Please contact support if you need to make a change to an election that has already launched.
          </p>
          
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-[#ff0000] text-white rounded font-bold text-[14px] hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Election'}
          </button>
        </div>
      </div>
    </div>
  );
};
