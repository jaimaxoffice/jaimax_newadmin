
// import { useState, useMemo, useEffect, useCallback } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Logout from "../Features/Logout/Logout";
// import {
//   LayoutDashboard,
//   ShoppingCart,
//   Users,
//   Mail,
//   Star,
//   Settings,
//   Search,
//   Menu,
//   X,
// } from "lucide-react";

// // ─── ADMIN (role === 0) ───
// const ADMIN_SECTIONS = [
//   {
//     label: "DASHBOARDS",
//     items: [
//       { label: "Dashboard", icon: "/sidebar/home.png", path: "/" },
//       { label: "Wallet Management", icon: "/sidebar/new-wallet.png", path: "/wallet" },
//       { label: "Users Management", icon: "/sidebar/my-team.png", path: "/users" },
//       { label: "KYC Management", icon: "/sidebar/kyc.png", path: "/kyc" },
//       { label: "Withdrawal Bonus", icon: "/sidebar/withdrawal.png", path: "/withdrawal" },
//       { label: "USDT withdrawal", icon: "/sidebar/usdt.png", path: "/usdt-withdrawal" },
//     ],
//   },
//   {
//     label: "USERS",
//     items: [
//       { label: "user-info", icon: "/sidebar/tree.png", path: "/user-info" },
//       { label: "Admin-Users", icon: "/sidebar/admin.png", path: "/admin-user" },
//     ],
//   },
//   {
//     label: "TRANSACTIONS",
//     items: [
//       { label: "All Transactions", icon: "/sidebar/history.png", path: "/all-transactions" },
//       { label: "PG Transactions", icon: "/sidebar/scanonline.png", path: "/pg-transactions" },
//       { label: "Payment-Gateways", icon: "/sidebar/payment_gateway.png", path: "/paymentgateway" },
//       { label: "Buy-History", icon: "/sidebar/new-wallet.png", path: "/buy-history" },
//     ],
//   },
//   {
//     label: "MANUALS",
//     items: [
//       { label: "ManualKYC", icon: "/sidebar/manualkyc.png", path: "/manual-kyc" },
//       { label: "Manual Transactions", icon: "/sidebar/developer.png", path: "/manual-accounts" },
//     ],
//   },
//   {
//     label: "REPORTS",
//     items: [
//       { label: "Team-Reports", icon: "/sidebar/team-report.png", path: "/team-reports" },
//       { label: "Team-Investments", icon: "/sidebar/team-report.png", path: "/team-investments" },
//       { label: "Reports", icon: "/sidebar/report.png", path: "/reports" },
//       { label: "Business Analytics", icon: "/sidebar/report.png", path: "/businessanalytics" },
//     ],
//   },
//   {
//     label: "BONUS",
//     items: [
//       { label: "Gradual Bonus", icon: "/sidebar/clipboardclock.png", path: "/gradual-bonus" },
//       { label: "Bonus Coin History", icon: "/sidebar/bonuscoinhistory.png", path: "/bonus-coin-history" },
//       { label: "Available-Balance", icon: "/sidebar/salary.png", path: "/available-balance" },
//     ],
//   },
//   {
//     label: "WEALTHPLANS",
//     items: [
//       { label: "Wealth Plan order-1", icon: "/sidebar/order.png", path: "/wealth-plan-1" },
//       { label: "Wealth Plan log 1", icon: "/sidebar/log.png", path: "/wealth-plan-log-1" },
//       { label: "Wealth Plan order-2", icon: "/sidebar/order.png", path: "/wealth-plan-2" },
//       { label: "Wealth Plan log 2", icon: "/sidebar/log.png", path: "/wealth-plan-log-2" },
//       { label: "Wealth Plan order-3", icon: "/sidebar/order.png", path: "/wealth-plan-3" },
//       { label: "Wealth Plan log 3", icon: "/sidebar/log.png", path: "/wealth-plan-log-3" },
//     ],
//   },
//   {
//     label: "NOTIFICATIONS",
//     items: [
//       { label: "Announcements", icon: "/sidebar/megaphone.png", path: "/announcements" },
//       { label: "Notifications", icon: "/sidebar/notifications.png", path: "/notifications" },
//       { label: "zoom-meetings", icon: "/sidebar/meet.png", path: "/zoommeetings" },
//       { label: "Blogs", icon: "/sidebar/book-open-check.png", path: "/blogs" },
//       { label: "SocialMedia", icon: "/sidebar/book-open-check.png", path: "/socialmedia" },
//     ],
//   },
//   {
//     label: "SUPPORT",
//     items: [
//       { label: "Support", icon: "/sidebar/newsupport.png", path: "/support" },
//       { label: "Legal", icon: "/sidebar/newlegal.png", path: "/legal" },
//       { label: "freezed-Groups", icon: "/sidebar/group.png", path: "/freezedgroups" },
//       { label: "Not-Verified-Users", icon: "/sidebar/user-x.png", path: "/not-verified-users" },
//     ],
//   },
//   {
//     label: "SETTINGS",
//     items: [
//       { label: "ICO", icon: "/sidebar/ico.png", path: "/ico" },
//       { label: "Delete Accounts", icon: "/sidebar/delete.png", path: "/delete-accounts" },
//       { label: "Software settings", icon: "/sidebar/setting.svg", path: "/settings" },
//     ],
//   },
// ];



