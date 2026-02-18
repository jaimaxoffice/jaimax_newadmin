// src/components/Loader.jsx
import React from "react";
import logo from "/logo.png";

const Loader = () => {
  return (
    <>
      {/* Full-screen overlay */}
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        {/* Loader Card */}
        <div className="flex flex-col items-center justify-center gap-8 p-10 rounded-2xl">
          {/* Single Orbit with Logo */}
          <div className="relative w-28 h-28">
            {/* Single Orbit Ring */}
            <div
              className="absolute inset-0 rounded-full border-[3px] border-transparent"
              style={{
                borderTopColor: "#eb660f",
                borderRightColor: "#eb660f",
                animation: "loaderSpin 1.2s linear infinite",
              }}
            />

            {/* Orbiting Dot */}
            <div
              className="absolute inset-0"
              style={{ animation: "loaderSpin 1.2s linear infinite" }}
            >
              
            </div>

            {/* Center Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={logo}
                alt="Loading..."
                className="w-20 h-20 object-contain rounded-full"
                style={{
                  animation: "loaderPulse 2s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          {/* Animated Text */}
          <div className="flex items-center gap-1">
            {"Loading".split("").map((char, i) => (
              <span
                key={i}
                className="text-base font-semibold tracking-widest"
                style={{
                  color: "#eb660f",
                  textShadow: "0 0 10px #eb660f55",
                  animation: `loaderBounce 1.4s ease-in-out ${i * 0.1}s infinite`,
                }}
              >
                {char}
              </span>
            ))}
            {[0, 1, 2].map((i) => (
              <span
                key={`dot-${i}`}
                className="text-base font-bold"
                style={{
                  color: "#eb660f",
                  textShadow: "0 0 10px #eb660f55",
                  animation: `loaderBounce 1.4s ease-in-out ${0.7 + i * 0.15}s infinite`,
                }}
              >
                .
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes loaderSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes loaderPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes loaderBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Loader;