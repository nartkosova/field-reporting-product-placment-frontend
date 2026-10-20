import { useEffect, useState } from "react";
import { getSessionUser, SessionUser } from "../services/authService";

export const useUser = () => {
  const [user, setUser] = useState<SessionUser | null>(getSessionUser);

  useEffect(() => {
    const refreshUserFromToken = () => setUser(getSessionUser());

    window.addEventListener("storage", refreshUserFromToken);
    window.addEventListener("authTokenChanged", refreshUserFromToken);

    return () => {
      window.removeEventListener("storage", refreshUserFromToken);
      window.removeEventListener("authTokenChanged", refreshUserFromToken);
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    userId: user?.user_id,
    userName: user?.user,
    userRole: user?.role,
  };
};
