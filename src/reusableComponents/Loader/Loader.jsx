// src/components/Loader.jsx
import React from "react";

const Loader = () => {
  return (
    <>
      {/* Full-screen overlay */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        {/* CSS Loader only */}
        <div
          className="drop-shadow-[0_0_12px_rgba(235,102,15,0.45)]"
          style={{
            width: "55px",
            aspectRatio: "1",
            ["--g1"]:
              "conic-gradient(from 90deg at top 3px left 3px,#0000 90deg,#ffff 0)",
            ["--g2"]:
              "conic-gradient(from -90deg at bottom 3px right 3px,#0000 90deg,#ffff 0)",
            background:
              "var(--g1),var(--g1),var(--g1),var(--g1),var(--g2),var(--g2),var(--g2),var(--g2)",
            backgroundPosition: "0 0,100% 0,100% 100%,0 100%",
            backgroundSize: "25px 25px",
            backgroundRepeat: "no-repeat",
            animation: "l11 1.5s linear infinite",
          }}
        />
      </div>

      {/* Keyframes (same file) */}
      <style>{`
        @keyframes l11 {
          0%   {background-size:35px 15px,15px 15px,15px 35px,35px 35px}
          25%  {background-size:35px 35px,15px 35px,15px 15px,35px 15px}
          50%  {background-size:15px 35px,35px 35px,35px 15px,15px 15px}
          75%  {background-size:15px 15px,35px 15px,35px 35px,15px 35px}
          100% {background-size:35px 15px,15px 15px,15px 35px,35px 35px}
        }
      `}</style>
    </>
  );
};

export default Loader;
