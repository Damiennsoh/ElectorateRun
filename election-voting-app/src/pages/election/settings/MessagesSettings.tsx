import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiMessageSquare, FiHelpCircle } from 'react-icons/fi';
import { api } from '../../../utils/api';

export const MessagesSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loginInstructions, setLoginInstructions] = useState('');
  const [voteConfirmation, setVoteConfirmation] = useState('');
  const [afterElection, setAfterElection] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      if (!id) return;
      try {
        const election = await api.getElectionById(id);
        if (election && election.settings) {
          const settings = (election.settings as any) || {};
          setLoginInstructions(settings.login_instructions || '');
          setVoteConfirmation(settings.vote_confirmation || 'Thank you for voting in this election!');
          setAfterElection(settings.after_election || 'Voting for this election has closed! Please contact your election administrator if you have any questions.');
        }
      } catch (err) {
        console.error("Error fetching election:", err);
      }
    };
    fetchElection();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      // First get current settings to merge
      const election = await api.getElectionById(id);
      const currentSettings = (election.settings as any) || {};
      
      const newSettings = {
        ...currentSettings,
        login_instructions: loginInstructions,
        vote_confirmation: voteConfirmation,
        after_election: afterElection,
      };

      await api.updateElection(id, { settings: newSettings });
      alert('Messages saved successfully!');
    } catch (err) {
      console.error("Error saving messages:", err);
      alert('Failed to save messages.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
        <h3 className="text-[14px] font-bold text-[#333] flex items-center gap-2">
          <FiMessageSquare className="text-gray-500" />
          Election Messages
        </h3>
      </div>
      
      <div className="p-8 space-y-10">
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1 flex items-center gap-1 uppercase tracking-wide">
            Login Instructions <FiHelpCircle className="text-[#00AEEF] w-3 h-3" />
          </label>
          <p className="text-[13px] text-gray-500 mb-3 italic">This text will appear on the election login page.</p>
          <textarea
            value={loginInstructions}
            onChange={(e) => setLoginInstructions(e.target.value)}
            placeholder="e.g. Please enter your Student ID to vote..."
            rows={3}
            className="w-full px-4 py-3 text-[14px] text-gray-700 border border-gray-300 rounded bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all resize-y"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1 flex items-center gap-1 uppercase tracking-wide">
            Vote Confirmation <FiHelpCircle className="text-[#00AEEF] w-3 h-3" />
          </label>
          <p className="text-[13px] text-gray-500 mb-3 italic">Text voters see after successfully submitting their ballot.</p>
          <textarea
            value={voteConfirmation}
            onChange={(e) => setVoteConfirmation(e.target.value)}
            placeholder="Thank you for voting in this election!"
            rows={3}
            className="w-full px-4 py-3 text-[14px] text-gray-700 border border-gray-300 rounded bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all resize-y"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1 flex items-center gap-1 uppercase tracking-wide">
            After Election <FiHelpCircle className="text-[#00AEEF] w-3 h-3" />
          </label>
          <p className="text-[13px] text-gray-500 mb-3 italic">Text voters see when visiting the election after it has ended.</p>
          <textarea
            value={afterElection}
            onChange={(e) => setAfterElection(e.target.value)}
            placeholder="Voting for this election has closed!"
            rows={3}
            className="w-full px-4 py-3 text-[14px] text-gray-700 border border-gray-300 rounded bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all resize-y"
          />
        </div>

        <div className="pt-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-3 bg-[#00D02D] text-white rounded font-bold text-[14px] hover:bg-[#00B026] transition-colors shadow-sm disabled:opacity-50 uppercase tracking-widest"
          >
            {saving ? 'Saving...' : 'Save All Messages'}
          </button>
        </div>
      </div>
    </div>
  );
};