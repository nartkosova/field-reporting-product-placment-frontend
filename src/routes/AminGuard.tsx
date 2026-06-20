import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { userRole } = useUser();

  if (userRole !== "admin") {
    return <Navigate to="/settings" replace />;
  }

  return children;
};
