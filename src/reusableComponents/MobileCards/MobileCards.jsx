// src/reusableComponents/Cards/MobileCard.jsx
import React from "react";

const MobileCard = ({
  header,
  rows,
  actions,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-xl p-4 space-y-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2a2c2f]" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-[#2a2c2f] rounded" />
            <div className="h-3 w-20 bg-[#2a2c2f] rounded" />
          </div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-20 bg-[#2a2c2f] rounded" />
            <div className="h-3 w-24 bg-[#2a2c2f] rounded" />
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 h-9 bg-[#2a2c2f] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-xl overflow-hidden">
      {/* Header */}
      {header && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#16181b]">
          <div className="flex items-center gap-3">
            {header.avatar && (
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold
                ${header.avatarBg || "bg-[#0ecb6f]/10 text-lime-400"}`}
              >
                {header.avatar}
              </div>
            )}
            <div>
              {header.title && (
                <p className="text-white text-sm font-medium">{header.title}</p>
              )}
              {header.subtitle && (
                <p className="text-[#555] text-xs">{header.subtitle}</p>
              )}
            </div>
          </div>
          {header.badge && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${header.badgeClass}`}
            >
              {header.badge}
            </span>
          )}
        </div>
      )}

      {/* Rows */}
      {rows && rows.length > 0 && (
        <div className="px-4 py-3 space-y-2.5">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-[#8a8d93]">{row.label}</span>
              {row.custom ? (
                row.custom
              ) : (
                <span
                  className={`text-xs text-right truncate max-w-[60%] ${
                    row.highlight
                      ? "text-[#0ecb6f] font-semibold"
                      : "text-white"
                  }`}
                >
                  {row.value || "—"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex border-t border-[#2a2c2f]">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed
                ${i < actions.length - 1 ? "border-r border-[#2a2c2f]" : ""}
                ${action.className || "text-[#8a8d93] hover:bg-[#ffffff08]"}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileCard;