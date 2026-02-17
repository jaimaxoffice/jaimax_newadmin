// src/reusableComponents/Inputs/InputField.jsx
import React from "react";

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  prefix,
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#ffffff] mb-1.5">
          {label}
          {required && <span className="text-[#eb660f] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#eb660f] font-semibold text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full bg-[#111214] border text-white placeholder-[#c6bfbf] rounded-xl 
            py-3 text-sm focus:outline-none focus:ring-1 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${prefix ? "pl-8 pr-4" : "px-4"}
            ${
              error
                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50"
                : "border-[#2a2c2f] focus:border-[#eb660f] focus:ring-[#eb660f]/50"
            }`}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default InputField;