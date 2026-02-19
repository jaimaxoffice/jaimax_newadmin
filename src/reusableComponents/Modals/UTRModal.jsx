// src/components/UTRModal.jsx
import React from "react";
import Modal from "./Modals";
import Button from "../../reusableComponents/Buttons/Button";
const UTRModal = ({ show, onClose, utrNumber, setUtrNumber, onSubmit }) => {
  return (
    <Modal isOpen={show} onClose={onClose} title="Enter UTR Number" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#b9fd5c] mb-2">
            UTR Number
          </label>
          <input
            type="text"
            placeholder="Enter UTR Number"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-white text-sm
              bg-[#232528] border border-[#2a2c2f]
              focus:outline-none focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/30
              placeholder:text-[#8a8d93] transition-all duration-200"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={onClose} variant="primary" size="md">
              Cancel
            </Button>

            <Button onClick={onSubmit} variant="primary" size="md">
              Submit & Approve
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UTRModal;
