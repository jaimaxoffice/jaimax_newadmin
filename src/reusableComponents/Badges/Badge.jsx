// src/reusableComponents/Badges/Badge.jsx
import React from "react";

const Badge = ({ type = "default", children }) => {
  const styles = {
    success: "bg-[#0ecb6f]/10 text-[#0ecb6f]",
    danger: "bg-red-500/10 text-red-400",
    warning: "bg-yellow-500/10 text-yellow-400",
    info: "bg-blue-500/10 text-blue-400",
    default: "bg-[#2a2c2f] text-[#8a8d93]",
  };

  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${styles[type]}`}
    >
      {children}
    </span>
  );
};

export default Badge;