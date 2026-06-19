import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    // Proxy das rotas de auth/config pro server.js que roda em :3001
    proxy: {
      '/admin-config-auth': 'http://localhost:3001',
      '/public-config.js':  'http://localhost:3001',
      '/admin-config.js':   'http://localhost:3001',
    },
  },
})
