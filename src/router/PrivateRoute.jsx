// import { Navigate, Outlet } from "react-router-dom";
// import Cookies from "js-cookie";

// const PrivateRoute = () => {
//   const token = Cookies.get("adminToken"); // admin token

//   // If admin not logged in, block private pages
//   return !token ? <Navigate to="/login" replace /> : <Outlet />;
// };

// export default PrivateRoute;


import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Cookies from "js-cookie";

const PrivateRoute = () => {
  const navigate = useNavigate();

  // Clear all auth cookies helper
  const clearAuthCookies = () => {
    Cookies.remove("adminToken");
    Cookies.remove("adminUserData");
    Cookies.remove("adminUsername");
    Cookies.remove("UserRoles");
  };

  // Validate session
  const validateSession = () => {
    const token = Cookies.get("adminToken");
    const userData = Cookies.get("adminUserData");

    // Check if both exist
    if (!token || !userData) {
      return false;
    }

    // Validate userData can be parsed
    try {
      const parsedData = JSON.parse(userData);

      // Check required fields
      if (!parsedData?.data?.username || !parsedData?.data?.token) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Invalid session data:", error);
      return false;
    }
  };

  // Session monitoring effect
  useEffect(() => {
    const checkSession = () => {
      if (!validateSession()) {
        clearAuthCookies();
        navigate("/login", { replace: true });
      }
    };

    // Check immediately
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    // Check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  // Initial validation
  const isValid = validateSession();

  if (!isValid) {
    clearAuthCookies();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;