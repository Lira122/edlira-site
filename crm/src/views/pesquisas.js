// ═══════════════════════════════════════════════════════════════════
// PESQUISAS — pipeline de descobertas que o Hermes (ou qualquer
// assistente) preenche diariamente. Categorias: concorrência,
// tendência, ideia, oportunidade, notícia, insight_cliente.
// Tabela: pesquisas
// ═══════════════════════════════════════════════════════════════════
import { db, selectAll } from '../db.js'
import { fmtd, toast, openModal, closeModal } from '../utils.js'

const STATUS = [
  { k: 'nova',        l: 'Nova',         cor: '#4A9EFF' },
  { k: 'lida',        l: 'Lida',         cor: '#A78BFA' },
  { k: 'em_analise',  l: 'Em análise',   cor: '#F5A623' },
  { k: 'virou_acao',  l: 'Virou ação',   cor: '#34D399' },
  { k: 'arquivada',   l: 'Arquivada',    cor: '#A0A0A0' },
]
const STATUS_MAP = Object.fromEntries(STATUS.map(s => [s.k, s]))

const CATEGORIAS = [
  { k: 'concorrencia',      l: 'Concorrência',      cor: '#FF5C5C', icon: '⚔️' },
  { k: 'tendencia',         l: 'Tendência',         cor: '#EC4899', icon: '📈' },
  { k: 'ideia_conteudo',    l: 'Ideia de conteúdo', cor: '#A78BFA', icon: '💡' },
  { k: 'oportunidade',      l: 'Oportunidade',      cor: '#34D399', icon: '🎯' },
  { k: 'noticia',           l: 'Notícia/mercado',   cor: '#4A9EFF', icon: '📰' },
  { k: 'insight_cliente',   l: 'Insight de cliente',cor: '#F5A623', icon: '🔍' },
  { k: 'benchmark',         l: 'Benchmark',         cor: '#06B6D4', icon: '🏆' },
  { k: 'outro',             l: 'Outro',             cor: '#A0A0A0', icon: '📌' },
]
const CAT_MAP = Object.fromEntries(CATEGORIAS.map(c => [c.k, c]))

const PRIOS = [
  { k: 'baixa',   l: 'Baixa',   cor: '#A0A0A0' },
  { k: 'media',   l: 'Média',   cor: '#4A9EFF' },
  { k: 'alta',    l: 'Alta',    cor: '#F5A623' },
  { k: 'urgente', l: 'Urgente', cor: '#FF5C5C' },
]
const PRIO_MAP = Object.fromEntries(PRIOS.map(p => [p.k, p]))

let _pesqs   = []
let _clis    = []
let _view    = 'kanban'   // kanban | lista
let _filCat  = ''
let _filCli  = ''
let _delegado = false

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'
  attachDelegation()
  await loadAll()
  renderToolbar()
  renderView()
}

async function loadAll() {
  const [p, cli] = await Promise.all([
    selectAll('pesquisas', { order: { column: 'criado_em', ascending: false } }),
    selectAll('clientes', { columns: 'id,nome,empresa,status' }),
  ])
  _pesqs = p.data || []
  _clis  = cli.data || []
}

function renderToolbar() {
  const tab = (k, l) => `<button class="pj-tab${_view===k?' on':''}" data-tab="${k}">${l}</button>`
  const cliOpts = `<option value="">Todos os clientes</option>` +
    clientesAtivos('').map(c => `<option value="${c.id}"${_filCli===c.id?' selected':''}>${escapeHtml(c.empresa || c.nome)}</option>`).join('')
  const catOpts = `<option value="">Todas categorias</option>` +
    CATEGORIAS.map(c => `<option value="${c.k}"${_filCat===c.k?' selected':''}>${c.icon} ${c.l}</option>`).join('')

  document.getElementById('tbacts').innerHTML = `
    <div class="pj-tabs">${tab('kanban','Kanban')}${tab('lista','Lista')}</div>
    <select class="fsl" id="ps-filcat" style="width:auto;padding:6px 11px">${catOpts}</select>
    <select class="fsl" id="ps-filcli" style="width:auto;padding:6px 11px">${cliOpts}</select>
    <button class="btn bp" id="ps-add">+ Nova pesquisa</button>
  `
  document.querySelectorAll('.pj-tab').forEach(el => el.addEventListener('click', () => {
    _view = el.dataset.tab
    renderToolbar(); renderView()
  }))
  document.getElementById('ps-filcat').addEventListener('change', e => { _filCat = e.target.value; renderView() })
  document.getElementById('ps-filcli').addEventListener('change', e => { _filCli = e.target.value; renderView() })
  document.getElementById('ps-add').addEventListener('click', () => pesqForm())
}

