import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.{png,jpg,jpeg,svg}'],
      manifest: {
        short_name: 'La Casona',
        name: 'La Casona - Sistema de Gestión de Eventos',
        icons: [
          {
            src: './logo.png',
            sizes: '100x100',
            type: 'image/png'
          }
        ],
        start_url: '.',
        display: 'standalone',
        theme_color: '#1d3557',
        background_color: '#ffffff'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 3001,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
