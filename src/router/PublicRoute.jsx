import { Navigate, Outlet } from "react-router-dom";


const PublicRoute = ({children}) => {
    const token = localStorage.getItem("token");
    if (token) {
        return <Navigate to="/" />;
    } else {
        return <Outlet />;
    }
    return children;
};
export default PublicRoute;
