// import { useState } from "react";
// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import Sidebar from "./Sidebar";

// export default function AppLayout() {
//   const [open, setOpen] = useState(true);
//   const location = useLocation();
//   const navigate = useNavigate();

//   return (
//     <div className="flex bg-[#0a1016] min-h-screen">
//       {/* Sidebar */}
//       <Sidebar
//         open={open}
//         setOpen={setOpen}
//         activePath={location.pathname}
//         navigate={navigate}
//       />

//       {/* Right Content Area */}
//       <main className="flex-1 p-2 overflow-auto">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000]">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activePath={location.pathname}
        navigate={navigate}
      />

      {/* Main Content */}
      <main
        className={`
          flex-1 overflow-y-auto
          transition-all duration-300
          bg-[#000000]
        `}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}