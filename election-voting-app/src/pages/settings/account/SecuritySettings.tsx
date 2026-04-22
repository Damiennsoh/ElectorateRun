import React, { useState } from 'react';
import { FiKey } from 'react-icons/fi';

export const SecuritySettings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <div className="p-8">
      <h2 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
        <FiKey /> Change Password
      </h2>

      <div className="space-y-8 max-w-2xl">
        <div>
          <label className="block text-[13px] font-bold text-[#333] mb-2">
            Current Password
          </label>
          <div className="relative group">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9F9F9] border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none transition-all text-gray-800"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-100 transition-opacity">
              <div className="w-5 h-0.5 bg-gray-400 rounded-full mb-0.5"></div>
              <div className="w-5 h-0.5 bg-gray-400 rounded-full mb-0.5"></div>
              <div className="w-5 h-0.5 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#333] mb-2">
            New Password
          </label>
          <div className="relative group">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9F9F9] border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 outline-none transition-all text-gray-800"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-100 transition-opacity">
              <div className="w-5 h-0.5 bg-gray-400 rounded-full mb-0.5"></div>
              <div className="w-5 h-0.5 bg-gray-400 rounded-full mb-0.5"></div>
              <div className="w-5 h-0.5 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button className="px-6 py-2.5 bg-[#00D02D] hover:bg-[#00B828] text-white font-bold rounded transition-colors text-sm">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};