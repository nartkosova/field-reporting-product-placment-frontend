import { StoreDropdown } from "../../components/StoreDropdown/StoreDropdown";
import { userNavItems, adminNavItems } from "./HomePageFields";
import { useSelectedStore } from "../../hooks/useSelectStore";
import { NavButton } from "../../components/NavButton/NavButton";

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const HomePage: React.FC = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userRole = userInfo?.role;
  const isAdmin = userRole === "admin";
  const selectedStore = useSelectedStore();
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-3xl flex flex-col items-center justify-center flex-1 py-8 px-2 sm:px-6">
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight text-center drop-shadow">
          Zgjidh një aktivitet
        </h1>
        <p className="text-gray-400 text-base mb-8 text-center max-w-md">
          {isAdmin
            ? "Shikoni raportet dhe menaxhoni përdoruesit, marketet, produktet dhe konkurrencën."
            : "Zgjidhni një market dhe vazhdoni me aktivitetet e tij."}
        </p>
        {/* User Info Section */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-6 w-full max-w-md shadow-lg">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-white font-extrabold text-2xl border border-neutral-700">
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
            <div className="w-full max-w-xs mb-8">
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
