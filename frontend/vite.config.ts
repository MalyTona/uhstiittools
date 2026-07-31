import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const target = env.VITE_PROXY_TARGET || "http://127.0.0.1:5000";
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": target,
        "/health": target,
      },
    },
    test: {
      environment: "jsdom",
      environmentOptions: {
        jsdom: { url: "http://localhost/" },
      },
      setupFiles: "./src/test/setup.ts",
      css: true,
      restoreMocks: true,
    },
  };
});
