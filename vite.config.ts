import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const LOCAL_BACKEND = "http://localhost:3000";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The app always calls the API on its own origin ("/api/..."), so the
  // httpOnly session cookie is first-party and works in every browser. In dev
  // Vite proxies /api to the backend; on Cloudflare, functions/api/[[path]].ts
  // proxies it to Railway. Nothing from .env is baked into the build.
  const devBackend = loadEnv(mode, process.cwd(), "VITE_").VITE_BASE_URL || LOCAL_BACKEND;

  return {
    define: {
      "import.meta.env.VITE_BASE_URL": JSON.stringify(""),
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
      proxy: {
        "/api": { target: devBackend, changeOrigin: true },
      },
    },
  };
});
