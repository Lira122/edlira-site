// Kanban de pauta/conteudo — ideias -> publicado
import { db, selectAll } from '../db.js'
import { toast, openModal, closeModal } from '../utils.js'

const STAGES = [
  { k: 'ideia',      l: 'Ideia',      cor: '#94A3B8', dot: 'rgba(148,163,184,.7)' },
  { k: 'roteiro',    l: 'Roteiro',    cor: '#4A9EFF', dot: 'rgba(74,158,255,.9)' },
  { k: 'gravado',    l: 'Gravado',    cor: '#A78BFA', dot: 'rgba(167,139,250,.9)' },
  { k: 'editando',   l: 'Editando',   cor: '#F5A623', dot: 'rgba(245,166,35,.95)' },
  { k: 'agendado',   l: 'Agendado',   cor: '#22D3EE', dot: 'rgba(34,211,238,.95)' },
  { k: 'publicado',  l: 'Publicado',  cor: '#34D399', dot: 'rgba(52,211,153,.95)' },
]

const TIPOS = [
  { k: 'reel',   l: 'Reel',    icon: 'Rl' },
  { k: 'post',   l: 'Post',    icon: 'Po' },
  { k: 'story',  l: 'Story',   icon: 'St' },
  { k: 'yt',     l: 'YouTube', icon: 'YT' },
  { k: 'tiktok', l: 'TikTok',  icon: 'TT' },
  { k: 'blog',   l: 'Blog',    icon: 'Bl' },
  { k: 'outro',  l: 'Outro',   icon: '**' },
]
const TIPO_MAP = Object.fromEntries(TIPOS.map(t => [t.k, t]))

const CANAIS_ALVO = [
  { k: 'instagram', l: 'Instagram' },
  { k: 'youtube',   l: 'YouTube' },
  { k: 'tiktok',    l: 'TikTok' },
  { k: 'site',      l: 'Site / Blog' },
  { k: 'linkedin',  l: 'LinkedIn' },
]

let _conteudos = []
let _dragId = null

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
))

function fmtData(iso) {
  if (!iso) return ''
  const dt = new Date(iso)
  const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab']
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  return `${dias[dt.getDay()]}, ${String(dt.getDate()).padStart(2,'0')} ${meses[dt.getMonth()]}`
}

export async function render() {
  document.getElementById('tbacts').innerHTML =
    `<button class="btn bp" id="btn-add-ct">+ Nova ideia</button>`
  document.getElementById('btn-add-ct').addEventListener('click', () => abrirForm())

  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando pauta...</div>'

  const { data, error } = await selectAll('conteudos', {
    order: { column: 'ordem', ascending: true }
  })
  if (error) {
    c.innerHTML = `<div class="empty">Erro: ${error.message}<br><br>Rode <code>supabase/conteudos.sql</code> no SQL Editor primeiro.</div>`
    return
  }
  _conteudos = data || []

  renderKanban()
}

function renderKanban() {
  const total = _conteudos.length
  const agrupado = {}
  STAGES.forEach(s => { agrupado[s.k] = [] })
  _conteudos.forEach(c => {
    const k = STAGES.some(s => s.k === c.status) ? c.status : 'ideia'
    agrupado[k].push(c)
  })
  STAGES.forEach(s => {
    agrupado[s.k].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  })

  const colunas = STAGES.map(s => {
    const items = agrupado[s.k]
    const cards = items.map(cardConteudo).join('') || '<div class="ct-col-empty">Vazio</div>'
    return `
      <div class="ct-col" data-status="${s.k}">
        <div class="ct-col-h">
          <div class="ct-col-t">
            <span class="ct-col-dot" style="background:${s.dot}"></span>
            <span>${s.l}</span>
            <span class="ct-col-count">${items.length}</span>
          </div>
          <button class="ct-col-add" data-status="${s.k}" title="Nova ideia nesta coluna">+</button>
        </div>
        <div class="ct-col-body" data-drop="${s.k}">
          ${cards}
        </div>
      </div>`
  }).join('')

  const el = document.getElementById('content')
  el.innerHTML = `
    <div class="ct-hdr">
      <div class="ct-hdr-t">
        <div class="ct-hdr-title">Pauta de conteudo</div>
        <div class="ct-hdr-sub">${total} ${total === 1 ? 'ideia' : 'ideias'} no pipeline - arraste os cards entre colunas</div>
      </div>
    </div>
    <div class="ct-kanban">${colunas}</div>`

  el.querySelectorAll('.ct-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.ct-card-del')) return
      abrirForm(card.dataset.id)
    })
  })
  el.querySelectorAll('.ct-card-del').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      if (!confirm('Remover essa ideia?')) return
      await db.from('conteudos').delete().eq('id', btn.dataset.id)
      toast('Removida.')
      render()
    })
  })
  el.querySelectorAll('.ct-col-add').forEach(btn => {
    btn.addEventListener('click', () => abrirForm(null, btn.dataset.status))
  })

  el.querySelectorAll('.ct-card').forEach(card => {
    card.setAttribute('draggable', 'true')
    card.addEventListener('dragstart', (e) => {
      _dragId = card.dataset.id
      card.classList.add('dragging')
      e.dataTransfer.effectAllowed = 'move'
    })
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging')
      _dragId = null
      el.querySelectorAll('.ct-col-body').forEach(b => b.classList.remove('drop-over'))
    })
  })
  el.querySelectorAll('.ct-col-body').forEach(body => {
    body.addEventListener('dragover', (e) => {
      e.preventDefault()
      body.classList.add('drop-over')
    })
    body.addEventListener('dragleave', () => {
      body.classList.remove('drop-over')
    })
    body.addEventListener('drop', async (e) => {
      e.preventDefault()
      body.classList.remove('drop-over')
      if (!_dragId) return
      const novoStatus = body.dataset.drop
      const item = _conteudos.find(x => x.id === _dragId)
      if (!item || item.status === novoStatus) return
      item.status = novoStatus
      renderKanban()
      const { error } = await db.from('conteudos')
        .update({ status: novoStatus, atualizado_em: new Date().toISOString() })
        .eq('id', _dragId)
      if (error) { toast('Erro ao mover: ' + error.message, 'er'); render(); return }
      toast(`Movido para ${STAGES.find(s => s.k === novoStatus)?.l || novoStatus}.`)
    })
  })
}

