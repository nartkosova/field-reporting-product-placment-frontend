import { Outlet } from "react-router-dom";
import Header from "../pages/Navigation/Header";

const Layout = () => {
  return (
    <div className="min-h-screen w-full bg-black block flex-col px-4">
      <Header />
      <main className="w-full h-full items-center justify-center overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
