import React from 'react';
import { FiCreditCard } from 'react-icons/fi';

const pricingData = [
  { voters: '1 to 20', price: 'FREE' },
  { voters: '21 to 100', price: '$19' },
  { voters: '101 to 300', price: '$36' },
  { voters: '301 to 500', price: '$49' },
  { voters: '501 to 750', price: '$75' },
  { voters: '751 to 1,000', price: '$90' },
  { voters: '1,001 to 100,000', price: '$0.09 / Voter' },
  { voters: '100,001 to 500,000', price: '$0.09 / Voter' },
  { voters: '500,001 to 1,000,000', price: '$0.08 / Voter' },
];

export const BillingSettings: React.FC = () => {
  return (
    <div className="p-8">
      <h2 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-2">
        <FiCreditCard /> Billing
      </h2>

      <div className="space-y-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#333]">Your Plan: Pay Per Election</h3>
            <p className="text-[15px] text-[#333] leading-relaxed">
              With the <span className="font-bold">Pay-Per-Election</span> plan you pay for <span className="font-bold">each election</span> based on the total number of <span className="font-bold">eligible voters</span> assigned to the election. The first 20 eligible voters in an election are free. Elections with more than 20 eligible voters will require payment during the election launch process.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F9FAFB] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold text-[#333] text-center">Voters</th>
                  <th className="px-6 py-3 font-bold text-[#333] text-center border-l border-gray-200">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pricingData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-2.5 text-center text-gray-700">{row.voters}</td>
                    <td className="px-6 py-2.5 text-center text-gray-700 border-l border-gray-200 uppercase">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};