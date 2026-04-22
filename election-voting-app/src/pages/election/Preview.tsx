import React from 'react';
import { useParams } from 'react-router-dom';
import { FiEye, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';
import { ElectionSidebarLayout } from '../../components/layout/ElectionSidebarLayout';

export const Preview: React.FC = () => {
  const { id } = useParams();

  const handleContinue = () => {
    window.open(`/vote/${id}?preview=true`, '_blank');
  };

  return (
    <ElectionSidebarLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-xl font-bold text-[#333] mb-8">
          <FiEye className="text-gray-400" />
          <h1>Preview</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm p-8 max-w-2xl">
          <div className="space-y-6 text-gray-700">
            <p className="text-[15px] leading-relaxed">
              The election preview allows you to see and vote in the election as a voter would. Don't worry, your vote won't count towards the totals.
            </p>
            <p className="text-[15px] leading-relaxed">
              To preview an election, there <span className="font-bold">must be at least one ballot question with at least one option.</span>
            </p>

            <div className="space-y-4">
              <div className="bg-[#FFF4E5] border-l-4 border-[#FF9800] p-4 flex items-start gap-3">
                <FiAlertTriangle className="text-[#FF9800] text-xl mt-0.5" />
                <p className="text-[#663C00] text-[15px]">
                  Test voters can only login using <span className="font-bold">test</span> as the Voter ID and Voter Key.
                </p>
              </div>

              <div className="bg-[#FFF4E5] border-l-4 border-[#FF9800] p-4 flex items-start gap-3">
                <FiAlertTriangle className="text-[#FF9800] text-xl mt-0.5" />
                <p className="text-[#663C00] text-[15px]">
                  The election preview is only available when the election is in "Building" mode.
                </p>
              </div>
            </div>

            <button 
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#00AEEF] text-white rounded hover:bg-[#009CD6] transition-colors font-bold shadow-sm"
            >
              Continue
              <FiArrowRight className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </ElectionSidebarLayout>
  );
};
