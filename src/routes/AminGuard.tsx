import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  if (user?.user !== "Ilir") {
    return <Navigate to="/settings" replace />;
  }

  return children;
};
