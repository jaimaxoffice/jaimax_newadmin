// // import React, { useState } from "react";
// // import { useGetAdminDashboardQuery } from "./miningApiSlice";
// // import Loader from "../../reusableComponents/Loader/Loader";
// // import StatCard from "../../reusableComponents/StatCards/GradientCard";
// // import {
// //   Zap, Clock, Wallet, TrendingUp, Activity, CheckCircle, XCircle,
// //   AlertCircle, RefreshCw, ArrowLeft, ArrowRight, Gift, Shield,
// //   Pickaxe, Target, ArrowUpRight, ArrowDownRight
// // } from "lucide-react";
// // import {
// //   AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
// //   ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line
// // } from "recharts";

// // // ==================== FORMATTING UTILITIES ====================
// // const fmt = (n, d = 2) => {
// //   if (n == null) return "0";
// //   return new Intl.NumberFormat("en-IN", {
// //     minimumFractionDigits: d,
// //     maximumFractionDigits: d,
// //   }).format(Number(n));
// // };

// // const fmtWhole = (n) => {
// //   if (n == null) return "0";
// //   return new Intl.NumberFormat("en-IN").format(Number(n));
// // };

// // const fmtCompact = (n) => {
// //   if (n == null) return "0";
// //   const v = Number(n);
// //   if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
// //   if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
// //   if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
// //   return v.toFixed(2);
// // };

// // // ==================== REUSABLE COMPONENTS ====================
// // const SL = ({ children }) => (
// //   <h2 className="text-lg sm:text-xl font-bold serialHeading text-white mb-3 mt-1 flex items-center gap-2">
// //     {children}
// //   </h2>
// // );

// // const Card = ({ children, className = "", accent = false }) => (
// //   <div
// //     className={`relative overflow-hidden rounded-[12px] transition-all duration-300
// //     hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(185,253,92,0.15)]
// //     ${
// //       accent
// //         ? "bg-gradient-to-br from-[#282f35] to-[#1f2530]"
// //         : "bg-gradient-to-br from-[#282f35] to-[#1f2530] border border-[#1d2733]"
// //     } ${className}`}
// //   >
// //     {children}
// //   </div>
// // );

// // const CardHeader = ({ title, action }) => (
// //   <div className="flex items-center justify-between mb-4 text-base sm:text-lg serialHeading">
// //     <p className="font-bold text-white serialHeading">{title}</p>
// //     {action && (
// //       <span className="font-bold text-[#b9fd5c] cursor-pointer hover:underline text-xs sm:text-sm">
// //         {action}
// //       </span>
// //     )}
// //   </div>
// // );

// // const ChartTip = ({ active, payload, label }) => {
// //   if (!active || !payload?.length) return null;
// //   return (
// //     <div className="bg-[#282f35] border border-[#b9fd5c]/30 rounded-xl px-3 py-2 shadow-2xl text-xs min-w-[110px]">
// //       <p className="text-[#b9fd5c] font-semibold mb-1.5">{label}</p>
// //       {payload.map((p, i) => (
// //         <p key={i} className="font-bold text-xs" style={{ color: p.color || p.fill }}>
// //           {p.name}: {fmtCompact(p.value)}
// //         </p>
// //       ))}
// //     </div>
// //   );
// // };

// // // ==================== MINING SPECIFIC COMPONENTS ====================

// // const TodayStatsCard = ({ todayStats, yesterdayStats }) => {
// //   const mineData = [
// //     { name: "Claimed", value: todayStats?.claimedMines || 0, color: "#b9fd5c" },
// //     { name: "Not Claimed", value: todayStats?.notClaimedMines || 0, color: "#6b7280" },
// //   ];

// //   const totalMines = (todayStats?.claimedMines || 0) + (todayStats?.notClaimedMines || 0);
// //   const yesterdayTotal = (yesterdayStats?.claimedMines || 0) + (yesterdayStats?.notClaimedMines || 0);
// //   const minesChange = totalMines - yesterdayTotal;
// //   const percentChange = yesterdayTotal === 0 ? 0 : ((minesChange / yesterdayTotal) * 100).toFixed(1);

// //   return (
// //     <Card className="h-full">
// //       <div className="relative p-4 sm:p-5 md:p-6 overflow-hidden h-full">
// //         <div className="relative z-10 h-full flex flex-col">
// //           <div className="mb-4 flex-shrink-0">
// //             <h3 className="text-lg font-bold text-white serialHeading">Today's Mining</h3>
// //           </div>

// //           {/* Pie Chart */}
// //           <div className="relative h-40 sm:h-48 mb-4 sm:mb-6 flex-shrink-0">
// //             {totalMines > 0 && (
// //               <div className="absolute inset-0">
// //                 <ResponsiveContainer width="100%" height="100%">
// //                   <PieChart>
// //                     <Pie
// //                       data={mineData}
// //                       cx="50%"
// //                       cy="50%"
// //                       innerRadius="60%"
// //                       outerRadius="90%"
// //                       dataKey="value"
// //                       stroke="none"
// //                       isAnimationActive={false}
// //                     >
// //                       {mineData.map((entry, index) => (
// //                         <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
// //                       ))}
// //                     </Pie>
// //                   </PieChart>
// //                 </ResponsiveContainer>
// //               </div>
// //             )}

// //             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
// //               <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#b9fd5c] to-[#9fff42] bg-clip-text text-transparent">
// //                 {fmtWhole(totalMines)}
// //               </p>
// //               <p className="text-xs text-gray-400 mt-1">Total Mines</p>
// //             </div>
// //           </div>

// //           {/* Legend */}
// //           <div className="space-y-2 pt-3 border-t border-gray-800 flex-1 min-h-0">
// //             {mineData.map((item) => {
// //               return (
// //                 <div
// //                   key={item.name}
// //                   className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-[#0d1218]/50 transition-colors"
// //                 >
// //                   <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
// //                     <span
// //                       className="w-2 h-2 sm:w-3 sm:h-3 rounded-[8px] flex-shrink-0"
// //                       style={{ backgroundColor: item.color }}
// //                     />
// //                     <div className="flex-1 min-w-0">
// //                       <span className="text-xs sm:text-sm font-medium text-gray-300">
// //                         {item.name}
// //                       </span>
// //                     </div>
// //                   </div>
// //                   <span className="text-xs sm:text-sm font-bold text-[#b9fd5c] flex-shrink-0 ml-2">
// //                     {fmtWhole(item.value)}
// //                   </span>
// //                 </div>
// //               );
// //             })}
// //           </div>

// //           {/* Comparison */}
// //           <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800 space-y-3 flex-shrink-0">
// //             <div className="grid grid-cols-2 gap-2">
// //               <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-2.5 sm:p-3">
// //                 <p className="text-[9px] sm:text-[10px] text-blue-300 font-semibold uppercase tracking-widest mb-1">
// //                   Today
// //                 </p>
// //                 <p className="text-lg sm:text-2xl font-bold text-blue-400">
// //                   {fmtWhole(totalMines)}
// //                 </p>
// //               </div>
// //               <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/30 rounded-lg p-2.5 sm:p-3">
// //                 <p className="text-[9px] sm:text-[10px] text-gray-300 font-semibold uppercase tracking-widest mb-1">
// //                   Yesterday
// //                 </p>
// //                 <p className="text-lg sm:text-2xl font-bold text-gray-400">
// //                   {fmtWhole(yesterdayTotal)}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </Card>
// //   );
// // };

// // const ComparisonChartCard = ({ todayStats, yesterdayStats }) => {
// //   if (!todayStats || !yesterdayStats) {
// //     return (
// //       <Card>
// //         <div className="p-4 sm:p-5 flex items-center justify-center h-60 sm:h-80">
// //           <p className="text-gray-400 text-xs sm:text-sm">No comparison data available</p>
// //         </div>
// //       </Card>
// //     );
// //   }

