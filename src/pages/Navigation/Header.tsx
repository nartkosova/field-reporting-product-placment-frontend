import React from "react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/Buttons/ActionButtons";

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Header: React.FC = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}") || {};
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("selectedCategory");
    navigate("/login");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-black/95 backdrop-blur border-b border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-neutral-900 text-gray-100 px-4 py-2 rounded-lg font-semibold shadow cursor-pointer hover:bg-neutral-800 focus:outline-none border border-neutral-800"
          >
            <span className="text-xl">&#8592;</span>
            <span>Kthehu</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-gray-100 font-bold text-lg border border-neutral-700">
              {getInitials(userInfo.user || userInfo.name || "")}
            </div>
            <span className="hidden sm:block text-base font-medium text-gray-100">
              {userInfo.user || userInfo.name || "User"}
            </span>
          </div>
          <ActionButton
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-none"
          >
            Logout
          </ActionButton>
        </div>
      </div>
    </header>
  );
};

export default Header;
