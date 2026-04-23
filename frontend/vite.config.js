import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/proposals": "http://localhost:8000",
      "/votes": "http://localhost:8000",
    },
  },
});