// // ─── ACCOUNTANT (role === 3) ───
// const ACCOUNTANT_SECTIONS = [
//   {
//     label: "DASHBOARDS",
//     items: [
//       { label: "Dashboard", icon: "/sidebar/home.png", path: "/" },
//       { label: "Credits", icon: "/sidebar/walleticon.png", path: "/credits" },
//       { label: "Debits", icon: "/sidebar/new-wallet.png", path: "/debits" },
//       { label: "TransactionInfo", icon: "/sidebar/bonuscoinhistory.png", path: "/TransactionInfo" },
//       { label: "Withdrawal", icon: "/sidebar/withdrawal.png", path: "/withdrawal" },
//       { label: "Internal Expenses", icon: "/sidebar/withdrawal.png", path: "/expenses" },
//     ],
//   },
// ];


// function getSectionsByRole(role, permissions) {
//   switch (role) {
//     case 0:
//       return ADMIN_SECTIONS;
//     case 2:
//       return ADMIN_SECTIONS
//         .map((section) => ({
//           ...section,
//           items: section.items.filter(
//             (item) => !item.permission || permissions?.includes(item.permission)
//           ),
//         }))
//         .filter((section) => section.items.length > 0);
//     case 3:
//       return ACCOUNTANT_SECTIONS;
//     case 4:
//       return ADMIN_SECTIONS;
//     default:
//       return [];
//   }
// }

// const ROLE_LABELS = {
//   0: "Admin",
//   2: "Sub Admin",
//   3: "Accountant",
//   4: "Viewer",
// };

// function getRoleLabel(role) {
//   return ROLE_LABELS[role] || "User";
// }

// // ─── Highlight Text ─────────────────────────────────────────
// function HighlightText({ text, query }) {
//   if (!query.trim()) return <span>{text}</span>;
//   const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
//   const parts = text.split(regex);
//   return (
//     <span>
//       {parts.map((part, i) =>
//         regex.test(part) ? (
//           <span key={i} className="text-white font-bold">{part}</span>
//         ) : (
//           <span key={i}>{part}</span>
//         )
//       )}
//     </span>
//   );
// }

// // ─── Section Label ──────────────────────────────────────────
// function SectionLabel({ children }) {
//   return (
//     <p className="text-[10px] tracking-widest text-gray-400 px-2 mb-1.5 mt-3 font-semibold uppercase select-none">
//       {children}
//     </p>
//   );
// }

// // ─── Nav Item ───────────────────────────────────────────────
// function NavItem({ item, open, activePath, navigate, searchQuery = "" }) {
//   const Icon = item.icon;
//   const active = activePath === item.path;

//   const handleClick = useCallback(() => {
//     navigate(item.path);
//   }, [navigate, item.path]);

//   const renderIcon = (size = 16) => {
//     if (typeof Icon === "string") {
//       return <img src={Icon} alt="" className="w-4 h-4 object-contain" loading="lazy" />;
//     }
//     return <Icon size={size} strokeWidth={2} />;
//   };

