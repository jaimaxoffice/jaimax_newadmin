// import {
//   LayoutDashboard,
//   ShoppingCart,
//   BarChart3,
//   Users,
//   Mail,
//   Star,
//   Settings,
//   HelpCircle,
//   Search,
//   Menu,
//   X,
// } from "lucide-react";

// const DASHBOARD_ITEMS = [
//   { label: "Dashboard", icon: LayoutDashboard, path: "/" },
//   { label: "Wallet", icon: ShoppingCart, path: "/wallet" },
//   { label: "Users", icon: BarChart3, path: "/users" },
//   { label: "Kyc", icon: Users, path: "/kyc" },
//   { label: "Withdrawal", icon: Users, path: "/withdrawal" },
// ];

// const SETTINGS_ITEMS = [
//   { label: "ICO", icon: Mail, path: "/ico" },
//   { label: "Customer Reviews", icon: Star, path: "/reviews" },
//   { label: "Settings", icon: Settings, path: "/settings" },
//   { label: "Help Centre", icon: HelpCircle, path: "/help" },
// ];
// const WEALTH_PLANS=[
//   {label:"Wealth Plan 1",icon:Mail,path:"/wealth-plan-1"},
//   {label:"Wealth Plan 2",icon:Mail,path:"/wealth-plan-2"},
//   {label:"Wealth Plan 3",icon:Mail,path:"/wealth-plan-3"},
// ]
// const USERS = [
//   { label: "user-info", icon: Users, path: "/user-info" },
//   { label: "User 2", icon: Users, path: "/user-2" },
//   { label: "User 3", icon: Users, path: "/user-3" },
// ];

// const TRANSACTIONS = [
//   { label: "Transaction 1", icon: Mail, path: "/transaction-1" },
//   { label: "Transaction 2", icon: Mail, path: "/transaction-2" },
//   { label: "Transaction 3", icon: Mail, path: "/transaction-3" },
// ];


// const MANUALS = [
//   { label: "ManualKYC", icon: Mail, path: "/manual-kyc" },
//   { label: "ManualAccounts", icon: Mail, path: "/manual-accounts" },
//   // { label: "Wealth Plan 3", icon: Mail, path: "/wealth-plan-3" },
// ];
// const REPORTS = [
//   { label: "Team-Reports", icon: Mail, path: "/team-reports" },
//   { label: "Team-Investments", icon: Mail, path: "/team-investments" },
//   // { label: "Wealth Plan 3", icon: Mail, path: "/wealth-plan-3" },
// ];


// export default function Sidebar({ open, setOpen, activePath, navigate }) {
//   return (
//     <aside
//       className={`
//         h-screen flex flex-col
//         bg-gradient-to-b from-[#0b1117] to-[#070c12]
//         text-gray-400 border-r border-[#18222c]/80
//         transition-all duration-300
//         ${open ? "w-72" : "w-20"}
//       `}
//     >
//       {/* Header */}
//       <div className="px-4 pt-4 pb-3 border-b border-[#18222c]/70">
//         <div className="flex items-center justify-between">
//           {open && (
//             <div className="flex items-center gap-3">
//               <img
//                 src="https://i.pravatar.cc/40"
//                 className="w-10 h-10 rounded-full ring-2 ring-lime-400/30"
//               />
//               <div>
//                 <p className="text-white text-sm font-semibold leading-tight">
//                   Guy Hawkins
//                 </p>
//                 <p className="text-xs text-gray-500">Admin</p>
//               </div>
//             </div>
//           )}

//           <button
//             onClick={() => setOpen(!open)}
//             className="
//               w-11 h-11 flex items-center justify-center
//               rounded-[4px] border border-gray-500/30
//               hover:bg-[#161616]
//               hover:border-gray-400/40
//               transition-all
//             "
//           >
//             {open ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>

//         {/* Search */}
//         {open && (
//           <div className="mt-4 flex items-center gap-2 bg-[#161616]/80 rounded-[4px] px-3 py-2.5 text-sm border border-[#1c2833]">
//             <Search size={16} className="text-gray-500" />
//             <input
//               placeholder="Search..."
//               className="bg-transparent outline-none w-full placeholder:text-gray-500"
//             />
//             <span className="text-[11px] bg-[#1c2833] px-2 py-0.5 rounded-md text-gray-400">
//               ⌘K
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Nav */}
//       <div className="flex-1 overflow-y-auto px-3 py-4 sidebar-scroll">
//         {open && <SectionLabel>DASHBOARDS</SectionLabel>}
//         {DASHBOARD_ITEMS.map((item) => (
//           <NavItem key={item.path} {...{ item, open, activePath, navigate }} />
//         ))}
//         {open && <SectionLabel>USERS</SectionLabel>}
//         {USERS.map((item) => (
//           <NavItem key={item.path} {...{ item, open, activePath, navigate }} />
//         ))}
//         {/* {open && <SectionLabel>TRANSACTIONS</SectionLabel>}
//         {TRANSACTIONS.map((item) => (
//           <NavItem key={item.path} {...{ item, open, activePath, navigate }} />
//         ))} */}
//         {open && <SectionLabel>MANUALS</SectionLabel>}
//         {MANUALS.map((item) => (
//           <NavItem key={item.path} {...{ item, open, activePath, navigate }} />
//         ))}

//         {open && <SectionLabel>SETTINGS</SectionLabel>}
//         {SETTINGS_ITEMS.map((item) => (
//           <NavItem key={item.path} {...{ item, open, activePath, navigate }} />
//         ))}
//         {open && <SectionLabel>WEALTHPLANS</SectionLabel>}
//         {WEALTH_PLANS.map((item) => (
//           <NavItem key={item.path} {...{ item, open, activePath, navigate }} />
//         ))}
//       </div>
//     </aside>
//   );
// }

// function SectionLabel({ children }) {
//   return (
//     <p className="text-[11px] tracking-widest text-gray-500/80 px-3 mb-3 mt-5 font-semibold">
//       {children}
//     </p>
//   );
// }

// function NavItem({ item, open, activePath, navigate }) {
//   const Icon = item.icon;
//   const active = activePath === item.path;

//   // Collapsed icon rail mode
//   if (!open) {
//     return (
//       <button
//         onClick={() => navigate(item.path)}
//         className="w-full flex justify-center mb-3 group"
//       >
//         <div
//           className={`
//             w-12 h-12 rounded-[4px] flex items-center justify-center
//             transition-all duration-200
//             ${
//               active
//                 ? "bg-[#eb660f] text-black shadow-lg shadow-lime-400/20"
//                 : "text-gray-500 group-hover:bg-[#161616] group-hover:text-white"
//             }
//           `}
//         >
//           <Icon size={22} strokeWidth={2.2} />
//         </div>
//       </button>
//     );
//   }

//   // Expanded mode
//   return (
//     <button
//       onClick={() => navigate(item.path)}
//       className={`
//         w-full flex items-center gap-3 px-4 py-3 rounded-[4px] mb-1.5
//         text-sm transition-all duration-200
//         ${
//           active
//             ? "bg-[#eb660f] text-white font-semibold shadow-sm"
//             : "hover:bg-[#161616] text-gray-400 hover:text-white"
//         }
//       `}
//     >
//       <Icon size={20} strokeWidth={2.2} />
//       <span className="flex-1 text-left">{item.label}</span>
//     </button>
//   );
// }


// import { useState, useMemo } from "react";
// import {
//   LayoutDashboard,
//   ShoppingCart,
//   BarChart3,
//   Users,
//   Mail,
//   Star,
//   Settings,
//   HelpCircle,
//   Search,
//   Menu,
//   X,
// } from "lucide-react";

// const DASHBOARD_ITEMS = [
//   { label: "Dashboard", icon: LayoutDashboard, path: "/" },
//   { label: "Wallet", icon: ShoppingCart, path: "/wallet" },
//   { label: "Users", icon: BarChart3, path: "/users" },
//   { label: "Kyc", icon: Users, path: "/kyc" },
//   { label: "Withdrawal(INR)", icon: Users, path: "/withdrawal" },
//   { label: "Withdrawal(USDT)", icon: Users, path: "/usdt-withdrawal" },
// ];

// const SETTINGS_ITEMS = [
//   { label: "ICO", icon: Mail, path: "/ico" },
//   { label: "Delete Accounts", icon: Star, path: "/delete-accounts" },
//   { label: "Settings", icon: Settings, path: "/settings" },
//   { label: "Logout", icon: HelpCircle, path: "/logout" },
// ];

// const WEALTH_PLANS = [
//   { label: "Wealth Plan 1", icon: Mail, path: "/wealth-plan-1" },
//   { label: "Wealth Plan log 1", icon: Mail, path: "/wealth-plan-log-1" },
//   { label: "Wealth Plan 2", icon: Mail, path: "/wealth-plan-2" },
//   { label: "Wealth Plan log 2", icon: Mail, path: "/wealth-plan-log-2" },
//   { label: "Wealth Plan 3", icon: Mail, path: "/wealth-plan-3" },
//   { label: "Wealth Plan log 3", icon: Mail, path: "/wealth-plan-log-3" },
// ];

