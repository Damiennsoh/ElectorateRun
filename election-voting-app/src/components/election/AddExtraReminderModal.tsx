import React, { useState } from 'react';
import { Modal } from '../common/Modal';

interface AddExtraReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (quantity: number) => void;
}

export const AddExtraReminderModal: React.FC<AddExtraReminderModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAdd(quantity);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add-on: Extra Reminder Email"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 py-2">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Extra Reminder Email</h3>
          <p className="text-gray-500 text-sm">$10 / Reminder Email / 2,000 Eligible Voters</p>
        </div>

        <p className="text-gray-700 text-[15px] leading-relaxed">
          All elections come with the ability to send 2 reminder emails. Select this add-on if you anticipate needing to send more than 2 reminder emails for this election. This add-on can be purchased when the election is in the "Building", "Scheduled" or "Running" state.
        </p>

        <div className="flex items-center gap-4 bg-gray-50 p-6 rounded border border-gray-100">
          <label className="text-lg font-bold text-gray-700">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition-all text-center text-lg"
          />
          <button
            onClick={handleAdd}
            className="bg-[#00D02D] text-white px-8 py-2.5 rounded font-bold hover:bg-[#00B026] transition-colors text-lg"
          >
            Add
          </button>
        </div>

        <p className="text-sm text-gray-500 italic">
          * Can only be applied to this election. Non-transferable. No refunds for unused reminders.
        </p>
      </div>
    </Modal>
  );
};
