import { useEffect, useState } from "react";
import { UserRole } from "../types/common";

interface UserInfo {
  id: number;
  user: string;
  name?: string;
  role: UserRole;
}

export const useUser = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem("userInfo");
        setUserInfo(stored ? JSON.parse(stored) : null);
      } catch {
        setUserInfo(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateUser = (user: UserInfo) => {
    localStorage.setItem("userInfo", JSON.stringify(user));
    setUserInfo(user);
  };

  const clearUser = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
  };

  return {
    user: userInfo,
    updateUser,
    clearUser,
    isAuthenticated: !!userInfo,
    userId: userInfo?.id,
    userName: userInfo?.user || userInfo?.name,
    userRole: userInfo?.role,
  };
}; 