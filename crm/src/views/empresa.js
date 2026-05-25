import { db } from '../db.js'
import { fmtd, toast } from '../utils.js'

const BUCKET = 'empresa-assets'

const CATEGORIAS_DOC = [
  { value: 'contrato',     label: 'Contrato' },
  { value: 'briefing',     label: 'Briefing' },
  { value: 'apresentacao', label: 'Apresentação' },
  { value: 'proposta',     label: 'Proposta comercial' },
  { value: 'marca',        label: 'Manual da marca' },
  { value: 'financeiro',   label: 'Financeiro' },
  { value: 'outros',       label: 'Outros' },
]

const CAT_LABEL = Object.fromEntries(CATEGORIAS_DOC.map(c => [c.value, c.label]))

let _perfil = null
let _docs   = []

export async function render() {
  document.getElementById('tbacts').innerHTML = ''
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  // 1. Perfil (cria se não existir)
  const { data: p, error: pe } = await db.from('empresa_perfil').select('*').eq('id', 'main').maybeSingle()
  if (pe) { c.innerHTML = `<div class="empty">Erro: ${pe.message}<br><br>Rode <code>supabase/empresa.sql</code> no SQL Editor primeiro.</div>`; return }
  if (!p) {
    await db.from('empresa_perfil').insert({ id: 'main' })
    _perfil = { id: 'main' }
  } else {
    _perfil = p
  }

  // 2. Documentos
  const { data: d } = await db.from('empresa_documentos').select('*').order('criado_em', { ascending: false })
  _docs = d || []

  renderPage()
}