// const USERS_LIST = [
//   { label: "user-info", icon: Users, path: "/user-info" },
//   { label: "Admin-User", icon: Users, path: "/admin-user" },
// ];

// const TRANSACTIONS = [
//   { label: "All Transactions", icon: Mail, path: "/all-transactions" },
//   { label: "PG Transactions", icon: Mail, path: "/pg-transactions" },
//   { label: "Payment-Gateway", icon: Mail, path: "/paymentgateway" },
//   { label: "Buy-History", icon: Mail, path: "/buy-history" },
// ];
// const BONUS = [
//   { label: "Gradual Bonus", icon: Mail, path: "/gradual-bonus" },
//   { label: "Bonus Coin History", icon: Mail, path: "/bonus-coin-history" },
//   { label: "Available-Balance", icon: Mail, path: "/available-balance" },
// ];

// const MANUALS = [
//   { label: "ManualKYC", icon: Mail, path: "/manual-kyc" },
//   { label: "ManualAccounts", icon: Mail, path: "/manual-accounts" },
// ];

// const REPORTS = [
//   { label: "Team-Reports", icon: Mail, path: "/team-reports" },
//   { label: "Team-Investments", icon: Mail, path: "/team-investments" },
// ];
// const NOTIFICATIONS = [
//   { label: "Announcements", icon: Mail, path: "/announcements" },
//   { label: "Notifications", icon: Mail, path: "/notifications" },
//   { label: "zoom-meetings", icon: Mail, path: "/zoommeetings" },
//   { label: "Blogs", icon: Mail, path: "/blogs" },
// ];
// const SUPPORT = [
//   { label: "Support", icon: Mail, path: "/support" },
//   { label: "Legal", icon: Mail, path: "/legal" },
//   { label: "freezed-Groups", icon: Mail, path: "/freezedgroups" },
//   { label: "Not-Verified-Users", icon: Mail, path: "/not-verified-users" },
// ];

// // All sections defined in one place for easy management
// const ALL_SECTIONS = [
//   { label: "DASHBOARDS", items: DASHBOARD_ITEMS },
//   { label: "USERS", items: USERS_LIST },
//   { label: "TRANSACTIONS", items: TRANSACTIONS },
//   { label: "MANUALS", items: MANUALS },
//   { label: "REPORTS", items: REPORTS },
//   { label: "BONUS", items: BONUS },
//   { label: "WEALTHPLANS", items: WEALTH_PLANS },
//   { label: "NOTIFICATIONS", items: NOTIFICATIONS },
//   { label: "SUPPORT", items: SUPPORT },
//   { label: "SETTINGS", items: SETTINGS_ITEMS },
// ];

// export default function Sidebar({ open, setOpen, activePath, navigate }) {
//   const [searchQuery, setSearchQuery] = useState("");

//   // Filter sections based on search query
//   const filteredSections = useMemo(() => {
//     if (!searchQuery.trim()) {
//       return ALL_SECTIONS;
//     }

//     const query = searchQuery.toLowerCase().trim();

//     return ALL_SECTIONS.map((section) => ({
//       ...section,
//       items: section.items.filter(
//         (item) =>
//           item.label.toLowerCase().includes(query) ||
//           item.path.toLowerCase().includes(query)
//       ),
//     })).filter((section) => section.items.length > 0);
//   }, [searchQuery]);

//   // Check if search has no results
//   const hasNoResults = searchQuery.trim() && filteredSections.length === 0;

//   // Handle keyboard shortcut for search
//   const handleKeyDown = (e) => {
//     if (e.key === "Escape") {
//       setSearchQuery("");
//     }
//   };

//   return (
//     <aside
//       className={`
//         h-screen flex flex-col
//         bg-gradient-to-b from-[#1b232d] to-[#1b232d]
//         text-gray-400 border-r border-[#18222c]/80
//         transition-all duration-300
//         ${open ? "w-72" : "w-20"}
//       `}
//     >
//       {/* Header */}
//       <div className="px-4 pt-4 pb-3 border-b border-[#18222c]/70">
//         <div className="flex items-center justify-between">
//           {open && (
//             <div className="flex items-center gap-3">
//               <img
//                 src="https://i.pravatar.cc/40"
//                 className="w-10 h-10 rounded-full ring-2 ring-lime-400/30"
//                 alt="User avatar"
//               />
//               <div>
//                 <p className="text-white text-sm font-semibold leading-tight">
//                   Guy Hawkins
//                 </p>
//                 <p className="text-xs text-gray-500">Admin</p>
//               </div>
//             </div>
//           )}

//           <button
//             onClick={() => {
//               setOpen(!open);
//               // Clear search when collapsing
//               if (open) setSearchQuery("");
//             }}
//             className="
//               w-11 h-11 flex items-center justify-center
//               rounded-[4px] border border-gray-500/30
//               hover:bg-[#1b232d]
//               hover:border-gray-400/40
//               transition-all
//             "
//           >
//             {open ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>

//         {/* Search */}
//         {open && (
//           <div className="mt-4 relative">
//             <div
//               className={`
//                 flex items-center gap-2 bg-[#1b232d]/80 rounded-[4px] 
//                 px-3 py-2.5 text-sm border transition-colors duration-200
//                 ${
//                   searchQuery
//                     ? "border-[#eb660f]/50 ring-1 ring-[#eb660f]/20"
//                     : "border-[#1c2833]"
//                 }
//               `}
//             >
//               <Search
//                 size={16}
//                 className={`transition-colors duration-200 ${
//                   searchQuery ? "text-[#eb660f]" : "text-gray-500"
//                 }`}
//               />
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Search menu..."
//                 className="bg-transparent outline-none w-full placeholder:text-gray-500 text-white"
//               />
//               {searchQuery ? (
//                 <button
//                   onClick={() => setSearchQuery("")}
//                   className="text-gray-400 hover:text-white transition-colors"
//                 >
//                   <X size={14} />
//                 </button>
//               ) : (
//                 <span className="text-[11px] bg-[#1c2833] px-2 py-0.5 rounded-md text-gray-400 whitespace-nowrap">
//                   ⌘K
//                 </span>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Nav */}
//       <div className="flex-1 overflow-y-auto px-3 py-4 sidebar-scroll">
//         {/* Search results info */}
//         {open && searchQuery.trim() && !hasNoResults && (
//           <div className="px-3 mb-3">
//             <p className="text-[11px] text-[#eb660f]">
//               Found{" "}
//               {filteredSections.reduce((acc, s) => acc + s.items.length, 0)}{" "}
//               result
//               {filteredSections.reduce((acc, s) => acc + s.items.length, 0) !== 1
//                 ? "s"
//                 : ""}{" "}
//               for &quot;{searchQuery}&quot;
//             </p>
//           </div>
//         )}

//         {/* No results state */}
//         {hasNoResults && open && (
//           <div className="flex flex-col items-center justify-center py-12 px-4">
//             <div className="w-16 h-16 rounded-full bg-[#1b232d] flex items-center justify-center mb-4">
//               <Search size={24} className="text-gray-600" />
//             </div>
//             <p className="text-gray-400 text-sm font-medium mb-1">
//               No results found
//             </p>
//             <p className="text-gray-600 text-xs text-center">
//               No menu items match &quot;{searchQuery}&quot;
//             </p>
//             <button
//               onClick={() => setSearchQuery("")}
//               className="mt-4 text-xs text-[#eb660f] hover:text-[#eb660f]/80 
//                          transition-colors underline underline-offset-2"
//             >
//               Clear search
//             </button>
//           </div>
//         )}

//         {/* Render filtered sections */}
//         {filteredSections.map((section) => (
//           <div key={section.label}>
//             {open && <SectionLabel>{section.label}</SectionLabel>}
//             {section.items.map((item) => (
//               <NavItem
//                 key={item.path}
//                 item={item}
//                 open={open}
//                 activePath={activePath}
//                 navigate={(path) => {
//                   navigate(path);
//                   setSearchQuery(""); // Clear search after navigation
//                 }}
//                 searchQuery={searchQuery}
//               />
//             ))}
//           </div>
//         ))}
//       </div>
//     </aside>
//   );
// }

// function SectionLabel({ children }) {
//   return (
//     <p className="text-[11px] tracking-widest text-gray-500/80 px-3 mb-3 mt-5 font-semibold">
//       {children}
//     </p>
//   );
// }

// // Highlight matching text in search results
// function HighlightText({ text, query }) {
//   if (!query.trim()) return <span>{text}</span>;

//   const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
//   const parts = text.split(regex);

//   return (
//     <span>
//       {parts.map((part, i) =>
//         regex.test(part) ? (
//           <span key={i} className="text-[#eb660f] font-semibold">
//             {part}
//           </span>
//         ) : (
//           <span key={i}>{part}</span>
//         )
//       )}
//     </span>
//   );
// }

// function NavItem({ item, open, activePath, navigate, searchQuery = "" }) {
//   const Icon = item.icon;
//   const active = activePath === item.path;

