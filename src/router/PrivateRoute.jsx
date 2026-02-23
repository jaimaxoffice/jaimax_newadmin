import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoute = () => {
  const token = Cookies.get("adminToken"); // admin token

  // If admin not logged in, block private pages
  return !token ? <Navigate to="/login" replace /> : <Outlet />;
};

export default PrivateRoute;