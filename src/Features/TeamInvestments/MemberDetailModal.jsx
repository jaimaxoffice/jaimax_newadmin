// src/features/team/MemberDetailModal.jsx
import React from "react";
import Modal from "../../reusableComponents/Modals/Modals";
import {
  Mail, Phone, Calendar, UserCheck, Link, Wallet, Clock, TrendingUp,
} from "lucide-react";
import { formatDate, formatDateTime, formatAmount, getTotalInvestment } from "../../utils/dateUtils";

const MemberDetailModal = ({ isOpen, onClose, member }) => {
  if (!member) return null;

  const details = [
    { icon: Mail, label: "Email", value: member.email },
    { icon: Phone, label: "Phone", value: `+91 ${member.phone}` },
    { icon: Calendar, label: "Registered", value: formatDate(member.registeredDate) },
    { icon: UserCheck, label: "Activated", value: formatDate(member.activeDate) },
    { icon: Link, label: "Reference", value: member.referenceId },
    { icon: Wallet, label: "Total Investment", value: formatAmount(getTotalInvestment(member.investments)) },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Details" size="lg">
      <div className="space-y-5">
        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-[#2a2c2f]">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ${
              member.isActive ? "bg-[#b9fd5c]" : "bg-[#333]"
            }`}
          >
            {(member.name || "U")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg">{member.name}</h3>
            <p className="text-[#b9fd5c] text-sm">@{member.username}</p>
          </div>
          <span
            className={`text-[11px] font-semibold px-3 py-1 rounded-full ${
              member.isActive
                ? "bg-[#0ecb6f]/10 text-[#0ecb6f]"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {member.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {details.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#111214] border border-[#2a2c2f] rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon size={12} className="text-[#b9fd5c]" />
                <span className="text-[#8a8d93] text-[11px] uppercase tracking-wide">
                  {item.label}
                </span>
              </div>
              <p className="text-white text-sm font-semibold truncate">
                {item.value || "N/A"}
              </p>
            </div>
          ))}
        </div>

        {/* Investments */}
        <InvestmentSection investments={member.investments} />
      </div>
    </Modal>
  );
};

export default MemberDetailModal;

// Investment Section (shared between modal and card)
export const InvestmentSection = ({ investments }) => {
  if (!investments || investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[#555]">
        <Wallet size={20} className="mb-2 opacity-40" />
        <span className="text-xs">No investments</span>
      </div>
    );
  }

  return (
    <div className="bg-[#b9fd5c]/5 border border-[#b9fd5c]/15 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <span className="text-[#b9fd5c] text-[13px] font-semibold flex items-center gap-2">
          <TrendingUp size={12} />
          Investments ({investments.length})
        </span>
        <span className="text-[#0ecb6f] text-sm font-bold bg-[#0ecb6f]/10 px-3 py-1 rounded-full">
          {formatAmount(getTotalInvestment(investments))}
        </span>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
        {investments.map((inv, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#b9fd5c] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-[#0ecb6f] font-bold text-sm">
                {formatAmount(inv.amount)}
              </span>
            </div>
            <span className="text-white/40 text-[11px] flex items-center gap-1">
              <Clock size={10} />
              {formatDateTime(inv.transactionDate)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};