//   // Collapsed icon rail mode
//   if (!open) {
//     return (
//       <button
//         onClick={() => navigate(item.path)}
//         className="w-full flex justify-center mb-3 group"
//       >
//         <div
//           className={`
//             w-12 h-12 rounded-[4px] flex items-center justify-center
//             transition-all duration-200
//             ${
//               active
//                 ? "bg-[#eb660f] text-black shadow-lg shadow-lime-400/20"
//                 : "text-gray-500 group-hover:bg-[#1b232d] group-hover:text-white"
//             }
//           `}
//         >
//           <Icon size={22} strokeWidth={2.2} />
//         </div>
//       </button>
//     );
//   }

//   // Expanded mode
//   return (
//     <button
//       onClick={() => navigate(item.path)}
//       className={`
//         w-full flex items-center gap-3 px-4 py-3 rounded-[4px] mb-1.5
//         text-sm transition-all duration-200
//         ${
//           active
//             ? "bg-[#eb660f] text-white font-semibold shadow-sm"
//             : "hover:bg-[#1b232d] text-gray-400 hover:text-white"
//         }
//       `}
//     >
//       <Icon size={20} strokeWidth={2.2} />
//       <span className="flex-1 text-left">
//         <HighlightText text={item.label} query={searchQuery} />
//       </span>
//     </button>
//   );
// }


// import { useState, useMemo } from "react";
// import {
//   LayoutDashboard,
//   ShoppingCart,
//   BarChart3,
//   Users,
//   Mail,
//   Star,
//   Settings,
//   HelpCircle,
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
//       { label: "Wallet", icon: "/sidebar/new-wallet.png", path: "/wallet" },
//       { label: "Users", icon: "/sidebar/my-team.png", path: "/users" },
//       { label: "Kyc", icon: "/sidebar/kyc.png", path: "/kyc" },
//       { label: "Withdrawal(INR)", icon: "/sidebar/withdrawal.png", path: "/withdrawal" },
//       { label: "Withdrawal(USDT)", icon: "/sidebar/usdt.png", path: "/usdt-withdrawal" },
//     ],
//   },
//   {
//     label: "USERS",
//     items: [
//       { label: "user-info", icon: "/sidebar/tree.png", path: "/user-info" },
//       { label: "Admin-User", icon: "/sidebar/admin.png", path: "/admin-user" },
//     ],
//   },
//   {
//     label: "TRANSACTIONS",
//     items: [
//       { label: "All Transactions", icon: "/sidebar/history.png", path: "/all-transactions" },
//       { label: "PG Transactions", icon: "/sidebar/scanonline.png", path: "/pg-transactions" },
//       { label: "Payment-Gateway", icon: "/sidebar/payment_gateway.png", path: "/paymentgateway" },
//       { label: "Buy-History", icon: "/sidebar/new-wallet.png", path: "/buy-history" },
//     ],
//   },
//   {
//     label: "MANUALS",
//     items: [
//       { label: "ManualKYC", icon: "/sidebar/manualkyc.png", path: "/manual-kyc" },
//       { label: "ManualAccounts", icon: "/sidebar/developer.png", path: "/manual-accounts" },
//     ],
//   },
//   {
//     label: "REPORTS",
//     items: [
//       { label: "Team-Reports", icon: "/sidebar/team-report.png", path: "/team-reports" },
//       { label: "Team-Investments", icon: "/sidebar/team-report.png", path: "/team-investments" },
//       { label: "Reports", icon: "/sidebar/report.png", path: "/reports", permission: "TEAM REPORT" },
//       { label: "BusinessFrom-To", icon: Mail, path: "/businessreportfromto", permission: "TEAM REPORT" },
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
//       { label: "Wealth Plan 1", icon: "/sidebar/order.png", path: "/wealth-plan-1" },
//       { label: "Wealth Plan log 1", icon: "/sidebar/log.png", path: "/wealth-plan-log-1" },
//       { label: "Wealth Plan 2", icon: "/sidebar/order.png", path: "/wealth-plan-2" },
//       { label: "Wealth Plan log 2", icon: "/sidebar/log.png", path: "/wealth-plan-log-2" },
//       { label: "Wealth Plan 3", icon: "/sidebar/order.png", path: "/wealth-plan-3" },
//       { label: "Wealth Plan log 3", icon: "/sidebar/log.png", path: "/wealth-plan-log-3" },
//     ],
//   },
//   {
//     label: "NOTIFICATIONS",
//     items: [
//       { label: "Announcements", icon: "/sidebar/megaphone.png", path: "/announcements" },
//       { label: "Notifications", icon: "sidebar/notifications.png", path: "/notifications" },
//       { label: "zoom-meetings", icon: "/sidebar/meet.png", path: "/zoommeetings" },
//       { label: "Blogs", icon: "/sidebar/book-open-check.png", path: "/blogs" },
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
//       { label: "Settings", icon: "/sidebar/setting.svg", path: "/settings" },
//       { label: "Logout", icon: "/sidebar/logout.png", path: "/logout" },
//     ],
//   },
// ];

// // ─── SUB-ADMIN (role === 2) ───
// const ROLE2_SECTIONS = [
//   {
//     label: "DASHBOARDS",
//     items: [
//       { label: "Dashboard", icon: LayoutDashboard, path: "/", permission: "DASHBOARD" },
//       { label: "Wallet", icon: ShoppingCart, path: "/wallet", permission: "WALLET MANAGEMENT" },
//       { label: "Kyc", icon: Users, path: "/kyc", permission: "KYC MANAGEMENT" },
//       { label: "Withdrawal(INR)", icon: Users, path: "/withdrawal", permission: "WITHDRAW MANAGEMENT" },
//       { label: "Withdrawal(USDT)", icon: Users, path: "/usdt-withdrawal", permission: "WITHDRAW MANAGEMENT" },
//     ],
//   },
//   {
//     label: "USERS",
//     items: [
//       { label: "user-info", icon: Users, path: "/user-info", permission: "USER INFO" },
//     ],
//   },
//   {
//     label: "TRANSACTIONS",
//     items: [
//       { label: "All Transactions", icon: Mail, path: "/all-transactions", permission: "WALLET MANAGEMENT" },
//       { label: "PG Transactions", icon: Mail, path: "/pg-transactions", permission: "WALLET MANAGEMENT" },
//       { label: "Payment-Gateway", icon: Mail, path: "/paymentgateway", permission: "PAYMENTGATEWAYS" },
//       { label: "Buy-History", icon: Mail, path: "/buy-history", permission: "BUY HISTORY" },
//     ],
//   },
//   {
//     label: "MANUALS",
//     items: [
//       { label: "ManualKYC", icon: Mail, path: "/manual-kyc", permission: "MANUAL KYC" },
//       { label: "ManualAccounts", icon: Mail, path: "/manual-accounts", permission: "MANUAL TRANSACTION" },
//     ],
//   },
//   {
//     label: "REPORTS",
//     items: [
//       { label: "Team-Reports", icon: Mail, path: "/team-reports", permission: "TEAM REPORT" },
//       { label: "Team-Investments", icon: Mail, path: "/team-investments", permission: "TEAM REPORT" },
//       { label: "Reports", icon: Mail, path: "/reports", permission: "TEAM REPORT" },
//       { label: "BusinessFrom-To", icon: Mail, path: "/businessreportfromto", permission: "TEAM REPORT" },
//     ],
//   },
//   {
//     label: "BONUS",
//     items: [
//       { label: "Gradual Bonus", icon: Mail, path: "/gradual-bonus", permission: "GRADUAL BONUS" },
//       { label: "Bonus Coin History", icon: Mail, path: "/bonus-coin-history", permission: "SUPER BONUS" },
//       { label: "Available-Balance", icon: Mail, path: "/available-balance", permission: "AVAILABLE BALANCE" },
//     ],
//   },
//   {
//     label: "WEALTHPLANS",
//     items: [
//       { label: "Wealth Plan 1", icon: Mail, path: "/wealth-plan-1", permission: "WEALTH PLANS" },
//       { label: "Wealth Plan log 1", icon: Mail, path: "/wealth-plan-log-1", permission: "WEALTH PLANS" },
//       { label: "Wealth Plan 2", icon: Mail, path: "/wealth-plan-2", permission: "WEALTH PLANS" },
//       { label: "Wealth Plan log 2", icon: Mail, path: "/wealth-plan-log-2", permission: "WEALTH PLANS" },
//       { label: "Wealth Plan 3", icon: Mail, path: "/wealth-plan-3", permission: "WEALTH PLANS" },
//       { label: "Wealth Plan log 3", icon: Mail, path: "/wealth-plan-log-3", permission: "WEALTH PLANS" },
//     ],
//   },
//   {
//     label: "NOTIFICATIONS",
//     items: [
//       { label: "Announcements", icon: Mail, path: "/announcements", permission: "APP ANNOUNCEMENTS" },
//       { label: "Notifications", icon: Mail, path: "/notifications", permission: "NOTIFICATIONS" },
//       { label: "zoom-meetings", icon: Mail, path: "/zoommeetings", permission: "ZOOM MEETING" },
//       { label: "Blogs", icon: Mail, path: "/blogs", permission: "BLOGS" },
//     ],
//   },
//   {
//     label: "SUPPORT",
//     items: [
//       { label: "Support", icon: Mail, path: "/support", permission: "SUPPORT" },
//       { label: "Legal", icon: Mail, path: "/legal", permission: "LEGAL UPDATION" },
//       { label: "freezed-Groups", icon: Mail, path: "/freezedgroups", permission: "FREEZED GROUPS" },
//       { label: "Not-Verified-Users", icon: Mail, path: "/not-verified-users", permission: "NOT VERIFIED USERS" },
//     ],
//   },
//   {
//     label: "SETTINGS",
//     items: [
//       { label: "ICO", icon: Mail, path: "/ico", permission: "ICO MANAGEMENT" },
//       { label: "Delete Accounts", icon: Star, path: "/delete-accounts", permission: "DELETE ACCOUNTS" },
//       { label: "Settings", icon: Settings, path: "/settings", permission: "SETTING" },
//       { label: "Logout", icon: HelpCircle, path: "/logout" },
//     ],
//   },
// ];

