import { NavLink } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col justify-center align-middle p-6 max-w-xl space-y-4 mx-auto">
      <h1 className="text-3xl font-bold">Select an activity</h1>
      <NavLink to="/ppl-store">
        <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full hover:bg-blue-700">
          PPL
        </button>
      </NavLink>
      <NavLink to="/reports">
        <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full hover:bg-blue-700">
          Reports
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
    </div>
  );
};

export default HomePage;