// //   const chartData = [
// //     {
// //       name: "Today",
// //       claimed: todayStats?.claimedMines || 0,
// //       notClaimed: todayStats?.notClaimedMines || 0,
// //       total: (todayStats?.claimedMines || 0) + (todayStats?.notClaimedMines || 0),
// //     },
// //     {
// //       name: "Yesterday",
// //       claimed: yesterdayStats?.claimedMines || 0,
// //       notClaimed: yesterdayStats?.notClaimedMines || 0,
// //       total: (yesterdayStats?.claimedMines || 0) + (yesterdayStats?.notClaimedMines || 0),
// //     },
// //   ];

// //   return (
// //     <Card className="w-full">
// //       <div className="p-4 sm:p-5 md:p-6">
// //         <CardHeader title="📊 Today vs Yesterday Chart" />
        
// //         <div className="w-full h-60 sm:h-80">
// //           <ResponsiveContainer width="100%" height="100%">
// //             <BarChart
// //               data={chartData}
// //               margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
// //             >
// //               <CartesianGrid strokeDasharray="3 3" stroke="#1d2733" vertical={false} />
// //               <XAxis 
// //                 dataKey="name" 
// //                 stroke="#6b7280" 
// //                 style={{ fontSize: "12px" }}
// //               />
// //               <YAxis 
// //                 stroke="#6b7280"
// //                 style={{ fontSize: "12px" }}
// //               />
// //               <Tooltip content={<ChartTip />} />
// //               <Legend 
// //                 wrapperStyle={{ paddingTop: "20px" }}
// //                 iconType="square"
// //               />
// //               <Bar dataKey="claimed" fill="#b9fd5c" radius={[8, 8, 0, 0]} name="Claimed" />
// //               <Bar dataKey="notClaimed" fill="#6b7280" radius={[8, 8, 0, 0]} name="Not Claimed" />
// //             </BarChart>
// //           </ResponsiveContainer>
// //         </div>
// //       </div>
// //     </Card>
// //   );
// // };

// // const AccountStatsCard = ({ accountStats }) => {
// //   if (!accountStats) {
// //     return (
// //       <Card className="h-full">
// //         <div className="p-4 sm:p-5 md:p-6 h-full flex items-center justify-center">
// //           <p className="text-gray-400 text-xs sm:text-sm">No account data available</p>
// //         </div>
// //       </Card>
// //     );
// //   }

// //   return (
// //     <Card className="h-full">
// //       <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col">
// //         <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 serialHeading flex-shrink-0">
// //           Account Overview
// //         </h2>

// //         {/* Main Stats Grid */}
// //         <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 flex-shrink-0">
// //           <div className="bg-gradient-to-br from-[#0d1218] to-[#0a0f14] rounded-xl p-2.5 sm:p-3 border border-[#1d2733] text-center hover:border-[#b9fd5c]/30 transition-colors">
// //             <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
// //               Total Accounts
// //             </p>
// //             <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#b9fd5c] to-[#9fff42] bg-clip-text text-transparent">
// //               {fmtWhole(accountStats?.totalAccounts || 0)}
// //             </p>
// //           </div>
// //           <div className="bg-gradient-to-br from-[#0d1218] to-[#0a0f14] rounded-xl p-2.5 sm:p-3 border border-[#1d2733] text-center hover:border-[#b9fd5c]/30 transition-colors">
// //             <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
// //               Active Accounts
// //             </p>
// //             <p className="text-xl sm:text-2xl font-bold text-[#b9fd5c]">
// //               {fmtWhole(accountStats?.activeAccounts || 0)}
// //             </p>
// //           </div>
// //         </div>

// //         {/* Balance Cards */}
// //         <div className="space-y-2 sm:space-y-3 flex-1 min-h-0">
// //           <div>
// //             <h3 className="text-[9px] sm:text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1.5">
// //               Mined Balance
// //             </h3>
// //             <div className="rounded-[10px] p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-[#0d1218] to-[#0a0f14] border border-[#1d2733] space-y-2 hover:border-[#b9fd5c]/20 transition-colors">
// //               <div className="flex items-center gap-2 sm:gap-3">
// //                 <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#b9fd5c] flex-shrink-0" />
// //                 <div className="min-w-0 flex-1">
// //                   <p className="text-[9px] sm:text-[11px] uppercase text-gray-500">
// //                     Total Mined
// //                   </p>
// //                   <p className="text-xs sm:text-sm font-bold text-[#b9fd5c] break-all">
// //                     {accountStats?.totalBalanceMined || "0"}
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           <div>
// //             <h3 className="text-[9px] sm:text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1.5">
// //               Lifetime Earnings
// //             </h3>
// //             <div className="rounded-[10px] p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-[#0d1218] to-[#0a0f14] border border-[#1d2733] space-y-2 sm:space-y-3 hover:border-[#b9fd5c]/20 transition-colors">
// //               <div className="flex items-center gap-2 sm:gap-3">
// //                 <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400 flex-shrink-0" />
// //                 <div className="min-w-0 flex-1">
// //                   <p className="text-[9px] sm:text-[11px] uppercase text-gray-500">
// //                     Total Earned
// //                   </p>
// //                   <p className="text-xs sm:text-sm font-bold text-green-400 break-all">
// //                     {accountStats?.totalBalanceEarnedLifetime || "0"}
// //                   </p>
// //                 </div>
// //               </div>
// //               <div className="flex items-center gap-2 sm:gap-3">
// //                 <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-400 flex-shrink-0" />
// //                 <div className="min-w-0 flex-1">
// //                   <p className="text-[9px] sm:text-[11px] uppercase text-gray-500">
// //                     Referral Earnings
// //                   </p>
// //                   <p className="text-xs sm:text-sm font-bold text-blue-400 break-all">
// //                     {accountStats?.totalReferralEarnings || "0"}
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           <div>
// //             <h3 className="text-[9px] sm:text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1.5">
// //               Account Status
// //             </h3>
// //             <div className="rounded-[10px] p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-[#0d1218] to-[#0a0f14] border border-[#1d2733] space-y-2 hover:border-[#b9fd5c]/20 transition-colors">
// //               <div className="flex items-center justify-between">
// //                 <div className="flex items-center gap-2 min-w-0 flex-1">
// //                   <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 flex-shrink-0" />
// //                   <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase truncate">
// //                     Recovery Accounts
// //                   </span>
// //                 </div>
// //                 <span className="text-xs sm:text-sm font-bold text-yellow-400 flex-shrink-0 ml-2">
// //                   {fmtWhole(accountStats?.recoveryAccounts || 0)}
// //                   {console.log(accountStats,"hello")}
// //                 </span>
// //               </div>
// //               <div className="flex items-center justify-between">
// //                 <div className="flex items-center gap-2 min-w-0 flex-1">
// //                   <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 flex-shrink-0" />
// //                   <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase truncate">
// //                     Resurrection Accounts
// //                   </span>
// //                 </div>
// //                 <span className="text-xs sm:text-sm font-bold text-purple-400 flex-shrink-0 ml-2">
// //                   {fmtWhole(accountStats?.resurrectionAccounts || 0)}
// //                 </span>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </Card>
// //   );
// // };

// // const SlotsCard = ({ slotsInfo }) => {
// //   const [hoveredSlot, setHoveredSlot] = useState(null);
// //   const activeSlot = slotsInfo?.activeSlot;

// //   const getSlotStatus = (slot) => {
// //     if (slot?.isActive) return { label: "ACTIVE", color: "bg-green-500/20 border-green-500/50", text: "text-green-400" };
// //     return { label: "INACTIVE", color: "bg-gray-500/10 border-gray-500/30", text: "text-gray-400" };
// //   };