//   if (!open) {
//     return (
//       <button
//         onClick={handleClick}
//         title={item.label}
//         className="w-full flex justify-center mb-1 group cursor-pointer"
//       >
//         <div
//           className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
//             active
//               ? "bg-[#b9fd5c] text-black shadow-lg shadow-[#b9fd5c]/25"
//               : "text-white group-hover:bg-[#252d38] group-hover:text-white"
//           }`}
//         >
//           {renderIcon(16)}
//         </div>
//       </button>
//     );
//   }

//   return (
//     <button
//       onClick={handleClick}
//       className={`w-full flex items-center gap-2.5 px-2.5 py-3 rounded-xs mb-1.5 text-[12.5px] transition-all duration-200 cursor-pointer ${
//         active
//           ? "bg-[#b9fd5c] text-black font-base shadow-sm shadow-[#b9fd5c]/20"
//           : "hover:bg-[#252d38] text-white hover:text-white"
//       }`}
//     >
//       <span className="shrink-0">{renderIcon(16)}</span>
//       <span className="flex-1 text-left truncate leading-tight">
//         <HighlightText text={item.label} query={searchQuery} />
//       </span>
//     </button>
//   );
// }

// // ─── Mobile Header ──────────────────────────────────────────
// function MobileHeader({ onMenuToggle, userName, role }) {
//   const roleLabel = getRoleLabel(role);

