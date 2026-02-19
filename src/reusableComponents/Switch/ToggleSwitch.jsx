// src/components/ToggleSwitch.jsx
import React from "react";

const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${
        checked ? "bg-[#b9fd5c]" : "bg-[#2a2c2f]"
      }`}
    >
      <span
        className={`absolute top-0 left-0 w-3 h-3 bg-white rounded-full transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;