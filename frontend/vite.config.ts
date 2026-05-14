import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      "/upload": { target: "http://localhost:4000", changeOrigin: true },
      "/transcribe": { target: "http://localhost:4000", changeOrigin: true },
      "/analyze": { target: "http://localhost:4000", changeOrigin: true },
      "/render": { target: "http://localhost:4000", changeOrigin: true },
      "/uploads": { target: "http://localhost:4000", changeOrigin: true },
      "/jobs": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
