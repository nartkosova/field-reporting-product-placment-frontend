import { useState, useEffect } from "react";
import { setToken } from "../services/authService";

interface AuthState {
  isAuthenticated: boolean | null;
  userRole: string | null;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: null,
    userRole: null,
  });

  useEffect(() => {
    const loggedUserJSON = localStorage.getItem("authToken");
    const userInfoJSON = localStorage.getItem("userInfo");

    if (loggedUserJSON && userInfoJSON) {
      const parsedUser = JSON.parse(userInfoJSON);
      if (parsedUser?.id || parsedUser?.role) {
        setAuthState({
          isAuthenticated: true,
          userRole: parsedUser.role,
        });
        setToken(loggedUserJSON);
        return;
      }
    }

    setAuthState({
      isAuthenticated: false,
      userRole: null,
    });
    setToken("");
  }, []);

  return authState;
}; 