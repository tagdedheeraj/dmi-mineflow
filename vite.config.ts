
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Completely disable any Lovable-related features
  define: {
    'import.meta.env.VITE_DISABLE_LOVABLE': JSON.stringify('true'),
    'window.enableLovable': 'false',
    'window.enableGPTEngineer': 'false',
    'window.DISABLE_LOVABLE': 'true',
    'window.DISABLE_GPTENGINEER': 'true',
  }
}));
