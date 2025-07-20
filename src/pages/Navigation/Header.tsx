import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../components/Buttons/ActionButtons";
import { getInitials } from "../../utils/utils";
import { useUser } from "../../hooks/useUser";
import { useState } from "react";
import { syncAllIfNeeded } from "../../db/db";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Header: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const synced = await syncAllIfNeeded();
      if (synced) {
        alert("Të gjitha të dhënat u sinkronizuan me sukses.");
      } else {
        alert("Nuk ka të dhëna për të sinkronizuar.");
      }
    } catch (err) {
      console.error("Sync error:", err);
      alert("Ndodhi një gabim gjatë sinkronizimit.");
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
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
          <ActionButton variant="secondary" onClick={handleBack}>
            &#8592; Kthehu
          </ActionButton>
        </div>
        <div className="flex items-center space-x-3">
          <ActionButton
            onClick={handleSync}
            variant="secondary"
            disabled={syncing}
            className="text-md font-semibold px-3 py-1.5 rounded-md shadow-md flex items-center gap-2"
          >
            {syncing && (
              <LoadingSpinner size="sm" text="" className="!h-auto" />
            )}
            <span>{syncing ? "Duke ruajtur..." : "Dërgo"}</span>
          </ActionButton>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 flex items-center justify-center text-gray-100 font-semibold text-sm border border-neutral-600 shadow-inner">
            {getInitials(user?.user || "")}
          </div>
          <span className="hidden sm:block text-md font-medium text-gray-200 truncate max-w-[120px]">
            {user?.user || "User"}
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
