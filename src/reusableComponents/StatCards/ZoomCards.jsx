
const StatCard = ({
  title,
  value,
  icon: IconComponent,
  gradient,
  isLoading,
}) => (
  <div
    className="relative overflow-hidden rounded-xl p-5 transition-all duration-300 
      hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(242,155,10,0.3)] cursor-pointer"
    style={{
      background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
    }}
  >
    {/* Background Icon */}
    <div className="absolute top-0 right-0 p-3 opacity-25">
      <IconComponent size={60} className="text-white" />
    </div>

    {/* Content */}
    <div className="relative">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <IconComponent size={24} className="text-white" />
        </div>
        <p className="text-white/60 text-sm font-normal">{title}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <h2 className="text-3xl font-bold text-white">{value || 0}</h2>
      )}
    </div>
  </div>
);
export default StatCard;