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
      // Add alias to fix React version conflicts
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    dedupe: ['react', 'react-dom'], // Ensure only one copy of React is used
  },
  define: {
    // Handle process.env reference in the client code
    "process.env": {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      VITE_DISCORD_CLIENT_ID: JSON.stringify(process.env.VITE_DISCORD_CLIENT_ID || '1350091089398464574'),
      VITE_DISCORD_REDIRECT_URI: JSON.stringify(process.env.VITE_DISCORD_REDIRECT_URI || 'https://slayz.cc/api/auth/callback/discord'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"), // ✅ Ensure correct output path
    emptyOutDir: true,
    commonjsOptions: {
      // Fix for packages that might cause issues
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Explicitly mark problematic modules as external
      external: ['gsap', 'globe.gl'],
      output: {
        // Prevent warning about missing exports
        manualChunks: (id) => {
          // Group React packages together
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          return null;
        }
      }
    }
  },
  optimizeDeps: {
    // Force packages to use project's React version
    include: ['react', 'react-dom'],
    exclude: ['gsap', 'globe.gl'], // Exclude problematic packages
    esbuildOptions: {
      // Needed to prevent version conflicts
      preserveSymlinks: true,
    }
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
