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
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#8a8d93] mb-1.5">
          {label}
          {required && <span className="text-[#0ecb6f] ml-1">*</span>}
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
        <div className="bg-[#111214] border border-[#0ecb6f]/30 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-14 h-14 object-cover rounded-lg border-2 border-[#0ecb6f]/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {file?.name}
              </p>
              <p className="text-[#555] text-xs mt-0.5">
                {formatFileSize(file?.size)}
              </p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-[#0ecb6f] bg-[#0ecb6f]/10 px-2 py-0.5 rounded-full">
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
          className={`border-2 border-dashed rounded-xl p-8 cursor-pointer
            flex flex-col items-center justify-center gap-2 transition-all
            ${
              error
                ? "border-red-500/50 bg-red-500/5"
                : isDragging
                ? "border-[#0ecb6f] bg-[#0ecb6f]/5"
                : "border-[#2a2c2f] bg-[#111214] hover:border-[#0ecb6f]/50 hover:bg-[#0ecb6f]/5"
            }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#0ecb6f]/10 flex items-center justify-center">
            <span className="text-[#0ecb6f] text-xl">↑</span>
          </div>
          <p className="text-white text-sm font-medium">
            {isDragging ? "Drop file here" : "Click or drag to upload"}
          </p>
          <p className="text-[#555] text-xs">
            {hint} (Max {maxSize}MB)
          </p>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default FileUpload;