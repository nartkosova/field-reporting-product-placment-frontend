import { NavLink } from "react-router-dom";
import { StoreDropdown } from "../../components/StoreDropdown/StoreDropdown";
import { userInfo } from "../../utils/parseLocalStorage";
import { userNavItems, adminNavItems } from "./HomePageFields";
import { useSelectedStore } from "../../hooks/useSelectStore";

interface NavButtonProps {
  to: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  to,
  children,
  disabled = false,
}) => (
  <NavLink to={to}>
    <button
      disabled={disabled}
      className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  </NavLink>
);

const HomePage: React.FC = () => {
  const userRole = userInfo?.role;
  const isAdmin = userRole === "admin";
  const selectedStore = useSelectedStore();
  return (
    <div className="flex flex-col justify-center align-middle p-6 max-w-xl space-y-4 mx-auto">
      <h1 className="text-3xl font-bold">Zgjedhe nje aktivitet</h1>

      {!isAdmin && (
        <>
          <StoreDropdown />
          {userNavItems(selectedStore).map((item) => (
            <NavButton key={item.to} to={item.to} disabled={item.disabled}>
              {item.label}
            </NavButton>
          ))}
        </>
      )}

      {isAdmin && (
        <>
          {adminNavItems.map((item) => (
            <NavButton key={item.to} to={item.to}>
              {item.label}
            </NavButton>
          ))}
        </>
      )}
    </div>
  );
};

export default HomePage;
