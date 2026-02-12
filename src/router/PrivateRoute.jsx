import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({children}) => {
    const token = localStorage.getItem("token");
    if(!token) {
        return <Navigate to="/login" />;
    } else {
        return <Outlet />
    }
    return children
};

export default PrivateRoute;