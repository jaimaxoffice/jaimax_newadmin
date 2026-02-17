// src/components/Loader.jsx
import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Orbital Loader */}
      <div className="relative w-20 h-20">
        {/* Orbit Ring 1 */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "#eb660f",
            borderRightColor: "#eb660f",
            animation: "spin 1.2s linear infinite",
          }}
        />

        {/* Orbit Ring 2 */}
        <div
          className="absolute inset-2 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: "#ff8c42",
            borderLeftColor: "#ff8c42",
            animation: "spin 0.8s linear infinite reverse",
          }}
        />

        {/* Orbit Ring 3 */}
        <div
          className="absolute inset-4 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "#eb660f",
            borderLeftColor: "#eb660f",
            animation: "spin 1.5s linear infinite",
          }}
        />

        {/* Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #eb660f 0%, #ff8c42 50%, transparent 70%)",
              boxShadow: "0 0 20px #eb660f, 0 0 40px #eb660f55",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Orbiting Dot 1 */}
        <div
          className="absolute inset-0"
          style={{ animation: "spin 2s linear infinite" }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#eb660f]"
            style={{ boxShadow: "0 0 8px #eb660f" }}
          />
        </div>

        {/* Orbiting Dot 2 */}
        <div
          className="absolute inset-0"
          style={{ animation: "spin 2s linear infinite reverse" }}
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#ff8c42]"
            style={{ boxShadow: "0 0 6px #ff8c42" }}
          />
        </div>
      </div>

      {/* Animated Text */}
      <div className="flex items-center gap-1">
        {"Loading".split("").map((char, i) => (
          <span
            key={i}
            className="text-sm font-semibold tracking-widest"
            style={{
              color: "#eb660f",
              animation: `bounce 1.4s ease-in-out ${i * 0.1}s infinite`,
            }}
          >
            {char}
          </span>
        ))}
        {[0, 1, 2].map((i) => (
          <span
            key={`dot-${i}`}
            className="text-sm font-bold"
            style={{
              color: "#eb660f",
              animation: `bounce 1.4s ease-in-out ${0.7 + i * 0.15}s infinite`,
            }}
          >
            .
          </span>
        ))}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Loader;