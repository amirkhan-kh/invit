import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    // Dev rejimida backend API'ga so'rovlarni uzatamiz (CORS muammosisiz)
    proxy: {
      '/api': 'http://localhost:5001',
      '/uploads': 'http://localhost:5001',
    },
  },
})
