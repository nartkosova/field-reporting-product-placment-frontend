// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";

// Register service worker
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Router>
    <App />
  </Router>
  // </StrictMode>
);
