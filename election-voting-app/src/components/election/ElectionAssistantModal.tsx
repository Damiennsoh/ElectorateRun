import React from 'react';
import { FiBriefcase, FiUsers, FiList, FiCheckCircle, FiInfo, FiAlertCircle, FiX, FiArrowRight, FiHelpCircle } from 'react-icons/fi';

interface ElectionAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  results: {
    settings: { issues: string[] };
    voters: { issues: string[] };
    ballot: { issues: string[] };
  };
}

export const ElectionAssistantModal: React.FC<ElectionAssistantModalProps> = ({ 
  isOpen, onClose, onContinue, results 
}) => {
  if (!isOpen) return null;

  const totalIssues = results.settings.issues.length + results.voters.issues.length + results.ballot.issues.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in scale-up">
        {/* Header */}
        <div className="bg-[#00AEEF] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FiBriefcase className="text-xl" />
            </div>
            <h2 className="text-xl font-bold">Election Assistant</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors">
            <FiHelpCircle className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-[#666] text-[15px] leading-relaxed">
            The Election Assistant scans elections for missing or inconsistent data as well as configuration issues that may be overlooked by election administrators. The results of the scan <span className="font-bold">do not prevent the election from being launched</span> and can be safely ignored, though we recommend taking action on warnings and critical warnings. <a href="#" className="text-[#00AEEF] hover:underline">Learn More »</a>
          </p>

          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-bold">This scan resulted in {totalIssues} items that need attention:</span>
            <span className="bg-[#00AEEF] text-white text-[10px] font-bold px-2 py-0.5 rounded leading-none uppercase">{totalIssues} notice</span>
          </div>

          <div className="space-y-3">
            {/* Settings Section */}
            <div className="border border-gray-200 rounded">
              <div className="px-5 py-4 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3 font-bold text-gray-700">
                  {results.settings.issues.length === 0 ? <FiCheckCircle className="text-green-500 text-lg" /> : <FiInfo className="text-[#00AEEF] text-lg" />}
                  <span>Settings</span>
                </div>
                <span className="text-[13px] text-gray-400">{results.settings.issues.length} issues detected</span>
              </div>
              {results.settings.issues.map((issue, i) => (
                <div key={i} className="px-5 py-4 border-t border-gray-100 bg-blue-50/30 flex items-start gap-3">
                  <FiInfo className="text-[#00AEEF] mt-1" />
                  <div>
                    <div className="text-[14px] text-gray-800">{issue}</div>
                    <a href="#" className="text-[12px] text-[#00AEEF] hover:underline">Learn How to Fix »</a>
                  </div>
                </div>
              ))}
            </div>

            {/* Voters Section */}
            <div className="border border-gray-200 rounded">
              <div className="px-5 py-4 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3 font-bold text-gray-700">
                  {results.voters.issues.length === 0 ? <FiCheckCircle className="text-green-500 text-lg" /> : <FiInfo className="text-[#00AEEF] text-lg" />}
                  <span>Voters</span>
                </div>
                <span className="text-[13px] text-gray-400">{results.voters.issues.length} issues detected</span>
              </div>
              {results.voters.issues.map((issue, i) => (
                <div key={i} className="px-5 py-4 border-t border-gray-100 bg-blue-50/30 flex items-start gap-3">
                  <FiInfo className="text-[#00AEEF] mt-1" />
                  <div>
                    <div className="text-[14px] text-gray-800">{issue}</div>
                    <a href="#" className="text-[12px] text-[#00AEEF] hover:underline">Learn How to Fix »</a>
                  </div>
                </div>
              ))}
            </div>

            {/* Ballot Section */}
            <div className="border border-gray-200 rounded shadow-sm">
              <div className="px-5 py-4 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3 font-bold text-gray-700">
                  {results.ballot.issues.length === 0 ? <FiCheckCircle className="text-green-500 text-lg" /> : <FiInfo className="text-[#00AEEF] text-lg" />}
                  <span>Ballot</span>
                </div>
                <span className="text-[13px] text-gray-400">{results.ballot.issues.length} issue detected</span>
              </div>
              {results.ballot.issues.map((issue, i) => (
                <div key={i} className="px-5 py-0 border-t border-gray-100">
                    <div className="my-4 border border-[#00AEEF] rounded p-4 flex items-start gap-3 bg-blue-50/20">
                    <FiInfo className="text-[#00AEEF] text-xl mt-0.5" />
                    <div>
                        <div className="text-[14px] text-gray-800">{issue}</div>
                        <a href="#" className="text-[12px] text-[#00AEEF] font-bold hover:underline">Learn How to Fix »</a>
                    </div>
                    </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={onContinue}
              className="bg-[#00D02D] hover:bg-[#00B026] text-white px-8 py-2.5 rounded font-bold transition-all flex items-center gap-2 uppercase tracking-wide shadow-md"
            >
              Continue <FiArrowRight />
            </button>
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-2.5 rounded font-bold transition-all transition-colors uppercase tracking-wide"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
