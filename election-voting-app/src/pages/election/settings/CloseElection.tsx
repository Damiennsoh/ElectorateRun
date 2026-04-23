import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiFlag } from 'react-icons/fi';
import { api } from '../../../utils/api';

export const CloseElection: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);

  const handleClose = async () => {
    if (!id) return;
    
    const confirmed = window.confirm("Are you sure you want to close this election? This will end the election immediately.");
    if (!confirmed) return;

    setClosing(true);
    try {
      await api.updateElection(id, { status: 'completed' });
      // Trigger "Election Has Ended" email to creator
      await api.sendVoterInvitations(id, false, true);
      navigate(`/election/${id}/overview`);
    } catch (err) {
      console.error("Error closing election:", err);
      alert('Failed to close election.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="bg-white p-8">
      <div className="border border-[#FF6600]/30 rounded overflow-hidden shadow-sm">
        <div className="bg-[#FF6600] px-4 py-3 flex items-center gap-2">
          <FiFlag className="text-white text-lg" />
          <h3 className="text-[16px] font-bold text-white uppercase tracking-tight">Close Election</h3>
        </div>
        
        <div className="p-8 bg-white">
          <p className="text-[15px] text-[#333] mb-8 leading-relaxed">
            Closing this election will result in the election ending immediately. Voters that have voted or are in the process of voting will not be able to submit their ballot. <span className="text-[#00AEEF] cursor-pointer hover:underline">Learn More »</span>
          </p>
          
          <button
            onClick={handleClose}
            disabled={closing}
            className="px-6 py-2 bg-[#FF6600] text-white rounded font-bold text-[14px] hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50 uppercase tracking-wide"
          >
            {closing ? 'Closing...' : 'Close Election'}
          </button>
        </div>
      </div>
    </div>
  );
};
