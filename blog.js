// ════════════════════════════════════════════════════════════════
//  Blog — SSR completo (rotas /blog e /blog/:slug)
//  Lê de Supabase blog_posts (publicado=true via RLS).
//  Renderiza HTML estático com schema.org Article + meta tags
//  completos pra Google indexar bem.
// ════════════════════════════════════════════════════════════════
const { createClient } = require('@supabase/supabase-js');
const { marked } = require('marked');

const SB_URL = 'https://flzpblpegoqjxaacjvhf.supabase.co';
const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsenBibHBlZ29xanhhYWNqdmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODM2NDUsImV4cCI6MjA5Mzc1OTY0NX0.U_JPnFs2ZJ-E5PQqqrUR-KZewysszgMCwWpi82zTy10';
const SITE_URL = 'https://elevabrands.com.br';

const sb = createClient(SB_URL, SB_ANON_KEY);

marked.setOptions({ gfm: true, breaks: false, smartypants: false });

// ─── Helpers ──────────────────────────────────────────────────────
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtData(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function tempoLeitura(conteudo) {
  const palavras = String(conteudo || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
}

// ─── Template de layout (header + footer) ─────────────────────────
function layout({ titulo, descricao, canonical, ogImage, ogType, schema, body, robots }) {
  const title = titulo || 'Blog · Eleva Digital';
  const desc = descricao || 'Insights sobre tráfego pago, IA e marketing digital pra negócios locais no Vale do Paraíba.';
  const img = ogImage || `${SITE_URL}/assets/facebook-cover.png`;
  const canon = canonical || `${SITE_URL}/blog`;
  const ogT = ogType || 'website';
  const robotsContent = robots || 'index, follow, max-snippet:-1, max-image-preview:large';

  const schemaJSON = schema
    ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    : '';

  return `<!doctype html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0A0A0A" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png" />
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="robots" content="${esc(robotsContent)}" />
  <link rel="canonical" href="${esc(canon)}" />
  <meta property="og:type" content="${esc(ogT)}" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Eleva Digital" />
  <meta property="og:url" content="${esc(canon)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${esc(img)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${esc(img)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
  ${schemaJSON}
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#0A0A0A;color:#fff;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.6}
    a{color:#C5F82A;text-decoration:none;transition:opacity .15s}
    a:hover{opacity:.8}
    .nav{position:sticky;top:0;z-index:50;background:rgba(10,10,10,.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06)}
    .nav-inner{max-width:1120px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
    .brand{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;letter-spacing:-.02em;color:#fff}
    .brand span{color:#C5F82A}
    .nav-links{display:flex;gap:24px;font-size:14px}
    .nav-links a{color:#A0A0A0}
    .nav-links a:hover{color:#fff;opacity:1}
    main{max-width:780px;margin:0 auto;padding:60px 24px 100px}
    .crumbs{font-size:13px;color:#555;margin-bottom:24px}
    .crumbs a{color:#A0A0A0}
    h1.post-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(32px,5vw,52px);font-weight:700;letter-spacing:-.03em;line-height:1.15;margin-bottom:18px}
    .post-meta{display:flex;align-items:center;gap:14px;color:#777;font-size:13px;margin-bottom:40px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,.06)}
    .post-meta strong{color:#C5F82A;font-weight:500}
    .cover{width:100%;border-radius:14px;margin-bottom:40px;border:1px solid rgba(255,255,255,.08)}
    article.content{font-size:17px;color:#D4D4D4}
    article.content h2{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:600;margin-top:48px;margin-bottom:18px;color:#fff;letter-spacing:-.01em}
    article.content h3{font-family:'Space Grotesk',sans-serif;font-size:21px;font-weight:600;margin-top:36px;margin-bottom:14px;color:#fff}
    article.content p{margin-bottom:22px}
    article.content ul,article.content ol{margin:0 0 24px 24px}
    article.content li{margin-bottom:10px}
    article.content blockquote{border-left:3px solid #C5F82A;padding:8px 0 8px 24px;margin:28px 0;color:#A0A0A0;font-style:italic}
    article.content code{background:rgba(197,248,42,.1);color:#C5F82A;padding:2px 6px;border-radius:4px;font-size:14px;font-family:ui-monospace,monospace}
    article.content pre{background:#111;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:18px;overflow-x:auto;margin:24px 0}
    article.content pre code{background:none;color:#D4D4D4;padding:0}
    article.content strong{color:#fff;font-weight:600}
    article.content a{color:#C5F82A;border-bottom:1px solid rgba(197,248,42,.3)}
    article.content img{max-width:100%;border-radius:10px;margin:24px 0;border:1px solid rgba(255,255,255,.06)}
    article.content table{width:100%;border-collapse:collapse;margin:24px 0;font-size:15px}
    article.content th,article.content td{padding:12px 14px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08)}
    article.content th{color:#C5F82A;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.05em}
    .tags{display:flex;flex-wrap:wrap;gap:8px;margin:48px 0 0}
    .tag{font-size:12px;padding:4px 11px;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:#A0A0A0}
    .cta{margin-top:60px;padding:32px;background:linear-gradient(135deg,rgba(197,248,42,.08),rgba(197,248,42,.02));border:1px solid rgba(197,248,42,.2);border-radius:14px;text-align:center}
    .cta h3{font-family:'Space Grotesk',sans-serif;font-size:22px;margin-bottom:8px;color:#fff}
    .cta p{color:#A0A0A0;font-size:14px;margin-bottom:18px}
    .cta a{display:inline-block;background:#C5F82A;color:#000;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;border-bottom:none}
    /* Lista de posts */
    .list-head{text-align:center;margin-bottom:60px}
    .list-head h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(36px,5vw,56px);font-weight:700;letter-spacing:-.03em;line-height:1.1;margin-bottom:14px}
    .list-head p{color:#A0A0A0;font-size:18px;max-width:540px;margin:0 auto}
    .posts{display:flex;flex-direction:column;gap:0}
    .post-card{display:block;padding:36px 0;border-bottom:1px solid rgba(255,255,255,.06);color:inherit;transition:transform .2s}
    .post-card:hover{transform:translateX(4px);opacity:1}
    .post-card h2{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:600;letter-spacing:-.01em;color:#fff;margin-bottom:8px}
    .post-card .pc-date{font-size:13px;color:#555;margin-bottom:12px}
    .post-card .pc-desc{color:#A0A0A0;font-size:15px}
    .empty{padding:80px 20px;text-align:center;color:#A0A0A0}
    .empty h2{color:#fff;margin-bottom:8px}
    footer.site-footer{border-top:1px solid rgba(255,255,255,.06);padding:32px 24px;text-align:center;font-size:13px;color:#555}
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="brand">Eleva <span>Digital</span></a>
      <div class="nav-links">
        <a href="/">Início</a>
        <a href="/blog">Blog</a>
        <a href="/como-funciona">Como funciona</a>
        <a href="https://wa.me/5512981668507">WhatsApp</a>
      </div>
    </div>
  </nav>
  ${body}
  <footer class="site-footer">
    © ${new Date().getFullYear()} Eleva Digital · Agência de Marketing Digital em Taubaté/SP · <a href="/privacidade">Privacidade</a> · <a href="/termos">Termos</a>
  </footer>
</body>
</html>`;
}

// ─── /blog (lista) ────────────────────────────────────────────────
async function renderList() {
  const { data: posts, error } = await sb
    .from('blog_posts')
    .select('slug, titulo, subtitulo, resumo, publicado_em, cover_url, tags')
    .eq('publicado', true)
    .order('publicado_em', { ascending: false });

  if (error) {
    return layout({
      titulo: 'Blog · Eleva Digital',
      body: `<main><div class="empty"><h2>Ops</h2><p>Não foi possível carregar os posts agora.</p></div></main>`,
    });
  }

  const lista = (posts || []).length
    ? `<div class="posts">
        ${posts.map(p => `
          <a class="post-card" href="/blog/${esc(p.slug)}">
            <h2>${esc(p.titulo)}</h2>
            <div class="pc-date">${esc(fmtData(p.publicado_em))}</div>
            <div class="pc-desc">${esc(p.resumo || p.subtitulo || '')}</div>
          </a>
        `).join('')}
      </div>`
    : `<div class="empty"><h2>Em breve</h2><p>Os primeiros posts estão a caminho.</p></div>`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Eleva Digital',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Eleva Digital',
      logo: `${SITE_URL}/assets/favicon-512.png`,
    },
    blogPost: (posts || []).map(p => ({
      '@type': 'BlogPosting',
      headline: p.titulo,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.publicado_em,
    })),
  };

  const body = `
    <main>
      <div class="list-head">
        <h1>Blog Eleva Digital</h1>
        <p>Tráfego pago, IA e marketing digital pra negócios locais no Vale do Paraíba.</p>
      </div>
      ${lista}
    </main>`;

  return layout({
    titulo: 'Blog · Eleva Digital · Marketing Digital em Taubaté',
    descricao: 'Tráfego pago, IA, automação de WhatsApp e estratégias de marketing pra negócios locais no Vale do Paraíba. Insights da Eleva Digital.',
    canonical: `${SITE_URL}/blog`,
    schema,
    body,
  });
}

