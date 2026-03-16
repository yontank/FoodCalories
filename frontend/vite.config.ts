import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

import path from "path";

export default defineConfig(({ mode }) => {
  // Load .env from monorepo root (parent of frontend/)
  const env = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const backendUrl =
    process.env.BACKEND_URL ?? env.BACKEND_URL ?? "http://127.0.0.1:8000";

  return {
    server: {
      proxy: {
        "/api/v1": backendUrl,
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
