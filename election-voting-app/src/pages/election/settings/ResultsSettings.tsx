import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiPieChart, FiInfo } from 'react-icons/fi';
import { api } from '../../../utils/api';

export const ResultsSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hideResults, setHideResults] = useState(false);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      if (!id) return;
      try {
        const election = await api.getElectionById(id);
        if (election && election.settings) {
          const settings = (election.settings as any) || {};
          setHideResults(settings.hide_results || false);
          setAllowDuplicate(settings.allow_duplicate || false);
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
      const election = await api.getElectionById(id);
      const currentSettings = (election.settings as any) || {};
      
      const newSettings = {
        ...currentSettings,
        hide_results: hideResults,
        allow_duplicate: allowDuplicate,
      };

      await api.updateElection(id, { settings: newSettings });
      alert('Results settings saved successfully!');
    } catch (err) {
      console.error("Error saving results settings:", err);
      alert('Failed to save results settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-[15px] font-bold text-[#333] flex items-center gap-2 uppercase tracking-wider">
          <FiPieChart className="text-gray-500" />
          Results Settings
        </h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        <div className="p-8 flex items-start justify-between bg-white hover:bg-gray-50/50 transition-colors">
          <div className="pr-12">
            <label className="block text-[14px] font-bold text-gray-800 mb-1 uppercase tracking-wide">
              Hide Results During Election
            </label>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-2xl">
              Enabling this option will hide the election results from the election administrator until the election has ended. Voters will not be able to view election results regardless of this setting. <span className="text-red-500 font-medium">This setting cannot be changed after your election launches.</span>
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input type="checkbox" className="sr-only peer" checked={hideResults} onChange={(e) => setHideResults(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D02D]"></div>
          </label>
        </div>

        <div className="p-8 flex items-start justify-between bg-white hover:bg-gray-50/50 transition-colors">
          <div className="pr-12">
            <label className="block text-[14px] font-bold text-gray-800 mb-1 uppercase tracking-wide">
              Allow Duplicate Write-In Values
            </label>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-2xl">
              Enabling this option will allow voters to provide the same values for all write-in options on a given ballot question.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input type="checkbox" className="sr-only peer" checked={allowDuplicate} onChange={(e) => setAllowDuplicate(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D02D]"></div>
          </label>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-3 bg-[#00D02D] text-white rounded font-bold text-[14px] hover:bg-[#00B026] transition-colors shadow-sm disabled:opacity-50 uppercase tracking-widest"
          >
            {saving ? 'Saving...' : 'Save Results Settings'}
          </button>
          
          <div className="flex items-center gap-2 text-[12px] text-gray-400 italic">
            <FiInfo />
            Changes take effect immediately.
          </div>
        </div>
      </div>
    </div>
  );
};
