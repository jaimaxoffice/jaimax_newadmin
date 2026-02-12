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
// src/Layout/AppLayout.jsx
import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#121411]">
      {/* Sidebar */}
      <Sidebar
        open={open}
        setOpen={setOpen}
        activePath={location.pathname}
        navigate={navigate}
      />

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen overflow-y-auto overflow-x-hidden
          transition-all duration-300 main-scroll
          ${open ? "lg:ml-0" : "lg:ml-0"}`}
      >


        {/* Page Content */}
        <div className="p-2 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}