// ─── /blog/:slug (post individual) ────────────────────────────────
async function renderPost(slug) {
  const { data: post, error } = await sb
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('publicado', true)
    .maybeSingle();

  if (error || !post) return null;

  const htmlConteudo = marked.parse(post.conteudo || '');
  const tempoMin = post.tempo_leitura_min || tempoLeitura(post.conteudo);
  const canonical = `${SITE_URL}/blog/${post.slug}`;
  const cover = post.cover_url || `${SITE_URL}/assets/facebook-cover.png`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    headline: post.titulo,
    description: post.resumo || post.subtitulo || '',
    image: cover,
    datePublished: post.publicado_em,
    dateModified: post.atualizado_em || post.publicado_em,
    author: { '@type': 'Person', name: post.autor || 'Lira', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Eleva Digital',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/favicon-512.png` },
    },
    keywords: post.keywords || (post.tags || []).join(', '),
    inLanguage: 'pt-BR',
    articleSection: 'Marketing Digital',
    wordCount: String(post.conteudo || '').split(/\s+/).filter(Boolean).length,
  };

  const tagsHtml = (post.tags || []).length
    ? `<div class="tags">${post.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>`
    : '';

  const body = `
    <main>
      <div class="crumbs"><a href="/">Início</a> / <a href="/blog">Blog</a> / ${esc(post.titulo)}</div>
      <h1 class="post-title">${esc(post.titulo)}</h1>
      <div class="post-meta">
        <span>Por <strong>${esc(post.autor || 'Lira')}</strong></span>
        <span>·</span>
        <span>${esc(fmtData(post.publicado_em))}</span>
        <span>·</span>
        <span>${tempoMin} min de leitura</span>
      </div>
      ${post.cover_url ? `<img class="cover" src="${esc(post.cover_url)}" alt="${esc(post.cover_alt || post.titulo)}" />` : ''}
      <article class="content">${htmlConteudo}</article>
      ${tagsHtml}
      <div class="cta">
        <h3>Quer aplicar isso no seu negócio?</h3>
        <p>A gente faz um diagnóstico gratuito e mostra o caminho mais curto pro resultado.</p>
        <a href="https://wa.me/5512981668507?text=${encodeURIComponent('Oi Lira, vim do blog da Eleva Digital, quero um diagnóstico gratuito')}">Falar no WhatsApp</a>
      </div>
    </main>`;

  // view++ fire-and-forget
  sb.from('blog_posts').update({ view_count: (post.view_count || 0) + 1 }).eq('id', post.id)
    .then(() => {}, () => {});

  return layout({
    titulo: `${post.titulo} · Eleva Digital`,
    descricao: post.resumo || post.subtitulo || '',
    canonical,
    ogImage: cover,
    ogType: 'article',
    schema,
    body,
  });
}

