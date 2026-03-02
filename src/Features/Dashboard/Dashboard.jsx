// src/features/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useGetDetailsQuery } from "./dashboardApiSlice";
import Loader from "../../reusableComponents/Loader/Loader";
import StatCard from "../../reusableComponents/StatCards/GradientCard";
import Cookies from "js-cookie";
import {
  Users, Coins, Tag, ArrowLeftRight, Wallet, TrendingUp, DollarSign,
  RefreshCw, Zap, Target, Activity, ChevronUp, ChevronLeft, ChevronRight,
  Shield, TrendingDown, AlertCircle, CheckCircle, XCircle, PieChart as PieIcon,
  Briefcase, Calendar as CalendarIcon, ArrowLeft, ArrowRight,
  ArrowUpCircle,
  ArrowDownCircle,
  Mail, Phone,
  Gift
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";

const fmt = (n, d = 2) => {
  if (n == null) return "0";
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(n));
};
const fmtWhole = (n) => {
  if (n == null) return "0";
  return new Intl.NumberFormat("en-IN").format(Number(n));
};
const fmtCompact = (n) => {
  if (n == null) return "0";
  const v = Number(n);
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toFixed(2);
};
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

const useAnimPct = (target, duration = 1600) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start = null;
    const t = Number(target) || 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setV(t * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return v;
};


const SL = ({ children }) => (
  <h2 className="text-[20px] font-bold serialHeading   text-white mb-3 mt-1  flex items-center gap-2">

    {children}
  </h2>
);

const Card = ({ children, className = "", accent = false }) => (
  <div className={`relative overflow-hidden rounded-[8px]  transition-all duration-300
    hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]
    ${accent
      ? "bg-gradient-to-br from-[#1a0e05] to-[#111820]"
      : "bg-[#282f35] border-[#1d2733] "
    } ${className}`}>
    {accent && <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#b9fd5c]/10 blur-3xl" />}
    {children}
  </div>
);

const CardHeader = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4  text-[20px] serialHeading">
    <p className=" font-bold text-white serialHeading">{title}</p>
    {action && <span className=" font-bold text-[#b9fd5c] cursor-pointer hover:underline">{action}</span>}
  </div>
);

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#282f35] border border-[#2a3340] rounded-xl px-3 py-2 shadow-2xl text-xs min-w-[110px]">
      <p className="text-white font-semibold mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color || p.fill }}>
          {p.name}: {fmtCompact(p.value)}
        </p>
      ))}
    </div>
  );
};


// const StatCard = ({ label, value, sub, icon: Icon, accent, trend }) => (
//   <Card accent={accent}>
//     <div className="p-4 sm:p-5">
//       <div className="flex flex-col items-start justify-between mb-3">
//         <div className={`p-2 rounded-xl flex items-center justify-center border
//           ${accent ? "bg-[#b9fd5c]/20 border-[#b9fd5c]/30 text-[#b9fd5c]" : "bg-[#b9fd5c] border-[#253040] text-white"}`}>
//           <Icon size={30} color="black" />
//         </div>

//         {trend && (
//           <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold
//             ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
//             {trend > 0 ? <ChevronUp size={10} /> : <TrendingDown size={10} />}
//             {Math.abs(trend)}%
//           </div>
//         )}
//         <p className="text-[10px] font-semibold uppercase tracking-wider text-white">{label}</p>
//         {sub && <p className="text-[10px] text-white mt-0.5">{sub}</p>}
//       </div>

//       <p className={`text-2xl sm:text-3xl font-bold leading-none break-all mb-1.5
//         ${accent ? "text-[#b9fd5c]" : "text-white"}`}>
//         {value}
//       </p>
//     </div>
//   </Card>
// );