// // ─── ACCOUNTANT (role === 3) ───
// const ACCOUNTANT_SECTIONS = [
//   {
//     label: "DASHBOARDS",
//     items: [
//       { label: "Dashboard", icon: LayoutDashboard, path: "/" },
//     ],
//   },
//   {
//     label: "SETTINGS",
//     items: [
//       { label: "Settings", icon: Settings, path: "/settings" },
//       { label: "Logout", icon: HelpCircle, path: "/logout" },
//     ],
//   },
// ];

// function getSectionsByRole(role, permissions) {
//   switch (role) {
//     case 0:
//       return ADMIN_SECTIONS;
//     case 2:
//       return ROLE2_SECTIONS
//         .map((section) => ({
//           ...section,
//           items: section.items.filter(
//             (item) => !item.permission || permissions?.includes(item.permission)
//           ),
//         }))
//         .filter((section) => section.items.length > 0);
//     case 3:
//       return ACCOUNTANT_SECTIONS;
//     default:
//       return [];
//   }
// }

// export default function Sidebar({ open, setOpen, activePath, navigate }) {
//   const [searchQuery, setSearchQuery] = useState("");

//   const stored = JSON.parse(localStorage.getItem("userData") || "{}");
//   const userData = stored?.data || stored;
//   const { role, permissions = [] } = userData || {};

//   const roleSections = useMemo(
//     () => getSectionsByRole(role, permissions),
//     [role, permissions]
//   );

//   // Filter sections based on search query
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

//   // Check if search has no results
//   const hasNoResults = searchQuery.trim() && filteredSections.length === 0;

//   // Handle keyboard shortcut for search
//   const handleKeyDown = (e) => {
//     if (e.key === "Escape") {
//       setSearchQuery("");
//     }
//   };

//   return (
//     <aside
//       className={`
//         h-screen flex flex-col
//         bg-gradient-to-b from-[#1b232d] to-[#1b232d]
//         text-gray-400 border-r border-[#18222c]/80
//         transition-all duration-300
//         ${open ? "w-72" : "w-20"}
//       `}
//     >
//       {/* Header */}
//       <div className="px-4 pt-4 pb-3 border-b border-[#18222c]/70">
//         <div className="flex items-center justify-between">
//           {open && (
//             <div className="flex items-center gap-3">
//               <img
//                 src="https://i.pravatar.cc/40"
//                 className="w-10 h-10 rounded-full ring-2 ring-lime-400/30"
//                 alt="User avatar"
//               />
//               <div>
//                 <p className="text-white text-sm font-semibold leading-tight">
//                   Guy Hawkins
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {role === 0 ? "Admin" : role === 2 ? "Sub Admin" : role === 3 ? "Accountant" : "User"}
//                 </p>
//               </div>
//             </div>
//           )}

//           <button
//             onClick={() => {
//               setOpen(!open);
//               if (open) setSearchQuery("");
//             }}
//             className="
//               w-11 h-11 flex items-center justify-center
//               rounded-[4px] border border-gray-500/30
//               hover:bg-[#1b232d]
//               hover:border-gray-400/40
//               transition-all
//             "
//           >
//             {open ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>

//         {/* Search */}
//         {open && (
//           <div className="mt-4 relative">
//             <div
//               className={`
//                 flex items-center gap-2 bg-[#1b232d]/80 rounded-[4px] 
//                 px-3 py-2.5 text-sm border transition-colors duration-200
//                 ${
//                   searchQuery
//                     ? "border-[#eb660f]/50 ring-1 ring-[#eb660f]/20"
//                     : "border-[#1c2833]"
//                 }
//               `}
//             >
//               <Search
//                 size={16}
//                 className={`transition-colors duration-200 ${
//                   searchQuery ? "text-[#eb660f]" : "text-gray-500"
//                 }`}
//               />
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Search menu..."
//                 className="bg-transparent outline-none w-full placeholder:text-gray-500 text-white"
//               />
//               {searchQuery ? (
//                 <button
//                   onClick={() => setSearchQuery("")}
//                   className="text-gray-400 hover:text-white transition-colors"
//                 >
//                   <X size={14} />
//                 </button>
//               ) : (
//                 <span className="text-[11px] bg-[#1c2833] px-2 py-0.5 rounded-md text-gray-400 whitespace-nowrap">
//                   ⌘K
//                 </span>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Nav */}
//       <div className="flex-1 overflow-y-auto px-3 py-4 sidebar-scroll">
//         {/* Search results info */}
//         {open && searchQuery.trim() && !hasNoResults && (
//           <div className="px-3 mb-3">
//             <p className="text-[11px] text-[#eb660f]">
//               Found{" "}
//               {filteredSections.reduce((acc, s) => acc + s.items.length, 0)}{" "}
//               result
//               {filteredSections.reduce((acc, s) => acc + s.items.length, 0) !== 1
//                 ? "s"
//                 : ""}{" "}
//               for &quot;{searchQuery}&quot;
//             </p>
//           </div>
//         )}

//         {/* No results state */}
//         {hasNoResults && open && (
//           <div className="flex flex-col items-center justify-center py-12 px-4">
//             <div className="w-16 h-16 rounded-full bg-[#1b232d] flex items-center justify-center mb-4">
//               <Search size={24} className="text-gray-600" />
//             </div>
//             <p className="text-gray-400 text-sm font-medium mb-1">
//               No results found
//             </p>
//             <p className="text-gray-600 text-xs text-center">
//               No menu items match &quot;{searchQuery}&quot;
//             </p>
//             <button
//               onClick={() => setSearchQuery("")}
//               className="mt-4 text-xs text-[#eb660f] hover:text-[#eb660f]/80 
//                          transition-colors underline underline-offset-2"
//             >
//               Clear search
//             </button>
//           </div>
//         )}

//         {/* Render filtered sections */}
//         {filteredSections.map((section) => (
//           <div key={section.label}>
//             {open && <SectionLabel>{section.label}</SectionLabel>}
//             {section.items.map((item) => (
//               <NavItem
//                 key={item.path}
//                 item={item}
//                 open={open}
//                 activePath={activePath}
//                 navigate={(path) => {
//                   navigate(path);
//                   setSearchQuery("");
//                 }}
//                 searchQuery={searchQuery}
//               />
//             ))}
//           </div>
//         ))}
//       </div>
//     </aside>
//   );
// }

// function SectionLabel({ children }) {
//   return (
//     <p className="text-[11px] tracking-widest text-gray-500/80 px-3 mb-3 mt-5 font-semibold">
//       {children}
//     </p>
//   );
// }

// // Highlight matching text in search results
// function HighlightText({ text, query }) {
//   if (!query.trim()) return <span>{text}</span>;

//   const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
//   const parts = text.split(regex);

//   return (
//     <span>
//       {parts.map((part, i) =>
//         regex.test(part) ? (
//           <span key={i} className="text-[#ffff] font-semibold">
//             {part}
//           </span>
//         ) : (
//           <span key={i}>{part}</span>
//         )
//       )}
//     </span>
//   );
// }

// function NavItem({ item, open, activePath, navigate, searchQuery = "" }) {
//   const Icon = item.icon;
//   const active = activePath === item.path;

//   const renderIcon = (size = 20) => {
//     // If icon is image path (string)
//     if (typeof Icon === "string") {
//       return (
//         <img
//           src={Icon}
//           alt={item.label}
//           className="w-[20px] h-[20px] object-contain"
//         />
//       );
//     }

//     // If icon is React component (lucide, etc)
//     return <Icon size={size} strokeWidth={2.2} />;
//   };

//   // Collapsed icon rail mode
//   if (!open) {
//     return (
//       <button
//         onClick={() => navigate(item.path)}
//         className="w-full flex justify-center mb-3 group"
//       >
//         <div
//           className={`
//             w-12 h-12 rounded-[4px] flex items-center justify-center
//             transition-all duration-200
//             ${
//               active
//                 ? "bg-[#eb660f] text-black shadow-lg shadow-lime-400/20"
//                 : "text-gray-500 group-hover:bg-[#1b232d] group-hover:text-white"
//             }
//           `}
//         >
//           {renderIcon(22)}
//         </div>
//       </button>
//     );
//   }

