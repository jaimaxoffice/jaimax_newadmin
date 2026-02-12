// src/components/DetailModal.jsx
import React from "react";
import Modal from "./Modals";

const DetailModal = ({ show, title, content, onClose }) => {
  return (
    <Modal isOpen={show} onClose={onClose} title={title} size="md">
      <textarea
        readOnly
        rows={6}
        value={content}
        className="w-full p-4 rounded-lg text-white text-sm font-mono
          bg-[#232528] border border-[#2a2c2f] 
          focus:outline-none resize-none"
        style={{ whiteSpace: "pre-line" }}
      />

      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white
            bg-[#eb660f] hover:bg-[#ff7b1c] transition-all duration-300
            cursor-pointer"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default DetailModal;