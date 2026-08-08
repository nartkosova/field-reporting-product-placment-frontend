import { Routes, Route } from "react-router-dom";
import {
  publicRoutes,
  reportRoutes,
  employeeRoutes,
  adminRoutes,
} from "./routes/routes";
import RouteGuard from "./routes/RouteGuard";
import Layout from "./routes/Layout";
import { fetchAndCacheCompetitorCategories, syncAllIfNeeded } from "./db/db";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    const handleOnline = () => {
      syncAllIfNeeded();
    };
    window.addEventListener("online", handleOnline);

    if (navigator.onLine) {
      syncAllIfNeeded();
    }

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    fetchAndCacheCompetitorCategories();
  }, []);

  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      <Route
        element={<RouteGuard allowedRoles={["admin", "employee", "viewer"]} />}
      >
        <Route element={<Layout />}>
          {reportRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      <Route element={<RouteGuard allowedRoles={["admin", "employee"]} />}>
        <Route element={<Layout />}>
          {employeeRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      <Route element={<RouteGuard allowedRoles={["admin"]} />}>
        <Route element={<Layout />}>
          {adminRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
