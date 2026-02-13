import React, { useState, useEffect, useRef } from "react";

const Logout = ({ onLogout, userName = "User", userEmail = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) {
        await onLogout();
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsLoggingOut(false);
        setIsModalOpen(false);
      }
    }
  };

  return (
    <>
      {/* Logout Trigger Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                   bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20
                   hover:border-red-500/40 transition-all duration-200 cursor-pointer"
      >
        <LogoutIcon />
        <span>Logout</span>
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !isLoggingOut && setIsModalOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-sm bg-[#1b232d] border border-[#2a2c2f]
                        rounded-2xl overflow-hidden shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Line */}
            <div className="h-1 bg-gradient-to-r from-red-500 via-red-400 to-orange-500" />

            {/* Icon & Title */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              <div
                className="w-16 h-16 rounded-full bg-red-500/10 flex items-center
                            justify-center mb-4"
              >
                <LogoutLargeIcon />
              </div>
              <h2 className="text-white text-lg font-semibold mb-1">
                Confirm Logout
              </h2>
              <p className="text-[#8a8d93] text-sm text-center">
                Are you sure you want to log out?
              </p>
            </div>

            {/* User Info */}
            {(userName || userEmail) && (
              <div className="mx-6 mb-4 p-3 bg-[#111214] border border-[#2a2c2f] rounded-xl">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full bg-[#eb660f]/10 flex items-center
                                justify-center text-[#eb660f] font-semibold text-sm shrink-0"
                  >
                    {(userName?.charAt(0) || "U").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {userName}
                    </p>
                    {userEmail && (
                      <p className="text-[#8a8d93] text-xs truncate">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="mx-6 mb-6 flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
              <div className="shrink-0 mt-0.5">
                <WarningIcon />
              </div>
              <p className="text-yellow-400/80 text-xs leading-relaxed">
                You will be signed out of your account and redirected to the
                login page.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                           bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                           hover:text-white hover:border-[#3a3c3f]
                           transition-colors cursor-pointer disabled:opacity-50
                           disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                           rounded-xl text-sm font-semibold bg-red-500 text-white
                           hover:bg-red-600 transition-all duration-200 cursor-pointer
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <SpinnerIcon />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogoutIcon />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Logout;

// ─── SVG Icons ───────────────────────────────────────────────────

const LogoutIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const LogoutLargeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ef4444"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#eab308"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    className="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);