function renderView() {
  if (_view === 'lista') return renderLista()
  return renderKanban()
}

function filtrar() {
  return _pesqs.filter(p => {
    if (_filCat && p.categoria !== _filCat) return false
    if (_filCli && p.cliente_id !== _filCli) return false
    return true
  })
}

// ════════ KANBAN ════════════════════════════════════════════════════════
function renderKanban() {
  const c = document.getElementById('content')
  const lista = filtrar()

  if (!lista.length && !_pesqs.length) {
    c.innerHTML = emptyState()
    document.getElementById('ps-first')?.addEventListener('click', () => pesqForm())
    return
  }

  const cols = STATUS.map(col => {
    const cards = lista.filter(x => x.status === col.k)
    const cardHTML = cards.length
      ? cards.map(x => cardHTMLGen(x)).join('')
      : `<div class="pj-empty">—</div>`
    return `<div class="pj-col" data-status="${col.k}">
      <div class="pj-col-head">
        <span class="pj-col-title" style="color:${col.cor}">
          <span class="pj-col-bullet" style="background:${col.cor}"></span>${col.l}
        </span>
        <span class="pj-col-count">${cards.length}</span>
      </div>
      <div class="pj-col-cards" data-drop="${col.k}">${cardHTML}</div>
    </div>`
  }).join('')

  c.innerHTML = `<div class="pj-kanban">${cols}</div>`
  wireDrag()
}

function cardHTMLGen(x) {
  const cat  = CAT_MAP[x.categoria] || CAT_MAP.outro
  const prio = PRIO_MAP[x.prioridade] || PRIO_MAP.media
  const cli  = _clis.find(c => c.id === x.cliente_id)
  const dias = diasAtras(x.criado_em)
  return `<div class="pj-card ps-card" draggable="true" data-id="${x.id}">
    <div class="pj-card-top">
      <div class="pj-card-prio" style="background:${prio.cor}"></div>
      <div class="pj-card-title">${escapeHtml(x.titulo)}</div>
    </div>
    ${x.resumo ? `<div class="pj-card-desc">${escapeHtml(x.resumo).slice(0,90)}${x.resumo.length>90?'…':''}</div>` : ''}
    <div class="pj-card-foot">
      <span class="ps-cat-pill" style="background:${cat.cor}22;color:${cat.cor}">${cat.icon} ${cat.l}</span>
      ${cli ? `<span class="pj-sub-chip">${escapeHtml((cli.empresa || cli.nome).slice(0,14))}</span>` : ''}
    </div>
    <div style="font-size:10px;color:var(--text-3);margin-top:6px;display:flex;justify-content:space-between">
      <span>${x.responsavel ? escapeHtml(x.responsavel) : '—'}</span>
      <span>${dias}</span>
    </div>
  </div>`
}

function diasAtras(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const h = Math.floor((Date.now() - d.getTime()) / 3600000)
  if (h < 1)  return 'agora'
  if (h < 24) return `${h}h atrás`
  const dias = Math.floor(h / 24)
  if (dias === 1) return 'ontem'
  if (dias < 7)  return `${dias} dias`
  return fmtd(iso)
}

