// src/features/team/MemberCard.jsx
import React from "react";
import {
  Mail, Phone, Calendar, UserCheck, Link, CheckCircle, XCircle,
} from "lucide-react";
import { formatDate, formatAmount, getTotalInvestment } from "../../utils/dateUtils";
import { InvestmentSection } from "./MemberDetailModal";

const MemberCard = ({ member, isActive = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 mb-3 cursor-pointer transition-all duration-300
        hover:border-[#b9fd5c]/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#b9fd5c]/10
        ${isActive
          ? "bg-white/[0.02] border border-[#b9fd5c]/15 opacity-100"
          : "bg-white/[0.01] border border-white/5 opacity-70"
        }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Info */}
        <div className="lg:col-span-5 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                  isActive ? "bg-[#b9fd5c]" : "bg-[#333]"
                }`}
              >
                {(member.name || "U")[0].toUpperCase()}
              </div>
              <div>
                <h4 className="text-white font-semibold text-[15px]">
                  {member.name}
                </h4>
                <span className="text-[#b9fd5c] text-xs font-medium">
                  @{member.username}
                </span>
              </div>
            </div>
            <span
              className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${
                isActive
                  ? "bg-[#0ecb6f]/10 text-[#0ecb6f]"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Info Rows */}
          <div className="space-y-2">
            <InfoRow icon={<Mail size={11} />} text={member.email} />
            <InfoRow icon={<Phone size={11} />} text={`+91 ${member.phone}`} />
            <InfoRow
              icon={<Calendar size={11} />}
              text={`Registered: ${formatDate(member.registeredDate)}`}
            />
            {member.activeDate && (
              <InfoRow
                icon={<UserCheck size={11} />}
                text={`Activated: ${formatDate(member.activeDate)}`}
                color="text-[#0ecb6f]"
              />
            )}
            <InfoRow icon={<Link size={11} />} text={`Ref: ${member.referenceId}`} />
          </div>
        </div>

        {/* Right: Investments */}
        <div className="lg:col-span-7">
          <InvestmentSection investments={member.investments} />
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, text, color = "text-[#b9fd5c]" }) => (
  <div className="flex items-center gap-2 text-white/50 text-[13px]">
    <span className={`flex-shrink-0 ${color}`}>{icon}</span>
    <span className="truncate">{text}</span>
  </div>
);

export default MemberCard;