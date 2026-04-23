import React, { useState } from 'react';
import { FiSmartphone, FiInfo } from 'react-icons/fi';

export const MobileAppSettings: React.FC = () => {
  const [mobileEnabled, setMobileEnabled] = useState(false);

  return (
    <div className="p-8">
      <h2 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-2">
        <FiSmartphone /> Mobile App
      </h2>

      <div className="space-y-8 max-w-4xl">
        <div className="space-y-4">
          <p className="text-[13px] text-[#333] leading-relaxed">
            The ElectorateRun iOS & Android mobile app is available as a free download on iTunes & Google Play. The app makes it easy for your voters to find your organization and the elections you've created.
          </p>
          <div className="flex gap-4">
            <button className="h-10">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-full" />
            </button>
            <button className="h-10">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-full" />
            </button>
          </div>
        </div>

        <div className="bg-[#E8F8FF] border border-[#B8E8FF] rounded p-4 flex gap-3">
          <FiInfo className="text-[#00AEEF] mt-1 shrink-0" />
          <p className="text-[13px] text-[#007799]">
            <span className="font-bold">Important:</span> Please <button className="text-[#00AEEF] hover:underline">click here</button> to read about and understand the purpose of the the mobile app prior to enabling it.
          </p>
        </div>

        <div className="p-4 border border-gray-200 rounded">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <label className="text-[13px] font-bold text-[#333]">Mobile App</label>
                <FiInfo className="text-[#00AEEF] text-xs cursor-help" />
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                Enable this setting to allow your organization to show up in the search results for the mobile app. It can take up to 30 minutes to show up in the search results after enabling this option.
              </p>
            </div>
            <div 
              onClick={() => setMobileEnabled(!mobileEnabled)}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${mobileEnabled ? 'bg-[#00D02D]' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${mobileEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
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