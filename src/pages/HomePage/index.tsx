import { StoreDropdown } from "../../components/StoreDropdown/StoreDropdown";
import { userNavItems, adminNavItems } from "./HomePageFields";
import { useSelectedStore } from "../../hooks/useSelectStore";
import { NavButton } from "../../components/NavButton/NavButton";
import { getInitials } from "../../utils/utils";
import React from "react";

const HomePage: React.FC = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userRole = userInfo?.role;
  const isAdmin = userRole === "admin";
  const selectedStore = useSelectedStore();
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-transparent">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center py-12 bg-transparent">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight text-center drop-shadow-lg">
          Zgjidh një aktivitet
        </h1>

        <div className="max-w-2xl h-[1px] w-full bg-neutral-700 rounded-full mb-4"></div>

        <p className="text-gray-400 text-base text-center max-w-md mb-10">
          {isAdmin
            ? "Shikoni raportet dhe menaxhoni përdoruesit, marketet, produktet dhe konkurrencën."
            : "Zgjidhni një market dhe vazhdoni me aktivitetet e tij."}
        </p>

        <div className="w-full flex justify-center mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl px-6 py-6 w-full max-w-md shadow-xl backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 flex items-center justify-center text-gray-100 font-semibold text-xl border border-neutral-600 shadow-inner">
              {getInitials(userInfo.user || userInfo.name || "")}
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-xl font-bold text-white">
                {userInfo.user || userInfo.name || "User"}
              </span>
              <span className="text-sm text-gray-400 mt-1 capitalize">
                {userRole || "user"}
              </span>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <>
            <div className="w-full max-w-md mb-10">
              <StoreDropdown />
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
              {userNavItems(selectedStore).map((item) => (
                <NavButton
                  key={item.to}
                  to={item.to}
                  disabled={item.disabled}
                  variant="card"
                >
                  {item.label}
                </NavButton>
              ))}
            </div>
          </>
        )}

        {isAdmin && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
            {adminNavItems.map((item) => (
              <NavButton key={item.to} to={item.to} variant="card">
                {item.label}
              </NavButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
