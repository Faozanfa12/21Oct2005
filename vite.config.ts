import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/21Oct2005/" : "/",
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:3000", "/uploads": "http://localhost:3000" } },
}));
