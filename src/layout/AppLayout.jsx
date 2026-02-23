// import { useState } from "react";
// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import Sidebar from "./Sidebar";

// export default function AppLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const location = useLocation();
//   const navigate = useNavigate();

//   return (
//     <div className="flex h-screen overflow-hidden bg-[#000000]">
//       <Sidebar
//         open={sidebarOpen}
//         setOpen={setSidebarOpen}
//         activePath={location.pathname}
//         navigate={navigate}
//       />
//       <main className="flex-1 overflow-y-auto transition-all duration-300 bg-[#000000]">
//         <div className="pt-12 lg:pt-0">
//           <div className="p-2 sm:p-4">
//             <Outlet />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


import { useState, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    const rawString = path.substring(1);
    const segments = rawString.split('/');
    const lastSegment = segments[segments.length - 1];
    const withSpaces = lastSegment.replace(/[-_]/g, " ");
    return withSpaces
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000]">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activePath={location.pathname}
        navigate={navigate}
      />
      
      <main className="flex-1 overflow-y-auto transition-all duration-300 bg-[#000000] flex flex-col">
        {/* Top Header Section */}
        <header className="sticky top-0 z-20 bg-[#000000]/80 backdrop-blur-md border-b border-[#2a2c2f] px-6 py-4 flex items-center justify-between">
            {/* Mobile Sidebar Toggle (Optional - usually needed if sidebar hides on mobile) */}
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden text-white hover:text-[#b9fd5c] transition-colors"
                >
                  <Menu size={24} />
                </button>
                
                {/* THE REQUESTED TITLE */}
                <h1 className="text-3xl text-[#b9fd5c] serialHeading font-bold tracking-wide">
                    {pageTitle}
                </h1>
            </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}