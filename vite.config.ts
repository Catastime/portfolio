import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  optimizeDeps: {
    // Pre-bundle the 3D stack at startup — discovered late, these trigger
    // mid-session re-optimization and full-page reloads in dev
    include: [
      'three',
      'three/addons/loaders/GLTFLoader.js',
      'three/addons/environments/RoomEnvironment.js',
      '@react-three/fiber',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