//   return (
//     <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a] border-b border-[#1a1a1a]">
//       <div className="flex items-center justify-between px-3 h-12">
//         <div className="flex items-center gap-2">
//           <button
//             onClick={onMenuToggle}
//             className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700/30 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
//           >
//             <Menu size={16} className="text-gray-400" />
//           </button>
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 rounded-full bg-[#b9fd5c]/20 flex items-center justify-center text-[#b9fd5c] font-bold text-xs shrink-0">
//               {(userName?.charAt(0) || "A").toUpperCase()}
//             </div>
//             <div className="min-w-0">
//               <p className="text-white text-xs font-semibold truncate max-w-24">
//                 {userName || "User"}
//               </p>
//               <p className="text-[10px] text-gray-500">{roleLabel}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Mobile Overlay ─────────────────────────────────────────
// function MobileOverlay({ show, onClose }) {
//   if (!show) return null;
//   return (
//     <div
//       className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
//       onClick={onClose}
//     />
//   );
// }

// // ─── Sidebar Content ────────────────────────────────────────
// function SidebarContent({
//   isMobile = false,
//   open,
//   setOpen,
//   searchQuery,
//   setSearchQuery,
//   filteredSections,
//   hasNoResults,
//   activePath,
//   handleNavigate,
//   handleLogout,
//   name,
//   email,
//   role,
//   setMobileOpen,
// }) {
//   const expanded = open || isMobile;
//   const roleLabel = getRoleLabel(role);

//   const handleKeyDown = useCallback(
//     (e) => {
//       if (e.key === "Escape") setSearchQuery("");
//     },
//     [setSearchQuery]
//   );

//   const totalResults = useMemo(
//     () => filteredSections.reduce((acc, s) => acc + s.items.length, 0),
//     [filteredSections]
//   );

//   return (
//     <>
//       {/* Header */}
//       <div className="px-3 pt-2.5 pb-2.5 border-b border-[#1a1a1a]">
//         <div className="flex items-center justify-between">
//           {expanded && (
//             <div className="flex items-center gap-2 min-w-0">
//               <div className="w-8 h-8 rounded-full bg-[#b9fd5c]/20 flex items-center justify-center text-[#b9fd5c] font-bold text-sm shrink-0">
//                 <img src="/logo.png"/>
//               </div>
//               <div className="min-w-0">
//                 <p className="text-white text-xs font-semibold leading-tight truncate">
//                   {name || "User"}
//                 </p>
//                 <p className="text-[10px] text-gray-500">{roleLabel}</p>
//               </div>
//             </div>
//           )}

//           {!isMobile && (
//             <button
//               onClick={() => {
//                 setOpen(!open);
//                 if (open) setSearchQuery("");
//               }}
//               className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700/30 hover:bg-[#1a1a1a] transition-colors shrink-0 cursor-pointer"
//             >
//               {open ? (
//                 <X size={14} className="text-gray-400" />
//               ) : (
//                 <Menu size={14} className="text-gray-400" />
//               )}
//             </button>
//           )}

//           {isMobile && (
//             <button
//               onClick={() => setMobileOpen(false)}
//               className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700/30 hover:bg-[#1a1a1a] transition-colors shrink-0 cursor-pointer"
//             >
//               <X size={14} className="text-gray-400" />
//             </button>
//           )}
//         </div>

//         {/* Search */}
//         {expanded && (
//           <div className="mt-2">
//             <div
//               className={`flex items-center gap-2 bg-[#111111] rounded-lg px-2.5 py-2 text-xs border transition-colors duration-200 ${
//                 searchQuery
//                   ? "border-[#b9fd5c]/50 ring-1 ring-[#b9fd5c]/20"
//                   : "border-[#1a1a1a]"
//               }`}
//             >
//               <Search
//                 size={13}
//                 className={searchQuery ? "text-[#b9fd5c]" : "text-gray-600"}
//               />
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Search menu..."
//                 className="bg-transparent outline-none w-full placeholder:text-gray-600 text-white text-xs"
//               />
//               {searchQuery ? (
//                 <button
//                   onClick={() => setSearchQuery("")}
//                   className="text-gray-500 hover:text-white transition-colors cursor-pointer"
//                 >
//                   <X size={12} />
//                 </button>
//               ) : (
//                 <span className="text-[9px] bg-[#1a1a1a] px-1 py-0.5 rounded text-gray-500 whitespace-nowrap select-none">
//                   ⌘K
//                 </span>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Nav */}
//       <div className="flex-1 overflow-y-auto px-1.5 py-1.5 sidebar-scroll">
//         {expanded && searchQuery.trim() && !hasNoResults && (
//           <div className="px-2 mb-1.5">
//             <p className="text-[10px] text-[#b9fd5c]">
//               Found {totalResults} result{totalResults !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
//             </p>
//           </div>
//         )}

//         {hasNoResults && expanded && (
//           <div className="flex flex-col items-center justify-center py-8 px-3">
//             <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center mb-2">
//               <Search size={16} className="text-gray-600" />
//             </div>
//             <p className="text-gray-400 text-xs font-medium mb-0.5">No results found</p>
//             <p className="text-gray-600 text-[10px] text-center">
//               No menu items match &quot;{searchQuery}&quot;
//             </p>
//             <button
//               onClick={() => setSearchQuery("")}
//               className="mt-2 text-[10px] text-[#b9fd5c] hover:text-[#b9fd5c]/80 transition-colors underline underline-offset-2 cursor-pointer"
//             >
//               Clear search
//             </button>
//           </div>
//         )}

//         {filteredSections.map((section) => (
//           <div key={section.label}>
//             {expanded && <SectionLabel>{section.label}</SectionLabel>}
//             {section.items.map((item) => (
//               <NavItem
//                 key={item.path + item.label}
//                 item={item}
//                 open={expanded}
//                 activePath={activePath}
//                 navigate={handleNavigate}
//                 searchQuery={searchQuery}
//               />
//             ))}
//           </div>
//         ))}
//       </div>

//       {/* Logout */}
//       <div className="px-2 py-2 border-t border-[#1a1a1a]">
//         {expanded ? (
//           <Logout onLogout={handleLogout} userName={name} userEmail={email} />
//         ) : (
//           <div className="flex justify-center">
//             <Logout onLogout={handleLogout} userName={name} userEmail={email} />
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// // ─── Main Sidebar Export ────────────────────────────────────
// export default function Sidebar({ open, setOpen }) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const activePath = location.pathname;

//   const stored = useMemo(() => JSON.parse(localStorage.getItem("userData") || "{}"), []);
//   const userData = stored?.data || stored;
//   const { role, permissions = [], name = "User", email = "" } = userData || {};

//   const roleSections = useMemo(
//     () => getSectionsByRole(role, permissions),
//     [role, permissions]
//   );

//   const filteredSections = useMemo(() => {
//     if (!searchQuery.trim()) return roleSections;
//     const query = searchQuery.toLowerCase().trim();
//     return roleSections
//       .map((section) => ({
//         ...section,
//         items: section.items.filter(
//           (item) =>
//             item.label.toLowerCase().includes(query) ||
//             item.path.toLowerCase().includes(query)
//         ),
//       }))
//       .filter((section) => section.items.length > 0);
//   }, [searchQuery, roleSections]);

//   const hasNoResults = searchQuery.trim() && filteredSections.length === 0;

//   useEffect(() => {
//     setMobileOpen(false);
//   }, [location.pathname]);

//   useEffect(() => {
//     document.body.style.overflow = mobileOpen ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [mobileOpen]);

//   const handleNavigate = useCallback(
//     (path) => {
//       navigate(path);
//       setSearchQuery("");
//       setMobileOpen(false);
//     },
//     [navigate]
//   );

//   const handleLogout = useCallback(() => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         localStorage.clear();
//         navigate("/login");
//         resolve();
//       }, 800);
//     });
//   }, [navigate]);

//   const sharedProps = {
//     searchQuery,
//     setSearchQuery,
//     filteredSections,
//     hasNoResults,
//     activePath,
//     handleNavigate,
//     handleLogout,
//     name,
//     email,
//     role,
//     setMobileOpen,
//   };

//   return (
//     <>
//       {/* Mobile Header */}
//       <MobileHeader
//         onMenuToggle={() => setMobileOpen(true)}
//         userName={name}
//         role={role}
//       />

//       {/* Mobile Overlay */}
//       <MobileOverlay show={mobileOpen} onClose={() => setMobileOpen(false)} />

//       {/* Mobile Sidebar */}
//       <aside
//         className={`lg:hidden fixed top-0 left-0 h-full z-50 flex flex-col bg-[#0a0a0a] text-white
//           border-r border-[#1a1a1a] w-56 transition-transform duration-300
//           ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <SidebarContent isMobile open={true} setOpen={setOpen} {...sharedProps} />
//       </aside>

//       {/* Desktop Sidebar */}
//       <aside
//         className={`hidden lg:flex h-screen flex-col bg-[#0a0a0a] text-white
//           border-r border-[#1a1a1a] transition-all duration-300 p-0
//           ${open ? "w-60" : "w-14"}`}
//       >
//         <SidebarContent open={open} setOpen={setOpen} {...sharedProps} />
//       </aside>
//     </>
//   );
// }



import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logout from "../Features/Logout/Logout";
import {
  LayoutDashboard,
  Wallet,
  Users,
  ShieldCheck,
  ArrowDownToLine,
  CircleDollarSign,
  UserSearch,
  UserCog,
  History,
  ScanLine,
  CreditCard,
  ShoppingBag,
  FileCheck,
  FileText,
  BarChart3,
  TrendingUp,
  ClipboardList,
  PieChart,
  Clock,
  Coins,
  BadgeDollarSign,
  Package,
  ScrollText,
  Megaphone,
  Bell,
  Video,
  BookOpenCheck,
  Share2,
  LifeBuoy,
  Scale,
  UsersRound,
  UserX,
  Gem,
  Trash2,
  Settings,
  Search,
  Menu,
  X,
  WalletCards,
  Receipt,
  Banknote,
  HandCoins,
  UserPen 
} from "lucide-react";

// ─── ADMIN (role === 0) ───
const ADMIN_SECTIONS = [
  {
    label: "DASHBOARDS",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { label: "Wallet Management", icon: Wallet, path: "/wallet" },
      { label: "Users Management", icon: Users, path: "/users" },
      { label: "KYC Management", icon: ShieldCheck, path: "/kyc" },
      { label: "Withdrawal Bonus", icon: ArrowDownToLine, path: "/withdrawal" },
      { label: "USDT withdrawal", icon: CircleDollarSign, path: "/usdt-withdrawal" },
    ],
  },
  {
    label: "USERS",
    items: [
      { label: "user-info", icon: UserSearch, path: "/user-info" },
      { label: "Admin-Users", icon: UserCog, path: "/admin-user" },
      { label: "User-Summary", icon: UserPen , path: "/user-summary" },
    ],
  },
  {
    label: "TRANSACTIONS",
    items: [
      { label: "All Transactions", icon: History, path: "/all-transactions" },
      { label: "PG Transactions", icon: ScanLine, path: "/pg-transactions" },
      { label: "Payment-Gateways", icon: CreditCard, path: "/paymentgateway" },
      { label: "Buy-History", icon: ShoppingBag, path: "/buy-history" },
    ],
  },
  {
    label: "MANUALS",
    items: [
      { label: "ManualKYC", icon: FileCheck, path: "/manual-kyc" },
      { label: "Manual Transactions", icon: FileText, path: "/manual-accounts" },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { label: "Team-Reports", icon: BarChart3, path: "/team-reports" },
      { label: "Team-Investments", icon: TrendingUp, path: "/team-investments" },
      { label: "Reports", icon: ClipboardList, path: "/reports" },
      { label: "Business Analytics", icon: PieChart, path: "/businessanalytics" },
    ],
  },
  {
    label: "BONUS",
    items: [
      { label: "Gradual Bonus", icon: Clock, path: "/gradual-bonus" },
      { label: "Bonus Coin History", icon: Coins, path: "/bonus-coin-history" },
      { label: "Available-Balance", icon: BadgeDollarSign, path: "/available-balance" },
    ],
  },
  {
    label: "WEALTHPLANS",
    items: [
      { label: "Wealth Plan order-1", icon: Package, path: "/wealth-plan-1" },
      { label: "Wealth Plan log 1", icon: ScrollText, path: "/wealth-plan-log-1" },
      { label: "Wealth Plan order-2", icon: Package, path: "/wealth-plan-2" },
      { label: "Wealth Plan log 2", icon: ScrollText, path: "/wealth-plan-log-2" },
      { label: "Wealth Plan order-3", icon: Package, path: "/wealth-plan-3" },
      { label: "Wealth Plan log 3", icon: ScrollText, path: "/wealth-plan-log-3" },
    ],
  },
  {
    label: "NOTIFICATIONS",
    items: [
      { label: "Announcements", icon: Megaphone, path: "/announcements" },
      { label: "Notifications", icon: Bell, path: "/notifications" },
      { label: "zoom-meetings", icon: Video, path: "/zoommeetings" },
      { label: "Blogs", icon: BookOpenCheck, path: "/blogs" },
      { label: "SocialMedia", icon: Share2, path: "/socialmedia" },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { label: "Support", icon: LifeBuoy, path: "/support" },
      { label: "Legal", icon: Scale, path: "/legal" },
      { label: "freezed-Groups", icon: UsersRound, path: "/freezedgroups" },
      { label: "Not-Verified-Users", icon: UserX, path: "/not-verified-users" },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { label: "ICO", icon: Gem, path: "/ico" },
      { label: "Delete Accounts", icon: Trash2, path: "/delete-accounts" },
      { label: "Software settings", icon: Settings, path: "/settings" },
    ],
  },
];

