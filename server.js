const express = require('express');
const path = require('path');
const fs = require('fs');

// ─── Hardening: app NUNCA pode morrer por erro inesperado ─────────────────
// Em produção (Hostinger Node Hosting) um uncaughtException mata o processo
// e a Hostinger nem sempre auto-reinicia. Capturamos e logamos.
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err && err.stack || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason && reason.stack || reason);
});
process.on('SIGTERM', () => {
  console.log('[SIGTERM] encerrando graceful');
  process.exit(0);
});

// Lê env locais (gitignored). Em produção (Hostinger sem esses arquivos) ignora.
try { require('dotenv').config({ path: path.join(__dirname, 'bot', '.env') }); } catch (_) {}

const SB_URL = 'https://flzpblpegoqjxaacjvhf.supabase.co';
// Anon key (JWT legacy) — safe pra browser, é o token usado pelo Supabase Auth.
const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsenBibHBlZ29xanhhYWNqdmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODM2NDUsImV4cCI6MjA5Mzc1OTY0NX0.U_JPnFs2ZJ-E5PQqqrUR-KZewysszgMCwWpi82zTy10';
const ALLOWED_EMAILS = new Set([
  'junior@elevabrands.com.br',
  'lira.mktdgt@gmail.com',
  'edmilson_jr@icloud.com',
]);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

// Healthcheck — Hostinger e UptimeRobot batem nele pra saber se app tá vivo.
// Resposta ínfima e sem dependência (sem fetch, sem fs, sem db).
app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: Math.floor(process.uptime()) });
});

// Endpoint legacy (localhost) — mantido pra dev rápido. Em produção responde 404.
app.get('/admin-config.js', (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress || '';
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  if (!isLocal) {
    res.status(404).type('application/javascript').send('// not available');
    return;
  }
  let anonKey = SB_ANON_KEY;
  try {
    const crmEnv = require('dotenv').parse(fs.readFileSync(path.join(__dirname, 'crm', '.env')));
    if (crmEnv.VITE_SB_ANON_KEY) anonKey = crmEnv.VITE_SB_ANON_KEY;
  } catch (_) {}
  const cfg = {
    SB_KEY: process.env.SB_KEY || '',
    SB_ANON_KEY: anonKey,
    OR_KEY: process.env.OR_KEY || process.env.OPENROUTER_KEY || '',
  };
  res.type('application/javascript').send(`window.EL_CONFIG = ${JSON.stringify(cfg)};`);
});

// Config público inicial: URL + anon key (anon é safe expor).
// Usado pra inicializar Supabase Auth no painel ANTES do login.
app.get('/public-config.js', (_req, res) => {
  res.type('application/javascript').send(
    `window.EL_PUBLIC = ${JSON.stringify({ SB_URL, SB_ANON_KEY })};`
  );
});

// Endpoint protegido: só responde se o JWT for de um email autorizado.
// Troca user-JWT pelas chaves admin (service_role + OpenRouter).
app.post('/admin-config-auth', express.json(), async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return res.status(401).json({ ok: false, error: 'no token' });

  try {
    const r = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SB_ANON_KEY },
    });
    if (!r.ok) return res.status(401).json({ ok: false, error: 'invalid token' });
    const user = await r.json();
    const email = (user.email || '').toLowerCase();
    if (!email || !ALLOWED_EMAILS.has(email)) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    res.json({
      ok: true,
      SB_KEY: process.env.SB_KEY || '',
      OR_KEY: process.env.OR_KEY || process.env.OPENROUTER_KEY || '',
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
});

// CRM Vite buildado fica em /crm/. SPA fallback pra qualquer rota interna.
const CRM_DIST = path.join(__dirname, 'crm', 'dist');
app.use('/crm', express.static(CRM_DIST));
app.get('/crm/*', (_req, res) => {
  res.sendFile(path.join(CRM_DIST, 'index.html'));
});

// HTML não cacheia (pra mudanças aparecerem na hora). Outros assets cacheiam normal.
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

app.get('/', (_req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rotas explícitas pras páginas legais (garante que a Vercel inclua os HTMLs no bundle).
// Aceita TANTO /pagina.html quanto /pagina (URL limpa, melhor pra SEO).
['privacidade', 'termos', 'exclusao-dados', 'como-funciona', 'painel'].forEach((name) => {
  const serve = (_req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, `${name}.html`));
  };
  app.get(`/${name}.html`, serve);
  app.get(`/${name}`,      serve);
});

// SEO essentials — entrega robots.txt com Content-Type correto.
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

// ─── BLOG (SSR + sitemap dinâmico) ─────────────────────────────────────
const blog = require('./blog.js');

// Sitemap dinâmico: inclui posts publicados em tempo real.
app.get('/sitemap.xml', async (_req, res) => {
  try {
    const xml = await blog.renderSitemap();
    res.set('Cache-Control', 'public, max-age=600'); // 10min cache
    res.type('application/xml').send(xml);
  } catch (err) {
    console.error('[SITEMAP]', err);
    res.status(500).type('application/xml').send('<?xml version="1.0"?><error/>');
  }
});

// Lista de posts
app.get('/blog', async (_req, res) => {
  try {
    const html = await blog.renderList();
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600'); // 5min browser, 10min CDN
    res.type('text/html').send(html);
  } catch (err) {
    console.error('[BLOG LIST]', err);
    res.status(500).send('Erro ao carregar blog');
  }
});

// Post individual
app.get('/blog/:slug', async (req, res) => {
  const slug = String(req.params.slug || '').replace(/[^a-z0-9-]/gi, '').slice(0, 200);
  if (!slug) return res.redirect(302, '/blog');
  try {
    const html = await blog.renderPost(slug);
    if (!html) return res.status(404).redirect('/blog');
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.type('text/html').send(html);
  } catch (err) {
    console.error('[BLOG POST]', slug, err);
    res.status(500).send('Erro ao carregar post');
  }
});

// Error middleware do Express — pega exceptions de rota e não derruba o processo.
app.use((err, _req, res, _next) => {
  console.error('[EXPRESS ERROR]', err && err.stack || err);
  if (res.headersSent) return;
  res.status(500).json({ ok: false, error: 'internal' });
});

const server = app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Servidor rodando na porta ${PORT} (node ${process.version})`);
});

// Keep-alive longo pra não fechar conexões cedo (alguns proxies da Hostinger têm idle).
server.keepAliveTimeout = 65_000;
server.headersTimeout   = 70_000;
