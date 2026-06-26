// Service Worker minimalista pro CRM da Eleva.
// Estratégia: NETWORK FIRST pra HTML (pra updates aparecerem imediatos),
// CACHE FIRST pros assets versionados (que mudam de hash quando o build muda).
// Não cacheia chamadas Supabase pra não servir dado antigo.

const VERSION = 'eleva-crm-v3'
const CACHE_ASSETS = `${VERSION}-assets`

// Sem precache: deixa o cache ir enchendo conforme o usuário navega
self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Não interferir com domínios externos (Supabase, OpenRouter, fonts API)
  if (url.origin !== location.origin) return

  // Sempre buscar HTML da rede primeiro (fallback cache se offline)
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req)
        const cache = await caches.open(CACHE_ASSETS)
        cache.put(req, fresh.clone())
        return fresh
      } catch {
        const cache = await caches.open(CACHE_ASSETS)
        const cached = await cache.match(req) || await cache.match('/crm/')
        return cached || new Response('Offline', { status: 503 })
      }
    })())
    return
  }

  // Assets com hash no nome (Vite) — cache first
  if (/\/crm\/assets\/.+\.(js|css|woff2?|png|jpg|svg|webp|ico)$/.test(url.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_ASSETS)
      const cached = await cache.match(req)
      if (cached) return cached
      try {
        const fresh = await fetch(req)
        if (fresh.ok) cache.put(req, fresh.clone())
        return fresh
      } catch {
        return cached || new Response('', { status: 504 })
      }
    })())
    return
  }
})