// ─── ACCOUNTANT (role === 3) ───
const ACCOUNTANT_SECTIONS = [
  {
    label: "DASHBOARDS",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { label: "Credits", icon: WalletCards, path: "/credits" },
      { label: "Debits", icon: ArrowDownToLine, path: "/debits" },
      { label: "TransactionInfo", icon: Receipt, path: "/TransactionInfo" },
      { label: "Withdrawal", icon: Banknote, path: "/withdrawal" },
      { label: "Internal Expenses", icon: HandCoins, path: "/expenses" },
    ],
  },
];

function getSectionsByRole(role, permissions) {
  switch (role) {
    case 0:
      return ADMIN_SECTIONS;
    case 2:
      return ADMIN_SECTIONS
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) => !item.permission || permissions?.includes(item.permission)
          ),
        }))
        .filter((section) => section.items.length > 0);
    case 3:
      return ACCOUNTANT_SECTIONS;
    case 4:
      return ADMIN_SECTIONS;
    default:
      return [];
  }
}

const ROLE_LABELS = {
  0: "Admin",
  2: "Sub Admin",
  3: "Accountant",
  4: "Viewer",
};

function getRoleLabel(role) {
  return ROLE_LABELS[role] || "User";
}

// ─── Highlight Text ─────────────────────────────────────────
function HighlightText({ text, query }) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-white font-bold">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// ─── Section Label ──────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] tracking-widest text-gray-400 px-2 mb-1.5 mt-3 font-semibold uppercase select-none">
      {children}
    </p>
  );
}

