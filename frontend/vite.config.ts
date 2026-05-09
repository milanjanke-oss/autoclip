import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/upload": "http://localhost:4000",
      "/transcribe": "http://localhost:4000",
      "/analyze": "http://localhost:4000",
      "/render": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
      "/jobs": "http://localhost:4000",
    },
  },
});
