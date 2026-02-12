// src/reusableComponents/Alerts/Alert.jsx
import React from "react";

const Alert = ({ type = "success", message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: "bg-[#0ecb6f]/10 border-[#0ecb6f]/20 text-[#0ecb6f]",
    error: "bg-red-500/10 border-red-500/20 text-red-400",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${styles[type]}`}
    >
      <span className="text-base">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;