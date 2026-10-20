import { Routes, Route, useLocation } from "react-router-dom";
import { AxiosError } from "axios";
import Toaster from "./components/Toast/Toaster";
import { toast } from "./components/Toast/toast";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
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

// Last line of defence for async errors no caller handled: tell the user
// instead of failing silently.
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  const error = event.reason;
  // Session expiry is handled by redirecting to login; offline by the queue.
  if (
    error instanceof AxiosError &&
    (error.response?.status === 401 || !navigator.onLine)
  ) {
    return;
  }
  const apiMessage =
    error instanceof AxiosError
      ? (error.response?.data as { error?: string })?.error
      : undefined;
  toast.error(apiMessage || "Ndodhi një gabim i papritur. Provo përsëri.");
};

const App = () => {
  const location = useLocation();

  useEffect(() => {
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () =>
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
  }, []);

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
    <>
      {/* Keyed by path so navigating away from a crashed page recovers. */}
      <ErrorBoundary key={location.pathname}>
        <Routes>
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}

          <Route
            element={
              <RouteGuard allowedRoles={["admin", "employee", "viewer"]} />
            }
          >
            <Route element={<Layout />}>
              {reportRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>
          </Route>

          <Route element={<RouteGuard allowedRoles={["admin", "employee"]} />}>
            <Route element={<Layout />}>
              {employeeRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>
          </Route>

          <Route element={<RouteGuard allowedRoles={["admin"]} />}>
            <Route element={<Layout />}>
              {adminRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>
          </Route>
        </Routes>
      </ErrorBoundary>
      <Toaster />
    </>
  );
};

export default App;
