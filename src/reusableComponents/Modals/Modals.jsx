// // src/components/Modal.jsx
// import React, { useEffect } from "react";

// const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => {
//   // Close on Escape key
//   useEffect(() => {
//     const handleEsc = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     if (isOpen) document.addEventListener("keydown", handleEsc);
//     return () => document.removeEventListener("keydown", handleEsc);
//   }, [isOpen, onClose]);

//   // Prevent body scroll
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const sizeClass = {
//     sm: "max-w-md",
//     md: "max-w-xl",
//     lg: "max-w-3xl",
//     xl: "max-w-5xl",
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//         onClick={onClose}
//       />

//       {/* Modal Content */}
//       <div
//         className={`relative w-full ${sizeClass[size]} bg-[#1a1c1f] border border-[#2a2c2f] 
//           rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c2f]">
//           <h2 className="text-lg font-semibold text-white">{title}</h2>
//           <button
//             onClick={onClose}
//             className="text-[#8a8d93] hover:text-white transition-colors cursor-pointer text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-4">{children}</div>
//       </div>
//     </div>
//   );
// };

// export default Modal;



// src/components/Modal.jsx
import React, { useEffect, useRef } from "react";

const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => {
  const modalRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on outside click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-[95vw]",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClass[size]} bg-[#1a1c1f] 
          rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] 
          max-h-[85vh] flex flex-col animate-scaleIn`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
              bg-[#2a2c2f] text-[#8a8d93] hover:bg-red-500/20 hover:text-red-400
              transition-all cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#2a2c2f] mx-6" />

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;