// //   if (!slotsInfo || !slotsInfo.slots || slotsInfo.slots.length === 0) {
// //     return (
// //       <Card className="h-full">
// //         <div className="p-4 sm:p-5 md:p-6 h-full flex items-center justify-center">
// //           <p className="text-gray-400 text-xs sm:text-sm">No slot data available</p>
// //         </div>
// //       </Card>
// //     );
// //   }

// //   return (
// //     <Card className="h-full">
// //       <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col">
// //         <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
// //           <h2 className="text-base sm:text-lg font-semibold text-white serialHeading">
// //             Mining Slots
// //           </h2>
// //           <span className="text-[8px] sm:text-[10px] text-gray-400 font-medium px-2 py-1 bg-[#0d1218] rounded-lg whitespace-nowrap">
// //             {slotsInfo?.date || "N/A"}
// //           </span>
// //         </div>

// //         {/* Active Slot Highlight */}
// //         {activeSlot && (
// //           <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#0d1218] via-[#1a2330] to-[#0a0f14] border border-[#b9fd5c]/50 flex-shrink-0 shadow-lg shadow-[#b9fd5c]/10">
// //             <div className="flex items-center justify-between mb-2">
// //               <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-[#b9fd5c]">
// //                 Currently Active
// //               </span>
// //               <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#b9fd5c] animate-pulse" />
// //             </div>
// //             <p className="text-base sm:text-lg font-bold text-[#b9fd5c] mb-1">
// //               Slot {activeSlot?.slotNumber || "N/A"}
// //             </p>
// //             <p className="text-[10px] sm:text-[12px] text-gray-400">
// //               {String(activeSlot?.startHour || 0).padStart(2, "0")}:00 -{" "}
// //               {String(activeSlot?.endHour || 0).padStart(2, "0")}:00
// //             </p>
// //           </div>
// //         )}

// //         {/* All Slots Grid */}
// //         <div className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-1 min-h-0">
// //           {(slotsInfo?.slots || []).map((slot) => {
// //             const status = getSlotStatus(slot);
// //             const isHovered = hoveredSlot === slot?.slotNumber;

// //             return (
// //               <div
// //                 key={slot?.slotNumber}
// //                 onMouseEnter={() => setHoveredSlot(slot?.slotNumber)}
// //                 onMouseLeave={() => setHoveredSlot(null)}
// //                 className={`p-2.5 sm:p-3 rounded-lg transition-all duration-200 cursor-pointer border
// //                   ${
// //                     isHovered
// //                       ? "bg-[#1d2733] border-[#b9fd5c]/50 shadow-lg shadow-[#b9fd5c]/10"
// //                       : "bg-[#0d1218] border-[#1d2733]"
// //                   }`}
// //               >
// //                 <div className="flex items-center justify-between mb-2">
// //                   <span className="text-xs sm:text-sm font-bold text-white">
// //                     Slot {slot?.slotNumber || "N/A"}
// //                   </span>
// //                   <span
// //                     className={`text-[7px] sm:text-[8px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full border ${status.color} ${status.text}`}
// //                   >
// //                     {status.label}
// //                   </span>
// //                 </div>
// //                 <p className={`text-[10px] sm:text-[11px] ${isHovered ? "text-[#b9fd5c]" : "text-gray-400"}`}>
// //                   {String(slot?.startHour || 0).padStart(2, "0")}:00 -{" "}
// //                   {String(slot?.endHour || 0).padStart(2, "0")}:00
// //                 </p>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       </div>
// //     </Card>
// //   );
// // };

// // const MiningComparisonCard = ({ todayStats, yesterdayStats }) => {
// //   if (!todayStats || !yesterdayStats) {
// //     return (
// //       <Card>
// //         <div className="p-4 sm:p-5 flex items-center justify-center">
// //           <p className="text-gray-400 text-xs sm:text-sm">No comparison data available</p>
// //         </div>
// //       </Card>
// //     );
// //   }

// //   const comparison = [
// //     {
// //       label: "Total Mines",
// //       today: todayStats?.totalMines || 0,
// //       yesterday: yesterdayStats?.totalMines || 0,
// //       icon: Pickaxe,
// //       color: "text-[#b9fd5c]",
// //       bgColor: "bg-[#b9fd5c]/10",
// //     },
// //     {
// //       label: "Claimed",
// //       today: todayStats?.claimedMines || 0,
// //       yesterday: yesterdayStats?.claimedMines || 0,
// //       icon: CheckCircle,
// //       color: "text-green-400",
// //       bgColor: "bg-green-400/10",
// //     },
// //     {
// //       label: "Not Claimed",
// //       today: todayStats?.notClaimedMines || 0,
// //       yesterday: yesterdayStats?.notClaimedMines || 0,
// //       icon: XCircle,
// //       color: "text-orange-400",
// //       bgColor: "bg-orange-400/10",
// //     },
// //   ];

// //   return (
// //     <Card>
// //       <div className="p-4 sm:p-5">
// //         {comparison.map((item) => (
// //           <div key={item.label} className="mb-3 last:mb-0">
// //             <p className="text-xs font-semibold text-gray-400 mb-1">{item.label}</p>
// //           </div>
// //         ))}
// //       </div>
// //     </Card>
// //   );
// // };

// // // ==================== MAIN DASHBOARD ====================
// // const MiningDashboard = () => {
// //   const { data: response, isLoading, isError, error, refetch } =
// //     useGetAdminDashboardQuery();

// //   if (isLoading) return <Loader />;

// //   if (isError) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center p-4">
// //         <Card className="max-w-sm w-full p-6 sm:p-8 text-center">
// //           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[8px] bg-[#1d2733] flex items-center justify-center mx-auto mb-4">
// //             <AlertCircle size={20} className="text-white" />
// //           </div>
// //           <p className="text-white text-xs sm:text-sm mb-6">
// //             {error?.data?.message || "Failed to load dashboard"}
// //           </p>
// //           <button
// //             onClick={refetch}
// //             className="w-full bg-[#b9fd5c] hover:bg-[#a4ff5c] text-black text-xs font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
// //           >
// //             <RefreshCw size={13} /> Retry
// //           </button>
// //         </Card>
// //       </div>
// //     );
// //   }

// //   const d = response?.data;
// //   if (!d) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center text-white text-xs sm:text-sm">
// //         No data available
// //       </div>
// //     );
// //   }

// //   // Safe access with fallbacks
// //   const todayStats = d.todayStats || {};
// //   const yesterdayStats = d.yesterdayStats || {};
// //   const accountStats = d.accountStats || {};
// //   const walletStats = d.walletStats || {};
// //   const slotsInfo = d.slotsInfo || {};

// //   const todayMines = (todayStats?.claimedMines || 0) + (todayStats?.notClaimedMines || 0);
// //   const yesterdayMines = (yesterdayStats?.claimedMines || 0) + (yesterdayStats?.notClaimedMines || 0);

// //   return (
// //     <div className="min-h-screen text-white bg-[#0a0f14]">
// //       <div className="w-full max-w-full px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">

// //         <div className="flex flex-col xl:flex-row gap-4 sm:gap-5 md:gap-6">
          
// //           {/* LEFT CONTENT */}
// //           <div className="flex-1 min-w-0 space-y-4 sm:space-y-5 md:space-y-6">
            
