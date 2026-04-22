import React, { useState, useEffect } from 'react';
import { FiBriefcase } from 'react-icons/fi';
import { api } from '../../../utils/api';
import { supabase } from '../../../utils/supabase';

export const OrganizationSettings: React.FC = () => {
  const [orgName, setOrgName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [showInSearch, setShowInSearch] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrgData();
  }, []);

  const fetchOrgData = async () => {
    try {
      const data = await api.getOrganization();
      if (data) {
        setOrgId(data.id);
        setOrgName(data.name || '');
        setSubdomain(data.subdomain || '');
        setCity(data.city || '');
        setRegion(data.state_region || '');
        setShowInSearch(data.show_in_search || false);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateOrganization({
        id: orgId || undefined,
        name: orgName,
        subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        city,
        state_region: region,
        show_in_search: showInSearch
      });
      alert('Organization settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving organization:', error);
      alert(error.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500 font-medium">Loading organization settings...</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-2">
        <FiBriefcase /> Organization Settings
      </h2>

      <div className="space-y-8 max-w-4xl">
        <div>
          <label className="block text-[13px] font-bold text-[#333] mb-1">
            Organization Name
          </label>
          <p className="text-[11px] text-gray-500 mb-2 leading-tight">
            The organization name will be displayed to voters when logging in and voting in your elections.
          </p>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g. Maharishi Markandeshwar University"
            className="w-full px-3 py-2 bg-[#F9F9F9] border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none transition-all text-gray-800"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#333] mb-1">
            Subdomain
          </label>
          <p className="text-[11px] text-gray-500 mb-2 leading-tight">
            The organization's subdomain acts as a landing page that lists all active elections. For example: <span className="text-[#00AEEF]">https://{subdomain || 'orgname'}.electoraterun.com</span>
          </p>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-[#E8F0FE] border border-gray-300 border-r-0 rounded-l text-gray-600 text-sm">https://</span>
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="mmuleadership"
              className="flex-1 px-3 py-2 bg-[#F9F9F9] border border-gray-300 outline-none focus:ring-1 focus:ring-blue-400 text-gray-800 text-sm"
            />
            <span className="px-3 py-2 bg-[#E8F0FE] border border-gray-300 border-l-0 rounded-r text-gray-600 text-sm">.electoraterun.com</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[13px] font-bold text-[#333] mb-1">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mullana"
              className="w-full px-3 py-2 bg-[#F9F9F9] border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-400 text-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#333] mb-1">
              State / Region
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. HR"
              className="w-full px-3 py-2 bg-[#F9F9F9] border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-400 text-gray-800 text-sm"
            />
          </div>
        </div>

        <div className="p-4 bg-[#F9F9F9] border border-gray-200 rounded">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <label className="block text-[13px] font-bold text-[#333] mb-1">
                Show Up in Organization Search?
              </label>
              <p className="text-[11px] text-gray-500 leading-tight">
                Enable this setting for your organization to show up in the search on https://vote.electoraterun.com. <br />
                Note: it can take 10-15 minutes to show up in the search results.
              </p>
            </div>
            <div 
              onClick={() => setShowInSearch(!showInSearch)}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${showInSearch ? 'bg-[#00D02D]' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showInSearch ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#00D02D] hover:bg-[#00B828] text-white font-bold rounded transition-colors text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};