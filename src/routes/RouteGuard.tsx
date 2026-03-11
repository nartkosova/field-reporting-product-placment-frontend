import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../hooks/useUser";

interface RouteGuardProps {
  allowedRoles?: Array<"admin" | "employee" | "viewer">;
}

const RouteGuard = ({ allowedRoles }: RouteGuardProps) => {
  const { isAuthenticated, userRole } = useUser();

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(userRole as "admin" | "employee" | "viewer")
  ) {
    return <Navigate to="/reports" replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
