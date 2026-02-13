// src/features/dashboard/Dashboard.jsx
import React from "react";
import { useGetDetailsQuery } from "./dashboardApiSlice";
import {
  Users,
  Coins,
  Tag,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  DollarSign,
  Link2,
  ArrowDownToLine,
  RefreshCw,
} from "lucide-react";

const formatNumber = (num, decimals = 2) => {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(num));
};

const formatWhole = (num) => {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat("en-IN").format(Number(num));
};

// ─── Stat Card ───
const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, valueBg, valueColor = "text-white" }) => (
  <div className="bg-[#1b232d] rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-200 group">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${iconBg}`}
      >
        <Icon size={14} className={iconColor} />
      </div>
    </div>
    <p className={`text-xl sm:text-2xl font-extrabold leading-tight break-all ${valueColor}`}>
      {value}
    </p>
    {sub && <p className="text-[10px] text-gray-500 mt-1">{sub}</p>}
  </div>
);

// ─── Dual Panel Card ───
const DualCard = ({ label, icon: Icon, inr, usdt, accent = false }) => (
  <div
    className={`rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 ${
      accent
        ? "bg-[#1b232d] border-l-[3px] border-[#eb660f]"
        : "bg-[#1b232d] border border-[#1b232d]"
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <span
        className={`text-[10px] font-semibold uppercase tracking-wider ${
          accent ? "text-[#eb660f]" : "text-white"
        }`}
      >
        {label}
      </span>
      <div className="w-7 h-7 rounded-full bg-[#eb660f] flex items-center justify-center">
        <Icon size={12} className="text-white" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="flex-1 bg-[#111] rounded-lg p-3 text-center">
        <p className="text-[8px] font-bold uppercase text-gray-600 mb-1">INR</p>
        <p className="text-base sm:text-lg font-extrabold text-white break-all leading-tight">
          ₹{inr}
        </p>
      </div>
      <div className="flex-1 bg-[#1f1206] rounded-lg p-3 text-center">
        <p className="text-[8px] font-bold uppercase text-gray-600 mb-1">USDT</p>
        <p className="text-base sm:text-lg font-extrabold text-[#eb660f] break-all leading-tight">
          ${usdt}
        </p>
      </div>
    </div>
  </div>
);

// ─── Balance Card (larger with sub-row) ───
const BalanceCard = ({ label, icon: Icon, value, subLabel, subValue, iconBg, valueColor }) => (
  <div className="bg-[#1b232d] rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex items-center justify-between mb-3">
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${valueColor || "text-white"}`}>
        {label}
      </span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon size={14} className="text-white" />
      </div>
    </div>
    <p className={`text-xl sm:text-2xl font-extrabold leading-tight break-all ${valueColor || "text-white"}`}>
      {value}
    </p>
    {subLabel && (
      <div className="mt-3 bg-[#111] rounded-lg px-3 py-2 flex items-center justify-between">
        <span className="text-[9px] text-gray-600">{subLabel}</span>
        <span className={`text-xs font-bold ${valueColor || "text-gray-400"}`}>
          {subValue}
        </span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const { data: response, isLoading, isError, error, refetch } = useGetDetailsQuery();

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-[3px] border-[#eb660f] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 text-xs mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (isError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-sm w-full text-center">
          <p className="text-gray-500 text-sm mb-4">
            {error?.data?.message || "Failed to load data"}
          </p>
          <button
            onClick={refetch}
            className="bg-[#eb660f] text-white text-xs font-semibold px-5 py-2 rounded-lg hover:bg-[#d45a0d] transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const d = response?.data;
  if (!d) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-600 text-sm">
        No data available
      </div>
    );
  }

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  const username = localStorage.getItem("username");

  return (
    <div className="min-h-screen bg-[#111214] p-2 sm:p-4 lg:p-5">
      {/* ─── Hero ─── */}
      <div className="bg-[#1b232d] rounded-xl p-4 sm:p-5 mb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
              {getGreeting()},{" "}
              <span className="text-[#eb660f]">{username || "Admin"}</span>
            </h1>
            <p className="text-[11px] text-gray-500 mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 bg-[#eb660f] hover:bg-[#d45a0d] text-white text-[11px] font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── Row 1: Quick Stats (4 cols) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3">
        <StatCard
          label="Users"
          value={formatWhole(d.usersCount)}
          sub="Registered"
          icon={Users}
          iconBg="bg-[#252525]"
          iconColor="text-gray-400"
        />
        <StatCard
          label="Tokens Sold"
          value={formatWhole(d.total_token_sale)}
          icon={Coins}
          iconBg="bg-[#2a2a2a]"
          iconColor="text-[#eb660f]"
          valueColor="text-[#eb660f]"
        />
        <StatCard
          label="Token Price"
          value={`₹${d.current_token_price?.INR}`}
          sub={`$${d.current_token_price?.USDT} USDT`}
          icon={Tag}
          iconBg="bg-[#b84d08]"
          iconColor="text-white"
        />
        <StatCard
          label="Rate"
          value={`₹${d.availableBalanceLogs?.Rate}`}
          sub="Per USDT"
          icon={ArrowLeftRight}
          iconBg="bg-transparent border border-[#444]"
          iconColor="text-gray-500"
        />
      </div>

      {/* ─── Row 2: Balance / Raised / Admin (3 cols) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3">
        <BalanceCard
          label="Available Balance"
          icon={Wallet}
          value={`₹${formatWhole(d.availableBalanceLogs?.TotalUsersINR)}`}
          subLabel="USDT"
          subValue={`$${formatWhole(d.availableBalanceLogs?.equviValnetUSDT)}`}
          iconBg="bg-[#eb660f]"
          valueColor="text-[#eb660f]"
        />
        <BalanceCard
          label="Total Amount Raised"
          icon={TrendingUp}
          value={`₹${formatNumber(d.total_Raised?.INR)}`}
          subLabel="USDT"
          subValue={`$${formatNumber(d.total_Raised?.USDT)}`}
          iconBg="bg-[#303f50]"
          valueColor="text-white"
        />
        <div className="bg-gradient-to-br from-[#b84d08] to-[#b84d08] rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
              Admin USDT
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <DollarSign size={14} className="text-white" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white break-all leading-tight">
            ${formatNumber(d.availableBalanceLogs?.usdtAdminHave, 4)}
          </p>
          <p className="text-[10px] text-white/50 mt-1">Holdings</p>
        </div>
      </div>

      {/* ─── Row 3: Referral & Withdrawals (2 cols) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <DualCard
          label="Total Referral"
          icon={Link2}
          inr={formatNumber(d.total_referral?.INR)}
          usdt={formatNumber(d.total_referral?.USDT)}
          accent
        />
        <DualCard
          label="Total Withdrawals"
          icon={ArrowDownToLine}
          inr={formatNumber(d.withdraw_amount?.INR)}
          usdt={formatNumber(d.withdraw_amount?.USDT)}
        />
      </div>
    </div>
  );
};

export default Dashboard;