import { Outlet } from "react-router-dom";
import Header from "../pages/Navigation/Header";

const Layout = () => {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col ">
      <Header />
      <main className="flex-1 flex items-center  justify-center overflow-hidden px-4">
        <div className="w-full h-fulloverflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
