// // import { useState } from "react";
// // import { Outlet, useLocation, useNavigate } from "react-router-dom";
// // import Sidebar from "./Sidebar";

// // export default function AppLayout() {
// //   const [sidebarOpen, setSidebarOpen] = useState(true);
// //   const location = useLocation();
// //   const navigate = useNavigate();

// //   return (
// //     <div className="flex h-screen overflow-hidden bg-[#000000]">
// //       <Sidebar
// //         open={sidebarOpen}
// //         setOpen={setSidebarOpen}
// //         activePath={location.pathname}
// //         navigate={navigate}
// //       />
// //       <main className="flex-1 overflow-y-auto transition-all duration-300 bg-[#000000]">
// //         <div className="pt-12 lg:pt-0">
// //           <div className="p-2 sm:p-4">
// //             <Outlet />
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }


// import { useState, useMemo } from "react";
// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import Sidebar from "./Sidebar";
// import { Menu } from "lucide-react";

// export default function AppLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const pageTitle = useMemo(() => {
//     const path = location.pathname;
//     if (path === "/" || path === "/dashboard") return "Dashboard";
//     const rawString = path.substring(1);
//     const segments = rawString.split('/');
//     const lastSegment = segments[segments.length - 1];
//     const withSpaces = lastSegment.replace(/[-_]/g, " ");
//     return withSpaces
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");
//   }, [location.pathname]);

//   return (
//     <div className="flex h-screen overflow-hidden bg-[#000000] sidebar-scroll">
//       <Sidebar
//         open={sidebarOpen}
//         setOpen={setSidebarOpen}
//         activePath={location.pathname}
//         navigate={navigate}
//       />
      
//       <main className="flex-1 overflow-y-auto transition-all duration-300 bg-[#000000] flex flex-col sidebar-scroll">
//         {/* Top Header Section */}
//         <header className="sticky top-0 z-20 bg-[#000000]/80 backdrop-blur-md border-b border-[#2a2c2f] px-6 py-4 flex items-center justify-between">
//             {/* Mobile Sidebar Toggle (Optional - usually needed if sidebar hides on mobile) */}
//             <div className="flex items-center gap-4">
//                 <button 
//                   onClick={() => setSidebarOpen(!sidebarOpen)}
//                   className="lg:hidden text-white hover:text-[#b9fd5c] transition-colors"
//                 >
//                   <Menu size={24} />
//                 </button>
                
//                 {/* THE REQUESTED TITLE */}
//                 <h1 className="text-2xl text-[#b9fd5c]  font-semibold tracking-wide">
//                     {pageTitle}
//                 </h1>
//             </div>
//         </header>

//         {/* Page Content */}
//         <div className="flex-1">
//           <div className="p-2 sm:p-1 sidebar-scroll">
//             <Outlet />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }



import { useState, useMemo, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Cookies from "js-cookie";
import { Menu, LogOut, X } from "lucide-react";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get user data
  const stored = useMemo(
    () => JSON.parse(Cookies.get("adminUserData") || "{}"),
    []
  );
  const userData = stored?.data || stored;
  const { name = "User", email = "" } = userData || {};

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    const rawString = path.substring(1);
    const segments = rawString.split("/");
    const lastSegment = segments[segments.length - 1];
    const withSpaces = lastSegment.replace(/[-_]/g, " ");
    return withSpaces
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      // Remove ALL auth-related cookies
      Cookies.remove("adminToken");
      Cookies.remove("adminUserData");
      Cookies.remove("adminUsername");
      Cookies.remove("permissions");
      Cookies.remove("UserRoles");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  }, [navigate]);

  const openLogoutModal = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    if (!isLoggingOut) {
      setShowLogoutModal(false);
    }
  }, [isLoggingOut]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000] sidebar-scroll">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activePath={location.pathname}
        navigate={navigate}
        onLogoutClick={openLogoutModal}
      />

      <main className="flex-1 overflow-y-auto transition-all duration-300 bg-[#000000] flex flex-col sidebar-scroll">
        {/* Top Header Section */}
        <header className="sticky top-0 z-20 bg-[#000000]/80 backdrop-blur-md border-b border-[#2a2c2f] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:text-[#b9fd5c] transition-colors"
            >
              <Menu size={24} />
            </button>

            <h1 className="text-2xl text-[#b9fd5c] font-semibold serialHeading">
              {pageTitle}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          <div className="p-2 sm:p-1 sidebar-scroll">
            <Outlet />
          </div>
        </div>
      </main>

      {/* ─── Logout Modal Overlay ─── */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={closeLogoutModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-sm bg-[#1a1d21] border border-[#2a2c2f]
                        rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl 
                        animate-slideUp sm:animate-fadeIn
                        max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle - Mobile only */}
            <div className="flex sm:hidden justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-500/50 rounded-full" />
            </div>

            {/* Top Accent Line - Desktop only */}
            <div className="hidden sm:block h-1 bg-gradient-to-r from-red-500 via-red-400 to-orange-500" />

            {/* Close Button */}
            <button
              onClick={closeLogoutModal}
              disabled={isLoggingOut}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 
                         flex items-center justify-center rounded-full
                         bg-[#111214] text-gray-400 hover:text-white 
                         transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Icon & Title */}
            <div className="flex flex-col items-center pt-6 sm:pt-8 pb-3 sm:pb-4 px-4 sm:px-6">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/10 
                            flex items-center justify-center mb-3 sm:mb-4"
              >
                <LogOut size={28} className="text-red-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-white text-base sm:text-lg font-semibold mb-1">
                Confirm Logout
              </h2>
              <p className="text-[#8a8d93] text-xs sm:text-sm text-center">
                Are you sure you want to log out?
              </p>
            </div>

            {/* User Info */}
            {(name || email) && (
              <div className="mx-4 sm:mx-6 mb-3 sm:mb-4 p-3 bg-[#111214] border border-[#2a2c2f] rounded-xl">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full bg-[#b9fd5c]/10 
                                flex items-center justify-center text-[#b9fd5c] 
                                font-semibold text-sm shrink-0"
                  >
                    {(name?.charAt(0) || "U").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">
                      {name}
                    </p>
                    {email && (
                      <p className="text-[#8a8d93] text-xs truncate">{email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="mx-4 sm:mx-6 mb-4 sm:mb-6 flex items-start gap-2.5 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
              <div className="shrink-0 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-yellow-400/80 text-[11px] sm:text-xs leading-relaxed">
                You will be signed out of your account and redirected to the
                login page.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="px-4 sm:px-6 pb-6 flex flex-col-reverse sm:flex-row items-center gap-3">
              <button
                onClick={closeLogoutModal}
                disabled={isLoggingOut}
                className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 rounded-xl text-sm font-medium
                           bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                           hover:text-white hover:border-[#3a3c3f]
                           transition-colors cursor-pointer disabled:opacity-50
                           disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5
                           rounded-xl text-sm font-semibold bg-red-500 text-white
                           hover:bg-red-600 transition-all duration-200 cursor-pointer
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <svg
                      className="animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}