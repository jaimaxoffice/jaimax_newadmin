// NoDataMascot.jsx
import React from "react";
import { RefreshCw } from "lucide-react";

const NoDataMascot = ({
  title = "Oops! Nothing here",
  message = "We couldn't find any data matching your criteria.",
  onAction,
  actionLabel = "Refresh",
  showAction = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Mascot Illustration */}
      <div className="relative mb-6">
        <svg
          viewBox="0 0 200 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-52 h-44"
        >
          {/* Shadow */}
          <ellipse cx="100" cy="165" rx="50" ry="8" fill="#1a2128" />

          {/* Body */}
          <rect
            x="55"
            y="60"
            width="90"
            height="100"
            rx="12"
            fill="#282f35"
            stroke="#b9fd5c"
            strokeWidth="2"
          />

          {/* Face */}
          <rect
            x="65"
            y="70"
            width="70"
            height="50"
            rx="8"
            fill="#1a2128"
          />

          {/* Eyes - Sad */}
          <circle cx="85" cy="90" r="6" fill="#b9fd5c" />
          <circle cx="115" cy="90" r="6" fill="#b9fd5c" />
          <circle cx="86" cy="88" r="2" fill="#1a2128" />
          <circle cx="116" cy="88" r="2" fill="#1a2128" />

          {/* Sad mouth */}
          <path
            d="M90 108 Q100 102 110 108"
            stroke="#b9fd5c"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Antenna */}
          <line
            x1="100"
            y1="60"
            x2="100"
            y2="40"
            stroke="#b9fd5c"
            strokeWidth="2"
          />
          <circle cx="100" cy="35" r="6" fill="#b9fd5c" className="animate-pulse" />

          {/* Arms */}
          <rect
            x="35"
            y="85"
            width="20"
            height="8"
            rx="4"
            fill="#282f35"
            stroke="#b9fd5c"
            strokeWidth="1.5"
          />
          <rect
            x="145"
            y="85"
            width="20"
            height="8"
            rx="4"
            fill="#282f35"
            stroke="#b9fd5c"
            strokeWidth="1.5"
          />

          {/* Empty document icon on body */}
          <rect
            x="80"
            y="130"
            width="40"
            height="25"
            rx="3"
            fill="#1a2128"
            stroke="#b9fd5c"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line x1="88" y1="138" x2="112" y2="138" stroke="#b9fd5c" strokeWidth="1" opacity="0.5" />
          <line x1="88" y1="145" x2="105" y2="145" stroke="#b9fd5c" strokeWidth="1" opacity="0.5" />
        </svg>

        {/* Floating particles */}
        <div className="absolute top-0 left-8 w-2 h-2 bg-[#b9fd5c]/40 rounded-full animate-ping" />
        <div className="absolute top-8 right-4 w-1.5 h-1.5 bg-[#b9fd5c]/30 rounded-full animate-ping" 
          style={{ animationDelay: "0.5s" }} 
        />
      </div>

      {/* Text */}
      <h3 className="text-white text-xl font-bold mb-2 text-center">
        {title}
      </h3>
      <p className="text-gray-400 text-sm text-center max-w-xs mb-6">
        {message}
      </p>

      {/* Action */}
      {showAction && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 bg-[#b9fd5c] text-black font-semibold 
            px-6 py-3 rounded-xl hover:bg-[#a8ec4b] active:scale-95 
            transition-all cursor-pointer"
        >
          <RefreshCw size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default NoDataMascot;