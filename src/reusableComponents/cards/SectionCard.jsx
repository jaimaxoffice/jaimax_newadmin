// src/reusableComponents/Cards/SectionCard.jsx
import React from "react";

const SectionCard = ({ title, children }) => {
  return (
    <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl overflow-hidden">
      {title && (
        <div className="px-5 py-3.5 border-b border-[#2a2c2f] bg-[#16181b]">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

export default SectionCard;