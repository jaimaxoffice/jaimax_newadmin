// Features/Dashboard/WelcomeBanner.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import usePermissionSync from "../../hooks/usePermissionSync";
import { useGetSubAdminDetailsQuery } from "../../api/jaimaxApiSlice";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import {
  FaWallet, FaUsers, FaIdCard, FaMoneyBillWave,
  FaChartLine, FaBell, FaCoins, FaArrowRight,
  FaArrowUp, FaArrowDown, FaShieldAlt, FaFileAlt,
  FaCheckCircle, FaClock, FaTimesCircle, FaExchangeAlt,
} from "react-icons/fa";

// ─── Reusable Card ───
const Card = ({ children, className = "", accent = false }) => (
  <div
    className={`relative overflow-hidden rounded-[8px] transition-all duration-300
    hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]
    ${accent
        ? "bg-gradient-to-br from-[#1a0e05] to-[#111820]"
        : "bg-[#282f35] border border-[#1d2733]"
      } ${className}`}
  >
    {accent && (
      <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#b9fd5c]/10 blur-3xl" />
    )}
    {children}
  </div>
);

// ─── Custom Tooltip ───
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e252b] border border-[#2a3540] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-gray-400">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === "number"
              ? `₹${entry.value.toLocaleString()}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Stat Card ───
const StatCard = ({ icon: Icon, label, value, change, changeType, color, suffix = "" }) => (
  <Card className="p-5 group">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </p>
        <h3 className="text-2xl font-bold text-white">
          {value}
          <span className="text-sm font-normal text-gray-500 ml-1">{suffix}</span>
        </h3>
        {change !== undefined && change !== null && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
            changeType === "up" ? "text-green-400" : "text-red-400"
          }`}>
            {changeType === "up" ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
            <span>{change}% from last week</span>
          </div>
        )}
      </div>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <Icon size={22} />
      </div>
    </div>
  </Card>
);

// ─── Loading Skeletons ───
const SkeletonCard = () => (
  <Card className="p-5">
    <div className="animate-pulse">
      <div className="h-3 bg-gray-700 rounded w-24 mb-3" />
      <div className="h-7 bg-gray-700 rounded w-16 mb-2" />
      <div className="h-3 bg-gray-700 rounded w-32" />
    </div>
  </Card>
);

const SkeletonChart = ({ className = "" }) => (
  <Card className={`p-5 ${className}`}>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-32 mb-2" />
      <div className="h-3 bg-gray-700 rounded w-48 mb-4" />
      <div className="h-48 bg-gray-700/30 rounded-lg" />
    </div>
  </Card>
);

