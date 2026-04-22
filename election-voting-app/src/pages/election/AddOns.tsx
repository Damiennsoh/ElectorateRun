import React, { useState } from 'react';
import { FiBox, FiPlus } from 'react-icons/fi';
import { ElectionSidebarLayout } from '../../components/layout/ElectionSidebarLayout';
import { AddExtraReminderModal } from '../../components/election/AddExtraReminderModal';

export const AddOns: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addedAddOns, setAddedAddOns] = useState<any[]>([]);

  const handleAdd = (quantity: number) => {
    setAddedAddOns([...addedAddOns, { name: 'Extra Reminder Email', quantity }]);
  };

  return (
    <ElectionSidebarLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-xl font-bold text-[#333] mb-8">
          <FiBox className="text-gray-400" />
          <h1>Add-ons</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Selected Add-ons */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Selected Add-ons</h2>
            {addedAddOns.length === 0 ? (
              <div className="bg-[#E6F7FF] border border-[#BBE7FF] p-6 text-[15px] text-[#00AEEF] text-center rounded">
                No add-ons have been added to this election.
              </div>
            ) : (
              <div className="space-y-4">
                {addedAddOns.map((addon, index) => (
                  <div key={index} className="bg-white border border-gray-200 p-6 rounded shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{addon.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {addon.quantity}</p>
                    </div>
                    <span className="text-[#00D02D] font-bold">Added</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Add-ons */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Add-ons</h2>
            <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Extra Reminder Email</h3>
              <p className="text-gray-400 text-xs mb-4">$10 / Reminder Email / 2,000 Eligible Voters</p>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Add-on that allows for sending more than 2 reminder emails during an election. <a href="#" className="text-[#00AEEF] hover:underline">More »</a>
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#00D02D] text-white rounded hover:bg-[#00B026] transition-colors text-sm font-bold shadow-sm"
              >
                <FiPlus className="text-lg" />
                Add Add-on
              </button>
            </div>
          </div>
        </div>

        <AddExtraReminderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAdd}
        />
      </div>
    </ElectionSidebarLayout>
  );
};
