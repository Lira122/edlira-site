const express = require('express');
const path = require('path');
const fs = require('fs');

// Lê env locais (gitignored). Em produção (Hostinger sem esses arquivos) ignora.
// IMPORTANTE: usa SB_KEY do bot/.env (JWT legacy service_role) propositalmente.
// O supabase-js v2 bloqueia chaves no formato sb_secret_* no browser; usar legacy aqui
// permite o painel.html rodar localmente sem expor a publishable ao mundo.
try { require('dotenv').config({ path: path.join(__dirname, 'bot', '.env') }); } catch (_) {}

const app = express();
const PORT = process.env.PORT || 3000;

// Confia no proxy se houver (pro req.ip pegar o IP real em ambientes intermediados)
app.set('trust proxy', false);

// Rota especial: injeta chaves no painel.html SOMENTE quando a requisição vem de localhost.
// Em produção (qualquer outro IP) responde 404 e o painel cai pro fluxo de prompt/localStorage.
app.get('/admin-config.js', (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress || '';
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  if (!isLocal) {
    res.status(404).type('application/javascript').send('// not available');
    return;
  }
  // SB_ANON_KEY (publishable) é a usada no browser. SB_KEY (secret) só fica
  // disponível pra cenários server-side — o supabase-js bloqueia secret no browser.
  let anonKey = '';
  try {
    const crmEnv = require('dotenv').parse(fs.readFileSync(path.join(__dirname, 'crm', '.env')));
    anonKey = crmEnv.VITE_SB_ANON_KEY || '';
  } catch (_) {}
  const cfg = {
    SB_KEY: process.env.SB_KEY || '',
    SB_ANON_KEY: anonKey,
    OR_KEY: process.env.OR_KEY || process.env.OPENROUTER_KEY || '',
  };
  res.type('application/javascript').send(`window.EL_CONFIG = ${JSON.stringify(cfg)};`);
});

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
