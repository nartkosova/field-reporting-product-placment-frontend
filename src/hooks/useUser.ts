import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface UserInfo {
  user_id: number;
  user: string;
  role: string;
}

interface DecodedToken {
  user_id: number;
  user: string;
  role: string;
}

function getUserFromToken(token: string | null): UserInfo | null {
  if (!token) return null;
  try {
    const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
    return {
      user_id: decoded.user_id,
      user: decoded.user,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export const useUser = () => {
  const [user, setUser] = useState<UserInfo | null>(() => {
    const token = localStorage.getItem("authToken");
    return getUserFromToken(token);
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("authToken");
      setUser(getUserFromToken(token));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    userId: user?.user_id,
    userName: user?.user,
    userRole: user?.role,
  };
};
