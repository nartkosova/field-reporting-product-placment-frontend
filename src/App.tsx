import { Routes, Route } from "react-router-dom";
import { publicRoutes, userRoutes, adminRoutes } from "./routes/routes";
import RouteGuard from "./routes/RouteGuard";
import Layout from "./routes/Layout";

const App = () => {
  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      <Route element={<RouteGuard requiredRole="user" />}>
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