// ─── Mini Sparkline ───
const MiniSparkline = ({ data, color }) => (
  <ResponsiveContainer width="100%" height={40}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
        fill={`url(#spark-${color.replace("#", "")})`} />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Quick Access Card ───
const QuickAccessCard = ({ icon: Icon, label, path, color, onClick, description }) => (
  <div onClick={onClick}
    className="group cursor-pointer bg-[#1e252b] hover:bg-[#2a3540] border border-[#2a3540]
               hover:border-[#b9fd5c]/30 rounded-xl p-4 transition-all duration-300
               hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                      transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{label}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
      </div>
      <FaArrowRight size={12}
        className="text-gray-600 group-hover:text-[#b9fd5c] transition-all duration-300
                   group-hover:translate-x-1 mt-1" />
    </div>
  </div>
);

// ─── Permission Config ───
const PERMISSION_CONFIG = {
  "KYC MANAGEMENT": {
    icon: FaIdCard, color: "#60a5fa", label: "KYC Requests",
    path: "/kyc-management", description: "Verify & manage KYC requests",
  },
  "MANUAL KYC": {
    icon: FaFileAlt, color: "#38bdf8", label: "Manual KYC",
    path: "/manual-kyc", description: "Process manual verifications",
  },
  "USER INFO": {
    icon: FaUsers, color: "#a78bfa", label: "Active Users",
    path: "/user-info", description: "Search & view user details",
  },
  "WITHDRAW MANAGEMENT": {
    icon: FaMoneyBillWave, color: "#f59e0b", label: "Withdrawals",
    path: "/withdrawal-bonus", description: "Manage withdrawal requests",
  },
  "AVAILABLE BALANCE": {
    icon: FaCoins, color: "#2dd4bf", label: "Available Balance",
    path: "/available-balance", description: "View balance reports",
  },
  "APP ANNOUNCEMENTS": {
    icon: FaBell, color: "#f97316", label: "Announcements",
    path: "/announcements", description: "Create & manage announcements",
  },
  "WALLET MANAGEMENT": {
    icon: FaWallet, color: "#b9fd5c", label: "Wallet",
    path: "/wallet-management", description: "Manage wallets",
  },
  "GRADUAL BONUS": {
    icon: FaChartLine, color: "#e879f9", label: "Gradual Bonus",
    path: "/gradual-bonus", description: "View bonus logs",
  },
};

// ─── Greeting ───
const DashboardGreeting = ({ userName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <Card className="mb-6 overflow-hidden border-0 bg-[#282f35] shadow-xl shadow-black/30 relative">
      <div className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #b9fd5c08 1px, transparent 1px),
            linear-gradient(to bottom, #b9fd5c08 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
          maskImage: "linear-gradient(to left, black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, black 50%, transparent 100%)",
        }}
      />
      <div className="relative px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <p className="text-xs font-medium tracking-wider text-gray-400 mb-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </p>
          <h1 className="text-2xl sm:text-3xl serialHeading font-semibold text-white leading-tight">
            {getGreeting()}, &nbsp;
            <span className="text-[#b9fd5c]">{userName || "SubAdmin"}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back — here's your overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#34d399aa]" />
            <span className="text-xs font-semibold tracking-wide text-green-400">Live</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const computeKycStats = (kycList = []) => {
  const total    = kycList.length;
  const approved = kycList.filter((k) => k.status === "approve").length;
  const rejected = kycList.filter((k) => k.status === "reject").length;
  const pending  = kycList.filter((k) => k.status === "pending").length;

  // Verification method breakdown
  const digiVerified     = kycList.filter((k) => k.digilockerVerified).length;
  const panAadharVerified = kycList.filter(
    (k) => k.verifidType === "pan and aadhar verified"
  ).length;
  const adminVerified    = kycList.filter(
    (k) => k.verifidType === "admin verified"
  ).length;
  const notVerified      = kycList.filter(
    (k) => k.verifidType === "not verified yet"
  ).length;

  return {
    total,
    approved,
    rejected,
    pending,
    digiVerified,
    panAadharVerified,
    adminVerified,    
    notVerified,
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅  HELPER: Wallet Transaction Stats
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const computeWalletStats = (walletList = []) => {
  const totalTransactions = walletList.length;

  // Status breakdown
  const completed = walletList.filter((w) => w.transactionStatus === "Completed").length;
  const pendingTx = walletList.filter((w) => w.transactionStatus === "Pending").length;
  const failedTx  = walletList.filter((w) =>
    w.transactionStatus === "Failed" || w.transactionStatus === "Rejected"
  ).length;

  // Type breakdown
  const creditTxns = walletList.filter((w) => w.transactionType === "Credit");
  const debitTxns  = walletList.filter((w) => w.transactionType === "Debit");

  const totalCreditAmount = creditTxns.reduce(
    (sum, w) => sum + (w.transactionAmount || 0), 0
  );
  const totalDebitAmount = debitTxns.reduce(
    (sum, w) => sum + (w.transactionAmount || 0), 0
  );
  const totalVolume = walletList.reduce(
    (sum, w) => sum + (w.transactionAmount || 0), 0
  );

  // Payment modes
  const paymentModes = {};
  walletList.forEach((w) => {
    const mode = w.paymentMode || "Unknown";
    paymentModes[mode] = (paymentModes[mode] || 0) + 1;
  });

  // Total fees
  const totalFees = walletList.reduce(
    (sum, w) => sum + (w.transactionFee || 0), 0
  );

  // Net amount (Credit - Debit)
  const netAmount = totalCreditAmount - totalDebitAmount;

  return {
    totalTransactions,
    completed,
    pendingTx,
    failedTx,
    creditCount: creditTxns.length,
    debitCount: debitTxns.length,
    totalCreditAmount,
    totalDebitAmount,
    totalVolume,
    netAmount,
    paymentModes,
    totalFees,
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅  HELPER: Daily transaction volume
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const computeDailyVolume = (walletList = []) => {
  const dayMap = {};

  walletList.forEach((w) => {
    if (!w.transactionDate) return;
    const date = new Date(w.transactionDate);
    const dayKey = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (!dayMap[dayKey]) {
      dayMap[dayKey] = { name: dayKey, credit: 0, debit: 0, count: 0 };
    }

    dayMap[dayKey].count += 1;
    if (w.transactionType === "Credit") {
      dayMap[dayKey].credit += w.transactionAmount || 0;
    } else {
      dayMap[dayKey].debit += w.transactionAmount || 0;
    }
  });

  // Sort by date
  return Object.values(dayMap).sort(
    (a, b) => new Date(a.name + " 2026") - new Date(b.name + " 2026")
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅  HELPER: Payment mode pie data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PAYMENT_MODE_COLORS = {
  UPI: "#b9fd5c",
  "Net Banking": "#60a5fa",
  Card: "#a78bfa",
  Cash: "#f59e0b",
  Unknown: "#6b7280",
};

const computePaymentModePie = (walletList = []) => {
  const modeMap = {};
  walletList.forEach((w) => {
    const mode = w.paymentMode || "Unknown";
    modeMap[mode] = (modeMap[mode] || 0) + (w.transactionAmount || 0);
  });

  return Object.entries(modeMap).map(([name, value]) => ({
    name,
    value,
    color: PAYMENT_MODE_COLORS[name] || "#6b7280",
  }));
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅  HELPER: KYC reviewer breakdown
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const computeUpdaterBreakdown = (kycList = []) => {
  const map = {};
  kycList.forEach((k) => {
    const updater = k.updatedBy?.name || "Unknown";
    if (!map[updater]) map[updater] = { name: updater, approved: 0, rejected: 0, pending: 0 };
    if (k.status === "approve") map[updater].approved += 1;
    else if (k.status === "reject") map[updater].rejected += 1;
    else map[updater].pending += 1;
  });
  return Object.values(map);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅  HELPER: Combined recent activity feed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const buildRecentActivities = (kycList = [], walletList = []) => {
  const activities = [];

  kycList.forEach((k) => {
    activities.push({
      user: k.name || "Unknown",
      type: "KYC",
      status: k.status === "approve" ? "approved"
            : k.status === "reject"  ? "rejected"
            : "pending",
      time: k.updatedBy?.name ? `Reviewed by ${k.updatedBy.name}` : "",
      reason: k.reason || "",
      _id: k._id,
      sortDate: k._id, // fallback sort
    });
  });

  walletList.forEach((w) => {
    const statusMap = {
      Completed: "approved",
      Pending: "pending",
      Failed: "rejected",
      Rejected: "rejected",
    };

    activities.push({
      user: w.name || w.createdBy?.name || "Unknown",
      type: "Wallet",
      status: statusMap[w.transactionStatus] || "pending",
      time: w.transactionDate
        ? new Date(w.transactionDate).toLocaleDateString("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })
        : "",
      amount: w.transactionAmount,
      txType: w.transactionType,
      paymentMode: w.paymentMode,
      reason: w.reason || "",
      _id: w._id,
      sortDate: w.transactionDate || w._id,
    });
  });

  // Sort newest first
  activities.sort((a, b) => {
    const dateA = a.sortDate ? new Date(a.sortDate).getTime() || 0 : 0;
    const dateB = b.sortDate ? new Date(b.sortDate).getTime() || 0 : 0;
    if (dateA && dateB) return dateB - dateA;
    return b._id > a._id ? 1 : -1;
  });

  return activities;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅  MAIN WELCOME BANNER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const WelcomeBanner = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cookie data
  const stored = Cookies.get("adminUserData");
  const parsed = stored ? JSON.parse(stored) : {};
  const userName = parsed?.data?.name || "SubAdmin";

  // Permissions
  const { permissions } = usePermissionSync();

  // API data
  const { data: detailsResponse, isLoading } = useGetSubAdminDetailsQuery(undefined, {
    pollingInterval: 5 * 60 * 1000,
    refetchOnMountOrArgChange: true,
  });

  // ─── Extract lists ───
  const rawData    = detailsResponse?.data || detailsResponse || {};
  const kycList    = rawData?.kycList    || [];
  const walletList = rawData?.walletList || [];

  // ─── Derived stats ───
  const kycStats    = useMemo(() => computeKycStats(kycList), [kycList]);
  const walletStats = useMemo(() => computeWalletStats(walletList), [walletList]);

  // ─── Chart data ───
  const kycStatusData = useMemo(() => [
    { name: "Approved", value: kycStats.approved, color: "#b9fd5c" },
    { name: "Pending",  value: kycStats.pending,  color: "#f59e0b" },
    { name: "Rejected", value: kycStats.rejected, color: "#ef4444" },
  ], [kycStats]);

  const updaterBreakdown = useMemo(
    () => computeUpdaterBreakdown(kycList), [kycList]
  );

  const verificationData = useMemo(() => [
    { name: "Digilocker",       value: kycStats.digiVerified,      color: "#60a5fa" },
    { name: "PAN+Aadhaar",      value: kycStats.panAadharVerified, color: "#a78bfa" },
     {
    name: "Manual (Admin)",
    value: kycStats.adminVerified,
    color: "#2dd4bf",
    icon: "👤",
  },
    { name: "Not Verified Yet", value: kycStats.notVerified,       color: "#f97316" },
  ], [kycStats]);

  // Wallet charts
  const dailyVolumeData = useMemo(
    () => computeDailyVolume(walletList), [walletList]
  );

  const paymentModePie = useMemo(
    () => computePaymentModePie(walletList), [walletList]
  );

  const walletStatusPie = useMemo(() => [
    { name: "Completed", value: walletStats.completed, color: "#b9fd5c" },
    { name: "Pending",   value: walletStats.pendingTx, color: "#f59e0b" },
    { name: "Failed",    value: walletStats.failedTx,  color: "#ef4444" },
  ], [walletStats]);

  // Recent activities
  const recentActivities = useMemo(
    () => buildRecentActivities(kycList, walletList),
    [kycList, walletList]
  );

  // Sparklines
  const kycSparkline = useMemo(() => {
    return kycList.slice(-7).map((k) => ({
      value: k.status === "approve" ? 1 : k.status === "reject" ? -1 : 0,
    }));
  }, [kycList]);

  const walletSparkline = useMemo(() => {
    return walletList.slice(-7).map((w) => ({
      value: w.transactionAmount || 0,
    }));
  }, [walletList]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasPermission = useCallback(
    (perm) => permissions.includes(perm), [permissions]
  );

  // ─── Stat cards ───
  const statCards = useMemo(() => {
    const cards = [];

    if (hasPermission("KYC MANAGEMENT")) {
      cards.push({
        icon: FaIdCard, label: "Total KYC", color: "#b9fd5c",
        value: kycStats.total,
        suffix: `(${kycStats.approved} approved)`,
      });
      cards.push({
        icon: FaTimesCircle, label: "KYC Rejected", color: "#b9fd5c",
        value: kycStats.rejected,
      });
    }

    if (hasPermission("WALLET MANAGEMENT") || hasPermission("AVAILABLE BALANCE")) {
      cards.push({
        icon: FaWallet, label: "Total Transactions", color: "#b9fd5c",
        value: walletStats.totalTransactions,
        suffix: `(${walletStats.completed} completed)`,
      });
      cards.push({
        icon: FaArrowUp, label: "Total Credits", color: "#b9fd5c",
        value: `₹${walletStats.totalCreditAmount.toLocaleString()}`,
        suffix: `(${walletStats.creditCount} txns)`,
      });
      cards.push({
        icon: FaArrowDown, label: "Total Debits", color: "#b9fd5c",
        value: `₹${walletStats.totalDebitAmount.toLocaleString()}`,
        suffix: `(${walletStats.debitCount} txns)`,
      });
      cards.push({
        icon: FaCoins, label: "Net Amount", color: walletStats.netAmount >= 0 ? "#b9fd5c" : "#ef4444",
        value: `₹${walletStats.netAmount.toLocaleString()}`,
        suffix: walletStats.netAmount >= 0 ? "surplus" : "deficit",
      });
    }

    if (hasPermission("KYC MANAGEMENT")) {
      cards.push({
        icon: FaShieldAlt, label: "Digilocker Verified", color: "#b9fd5c",
        value: kycStats.digiVerified,
        suffix: `of ${kycStats.total}`,
      });
    }

    return cards;
  }, [permissions, kycStats, walletStats, hasPermission]);

  // Quick links
  const quickLinks = useMemo(
    () => permissions
      .filter((p) => PERMISSION_CONFIG[p])
      .map((p) => PERMISSION_CONFIG[p]),
    [permissions]
  );

  // Activity icon
  const getActivityIcon = (type, status) => {
    if (status === "approved") return { icon: FaCheckCircle, color: "#b9fd5c" };
    if (status === "pending")  return { icon: FaClock,       color: "#f59e0b" };
    if (status === "rejected") return { icon: FaTimesCircle, color: "#ef4444" };
    return { icon: FaExchangeAlt, color: "#60a5fa" };
  };

  // ━━━ LOADING ━━━
  if (isLoading) {
    return (
      <div className="min-h-screen text-white p-4 md:p-2">
        <DashboardGreeting userName={userName} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <SkeletonChart className="lg:col-span-2" />
          <SkeletonChart />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  // ━━━ MAIN RENDER ━━━
  return (
    <div className="min-h-screen text-white p-4 md:p-2">

      {/* ─── Greeting ─── */}
      <DashboardGreeting userName={userName} />

      {/* ─── Stat Cards ─── */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}

          {/* Live Clock */}
          <Card className="p-5 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Current Time
                </p>
                <h3 className="text-2xl font-bold text-white font-mono">
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
                  })}
                </h3>
                <p className="text-xs text-gray-500 mt-2">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                  })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#b9fd5c15]">
                <FaClock className="text-[#b9fd5c] " size={20}/>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Charts Row 1: KYC Reviewer Bar + KYC Status Pie ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {hasPermission("KYC MANAGEMENT") && updaterBreakdown.length > 0 && (
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className=" font-bold text-white serialHeading text-xl">KYC by Reviewer</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Approved / Rejected / Pending per reviewer
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#b9fd5c]" />
                  <span className="text-[10px] text-gray-400">Approved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="text-[10px] text-gray-400">Pending</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="text-[10px] text-gray-400">Rejected</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={updaterBreakdown} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d2733" />
                <XAxis dataKey="name" stroke="#4a5568" tick={{ fontSize: 11 }} />
                <YAxis stroke="#4a5568" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="approved" name="Approved" fill="#b9fd5c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending"  name="Pending"  fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

{hasPermission("KYC MANAGEMENT") && (
  <Card className="p-5">
    <div className="mb-4">
      <h3 className="text-xl font-semibold text-white serialHeading">Verification Method</h3>
      <p className="text-[11px] text-gray-500 mt-0.5">
        How KYC documents were verified
      </p>
    </div>

    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={verificationData}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {verificationData.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>

    {/* Legend with all 4 types */}
    <div className="grid grid-cols-2 gap-2 mt-3">
      {verificationData.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 bg-[#1e252b] rounded-lg px-3 py-2
                     hover:bg-[#2a3540] transition-colors"
        >
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 truncate">{item.name}</p>
            <p className="text-sm font-semibold text-white">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
)}
      </div>

      {/* ─── Charts Row 2: Daily Wallet Volume + Payment Mode Pie ─── */}
      {(hasPermission("WALLET MANAGEMENT") || hasPermission("AVAILABLE BALANCE")) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Daily Credit vs Debit Area Chart */}
          {dailyVolumeData.length > 0 && (
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white serialHeading ">Daily Transaction Volume</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Credit vs Debit — ₹{walletStats.totalVolume.toLocaleString()} total volume
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]" />
                    <span className="text-[10px] text-gray-400">Credit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                    <span className="text-[10px] text-gray-400">Debit</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyVolumeData}>
                  <defs>
                    <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="debitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1d2733" />
                  <XAxis dataKey="name" stroke="#4a5568" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#4a5568" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="credit" name="Credit" stroke="#2dd4bf"
                    strokeWidth={2} fill="url(#creditGrad)" />
                  <Area type="monotone" dataKey="debit" name="Debit" stroke="#f97316"
                    strokeWidth={2} fill="url(#debitGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Payment Mode + Transaction Status Pies */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white serialHeading">Payment Modes</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">By transaction amount</p>
            </div>

            {paymentModePie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={paymentModePie} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                      paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {paymentModePie.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {paymentModePie.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] text-gray-400">{item.name}</span>
                      <span className="text-[10px] font-semibold text-white">
                        ₹{item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FaWallet size={20} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No transactions yet</p>
              </div>
            )}

            {/* Transaction Status mini section */}
            <div className="mt-4 pt-4 border-t border-[#2a3540]">
              <p className="text-[11px] text-gray-400 font-medium mb-2">Transaction Status</p>
              <div className="flex justify-between">
                {walletStatusPie.map((item, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-lg font-bold" style={{ color: item.color }}>
                      {item.value}
                    </p>
                    <p className="text-[10px] text-gray-500">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Charts Row 3: Verification Types + Wallet Status Bar ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

       {/* Replace the old Digilocker sparkline card with this enhanced one */}
{hasPermission("KYC MANAGEMENT") && (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xl text-gray-400 font-medium serialHeading">Verification Breakdown</p>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
        {kycStats.total > 0
          ? `${(((kycStats.digiVerified + kycStats.panAadharVerified + kycStats.adminVerified) / kycStats.total) * 100).toFixed(1)}% verified`
          : "0% verified"}
      </span>
    </div>

    {/* Mini stat row */}
    <div className="flex items-center gap-3 mb-3">
      <div className="text-center flex-1">
        <p className="text-lg font-bold text-[#60a5fa]">{kycStats.digiVerified}</p>
        <p className="text-[9px] text-gray-500">Digilocker</p>
      </div>
      <div className="w-px h-8 bg-[#2a3540]" />
      <div className="text-center flex-1">
        <p className="text-lg font-bold text-[#a78bfa]">{kycStats.panAadharVerified}</p>
        <p className="text-[9px] text-gray-500">PAN+Aadhaar</p>
      </div>
      <div className="w-px h-8 bg-[#2a3540]" />
      <div className="text-center flex-1">
        <p className="text-lg font-bold text-[#2dd4bf]">{kycStats.adminVerified}</p>
        <p className="text-[9px] text-gray-500">Manual</p>
      </div>
      <div className="w-px h-8 bg-[#2a3540]" />
      <div className="text-center flex-1">
        <p className="text-lg font-bold text-[#f97316]">{kycStats.notVerified}</p>
        <p className="text-[9px] text-gray-500">Unverified</p>
      </div>
    </div>

    <MiniSparkline
      data={kycList.slice(-7).map((k) => ({
        value:
          k.verifidType === "admin verified" ? 3
          : k.verifidType === "pan and aadhar verified" ? 2
          : k.digilockerVerified ? 1
          : 0,
      }))}
      color="#2dd4bf"
    />
  </Card>
)}

        {(hasPermission("WALLET MANAGEMENT") || hasPermission("AVAILABLE BALANCE")) && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white serialHeading">Transaction Summary</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {walletStats.totalTransactions} transactions
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  walletStats.netAmount >= 0 ? "text-[#b9fd5c]" : "text-red-400"
                }`}>
                  ₹{walletStats.netAmount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500">net amount</p>
              </div>
            </div>

            {/* Credit vs Debit comparison bars */}
            <div className="space-y-4">
              {/* Credit bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FaArrowUp size={10} className="text-[#2dd4bf]" />
                    <span className="text-xs text-gray-400">Credits</span>
                  </div>
                  <span className="text-xs font-semibold text-[#2dd4bf]">
                    ₹{walletStats.totalCreditAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 bg-[#1e252b] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#2dd4bf] to-[#2dd4bf]/60 rounded-full transition-all duration-700"
                    style={{
                      width: walletStats.totalVolume > 0
                        ? `${(walletStats.totalCreditAmount / walletStats.totalVolume) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {walletStats.creditCount} transactions
                </p>
              </div>

              {/* Debit bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FaArrowDown size={10} className="text-[#f97316]" />
                    <span className="text-xs text-gray-400">Debits</span>
                  </div>
                  <span className="text-xs font-semibold text-[#f97316]">
                    ₹{walletStats.totalDebitAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 bg-[#1e252b] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#f97316] to-[#f97316]/60 rounded-full transition-all duration-700"
                    style={{
                      width: walletStats.totalVolume > 0
                        ? `${(walletStats.totalDebitAmount / walletStats.totalVolume) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {walletStats.debitCount} transactions
                </p>
              </div>

              {/* Fees */}
              {walletStats.totalFees > 0 && (
                <div className="pt-3 border-t border-[#2a3540] flex items-center justify-between">
                  <span className="text-xs text-gray-400">Total Fees</span>
                  <span className="text-xs font-semibold text-gray-300">
                    ₹{walletStats.totalFees.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>



      {/* ─── Quick Access + Recent Activity ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Quick Access */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <FaArrowRight className="text-[#b9fd5c]" size={14} />
            <h3 className="text-xl font-semibold text-white serialHeading">Quick Access</h3>
            <span className="ml-auto text-[10px] text-gray-500">Click to navigate</span>
          </div>
          {quickLinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickLinks.map((link, idx) => (
                <QuickAccessCard key={idx} {...link} onClick={() => navigate(link.path)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaShieldAlt size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No sections available</p>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white serialHeading">Recent Activity</h3>
            <span className="text-[10px] bg-[#b9fd5c]/10 text-[#b9fd5c] px-2 py-0.5 rounded-full">
              {recentActivities.length} items
            </span>
          </div>
          <div className="space-y-1 max-h-[340px] overflow-y-auto custom-scrollbar">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 10).map((activity, idx) => {
                const { icon: ActivityIcon, color } = getActivityIcon(
                  activity.type, activity.status
                );
                return (
                  <div key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#1e252b] transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}15`, color }}>
                      <ActivityIcon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">
                        {activity.user}{" "}
                        <span className="text-gray-400 font-normal">
                          — {activity.type} {activity.status}
                        </span>
                      </p>
                      {/* Show amount for wallet txns */}
                      {activity.amount && (
                        <p className={`text-[10px] font-medium ${
                          activity.txType === "Credit" ? "text-green-400" : "text-orange-400"
                        }`}>
                          {activity.txType === "Credit" ? "+" : "-"}₹
                          {activity.amount.toLocaleString()}
                          {activity.paymentMode && (
                            <span className="text-gray-500 ml-1">
                              via {activity.paymentMode}
                            </span>
                          )}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-500 truncate">
                        {activity.reason || activity.time}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <FaClock size={20} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ─── Permissions + Account Info ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Permissions */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaShieldAlt className="text-[#b9fd5c]" size={14} />
            <h3 className="text-xl font-semibold text-white serialHeading">Your Permissions</h3>
            <span className="ml-auto text-[10px] bg-[#b9fd5c]/10 text-[#b9fd5c] px-2.5 py-0.5 rounded-full font-medium">
              {permissions.length} Active
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {permissions.length > 0 ? (
              permissions.map((perm, idx) => (
                <span key={idx}
                  className="text-[11px] bg-[#1e252b] border border-[#2a3540] text-gray-300
                             px-3 py-1.5 rounded-full hover:border-[#b9fd5c]/30
                             hover:text-[#b9fd5c] transition-all duration-200 cursor-default">
                  {perm}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No permissions assigned.</p>
            )}
          </div>
        </Card>

        {/* Account Info */}
        <Card className="p-5">
          <h3 className="text-xl font-semibold text-gray-400 uppercase tracking-wider mb-4 serialHeading">
            Account Info
          </h3>
          <div className="space-y-3">
            {[
              { label: "Name",  value: parsed?.data?.name  || "N/A" },
              { label: "Email", value: parsed?.data?.email || "N/A" },
              { label: "Role",  value: "Sub Admin", highlight: true },
              {
                label: "KYC Processed",
                value: `${kycStats.total} (${kycStats.approved} approved)`,
              },
              {
                label: "Wallet Txns",
                value: `${walletStats.totalTransactions} (₹${walletStats.totalVolume.toLocaleString()})`,
              },
            ].map((row, idx) => (
              <div key={idx}
                className="flex items-center justify-between py-2 border-b border-[#2a3540] last:border-0">
                <span className="text-sm text-gray-400">{row.label}</span>
                <span className={`text-sm font-medium ${
                  row.highlight ? "text-[#b9fd5c]" : "text-white"
                }`}>
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-400">Status</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeBanner;