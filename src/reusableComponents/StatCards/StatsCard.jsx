// // src/components/StatCard.jsx
// import React from "react";

// const StatCard = ({ title, value, image, bgClass = "", valueClass = "" }) => {
//   return (
//     <div
//       className={`
//         rounded-lg  p-5 transition-all duration-300 hover:scale-[1.02]
//         flex items-center gap-4
//         ${bgClass || "bg-[#1b232d] border border-[#303f50] hover:border-[#0ecb6f]/30"}
//       `}
//     >
//       {/* Image */}
//       {image && (
//         <div className="bg-[#232d3a] rounded-lg p-3 shrink-0">
//           <img
//             src={image}
//             alt={title}
//             className="w-10 h-10 md:w-12 md:h-12 object-contain"
//             loading="lazy"
//           />
//         </div>
//       )}

//       {/* Data */}
//       <div>
//         <h2 className={`text-2xl font-bold ${valueClass || "text-white"}`}>
//           {value}
//         </h2>
//         <p className="text-[#ffffff] text-sm font-medium mt-1">{title}</p>
//       </div>
//     </div>
//   );
// };

// export default StatCard;

import React from "react";

const StatCard = ({ title, value, image, icon, iconBg = "", bgClass = "", valueClass = "" }) => {
  return (
    <div
      className={`
        rounded-lg p-5 transition-all duration-300 hover:scale-[1.02]
        flex items-center gap-4
        ${bgClass || "bg-[#1b232d] border border-[#303f50] hover:border-[#0ecb6f]/30"}
      `}
    >
      {(image || icon) && (
        <div className={`rounded-lg p-3 shrink-0 ${image ? "bg-[#66462a]" : iconBg}`}>
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
              loading="lazy"
            />
          ) : (
            icon
          )}
        </div>
      )}

      <div>
        <h2 className={`text-2xl font-bold ${valueClass || "text-white"}`}>
          {value}
        </h2>
        <p className="text-[#ffffff] text-sm font-medium mt-1">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;