function wireDrag() {
  const main = document.getElementById('content')
  let dragged = null
  main.querySelectorAll('.ps-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      dragged = card.dataset.id
      card.classList.add('drag')
      e.dataTransfer.effectAllowed = 'move'
    })
    card.addEventListener('dragend', () => {
      card.classList.remove('drag')
      main.querySelectorAll('.pj-col-cards.over').forEach(el => el.classList.remove('over'))
    })
  })
  main.querySelectorAll('.pj-col-cards').forEach(drop => {
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over') })
    drop.addEventListener('dragleave', () => drop.classList.remove('over'))
    drop.addEventListener('drop', async e => {
      e.preventDefault(); drop.classList.remove('over')
      if (!dragged) return
      const novoStatus = drop.dataset.drop
      const p = _pesqs.find(x => x.id === dragged)
      if (!p || p.status === novoStatus) return
      const { error } = await db.from('pesquisas').update({ status: novoStatus, atualizado_em: new Date().toISOString() }).eq('id', dragged)
      if (error) { toast('Erro: '+error.message, 'err'); return }
      p.status = novoStatus
      renderKanban()
    })
  })
}

// ════════ LISTA ════════════════════════════════════════════════════════
function renderLista() {
  const c = document.getElementById('content')
  const lista = filtrar()
  if (!lista.length) { c.innerHTML = emptyState(); document.getElementById('ps-first')?.addEventListener('click', () => pesqForm()); return }

  const rows = lista.map(x => {
    const st = STATUS_MAP[x.status] || STATUS[0]
    const cat = CAT_MAP[x.categoria] || CAT_MAP.outro
    const prio = PRIO_MAP[x.prioridade] || PRIO_MAP.media
    const cli = _clis.find(c => c.id === x.cliente_id)
    return `<tr class="ps-row" data-id="${x.id}">
      <td class="tm">${diasAtras(x.criado_em)}</td>
      <td><span class="ps-cat-pill" style="background:${cat.cor}22;color:${cat.cor}">${cat.icon} ${cat.l}</span></td>
      <td class="tn">${escapeHtml(x.titulo)}</td>
      <td class="tm">${cli ? escapeHtml(cli.empresa || cli.nome) : '—'}</td>
      <td class="tm">${x.responsavel || '—'}</td>
      <td><span class="pj-pill" style="background:${prio.cor}22;color:${prio.cor}">${prio.l}</span></td>
      <td><span class="pj-pill" style="background:${st.cor}22;color:${st.cor}">${st.l}</span></td>
    </tr>`
  }).join('')

  c.innerHTML = `<div class="tw">
    <table>
      <thead><tr><th>Adicionada</th><th>Categoria</th><th>Título</th><th>Cliente</th><th>Por</th><th>Prio</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`
}

