import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const PublicRoute = () => {
  const token = Cookies.get("adminToken"); // user token

  // If user is already logged in, block public pages (login/register)
  return token ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;