function cardConteudo(c) {
  const tipo = TIPO_MAP[c.tipo] || TIPO_MAP.outro
  const dataP = c.data_publicacao ? fmtData(c.data_publicacao) : ''
  const canais = Array.isArray(c.canais) ? c.canais : []
  const chips = canais.slice(0, 3).map(k => {
    const ch = CANAIS_ALVO.find(x => x.k === k)
    return `<span class="ct-chip">${esc(ch?.l || k)}</span>`
  }).join('')
  const desc = c.descricao ? c.descricao.slice(0, 90).replace(/\s+/g,' ').trim() : ''
  return `
    <div class="ct-card" data-id="${c.id}">
      <div class="ct-card-top">
        <span class="ct-card-tipo" title="${esc(tipo.l)}">${tipo.icon}</span>
        <div class="ct-card-title">${esc(c.titulo)}</div>
        <button class="ct-card-del" data-id="${c.id}" title="Remover">x</button>
      </div>
      ${desc ? `<div class="ct-card-desc">${esc(desc)}${c.descricao.length > 90 ? '...' : ''}</div>` : ''}
      ${chips ? `<div class="ct-card-chips">${chips}</div>` : ''}
      ${dataP ? `<div class="ct-card-data">${dataP}</div>` : ''}
    </div>`
}

function abrirForm(id, statusInicial) {
  const c = id ? _conteudos.find(x => x.id === id) : { status: statusInicial || 'ideia', canais: [], tipo: 'reel' }
  if (id && !c) return

  const tipoOpts = TIPOS.map(t =>
    `<option value="${t.k}"${(c.tipo || 'reel') === t.k ? ' selected' : ''}>${t.l}</option>`
  ).join('')

  const statusOpts = STAGES.map(s =>
    `<option value="${s.k}"${(c.status || 'ideia') === s.k ? ' selected' : ''}>${s.l}</option>`
  ).join('')

  const canaisArr = Array.isArray(c.canais) ? c.canais : []
  const canaisChips = CANAIS_ALVO.map(ch => `
    <label class="ct-canal-chip">
      <input type="checkbox" name="ct-canal" value="${ch.k}" ${canaisArr.includes(ch.k) ? 'checked' : ''}>
      <span>${ch.l}</span>
    </label>
  `).join('')

  const dataVal = c.data_publicacao ? new Date(c.data_publicacao).toISOString().slice(0, 16) : ''

  const body = `
    <div class="fg"><label class="fl">Titulo *</label>
      <input class="fi" id="ct-titulo" value="${esc(c.titulo || '')}" placeholder="Ex: Como IA qualifica lead 24/7" autofocus>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Tipo</label>
        <select class="fsl" id="ct-tipo">${tipoOpts}</select>
      </div>
      <div class="fg"><label class="fl">Status</label>
        <select class="fsl" id="ct-status">${statusOpts}</select>
      </div>
    </div>
    <div class="fg">
      <label class="fl">Canais</label>
      <div class="ct-canais">${canaisChips}</div>
    </div>
    <div class="fg"><label class="fl">Data de publicacao (opcional)</label>
      <input class="fi" id="ct-data" type="datetime-local" value="${dataVal}">
    </div>
    <div class="fg"><label class="fl">Roteiro / descricao</label>
      <textarea class="fta" id="ct-desc" style="min-height:180px" placeholder="Escreva o roteiro completo, topicos, hooks, CTA...">${esc(c.descricao || '')}</textarea>
    </div>`

  openModal(id ? 'Editar ideia' : 'Nova ideia de conteudo', body,
    `<button class="btn bg" id="ct-cancel">Cancelar</button>
     ${id ? `<button class="btn bd" id="ct-del">Remover</button>` : ''}
     <button class="btn bp" id="ct-save">Salvar</button>`)

  document.getElementById('ct-cancel').addEventListener('click', closeModal)
  document.getElementById('ct-save').addEventListener('click', () => salvar(id))
  if (id) document.getElementById('ct-del').addEventListener('click', async () => {
    if (!confirm('Remover essa ideia?')) return
    await db.from('conteudos').delete().eq('id', id)
    toast('Removida.')
    closeModal()
    render()
  })
}

async function salvar(id) {
  const titulo = document.getElementById('ct-titulo').value.trim()
  if (!titulo) { toast('Titulo obrigatorio.', 'er'); return }
  const canais = Array.from(document.querySelectorAll('input[name="ct-canal"]:checked')).map(el => el.value)
  const dataRaw = document.getElementById('ct-data').value
  const d = {
    titulo,
    tipo: document.getElementById('ct-tipo').value,
    status: document.getElementById('ct-status').value,
    canais,
    data_publicacao: dataRaw ? new Date(dataRaw).toISOString() : null,
    descricao: document.getElementById('ct-desc').value.trim() || null,
    atualizado_em: new Date().toISOString(),
  }
  const { error } = id
    ? await db.from('conteudos').update(d).eq('id', id)
    : await db.from('conteudos').insert(d)
  if (error) { toast('Erro: ' + error.message, 'er'); return }
  toast(id ? 'Ideia atualizada.' : 'Ideia criada.')
  closeModal()
  render()
}
