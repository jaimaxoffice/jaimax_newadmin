// src/components/ToggleSwitch.jsx
import React from "react";

const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
        checked ? "bg-[#0ecb6f]" : "bg-[#2a2c2f]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;