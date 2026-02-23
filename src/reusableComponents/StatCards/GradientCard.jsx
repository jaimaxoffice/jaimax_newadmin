function StatCard({ icon: Icon, value, title, variant = "lime", trend, trendValue }) {
  const variants = {
    blue: {
      bg: "bg-[#282f35]",
      border: "border-white/5",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-400/10",
      ghostColor: "text-blue-400/[0.06]",
      dotColor: "bg-blue-400",
      glowColor: "bg-blue-400/20",
      valueColor: "text-white",
    },
    green: {
      bg: "bg-[#282f35]",
      border: "border-white/5",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-400/10",
      ghostColor: "text-emerald-400/[0.06]",
      dotColor: "bg-emerald-400",
      glowColor: "bg-emerald-400/20",
      valueColor: "text-white",
    },
    yellow: {
      bg: "bg-[#282f35]",
      border: "border-white/5",
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-400/10",
      ghostColor: "text-yellow-400/[0.06]",
      dotColor: "bg-yellow-400",
      glowColor: "bg-yellow-400/20",
      valueColor: "text-white",
    },
    lime: {
      bg: "bg-[#282f35]",
      border: "border-white/5",
      iconColor: "text-[#b9fd5c]",
      iconBg: "bg-[#b9fd5c]/10",
      ghostColor: "text-[#b9fd5c]/[0.06]",
      dotColor: "bg-[#b9fd5c]",
      glowColor: "bg-[#b9fd5c]/20",
      valueColor: "text-[#b9fd5c]",
    },
    purple: {
      bg: "bg-[#282f35]",
      border: "border-white/5",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-400/10",
      ghostColor: "text-purple-400/[0.06]",
      dotColor: "bg-purple-400",
      glowColor: "bg-purple-400/20",
      valueColor: "text-white",
    },
    red: {
      bg: "bg-[#282f35]",
      border: "border-white/5",
      iconColor: "text-red-400",
      iconBg: "bg-red-400/10",
      ghostColor: "text-red-400/[0.06]",
      dotColor: "bg-red-400",
      glowColor: "bg-red-400/20",
      valueColor: "text-white",
    },
  };

  const v = variants[variant] || variants.lime;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border ${v.border} ${v.bg}
        p-4 sm:p-5 md:p-6 group cursor-default
        transition-all duration-300
        hover:border-white/10 hover:shadow-lg hover:shadow-black/20
        min-h-[100px] sm:min-h-[120px]
      `}
    >
      {/* Subtle Glow Effect on Hover */}
      <div 
        className={`
          absolute -top-10 -right-10 w-24 h-24 ${v.glowColor} 
          rounded-full blur-2xl opacity-0 
          transition-opacity duration-500 group-hover:opacity-100
        `} 
      />

      {/* Ghost Icon - Bottom Right */}
      {/* <div
        className={`
          absolute -bottom-4 -right-4 sm:-bottom-3 sm:-right-5 ${v.ghostColor}
          transition-all duration-500 ease-out
          group-hover:-bottom-2 group-hover:-right-2
        `}
      >
        <Icon
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-110"
          strokeWidth={1.5}
        />
      </div> */}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon Badge */}
        <div className={`${v.iconBg} ${v.iconColor} w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
        </div>

        {/* Title */}
        <p className="text-[8px] sm:text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
          {title}
        </p>

        {/* Value */}
        <p className={`text-xl sm:text-2xl md:text-xl font-bold leading-none ${v.valueColor}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {/* Optional Trend */}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
            <span className="text-[10px] text-gray-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;