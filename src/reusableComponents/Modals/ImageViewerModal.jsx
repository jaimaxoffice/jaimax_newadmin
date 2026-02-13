// src/reusableComponents/Modals/ImageViewerModal.jsx
import React from "react";

const ImageViewerModal = ({ isOpen, onClose, imageSrc }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
                 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#1b232d] border border-[#2a2c2f] rounded-2xl 
                    max-w-[90vw] max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="flex justify-end p-3 border-b border-[#2a2c2f]">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full 
                       bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                       hover:text-white hover:border-[#eb660f] 
                       transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center p-4">
          <img
            src={imageSrc}
            alt="Preview"
            className="max-h-[70vh] max-w-[80vw] min-h-[200px] min-w-[200px] 
                       object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;