//   // Expanded mode
//   return (
//     <button
//       onClick={() => navigate(item.path)}
//       className={`
//         w-full flex items-center gap-3 px-4 py-3 rounded-[4px] mb-1.5
//         text-sm transition-all duration-200
//         ${
//           active
//             ? "bg-[#eb660f] text-white font-semibold shadow-sm"
//             : "hover:bg-[#1b232d] text-gray-400 hover:text-white"
//         }
//       `}
//     >
//       {renderIcon(20)}

//       <span className="flex-1 text-left">
//         <HighlightText text={item.label} query={searchQuery} />
//       </span>
//     </button>
//   );
// }



// import { useState, useMemo } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Logout from "../Features/Logout/Logout";
// import {
//   LayoutDashboard,
//   ShoppingCart,
//   Users,
//   Mail,
//   Star,
//   Settings,
//   HelpCircle,
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
//       { label: "Wallet", icon: "/sidebar/new-wallet.png", path: "/wallet" },
//       { label: "Users", icon: "/sidebar/my-team.png", path: "/users" },
//       { label: "Kyc", icon: "/sidebar/kyc.png", path: "/kyc" },
//       { label: "Withdrawal(INR)", icon: "/sidebar/withdrawal.png", path: "/withdrawal" },
//       { label: "Withdrawal(USDT)", icon: "/sidebar/usdt.png", path: "/usdt-withdrawal" },
//     ],
//   },
//   {
//     label: "USERS",
//     items: [
//       { label: "user-info", icon: "/sidebar/tree.png", path: "/user-info" },
//       { label: "Admin-User", icon: "/sidebar/admin.png", path: "/admin-user" },
//     ],
//   },
//   {
//     label: "TRANSACTIONS",
//     items: [
//       { label: "All Transactions", icon: "/sidebar/history.png", path: "/all-transactions" },
//       { label: "PG Transactions", icon: "/sidebar/scanonline.png", path: "/pg-transactions" },
//       { label: "Payment-Gateway", icon: "/sidebar/payment_gateway.png", path: "/paymentgateway" },
//       { label: "Buy-History", icon: "/sidebar/new-wallet.png", path: "/buy-history" },
//     ],
//   },
//   {
//     label: "MANUALS",
//     items: [
//       { label: "ManualKYC", icon: "/sidebar/manualkyc.png", path: "/manual-kyc" },
//       { label: "ManualAccounts", icon: "/sidebar/developer.png", path: "/manual-accounts" },
//     ],
//   },
//   {
//     label: "REPORTS",
//     items: [
//       { label: "Team-Reports", icon: "/sidebar/team-report.png", path: "/team-reports" },
//       { label: "Team-Investments", icon: "/sidebar/team-report.png", path: "/team-investments" },
//       { label: "Reports", icon: "/sidebar/report.png", path: "/reports" },
//       { label: "BusinessFrom-To", icon: "/sidebar/report.png", path: "/businessreportfromto" },
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
//       { label: "Wealth Plan 1", icon: "/sidebar/order.png", path: "/wealth-plan-1" },
//       { label: "Wealth Plan log 1", icon: "/sidebar/log.png", path: "/wealth-plan-log-1" },
//       { label: "Wealth Plan 2", icon: "/sidebar/order.png", path: "/wealth-plan-2" },
//       { label: "Wealth Plan log 2", icon: "/sidebar/log.png", path: "/wealth-plan-log-2" },
//       { label: "Wealth Plan 3", icon: "/sidebar/order.png", path: "/wealth-plan-3" },
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
//       { label: "Settings", icon: "/sidebar/setting.svg", path: "/settings" },
//     ],
//   },
// ];

// // ─── SUB-ADMIN (role === 2) ───
// const ROLE2_SECTIONS = [
//   {
//     label: "DASHBOARDS",
//     items: [
//       { label: "Dashboard", icon: LayoutDashboard, path: "/", permission: "DASHBOARD" },
//       { label: "Wallet", icon: ShoppingCart, path: "/wallet", permission: "WALLET MANAGEMENT" },
//       { label: "Kyc", icon: Users, path: "/kyc", permission: "KYC MANAGEMENT" },
//       { label: "Withdrawal(INR)", icon: Users, path: "/withdrawal", permission: "WITHDRAW MANAGEMENT" },
//       { label: "Withdrawal(USDT)", icon: Users, path: "/usdt-withdrawal", permission: "WITHDRAW MANAGEMENT" },
//     ],
//   },
//   {
//     label: "USERS",
//     items: [
//       { label: "user-info", icon: Users, path: "/user-info", permission: "USER INFO" },
//     ],
//   },
//   {
//     label: "TRANSACTIONS",
//     items: [
//       { label: "All Transactions", icon: Mail, path: "/all-transactions", permission: "WALLET MANAGEMENT" },
//       { label: "PG Transactions", icon: Mail, path: "/pg-transactions", permission: "WALLET MANAGEMENT" },
//       { label: "Payment-Gateway", icon: Mail, path: "/paymentgateway", permission: "PAYMENTGATEWAYS" },
//       { label: "Buy-History", icon: Mail, path: "/buy-history", permission: "BUY HISTORY" },
//     ],
//   },
//   {
//     label: "MANUALS",
//     items: [
//       { label: "ManualKYC", icon: Mail, path: "/manual-kyc", permission: "MANUAL KYC" },
//       { label: "ManualAccounts", icon: Mail, path: "/manual-accounts", permission: "MANUAL TRANSACTION" },
//     ],
//   },
//   {
//     label: "REPORTS",
//     items: [
//       { label: "Team-Reports", icon: Mail, path: "/team-reports", permission: "TEAM REPORT" },
//       { label: "Team-Investments", icon: Mail, path: "/team-investments", permission: "TEAM REPORT" },
//       { label: "Reports", icon: Mail, path: "/reports", permission: "TEAM REPORT" },
//       { label: "BusinessFrom-To", icon: Mail, path: "/businessreportfromto", permission: "TEAM REPORT" },
//     ],
//   },
//   {
//     label: "BONUS",
//     items: [
//       { label: "Gradual Bonus", icon: Mail, path: "/gradual-bonus", permission: "GRADUAL BONUS" },
//       { label: "Bonus Coin History", icon: Mail, path: "/bonus-coin-history", permission: "SUPER BONUS" },
//       { label: "Available-Balance", icon: Mail, path: "/available-balance", permission: "AVAILABLE BALANCE" },
//     ],
//   },
//   {
//     label: "WEALTHPLANS",
//     items: [
//       { label: "Wealth Plan 1", icon: Mail, path: "/wealth-plan-1", permission: "WEALTH PLANS" },
//       { label: "Wealth Plan log 1", icon: Mail, path: "/wealth-plan-log-1", permission: "WEALTH PLANS" },
//       { label: "Wealth Plan 2", icon: Mail, path: "/wealth-plan-2", permission: "WEALTH PLANS" },
//       { label: "Wealth Plan log 2", icon: Mail, path: "/wealth-plan-log-2", permission: "WEALTH PLANS" },
//       { label: "Wealth Plan 3", icon: Mail, path: "/wealth-plan-3", permission: "WEALTH PLANS" },
//       { label: "Wealth Plan log 3", icon: Mail, path: "/wealth-plan-log-3", permission: "WEALTH PLANS" },
//     ],
//   },
//   {
//     label: "NOTIFICATIONS",
//     items: [
//       { label: "Announcements", icon: Mail, path: "/announcements", permission: "APP ANNOUNCEMENTS" },
//       { label: "Notifications", icon: Mail, path: "/notifications", permission: "NOTIFICATIONS" },
//       { label: "zoom-meetings", icon: Mail, path: "/zoommeetings", permission: "ZOOM MEETING" },
//       { label: "Blogs", icon: Mail, path: "/blogs", permission: "BLOGS" },
//     ],
//   },
//   {
//     label: "SUPPORT",
//     items: [
//       { label: "Support", icon: Mail, path: "/support", permission: "SUPPORT" },
//       { label: "Legal", icon: Mail, path: "/legal", permission: "LEGAL UPDATION" },
//       { label: "freezed-Groups", icon: Mail, path: "/freezedgroups", permission: "FREEZED GROUPS" },
//       { label: "Not-Verified-Users", icon: Mail, path: "/not-verified-users", permission: "NOT VERIFIED USERS" },
//     ],
//   },
//   {
//     label: "SETTINGS",
//     items: [
//       { label: "ICO", icon: Mail, path: "/ico", permission: "ICO MANAGEMENT" },
//       { label: "Delete Accounts", icon: Star, path: "/delete-accounts", permission: "DELETE ACCOUNTS" },
//       { label: "Settings", icon: Settings, path: "/settings", permission: "SETTING" },
//     ],
//   },
// ];