// //             {/* Key Metrics */}
// //             <section className="space-y-3">
// //               <SL> Wallet & Mining Stats</SL>
// //               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
// //                 <StatCard
// //                   title="Total Wallets"
// //                   value={fmtWhole(walletStats?.totalWallets || 0)}
// //                   subtitle="Connected Wallets"
// //                   icon={Wallet}
// //                 />
// //                 <StatCard
// //                   title="Mined Balance"
// //                   value={walletStats?.totalBalanceMined || "0"}
// //                   subtitle="Total Mined"
// //                   icon={Pickaxe}
// //                 />
// //                 <StatCard
// //                   title="Lifetime Earned"
// //                   value={walletStats?.totalBalanceEarnedLifetime || "0"}
// //                   subtitle="Total Earnings"
// //                   icon={TrendingUp}
// //                 />
// //                 <StatCard
// //                   title="Referral Earnings"
// //                   value={walletStats?.totalReferralEarnings || "0"}
// //                   subtitle="Referral Bonus"
// //                   icon={Gift}
// //                 />
// //               </div>
// //             </section>

// //             {/* Main Cards */}
// //             <section className="space-y-3">
// //               <SL> Mining Overview</SL>
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
// //                 <TodayStatsCard
// //                   todayStats={todayStats}
// //                   yesterdayStats={yesterdayStats}
// //                 />
// //                 <AccountStatsCard accountStats={accountStats} />
// //               </div>
// //             </section>


// //           </div>

// //           {/* RIGHT SIDEBAR */}
// //           <aside className="w-full xl:w-80 2xl:w-96 flex-shrink-0 flex flex-col gap-4 sm:gap-5 md:gap-6">
            
// //             {/* Quick Stats */}
// //             <Card>
// //               <div className="p-4 sm:p-5 md:p-6">
// //                 <CardHeader title=" Quick Stats" action={null} />
// //                 <div className="space-y-2">
// //                   {[
// //                     {
// //                       label: "Today Mines",
// //                       value: todayMines,
// //                       icon: TrendingUp,
// //                       color: "text-[#b9fd5c]",
// //                       bgColor: "bg-[#b9fd5c]/10",
// //                     },
// //                     {
// //                       label: "Yesterday Mines",
// //                       value: yesterdayMines,
// //                       icon: Pickaxe,
// //                       color: "text-gray-400",
// //                       bgColor: "bg-gray-400/10",
// //                     },
// //                   ].map(({ label, value, icon: Icon, color, bgColor }) => (
// //                     <div
// //                       key={label}
// //                       className={`flex items-center justify-between bg-gradient-to-r from-[#0d1218] to-[#0a0f14] rounded-[10px] p-2.5 sm:p-3 border border-[#1d2733] hover:border-[#b9fd5c]/30 transition-colors ${bgColor}`}
// //                     >
// //                       <div className="flex items-center gap-2 flex-1 min-w-0">
// //                         <Icon size={14} className={`${color} flex-shrink-0`} />
// //                         <span className="text-[9px] sm:text-[10px] text-gray-300 font-medium truncate">
// //                           {label}
// //                         </span>
// //                       </div>
// //                       <span className={`text-xs sm:text-sm font-bold ${color} flex-shrink-0 ml-2`}>
// //                         {typeof value === "number" ? fmtWhole(value) : value}
// //                       </span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             </Card>

// //             {/* Slots & Performance */}
// //             <section className="space-y-3 flex-1 min-h-0">
// //               <SL> Slots & Performance</SL>
// //               <SlotsCard slotsInfo={slotsInfo} />
// //             </section>

// //           </aside>

// //         </div>

// //       </div>
// //     </div>
// //   );
// // };

// // export default MiningDashboard;


// import React, { useState } from "react";
// import { useGetAdminDashboardQuery } from "./miningApiSlice";
// import Loader from "../../reusableComponents/Loader/Loader";
// import StatCard from "../../reusableComponents/StatCards/GradientCard";
// import {
//   Zap, Clock, Wallet, TrendingUp, Activity, CheckCircle, XCircle,
//   AlertCircle, RefreshCw, ArrowLeft, ArrowRight, Gift, Shield,
//   Pickaxe, Target, ArrowUpRight, ArrowDownRight
// } from "lucide-react";
// import {
//   AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
//   ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line
// } from "recharts";

// // ==================== FORMATTING UTILITIES ====================
// const fmt = (n, d = 2) => {
//   if (n == null) return "0";
//   return new Intl.NumberFormat("en-IN", {
//     minimumFractionDigits: d,
//     maximumFractionDigits: d,
//   }).format(Number(n));
// };

// const fmtWhole = (n) => {
//   if (n == null) return "0";
//   return new Intl.NumberFormat("en-IN").format(Number(n));
// };

// const fmtCompact = (n) => {
//   if (n == null) return "0";
//   const v = Number(n);
//   if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
//   if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
//   if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
//   return v.toFixed(2);
// };

// // ==================== REUSABLE COMPONENTS ====================
// const SL = ({ children }) => (
//   <h2 className="text-lg sm:text-xl font-bold serialHeading text-white mb-3 mt-1 flex items-center gap-2">
//     {children}
//   </h2>
// );

// const Card = ({ children, className = "", accent = false }) => (
//   <div
//     className={`relative overflow-hidden rounded-[12px] transition-all duration-300
//     hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(185,253,92,0.15)]
//     ${
//       accent
//         ? "bg-gradient-to-br from-[#282f35] to-[#1f2530]"
//         : "bg-gradient-to-br from-[#282f35] to-[#1f2530] border border-[#1d2733]"
//     } ${className}`}
//   >
//     {children}
//   </div>
// );

// const CardHeader = ({ title, action }) => (
//   <div className="flex items-center justify-between mb-4 text-base sm:text-lg serialHeading">
//     <p className="font-bold text-white serialHeading">{title}</p>
//     {action && (
//       <span className="font-bold text-[#b9fd5c] cursor-pointer hover:underline text-xs sm:text-sm">
//         {action}
//       </span>
//     )}
//   </div>
// );

// const ChartTip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-[#282f35] border border-[#b9fd5c]/30 rounded-xl px-3 py-2 shadow-2xl text-xs min-w-[110px]">
//       <p className="text-[#b9fd5c] font-semibold mb-1.5">{label}</p>
//       {payload.map((p, i) => (
//         <p key={i} className="font-bold text-xs" style={{ color: p.color || p.fill }}>
//           {p.name}: {fmtCompact(p.value)}
//         </p>
//       ))}
//     </div>
//   );
// };

// // ==================== MINING SPECIFIC COMPONENTS ====================

//   const TodayStatsCard = ({ todayStats, yesterdayStats }) => {
//     const mineData = [
//       { name: "Claimed", value: todayStats?.claimedMines || 0, color: "#b9fd5c" },
//       { name: "Not Claimed", value: todayStats?.notClaimedMines || 0, color: "#6b7280" },
//       { name: "Total", value: todayStats?.totalMines || 0, color: "#6b7" },
//     ];

//     const totalMines = (todayStats?.claimedMines || 0) + (todayStats?.notClaimedMines || 0);
//     const yesterdayTotal = (yesterdayStats?.claimedMines || 0) + (yesterdayStats?.notClaimedMines || 0);

//     const minesChange = totalMines - yesterdayTotal;
//     const percentChange = yesterdayTotal === 0 ? 0 : ((minesChange / yesterdayTotal) * 100).toFixed(1);

//     return (
//       <Card className="h-full">
//         <div className="relative p-4 sm:p-5 md:p-6 overflow-hidden h-full">
//           <div className="relative z-10 h-full flex flex-col">
//             <div className="mb-4 flex-shrink-0">
//               <h3 className="text-lg font-bold text-white serialHeading">Today's Mining</h3>
//             </div>

//             {/* Pie Chart */}
//             <div className="relative h-40 sm:h-48 mb-4 sm:mb-6 flex-shrink-0">
//               {totalMines > 0 && (
//                 <div className="absolute inset-0">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={mineData}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius="60%"
//                         outerRadius="90%"
//                         dataKey="value"
//                         stroke="none"
//                         isAnimationActive={false}
//                       >
//                         {mineData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
//                         ))}
//                       </Pie>
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}

