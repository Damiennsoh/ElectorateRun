import React from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    electionTitle: string;
    votedOn: string;
    receiptId: string;
  };
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#00AEEF] rounded shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in relative">
        {/* Transparent Close Button in Title Bar */}
        <div className="px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-bold">Ballot Receipt</h2>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded transition-colors border border-white">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 bg-white">
          <p className="text-center text-gray-500 text-xs italic mb-6">
            (Right-click and select Save Image As)
          </p>

          <div className="border-4 border-black p-1">
            <div className="border border-black p-6 flex flex-col items-center">
              <div className="bg-black text-white w-full py-2 text-center font-black text-lg uppercase tracking-wider mb-8">
                Ballot Receipt
              </div>

              <div className="w-full space-y-8 text-center">
                <div>
                   <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-tighter">Election</span>
                   <div className="mt-2 font-bold text-gray-800 text-sm leading-tight px-4">{data.electionTitle}</div>
                </div>

                <div>
                   <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-tighter">Voted On</span>
                   <div className="mt-2 text-xs text-gray-700 leading-relaxed font-medium px-4">{data.votedOn}</div>
                </div>

                <div className="pb-4">
                   <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-tighter">Receipt ID</span>
                   <div className="mt-2 font-mono text-xs text-gray-800 font-bold uppercase tracking-widest">{data.receiptId}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
