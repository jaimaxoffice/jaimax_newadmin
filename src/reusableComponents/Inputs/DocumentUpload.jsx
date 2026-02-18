// src/reusableComponents/Inputs/DocumentUpload.jsx
import React, { useRef } from "react";

const DocumentUpload = ({
  label,
  name,
  preview,
  fileName,
  onFileChange,
  onRemove,
  error,
}) => {
  const inputRef = useRef(null);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#fff] mb-1.5">
          {label}
        </label>
      )}

      <input
        type="file"
        ref={inputRef}
        name={name}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative bg-[#111214] border border-[#b9fd5c]/30 rounded-xl p-3">
          <img
            src={preview}
            alt={label}
            className="w-full h-32 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => {
              onRemove();
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center 
              rounded-full bg-red-500 text-white hover:bg-red-600 
              transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
          {fileName && (
            <p className="text-[#fff] text-[11px] mt-2 truncate text-center">
              {fileName}
            </p>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl h-40 cursor-pointer
            flex flex-col items-center justify-center gap-2 transition-all
            hover:border-[#b9fd5c]/50 hover:bg-[#b9fd5c]/5
            ${
              error
                ? "border-red-500/50 bg-red-500/5"
                : "border-[#2a2c2f] bg-[#111214]"
            }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#b9fd5c]/10 flex items-center justify-center">
            <span className="text-[#b9fd5c] text-lg">↑</span>
          </div>
          <p className="text-[#fff] text-xs font-medium">Click to upload</p>
          <p className="text-gray-400 text-[10px]">PNG, JPG up to 5MB</p>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default DocumentUpload;