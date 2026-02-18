// src/reusableComponents/Cards/FormCard.jsx
import React from "react";

const FormCard = ({ title, subtitle, children }) => {
  return (
    <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-lg overflow-hidden">
      {/* Header */}
      {title && (
        <div className="px-6 py-4 border-b border-[#2a2c2f]">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {subtitle && (
            <p className="text-xs text-[#555] mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default FormCard;