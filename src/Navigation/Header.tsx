import { NavLink, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };
  return (
    <header className="w-full bg-white px-6 py-4 flex items-center justify-between border-b-1">
      <NavLink
        to={".."}
        onClick={(e) => {
          e.preventDefault();
          navigate(-1);
        }}
        className="text-xl font-semibold"
      >
        Kthehu
      </NavLink>
      <h1 className="text-xl font-semibold">{userInfo.user}</h1>
      <button
        onClick={handleLogout}
        className="bg-blue-600 text-white cursor-pointer font-medium px-4 py-2 rounded hover:bg-blue-800"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
