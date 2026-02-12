// src/reusableComponents/Inputs/TextareaField.jsx
import React from "react";

const TextareaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  rows = 3,
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#8a8d93] mb-1.5">
          {label}
          {required && <span className="text-[#0ecb6f] ml-1">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        autoComplete="off"
        className={`w-full bg-[#111214] border text-white placeholder-[#555] rounded-xl 
          py-3 px-4 text-sm focus:outline-none focus:ring-1 transition-colors resize-none
          ${
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50"
              : "border-[#2a2c2f] focus:border-[#0ecb6f] focus:ring-[#0ecb6f]/50"
          }`}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default TextareaField;