import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { RichTextEditor } from '../../../components/common/RichTextEditor';
import { api } from '../../../utils/api';

export const GeneralSettings: React.FC = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      if (!id) return;
      try {
        const election = await api.getElectionById(id);
        if (election) {
          setTitle(election.title || '');
          setDescription(election.description || '');
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
      await api.updateElection(id, { title, description });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error("Error saving election:", err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const maxLength = 5000;
  const remaining = maxLength - description.length;

  return (
    <div className="bg-white">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-[15px] font-bold text-[#333] flex items-center gap-2">
          <FiSettings className="text-gray-500" />
          General Settings
        </h3>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-[14px] text-gray-700 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-2">
            Description
          </label>
          <div className="border border-gray-300 rounded overflow-hidden">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Description..."
            />
          </div>
          <div className="mt-2 text-[12px] text-gray-500">
            Max Length: 5,000 characters. ({remaining} remaining)
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#00D02D] text-white rounded font-bold text-[14px] hover:bg-[#00B026] transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};