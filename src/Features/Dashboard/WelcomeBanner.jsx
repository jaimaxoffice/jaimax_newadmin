// Features/Dashboard/WelcomeBanner.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  FaWallet, FaUsers, FaIdCard, FaMoneyBillWave,
  FaChartLine, FaBell, FaCoins, FaArrowRight,
  FaFileAlt, FaShieldAlt, FaComments,
} from "react-icons/fa";
import { useCheckPermissionsQuery } from '../../api/jaimaxApiSlice';

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
    icon: FaIdCard, 
    color: "#60a5fa", 
    label: "KYC Requests",
    path: "/kyc-management", 
    description: "Verify & manage KYC requests",
  },
  "MANUAL KYC": {
    icon: FaFileAlt, 
    color: "#38bdf8", 
    label: "Manual KYC",
    path: "/manual-kyc", 
    description: "Process manual verifications",
  },
  "USER INFO": {
    icon: FaUsers, 
    color: "#a78bfa", 
    label: "Active Users",
    path: "/user-info", 
    description: "Search & view user details",
  },
  "WITHDRAW MANAGEMENT": {
    icon: FaMoneyBillWave, 
    color: "#f59e0b", 
    label: "Withdrawals",
    path: "/withdrawal-bonus", 
    description: "Manage withdrawal requests",
  },
  "AVAILABLE BALANCE": {
    icon: FaCoins, 
    color: "#2dd4bf", 
    label: "Available Balance",
    path: "/available-balance", 
    description: "View balance reports",
  },
  "APP ANNOUNCEMENTS": {
    icon: FaBell, 
    color: "#f97316", 
    label: "Announcements",
    path: "/announcements", 
    description: "Create & manage announcements",
  },
  "WALLET MANAGEMENT": {
    icon: FaWallet, 
    color: "#b9fd5c", 
    label: "Wallet",
    path: "/wallet-management", 
    description: "Manage wallets",
  },
  "GRADUAL BONUS": {
    icon: FaChartLine, 
    color: "#e879f9", 
    label: "Gradual Bonus",
    path: "/gradual-bonus", 
    description: "View bonus logs",
  },
  "JAIMAX COMMUNITY": {
    icon: FaComments, 
    color: "#10b981", 
    label: "Community",
    path: "/jaimax-community", 
    description: "Access community chat",
  },
};

// ─── Loading Skeleton ───
const LoadingSkeleton = () => (
  <Card className="p-5">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-32 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#1e252b] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
                <div className="h-3 bg-gray-700 rounded w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

// ─── Greeting Component ───
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
          <p className="text-sm text-gray-400 mt-1">Welcome back — here's your quick access panel</p>
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

// ─── Main Component ───
const WelcomeBanner = () => {
  const navigate = useNavigate();
  
  // Fetch permissions from API
  const { data, isLoading, error } = useCheckPermissionsQuery();

  // Cookie data
  const stored = Cookies.get("adminUserData");
  const parsed = stored ? JSON.parse(stored) : {};
  const userName = parsed?.data?.name || "SubAdmin";

  // Extract permissions from API response
  const permissions = useMemo(() => {
    if (data?.success && Array.isArray(data?.data)) {
      return data.data;
    }
    return [];
  }, [data]);

  // Quick links based on permissions from API
  const quickLinks = useMemo(
    () => permissions
      .filter((p) => PERMISSION_CONFIG[p])
      .map((p) => PERMISSION_CONFIG[p]),
    [permissions]
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen text-white p-4 md:p-2">
        <DashboardGreeting userName={userName} />
        <LoadingSkeleton />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen text-white p-4 md:p-2">
        <DashboardGreeting userName={userName} />
        <Card className="p-5">
          <div className="text-center py-12">
            <FaShieldAlt size={32} className="text-red-500 mx-auto mb-3" />
            <p className="text-red-400 text-sm">Failed to load permissions</p>
            <p className="text-gray-500 text-xs mt-1">Please refresh the page</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-2">
      
      {/* ─── Greeting ─── */}
      <DashboardGreeting userName={userName} />

      {/* ─── Quick Access ─── */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <FaArrowRight className="text-[#b9fd5c]" size={14} />
          <h3 className="text-xl font-semibold text-white serialHeading">Quick Access</h3>
          <span className="ml-auto text-[10px] text-gray-500">
            {quickLinks.length} {quickLinks.length === 1 ? 'section' : 'sections'} available
          </span>
        </div>
        
        {quickLinks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {quickLinks.map((link, idx) => (
              <QuickAccessCard 
                key={idx} 
                {...link} 
                onClick={() => navigate(link.path)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaShieldAlt size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No sections available</p>
            <p className="text-gray-500 text-xs mt-1">Contact your administrator for access</p>
          </div>
        )}
      </Card>

    </div>
  );
};

export default WelcomeBanner; 