import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiUsers, FiHelpCircle } from 'react-icons/fi';
import { Toggle } from '../../../components/common/Toggle';
import { api } from '../../../utils/api';

export const VotersSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [weightedVoting, setWeightedVoting] = useState(false);
  const [ballotReceipt, setBallotReceipt] = useState(false);
  const [submitConfirmation, setSubmitConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      if (!id) return;
      try {
        const election = await api.getElectionById(id);
        if (election && election.settings) {
          const settings = election.settings as any;
          setWeightedVoting(settings.weighted_voting || false);
          setBallotReceipt(settings.ballot_receipt || false);
          setSubmitConfirmation(settings.submit_confirmation || false);
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
        weighted_voting: weightedVoting,
        ballot_receipt: ballotReceipt,
        submit_confirmation: submitConfirmation,
      };

      await api.updateElection(id, { settings: newSettings });
      alert('Voters settings saved successfully!');
    } catch (err) {
      console.error("Error saving voters settings:", err);
      alert('Failed to save voters settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-[15px] font-bold text-[#333] flex items-center gap-2">
          <FiUsers className="text-gray-500" />
          Voters Settings
        </h3>
      </div>
      
      <div className="p-6 space-y-0">
        <div className="py-5 border-b border-gray-200 first:pt-0">
          <Toggle
            label={
              <span className="flex items-center gap-1 font-bold text-[13px] text-gray-800">
                Weighted Voting <FiHelpCircle className="text-[#00AEEF] w-3 h-3" />
              </span>
            }
            description="Enabling this option will allow you to assign weights to each voter's vote."
            enabled={weightedVoting}
            onChange={setWeightedVoting}
          />
        </div>

        <div className="py-5 border-b border-gray-200">
          <Toggle
            label={
              <span className="flex items-center gap-1 font-bold text-[13px] text-gray-800">
                Ballot Receipt <FiHelpCircle className="text-[#00AEEF] w-3 h-3" />
              </span>
            }
            description="Enabling this option will allow voters to download a receipt that confirms their ballot has been received."
            enabled={ballotReceipt}
            onChange={setBallotReceipt}
          />
        </div>

        <div className="py-5">
          <Toggle
            label={
              <span className="flex items-center gap-1 font-bold text-[13px] text-gray-800">
                Submit Ballot Confirmation <FiHelpCircle className="text-[#00AEEF] w-3 h-3" />
              </span>
            }
            description="When this option is enabled, voters will receive an alert when they submit their ballot that allows them to continue or cancel and make additional changes."
            enabled={submitConfirmation}
            onChange={setSubmitConfirmation}
          />
        </div>

        <div className="pt-8 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2 bg-[#00D02D] text-white rounded font-bold text-[14px] hover:bg-[#00B026] transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};