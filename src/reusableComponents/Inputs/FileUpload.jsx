// src/reusableComponents/Inputs/FileUpload.jsx
import React, { useRef, useState } from "react";

const FileUpload = ({
  label,
  file,
  previewUrl,
  onFileChange,
  onRemove,
  error,
  required,
  accept = "image/jpeg,image/png,image/jpg,image/webp",
  maxSize = 5,
  hint = "JPG, PNG, WEBP",
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileChange({ target: { files: [droppedFile] } });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {label && (
        <label className="block text-sm font-medium text-[#8a8d93] mb-1.5">
          {label}
          {required && <span className="text-[#b9fd5c] ml-1">*</span>}
        </label>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept={accept}
        className="hidden"
      />

      {previewUrl ? (
        /* File Preview */
        <div className="flex-1 bg-[#111214] border border-[#b9fd5c]/30 rounded-xl p-4 flex flex-col">
          <div className="flex-1 flex items-center justify-center mb-3">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-64 object-contain rounded-lg border-2 border-[#b9fd5c]/30"
            />
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-[#2a2c2f]">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {file?.name}
              </p>
              <p className="text-[#555] text-xs mt-0.5">
                {formatFileSize(file?.size)}
              </p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-[#b9fd5c] bg-[#b9fd5c]/10 px-2 py-0.5 rounded-full">
                ✓ Uploaded
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full
                bg-red-500/10 border border-red-500/20 text-red-400 
                hover:bg-red-500/20 transition-colors cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 min-h-[280px] border-2 border-dashed rounded-xl p-8 cursor-pointer
            flex flex-col items-center justify-center gap-3 transition-all
            ${
              error
                ? "border-red-500/50 bg-red-500/5"
                : isDragging
                ? "border-[#b9fd5c] bg-[#b9fd5c]/5"
                : "border-[#2a2c2f] bg-[#111214] hover:border-[#b9fd5c]/50 hover:bg-[#b9fd5c]/5"
            }`}
        >
          <div className="w-16 h-16 rounded-full bg-[#b9fd5c]/10 flex items-center justify-center">
            <span className="text-[#b9fd5c] text-2xl">↑</span>
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-medium">
              {isDragging ? "Drop file here" : "Click or drag to upload"}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {hint} (Max {maxSize}MB)
            </p>
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default FileUpload;