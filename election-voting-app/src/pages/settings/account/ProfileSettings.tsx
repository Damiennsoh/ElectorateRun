import React, { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import { supabase } from '../../../utils/supabase';

export const ProfileSettings: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setName(session.user.user_metadata?.full_name || '');
        setEmail(session.user.email || '');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to save settings.');
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-2">
        <FiUser /> Profile Settings
      </h2>

      <div className="space-y-8 max-w-2xl">
        <div>
          <label className="block text-[13px] font-bold text-[#333] mb-1">
            Name
          </label>
          <p className="text-[11px] text-gray-500 mb-2 leading-tight">
            Your name or the name of the primary contact of the account. Visit the <button className="text-[#00AEEF] hover:underline">organization settings</button> to change the name of the organization.
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-[#F9F9F9] border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none transition-all text-gray-800"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#333] mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 bg-[#F1F1F1] border border-gray-300 rounded outline-none transition-all text-gray-500 cursor-not-allowed"
            title="Email cannot be changed here"
          />
        </div>

        <div className="pt-4 flex items-center justify-between">
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#00D02D] hover:bg-[#00B828] text-white font-bold rounded transition-colors text-sm"
          >
            Save Settings
          </button>
          <button className="text-sm text-red-600 hover:underline">
            Close Account
          </button>
        </div>
      </div>
    </div>
  );
};
