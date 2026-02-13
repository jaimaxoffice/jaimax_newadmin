// src/reusableComponents/NoAccess/NoAccess.jsx
import React from "react";

const NoAccess = ({
  title = "Access Denied",
  subtitle = "You don't have permission to access this page.",
  description = "Please contact your administrator if you believe this is an error.",
  showHomeButton = true,
  showBackButton = true,
  homeRoute = "/dashboard",
  onGoHome,
  onGoBack,
  errorCode = "403",
}) => {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = homeRoute;
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          {/* Top Accent */}
          <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />

          {/* Content */}
          <div className="flex flex-col items-center px-6 sm:px-10 pt-10 pb-8">
            {/* Shield Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldIcon />
              </div>

              {/* Pulse Ring */}
              <div
                className="absolute inset-0 w-24 h-24 rounded-full border-2 border-red-500/20
                            animate-ping"
                style={{ animationDuration: "2s" }}
              />

              {/* Error Code Badge */}
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5
                            bg-red-500/10 border border-red-500/20 rounded-full"
              >
                <span className="text-red-400 text-xs font-bold font-mono">
                  {errorCode}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2 text-center">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-[#8a8d93] text-sm sm:text-base text-center mb-4 max-w-sm">
              {subtitle}
            </p>

            {/* Divider */}
            <div className="w-16 h-0.5 bg-[#2a2c2f] rounded-full mb-6" />

            {/* Description Card */}
            <div
              className="w-full p-4 bg-[#111214] border border-[#2a2c2f] rounded-xl
                          flex items-start gap-3 mb-8"
            >
              <div className="shrink-0 mt-0.5">
                <InfoIcon />
              </div>
              <div>
                <p className="text-[#8a8d93] text-xs sm:text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Permissions List */}
            <div className="w-full mb-8">
              <p className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-3">
                Possible Reasons
              </p>
              <div className="space-y-2">
                {[
                  "Your account lacks the required permissions",
                  "Your session may have expired",
                  "This feature is restricted to certain roles",
                ].map((reason, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 shrink-0" />
                    <span className="text-[#8a8d93] text-xs sm:text-sm">
                      {reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              {showBackButton && (
                <button
                  onClick={handleGoBack}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2
                             px-5 py-3 rounded-xl text-sm font-medium
                             bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                             hover:text-white hover:border-[#3a3c3f]
                             transition-all duration-200 cursor-pointer"
                >
                  <BackIcon />
                  Go Back
                </button>
              )}
              {showHomeButton && (
                <button
                  onClick={handleGoHome}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2
                             px-5 py-3 rounded-xl text-sm font-semibold
                             bg-[#eb660f] text-white hover:bg-[#ff8533]
                             transition-all duration-200 cursor-pointer"
                >
                  <HomeIcon />
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="px-6 py-3 border-t border-[#2a2c2f] bg-[#111214]/50">
            <div className="flex items-center justify-center gap-2">
              <LockIcon />
              <span className="text-[#555] text-[11px]">
                Protected by role-based access control
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoAccess;

// ─── SVG Icons ───────────────────────────────────────────────────

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="44"
    height="44"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ef4444"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#eb660f"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const BackIcon = ({ className = "" }) => (
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
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const HomeIcon = ({ className = "" }) => (
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
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#555"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);