//               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//                 <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#b9fd5c] to-[#9fff42] bg-clip-text text-transparent">
//                   {fmtWhole(totalMines)}
//                 </p>
//                 <p className="text-xs text-gray-400 mt-1">Total Mines</p>
//               </div>
//             </div>

//             {/* Legend */}
//             <div className="space-y-2 pt-3 border-t border-gray-800 flex-1 min-h-0">
//               {mineData.map((item) => {
//                 return (
//                   <div
//                     key={item.name}
//                     className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-[#0d1218]/50 transition-colors"
//                   >
//                     <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
//                       <span
//                         className="w-2 h-2 sm:w-3 sm:h-3 rounded-[8px] flex-shrink-0"
//                         style={{ backgroundColor: item.color }}
//                       />
//                       <div className="flex-1 min-w-0">
//                         <span className="text-xs sm:text-sm font-medium text-gray-300">
//                           {item.name}
//                         </span>
//                       </div>
//                     </div>
//                     <span className="text-xs sm:text-sm font-bold text-[#b9fd5c] flex-shrink-0 ml-2">
//                       {fmtWhole(item.value)}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Comparison */}
//             <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800 space-y-3 flex-shrink-0">
//               <div className="grid grid-cols-2 gap-2">
//                 <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-2.5 sm:p-3">
//                   <p className="text-[9px] sm:text-[10px] text-blue-300 font-semibold uppercase tracking-widest mb-1">
//                     Today
//                   </p>
//                   <p className="text-lg sm:text-2xl font-bold text-blue-400">
//                     {(totalMines)}
//                   </p>
//                 </div>
//                 <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/30 rounded-lg p-2.5 sm:p-3">
//                   <p className="text-[9px] sm:text-[10px] text-gray-300 font-semibold uppercase tracking-widest mb-1">
//                     Yesterday
//                   </p>
//                   <p className="text-lg sm:text-2xl font-bold text-gray-400">
//                     {(yesterdayTotal)}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Card>
//     );
//   };

// const ComparisonChartCard = ({ todayStats, yesterdayStats }) => {
//   if (!todayStats || !yesterdayStats) {
//     return (
//       <Card>
//         <div className="p-4 sm:p-5 flex items-center justify-center h-60 sm:h-80">
//           <p className="text-gray-400 text-xs sm:text-sm">No comparison data available</p>
//         </div>
//       </Card>
//     );
//   }

//   const chartData = [
//     {
//       name: "Today",
//       claimed: todayStats?.claimedMines || 0,
//       notClaimed: todayStats?.notClaimedMines || 0,
//       total: (todayStats?.claimedMines || 0) + (todayStats?.notClaimedMines || 0),
//     },
//     {
//       name: "Yesterday",
//       claimed: yesterdayStats?.claimedMines || 0,
//       notClaimed: yesterdayStats?.notClaimedMines || 0,
//       total: (yesterdayStats?.claimedMines || 0) + (yesterdayStats?.notClaimedMines || 0),
//     },
//   ];

//   return (
//     <Card className="w-full">
//       <div className="p-4 sm:p-5 md:p-6">
//         <CardHeader title="📊 Today vs Yesterday Chart" />
        
//         <div className="w-full h-60 sm:h-80">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart
//               data={chartData}
//               margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" stroke="#1d2733" vertical={false} />
//               <XAxis 
//                 dataKey="name" 
//                 stroke="#6b7280" 
//                 style={{ fontSize: "12px" }}
//               />
//               <YAxis 
//                 stroke="#6b7280"
//                 style={{ fontSize: "12px" }}
//               />
//               <Tooltip content={<ChartTip />} />
//               <Legend 
//                 wrapperStyle={{ paddingTop: "20px" }}
//                 iconType="square"
//               />
//               <Bar dataKey="claimed" fill="#b9fd5c" radius={[8, 8, 0, 0]} name="Claimed" />
//               <Bar dataKey="notClaimed" fill="#6b7280" radius={[8, 8, 0, 0]} name="Not Claimed" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </Card>
//   );
// };

// const WalletStatsCard = ({ walletStats }) => {
//   if (!walletStats) {
//     return (
//       <Card className="h-full">
//         <div className="p-4 sm:p-5 md:p-6 h-full flex items-center justify-center">
//           <p className="text-gray-400 text-xs sm:text-sm">No wallet data available</p>
//         </div>
//       </Card>
//     );
//   }

//   return (
//     <Card className="h-full">
//       <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col">
//         <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 serialHeading flex-shrink-0">
//           Wallet Overview
//         </h2>

//         {/* Main Stats Grid */}
//         <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 flex-shrink-0">
//           <div className="bg-gradient-to-br from-[#0d1218] to-[#0a0f14] rounded-xl p-2.5 sm:p-3 border border-[#1d2733] text-center hover:border-[#b9fd5c]/30 transition-colors">
//             <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
//               Total Wallets
//             </p>
//             <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#b9fd5c] to-[#9fff42] bg-clip-text text-transparent">
//               {fmtWhole(walletStats?.totalWallets || 0)}
//             </p>
//           </div>
//           <div className="bg-gradient-to-br from-[#0d1218] to-[#0a0f14] rounded-xl p-2.5 sm:p-3 border border-[#1d2733] text-center hover:border-[#b9fd5c]/30 transition-colors">
//             <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
//               Active Wallets
//             </p>
//             <p className="text-xl sm:text-2xl font-bold text-[#b9fd5c]">
//               {fmtWhole(walletStats?.activeWallets || 0)}
//             </p>
//           </div>
//         </div>

//         {/* Balance Cards */}
//         <div className="space-y-2 sm:space-y-3 flex-1 min-h-0">
//           <div>
//             <h3 className="text-[9px] sm:text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1.5">
//               Mined Balance
//             </h3>
//             <div className="rounded-[10px] p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-[#0d1218] to-[#0a0f14] border border-[#1d2733] space-y-2 hover:border-[#b9fd5c]/20 transition-colors">
//               <div className="flex items-center gap-2 sm:gap-3">
//                 <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#b9fd5c] flex-shrink-0" />
//                 <div className="min-w-0 flex-1">
//                   <p className="text-[9px] sm:text-[11px] uppercase text-gray-500">
//                     Total Mined
//                   </p>
//                   <p className="text-xs sm:text-sm font-bold text-[#b9fd5c] break-all">
//                     {walletStats?.totalBalanceMined || "0"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-[9px] sm:text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1.5">
//               Lifetime Earnings
//             </h3>
//             <div className="rounded-[10px] p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-[#0d1218] to-[#0a0f14] border border-[#1d2733] space-y-2 sm:space-y-3 hover:border-[#b9fd5c]/20 transition-colors">
//               <div className="flex items-center gap-2 sm:gap-3">
//                 <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400 flex-shrink-0" />
//                 <div className="min-w-0 flex-1">
//                   <p className="text-[9px] sm:text-[11px] uppercase text-gray-500">
//                     Total Earned
//                   </p>
//                   <p className="text-xs sm:text-sm font-bold text-green-400 break-all">
//                     {walletStats?.totalBalanceEarnedLifetime || "0"}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 sm:gap-3">
//                 <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-400 flex-shrink-0" />
//                 <div className="min-w-0 flex-1">
//                   <p className="text-[9px] sm:text-[11px] uppercase text-gray-500">
//                     Referral Earnings
//                   </p>
//                   <p className="text-xs sm:text-sm font-bold text-blue-400 break-all">
//                     {walletStats?.totalReferralEarnings || "0"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-[9px] sm:text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1.5">
//               Wallet Status
//             </h3>
//             <div className="rounded-[10px] p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-[#0d1218] to-[#0a0f14] border border-[#1d2733] space-y-2 hover:border-[#b9fd5c]/20 transition-colors">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2 min-w-0 flex-1">
//                   <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 flex-shrink-0" />
//                   <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase truncate">
//                     Recovery Wallets
//                   </span>
//                 </div>
//                 <span className="text-xs sm:text-sm font-bold text-yellow-400 flex-shrink-0 ml-2">
//                   {fmtWhole(walletStats?.recoveryWallets || 0)}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2 min-w-0 flex-1">
//                   <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 flex-shrink-0" />
//                   <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase truncate">
//                     Resurrection Wallets
//                   </span>
//                 </div>
//                 <span className="text-xs sm:text-sm font-bold text-purple-400 flex-shrink-0 ml-2">
//                   {fmtWhole(walletStats?.resurrectionWallets || 0)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// };

