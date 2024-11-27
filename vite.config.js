import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist'
  },
  server: {
    open: true,
    port: 5173,
    strictPort: true
  },
});