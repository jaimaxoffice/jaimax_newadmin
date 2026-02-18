// // src/components/StatCard.jsx
// import React from "react";

// const StatCard = ({
//   title,
//   value,
//   image,
//   icon,
//   iconBg = "",
//   bgClass = "",
//   valueClass = "",
// }) => {
//   return (
//     <div
//       className={`
//         rounded-lg p-3 sm:p-4 md:p-5 transition-all duration-300 hover:scale-[1.02]
//         flex items-center gap-3 sm:gap-4
//         w-full min-w-0
//         ${bgClass || "bg-[#282f35] border border-[#303f50] hover:border-[#0ecb6f]/30"}
//       `}
//     >
//       {/* Icon / Image */}
//       {(image || icon) && (
//         <div
//           className={`
//             rounded-lg p-2 sm:p-2.5 md:p-3 shrink-0
//             ${image ? "bg-[#66462a]" : iconBg}
//           `}
//         >
//           {image ? (
//             <img
//               src={image}
//               alt={title}
//               className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain"
//               loading="lazy"
//             />
//           ) : (
//             <div className="w-5 h-5 sm:w-9 sm:h-9 md:w-7 md:h-7 lg:w-8 lg:h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
//               {icon}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Text Content */}
//       <div className="min-w-0 flex-1">
//         <h2
//           className={`
//             text-lg sm:text-xl md:text-2xl font-bold truncate
//             ${valueClass || "text-white"}
//           `}
//         >
//           {value}
//         </h2>
//         <p className="text-[#ffffff] text-xs sm:text-sm font-medium mt-0.5 sm:mt-1 truncate">
//           {title}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default StatCard;



// src/components/StatCard.jsx
import React from "react";

const variants = {
  pending: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
    ghostColor: "text-amber-400/[0.06]",
    dotColor: "bg-amber-400",
  },
  completed: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
    ghostColor: "text-emerald-400/[0.06]",
    dotColor: "bg-emerald-400",
  },
  hold: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-sky-400",
    iconBg: "bg-sky-400/10",
    ghostColor: "text-sky-400/[0.06]",
    dotColor: "bg-sky-400",
  },
  failed: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-rose-400",
    iconBg: "bg-rose-400/10",
    ghostColor: "text-rose-400/[0.06]",
    dotColor: "bg-rose-400",
  },
  blue: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/10",
    ghostColor: "text-blue-400/[0.06]",
    dotColor: "bg-blue-400",
  },
  green: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
    ghostColor: "text-emerald-400/[0.06]",
    dotColor: "bg-emerald-400",
  },
  red: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-red-400",
    iconBg: "bg-red-400/10",
    ghostColor: "text-red-400/[0.06]",
    dotColor: "bg-red-400",
  },
  yellow: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-400/10",
    ghostColor: "text-yellow-400/[0.06]",
    dotColor: "bg-yellow-400",
  },
  purple: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-400/10",
    ghostColor: "text-purple-400/[0.06]",
    dotColor: "bg-purple-400",
  },
  orange: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-400/10",
    ghostColor: "text-orange-400/[0.06]",
    dotColor: "bg-orange-400",
  },
  lime: {
    bg: "bg-[#282f35]",
    border: "border-[#303f50]",
    iconColor: "text-[#b9fd5c]",
    iconBg: "bg-[#b9fd5c]/10",
    ghostColor: "text-[#b9fd5c]/[0.06]",
    dotColor: "bg-[#b9fd5c]",
  },
};

const StatCard = ({
  title,
  value,
  image,
  icon,
  variant = "blue",
}) => {
  const v = variants[variant] || variants.blue;

  // ✅ Detect if icon is JSX element or component reference
  const isJSX = React.isValidElement(icon);
  const IconComponent = isJSX ? null : icon;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border ${v.border} ${v.bg}
        p-4 sm:p-5 transition-all duration-300
        hover:scale-[1.02] group cursor-default
        w-full min-w-0
      `}
    >
      {/* ── Ghost Icon — bottom right transparent ── */}
      {IconComponent && !image && (
        <div
          className={`
            absolute -bottom-4 -right-4 ${v.ghostColor}
            transition-all duration-500
            group-hover:-bottom-2 group-hover:-right-2
          `}
        >
          <IconComponent
            size={110}
            strokeWidth={1.5}
            className="transition-transform duration-500 
              group-hover:rotate-[-6deg] group-hover:scale-110"
          />
        </div>
      )}

      {/* ── Ghost for JSX icon — bottom right transparent ── */}
      {isJSX && !image && (
        <div
          className={`
            absolute -bottom-4 -right-4 ${v.ghostColor}
            transition-all duration-500
            group-hover:-bottom-2 group-hover:-right-2
            [&>svg]:w-28 [&>svg]:h-28 [&>svg]:stroke-[1.5]
          `}
        >
          {React.cloneElement(icon, {
            size: 110,
            strokeWidth: 1.5,
            className: `transition-transform duration-500 
              group-hover:rotate-[-6deg] group-hover:scale-110`,
          })}
        </div>
      )}

      {/* ── Ghost Image ── */}
      {image && (
        <div
          className="absolute -bottom-4 -right-4 opacity-[0.4]
            transition-all duration-500
            group-hover:-bottom-2 group-hover:-right-2"
        >
          <img
            src={image}
            alt=""
            className="w-28 h-28 object-contain 
              transition-transform duration-500 
              group-hover:rotate-[-6deg] group-hover:scale-110"
          />
        </div>
      )}

      {/* ── Content ── */}
      <div className="relative z-10 flex items-start gap-3 sm:gap-4">
        {/* Icon Badge — Component Reference */}
        {IconComponent && !image && (
          <div
            className={`
              w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0
              ${v.iconBg} ${v.iconColor}
              flex items-center justify-center
              ring-1 ring-white/5
            `}
          >
            <IconComponent size={20} strokeWidth={2} />
          </div>
        )}

        {/* Icon Badge — JSX Element */}
        {isJSX && !image && (
          <div
            className={`
              w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0
              ${v.iconBg} ${v.iconColor}
              flex items-center justify-center
              ring-1 ring-white/5
              [&>svg]:w-5 [&>svg]:h-5
            `}
          >
            {icon}
          </div>
        )}

        {/* Image Badge */}
        {/* {image && (
          <div className="rounded-xl p-2 sm:p-2.5 bg-[#66462a] shrink-0">
            <img
              src={image}
              alt={title}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              loading="lazy"
            />
          </div>
        )} */}

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-none mb-1 truncate">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${v.dotColor} shrink-0`} />
            <p className="text-xs text-gray-400 font-medium truncate">
              {title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;