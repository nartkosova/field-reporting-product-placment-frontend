// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";
import { setupAuthInterceptor } from "./services/authService";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
  CACHE_BUSTER,
  CACHE_MAX_AGE,
  queryClient,
  queryPersister,
  setupCacheInvalidation,
  shouldPersistQuery,
} from "./lib/queryClient";

// Redirect to the login page whenever the API rejects the session
setupAuthInterceptor();

// Posting or editing PPL/photos makes the cached reports refetch
setupCacheInvalidation();

// Register service worker
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister: queryPersister,
      maxAge: CACHE_MAX_AGE,
      buster: CACHE_BUSTER,
      dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
    }}
  >
    <Router>
      <App />
    </Router>
  </PersistQueryClientProvider>,
  // </StrictMode>
);
