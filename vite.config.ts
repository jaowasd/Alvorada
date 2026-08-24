import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Alvorada — Rotina e hábitos',
        short_name: 'Alvorada',
        lang: 'pt-BR',
        description:
          'Organize sua rotina matinal, hábitos, tarefas e finanças num só lugar.',
        theme_color: '#2648e0',
        background_color: '#f4f5f9',
        display: 'standalone',
        start_url: '/app',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Só cache do shell estático (JS/CSS/HTML/ícones) - sem interceptar
        // chamadas ao Supabase, então nada de dado fica desatualizado offline.
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
