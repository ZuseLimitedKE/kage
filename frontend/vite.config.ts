import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      assert: "assert",
      buffer: "buffer",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      util: "util",
    },
  },
  optimizeDeps: {
    include: ["buffer", "process"],
  },
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
  },
});
