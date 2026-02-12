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


import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Users,
  Mail,
  Star,
  Settings,
  HelpCircle,
  Search,
  Menu,
  X,
} from "lucide-react";

const DASHBOARD_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Wallet", icon: ShoppingCart, path: "/wallet" },
  { label: "Users", icon: BarChart3, path: "/users" },
  { label: "Kyc", icon: Users, path: "/kyc" },
  { label: "Withdrawal", icon: Users, path: "/withdrawal" },
];

const SETTINGS_ITEMS = [
  { label: "ICO", icon: Mail, path: "/ico" },
  { label: "Customer Reviews", icon: Star, path: "/reviews" },
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Help Centre", icon: HelpCircle, path: "/help" },
];

const WEALTH_PLANS = [
  { label: "Wealth Plan 1", icon: Mail, path: "/wealth-plan-1" },
  { label: "Wealth Plan 2", icon: Mail, path: "/wealth-plan-2" },
  { label: "Wealth Plan 3", icon: Mail, path: "/wealth-plan-3" },
];

const USERS_LIST = [
  { label: "user-info", icon: Users, path: "/user-info" },
  { label: "Admin-User", icon: Users, path: "/admin-user" },
  { label: "User 3", icon: Users, path: "/user-3" },
];

const TRANSACTIONS = [
  { label: "All Transactions", icon: Mail, path: "/all-transactions" },
  { label: "PG Transactions", icon: Mail, path: "/pg-transactions" },
];

const MANUALS = [
  { label: "ManualKYC", icon: Mail, path: "/manual-kyc" },
  { label: "ManualAccounts", icon: Mail, path: "/manual-accounts" },
];

const REPORTS = [
  { label: "Team-Reports", icon: Mail, path: "/team-reports" },
  { label: "Team-Investments", icon: Mail, path: "/team-investments" },
];
const NOTIFICATIONS = [
  { label: "Announcements", icon: Mail, path: "/announcements" },
  { label: "Notifications", icon: Mail, path: "/notifications" },
  { label: "zoom-meetings", icon: Mail, path: "/zoommeetings" },
];

// All sections defined in one place for easy management
const ALL_SECTIONS = [
  { label: "DASHBOARDS", items: DASHBOARD_ITEMS },
  { label: "USERS", items: USERS_LIST },
  { label: "TRANSACTIONS", items: TRANSACTIONS },
  { label: "MANUALS", items: MANUALS },
  { label: "REPORTS", items: REPORTS },
  { label: "WEALTHPLANS", items: WEALTH_PLANS },
  { label: "NOTIFICATIONS", items: NOTIFICATIONS },
  { label: "SETTINGS", items: SETTINGS_ITEMS },
];

export default function Sidebar({ open, setOpen, activePath, navigate }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_SECTIONS;
    }

    const query = searchQuery.toLowerCase().trim();

    return ALL_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.path.toLowerCase().includes(query)
      ),
    })).filter((section) => section.items.length > 0);
  }, [searchQuery]);

  // Check if search has no results
  const hasNoResults = searchQuery.trim() && filteredSections.length === 0;

  // Handle keyboard shortcut for search
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setSearchQuery("");
    }
  };

  return (
    <aside
      className={`
        h-screen flex flex-col
        bg-gradient-to-b from-[#1b232d] to-[#1b232d]
        text-gray-400 border-r border-[#18222c]/80
        transition-all duration-300
        ${open ? "w-72" : "w-20"}
      `}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#18222c]/70">
        <div className="flex items-center justify-between">
          {open && (
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/40"
                className="w-10 h-10 rounded-full ring-2 ring-lime-400/30"
                alt="User avatar"
              />
              <div>
                <p className="text-white text-sm font-semibold leading-tight">
                  Guy Hawkins
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setOpen(!open);
              // Clear search when collapsing
              if (open) setSearchQuery("");
            }}
            className="
              w-11 h-11 flex items-center justify-center
              rounded-[4px] border border-gray-500/30
              hover:bg-[#1b232d]
              hover:border-gray-400/40
              transition-all
            "
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Search */}
        {open && (
          <div className="mt-4 relative">
            <div
              className={`
                flex items-center gap-2 bg-[#1b232d]/80 rounded-[4px] 
                px-3 py-2.5 text-sm border transition-colors duration-200
                ${
                  searchQuery
                    ? "border-[#eb660f]/50 ring-1 ring-[#eb660f]/20"
                    : "border-[#1c2833]"
                }
              `}
            >
              <Search
                size={16}
                className={`transition-colors duration-200 ${
                  searchQuery ? "text-[#eb660f]" : "text-gray-500"
                }`}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search menu..."
                className="bg-transparent outline-none w-full placeholder:text-gray-500 text-white"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="text-[11px] bg-[#1c2833] px-2 py-0.5 rounded-md text-gray-400 whitespace-nowrap">
                  ⌘K
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sidebar-scroll">
        {/* Search results info */}
        {open && searchQuery.trim() && !hasNoResults && (
          <div className="px-3 mb-3">
            <p className="text-[11px] text-[#eb660f]">
              Found{" "}
              {filteredSections.reduce((acc, s) => acc + s.items.length, 0)}{" "}
              result
              {filteredSections.reduce((acc, s) => acc + s.items.length, 0) !== 1
                ? "s"
                : ""}{" "}
              for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* No results state */}
        {hasNoResults && open && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-[#1b232d] flex items-center justify-center mb-4">
              <Search size={24} className="text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">
              No results found
            </p>
            <p className="text-gray-600 text-xs text-center">
              No menu items match &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-xs text-[#eb660f] hover:text-[#eb660f]/80 
                         transition-colors underline underline-offset-2"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Render filtered sections */}
        {filteredSections.map((section) => (
          <div key={section.label}>
            {open && <SectionLabel>{section.label}</SectionLabel>}
            {section.items.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                open={open}
                activePath={activePath}
                navigate={(path) => {
                  navigate(path);
                  setSearchQuery(""); // Clear search after navigation
                }}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] tracking-widest text-gray-500/80 px-3 mb-3 mt-5 font-semibold">
      {children}
    </p>
  );
}

// Highlight matching text in search results
function HighlightText({ text, query }) {
  if (!query.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-[#eb660f] font-semibold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function NavItem({ item, open, activePath, navigate, searchQuery = "" }) {
  const Icon = item.icon;
  const active = activePath === item.path;

  // Collapsed icon rail mode
  if (!open) {
    return (
      <button
        onClick={() => navigate(item.path)}
        className="w-full flex justify-center mb-3 group"
      >
        <div
          className={`
            w-12 h-12 rounded-[4px] flex items-center justify-center
            transition-all duration-200
            ${
              active
                ? "bg-[#eb660f] text-black shadow-lg shadow-lime-400/20"
                : "text-gray-500 group-hover:bg-[#1b232d] group-hover:text-white"
            }
          `}
        >
          <Icon size={22} strokeWidth={2.2} />
        </div>
      </button>
    );
  }

  // Expanded mode
  return (
    <button
      onClick={() => navigate(item.path)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-[4px] mb-1.5
        text-sm transition-all duration-200
        ${
          active
            ? "bg-[#eb660f] text-white font-semibold shadow-sm"
            : "hover:bg-[#1b232d] text-gray-400 hover:text-white"
        }
      `}
    >
      <Icon size={20} strokeWidth={2.2} />
      <span className="flex-1 text-left">
        <HighlightText text={item.label} query={searchQuery} />
      </span>
    </button>
  );
}