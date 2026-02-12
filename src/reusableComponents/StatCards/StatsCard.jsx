// src/components/StatCard.jsx
import React from "react";

const StatCard = ({ title, value, image }) => {
  return (
    <div
      className="
        bg-[#1b232d] border border-[#2a2c2f] rounded-2xl p-5
        hover:border-[#0ecb6f]/30 transition-all duration-300
        flex items-center gap-4
      "
    >
      {/* Image */}
      {image && (
        <div className="bg-[#232d3a] rounded-xl p-3 flex-shrink-0">
          <img
            src={image}
            alt={title}
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
        </div>
      )}

      {/* Data */}
      <div>
        <h2 className="text-2xl font-bold text-white">{value}</h2>
        <p className="text-[#8a8d93] text-sm font-medium mt-1">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;