// const SlotsCard = ({ slotsInfo }) => {
//   const [hoveredSlot, setHoveredSlot] = useState(null);
//   const activeSlot = slotsInfo?.activeSlot;

//   const getSlotStatus = (slot) => {
//     if (slot?.isActive) return { label: "ACTIVE", color: "bg-green-500/20 border-green-500/50", text: "text-green-400" };
//     return { label: "INACTIVE", color: "bg-gray-500/10 border-gray-500/30", text: "text-gray-400" };
//   };

//   if (!slotsInfo || !slotsInfo.slots || slotsInfo.slots.length === 0) {
//     return (
//       <Card className="h-full">
//         <div className="p-4 sm:p-5 md:p-6 h-full flex items-center justify-center">
//           <p className="text-gray-400 text-xs sm:text-sm">No slot data available</p>
//         </div>
//       </Card>
//     );
//   }

//   return (
//     <Card className="">
//       <div className="p-4 sm:p-5 md:p-6  flex flex-col">
//         <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
//           <h2 className="text-base sm:text-lg font-semibold text-white serialHeading">
//             Mining Slots
//           </h2>
//           <span className="text-[8px] sm:text-[10px] text-gray-400 font-medium px-2 py-1 bg-[#0d1218] rounded-lg whitespace-nowrap">
//             {slotsInfo?.date || "N/A"}
//           </span>
//         </div>

//         {/* Active Slot Highlight */}
//         {activeSlot && (
//           <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#0d1218] via-[#1a2330] to-[#0a0f14] border border-[#b9fd5c]/50 flex-shrink-0 shadow-lg shadow-[#b9fd5c]/10">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-[#b9fd5c]">
//                 Currently Active
//               </span>
//               <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#b9fd5c] animate-pulse" />
//             </div>
//             <p className="text-base sm:text-lg font-bold text-[#b9fd5c] mb-1">
//               Slot {activeSlot?.slotNumber || "N/A"}
//             </p>
//             <p className="text-[10px] sm:text-[12px] text-gray-400">
//               {String(activeSlot?.startHour || 0).padStart(2, "0")}:00 -{" "}
//               {String(activeSlot?.endHour || 0).padStart(2, "0")}:00
//             </p>
//           </div>
//         )}

//         {/* All Slots Grid */}
//         <div className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-1 min-h-0">
//           {(slotsInfo?.slots || []).map((slot) => {
//             const status = getSlotStatus(slot);
//             const isHovered = hoveredSlot === slot?.slotNumber;

//             return (
//               <div
//                 key={slot?.slotNumber}
//                 onMouseEnter={() => setHoveredSlot(slot?.slotNumber)}
//                 onMouseLeave={() => setHoveredSlot(null)}
//                 className={`p-2.5 sm:p-3 rounded-lg transition-all duration-200 cursor-pointer border
//                   ${
//                     isHovered
//                       ? "bg-[#1d2733] border-[#b9fd5c]/50 shadow-lg shadow-[#b9fd5c]/10"
//                       : "bg-[#0d1218] border-[#1d2733]"
//                   }`}
//               >
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-xs sm:text-sm font-bold text-white">
//                     Slot {slot?.slotNumber || "N/A"}
//                   </span>
//                   <span
//                     className={`text-[7px] sm:text-[8px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full border ${status.color} ${status.text}`}
//                   >
//                     {status.label}
//                   </span>
//                 </div>
//                 <p className={`text-[10px] sm:text-[11px] ${isHovered ? "text-[#b9fd5c]" : "text-gray-400"}`}>
//                   {String(slot?.startHour || 0).padStart(2, "0")}:00 -{" "}
//                   {String(slot?.endHour || 0).padStart(2, "0")}:00
//                 </p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </Card>
//   );
// };

// // ==================== MAIN DASHBOARD ====================
// const MiningDashboard = () => {
//   const { data: response, isLoading, isError, error, refetch } =
//     useGetAdminDashboardQuery();

//   if (isLoading) return <Loader />;

//   if (isError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <Card className="max-w-sm w-full p-6 sm:p-8 text-center">
//           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[8px] bg-[#1d2733] flex items-center justify-center mx-auto mb-4">
//             <AlertCircle size={20} className="text-white" />
//           </div>
//           <p className="text-white text-xs sm:text-sm mb-6">
//             {error?.data?.message || "Failed to load dashboard"}
//           </p>
//           <button
//             onClick={refetch}
//             className="w-full bg-[#b9fd5c] hover:bg-[#a4ff5c] text-black text-xs font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
//           >
//             <RefreshCw size={13} /> Retry
//           </button>
//         </Card>
//       </div>
//     );
//   }

//   const d = response?.data;
//   if (!d) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-white text-xs sm:text-sm">
//         No data available
//       </div>
//     );
//   }

//   // Safe access with fallbacks
//   const todayStats = d.todayStats || {};
//   const yesterdayStats = d.yesterdayStats || {};
//   const walletStats = d.walletStats || {};
//   const slotsInfo = d.slotsInfo || {};

//   const todayMines = todayStats?.totalMines || 0;
//   const yesterdayMines = yesterdayStats?.totalMines || 0;

//   return (
//     <div className="min-h-screen text-white bg-[#0a0f14]">
//       <div className="w-full max-w-full px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">

//         <div className="flex flex-col xl:flex-row gap-4 sm:gap-5 md:gap-6">
          
//           {/* LEFT CONTENT */}
//           <div className="flex-1 min-w-0 space-y-4 sm:space-y-5 md:space-y-6">
            
//             {/* Key Metrics */}
//             <section className="space-y-3">
//               <SL>💰 Wallet & Mining Stats</SL>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
//                 <StatCard
//                   title="Total Wallets"
//                   value={fmtWhole(walletStats?.totalWallets || 0)}
//                   subtitle="Connected Wallets"
//                   icon={Wallet}
//                 />
//                 <StatCard
//                   title="Mined Balance"
//                   value={walletStats?.totalBalanceMined || "0"}
//                   subtitle="Total Mined"
//                   icon={Pickaxe}
//                 />
//                 <StatCard
//                   title="Lifetime Earned"
//                   value={walletStats?.totalBalanceEarnedLifetime || "0"}
//                   subtitle="Total Earnings"
//                   icon={TrendingUp}
//                 />
//                 <StatCard
//                   title="Referral Earnings"
//                   value={walletStats?.totalReferralEarnings || "0"}
//                   subtitle="Referral Bonus"
//                   icon={Gift}
//                 />
//               </div>
//             </section>

//             {/* Main Cards */}
//             <section className="space-y-3">
//               <SL> Mining Overview</SL>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
//                 <TodayStatsCard
//                   todayStats={todayStats}
//                   yesterdayStats={yesterdayStats}
//                 />
//                 <WalletStatsCard walletStats={walletStats} />
//               </div>
//             </section>

