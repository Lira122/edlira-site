import { db, selectAll } from '../db.js'
import { fmtd, toast, openModal, closeModal } from '../utils.js'

let _posts = []

const SITE_URL = 'https://elevabrands.com.br'

function slugify(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
))

const escAttr = (s) => esc(s)

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando posts...</div>'

  const { data, error } = await selectAll('blog_posts', { order: { column: 'criado_em', ascending: false } })
  if (error) { c.innerHTML = `<div class="empty">Erro: ${error.message}</div>`; return }
  _posts = data || []

  document.getElementById('tbacts').innerHTML = `
    <button class="btn bp" id="btn-new-post">+ Novo post</button>`
  document.getElementById('btn-new-post').addEventListener('click', () => postForm())

  if (!_posts.length) {
    c.innerHTML = `
      <div class="empty" style="padding:80px 20px">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhum post ainda</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:18px">Crie o primeiro post pra começar a alavancar seu SEO.</div>
      </div>`
    return
  }

  const cards = _posts.map(p => {
    const publicado = !!p.publicado
    const status = publicado
      ? `<span class="badge b-ativo">Publicado</span>`
      : `<span class="badge b-em_pausa">Rascunho</span>`
    const data = publicado && p.publicado_em
      ? `<span style="font-size:12px;color:var(--text-3)">Publicado em ${fmtd(p.publicado_em)}</span>`
      : `<span style="font-size:12px;color:var(--text-3)">Criado em ${fmtd(p.criado_em)}</span>`
    const views = p.view_count ? `<span style="font-size:12px;color:var(--text-3)">${p.view_count} views</span>` : ''
    const tags = (p.tags || []).map(t => `<span class="badge" style="background:rgba(255,255,255,.04);color:var(--text-2);border:1px solid var(--line);font-size:10px">${esc(t)}</span>`).join(' ')

    return `
      <div class="tw" style="margin-bottom:14px;padding:18px" data-pid="${p.id}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:10px">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">${status}${data}${views}</div>
            <h3 style="font-size:18px;font-weight:600;margin-bottom:4px;color:var(--text)">${esc(p.titulo)}</h3>
            <div style="font-size:12px;color:var(--text-3);font-family:ui-monospace,monospace">/blog/${esc(p.slug)}</div>
            ${p.resumo ? `<div style="font-size:13px;color:var(--text-2);margin-top:8px;line-height:1.5">${esc(p.resumo)}</div>` : ''}
            ${tags ? `<div style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap">${tags}</div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
            <button class="btn bg bsm post-edit" data-pid="${p.id}">Editar</button>
            ${publicado
              ? `<a class="btn bg bsm" href="${SITE_URL}/blog/${esc(p.slug)}" target="_blank" style="text-decoration:none;text-align:center">Ver no site →</a>
                 <button class="btn bg bsm post-unpublish" data-pid="${p.id}">Despublicar</button>`
              : `<button class="btn bp bsm post-publish" data-pid="${p.id}">Publicar</button>`}
            <button class="btn bd bsm post-del" data-pid="${p.id}">Excluir</button>
          </div>
        </div>
      </div>`
  }).join('')

  c.innerHTML = `<div>${cards}</div>`

  c.querySelectorAll('.post-edit').forEach(b => b.addEventListener('click', () => {
    const p = _posts.find(x => x.id === b.dataset.pid)
    if (p) postForm(p)
  }))
  c.querySelectorAll('.post-publish').forEach(b => b.addEventListener('click', () => togglePublish(b.dataset.pid, true)))
  c.querySelectorAll('.post-unpublish').forEach(b => b.addEventListener('click', () => togglePublish(b.dataset.pid, false)))
  c.querySelectorAll('.post-del').forEach(b => b.addEventListener('click', () => delPost(b.dataset.pid)))
}

async function togglePublish(id, publicado) {
  const p = _posts.find(x => x.id === id)
  if (!p) return
  const payload = {
    publicado,
    atualizado_em: new Date().toISOString(),
  }
  if (publicado && !p.publicado_em) payload.publicado_em = new Date().toISOString()
  const { error } = await db.from('blog_posts').update(payload).eq('id', id)
  if (error) { toast('Erro: ' + error.message, 'err'); return }
  toast(publicado ? 'Publicado ✓' : 'Despublicado')
  render()
}

async function delPost(id) {
  const p = _posts.find(x => x.id === id)
  if (!p) return
  if (!confirm(`Excluir post "${p.titulo}"? Essa ação é permanente.`)) return
  const { error } = await db.from('blog_posts').delete().eq('id', id)
  if (error) { toast('Erro: ' + error.message, 'err'); return }
  toast('Post excluído')
  render()
}

function postForm(p = {}) {
  const isNew = !p.id
  const tagsStr = (p.tags || []).join(', ')

  openModal(isNew ? 'Novo post' : 'Editar post', `
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Título *</label>
      <input class="fi" id="bp-titulo" value="${escAttr(p.titulo || '')}" placeholder="Ex: Quanto custa anúncio no Instagram em Taubaté">
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Slug (URL) <span style="color:var(--text-3);font-weight:400">— auto-gerado se vazio</span></label>
      <input class="fi" id="bp-slug" value="${escAttr(p.slug || '')}" placeholder="anuncio-instagram-taubate" style="font-family:ui-monospace,monospace">
      <div style="font-size:11px;color:var(--text-3);margin-top:5px">URL final: <span style="color:var(--accent);font-family:ui-monospace,monospace">/blog/<span id="bp-slug-preview">${escAttr(p.slug || '...')}</span></span></div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Subtítulo <span style="color:var(--text-3);font-weight:400">(opcional)</span></label>
      <input class="fi" id="bp-subtitulo" value="${escAttr(p.subtitulo || '')}" placeholder="Linha de apoio que aparece logo após o título">
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Resumo (meta description) <span style="color:var(--text-3);font-weight:400">— máx 160 caracteres</span></label>
      <textarea class="fta" id="bp-resumo" rows="2" maxlength="200" placeholder="O que esse post entrega. Aparece no Google e nos cards.">${esc(p.resumo || '')}</textarea>
    </div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg">
        <label class="fl">URL da imagem de capa</label>
        <input class="fi" id="bp-cover" value="${escAttr(p.cover_url || '')}" placeholder="https://...">
      </div>
      <div class="fg">
        <label class="fl">Alt da imagem (SEO)</label>
        <input class="fi" id="bp-cover-alt" value="${escAttr(p.cover_alt || '')}" placeholder="Descrição da imagem">
      </div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Tags <span style="color:var(--text-3);font-weight:400">(separadas por vírgula)</span></label>
      <input class="fi" id="bp-tags" value="${escAttr(tagsStr)}" placeholder="tráfego pago, taubaté, instagram ads">
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Keywords (SEO) <span style="color:var(--text-3);font-weight:400">— meta keywords</span></label>
      <input class="fi" id="bp-keywords" value="${escAttr(p.keywords || '')}" placeholder="agência marketing digital Taubaté, anúncio Instagram">
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Conteúdo (Markdown) *</label>
      <textarea class="fta" id="bp-conteudo" rows="18" style="font-family:ui-monospace,monospace;font-size:13px" placeholder="## Subtítulo do post&#10;&#10;Texto em **markdown**.&#10;&#10;- Lista&#10;- Mais um item&#10;&#10;[Link](https://...)">${esc(p.conteudo || '')}</textarea>
      <div style="font-size:11px;color:var(--text-3);margin-top:5px">Suporta GFM (Github-flavored Markdown): tabelas, código, listas, blockquote, etc.</div>
    </div>
    <div class="fg">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
        <input type="checkbox" id="bp-publicado" ${p.publicado ? 'checked' : ''}>
        <span>Publicar ao salvar (visível em /blog)</span>
      </label>
    </div>
  `, `
    ${isNew ? '' : '<button class="btn bd" id="bp-del">Excluir</button>'}
    <button class="btn bg" id="bp-cancel">Cancelar</button>
    <button class="btn bp" id="bp-save">${isNew ? 'Criar post' : 'Salvar'}</button>
  `)

  // Auto-gerar slug a partir do título quando o slug tá vazio
  const tituloInp = document.getElementById('bp-titulo')
  const slugInp   = document.getElementById('bp-slug')
  const slugPrev  = document.getElementById('bp-slug-preview')
  let slugTocado  = !!p.slug

  tituloInp.addEventListener('input', () => {
    if (!slugTocado) {
      slugInp.value = slugify(tituloInp.value)
      slugPrev.textContent = slugInp.value || '...'
    }
  })
  slugInp.addEventListener('input', () => {
    slugTocado = true
    slugInp.value = slugify(slugInp.value)
    slugPrev.textContent = slugInp.value || '...'
  })

  document.getElementById('bp-cancel').addEventListener('click', closeModal)
  if (!isNew) document.getElementById('bp-del').addEventListener('click', async () => {
    if (!confirm(`Excluir "${p.titulo}"?`)) return
    await delPost(p.id); closeModal()
  })

  document.getElementById('bp-save').addEventListener('click', async () => {
    const titulo = tituloInp.value.trim()
    if (!titulo) return toast('Título é obrigatório', 'err')
    const slug = (slugInp.value.trim() || slugify(titulo))
    if (!slug) return toast('Slug inválido', 'err')
    const conteudo = document.getElementById('bp-conteudo').value.trim()
    if (!conteudo) return toast('Conteúdo é obrigatório', 'err')

    const tags = document.getElementById('bp-tags').value.split(',').map(t => t.trim()).filter(Boolean)
    const publicado = document.getElementById('bp-publicado').checked
    const palavras = conteudo.split(/\s+/).filter(Boolean).length

    const payload = {
      titulo,
      slug,
      subtitulo: document.getElementById('bp-subtitulo').value.trim() || null,
      resumo: document.getElementById('bp-resumo').value.trim() || null,
      conteudo,
      cover_url: document.getElementById('bp-cover').value.trim() || null,
      cover_alt: document.getElementById('bp-cover-alt').value.trim() || null,
      tags,
      keywords: document.getElementById('bp-keywords').value.trim() || null,
      publicado,
      tempo_leitura_min: Math.max(1, Math.round(palavras / 200)),
      atualizado_em: new Date().toISOString(),
    }
    if (publicado && !p.publicado_em) {
      payload.publicado_em = new Date().toISOString()
    }

    const op = isNew
      ? db.from('blog_posts').insert(payload).select().single()
      : db.from('blog_posts').update(payload).eq('id', p.id).select().single()

    const { error } = await op
    if (error) {
      if (error.code === '23505') return toast('Já existe um post com esse slug', 'err')
      return toast('Erro: ' + error.message, 'err')
    }
    toast(isNew ? (publicado ? 'Post criado e publicado ✓' : 'Rascunho salvo') : 'Salvo ✓')
    closeModal()
    render()
  })
}