function renderPage() {
  const p = _perfil
  const c = document.getElementById('content')

  const docsHtml = _docs.length ? _docs.map(d => `
    <div class="doc-row" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line)">
      <div style="font-size:24px;flex-shrink:0">${iconForMime(d.mime_type)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:500">${esc(d.nome)}</div>
        <div style="font-size:11px;color:var(--text-3);margin-top:2px">
          ${d.categoria ? `<span style="display:inline-block;padding:1px 7px;background:rgba(255,255,255,.05);border-radius:8px;margin-right:8px">${esc(CAT_LABEL[d.categoria] || d.categoria)}</span>` : ''}
          ${formatSize(d.tamanho_bytes)} · ${fmtd(d.criado_em)}
        </div>
        ${d.descricao ? `<div style="font-size:12px;color:var(--text-2);margin-top:4px">${esc(d.descricao)}</div>` : ''}
      </div>
      <a href="${d.arquivo_url}" target="_blank" rel="noopener" class="btn bg bsm" style="text-decoration:none;flex-shrink:0">Abrir</a>
      <button class="btn bd bsm del-doc" data-id="${d.id}" data-path="${esc(d.arquivo_path || '')}" style="flex-shrink:0">Remover</button>
    </div>`).join('') : '<div class="empty" style="padding:30px">Nenhum documento ainda. Suba o primeiro acima.</div>'

  c.innerHTML = `
    <!-- IDENTIDADE -->
    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>Identidade da empresa</h3></div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:16px;max-width:980px">

        <div style="display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap">
          <div style="flex-shrink:0">
            <div style="width:130px;height:130px;border:1px dashed var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg-card)">
              ${p.logo_url ? `<img src="${p.logo_url}" style="max-width:100%;max-height:100%;object-fit:contain">` : `<span style="font-size:11px;color:var(--text-3)">Sem logo</span>`}
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">
              <input type="file" id="logo-input" accept="image/*" style="display:none">
              <button class="btn bg bsm" id="logo-btn">${p.logo_url ? 'Trocar logo' : 'Subir logo'}</button>
              ${p.logo_url ? `<button class="btn bd bsm" id="logo-clear">Remover</button>` : ''}
            </div>
          </div>

          <div style="flex:1;min-width:280px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="fg"><label class="fl">Nome fantasia</label><input class="fi" id="ep-nome" value="${esc(p.nome_fantasia)}" placeholder="Eleva Digital"></div>
            <div class="fg"><label class="fl">Razão social</label><input class="fi" id="ep-razao" value="${esc(p.razao_social)}" placeholder="Eleva Digital LTDA"></div>
            <div class="fg"><label class="fl">CNPJ</label><input class="fi" id="ep-cnpj" value="${esc(p.cnpj)}" placeholder="00.000.000/0001-00"></div>
            <div class="fg"><label class="fl">Site</label><input class="fi" id="ep-site" value="${esc(p.site_url)}" placeholder="https://elevabrands.com.br"></div>
            <div class="fg"><label class="fl">E-mail</label><input class="fi" id="ep-email" value="${esc(p.email)}" placeholder="junior@elevabrands.com.br"></div>
            <div class="fg"><label class="fl">WhatsApp</label><input class="fi" id="ep-whats" value="${esc(p.whatsapp)}" placeholder="(12) 98166-8507"></div>
          </div>
        </div>

        <div class="fg"><label class="fl">Slogan / tagline</label><input class="fi" id="ep-slogan" value="${esc(p.slogan)}" placeholder="Tráfego pago + IA que escala negócios"></div>
        <div class="fg"><label class="fl">Descrição da empresa</label><textarea class="fta" id="ep-descricao" style="min-height:80px">${esc(p.descricao)}</textarea></div>
        <div class="frow">
          <div class="fg"><label class="fl">Missão</label><textarea class="fta" id="ep-missao">${esc(p.missao)}</textarea></div>
          <div class="fg"><label class="fl">Valores</label><textarea class="fta" id="ep-valores">${esc(p.valores)}</textarea></div>
        </div>

        <div style="border-top:1px solid var(--line);padding-top:16px">
          <div style="font-size:11px;font-weight:600;color:var(--text-3);margin-bottom:10px;text-transform:uppercase;letter-spacing:.08em">Identidade Visual</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
            ${corField('1', 'Cor primária',   p.cor_primaria   || '#C5F82A')}
            ${corField('2', 'Cor secundária', p.cor_secundaria || '#0A0A0A')}
            ${corField('3', 'Cor terciária',  p.cor_terciaria  || '#FFFFFF')}
            <div class="fg"><label class="fl">Tipografia</label><input class="fi" id="ep-tipo" value="${esc(p.tipografia)}" placeholder="Inter, Manrope..."></div>
          </div>
        </div>

        <div class="fg"><label class="fl">Endereço</label><input class="fi" id="ep-end" value="${esc(p.endereco)}" placeholder="Rua exemplo, 123 — São José dos Campos, SP"></div>

        <div style="display:flex;gap:10px;align-items:center;padding-top:6px">
          <button class="btn bp" id="ep-salvar">Salvar identidade</button>
          ${p.atualizado_em ? `<span style="font-size:11px;color:var(--text-3)">Atualizado em ${fmtd(p.atualizado_em)}</span>` : ''}
        </div>
      </div>
    </div>

    <!-- DOCUMENTOS -->
    <div class="tw">
      <div class="th"><h3>Documentos <span style="color:var(--text-3);font-weight:400">(${_docs.length})</span></h3></div>
      <div style="padding:16px 18px;border-bottom:1px solid var(--line)">
        <div style="display:grid;grid-template-columns:180px 1fr 1.4fr auto;gap:10px;align-items:end">
          <div class="fg"><label class="fl">Categoria</label>
            <select class="fsl" id="doc-cat">${CATEGORIAS_DOC.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}</select>
          </div>
          <div class="fg"><label class="fl">Nome do documento</label><input class="fi" id="doc-nome" placeholder="Ex: Contrato modelo 2026"></div>
          <div class="fg"><label class="fl">Descrição (opcional)</label><input class="fi" id="doc-desc" placeholder="Notas sobre o documento..."></div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <input type="file" id="doc-file" style="font-size:11px;color:var(--text-2)">
            <button type="button" class="btn bp bsm" id="doc-upload">Enviar</button>
          </div>
        </div>
        <div id="doc-status" style="font-size:12px;color:var(--text-3);margin-top:8px"></div>
      </div>
      <div id="doc-list">${docsHtml}</div>
    </div>`

  // ── Listeners ───────────────────────────────────────────────────────────
  document.getElementById('logo-btn').addEventListener('click', () => document.getElementById('logo-input').click())
  document.getElementById('logo-input').addEventListener('change', uploadLogo)
  if (p.logo_url) document.getElementById('logo-clear').addEventListener('click', removeLogo)

  // Sincroniza color picker ↔ campo de texto hexadecimal
  for (const n of ['1', '2', '3']) {
    const cp = document.getElementById('ep-cor' + n)
    const tx = document.getElementById('ep-cor' + n + '-txt')
    cp.addEventListener('input', () => { tx.value = cp.value.toUpperCase() })
    tx.addEventListener('change', () => {
      const v = tx.value.trim()
      if (/^#[0-9a-f]{6}$/i.test(v)) cp.value = v
    })
  }

  document.getElementById('ep-salvar').addEventListener('click', salvarIdentidade)
  document.getElementById('doc-upload').addEventListener('click', uploadDoc)

  c.querySelectorAll('.del-doc').forEach(btn =>
    btn.addEventListener('click', () => removerDoc(btn.dataset.id, btn.dataset.path))
  )
}

function corField(n, label, valor) {
  return `
    <div class="fg">
      <label class="fl">${label}</label>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="color" id="ep-cor${n}" value="${valor}" style="width:44px;height:36px;border:1px solid var(--line);border-radius:6px;background:transparent;cursor:pointer;padding:2px">
        <input class="fi" id="ep-cor${n}-txt" value="${esc(valor)}" placeholder="#000000" style="flex:1;font-family:ui-monospace,monospace;font-size:12px">
      </div>
    </div>`
}

// ── Logo ──────────────────────────────────────────────────────────────────

async function uploadLogo(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { toast('Selecione uma imagem.', 'er'); return }

  const ext  = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `logos/logo-${Date.now()}.${ext}`

  const { error } = await db.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type })
  if (error) { toast('Erro no upload: ' + error.message, 'er'); return }

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path)
  const { error: dbErr } = await db.from('empresa_perfil')
    .update({ logo_url: publicUrl, atualizado_em: new Date().toISOString() })
    .eq('id', 'main')
  if (dbErr) { toast('Erro ao salvar: ' + dbErr.message, 'er'); return }

  toast('Logo atualizado.')
  render()
}

