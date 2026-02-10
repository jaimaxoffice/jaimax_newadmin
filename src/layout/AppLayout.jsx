import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../global/Sidebar";

export default function AppLayout() {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex bg-[#0a1016] min-h-screen">
      {/* Sidebar */}
      <Sidebar
        open={open}
        setOpen={setOpen}
        activePath={location.pathname}
        navigate={navigate}
      />

      {/* Right Content Area */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
