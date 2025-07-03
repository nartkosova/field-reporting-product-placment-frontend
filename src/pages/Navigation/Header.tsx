import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../components/Buttons/ActionButtons";
import { getInitials } from "../../utils/utils";
import { useUser } from "../../hooks/useUser";

const Header: React.FC = () => {
  const { user, clearUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    clearUser();
    localStorage.removeItem("selectedCategory");
    localStorage.removeItem("selectedStore");
    navigate("/login");
  };

  const location = useLocation();

  const handleBack = () => {
    const isFreshLoad = location.key === "default";
    const shortHistory = window.history.length <= 2;

    if (isFreshLoad || shortHistory) {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-black/95 backdrop-blur border-b border-neutral-800 shadow-sm px-4">
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
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 flex items-center justify-center text-gray-100 font-semibold text-sm border border-neutral-600 shadow-inner">
            {getInitials(user?.user || user?.name || "")}
          </div>
          <span className="hidden sm:block text-md font-medium text-gray-200 truncate max-w-[120px]">
            {user?.user || user?.name || "User"}
          </span>
          <ActionButton
            onClick={handleLogout}
            variant="danger"
            className="text-md font-semibold px-3 py-1.5 rounded-md shadow-md"
          >
            Dilni
          </ActionButton>
        </div>
      </div>
    </header>
  );
};

export default Header;