// // ─── ACCOUNTANT (role === 3) ───
// const ACCOUNTANT_SECTIONS = [
//   {
//     label: "DASHBOARDS",
//     items: [
//       { label: "Dashboard", icon: LayoutDashboard, path: "/" },
//     ],
//   },
//   {
//     label: "SETTINGS",
//     items: [
//       { label: "Settings", icon: Settings, path: "/settings" },
//     ],
//   },
// ];

// // ─── ROLE 4 ───
// const ROLE4_SECTIONS = [
//   {
//     label: "REPORTS",
//     items: [
//       { label: "CreditReport", icon: "/sidebar/tree.png", path: "/credit-report" },
//       { label: "DebitReport", icon: "/sidebar/tree.png", path: "/debit-report" },
//       { label: "WithdrawalReport", icon: "/sidebar/tree.png", path: "/withdraw-report" },
//       { label: "User Info", icon: "/sidebar/usericon.png", path: "/get-user-details" },
//     ],
//   },
// ];

// function getSectionsByRole(role, permissions) {
//   switch (role) {
//     case 0:
//       return ADMIN_SECTIONS;
//     case 2:
//       return ROLE2_SECTIONS
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
//       return ROLE4_SECTIONS;
//     default:
//       return [];
//   }
// }

// export default function Sidebar({ open, setOpen }) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation();
//   const activePath = location.pathname;

//   const stored = JSON.parse(localStorage.getItem("userData") || "{}");
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

//   const handleKeyDown = (e) => {
//     if (e.key === "Escape") {
//       setSearchQuery("");
//     }
//   };

//   const handleNavigate = (path) => {
//     navigate(path);
//     setSearchQuery("");
//   };

// // In your Sidebar component, update handleLogout to return a Promise
// const handleLogout = () => {
//   return new Promise((resolve) => {
//     // Small delay so the user sees "Logging out..." spinner
//     setTimeout(() => {
//       localStorage.clear();
//       navigate("/login");
//       resolve();
//     }, 800);
//   });
// };

//   return (
//     <aside
//       className={`
//         h-screen flex flex-col
//         bg-gradient-to-b from-[#1b232d] to-[#1b232d]
//         text-gray-400 border-r border-[#18222c]/80
//         transition-all duration-300
//         ${open ? "w-72" : "w-20"}
//       `}
//     >
//       {/* Header */}
//       <div className="px-4 pt-0 pb-3 border-b border-[#18222c]/70">
//         <div className="flex items-center justify-between">
//           {open && (
//             <div className="flex items-center gap-3">
//               <img
//                 src="https://i.pravatar.cc/40"
//                 className="w-10 h-10 rounded-full ring-2 ring-lime-400/30"
//                 alt="User avatar"
//               />
//               <div>
//                 <p className="text-white text-sm font-semibold leading-tight">
//                   {name || "User"}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {role === 0
//                     ? "Admin"
//                     : role === 2
//                     ? "Sub Admin"
//                     : role === 3
//                     ? "Accountant"
//                     : role === 4
//                     ? "Viewer"
//                     : "User"}
//                 </p>
//               </div>
//             </div>
//           )}

//           <button
//             onClick={() => {
//               setOpen(!open);
//               if (open) setSearchQuery("");
//             }}
//             className="
//               w-11 h-11 flex items-center justify-center
//               rounded-[4px] border border-gray-500/30
//               hover:bg-[#1b232d]
//               hover:border-gray-400/40
//               transition-all
//             "
//           >
//             {open ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>

//         {/* Search */}
//         {open && (
//           <div className="mt-4 relative">
//             <div
//               className={`
//                 flex items-center gap-2 bg-[#1b232d]/80 rounded-[4px] 
//                 px-3 py-2.5 text-sm border transition-colors duration-200
//                 ${
//                   searchQuery
//                     ? "border-[#eb660f]/50 ring-1 ring-[#eb660f]/20"
//                     : "border-[#1c2833]"
//                 }
//               `}
//             >
//               <Search
//                 size={16}
//                 className={`transition-colors duration-200 ${
//                   searchQuery ? "text-[#eb660f]" : "text-gray-500"
//                 }`}
//               />
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Search menu..."
//                 className="bg-transparent outline-none w-full placeholder:text-gray-500 text-white"
//               />
//               {searchQuery ? (
//                 <button
//                   onClick={() => setSearchQuery("")}
//                   className="text-gray-400 hover:text-white transition-colors"
//                 >
//                   <X size={14} />
//                 </button>
//               ) : (
//                 <span className="text-[11px] bg-[#1c2833] px-2 py-0.5 rounded-md text-gray-400 whitespace-nowrap">
//                   ⌘K
//                 </span>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Nav */}
//       <div className="flex-1 overflow-y-auto px-3 py-2 sidebar-scroll">
//         {/* Search results info */}
//         {open && searchQuery.trim() && !hasNoResults && (
//           <div className="px-3 mb-3">
//             <p className="text-[11px] text-[#eb660f]">
//               Found{" "}
//               {filteredSections.reduce((acc, s) => acc + s.items.length, 0)}{" "}
//               result
//               {filteredSections.reduce((acc, s) => acc + s.items.length, 0) !== 1
//                 ? "s"
//                 : ""}{" "}
//               for &quot;{searchQuery}&quot;
//             </p>
//           </div>
//         )}

//         {/* No results state */}
//         {hasNoResults && open && (
//           <div className="flex flex-col items-center justify-center py-12 px-4">
//             <div className="w-16 h-16 rounded-full bg-[#1b232d] flex items-center justify-center mb-4">
//               <Search size={24} className="text-gray-600" />
//             </div>
//             <p className="text-gray-400 text-sm font-medium mb-1">
//               No results found
//             </p>
//             <p className="text-gray-600 text-xs text-center">
//               No menu items match &quot;{searchQuery}&quot;
//             </p>
//             <button
//               onClick={() => setSearchQuery("")}
//               className="mt-4 text-xs text-[#eb660f] hover:text-[#eb660f]/80 
//                          transition-colors underline underline-offset-2"
//             >
//               Clear search
//             </button>
//           </div>
//         )}

//         {/* Render filtered sections */}
//         {filteredSections.map((section) => (
//           <div key={section.label}>
//             {open && <SectionLabel>{section.label}</SectionLabel>}
//             {section.items.map((item) => (
//               <NavItem
//                 key={item.path + item.label}
//                 item={item}
//                 open={open}
//                 activePath={activePath}
//                 navigate={handleNavigate}
//                 searchQuery={searchQuery}
//               />
//             ))}
//           </div>
//         ))}
//       </div>

//       {/* Logout at Bottom */}
//       <div className="px-3 py-4 border-t border-[#18222c]/70">
//         {open ? (
//           <Logout
//             onLogout={handleLogout}
//             userName={name}
//             userEmail={email}
//           />
//         ) : (
//           <Logout
//             onLogout={handleLogout}
//             userName={name}
//             userEmail={email}
//           />
//         )}
//       </div>
//     </aside>
//   );
// }

// function SectionLabel({ children }) {
//   return (
//     <p className="text-[11px] tracking-widest text-gray-500/80 px-3 mb-3 mt-0 font-semibold">
//       {children}
//     </p>
//   );
// }

// function HighlightText({ text, query }) {
//   if (!query.trim()) return <span>{text}</span>;

//   const regex = new RegExp(
//     `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
//     "gi"
//   );
//   const parts = text.split(regex);

//   return (
//     <span>
//       {parts.map((part, i) =>
//         regex.test(part) ? (
//           <span key={i} className="text-[#ffff] font-semibold">
//             {part}
//           </span>
//         ) : (
//           <span key={i}>{part}</span>
//         )
//       )}
//     </span>
//   );
// }

// function NavItem({ item, open, activePath, navigate, searchQuery = "" }) {
//   const Icon = item.icon;
//   const active = activePath === item.path;

//   const renderIcon = (size = 20) => {
//     if (typeof Icon === "string") {
//       return (
//         <img
//           src={Icon}
//           alt={item.label}
//           className="w-[20px] h-[20px] object-contain"
//         />
//       );
//     }
//     return <Icon size={size} strokeWidth={2.2} />;
//   };

//   if (!open) {
//     return (
//       <button
//         onClick={() => navigate(item.path)}
//         className="w-full flex justify-center mb-3 group"
//       >
//         <div
//           className={`
//             w-12 h-12 rounded-[4px] flex items-center justify-center
//             transition-all duration-200
//             ${
//               active
//                 ? "bg-[#eb660f] text-black shadow-lg shadow-lime-400/20"
//                 : "text-gray-500 group-hover:bg-[#1b232d] group-hover:text-white"
//             }
//           `}
//         >
//           {renderIcon(22)}
//         </div>
//       </button>
//     );
//   }

//   return (
//     <button
//       onClick={() => navigate(item.path)}
//       className={`
//         w-full flex items-center gap-3 px-4 py-3 rounded-[4px] mb-1.5
//         text-sm transition-all duration-200
//         ${
//           active
//             ? "bg-[#eb660f] text-white font-semibold shadow-sm"
//             : "hover:bg-[#1b232d] text-gray-400 hover:text-white"
//         }
//       `}
//     >
//       {renderIcon(20)}
//       <span className="flex-1 text-left">
//         <HighlightText text={item.label} query={searchQuery} />
//       </span>
//     </button>
//   );
// }


