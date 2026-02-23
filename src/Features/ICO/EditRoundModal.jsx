// src/features/ico/EditRoundModal.jsx
import React from "react";
import Modal from "../../reusableComponents/Modals/Modals";
import ReadOnlyField from "../../reusableComponents/Inputs/ReadOnlyField";

const EditRoundModal = ({
  isOpen,
  onClose,
  data,
  errors,
  onChange,
  onKeyUp,
  onUpdate,
}) => {
  if (!data) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Round" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Round - Read Only */}
          <ReadOnlyField label="Round" value={data.round} />

          {/* USD Price */}
          <div>
            <label className="block text-xs font-medium text-[#8a8d93] mb-1.5">
              USD Price
            </label>
            <input
              type="text"
              name="atPriceUsdt"
              autoComplete="off"
              value={data.atPriceUsdt}
              onChange={onChange}
              onKeyUp={onKeyUp}
              className={`w-full bg-[#111214] border ${
                errors?.atPriceUsdt ? "border-red-500/50" : "border-[#2a2c2f]"
              } text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none 
                focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors`}
            />
            {errors?.atPriceUsdt && (
              <p className="mt-1 text-xs text-red-400">{errors.atPriceUsdt}</p>
            )}
          </div>

          {/* INR Price */}
          <div>
            <label className="block text-xs font-medium text-[#8a8d93] mb-1.5">
              INR Price
            </label>
            <input
              type="text"
              name="atPriceInr"
              autoComplete="off"
              value={data.atPriceInr}
              onChange={onChange}
              onKeyUp={onKeyUp}
              className={`w-full bg-[#111214] border ${
                errors?.atPriceInr ? "border-red-500/50" : "border-[#2a2c2f]"
              } text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none 
                focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors`}
            />
            {errors?.atPriceInr && (
              <p className="mt-1 text-xs text-red-400">{errors.atPriceInr}</p>
            )}
          </div>

          {/* Total Quantity - Read Only */}
          <ReadOnlyField label="Total Quantity" value={data.totalQty} />

          {/* Remaining Quantity - Read Only */}
          <ReadOnlyField label="Remaining Quantity" value={data.remaingQty} />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#2a2c2f] hover:bg-[#333] text-white py-3 
              rounded-3xl text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onUpdate}
            className="flex-1 bg-[#b9fd5c] hover:bg-[#b9fd5c]/90 text-[#111214] py-3 
              rounded-3xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditRoundModal;