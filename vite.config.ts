import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const LOCAL_BACKEND = "http://localhost:3000";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Dev calls the local backend directly (VITE_BASE_URL from .env). Builds
  // call "/api" on their own origin, which functions/api/[[path]].ts proxies
  // to Railway, so the session cookie stays first-party. Nothing from .env is
  // baked into a build.
  const baseUrl =
    command === "build"
      ? ""
      : loadEnv(mode, process.cwd(), "VITE_").VITE_BASE_URL || LOCAL_BACKEND;

  return {
    define: {
      "import.meta.env.VITE_BASE_URL": JSON.stringify(baseUrl),
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "apple-touch-icon.png",
          "masked-icon.svg",
        ],
        manifest: {
          name: "My Vite PWA App",
          short_name: "VitePWA",
          description: "A React TypeScript PWA built with Vite",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
      }),
    ],
    server: {
      host: "0.0.0.0",
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 5173,
      },
    },
  };
});
