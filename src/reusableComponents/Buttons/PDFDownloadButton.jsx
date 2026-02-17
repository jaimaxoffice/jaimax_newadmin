// src/reusableComponents/Buttons/PDFDownloadButton.jsx
import React from "react";
import { Download, Eye, Loader } from "lucide-react";

const PDFDownloadButton = ({
  onDownload,
  onPreview,
  isGenerating = false,
  label = "Export PDF",
  showPreview = true,
  size = "lg",
  className = "",
}) => {
  const sizeClasses = {
    sm: "py-1.5 px-3 text-xs",
    md: "py-1 px-4 text-sm",
    lg: "py-2 px-6 text-base",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={onDownload}
        disabled={isGenerating}
        className={`flex items-center gap-2 rounded-xl font-semibold
          bg-[#eb660f] hover:bg-[#ff7b1c] text-white
          transition-colors cursor-pointer disabled:opacity-50
          disabled:cursor-not-allowed ${sizeClasses[size]}`}
      >
        {isGenerating ? (
          <>
            <Loader size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download size={12} />
            {label}
          </>
        )}
      </button>

      {showPreview && (
        <button
          onClick={onPreview}
          disabled={isGenerating}
          className={`flex items-center gap-2 rounded-xl font-semibold
            bg-transparent border border-[#2a2c2f] text-[#8a8d93]
            hover:bg-[#2a2c2f] hover:text-white
            transition-colors cursor-pointer disabled:opacity-50
            ${sizeClasses[size]}`}
        >
          <Eye size={16} />
          Preview
        </button>
      )}
    </div>
  );
};

export default PDFDownloadButton;