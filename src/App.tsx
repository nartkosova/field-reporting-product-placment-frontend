import { Routes, Route } from "react-router-dom";
import { publicRoutes, userRoutes, adminRoutes } from "./routes/routes";
import RouteGuard from "./routes/RouteGuard";
import Layout from "./routes/Layout";
import {
  cacheCompetitorCategories,
  syncQueuedCompetitorFacings,
  syncQueuedFacings,
} from "./db/db";
import { useEffect, useRef } from "react";
import competitorServices from "./services/competitorServices";

const App = () => {
  const hasSyncedRef = useRef(false);
  useEffect(() => {
    const handleOnline = () => {
      if (!hasSyncedRef.current) {
        hasSyncedRef.current = true;
        syncQueuedFacings();
        syncQueuedCompetitorFacings();
      }
    };
    window.addEventListener("online", handleOnline);

    if (navigator.onLine && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      syncQueuedFacings();
      syncQueuedCompetitorFacings();
    }

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    const fetchAndCache = async () => {
      const categories =
        await competitorServices.getAllCompetitorsWithCategories();
      await cacheCompetitorCategories(categories);
    };

    fetchAndCache();
  }, []);

  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      <Route element={<RouteGuard requiredRole="employee" />}>
        <Route element={<Layout />}>
          {userRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      <Route element={<RouteGuard requiredRole="admin" />}>
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
