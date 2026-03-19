import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const parsedPort = Number.parseInt(env.VITE_PORT ?? "5173", 10);
  const devPort = Number.isFinite(parsedPort) ? parsedPort : 5173;

  return {
    plugins: [react()],
    server: {
      port: devPort,
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