async function removeLogo() {
  if (!confirm('Remover o logo?')) return
  await db.from('empresa_perfil')
    .update({ logo_url: null, atualizado_em: new Date().toISOString() })
    .eq('id', 'main')
  toast('Logo removido.')
  render()
}

// ── Identidade ────────────────────────────────────────────────────────────

async function salvarIdentidade() {
  const v = id => {
    const el = document.getElementById(id)
    return el ? (el.value.trim() || null) : null
  }
  const cor = (txtId, cpId) => v(txtId) || document.getElementById(cpId).value

  const payload = {
    nome_fantasia:  v('ep-nome'),
    razao_social:   v('ep-razao'),
    cnpj:           v('ep-cnpj'),
    site_url:       v('ep-site'),
    email:          v('ep-email'),
    whatsapp:       v('ep-whats'),
    slogan:         v('ep-slogan'),
    descricao:      v('ep-descricao'),
    missao:         v('ep-missao'),
    valores:        v('ep-valores'),
    cor_primaria:   cor('ep-cor1-txt', 'ep-cor1'),
    cor_secundaria: cor('ep-cor2-txt', 'ep-cor2'),
    cor_terciaria:  cor('ep-cor3-txt', 'ep-cor3'),
    tipografia:     v('ep-tipo'),
    endereco:       v('ep-end'),
    atualizado_em:  new Date().toISOString(),
  }

  const btn = document.getElementById('ep-salvar')
  btn.disabled = true
  const { error } = await db.from('empresa_perfil').update(payload).eq('id', 'main')
  btn.disabled = false

  if (error) { toast('Erro ao salvar: ' + error.message, 'er'); return }

  toast('Identidade salva.')
  Object.assign(_perfil, payload)
}

// ── Documentos ────────────────────────────────────────────────────────────

async function uploadDoc() {
  const fileEl = document.getElementById('doc-file')
  const file = fileEl.files?.[0]
  if (!file) { toast('Selecione um arquivo.', 'er'); return }

  const nome   = document.getElementById('doc-nome').value.trim() || file.name
  const desc   = document.getElementById('doc-desc').value.trim() || null
  const cat    = document.getElementById('doc-cat').value
  const status = document.getElementById('doc-status')
  const btn    = document.getElementById('doc-upload')

  const safe = file.name.replace(/[^a-z0-9.\-_]/gi, '_')
  const path = `docs/${cat}/${Date.now()}-${safe}`

  status.textContent = 'Enviando...'
  btn.disabled = true

  try {
    const { error: upErr } = await db.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || 'application/octet-stream',
    })
    if (upErr) throw upErr

    const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path)

    const { error: dbErr } = await db.from('empresa_documentos').insert({
      nome,
      descricao:     desc,
      categoria:     cat,
      arquivo_url:   publicUrl,
      arquivo_path:  path,
      tamanho_bytes: file.size,
      mime_type:     file.type || null,
    })
    if (dbErr) throw dbErr

    toast('Documento enviado.')
    fileEl.value = ''
    document.getElementById('doc-nome').value = ''
    document.getElementById('doc-desc').value = ''
    render()
  } catch (e) {
    toast('Erro: ' + e.message, 'er')
    status.textContent = ''
  } finally {
    btn.disabled = false
  }
}

async function removerDoc(id, path) {
  if (!confirm('Remover este documento?')) return
  if (path) await db.storage.from(BUCKET).remove([path])
  const { error } = await db.from('empresa_documentos').delete().eq('id', id)
  if (error) { toast('Erro ao remover: ' + error.message, 'er'); return }
  toast('Documento removido.')
  render()
}

// ── Helpers ───────────────────────────────────────────────────────────────

function esc(s) {
  return (s ?? '').toString()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatSize(b) {
  if (!b) return '—'
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1024 / 1024).toFixed(1) + ' MB'
}

function iconForMime(m) {
  if (!m) return '📄'
  if (m.startsWith('image/'))       return '🖼️'
  if (m.includes('pdf'))            return '📕'
  if (m.includes('word') || m.includes('msword') || m.includes('officedocument.wordprocessing')) return '📘'
  if (m.includes('sheet') || m.includes('excel')) return '📗'
  if (m.includes('presentation') || m.includes('powerpoint')) return '📙'
  if (m.includes('zip') || m.includes('rar') || m.includes('compressed')) return '🗜️'
  if (m.startsWith('video/'))       return '🎬'
  if (m.startsWith('audio/'))       return '🎵'
  return '📄'
}
