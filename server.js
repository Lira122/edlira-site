const express = require('express');
const path = require('path');
const fs = require('fs');

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

app.set('trust proxy', false);

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

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
