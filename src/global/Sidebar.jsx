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
  { label: "Overview", icon: LayoutDashboard, path: "/" },
  { label: "eCommerce", icon: ShoppingCart, path: "/ecommerce" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Customers", icon: Users, path: "/customers" },
];

const SETTINGS_ITEMS = [
  { label: "Messages", icon: Mail, path: "/messages" },
  { label: "Customer Reviews", icon: Star, path: "/reviews" },
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Help Centre", icon: HelpCircle, path: "/help" },
];

export default function Sidebar({ open, setOpen, activePath, navigate }) {
  return (
    <aside
      className={`
        h-screen flex flex-col
        bg-gradient-to-b from-[#0b1117] to-[#070c12]
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
            onClick={() => setOpen(!open)}
            className="
              w-11 h-11 flex items-center justify-center
              rounded-[4px] border border-gray-500/30
              hover:bg-[#161616]
              hover:border-gray-400/40
              transition-all
            "
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Search */}
        {open && (
          <div className="mt-4 flex items-center gap-2 bg-[#161616]/80 rounded-[4px] px-3 py-2.5 text-sm border border-[#1c2833]">
            <Search size={16} className="text-gray-500" />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none w-full placeholder:text-gray-500"
            />
            <span className="text-[11px] bg-[#1c2833] px-2 py-0.5 rounded-md text-gray-400">
              ⌘K
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {open && <SectionLabel>DASHBOARDS</SectionLabel>}
        {DASHBOARD_ITEMS.map((item) => (
          <NavItem key={item.path} {...{ item, open, activePath, navigate }} />
        ))}

        {open && <SectionLabel>SETTINGS</SectionLabel>}
        {SETTINGS_ITEMS.map((item) => (
          <NavItem key={item.path} {...{ item, open, activePath, navigate }} />
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

function NavItem({ item, open, activePath, navigate }) {
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
                ? "bg-lime-400 text-black shadow-lg shadow-lime-400/20"
                : "text-gray-500 group-hover:bg-[#161616] group-hover:text-white"
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
            ? "bg-lime-400 text-black font-semibold shadow-sm"
            : "hover:bg-[#161616] text-gray-400 hover:text-white"
        }
      `}
    >
      <Icon size={20} strokeWidth={2.2} />
      <span className="flex-1 text-left">{item.label}</span>
    </button>
  );
}
