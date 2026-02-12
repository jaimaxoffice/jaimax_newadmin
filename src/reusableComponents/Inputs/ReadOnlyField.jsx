// src/components/ReadOnlyField.jsx
import React from "react";

const ReadOnlyField = ({ label, value }) => {
  return (
    <div>
      <label className="block text-xs font-medium text-[#8a8d93] mb-1.5">
        {label}
      </label>
      <input
        type="text"
        readOnly
        value={value || "N/A"}
        className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none"
      />
    </div>
  );
};

export default ReadOnlyField;