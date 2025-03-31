import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@ffmpeg/core', 'worker-loader'],
  },
  assetsInclude: ['**/*.wasm'],
  resolve: {
    alias: {
      '@ffmpeg/core': path.resolve(__dirname, 'node_modules/@ffmpeg/core'),
    },
  },
  worker: {
    format: 'es',
  },
})
