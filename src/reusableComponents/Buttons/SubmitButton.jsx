// src/reusableComponents/Buttons/SubmitButton.jsx
import React from "react";

const SubmitButton = ({
  label = "Submit",
  loadingLabel = "Processing...",
  isLoading,
  onClick,
  type = "submit",
  fullWidth = true,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`${fullWidth ? "w-full" : ""}
        bg-[#b9fd5c] hover:bg-[#b9fd5c]/90 
        disabled:bg-[#b9fd5c]/50 disabled:cursor-not-allowed
        text-[#111214] font-semibold py-2 rounded-xl 
        transition-all cursor-pointer text-sm
        flex items-center justify-center gap-2 px-4`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-[#111214]/30 border-t-[#111214] rounded-full animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
};

export default SubmitButton;