const CommunityCard = ({ community }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = [
    { name: 'Active', value: community.activeUsers || 0, color: '#b9fd5c' },
    { name: 'Inactive', value: community.inActiveUsers || 0, color: '#ffffff' },
    { name: 'Blocked', value: community.blockedUsers || 0, color: '#ef4444' },
    { name: 'Super Admins', value: community.superAdmins || 0, color: '#d9a90b' },
    { name: 'Sub Admins', value: community.subAdmins || 0, color: '#0b6bd9' },
    { name: 'Account Admins', value: community.accountsAdmins || 0, color: '#ba0bd9' },
  ].filter(item => item.value >= 0);

  const totalUsersForChart = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="h-full">
      <div className="relative p-5 sm:p-6 overflow-hidden h-full">
        <div className="relative z-10 h-full flex flex-col">
          <CardHeader title="Community Breakdown" />

          <div className="relative h-48 sm:h-56 mb-6 flex-shrink-0">
            {totalUsersForChart > 0 && (
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data} 
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="90%"
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={index === activeIndex ? 1 : 0.5}
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(0)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-bold text-white">
                {fmtWhole(community.allUsers || 0)}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1 pt-2 border-t border-gray-800 flex-1">
            {data.map((item, index) => (
              <div
                key={item.name}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${index === activeIndex ? 'bg-gray-800' : 'hover:bg-gray-900'
                  }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(0)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-[8px]" style={{ backgroundColor: item.color }} />
                  <span className={`text-sm font-medium ${index === activeIndex ? 'text-white' : 'text-gray-400'}`}>
                    {item.name}
                  </span>
                </div>
                <span className={`text-sm font-bold ${index === activeIndex ? 'text-white' : 'text-gray-300'}`}>
                  {fmtWhole(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};


const FundsCard = ({ funds }) => {
  const totalRaisedINR = funds.totalFundRaisedINR || 0;
  const availableINR = funds.totalAvailableInr || 0;

  // Outer ring: Fund Raised INR — always full (100%), acts as the reference
  // Inner ring: Available Balance as a % of Fund Raised INR — shows how much is ready to withdraw
  const availablePercentage = totalRaisedINR > 0
    ? Math.min((availableINR / totalRaisedINR) * 100, 100)
    : 0;

  const Ring = ({ percentage, color, size, strokeWidth }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <svg width={size} height={size} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1a2130"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
    );
  };

  const fmt = (num) => new Intl.NumberFormat('en-IN').format(num);

  return (
    <Card className="bg-[#1f2633] border border-[#2b3445] rounded-2xl h-full">
      <div className="p-6 h-full flex flex-col">

        <h2 className="text-lg font-semibold text-white mb-6 serialHeading text-[20px] flex-shrink-0">
          Funds Overview
        </h2>

        {/* Concentric Rings */}
        <div className="relative w-48 h-48 mx-auto mb-2 flex-shrink-0">
          {/* Outer: Fund Raised INR (always full green ring) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Ring percentage={100} color="#b9fd5c" size={192} strokeWidth={16} />
          </div>

          {/* Inner: Available Balance as % of Fund Raised INR */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Ring percentage={availablePercentage} color="#ffffff" size={120} strokeWidth={14} />
          </div>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-semibold text-white">
                ₹{fmt(Math.round(totalRaisedINR / 100000))}L
              </p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                Total Raised
              </p>
            </div>
          </div>
        </div>

        {/* Ring legend explaining what each ring means */}
        <div className="flex justify-center gap-6 mb-6 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b9fd5c] flex-shrink-0" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Fund Raised</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white flex-shrink-0" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
              Available
            </span>
          </div>
        </div>

        {/* Credits */}
        <div className="mb-4 flex-1">
          <h3 className="text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1">
            Credits
          </h3>
          <div className="rounded-[8px] p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#b9fd5c] flex-shrink-0" />
              <div>
                <p className="text-[11px] uppercase text-gray-400">Fund Raised in INR</p>
                <p className="text-sm font-medium text-white">₹{fmt(funds.totalFundRaisedINR || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#b9fd5c] flex-shrink-0" />
              <div>
                <p className="text-[11px] uppercase text-gray-400">Fund Raised in USD</p>
                <p className="text-sm font-medium text-white">${fmt(funds.totalFundRaisedUSD || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ready to Withdraw */}
        <div>
          <h3 className="text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1">
            Ready to Withdraw
          </h3>
          <div className="rounded-[8px] p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white flex-shrink-0" />
              <div>
                <p className="text-[11px] uppercase tracking-widest text-gray-400">Available Balance</p>
                <p className="text-sm font-medium text-white">₹{fmt(funds.totalAvailableInr || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white flex-shrink-0" />
              <div>
                <p className="text-[11px] uppercase tracking-widest text-gray-400">Supply Required (USDT)</p>
                <p className="text-sm font-medium text-white">₹{fmt(funds.usdtRequiredToWithdarwInAdmin || 0)}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};


const TokensCard = ({ tokens }) => {
  const [hoveredData, setHoveredData] = useState(null);

  const chartData = [
    {
      key: "totalSoldFromOrders",
      label: "From Orders",
      value: Number(tokens.totalSoldFromOrders || 0),
      color: "#60a5fa",
    },
    {
      key: "bonusJaimaxDistributed",
      label: "Bonus Distributed",
      value: Number(tokens.bonusJaimaxDistributed || 0),
      color: "#bdf34d",
    },
    {
      key: "registrationBonusJaimax",
      label: "Registration Bonus",
      value: Number(tokens.registrationBonusJaimax || 0),
      color: "#c084fc",
    },
  ];

  const sortedChartData = [...chartData].sort((a, b) => b.value - a.value);
  const total = Number(tokens.totalSoldFromUsers || 0);

  return (
    <Card className="h-full">
      <div className="p-6 sm:p-8 bg-[#272c33] font-sans h-full flex flex-col">

        <div className="flex items-center gap-2.5 mb-6 flex-shrink-0">
          <span className="flex-1 text-[22px] font-serif italic tracking-wide text-white serialHeading">
            Total Token Stats
          </span>
        </div>

        {/* Concentric Circles */}
        <div
          className="flex justify-center mb-10 flex-shrink-0"
          onMouseLeave={() => setHoveredData(null)}
        >
          <div className="relative w-52 h-52">
            {sortedChartData.map((item, index) => {
              const inset = index * 16;
              return (
                <div
                  key={item.key}
                  className="absolute rounded-full border-[10px] cursor-pointer transition-opacity hover:opacity-70"
                  style={{
                    inset: `${inset}px`,
                    borderColor: item.color,
                    zIndex: 10 + index,
                  }}
                  onMouseEnter={() => setHoveredData({ label: item.label, value: item.value })}
                />
              );
            })}

            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div
                className="w-24 h-24 bg-[#1a212a] rounded-full flex flex-col items-center justify-center pointer-events-auto border-[4px] border-[#272c33] shadow-inner"
                onMouseEnter={() => setHoveredData(null)}
              >
                <span className="text-2xl text-white font-bold">
                  {hoveredData ? fmtCompact(hoveredData.value) : fmtCompact(total)}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 text-center px-2">
                  {hoveredData ? hoveredData.label : "Total Sold"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-5 pl-1 flex-1">
          <div>
            <h3 className="text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-2">
              Sales Overview
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-500 mt-3 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">From Users</span>
                  <div className="text-[15px] text-white font-medium">{tokens.totalSoldFromUsers || 0}</div>
                </div>
              </div>

              {sortedChartData
                .filter((i) => i.key === "totalSoldFromOrders")
                .map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 cursor-pointer group"
                    onMouseEnter={() => setHoveredData({ label: item.label, value: item.value })}
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-3 flex-shrink-0 group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                        {item.label}
                      </span>
                      <div className="text-[15px] text-white font-medium">{item.value}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-2">
              Bonuses Overview
            </h3>
            <div className="space-y-2.5">
              {sortedChartData
                .filter((i) => i.key === "bonusJaimaxDistributed" || i.key === "registrationBonusJaimax")
                .map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 cursor-pointer group"
                    onMouseEnter={() => setHoveredData({ label: item.label, value: item.value })}
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-3 flex-shrink-0 group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                        {item.label}
                      </span>
                      <div className="text-[15px] text-white font-medium">{item.value}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};



const WithdrawalsCard = ({ withdrawals }) => {
  const total = withdrawals.totalRequests || 0;
  const approved = withdrawals.approved || 0;
  const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;

  return (
    <Card>
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-4">

          <span className="flex-1 text-[20px] font-bold  text-white serialHeading">Withdrawals</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#0d1218]   rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">Total</p>
            <p className="text-lg font-bold text-white">{fmtWhole(total)}</p>
          </div>
          <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">Approved</p>
            <p className="text-lg font-bold text-green-400">{fmtWhole(approved)}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-[#0d1218]   rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">Total Amount</p>
            <p className="text-lg font-bold text-[#b9fd5c]">₹{fmt(withdrawals.totalAmount?.$numberDecimal || 0)}</p>
          </div>
          <div className="bg-[#0d1218]   rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">Total Admin Fee</p>
            <p className="text-lg font-bold text-[#b9fd5c]">₹{fmt(withdrawals.totalAdminCharges?.$numberDecimal || 0)}</p>
          </div>
          <div className="flex items-center justify-between bg-[#0d1218]   rounded-lg px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Approval Rate</span>
            <span className="text-xs font-bold text-green-400">{approvalRate}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};


const WealthPlansCard = ({ wealthPlans }) => {
  const plans = [
    { key: 'gwp1', name: 'Wealth Plan 1', color: '#ffffff' },
    { key: 'gwp2', name: 'Wealth Plan 2', color: '#ffffff' },
    { key: 'gwp3', name: 'Wealth Plan 3', color: '#ffffff' },
  ];

  const totalOrders = plans.reduce((sum, p) => sum + (wealthPlans[p.key]?.totalOrders || 0), 0);
  const totalRaised = plans.reduce((sum, p) => sum + (wealthPlans[p.key]?.totalRaised || 0), 0);

  return (
    <Card>
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-4">
          {/* <div className="p-3 rounded-xl bg-[#b9fd5c] flex items-center justify-center text-black">
            <Briefcase size={22} />
          </div> */}
          <span className="flex-1 text-[20px] font-bold  tracking-widest text-white serialHeading">Wealth Plans</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#0d1218]   rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{fmtWhole(totalOrders)}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">Total Orders</p>

          </div>
          <div className="bg-[#d3e7b8ae]   rounded-xl p-3 text-center">

            <p className="text-xl font-bold text-black">₹{fmtCompact(totalRaised)}</p>

            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800">Total Raised</p>
          </div>
        </div>

        <div className="space-y-2">
          {plans.map(({ key, name, color }) => {
            const plan = wealthPlans[key] || {};
            return (
              <div key={key} className="bg-[#0d1218]   rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color }}>{name}</span>
                  <span className="text-[10px] text-black bg-[#b9fd5c] px-2 py-0.5 rounded-full">
                    {fmtWhole(plan.activeOrders || 0)} active
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[11px] text-[#9dad8f]">Orders</p>
                    <p className="text-[14px] font-bold text-white">{fmtWhole(plan.totalOrders || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9dad8f]">Raised</p>
                    <p className="text-[14px] font-bold" style={{ color }}>₹{fmtCompact(plan.totalRaised || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9dad8f]">Coins Collect</p>
                    <p className="text-[14px] font-bold text-white">{fmtCompact(plan.coinsToCollect || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9dad8f]">Disbursement</p>
                    <p className="text-[14px] font-bold text-white">₹{plan.dailyDisburse || 0}</p>
                  </div>

                </div>

              </div>
            );
          })}
          <p className="text-[8px] text-[#9dad8f] text-center">
            Note: Based on daily amount and coin calculations.
          </p>
        </div>
      </div>
    </Card>
  );
};


const ICORoundsChart = ({ rounds }) => {
  const data = (rounds || []).map(r => ({
    name: `R${r.round}`,
    sold: Number(r.soldQty) || 0,
    remaining: Number(r.remaingQty) || 0,
    status: r.status,
  }));

  return (
    <Card>
      <div className="p-4 sm:p-5">
        <CardHeader title="ICO Rounds Distribution" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2130" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#ffffff", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtCompact(v)} tick={{ fill: "#ffffff", fontSize: 9 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(15, 235, 88, 0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 10, color: "#ffffff", paddingTop: 10 }} iconType="square" iconSize={8} />
              <Bar dataKey="sold" name="Sold" fill="#b9fd5c" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="remaining" name="Remaining" fill="#ffffff" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};


const ActiveICOCard = ({ round, completedRounds, totalRounds }) => {
  if (!round) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center min-h-[280px] gap-3 p-5">
          <AlertCircle size={32} className="text-gray-700" />
          <p className="text-white text-sm font-semibold">No Active ICO Round</p>
        </div>
      </Card>
    );
  }

  const rawPct = Math.min(((round.soldQty || 0) / (round.totalQty || 1)) * 100, 100);
  const animPct = useAnimPct(rawPct);

  return (
    <Card >
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">

          <div className="flex-1">
            {/* <p className="text-[9px] font-bold uppercase tracking-widest text-white">Active ICO</p> */}
            <p className="text-xl font-bold text-white serialHeading">Round {round.round}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/10  rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-green-400">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#0d1218]   rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">Price INR</p>
            <p className="text-lg font-bold text-white">₹{round.atPriceInr}</p>
          </div>
          <div className="bg-[#b9fd5c]/5  rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">Price USDT</p>
            <p className="text-lg font-bold text-[#b9fd5c]">${round.atPriceUsdt}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: "Total", val: round.totalQty, color: "text-gray-300" },
            { label: "Sold", val: round.soldQty, color: "text-[#b9fd5c]" },
            { label: "Left", val: round.remaingQty, color: "text-green-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-[#0d1218] rounded-xl py-2.5 text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">{label}</p>
              <p className={`text-sm font-bold ${color}`}>{fmtCompact(val)}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">Progress</span>
            <span className="text-[11px] font-bold text-[#b9fd5c]">{rawPct.toFixed(2)}%</span>
          </div>

          <div className="h-2 bg-[#0d1218] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#b9fd5c] via-[#b9fd5c] to-[#b9fd5c] shadow-[0_0_8px_rgb(184, 252, 92)] transition-all duration-[1500ms] ease-out"
              style={{ width: `${animPct}%` }}
            />
          </div>
        </div>
        {/* //total supply, sold, left, price in INR and USDT, progress bar with animated fill, and a "Live" badge. */}
        <p className="text-[10px] text-white/40 flex justify-between rounded-xl px-4 py-2 mt-2">Total Supply <span className="text-white font-medium">125B</span></p>
        <p className="text-[10px] text-white/40 flex justify-between rounded-xl px-4 py-1">Completed Rounds <span className="text-white font-medium">{completedRounds}/{totalRounds}</span></p>
      </div>
    </Card >
  );
};
const USDTCard = ({ usdt }) => (
  <Card>
    <div className="p-4 sm:p-5">
      <div className="flex items-center gap-2.5 mb-4">

        <span className="flex-1 text-[20px] font-bold text-white serialHeading">USDT Info</span>
      </div>

      <div className="space-y-3">
        {/* Rate */}
        <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5  rounded-xl p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1.5">Exchange Rate</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">₹{fmt(usdt.rateInr)}</p>
            <span className="text-[10px] text-emerald-400 font-semibold">per USDT</span>
          </div>
        </div>

        {/* Equivalent Required */}
        <div className="bg-[#0d1218]   rounded-xl p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1.5">Equivalent Required</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-blue-400">{fmtWhole(usdt.equivalentUsdtRequired)}</p>
            <span className="text-[10px] text-white font-semibold">USDT</span>
          </div>
          <p className="text-[10px] text-white mt-1">
            ≈ ₹{fmt(usdt.equivalentUsdtRequired * usdt.rateInr)}
          </p>
        </div>

        {/* Admin Balance */}
        <div className="bg-[#0d1218]   rounded-xl p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1.5">Admin Wallet</p>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-amber-400">${usdt.adminWalletBalance}</p>
              <span className="text-[10px] text-white font-semibold">USDT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>
);


const CalendarWidget = () => {
  const today = new Date();
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const first = new Date(cur.y, cur.m, 1).getDay();
  const days = new Date(cur.y, cur.m + 1, 0).getDate();
  const prev = () => setCur(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { ...c, m: c.m - 1 });
  const next = () => setCur(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { ...c, m: c.m + 1 });
  const isToday = (d) => d === today.getDate() && cur.m === today.getMonth() && cur.y === today.getFullYear();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const monthStr = new Date(cur.y, cur.m).toLocaleString("en-US", { month: "long" });
  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <Card>
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          {/* <CalendarIcon size={14} className="text-white" /> */}
          <p className="text-[20px] font-bold text-white serialHeading">Calendar</p>
        </div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={prev} className="p-2 rounded-full bg-[#1d2733] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#b9fd5c]/20 transition-all">
            <ArrowLeft size={20} />
          </button>
          <p className="text-sm font-bold text-white">{monthStr} {cur.y}</p>
          <button onClick={next} className="p-2 rounded-full bg-[#1d2733] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#b9fd5c]/20 transition-all">
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => <div key={d} className="text-center text-[13px] font-bold text-white py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((d, i) => (
            <div key={i} className={`text-center text-[11px] p-2.5 rounded-full cursor-pointer transition-all font-medium
              ${!d ? "" : isToday(d) ? "bg-[#b9fd5c] text-black font-bold shadow-[0_0_10px_rgb(184, 252, 92)]" : "text-gray-400 hover:bg-[#1d2733] hover:text-white"}`}>
              {d || ""}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};



const TopInvestorsCard = ({ topInvestors = [] }) => {
  const [activeId, setActiveId] = useState(null);

  const fmt = (num) =>
    num >= 100000
      ? `₹${(num / 100000).toFixed(1)}L`
      : `₹${new Intl.NumberFormat("en-IN").format(num)}`;

  const initials = (name) =>
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const toTitleCase = (name) =>
    name.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const ringColors = [
    { ring: "border-[#b9fd5c]", bg: "bg-[#b9fd5c]/10", text: "text-[#b9fd5c]" },
    { ring: "border-[#60a5fa]", bg: "bg-[#60a5fa]/10", text: "text-[#60a5fa]" },
    { ring: "border-[#c084fc]", bg: "bg-[#c084fc]/10", text: "text-[#c084fc]" },
    { ring: "border-[#f97316]", bg: "bg-[#f97316]/10", text: "text-[#f97316]" },
    { ring: "border-[#f43f5e]", bg: "bg-[#f43f5e]/10", text: "text-[#f43f5e]" },
  ];

  const handleEmail = (e, investor) => {
    e.stopPropagation();
    if (investor.email) {
      window.location.href = `mailto:${investor.email}`;
    } else {
      // fallback: open mail compose with just subject
      window.location.href = `mailto:?subject=Regarding your investment - ${toTitleCase(investor.name)}`;
    }
  };

  const handlePhone = (e, investor) => {
    e.stopPropagation();
    if (investor.phone) {
      window.location.href = `tel:${investor.phone}`;
    }
  };

  return (
    <div className="bg-[#282f35] rounded-lg p-4 sm:p-6 w-full shadow-2xl">

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-white text-[20px] font-semibold  serialHeading">
          Top 3 Investors
        </h2>
        <p className="text-gray-500 text-xs mt-0.5">Ranked by total investment</p>
      </div>

      {/* List */}
      <div className="flex flex-col gap-1.5">
        {topInvestors.map((investor, index) => {
          const isActive = activeId === investor.userId;
          const color = ringColors[index % ringColors.length];
          const hasPhone = !!investor.phone;
          const hasEmail = !!investor.email;

          return (
            <div
              key={investor.userId}
              onMouseEnter={() => setActiveId(investor.userId)}
              onMouseLeave={() => setActiveId(null)}
              className={`flex items-center gap-3 px-1 py-1 rounded-full cursor-pointer transition-all duration-200
                ${isActive ? "bg-[#b9fd5c]" : "hover:bg-white/5"}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                  text-xs sm:text-sm font-bold flex-shrink-0 border-2 transition-all duration-200
                  ${isActive
                    ? `bg-[#1a1d23] border-[#1a1d23] ${color.text}`
                    : `${color.bg} ${color.ring} ${color.text}`
                  }`}
              >
                {initials(investor.name)}
              </div>

              {/* Name + Username + Amount */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold truncate transition-colors duration-200
                    ${isActive ? "text-[#1a1d23]" : "text-white"}`}
                >
                  {toTitleCase(investor.name)}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[10px] font-mono tracking-wide transition-colors duration-200
                      ${isActive ? "text-[#2d3a1a]" : "text-gray-500"}`}
                  >
                    {investor.username}
                  </span>
                  <span className={`text-[10px] ${isActive ? "text-[#2d3a1a]" : "text-gray-500"}`}>·</span>
                  <span
                    className={`text-[11px] font-semibold transition-colors duration-200
                      ${isActive ? "text-[#1a1d23]" : color.text}`}
                  >
                    {fmt(investor.investedAmount)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0">
                {isActive ? (
                  <div className="flex items-center gap-1.5">
                    {/* Email button */}
                    <button
                      onClick={(e) => handleEmail(e, investor)}
                      className={`w-8 h-8 rounded-full bg-[#1a1d23] flex items-center justify-center
                        transition-all duration-150
                        ${hasEmail
                          ? "text-[#b9fd5c] hover:bg-[#b9fd5c] hover:text-[#1a1d23] cursor-pointer"
                          : "text-gray-600 cursor-not-allowed opacity-50"
                        }`}
                      title={hasEmail ? `Email ${toTitleCase(investor.name)}` : "No email available"}
                      disabled={!hasEmail}
                    >
                      <Mail size={14} />
                    </button>

                    {/* Phone button */}
                    <button
                      onClick={(e) => handlePhone(e, investor)}
                      className={`w-8 h-8 rounded-full bg-[#1a1d23] flex items-center justify-center
                        transition-all duration-150
                        ${hasPhone
                          ? "text-[#b9fd5c] hover:bg-[#b9fd5c] hover:text-[#1a1d23] cursor-pointer"
                          : "text-gray-600 cursor-not-allowed opacity-50"
                        }`}
                      title={hasPhone ? `Call ${toTitleCase(investor.name)}` : "No phone available"}
                      disabled={!hasPhone}
                    >
                      <Phone size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="text-white text-xl rounded-full w-5 h-5 flex items-center justify-center opacity-80">
                    ⋮
                  </span>

                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};





const Dashboard = () => {
  const { data: response, isLoading, isError, error, refetch } = useGetDetailsQuery();

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="min-h-screenflex items-center justify-center p-4">
        <Card className="max-w-sm w-full p-8 text-center">
          <div className="w-12 h-12 rounded-[8px] bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Activity size={22} className="text-red-400" />
          </div>
          <p className="text-white text-sm mb-6">{error?.data?.message || "Failed to load dashboard"}</p>
          <button onClick={refetch} className="w-full bg-[#b9fd5c] hover:bg-[#a4ff5c] text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <RefreshCw size={13} /> Retry
          </button>
        </Card>
      </div>
    );
  }

  const d = response?.data;
  if (!d) return <div className="min-h-screenflex items-center justify-center text-white text-sm">No data available</div>;

  // const userData = Cookies.get("userData")
  const userData = Cookies.get("adminUserData");
  // return userDataObj ? JSON.parse(userData) : null;
  const userDataObj = userData ? JSON.parse(userData) : null;
  console.log("UserData from localStorage:", userDataObj);

  // const activeRound = d.ico?.rounds?.find(r => r.status === 2) || d.ico?.rounds?.find(r => r.status === 1);
  // console.log(activeRound,"hello")
  // const totalRounds = d.ico?.rounds?.length || 0;
  // const completedRounds = d.ico?.rounds?.filter(r => r.status === 2).length || 0;
const activeRound = d.ico?.rounds?.find(r => r.status === 1);
console.log(activeRound,"hello")
const totalRounds = d.ico?.rounds?.length || 0;
const completedRounds = d.ico?.rounds?.filter(r => r.status === 1).length || 0;
  return (
    <div className="min-h-screen text-white mb-5 sm:mb-15">
      <div className="max-w-450 mx-auto p-3 sm:p-5 mt-2 lg:p-6">

        {/* HEADER */}
        {/* <Card className="mb-6 overflow-hidden border-0 bg-[#282f35] shadow-xl shadow-black/30">
          <div className="relative px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <p className="text-xs font-medium tracking-wider text-gray-400 mb-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              <h1 className="text-2xl sm:text-3xl serialHeading font-semibold text-white leading-tight">
                {getGreeting()}, &nbsp;
                <span className="text-[#b9fd5c] ">
                  {userDataObj ? userDataObj.data.name || "Admin" : "Admin"}
                </span>
              </h1>

              <p className="text-sm text-gray-400 mt-1">
                Welcome back to your dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_#34d399aa]" />
                <span className="text-xs font-semibold tracking-wide text-green-800">
                  Live
                </span>
              </div>
            </div>
          </div>
        </Card> */}
<Card className="mb-6 overflow-hidden border-0 bg-[#282f35] shadow-xl shadow-black/30 relative">
  
  {/* Grid Background - Fades from Right */}
  <div 
    className="absolute inset-0"
    style={{
      backgroundImage: `
        linear-gradient(to right, #b9fd5c08 1px, transparent 1px),
        linear-gradient(to bottom, #b9fd5c08 1px, transparent 1px)
      `,
      backgroundSize: '30px 30px',
      maskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)'
    }}
  />

  {/* Diagonal Gradient Highlight */}
  <div className="absolute inset-0 " />

  {/* Accent Glow */}
  {/* <div className="absolute right-10 top-1/2 -translate-y-1/2 w-28 h-28 bg-[#b9fd5c]/15 rounded-full blur-3xl" /> */}

  <div className="relative px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
    {/* Left Section */}
    <div>
      <p className="text-xs font-medium tracking-wider text-gray-400 mb-1">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <h1 className="text-2xl sm:text-3xl serialHeading font-semibold text-white leading-tight">
        {getGreeting()}, &nbsp;
        <span className="text-[#b9fd5c]">
          {userDataObj ? userDataObj.data.name || "Admin" : "Admin"}
        </span>
      </h1>

      <p className="text-sm text-gray-400 mt-1">
        Welcome back to your dashboard
      </p>
    </div>

    {/* Right Section */}
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#34d399aa]" />
        <span className="text-xs font-semibold tracking-wide text-green-400">
          Live
        </span>
      </div>
    </div>
  </div>
</Card>

        <div className="flex flex-col xl:flex-row gap-4">

          {/* LEFT CONTENT */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Key Metrics - 4 cards */}
            <section>
              <SL>Key Metrics</SL>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard title="All Users" value={fmtWhole(d.community.allUsers)} sub={`${fmtWhole(d.community.activeUsers)} active`} icon={Users} />
                <StatCard title="Tokens Sold" value={fmtCompact(d.tokens.totalSoldFromUsers)} sub="From Users" icon={Coins} />
                <StatCard title="Available Balance" value={`₹${fmtWhole(d.funds.totalAvailableInr)}`} sub="Total Funds" icon={Wallet} />
                <StatCard title="USDT Rate" value={`₹${d.usdt.rateInr}`} sub="Per 1 USDT" icon={ArrowLeftRight} />
              </div>
            </section>

            {/* ICO Chart */}
            <section>
              <SL cla>ICO Tokenomics</SL>
              <ICORoundsChart rounds={d.ico.rounds} />
            </section>

            {/* Community + Funds + Tokens */}
            <section>
              <SL>Overview</SL>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <CommunityCard community={d.community} />
                <FundsCard funds={d.funds} />
                <TokensCard tokens={d.tokens} />
              </div>
            </section>

            {/* Withdrawals + Wealth Plans + Active ICO */}
            <section>
              <SL>Financial & Plans</SL>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <WithdrawalsCard withdrawals={d.withdrawals} />
                <ActiveICOCard round={activeRound} completedRounds={completedRounds} totalRounds={totalRounds} />
                <USDTCard usdt={d.usdt} />
              </div>
            </section>




          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="w-full xl:w-[290px] 2xl:w-[310px] flex-shrink-0 flex flex-col gap-3">
            <CalendarWidget />
            <WealthPlansCard wealthPlans={d.wealthPlans} />

            <Card>
              <div className="p-4 sm:p-5">
                <CardHeader title="Quick Stats" action={null} />
                <div className="space-y-3">
                  {[
                    { label: "Gradual Layer Bonus", value: d.funds.gradualLayerBonus, icon: Gift, color: "text-violet-400" },
                    { label: "Withdraw Requests", value: d.withdrawals.totalRequests, icon: Activity, color: "text-blue-400" },
                    { label: "Withdraw Approved", value: d.withdrawals.approved, icon: CheckCircle, color: "text-green-400" },
                    { label: "Total Orders", value: d.orders.totalCompletedOrders, icon: CheckCircle, color: "text-green-400" },
                    // { label: "Total Referrals", value: d.community.totalReferrals, icon: Users, color: "text-purple-400" },
                    { label: "Wallet Orders", value: d.orders.walletOrders, icon: Wallet, color: "text-emerald-400" },
                    { label: "Available Balance Orders", value: d.orders.availableBalanceOrders, icon: Wallet, color: "text-emerald-400" },
                    { label: "BSC Ex Orders", value: d.orders.bscExchangeOrders, icon: ArrowUpCircle, color: "text-yellow-400" },
                    { label: "Token Swap Orders", value: d.orders.swapOrders, icon: ArrowUpCircle, color: "text-yellow-400" },
                    //gradulelayerbonus





                    // { label: "Admin Users", value: d.community.adminUsers, icon: Shield, color: "text-amber-400" },
                    // { label: "Blocked Users", value: d.community.blockedUsers, icon: XCircle, color: "text-red-400" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between bg-[#0d1218]   rounded-[8px] p-3">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={color} />
                        <span className="text-[10px] text-white font-medium">{label}</span>
                      </div>
                      <span className={`text-sm font-bold ${color}`}>{fmtWhole(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <TopInvestorsCard topInvestors={d.topInvestors} />
          </aside>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;