// ─── /sitemap.xml dinâmico (inclui posts) ─────────────────────────
async function renderSitemap() {
  const { data: posts } = await sb
    .from('blog_posts')
    .select('slug, atualizado_em, publicado_em')
    .eq('publicado', true)
    .order('publicado_em', { ascending: false });

  const hoje = new Date().toISOString().slice(0, 10);
  const fixas = [
    { loc: '/',                lastmod: hoje, changefreq: 'weekly',  priority: '1.0' },
    { loc: '/blog',            lastmod: hoje, changefreq: 'daily',   priority: '0.9' },
    { loc: '/como-funciona',   lastmod: hoje, changefreq: 'monthly', priority: '0.8' },
    { loc: '/privacidade',     lastmod: hoje, changefreq: 'yearly',  priority: '0.3' },
    { loc: '/termos',          lastmod: hoje, changefreq: 'yearly',  priority: '0.3' },
    { loc: '/exclusao-dados',  lastmod: hoje, changefreq: 'yearly',  priority: '0.3' },
  ];

  const postUrls = (posts || []).map(p => ({
    loc: `/blog/${p.slug}`,
    lastmod: (p.atualizado_em || p.publicado_em || hoje).slice(0, 10),
    changefreq: 'monthly',
    priority: '0.7',
  }));

  const todas = [...fixas, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${todas.map(u => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  return xml;
}

module.exports = { renderList, renderPost, renderSitemap };
