import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import envPlugin from "./client/src/lib/vite-env-plugin";

// ✅ ESM fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname, "client"), // ✅ Set client as root
  plugins: [
    react(),
    envPlugin(), // Add our environment plugin
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"), // ✅ Fix alias resolution
      "gsap": path.resolve(__dirname, "node_modules/gsap"), // Add direct path to GSAP
    },
  },
  define: {
    // Handle process.env reference in the client code
    "process.env": {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      VITE_DISCORD_CLIENT_ID: JSON.stringify(process.env.VITE_DISCORD_CLIENT_ID || '1350091089398464574'),
      VITE_DISCORD_REDIRECT_URI: JSON.stringify(process.env.VITE_DISCORD_REDIRECT_URI || 'https://slayz.cc/oauth2/authorize/callback'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"), // ✅ Ensure correct output path
    emptyOutDir: true,
    rollupOptions: {
      // Explicitly include gsap in the bundle
      external: [],
    }
  },
  optimizeDeps: {
    include: ['gsap'], // Ensure GSAP is properly included
  },
  server: {
    port: 5173,
    strictPort: true, // ✅ Ensures Vite doesn't auto-change the port
    watch: {
      usePolling: true, // ✅ Fixes issues with file watching on some OS
    },
  },
  base: "/", // ✅ Use absolute path for better asset resolution
});
