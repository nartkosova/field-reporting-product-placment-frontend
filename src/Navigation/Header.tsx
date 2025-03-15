import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };
  return (
    <header className="w-full bg-white px-6 py-4 flex items-center justify-between border-b-1">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-gray-100"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
