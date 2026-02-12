// src/features/dashboard/Dashboard.jsx
import React from "react";
import { useGetDetailsQuery } from "./dashboardApiSlice";

// ─── Helper: Format large numbers ───
const formatNumber = (num, decimals = 2) => {
  if (num === undefined || num === null) return "0";
  return Number(num).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// ─── Stat Card Component ───
const StatCard = ({ title, children, icon }) => (
  <div className="bg-brand-card border border-brand-border rounded-2xl p-5 hover:border-brand-green/30 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <p className="text-brand-muted text-sm font-medium">{title}</p>
      <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center group-hover:bg-brand-green/20 transition-colors">
        {icon}
      </div>
    </div>
    {children}
  </div>
);

// ─── Dual Currency Display ───
const DualCurrency = ({ inr, usdt }) => (
  <div className="space-y-1">
    <p className="text-2xl font-bold text-white">₹{formatNumber(inr)}</p>
    <p className="text-sm text-brand-green font-medium">
      ≈ ${formatNumber(usdt)} USDT
    </p>
  </div>
);

const Dashboard = () => {
  const { data: response, isLoading, isError, error, refetch } = useGetDetailsQuery();

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-muted text-lg font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (isError) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-brand-muted mb-6">
            {error?.data?.message || error?.error || "Failed to load dashboard."}
          </p>
          <button
            onClick={refetch}
            className="bg-brand-green hover:bg-brand-green/90 text-brand-dark px-6 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Extract Data ───
  const dashData = response?.data;

  const {
    availableBalanceLogs,
    total_Raised,
    total_token_sale,
    total_referral,
    current_token_price,
    usersCount,
    withdraw_amount,
  } = dashData || {};

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* ─── Header ─── */}
      <header className="border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-brand-green rounded-full inline-block" />
                Admin Dashboard
              </h1>
              <p className="text-brand-muted mt-1 text-sm">
                Real-time token sale & financial overview
              </p>
            </div>
            <button
              onClick={refetch}
              className="flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-brand-dark px-5 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ─── Row 1: Key Metrics ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Total Users */}
          <StatCard
            title="Total Users"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            <p className="text-3xl font-bold text-white">
              {usersCount?.toLocaleString()}
            </p>
            <p className="text-xs text-brand-muted mt-1">Registered accounts</p>
          </StatCard>

          {/* Total Token Sale */}
          <StatCard
            title="Total Token Sale"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          >
            <p className="text-2xl font-bold text-white">
              {formatNumber(total_token_sale, 0)}
            </p>
            <p className="text-xs text-brand-green mt-1">Tokens sold</p>
          </StatCard>

          {/* Current Token Price */}
          <StatCard
            title="Token Price (INR)"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
          >
            <p className="text-3xl font-bold text-white">
              ₹{current_token_price?.INR}
            </p>
            <p className="text-sm text-brand-green mt-1">
              ≈ ${current_token_price?.USDT} USDT
            </p>
          </StatCard>

          {/* Exchange Rate */}
          <StatCard
            title="INR/USDT Rate"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }
          >
            <p className="text-3xl font-bold text-white">
              ₹{availableBalanceLogs?.Rate}
            </p>
            <p className="text-xs text-brand-muted mt-1">1 USDT exchange rate</p>
          </StatCard>
        </div>

        {/* ─── Row 2: Financial Cards ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Total Raised */}
          <div className="bg-gradient-to-br from-brand-green/20 to-brand-green/5 border border-brand-green/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-green/20 text-brand-green rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-brand-green font-semibold text-sm uppercase tracking-wide">
                Total Raised
              </p>
            </div>
            <p className="text-3xl font-bold text-white">
              ₹{formatNumber(total_Raised?.INR)}
            </p>
            <p className="text-brand-green text-sm font-medium mt-1">
              ≈ ${formatNumber(total_Raised?.USDT)} USDT
            </p>
          </div>

          {/* Total Referral */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-brand-muted font-semibold text-sm uppercase tracking-wide">
                Total Referral
              </p>
            </div>
            <DualCurrency
              inr={total_referral?.INR}
              usdt={total_referral?.USDT}
            />
          </div>

          {/* Withdraw Amount */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <p className="text-brand-muted font-semibold text-sm uppercase tracking-wide">
                Total Withdrawn
              </p>
            </div>
            <DualCurrency
              inr={withdraw_amount?.INR}
              usdt={withdraw_amount?.USDT}
            />
          </div>
        </div>

        {/* ─── Row 3: Available Balance Breakdown ─── */}
        <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Available Balance Logs
            </h2>
            <span className="text-xs bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-medium">
              Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-brand-border">
            {/* Total Users INR */}
            <div className="p-6 text-center">
              <p className="text-brand-muted text-sm font-medium mb-2">
                Users Balance (INR)
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{formatNumber(availableBalanceLogs?.TotalUsersINR, 0)}
              </p>
            </div>

            {/* Rate */}
            <div className="p-6 text-center">
              <p className="text-brand-muted text-sm font-medium mb-2">
                Exchange Rate
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{availableBalanceLogs?.Rate}
              </p>
            </div>

            {/* Equivalent USDT */}
            <div className="p-6 text-center">
              <p className="text-brand-muted text-sm font-medium mb-2">
                Equivalent USDT
              </p>
              <p className="text-2xl font-bold text-brand-green">
                ${formatNumber(availableBalanceLogs?.equviValnetUSDT, 0)}
              </p>
            </div>

            {/* Admin USDT */}
            <div className="p-6 text-center">
              <p className="text-brand-muted text-sm font-medium mb-2">
                Admin USDT Balance
              </p>
              <p className="text-2xl font-bold text-white">
                ${formatNumber(availableBalanceLogs?.usdtAdminHave, 4)}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Row 4: Quick Summary Table ─── */}
        <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-border">
            <h2 className="text-lg font-semibold text-white">
              Financial Summary
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-brand-muted uppercase tracking-wider border-b border-brand-border">
                  <th className="px-6 py-3 font-medium">Metric</th>
                  <th className="px-6 py-3 font-medium text-right">INR (₹)</th>
                  <th className="px-6 py-3 font-medium text-right">USDT ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-green rounded-full" />
                    Total Raised
                  </td>
                  <td className="px-6 py-4 text-sm text-white text-right font-mono">
                    ₹{formatNumber(total_Raised?.INR)}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-green text-right font-mono">
                    ${formatNumber(total_Raised?.USDT)}
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                    Total Referral
                  </td>
                  <td className="px-6 py-4 text-sm text-white text-right font-mono">
                    ₹{formatNumber(total_referral?.INR)}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-green text-right font-mono">
                    ${formatNumber(total_referral?.USDT)}
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full" />
                    Total Withdrawn
                  </td>
                  <td className="px-6 py-4 text-sm text-white text-right font-mono">
                    ₹{formatNumber(withdraw_amount?.INR)}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-green text-right font-mono">
                    ${formatNumber(withdraw_amount?.USDT)}
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full" />
                    Token Price
                  </td>
                  <td className="px-6 py-4 text-sm text-white text-right font-mono">
                    ₹{current_token_price?.INR}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-green text-right font-mono">
                    ${current_token_price?.USDT}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;