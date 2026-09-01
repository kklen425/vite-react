import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        bus: 'bus.html',
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: false, // use our existing public/manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/california-garden-bus-data\.json$/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname === '/california-garden-bus-data.json',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'bus-timetable-data',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
})
