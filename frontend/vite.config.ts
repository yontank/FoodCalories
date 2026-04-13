import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

import path from "path";

export default defineConfig(({ mode }) => {
  const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

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
