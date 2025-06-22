import { StoreDropdown } from "../../components/StoreDropdown/StoreDropdown";
import { userNavItems, adminNavItems } from "./HomePageFields";
import { useSelectedStore } from "../../hooks/useSelectStore";
import { NavButton } from "../../components/NavButton/NavButton";

const HomePage: React.FC = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
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
