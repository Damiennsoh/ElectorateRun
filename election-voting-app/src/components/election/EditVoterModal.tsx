import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiInfo, FiTrash2 } from 'react-icons/fi';
import { Voter } from '../../types';
import { api } from '../../utils/api';

interface EditVoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  voter: Voter | null;
  onSave: (voterData: any) => Promise<void>;
  electionStatus: string;
}

export const EditVoterModal: React.FC<EditVoterModalProps> = ({ isOpen, onClose, voter, onSave, electionStatus }) => {
  const [voterData, setVoterData] = useState({
    name: '',
    voter_identifier: '',
    voter_key: '',
    email: '',
    vote_weight: 1
  });
  const [activity, setActivity] = useState<any[]>([]);


  useEffect(() => {
    if (voter && isOpen) {
      setVoterData({
        name: voter.name || '',
        voter_identifier: voter.voter_identifier || '',
        voter_key: voter.voter_key || '',
        email: voter.email || '',
        vote_weight: voter.vote_weight || 1
      });
      fetchActivity(voter.id);
    }
  }, [voter, isOpen]);

  const fetchActivity = async (id: string) => {
    try {
      const data = await api.getVoterActivity(id);
      setActivity(data);
    } catch (err) {
      console.error("Error fetching activity:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voter && !isReadOnly) {
      onSave({ ...voterData, id: voter.id });
    }
  };

  const isReadOnly = (electionStatus === 'active' || electionStatus === 'completed') && voter?.has_voted;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-[#00AEEF] px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-2xl font-medium">Edit Voter</h2>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors">
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left Side: Form */}
          <div className="flex-1 p-8 border-r border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-gray-700">Name</label>
                <div className="relative">
                    <input
                        type="text"
                        value={voterData.name}
                        onChange={(e) => setVoterData({ ...voterData, name: e.target.value })}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 bg-[#F9FBFC] border border-gray-200 rounded outline-none text-[15px] ${isReadOnly ? 'text-gray-400' : 'text-gray-700 focus:border-[#00AEEF]'}`}
                    />
                    {isReadOnly && <div className="absolute right-3 top-2.5 text-gray-300">•••</div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1">Voter ID <FiInfo className="text-gray-400 text-[10px]" /></label>
                    <input
                        type="text"
                        value={voterData.voter_identifier}
                        readOnly
                        className="w-full px-3 py-2 bg-[#F9FBFC] border border-gray-200 rounded outline-none text-[15px] text-gray-400"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1">Voter Key <FiInfo className="text-gray-400 text-[10px]" /></label>
                    <input
                        type="text"
                        value={voterData.voter_key}
                        readOnly
                        className="w-full px-3 py-2 bg-[#F9FBFC] border border-gray-200 rounded outline-none text-[15px] text-gray-400"
                    />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1">Email Address <FiInfo className="text-gray-400 text-[10px]" /></label>
                <input
                  type="email"
                  value={voterData.email}
                  onChange={(e) => setVoterData({ ...voterData, email: e.target.value })}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 bg-[#F9FBFC] border border-gray-200 rounded outline-none text-[15px] ${isReadOnly ? 'text-gray-400' : 'text-gray-700 focus:border-[#00AEEF]'}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1">Vote Weight <FiInfo className="text-gray-400 text-[10px]" /></label>
                <input
                  type="number"
                  min="1"
                  value={voterData.vote_weight}
                  disabled={isReadOnly}
                  onChange={(e) => setVoterData({ ...voterData, vote_weight: parseInt(e.target.value) || 1 })}
                  className={`w-full px-3 py-2 bg-[#F9FBFC] border border-gray-200 rounded outline-none text-[15px] ${isReadOnly ? 'text-gray-400' : 'text-gray-700 focus:border-[#00AEEF]'}`}
                />
                <div className="mt-2 bg-[#E6F7FF] border border-[#BAE7FF] p-3 rounded flex items-center gap-2">
                    <span className="text-[#00AEEF] text-[13px]">Weighted voting is disabled in the <span className="underline cursor-pointer">election settings</span></span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <button 
                  type="submit" 
                  disabled={isReadOnly}
                  className="px-6 py-2 bg-[#00D02D] text-white rounded font-bold text-[14px] hover:bg-[#00B026] shadow-sm transition-all disabled:opacity-50"
                >
                  Save
                </button>
                <button type="button" onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded font-bold text-[14px] hover:bg-gray-50 shadow-sm transition-all">
                  Close
                </button>
                <div className="flex-1" />
                <button type="button" className="px-6 py-2 bg-[#ff0000] text-white rounded font-bold text-[14px] hover:bg-red-700 shadow-sm transition-all flex items-center gap-2">
                  <FiTrash2 /> Delete
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Activity */}
          <div className="w-full md:w-[400px] bg-[#F9FBFC] p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Voter Activity</h3>
            
            {voter?.has_voted && (
                <div className="bg-[#00D02D] text-white p-3 rounded mb-6 flex items-center gap-2 shadow-sm">
                    <FiCheckCircle className="text-lg" />
                    <span className="font-bold text-sm uppercase tracking-wide">This voter has voted</span>
                </div>
            )}

            <div className="space-y-0.5">
                <div className="grid grid-cols-2 px-2 py-2 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                    <span>Text</span>
                    <span>Date</span>
                </div>
                {activity.map((item, idx) => (
                    <div key={idx} className={`grid grid-cols-2 px-2 py-3 text-[13px] border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <span className="text-gray-700">{item.text}</span>
                        <span className="text-gray-500">{new Date(item.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                    </div>
                ))}
                {activity.length === 0 && (
                    <div className="p-4 text-center text-gray-400 text-sm italic">No activity recorded.</div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