// ─── Nav Item ───────────────────────────────────────────────
function NavItem({ item, open, activePath, navigate, searchQuery = "" }) {
  const IconComponent = item.icon;
  const active = activePath === item.path;

  const handleClick = useCallback(() => {
    navigate(item.path);
  }, [navigate, item.path]);

  if (!open) {
    return (
      <button
        onClick={handleClick}
        title={item.label}
        className="w-full flex justify-center mb-1 group cursor-pointer"
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${active
            ? "bg-[#b9fd5c] text-black shadow-lg shadow-[#b9fd5c]/25"
            : "text-white group-hover:bg-[#ffff] group-hover:text-[#b9fd5c]"
            }`}
        >
          <IconComponent
            size={20}
            strokeWidth={active ? 2.5 : 1.8}
            className="transition-all duration-200"
          />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`group w-full flex items-center gap-2.5 px-2.5 py-3 rounded-xs mb-1.5 text-[12.5px] transition-all duration-200 cursor-pointer ${active
        ? "bg-[#b9fd5c] text-black font-semibold shadow-sm shadow-[#b9fd5c]/20"
        : "hover:bg-[#252d38] text-white hover:text-white font-semibold"
        }`}
    >
      <span
        className={`shrink-0 transition-all duration-200 ${active
          ? "text-black"
          : "text-white group-hover:text-[#b9fd5c]"
          }`}
      >
        <IconComponent
          size={20}
          strokeWidth={active ? 2.5 : 1.8}
          className="transition-all duration-200"
        />
      </span>
      <span className="flex-1 text-left truncate leading-tight">
        <HighlightText text={item.label} query={searchQuery} />
      </span>
    </button>
  );
}

// ─── Mobile Header ──────────────────────────────────────────
function MobileHeader({ onMenuToggle, userName, role }) {
  const roleLabel = getRoleLabel(role);

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a] border-b border-[#1a1a1a]">
      <div className="flex items-center justify-between px-3 h-12">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuToggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700/30 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <Menu size={16} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#b9fd5c]/20 flex items-center justify-center text-[#b9fd5c] font-bold text-xs shrink-0">
              {(userName?.charAt(0) || "A").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate max-w-24">
                {userName || "User"}
              </p>
              <p className="text-[10px] text-white">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Overlay ─────────────────────────────────────────
function MobileOverlay({ show, onClose }) {
  if (!show) return null;
  return (
    <div
      className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
  );
}

// ─── Sidebar Content ────────────────────────────────────────
function SidebarContent({
  isMobile = false,
  open,
  setOpen,
  searchQuery,
  setSearchQuery,
  filteredSections,
  hasNoResults,
  activePath,
  handleNavigate,
  handleLogout,
  name,
  email,
  role,
  setMobileOpen,
}) {
  const expanded = open || isMobile;
  const roleLabel = getRoleLabel(role);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") setSearchQuery("");
    },
    [setSearchQuery]
  );

  const totalResults = useMemo(
    () => filteredSections.reduce((acc, s) => acc + s.items.length, 0),
    [filteredSections]
  );

  return (
    <>
      {/* Header */}
      <div className="px-3 pt-2.5 pb-2.5 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          {expanded && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#b9fd5c]/20 flex items-center justify-center text-[#b9fd5c] font-bold text-sm shrink-0">
                <img src="/logo.png" alt="logo" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold leading-tight truncate">
                  {name || "User"}
                </p>
                <p className="text-[10px] text-gray-500">{roleLabel}</p>
              </div>
            </div>
          )}

          {!isMobile && (
            <button
              onClick={() => {
                setOpen(!open);
                if (open) setSearchQuery("");
              }}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700/30 hover:bg-[#1a1a1a] transition-colors shrink-0 cursor-pointer"
            >
              {open ? (
                <X size={14} className="text-gray-400" />
              ) : (
                <Menu size={14} className="text-gray-400" />
              )}
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700/30 hover:bg-[#1a1a1a] transition-colors shrink-0 cursor-pointer"
            >
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Search */}
        {expanded && (
          <div className="mt-2">
            <div
              className={`flex items-center gap-2 bg-[#111111] rounded-lg px-2.5 py-2 text-xs border transition-colors duration-200 ${searchQuery
                ? "border-[#b9fd5c]/50 ring-1 ring-[#b9fd5c]/20"
                : "border-[#1a1a1a]"
                }`}
            >
              <Search
                size={13}
                className={searchQuery ? "text-[#b9fd5c]" : "text-gray-600"}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search menu..."
                className="bg-transparent outline-none w-full placeholder:text-gray-600 text-white text-xs"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              ) : (
                <span className="text-[9px] bg-[#1a1a1a] px-1 py-0.5 rounded text-gray-500 whitespace-nowrap select-none">
                  ⌘K
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1.5 sidebar-scroll">
        {expanded && searchQuery.trim() && !hasNoResults && (
          <div className="px-2 mb-1.5">
            <p className="text-[10px] text-[#b9fd5c]">
              Found {totalResults} result{totalResults !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {hasNoResults && expanded && (
          <div className="flex flex-col items-center justify-center py-8 px-3">
            <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center mb-2">
              <Search size={16} className="text-gray-600" />
            </div>
            <p className="text-gray-400 text-xs font-medium mb-0.5">No results found</p>
            <p className="text-black text-[10px] text-center">
              No menu items match &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-[10px] text-[#b9fd5c] hover:text-[#b9fd5c]/80 transition-colors underline underline-offset-2 cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}

        {filteredSections.map((section) => (
          <div key={section.label}>
            {expanded && <SectionLabel>{section.label}</SectionLabel>}
            {section.items.map((item) => (
              <NavItem
                key={item.path + item.label}
                item={item}
                open={expanded}
                activePath={activePath}
                navigate={handleNavigate}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-2 py-2 border-t border-[#1a1a1a]">
        {expanded ? (
          <Logout onLogout={handleLogout} userName={name} userEmail={email} />
        ) : (
          <div className="flex justify-center">
            <Logout onLogout={handleLogout} userName={name} userEmail={email} />
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Sidebar Export ────────────────────────────────────
export default function Sidebar({ open, setOpen }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const stored = useMemo(() => JSON.parse(localStorage.getItem("userData") || "{}"), []);
  const userData = stored?.data || stored;
  const { role, permissions = [], name = "User", email = "" } = userData || {};

  const roleSections = useMemo(
    () => getSectionsByRole(role, permissions),
    [role, permissions]
  );

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return roleSections;
    const query = searchQuery.toLowerCase().trim();
    return roleSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.path.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery, roleSections]);

  const hasNoResults = searchQuery.trim() && filteredSections.length === 0;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      setSearchQuery("");
      setMobileOpen(false);
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.clear();
        navigate("/login");
        resolve();
      }, 800);
    });
  }, [navigate]);

  const sharedProps = {
    searchQuery,
    setSearchQuery,
    filteredSections,
    hasNoResults,
    activePath,
    handleNavigate,
    handleLogout,
    name,
    email,
    role,
    setMobileOpen,
  };

  return (
    <>
      <MobileHeader
        onMenuToggle={() => setMobileOpen(true)}
        userName={name}
        role={role}
      />
      <MobileOverlay show={mobileOpen} onClose={() => setMobileOpen(false)} />

      <aside
        className={`lg:hidden fixed top-0 left-0 h-full z-50 flex flex-col bg-[#0a0a0a] text-white
          border-r border-[#1a1a1a] w-56 transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent isMobile open={true} setOpen={setOpen} {...sharedProps} />
      </aside>

      <aside
        className={`hidden lg:flex h-screen flex-col bg-[#0a0a0a] text-white
          border-r border-[#1a1a1a] transition-all duration-300 p-0
          ${open ? "w-60" : "w-14"}`}
      >
        <SidebarContent open={open} setOpen={setOpen} {...sharedProps} />
      </aside>
    </>
  );
}