import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logout from "../Features/Logout/Logout";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Mail,
  Star,
  Settings,
  HelpCircle,
  Search,
  Menu,
  X,
} from "lucide-react";

// ─── ADMIN (role === 0) ───
const ADMIN_SECTIONS = [
  {
    label: "DASHBOARDS",
    items: [
      { label: "Dashboard", icon: "/sidebar/home.png", path: "/" },
      { label: "Wallet", icon: "/sidebar/new-wallet.png", path: "/wallet" },
      { label: "Users", icon: "/sidebar/my-team.png", path: "/users" },
      { label: "Kyc", icon: "/sidebar/kyc.png", path: "/kyc" },
      { label: "Withdrawal(INR)", icon: "/sidebar/withdrawal.png", path: "/withdrawal" },
      { label: "Withdrawal(USDT)", icon: "/sidebar/usdt.png", path: "/usdt-withdrawal" },
    ],
  },
  {
    label: "USERS",
    items: [
      { label: "user-info", icon: "/sidebar/tree.png", path: "/user-info" },
      { label: "Admin-User", icon: "/sidebar/admin.png", path: "/admin-user" },
    ],
  },
  {
    label: "TRANSACTIONS",
    items: [
      { label: "All Transactions", icon: "/sidebar/history.png", path: "/all-transactions" },
      { label: "PG Transactions", icon: "/sidebar/scanonline.png", path: "/pg-transactions" },
      { label: "Payment-Gateway", icon: "/sidebar/payment_gateway.png", path: "/paymentgateway" },
      { label: "Buy-History", icon: "/sidebar/new-wallet.png", path: "/buy-history" },
    ],
  },
  {
    label: "MANUALS",
    items: [
      { label: "ManualKYC", icon: "/sidebar/manualkyc.png", path: "/manual-kyc" },
      { label: "ManualAccounts", icon: "/sidebar/developer.png", path: "/manual-accounts" },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { label: "Team-Reports", icon: "/sidebar/team-report.png", path: "/team-reports" },
      { label: "Team-Investments", icon: "/sidebar/team-report.png", path: "/team-investments" },
      { label: "Reports", icon: "/sidebar/report.png", path: "/reports" },
      { label: "BusinessFrom-To", icon: "/sidebar/report.png", path: "/businessreportfromto" },
    ],
  },
  {
    label: "BONUS",
    items: [
      { label: "Gradual Bonus", icon: "/sidebar/clipboardclock.png", path: "/gradual-bonus" },
      { label: "Bonus Coin History", icon: "/sidebar/bonuscoinhistory.png", path: "/bonus-coin-history" },
      { label: "Available-Balance", icon: "/sidebar/salary.png", path: "/available-balance" },
    ],
  },
  {
    label: "WEALTHPLANS",
    items: [
      { label: "Wealth Plan 1", icon: "/sidebar/order.png", path: "/wealth-plan-1" },
      { label: "Wealth Plan log 1", icon: "/sidebar/log.png", path: "/wealth-plan-log-1" },
      { label: "Wealth Plan 2", icon: "/sidebar/order.png", path: "/wealth-plan-2" },
      { label: "Wealth Plan log 2", icon: "/sidebar/log.png", path: "/wealth-plan-log-2" },
      { label: "Wealth Plan 3", icon: "/sidebar/order.png", path: "/wealth-plan-3" },
      { label: "Wealth Plan log 3", icon: "/sidebar/log.png", path: "/wealth-plan-log-3" },
    ],
  },
  {
    label: "NOTIFICATIONS",
    items: [
      { label: "Announcements", icon: "/sidebar/megaphone.png", path: "/announcements" },
      { label: "Notifications", icon: "/sidebar/notifications.png", path: "/notifications" },
      { label: "zoom-meetings", icon: "/sidebar/meet.png", path: "/zoommeetings" },
      { label: "Blogs", icon: "/sidebar/book-open-check.png", path: "/blogs" },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { label: "Support", icon: "/sidebar/newsupport.png", path: "/support" },
      { label: "Legal", icon: "/sidebar/newlegal.png", path: "/legal" },
      { label: "freezed-Groups", icon: "/sidebar/group.png", path: "/freezedgroups" },
      { label: "Not-Verified-Users", icon: "/sidebar/user-x.png", path: "/not-verified-users" },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { label: "ICO", icon: "/sidebar/ico.png", path: "/ico" },
      { label: "Delete Accounts", icon: "/sidebar/delete.png", path: "/delete-accounts" },
      { label: "Settings", icon: "/sidebar/setting.svg", path: "/settings" },
    ],
  },
];

// ─── SUB-ADMIN (role === 2) ───
const ROLE2_SECTIONS = [
  {
    label: "DASHBOARDS",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/", permission: "DASHBOARD" },
      { label: "Wallet", icon: ShoppingCart, path: "/wallet", permission: "WALLET MANAGEMENT" },
      { label: "Kyc", icon: Users, path: "/kyc", permission: "KYC MANAGEMENT" },
      { label: "Withdrawal(INR)", icon: Users, path: "/withdrawal", permission: "WITHDRAW MANAGEMENT" },
      { label: "Withdrawal(USDT)", icon: Users, path: "/usdt-withdrawal", permission: "WITHDRAW MANAGEMENT" },
    ],
  },
  {
    label: "USERS",
    items: [
      { label: "user-info", icon: Users, path: "/user-info", permission: "USER INFO" },
    ],
  },
  {
    label: "TRANSACTIONS",
    items: [
      { label: "All Transactions", icon: Mail, path: "/all-transactions", permission: "WALLET MANAGEMENT" },
      { label: "PG Transactions", icon: Mail, path: "/pg-transactions", permission: "WALLET MANAGEMENT" },
      { label: "Payment-Gateway", icon: Mail, path: "/paymentgateway", permission: "PAYMENTGATEWAYS" },
      { label: "Buy-History", icon: Mail, path: "/buy-history", permission: "BUY HISTORY" },
    ],
  },
  {
    label: "MANUALS",
    items: [
      { label: "ManualKYC", icon: Mail, path: "/manual-kyc", permission: "MANUAL KYC" },
      { label: "ManualAccounts", icon: Mail, path: "/manual-accounts", permission: "MANUAL TRANSACTION" },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { label: "Team-Reports", icon: Mail, path: "/team-reports", permission: "TEAM REPORT" },
      { label: "Team-Investments", icon: Mail, path: "/team-investments", permission: "TEAM REPORT" },
      { label: "Reports", icon: Mail, path: "/reports", permission: "TEAM REPORT" },
      { label: "BusinessFrom-To", icon: Mail, path: "/businessreportfromto", permission: "TEAM REPORT" },
    ],
  },
  {
    label: "BONUS",
    items: [
      { label: "Gradual Bonus", icon: Mail, path: "/gradual-bonus", permission: "GRADUAL BONUS" },
      { label: "Bonus Coin History", icon: Mail, path: "/bonus-coin-history", permission: "SUPER BONUS" },
      { label: "Available-Balance", icon: Mail, path: "/available-balance", permission: "AVAILABLE BALANCE" },
    ],
  },
  {
    label: "WEALTHPLANS",
    items: [
      { label: "Wealth Plan 1", icon: Mail, path: "/wealth-plan-1", permission: "WEALTH PLANS" },
      { label: "Wealth Plan log 1", icon: Mail, path: "/wealth-plan-log-1", permission: "WEALTH PLANS" },
      { label: "Wealth Plan 2", icon: Mail, path: "/wealth-plan-2", permission: "WEALTH PLANS" },
      { label: "Wealth Plan log 2", icon: Mail, path: "/wealth-plan-log-2", permission: "WEALTH PLANS" },
      { label: "Wealth Plan 3", icon: Mail, path: "/wealth-plan-3", permission: "WEALTH PLANS" },
      { label: "Wealth Plan log 3", icon: Mail, path: "/wealth-plan-log-3", permission: "WEALTH PLANS" },
    ],
  },
  {
    label: "NOTIFICATIONS",
    items: [
      { label: "Announcements", icon: Mail, path: "/announcements", permission: "APP ANNOUNCEMENTS" },
      { label: "Notifications", icon: Mail, path: "/notifications", permission: "NOTIFICATIONS" },
      { label: "zoom-meetings", icon: Mail, path: "/zoommeetings", permission: "ZOOM MEETING" },
      { label: "Blogs", icon: Mail, path: "/blogs", permission: "BLOGS" },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { label: "Support", icon: Mail, path: "/support", permission: "SUPPORT" },
      { label: "Legal", icon: Mail, path: "/legal", permission: "LEGAL UPDATION" },
      { label: "freezed-Groups", icon: Mail, path: "/freezedgroups", permission: "FREEZED GROUPS" },
      { label: "Not-Verified-Users", icon: Mail, path: "/not-verified-users", permission: "NOT VERIFIED USERS" },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { label: "ICO", icon: Mail, path: "/ico", permission: "ICO MANAGEMENT" },
      { label: "Delete Accounts", icon: Star, path: "/delete-accounts", permission: "DELETE ACCOUNTS" },
      { label: "Settings", icon: Settings, path: "/settings", permission: "SETTING" },
    ],
  },
];