//             {/* Comparison Chart */}
//             <section className="space-y-3">
//               <SL>📈 Performance Comparison</SL>
//               <ComparisonChartCard
//                 todayStats={todayStats}
//                 yesterdayStats={yesterdayStats}
//               />
//             </section>

//           </div>

//           {/* RIGHT SIDEBAR */}
//           <aside className="w-full xl:w-80 2xl:w-96 flex-shrink-0 flex flex-col gap-4 sm:gap-5 md:gap-6">
            


//             {/* Slots & Performance */}
//             <section className="space-y-3 flex-1 min-h-0">
//               <SL> Slots & Performance</SL>
//               <SlotsCard slotsInfo={slotsInfo} />
//             </section>

//           </aside>

//         </div>

//       </div>
//     </div>
//   );
// };

// export default MiningDashboard;
import React, { useState } from "react";
import { useGetAdminDashboardQuery } from "./miningApiSlice";
import Loader from "../../reusableComponents/Loader/Loader";
import StatCard from "../../reusableComponents/StatCards/GradientCard";
import {
  Zap, Clock, Wallet, TrendingUp, Activity, CheckCircle, XCircle,
  AlertCircle, RefreshCw, ArrowLeft, ArrowRight, Gift, Shield,
  Pickaxe, Target, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line
} from "recharts";

