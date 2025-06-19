import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface RouteGuardProps {
  requiredRole?: "admin" | "employee";
}

const RouteGuard = ({ requiredRole }: RouteGuardProps) => {
  const { isAuthenticated, userRole } = useAuth();

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "admin" && userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
