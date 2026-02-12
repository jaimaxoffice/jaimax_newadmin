// src/components/UTRModal.jsx
import React from "react";
import Modal from "./Modals";

const UTRModal = ({ show, onClose, utrNumber, setUtrNumber, onSubmit }) => {
  return (
    <Modal isOpen={show} onClose={onClose} title="Enter UTR Number" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#eb660f] mb-2">
            UTR Number
          </label>
          <input
            type="text"
            placeholder="Enter UTR Number"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-white text-sm
              bg-[#232528] border border-[#2a2c2f]
              focus:outline-none focus:border-[#eb660f] focus:ring-1 focus:ring-[#eb660f]/30
              placeholder:text-[#8a8d93] transition-all duration-200"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white
              bg-transparent border border-[#2a2c2f] 
              hover:bg-[#2a2c2f] transition-all duration-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white
              bg-[#eb660f] hover:bg-[#ff7b1c] transition-all duration-300
              cursor-pointer"
          >
            Submit & Approve
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UTRModal;