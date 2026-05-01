import React from 'react';
import { FiBriefcase, FiCheckCircle, FiInfo, FiArrowRight, FiHelpCircle } from 'react-icons/fi';

interface ElectionAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  results: {
    settings: { issues: string[] };
    voters: { issues: string[] };
    ballot: { issues: string[] };
  };
  electionId: string;
}

export const ElectionAssistantModal: React.FC<ElectionAssistantModalProps> = ({ 
  isOpen, onClose, onContinue, results, electionId
}) => {
  if (!isOpen) return null;

  const totalIssues = results.settings.issues.length + results.voters.issues.length + results.ballot.issues.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in scale-up">
        {/* Fixed Header */}
        <div className="bg-[#00AEEF] px-5 py-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FiBriefcase className="text-xl" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Election Assistant</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors">
            <FiHelpCircle className="text-xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          <p className="text-[#666] text-[14px] sm:text-[15px] leading-relaxed">
            The Election Assistant scans elections for missing or inconsistent data as well as configuration issues that may be overlooked by election administrators. The results of the scan <span className="font-bold text-gray-800">do not prevent the election from being launched</span> and can be safely ignored, though we recommend taking action on warnings and critical warnings. <a href="#" className="text-[#00AEEF] hover:underline font-bold">Learn More »</a>
          </p>

          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-bold text-sm">This scan resulted in {totalIssues} items:</span>
            <span className="bg-[#00AEEF] text-white text-[10px] font-bold px-2 py-0.5 rounded leading-none uppercase">{totalIssues} notice</span>
          </div>

          <div className="space-y-4">
            {/* Settings Section */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3 font-bold text-gray-700">
                  {results.settings.issues.length === 0 ? <FiCheckCircle className="text-green-500 text-lg" /> : <FiInfo className="text-[#00AEEF] text-lg" />}
                  <span className="text-sm uppercase tracking-tight">Settings</span>
                </div>
                <span className="text-[12px] text-gray-400">{results.settings.issues.length} detected</span>
              </div>
              {results.settings.issues.map((issue, i) => (
                <div key={i} className="px-5 py-4 border-t border-gray-100 bg-blue-50/30 flex items-start gap-3">
                  <FiInfo className="text-[#00AEEF] mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-[14px] text-gray-800 font-medium">{issue}</div>
                    <a href={`/election/${electionId}/settings`} className="text-[12px] text-[#00AEEF] hover:underline">Learn How to Fix »</a>
                  </div>
                </div>
              ))}
            </div>

            {/* Voters Section */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3 font-bold text-gray-700">
                  {results.voters.issues.length === 0 ? <FiCheckCircle className="text-green-500 text-lg" /> : <FiInfo className="text-[#00AEEF] text-lg" />}
                  <span className="text-sm uppercase tracking-tight">Voters</span>
                </div>
                <span className="text-[12px] text-gray-400">{results.voters.issues.length} detected</span>
              </div>
              {results.voters.issues.map((issue, i) => (
                <div key={i} className="px-5 py-4 border-t border-gray-100 bg-blue-50/30 flex items-start gap-3">
                  <FiInfo className="text-[#00AEEF] mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-[14px] text-gray-800 font-medium">{issue}</div>
                    <a href={`/election/${electionId}/voters`} className="text-[12px] text-[#00AEEF] hover:underline">Learn How to Fix »</a>
                  </div>
                </div>
              ))}
            </div>

            {/* Ballot Section */}
            <div className="border border-gray-200 rounded overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3 font-bold text-gray-700">
                  {results.ballot.issues.length === 0 ? <FiCheckCircle className="text-green-500 text-lg" /> : <FiInfo className="text-[#00AEEF] text-lg" />}
                  <span className="text-sm uppercase tracking-tight">Ballot</span>
                </div>
                <span className="text-[12px] text-gray-400">{results.ballot.issues.length} detected</span>
              </div>
              {results.ballot.issues.map((issue, i) => (
                <div key={i} className="px-5 py-1 border-t border-gray-100">
                    <div className="my-3 border border-[#00AEEF] rounded-lg p-4 flex items-start gap-3 bg-blue-50/20">
                    <FiInfo className="text-[#00AEEF] text-xl mt-0.5 flex-shrink-0" />
                    <div>
                        <div className="text-[14px] text-gray-800 font-medium">{issue}</div>
                        <a href={`/election/${electionId}/ballot`} className="text-[12px] text-[#00AEEF] font-bold hover:underline">Learn How to Fix »</a>
                    </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <button
            onClick={onContinue}
            className="flex-1 sm:flex-none bg-[#00D02D] hover:bg-[#00B026] text-white px-8 py-3 rounded font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wide shadow-md active:scale-[0.98]"
          >
            Continue <FiArrowRight />
          </button>
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded font-bold transition-all uppercase tracking-wide active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
