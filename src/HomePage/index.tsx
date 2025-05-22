import { NavLink } from "react-router-dom";

const HomePage = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userRole = userInfo?.role;
  return (
    <div className="flex flex-col justify-center align-middle p-6 max-w-xl space-y-4 mx-auto">
      <h1 className="text-3xl font-bold">Zgjedhe nje aktivitet</h1>
      {userRole !== "admin" && (
        <>
          <NavLink to="/ppl-store">
            <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full hover:bg-blue-700">
              PPL
            </button>
          </NavLink>
          <NavLink to="/photos">
            <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full hover:bg-blue-700">
              Krijo Foto
            </button>
          </NavLink>
          <NavLink to="/price-check">
            <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full hover:bg-blue-700">
              Krijo Qmimin
            </button>
          </NavLink>
        </>
      )}
      {userRole === "admin" && (
        <>
          <NavLink to="/reports">
            <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full hover:bg-blue-700">
              Raporte
            </button>
          </NavLink>
          <NavLink to="/photos/report">
            <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full hover:bg-blue-700">
              Raportet e Fotove
            </button>
          </NavLink>
        </>
      )}
    </div>
  );
};

export default HomePage;
