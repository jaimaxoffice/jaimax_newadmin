// src/features/wallet/EditTransactionModal.jsx
import React from "react";
import Modal from "../../reusableComponents/Modals/Modals";
import ReadOnlyField from "../../reusableComponents/Inputs/ReadOnlyField";

const EditTransactionModal = ({
  isOpen,
  onClose,
  data,
  onChange,
  onUpdate,
}) => {
  if (!data) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Transaction" size="md">
      <div className="space-y-4">
        <ReadOnlyField label="Name" value={data.name} />

        <div>
          <label className="block text-xs font-medium text-[#8a8d93] mb-1.5">
            Transaction Amount
          </label>
          <input
            type="text"
            name="transactionAmount"
            autoComplete="off"
            value={data.transactionAmount}
            onChange={onChange}
            className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl 
              py-2.5 px-4 text-sm focus:outline-none focus:border-[#0ecb6f] 
              focus:ring-1 focus:ring-[#0ecb6f]/50 transition-colors"
          />
        </div>

        <ReadOnlyField label="Transaction ID" value={data.transactionId} />

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-[#2a2c2f] hover:bg-[#333] text-white py-3 rounded-xl 
              text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onUpdate}
            className="flex-1 bg-[#0ecb6f] hover:bg-[#0ecb6f]/90 text-[#111214] py-3 
              rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Update
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditTransactionModal;