import React, { useState } from "react";
import { User, RefreshCw, CheckCircle2 } from "lucide-react"; // Or your preferred icon library
import { useConvertWpToNormalStakingMutation } from "./wpStakingApiSlice";

const ConvertWpStakingBar = ({ walletId }) => {
  const [username, setUsername] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [convertStaking, { isLoading }] = useConvertWpToNormalStakingMutation();

  const handleConvert = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!username.trim()) return;

    try {
      // Pass both walletId (if applicable) and username based on previous requirements
      await convertStaking({ 
        walletId, 
        username: username.trim() 
      }).unwrap();

      setSuccessMessage(`Successfully converted staking for ${username.trim()}`);
      setUsername(""); // Clear input
    } catch (err) {
      setErrorMessage(
        err?.data?.message || "Error processing conversion. Please try again."
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && username.trim() && !isLoading) {
      handleConvert();
    }
  };

  return (
    <div className="bg-[#282f35] rounded-[5px] p-5 mb-6">
      <div className="flex flex-col items-center gap-4">
        
        {/* Input Field exactly like your template */}
        <div className="relative w-full max-w-xs">
          <User
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errorMessage || successMessage) {
                setErrorMessage("");
                setSuccessMessage("");
              }
            }}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="w-full bg-[#111827] text-white rounded-lg 
              pl-10 pr-4 py-2.5 text-sm text-center focus:outline-none focus:border-[#b9fd5c] 
              focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors placeholder-gray-500"
          />
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleConvert}
            disabled={isLoading || !username.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#b9fd5c] hover:bg-[#a8e652] 
              text-black font-semibold rounded-lg text-sm transition-colors 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> */}
            {isLoading ? "Converting..." : "Convert to Normal Staking"}
          </button>
        </div>
      </div>

      {/* Error Alert matching your structure */}
      {errorMessage && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center animate-fadeIn">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="mt-4 bg-[#b9fd5c]/10 border border-[#b9fd5c]/20 rounded-lg px-4 py-3 text-center flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-[#b9fd5c]" />
          <p className="text-[#b9fd5c] text-sm font-medium">{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ConvertWpStakingBar;