// ════════ FORM ═════════════════════════════════════════════════════════
function pesqForm(x = {}) {
  const isNew = !x.id
  const cliOpts = `<option value="">— sem cliente vinculado —</option>` +
    clientesAtivos(x.cliente_id).map(c => `<option value="${c.id}"${x.cliente_id===c.id?' selected':''}>${escapeHtml(c.empresa || c.nome)}</option>`).join('')
  const catOpts    = CATEGORIAS.map(c => `<option value="${c.k}"${(x.categoria||'concorrencia')===c.k?' selected':''}>${c.icon} ${c.l}</option>`).join('')
  const statusOpts = STATUS.map(s => `<option value="${s.k}"${(x.status||'nova')===s.k?' selected':''}>${s.l}</option>`).join('')
  const prioOpts   = PRIOS.map(p => `<option value="${p.k}"${(x.prioridade||'media')===p.k?' selected':''}>${p.l}</option>`).join('')
  const tags = Array.isArray(x.tags) ? x.tags.join(', ') : (x.tags || '')

  openModal(isNew ? 'Nova pesquisa' : 'Editar pesquisa', `
    <div class="fg" style="margin-bottom:11px"><label class="fl">Título / achado *</label>
      <input class="fi" id="ps-titulo" value="${escapeAttr(x.titulo || '')}" placeholder="Ex: Marmoraria X tá rodando promoção -30% no granito preto"></div>

    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="ps-cat">${catOpts}</select></div>
      <div class="fg"><label class="fl">Cliente relacionado</label><select class="fsl" id="ps-cli">${cliOpts}</select></div>
    </div>

    <div class="fg" style="margin-bottom:11px"><label class="fl">Resumo do que achou</label>
      <textarea class="fta" id="ps-resumo" rows="4" placeholder="Detalhes, contexto, o que chamou atenção...">${escapeHtml(x.resumo || '')}</textarea></div>

    <div class="fg" style="margin-bottom:11px"><label class="fl">Fonte (link)</label>
      <input class="fi" id="ps-fonte" value="${escapeAttr(x.fonte_url || '')}" placeholder="URL do post, anúncio, artigo..."></div>

    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Prioridade</label><select class="fsl" id="ps-prio">${prioOpts}</select></div>
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="ps-status">${statusOpts}</select></div>
      <div class="fg"><label class="fl">Feita por</label><input class="fi" id="ps-resp" value="${escapeAttr(x.responsavel || 'Hermes')}" placeholder="Hermes"></div>
    </div>

    <div class="fg" style="margin-bottom:11px"><label class="fl">Tags (vírgula)</label>
      <input class="fi" id="ps-tags" value="${escapeAttr(tags)}" placeholder="ex: instagram, promocao, criativo-video"></div>

    <div class="fg"><label class="fl">Ação proposta (opcional)</label>
      <textarea class="fta" id="ps-acao" rows="2" placeholder="O que fazer com isso? Ex: replicar promoção pra outro cliente, criar post no mesmo formato...">${escapeHtml(x.acao_proposta || '')}</textarea></div>
  `, `
    ${isNew ? '' : '<button class="btn bd" id="ps-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `)

  document.getElementById('m-cancel').addEventListener('click', closeModal)
  if (!isNew) document.getElementById('ps-del').addEventListener('click', async () => {
    if (!confirm(`Excluir "${x.titulo}"?`)) return
    await db.from('pesquisas').delete().eq('id', x.id)
    toast('Excluída'); closeModal(); render()
  })
  document.getElementById('m-save').addEventListener('click', async () => {
    const tagsStr = document.getElementById('ps-tags').value.trim()
    const tagsArr = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []
    const payload = {
      titulo: document.getElementById('ps-titulo').value.trim(),
      categoria: document.getElementById('ps-cat').value,
      cliente_id: document.getElementById('ps-cli').value || null,
      resumo: document.getElementById('ps-resumo').value.trim() || null,
      fonte_url: document.getElementById('ps-fonte').value.trim() || null,
      prioridade: document.getElementById('ps-prio').value,
      status: document.getElementById('ps-status').value,
      responsavel: document.getElementById('ps-resp').value.trim() || null,
      tags: tagsArr,
      acao_proposta: document.getElementById('ps-acao').value.trim() || null,
      atualizado_em: new Date().toISOString(),
    }
    if (!payload.titulo) return toast('Título é obrigatório', 'err')

    const q = x.id
      ? db.from('pesquisas').update(payload).eq('id', x.id)
      : db.from('pesquisas').insert(payload)
    const { error } = await q
    if (error) return toast('Erro: '+error.message, 'err')
    closeModal(); toast(x.id ? 'Salvo' : 'Adicionada'); render()
  })
}

// ════════ Helpers ═══════════════════════════════════════════════════════
function attachDelegation() {
  if (_delegado) return
  _delegado = true
  document.getElementById('content').addEventListener('click', e => {
    if (_view === 'lista') {
      const row = e.target.closest('.ps-row')
      if (row) { const x = _pesqs.find(p => p.id === row.dataset.id); if (x) pesqForm(x) }
    } else {
      const card = e.target.closest('.ps-card')
      if (card) { const x = _pesqs.find(p => p.id === card.dataset.id); if (x) pesqForm(x) }
    }
  })
}

function emptyState() {
  return `<div class="empty" style="padding:80px 20px">
    <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhuma pesquisa ainda</div>
    <div style="font-size:12px;margin-bottom:18px">Pipeline pro Hermes preencher todo dia de manhã.<br>Concorrência, tendências, ideias, oportunidades…</div>
    <button class="btn bp" id="ps-first">+ Adicionar primeira</button>
  </div>`
}

function clientesAtivos(currentId) {
  const ativos = new Set(['proposta', 'ativo', 'em_pausa', 'fechado'])
  return _clis.filter(c => ativos.has(c.status) || c.id === currentId)
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]))
}
function escapeAttr(s) { return escapeHtml(s) }
