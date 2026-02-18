function StatCard({ icon: Icon, value, title, variant = "blue" }) {
  const variants = {
    blue: {
      bg: "bg-[#282f35]",
      border: "border-[#2a2a2a]",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-400/10",
      ghostColor: "text-blue-400/[0.08]",
      dotColor: "bg-blue-400",
    },
   
    green: {
      bg: "bg-[#282f35]",
      border: "border-[#2a2a2a]",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-400/10",
      ghostColor: "text-emerald-400/[0.08]",
      dotColor: "bg-emerald-400",
    },
    yellow: {
      bg: "bg-[#282f35]",
      border: "border-[#2a2a2a]",
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-400/10",
      ghostColor: "text-yellow-400/[0.08]",
      dotColor: "bg-yellow-400",
    },
    // Add to StatCard variants object:
lime: {
  bg: "bg-[#1a1a1a]",
  border: "border-[#2a2a2a]",
  iconColor: "text-[#b9fd5c]",
  iconBg: "bg-[#b9fd5c]/10",
  ghostColor: "text-[#b9fd5c]/[0.08]",
  dotColor: "bg-[#b9fd5c]",
},
  };

  const v = variants[variant] || variants.blue;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border ${v.border} ${v.bg}
        p-4 sm:p-5 group cursor-default
      `}
    >
      {/* ── Transparent ghost icon — bottom right ── */}
      <div
        className={`
          absolute -bottom-5 -right-5 ${v.ghostColor}
          transition-all duration-500
          group-hover:-bottom-3 group-hover:-right-3
        `}
      >
        <Icon
          size={120}
          strokeWidth={2.5}
          className="transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-110"
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10">
        {/* Icon badge */}
        <div
          className={`
            w-9 h-9 rounded-lg ${v.iconBg} ${v.iconColor}
            flex items-center justify-center mb-3
          `}
        >
          <Icon size={18} strokeWidth={2.5} />
        </div>

        {/* Value */}
        <p className="text-2xl sm:text-3xl font-bold text-white leading-none mb-1">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {/* Title */}
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${v.dotColor}`} />
          <p className="text-xs text-gray-400 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );
}

export default StatCard;