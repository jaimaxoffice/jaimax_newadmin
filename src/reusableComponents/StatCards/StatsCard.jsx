// src/components/StatCard.jsx
import React from "react";

const StatCard = ({
  title,
  value,
  image,
  icon,
  iconBg = "",
  bgClass = "",
  valueClass = "",
}) => {
  return (
    <div
      className={`
        rounded-lg p-3 sm:p-4 md:p-5 transition-all duration-300 hover:scale-[1.02]
        flex items-center gap-3 sm:gap-4
        w-full min-w-0
        ${bgClass || "bg-[#282f35] border border-[#303f50] hover:border-[#0ecb6f]/30"}
      `}
    >
      {/* Icon / Image */}
      {(image || icon) && (
        <div
          className={`
            rounded-lg p-2 sm:p-2.5 md:p-3 shrink-0
            ${image ? "bg-[#66462a]" : iconBg}
          `}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-5 h-5 sm:w-9 sm:h-9 md:w-7 md:h-7 lg:w-8 lg:h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
              {icon}
            </div>
          )}
        </div>
      )}

      {/* Text Content */}
      <div className="min-w-0 flex-1">
        <h2
          className={`
            text-lg sm:text-xl md:text-2xl font-bold truncate
            ${valueClass || "text-white"}
          `}
        >
          {value}
        </h2>
        <p className="text-[#ffffff] text-xs sm:text-sm font-medium mt-0.5 sm:mt-1 truncate">
          {title}
        </p>
      </div>
    </div>
  );
};

export default StatCard;