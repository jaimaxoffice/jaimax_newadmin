// src/components/StatCard.jsx
import React from "react";

const StatCard = ({
  title,
  value,
  image,
  icon,        // ← can be JSX element OR component reference
  iconBg = "",
  bgClass = "",
  valueClass = "",
}) => {

  // ✅ Detect if icon is a JSX element or a component reference
  const renderIcon = () => {
    if (!icon) return null;

    // If it's already a JSX element (React element)
    if (React.isValidElement(icon)) {
      return icon;
    }

    // If it's a component reference
    const Icon = icon;
    return <Icon className="w-full h-full" />;
  };

  return (
    <div
      className={`
        rounded-lg p-3 sm:p-4 md:p-5 transition-all duration-300 hover:scale-[1.02]
        flex items-center gap-3 sm:gap-4
        w-full min-w-0
        ${bgClass || "bg-[#282f35]  hover:border-[#0ecb6f]/30"}
      `}
    >
      {/* Icon / Image */}
      {(image || icon) && (
        <div
          className={`
            rounded-lg p-2 sm:p-2.5 md:p-3 shrink-0 
            ${image ? "bg-[#000000]" : iconBg}
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
            <div className="w-15 h-15  p-3   flex items-center justify-center bg-[#000000] text-[#b9fd5c] rounded-lg ">
              {/* ✅ Handles both JSX and component reference */}
              {renderIcon()}
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