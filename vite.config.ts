import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'; // Ensure this is present for resolve()
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/// <reference types="node" />

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // Production build optimizations
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'auth-vendor': ['@auth0/auth0-react'],
          'query-vendor': ['@tanstack/react-query'],
          'mantine-core': ['@mantine/core', '@mantine/hooks'],
          'mantine-extended': ['@mantine/notifications', '@mantine/dates'],
          // Feature chunks
          'features-auth': [
            './src/features/auth/index.ts',
          ],
          'features-tenants': [
            './src/features/tenants/index.ts',
          ],
          'features-projects': [
            './src/features/projects/index.ts',
          ],
          'features-integrations': [
            './src/features/integrations/index.ts',
          ],
        },
        // Optimize chunk file names for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (can be disabled for smaller builds)
    sourcemap: false,
  },
  server: {
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost_key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem')),
    },
    port: 5173,
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    proxy: {
      '/api': {
        target: 'https://mwapss.shibari.photo/api/v1',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\//, ''),
      },
    },
  },
})