// ==================== FORMATTING UTILITIES ====================
const fmt = (n, d = 2) => {
  if (n == null) return "0";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(Number(n));
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

// ==================== REUSABLE COMPONENTS ====================
const SL = ({ children }) => (
  <h2 className="text-lg sm:text-xl font-bold serialHeading text-white mb-3 mt-1 flex items-center gap-2">
    {children}
  </h2>
);

const Card = ({ children, className = "", accent = false }) => (
  <div
    className={`relative overflow-hidden rounded-[12px] transition-all duration-300
    hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(185,253,92,0.15)]
    ${
      accent
        ? "bg-gradient-to-br from-[#282f35] to-[#1f2530]"
        : "bg-gradient-to-br from-[#282f35] to-[#1f2530] border border-[#1d2733]"
    } ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4 text-base sm:text-lg serialHeading">
    <p className="font-bold text-white serialHeading">{title}</p>
    {action && (
      <span className="font-bold text-[#b9fd5c] cursor-pointer hover:underline text-xs sm:text-sm">
        {action}
      </span>
    )}
  </div>
);

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#282f35] border border-[#b9fd5c]/30 rounded-xl px-3 py-2 shadow-2xl text-xs min-w-[110px]">
      <p className="text-[#b9fd5c] font-semibold mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-xs" style={{ color: p.color || p.fill }}>
          {p.name}: {(p.value)}
        </p>
      ))}
    </div>
  );
};

// ==================== MINING SPECIFIC COMPONENTS ====================

const TodayStatsCard = ({ todayStats, yesterdayStats }) => {
  const totalMines = (todayStats?.claimedMines || 0) + (todayStats?.notClaimedMines || 0);
  const yesterdayTotal = (yesterdayStats?.claimedMines || 0) + (yesterdayStats?.notClaimedMines || 0);
  
  const mineData = [
    { name: "Claimed", value: todayStats?.claimedMines || 0, color: "#b9fd5c" },
    { name: "Not Claimed", value: todayStats?.notClaimedMines || 0, color: "#6b7280" },
  ];

  return (
    <Card className="h-full">
      <div className="relative p-4 sm:p-5 md:p-6 overflow-hidden h-full">
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="mb-4 flex-shrink-0">
            <h3 className="text-lg font-bold text-white serialHeading">Today's Mining</h3>
          </div>

          {/* Pie Chart */}
          <div className="relative h-40 sm:h-48 mb-4 sm:mb-6 flex-shrink-0">
            {totalMines > 0 ? (
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mineData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="90%"
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {mineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No data</p>
              </div>
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#b9fd5c] to-[#9fff42] bg-clip-text text-transparent">
                {fmtWhole(totalMines)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total Mines</p>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-3 border-t border-gray-800 flex-1 min-h-0">
            {mineData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-[#0d1218]/50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <span
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm font-medium text-gray-300">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#b9fd5c] flex-shrink-0 ml-2">
                  {fmtWhole(item.value)}
                </span>
              </div>
            ))}
            
            {/* Total Row */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-[#0d1218]/30 border border-[#b9fd5c]/20">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 bg-[#b9fd5c]" />
                <span className="text-xs sm:text-sm font-semibold text-[#b9fd5c]">
                  Total
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#b9fd5c] flex-shrink-0 ml-2">
                {fmtWhole(totalMines)}
              </span>
            </div>
          </div>

          {/* Comparison */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800 flex-shrink-0">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-2.5 sm:p-3">
                <p className="text-[9px] sm:text-[10px] text-blue-300 font-semibold uppercase tracking-widest mb-1">
                  Today
                </p>
                <p className="text-lg sm:text-2xl font-bold text-blue-400">
                  {fmtWhole(totalMines)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/30 rounded-lg p-2.5 sm:p-3">
                <p className="text-[9px] sm:text-[10px] text-gray-300 font-semibold uppercase tracking-widest mb-1">
                  Yesterday
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-400">
                  {fmtWhole(yesterdayTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const ComparisonChartCard = ({ todayStats, yesterdayStats }) => {
  if (!todayStats || !yesterdayStats) {
    return (
      <Card>
        <div className="p-4 sm:p-5 flex items-center justify-center h-60 sm:h-80">
          <p className="text-gray-400 text-xs sm:text-sm">No comparison data available</p>
        </div>
      </Card>
    );
  }

  const chartData = [
    {
      name: "Today",
      claimed: todayStats?.claimedMines || 0,
      notClaimed: todayStats?.notClaimedMines || 0,
      total: (todayStats?.claimedMines || 0) + (todayStats?.notClaimedMines || 0),
    },
    {
      name: "Yesterday",
      claimed: yesterdayStats?.claimedMines || 0,
      notClaimed: yesterdayStats?.notClaimedMines || 0,
      total: (yesterdayStats?.claimedMines || 0) + (yesterdayStats?.notClaimedMines || 0),
    },
  ];

  return (
    <Card className="w-full">
      <div className="p-4 sm:p-5 md:p-6">
        <CardHeader title=" Today vs Yesterday" />
        
        <div className="w-full h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1d2733" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                style={{ fontSize: "12px" }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <Tooltip content={<ChartTip />} />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="square"
              />
              <Bar dataKey="claimed" fill="#b9fd5c" radius={[8, 8, 0, 0]} name="Claimed" />
              <Bar dataKey="notClaimed" fill="#6b7280" radius={[8, 8, 0, 0]} name="Not Claimed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

const WalletStatsCard = ({ walletStats }) => {
  if (!walletStats) {
    return (
      <Card className="h-full">
        <div className="p-4 sm:p-5 md:p-6 h-full flex items-center justify-center">
          <p className="text-gray-400 text-xs sm:text-sm">No wallet data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 serialHeading flex-shrink-0">
          Wallet Overview
        </h2>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 flex-shrink-0">
          <div className="bg-gradient-to-br from-[#0d1218] to-[#0a0f14] rounded-xl p-2.5 sm:p-3 border border-[#1d2733] text-center  transition-colors">
            <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Total Wallets
            </p>
            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#b9fd5c] to-[#9fff42] bg-clip-text text-transparent">
              {fmtWhole(walletStats?.totalWallets || 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#0d1218] to-[#0a0f14] rounded-xl p-2.5 sm:p-3 border border-[#1d2733] text-center  transition-colors">
            <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Active Wallets
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[#b9fd5c]">
              {fmtWhole(walletStats?.activeWallets || 0)}
            </p>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="space-y-2 sm:space-y-3 flex-1 min-h-0">
          <div>
            <h3 className="text-[9px] sm:text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1.5">
              Mined Balance
            </h3>
            <div className="rounded-[10px] p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-[#0d1218] to-[#0a0f14] border border-[#1d2733] hover:border-[#b9fd5c]/20 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#b9fd5c] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[11px] uppercase text-gray-500 mb-1">
                    Total Mined
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#b9fd5c] break-all">
                    {walletStats?.totalBalanceMined || "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[9px] sm:text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1.5">
              Lifetime Earnings
            </h3>
            <div className="rounded-[10px] p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-[#0d1218] to-[#0a0f14] border border-[#1d2733] space-y-2 sm:space-y-3  transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[11px] uppercase text-gray-500 mb-0.5">
                    Total Earned
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-green-400 break-all">
                    {walletStats?.totalBalanceEarnedLifetime || "0"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[11px] uppercase text-gray-500 mb-0.5">
                    Referral Earnings
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-blue-400 break-all">
                    {walletStats?.totalReferralEarnings || "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[9px] sm:text-[11px] text-gray-500 font-semibold uppercase tracking-[0.15em] mb-1.5">
              Wallet Status
            </h3>
            <div className="rounded-[10px] p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-[#0d1218] to-[#0a0f14] border border-[#1d2733] space-y-2  transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                  <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase truncate">
                    Recovery Wallets
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-yellow-400 flex-shrink-0 ml-2">
                  {fmtWhole(walletStats?.recoveryWallets || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 flex-shrink-0" />
                  <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase truncate">
                    Resurrection Wallets
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-purple-400 flex-shrink-0 ml-2">
                  {fmtWhole(walletStats?.resurrectionWallets || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const SlotsCard = ({ slotsInfo }) => {
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const activeSlot = slotsInfo?.activeSlot;

  const getSlotStatus = (slot) => {
    if (slot?.isActive) return { label: "ACTIVE", color: "bg-green-500/20 border-green-500/50", text: "text-green-400" };
    return { label: "INACTIVE", color: "bg-gray-500/10 border-gray-500/30", text: "text-gray-400" };
  };

  if (!slotsInfo || !slotsInfo.slots || slotsInfo.slots.length === 0) {
    return (
      <Card className="">
        <div className="p-4 sm:p-5 md:p-6 h-full flex items-center justify-center">
          <p className="text-gray-400 text-xs sm:text-sm">No slot data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="">
      <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-white serialHeading">
            Mining Slots
          </h2>
          <span className="text-[8px] sm:text-[10px] text-gray-400 font-medium px-2 py-1 bg-[#0d1218] rounded-lg whitespace-nowrap">
            {slotsInfo?.date || "N/A"}
          </span>
        </div>

        {/* Active Slot Highlight */}
        {activeSlot && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#0d1218] via-[#1a2330] to-[#0a0f14] border border-[#b9fd5c]/50 flex-shrink-0 shadow-lg shadow-[#b9fd5c]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-[#b9fd5c]">
                Currently Active
              </span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#b9fd5c] animate-pulse" />
            </div>
            <p className="text-base sm:text-lg font-bold text-[#b9fd5c] mb-1">
              Slot {activeSlot?.slotNumber || "N/A"}
            </p>
            <p className="text-[10px] sm:text-[12px] text-gray-400">
              {String(activeSlot?.startHour || 0).padStart(2, "0")}:00 -{" "}
              {String(activeSlot?.endHour || 0).padStart(2, "0")}:00
            </p>
          </div>
        )}

        {/* All Slots Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-1 min-h-0 overflow-y-auto">
          {(slotsInfo?.slots || []).map((slot) => {
            const status = getSlotStatus(slot);
            const isHovered = hoveredSlot === slot?.slotNumber;

            return (
              <div
                key={slot?.slotNumber}
                onMouseEnter={() => setHoveredSlot(slot?.slotNumber)}
                onMouseLeave={() => setHoveredSlot(null)}
                className={`p-2.5 sm:p-3 rounded-lg transition-all duration-200 cursor-pointer border h-fit
                  ${
                    isHovered
                      ? "bg-[#1d2733] border-[#b9fd5c]/50 shadow-lg shadow-[#b9fd5c]/10"
                      : "bg-[#0d1218] border-[#1d2733]"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Slot {slot?.slotNumber || "N/A"}
                  </span>
                  <span
                    className={`text-[7px] sm:text-[8px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full border ${status.color} ${status.text}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className={`text-[10px] sm:text-[11px] ${isHovered ? "text-[#b9fd5c]" : "text-gray-400"} transition-colors`}>
                  {String(slot?.startHour || 0).padStart(2, "0")}:00 -{" "}
                  {String(slot?.endHour || 0).padStart(2, "0")}:00
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

// ==================== MAIN DASHBOARD ====================
const MiningDashboard = () => {
  const { data: response, isLoading, isError, error, refetch } =
    useGetAdminDashboardQuery();

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f14]">
        <Card className="max-w-sm w-full p-6 sm:p-8 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[8px] bg-[#1d2733] flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={20} className="text-white" />
          </div>
          <p className="text-white text-xs sm:text-sm mb-6">
            {error?.data?.message || "Failed to load dashboard"}
          </p>
          <button
            onClick={refetch}
            className="w-full bg-[#b9fd5c] hover:bg-[#a4ff5c] text-black text-xs font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </Card>
      </div>
    );
  }

  const d = response?.data;
  if (!d) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xs sm:text-sm bg-[#0a0f14]">
        No data available
      </div>
    );
  }

  // Safe access with fallbacks
  const todayStats = d.todayStats || {};
  const yesterdayStats = d.yesterdayStats || {};
  const walletStats = d.walletStats || {};
  const slotsInfo = d.slotsInfo || {};

  return (
    <div className="min-h-screen text-white bg-[#0a0f14]">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">

        <div className="flex flex-col xl:flex-row gap-4 sm:gap-5 md:gap-6">
          
          {/* LEFT CONTENT */}
          <div className="flex-1 min-w-0 space-y-4 sm:space-y-5 md:space-y-6">
            
            {/* Key Metrics */}
            <section className="space-y-3">
              <SL> Wallet & Mining Stats</SL>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <StatCard
                  title="Total Wallets"
                  value={fmtWhole(walletStats?.totalWallets || 0)}
                  subtitle="Connected Wallets"
                  icon={Wallet}
                />
                <StatCard
                  title="Mined Balance"
                  value={walletStats?.totalBalanceMined || "0"}
                  subtitle="Total Mined"
                  icon={Pickaxe}
                />
                <StatCard
                  title="Lifetime Earned"
                  value={walletStats?.totalBalanceEarnedLifetime || "0"}
                  subtitle="Total Earnings"
                  icon={TrendingUp}
                />
                <StatCard
                  title="Referral Earnings"
                  value={walletStats?.totalReferralEarnings || "0"}
                  subtitle="Referral Bonus"
                  icon={Gift}
                />
              </div>
            </section>

            {/* Main Cards */}
            <section className="space-y-3">
              <SL> Mining Overview</SL>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <TodayStatsCard
                  todayStats={todayStats}
                  yesterdayStats={yesterdayStats}
                />
                <WalletStatsCard walletStats={walletStats} />
              </div>
            </section>

            {/* Comparison Chart */}
            <section className="space-y-3">
              <SL>Performance Comparison</SL>
              <ComparisonChartCard
                todayStats={todayStats}
                yesterdayStats={yesterdayStats}
              />
            </section>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="w-full xl:w-80 2xl:w-96 flex-shrink-0">
            <section className="space-y-3 h-full">
              <SL> Slots & Performance</SL>
              <SlotsCard slotsInfo={slotsInfo} />
            </section>
          </aside>

        </div>

      </div>
    </div>
  );
};

export default MiningDashboard;