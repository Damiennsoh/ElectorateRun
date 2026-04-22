import React, { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';

export const AppearanceSettings: React.FC = () => {
  const [color, setColor] = useState('#0bacfa');

  return (
    <div className="p-8">
      <h2 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-2">
        <FiEdit2 /> Appearance Settings
      </h2>

      <div className="space-y-8 max-w-2xl">
        <div>
          <label className="block text-[13px] font-bold text-[#333] mb-1">
            Logo
          </label>
          <p className="text-[11px] text-gray-500 mb-2 leading-tight">
            Add a logo/image that voters will see when voting.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="file"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-100 file:text-gray-700
                hover:file:bg-gray-200"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Max file size: 2MB. Allowed types: .jpg, .gif, .png
          </p>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#333] mb-1">
            Color
          </label>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="pl-3 pr-10 py-2 bg-[#F9F9F9] border border-gray-300 rounded outline-none text-gray-800 text-sm w-32"
              />
              <div 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded"
                style={{ backgroundColor: color }}
              />
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