// ─── ACCOUNTANT (role === 3) ───
const ACCOUNTANT_SECTIONS = [
  {
    label: "DASHBOARDS",
    items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/" }],
  },
  {
    label: "SETTINGS",
    items: [{ label: "Settings", icon: Settings, path: "/settings" }],
  },
];

// ─── ROLE 4 ───
const ROLE4_SECTIONS = [
  {
    label: "REPORTS",
    items: [
      { label: "CreditReport", icon: "/sidebar/tree.png", path: "/credit-report" },
      { label: "DebitReport", icon: "/sidebar/tree.png", path: "/debit-report" },
      { label: "WithdrawalReport", icon: "/sidebar/tree.png", path: "/withdraw-report" },
      { label: "User Info", icon: "/sidebar/usericon.png", path: "/get-user-details" },
    ],
  },
];

function getSectionsByRole(role, permissions) {
  switch (role) {
    case 0:
      return ADMIN_SECTIONS;
    case 2:
      return ROLE2_SECTIONS
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
      return ROLE4_SECTIONS;
    default:
      return [];
  }
}

// ─── Mobile Header Bar ─────────────────────────────────────
function MobileHeader({ onMenuToggle, userName, role, searchQuery, setSearchQuery }) {
  const [showSearch, setShowSearch] = useState(false);

  const roleLabel =
    role === 0 ? "Admin" : role === 2 ? "Sub Admin" : role === 3 ? "Accountant" : role === 4 ? "Viewer" : "User";

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1b232d] border-b border-[#18222c]/70">
      {/* Main bar */}
      <div className="flex items-center justify-between px-3 h-14">
        {/* Left: hamburger + user info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-600/30 hover:bg-[#252d38] transition-colors"
          >
            <Menu size={18} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#eb660f]/20 flex items-center justify-center text-[#eb660f] font-bold text-xs shrink-0">
              {(userName?.charAt(0) || "A").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate max-w-[120px]">
                {userName || "User"}
              </p>
              <p className="text-[10px] text-gray-500">{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Right: search toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
            showSearch || searchQuery
              ? "bg-[#eb660f]/20 text-[#eb660f]"
              : "border border-gray-600/30 text-gray-400 hover:bg-[#252d38]"
          }`}
        >
          {showSearch ? <X size={16} /> : <Search size={16} />}
        </button>
      </div>

      {/* Search bar (slides down) */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          showSearch ? "max-h-14 border-t border-[#18222c]/50" : "max-h-0"
        }`}
      >
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 bg-[#111418] rounded-lg px-3 py-2 text-sm border border-[#1c2833]">
            <Search size={14} className={searchQuery ? "text-[#eb660f]" : "text-gray-600"} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="bg-transparent outline-none w-full placeholder:text-gray-600 text-white text-xs"
              autoFocus={showSearch}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-500 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
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

// ─── Main Sidebar Export ────────────────────────────────────
export default function Sidebar({ open, setOpen }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const stored = JSON.parse(localStorage.getItem("userData") || "{}");
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

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") setSearchQuery("");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSearchQuery("");
    setMobileOpen(false);
  };

  const handleLogout = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.clear();
        navigate("/login");
        resolve();
      }, 800);
    });
  };

  const roleLabel =
    role === 0 ? "Admin" : role === 2 ? "Sub Admin" : role === 3 ? "Accountant" : role === 4 ? "Viewer" : "User";

  // ─── Sidebar Content (shared between desktop & mobile) ───
  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* Header */}
      <div className="px-4 pt-3 pb-3 border-b border-[#18222c]/70">
        <div className="flex items-center justify-between">
          {(open || isMobile) && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#eb660f]/20 flex items-center justify-center text-[#eb660f] font-bold text-sm shrink-0">
                {(name?.charAt(0) || "A").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold leading-tight truncate">
                  {name || "User"}
                </p>
                <p className="text-[10px] text-gray-500">{roleLabel}</p>
              </div>
            </div>
          )}

          {isMobile ? (
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-600/30 hover:bg-[#252d38] transition-colors shrink-0"
            >
              <X size={18} className="text-gray-400" />
            </button>
          ) : (
            <button
              onClick={() => {
                setOpen(!open);
                if (open) setSearchQuery("");
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-600/30 hover:bg-[#252d38] transition-colors shrink-0"
            >
              {open ? <X size={18} className="text-gray-400" /> : <Menu size={18} className="text-gray-400" />}
            </button>
          )}
        </div>

        {/* Search — desktop expanded or mobile */}
        {(open || isMobile) && (
          <div className="mt-3">
            <div
              className={`flex items-center gap-2 bg-[#111418] rounded-lg px-3 py-2 text-sm border transition-colors duration-200 ${
                searchQuery
                  ? "border-[#eb660f]/50 ring-1 ring-[#eb660f]/20"
                  : "border-[#1c2833]"
              }`}
            >
              <Search
                size={14}
                className={searchQuery ? "text-[#eb660f]" : "text-gray-600"}
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
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              ) : (
                <span className="text-[10px] bg-[#1c2833] px-1.5 py-0.5 rounded text-gray-500 whitespace-nowrap">
                  ⌘K
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2 py-2 sidebar-scroll">
        {/* Search results */}
        {(open || isMobile) && searchQuery.trim() && !hasNoResults && (
          <div className="px-3 mb-2">
            <p className="text-[10px] text-[#eb660f]">
              Found {filteredSections.reduce((acc, s) => acc + s.items.length, 0)} result
              {filteredSections.reduce((acc, s) => acc + s.items.length, 0) !== 1 ? "s" : ""}{" "}
              for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* No results */}
        {hasNoResults && (open || isMobile) && (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="w-12 h-12 rounded-full bg-[#111418] flex items-center justify-center mb-3">
              <Search size={20} className="text-gray-600" />
            </div>
            <p className="text-gray-400 text-xs font-medium mb-1">No results found</p>
            <p className="text-gray-600 text-[10px] text-center">
              No menu items match &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-[10px] text-[#eb660f] hover:text-[#eb660f]/80 transition-colors underline underline-offset-2"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Sections */}
        {filteredSections.map((section) => (
          <div key={section.label}>
            {(open || isMobile) && <SectionLabel>{section.label}</SectionLabel>}
            {section.items.map((item) => (
              <NavItem
                key={item.path + item.label}
                item={item}
                open={open || isMobile}
                activePath={activePath}
                navigate={handleNavigate}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-[#18222c]/70">
        <Logout onLogout={handleLogout} userName={name} userEmail={email} />
      </div>
    </>
  );

  return (
    <>
      {/* ─── Mobile Header Bar ─── */}
      <MobileHeader
        onMenuToggle={() => setMobileOpen(true)}
        userName={name}
        role={role}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* ─── Mobile Overlay ─── */}
      <MobileOverlay show={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* ─── Mobile Drawer ─── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-72 bg-[#1b232d] flex flex-col
          transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <SidebarContent isMobile />
      </aside>

      {/* ─── Desktop Sidebar ─── */}
      <aside
        className={`hidden lg:flex h-screen flex-col bg-[#1b232d] text-gray-400
          border-r border-[#18222c]/80 transition-all duration-300
          ${open ? "w-72" : "w-20"}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}

// ─── Section Label ──────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] tracking-widest text-gray-500/70 px-3 mb-2 mt-3 font-semibold uppercase">
      {children}
    </p>
  );
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
          <span key={i} className="text-white font-semibold">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// ─── Nav Item ───────────────────────────────────────────────
function NavItem({ item, open, activePath, navigate, searchQuery = "" }) {
  const Icon = item.icon;
  const active = activePath === item.path;

  const renderIcon = (size = 18) => {
    if (typeof Icon === "string") {
      return <img src={Icon} alt={item.label} className="w-[18px] h-[18px] object-contain" />;
    }
    return <Icon size={size} strokeWidth={2.2} />;
  };

  // Collapsed (icon only)
  if (!open) {
    return (
      <button
        onClick={() => navigate(item.path)}
        className="w-full flex justify-center mb-2 group"
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
            active
              ? "bg-[#eb660f] text-white shadow-lg shadow-[#eb660f]/20"
              : "text-gray-500 group-hover:bg-[#252d38] group-hover:text-white"
          }`}
        >
          {renderIcon(20)}
        </div>
      </button>
    );
  }

  // Expanded
  return (
    <button
      onClick={() => navigate(item.path)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-xs transition-all duration-200 ${
        active
          ? "bg-[#eb660f] text-white font-semibold shadow-sm"
          : "hover:bg-[#252d38] text-gray-400 hover:text-white"
      }`}
    >
      {renderIcon(18)}
      <span className="flex-1 text-left truncate">
        <HighlightText text={item.label} query={searchQuery} />
      </span>
    </button>
  );
}