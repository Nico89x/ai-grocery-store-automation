import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative URLs also work under a GitHub Pages repository subpath.
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: { manualChunks: { 'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'] } }
    }
  }
});
