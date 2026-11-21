import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// API responses may contain private records. No CacheStorage or HTTP-cache fallback.
export const SUPABASE_RUNTIME_ROUTE = {
  urlPattern: /^https:\/\/[a-z0-9.-]+\.supabase\.co\//i,
  method: 'GET',
  handler: 'NetworkOnly',
  options: { fetchOptions: { cache: 'no-store' } },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Rafiqy',
        short_name: 'Rafiqy',
        description: 'Your everyday companion for getting things done — 58 privacy-first browser tools',
        theme_color: '#06b6d4',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Cache all static assets + the app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        importScripts: ['/sw-cache-cleanup.js'],
        runtimeCaching: [SUPABASE_RUNTIME_ROUTE],
      },
    }),
  ],
})
