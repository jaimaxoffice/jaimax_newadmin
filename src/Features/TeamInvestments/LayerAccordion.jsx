// src/features/team/LayerAccordion.jsx
import React from "react";
import {
  ChevronDown, UserCheck, UserX, Banknote,
} from "lucide-react";
import { formatAmount, getTotalInvestment, sortMembers } from "../../utils/dateUtils";
import MemberCard from "./MemberCard";

const LayerAccordion = ({
  layerNum,
  layerData,
  isExpanded,
  onToggle,
  activeTab,
  sortBy,
  sortOrder,
  onMemberClick,
}) => {
  const hasMembers =
    (layerData.active?.length || 0) > 0 || (layerData.inactive?.length || 0) > 0;
  if (!hasMembers) return null;

  const filteredActive =
    activeTab === "inactive" ? [] : sortMembers(layerData.active || [], sortBy, sortOrder);
  const filteredInactive =
    activeTab === "active" ? [] : sortMembers(layerData.inactive || [], sortBy, sortOrder);

  if (filteredActive.length === 0 && filteredInactive.length === 0) return null;

  let layerInvestment = 0;
  (layerData.active || []).forEach((m) => {
    layerInvestment += getTotalInvestment(m.investments);
  });

  return (
    <div
      className={`rounded-2xl mb-3 overflow-hidden transition-all duration-300 ${
        isExpanded
          ? "bg-[#1b232d] border border-[#eb660f]/25"
          : "bg-[#1b232d] border border-[#2a2c2f]"
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-6 py-4 cursor-pointer
          transition-colors ${isExpanded ? "bg-[#eb660f]/5 border-b border-[#eb660f]/12" : ""}`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-9 h-9 rounded-xl bg-[#eb660f] flex items-center justify-center text-white font-extrabold text-[15px]">
            {layerNum}
          </span>
          <span className="text-white text-base font-semibold">
            Layer {layerNum}
          </span>

          <div className="flex gap-2 flex-wrap">
            <Badge icon={<UserCheck size={10} />} color="bg-[#0ecb6f]/10 text-[#0ecb6f]">
              {layerData.active?.length || 0} Active
            </Badge>
            {(layerData.inactive?.length || 0) > 0 && (
              <Badge icon={<UserX size={10} />} color="bg-red-500/10 text-red-400">
                {layerData.inactive.length} Inactive
              </Badge>
            )}
            {layerInvestment > 0 && (
              <Badge icon={<Banknote size={10} />} color="bg-[#eb660f]/10 text-[#eb660f]">
                {formatAmount(layerInvestment)}
              </Badge>
            )}
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`text-[#eb660f] transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-5 animate-fadeIn">
          {filteredActive.map((member) => (
            <MemberCard
              key={member._id}
              member={member}
              isActive={true}
              onClick={() => onMemberClick({ ...member, isActive: true })}
            />
          ))}
          {filteredInactive.map((member) => (
            <MemberCard
              key={member._id}
              member={member}
              isActive={false}
              onClick={() => onMemberClick({ ...member, isActive: false })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Badge = ({ icon, color, children }) => (
  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold ${color}`}>
    {icon}
    {children}
  </span>
);

export default LayerAccordion;