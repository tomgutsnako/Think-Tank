// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      // no externalized renderer modules so the bundle works when served from file://
      external: [],
    },
  },
});