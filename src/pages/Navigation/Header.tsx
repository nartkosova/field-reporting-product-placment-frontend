import { NavLink, useNavigate } from "react-router-dom";
import ActionButton from "../../components/Buttons/ActionButtons";

const Header = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("selectedCategory");
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
      <ActionButton onClick={handleLogout}>Logout</ActionButton>
    </header>
  );
};

export default Header;
