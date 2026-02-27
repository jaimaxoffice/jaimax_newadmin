// src/components/ToggleSwitch.jsx
import React from "react";

const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`
        relative w-10 h-5 flex items-center rounded-full p-0.5 transition-all duration-300 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${checked ? "bg-[#b9fd5c]" : "bg-[#9dad8f]"}
      `}
    >
      {/* Thumb */}
      <span
        className={`
          inline-block w-4 h-4 bg-white rounded-full shadow-lg transform transition-transform duration-300
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
};

export default ToggleSwitch;