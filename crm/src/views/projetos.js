import { db, selectAll } from '../db.js'
import { fmtd, toast, openModal, closeModal } from '../utils.js'

const COLS = [
  { k: 'todo',   l: 'A fazer',  cor: '#A0A0A0' },
  { k: 'doing',  l: 'Fazendo',  cor: '#4A9EFF' },
  { k: 'review', l: 'Revisão',  cor: '#F5A623' },
  { k: 'done',   l: 'Feito',    cor: '#34D399' },
]

const PRIOS = [
  { k: 'baixa',   l: 'Baixa',   cor: '#A0A0A0' },
  { k: 'media',   l: 'Média',   cor: '#4A9EFF' },
  { k: 'alta',    l: 'Alta',    cor: '#F5A623' },
  { k: 'urgente', l: 'Urgente', cor: '#FF5C5C' },
]
const PRIO_MAP = Object.fromEntries(PRIOS.map(p => [p.k, p]))

const CORES = ['#C5F82A', '#4A9EFF', '#A78BFA', '#F5A623', '#34D399', '#FF5C5C', '#EC4899', '#06B6D4']

let _projs = []
let _clis  = []
let _tars  = []
let _subs  = []
let _curProj = null     // id do projeto aberto
let _mode  = 'kanban'   // kanban | lista

export async function render() {
  document.getElementById('tbacts').innerHTML =
    `<button class="btn bg" id="btn-mode">Lista</button>
     <button class="btn bp" id="btn-add-proj">+ Novo projeto</button>`
  document.getElementById('btn-add-proj').addEventListener('click', () => projForm())
  document.getElementById('btn-mode').addEventListener('click', () => {
    _mode = _mode === 'kanban' ? 'lista' : 'kanban'
    document.getElementById('btn-mode').textContent = _mode === 'kanban' ? 'Lista' : 'Kanban'
    renderBody()
  })

  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  const [p, cli, t, s] = await Promise.all([
    selectAll('projetos', { order: { column: 'criado_em', ascending: false } }),
    selectAll('clientes', { columns: 'id,nome,empresa', order: { column: 'nome', ascending: true } }),
    selectAll('tarefas',  { order: { column: 'ordem', ascending: true } }),
    selectAll('tarefa_subtasks', { order: { column: 'ordem', ascending: true } }),
  ])
  if (p.error)   { c.innerHTML = `<div class="empty">Erro: ${p.error.message}</div>`; return }
  _projs = p.data || []
  _clis  = cli.data || []
  _tars  = t.data || []
  _subs  = s.data || []

  if (_curProj && !_projs.find(x => x.id === _curProj)) _curProj = null
  if (!_curProj && _projs.length) _curProj = _projs[0].id

  renderBody()
}

function renderBody() {
  const c = document.getElementById('content')

  if (!_projs.length) {
    c.innerHTML = `<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Nenhum projeto ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Crie seu primeiro projeto pra começar a organizar tarefas.</div>
      <button class="btn bp" id="btn-add-first">+ Criar projeto</button>
    </div>`
    document.getElementById('btn-add-first').addEventListener('click', () => projForm())
    return
  }

  const sidebar = _projs.map(p => {
    const cli = _clis.find(x => x.id === p.cliente_id)
    const totT = _tars.filter(t => t.projeto_id === p.id).length
    const doneT = _tars.filter(t => t.projeto_id === p.id && t.status === 'done').length
    return `<div class="pj-side ${p.id === _curProj ? 'on' : ''}" data-pid="${p.id}">
      <div class="pj-side-dot" style="background:${p.cor || '#C5F82A'}"></div>
      <div class="pj-side-body">
        <div class="pj-side-name">${escapeHtml(p.nome)}</div>
        <div class="pj-side-meta">${cli ? escapeHtml(cli.empresa || cli.nome) : 'Interno'} · ${doneT}/${totT}</div>
      </div>
    </div>`
  }).join('')

  c.innerHTML = `<div class="pj-wrap">
    <div class="pj-sidebar">
      <div class="pj-sidebar-head">Projetos <span style="color:var(--text-3);font-weight:400">(${_projs.length})</span></div>
      <div class="pj-sidebar-list">${sidebar}</div>
    </div>
    <div class="pj-main" id="pj-main"></div>
  </div>`

  c.querySelector('.pj-sidebar-list').addEventListener('click', e => {
    const item = e.target.closest('.pj-side')
    if (item) { _curProj = item.dataset.pid; renderBody() }
  })

  renderMain()
}

function renderMain() {
  const proj = _projs.find(p => p.id === _curProj)
  if (!proj) return
  const cli = _clis.find(x => x.id === proj.cliente_id)
  const tars = _tars.filter(t => t.projeto_id === proj.id)

  const head = `<div class="pj-head">
    <div class="pj-head-left">
      <div class="pj-head-dot" style="background:${proj.cor || '#C5F82A'}"></div>
      <div>
        <div class="pj-head-name">${escapeHtml(proj.nome)}</div>
        <div class="pj-head-meta">
          ${cli ? `<span>${escapeHtml(cli.empresa || cli.nome)}</span>` : '<span>Interno</span>'}
          ${proj.prazo ? ` · <span>Prazo ${fmtd(proj.prazo)}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="pj-head-acts">
      <button class="btn bg bsm" id="pj-edit">Editar</button>
      <button class="btn bd bsm" id="pj-del">Excluir</button>
      <button class="btn bp" id="pj-add-tar">+ Tarefa</button>
    </div>
  </div>`

  const body = _mode === 'kanban' ? renderKanban(tars) : renderLista(tars)

  document.getElementById('pj-main').innerHTML = head + body

  document.getElementById('pj-edit').addEventListener('click', () => projForm(proj))
  document.getElementById('pj-del').addEventListener('click', () => delProj(proj))
  document.getElementById('pj-add-tar').addEventListener('click', () => tarForm({ projeto_id: proj.id, status: 'todo' }))

  wireKanbanInteractions()
}

function renderKanban(tars) {
  const cols = COLS.map(col => {
    const cards = tars.filter(t => t.status === col.k)
    const cardHTML = cards.length
      ? cards.map(t => taskCard(t)).join('')
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

  return `<div class="pj-kanban">${cols}</div>`
}

function renderLista(tars) {
  if (!tars.length) return `<div class="empty" style="padding:40px">Sem tarefas neste projeto.</div>`
  const sorted = [...tars].sort((a, b) => {
    const ord = ['todo','doing','review','done']
    return ord.indexOf(a.status) - ord.indexOf(b.status) || (a.prazo || '').localeCompare(b.prazo || '')
  })
  const rows = sorted.map(t => {
    const subs = _subs.filter(s => s.tarefa_id === t.id)
    const done = subs.filter(s => s.feito).length
    return `<tr class="pj-row" data-tid="${t.id}">
      <td>${statusPill(t.status)}</td>
      <td class="pj-row-title">${escapeHtml(t.titulo)}${subs.length ? `<span class="pj-sub-chip">${done}/${subs.length}</span>` : ''}</td>
      <td>${prioPill(t.prioridade)}</td>
      <td class="tm">${prazoChip(t.prazo)}</td>
      <td><button class="btn bd bsm bic del-tar" data-tid="${t.id}">×</button></td>
    </tr>`
  }).join('')
  return `<div class="tw" style="margin-top:14px">
    <table>
      <thead><tr><th>Status</th><th>Tarefa</th><th>Prio</th><th>Prazo</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`
}

function taskCard(t) {
  const subs = _subs.filter(s => s.tarefa_id === t.id)
  const done = subs.filter(s => s.feito).length
  const prio = PRIO_MAP[t.prioridade] || PRIO_MAP.media
  return `<div class="pj-card" draggable="true" data-tid="${t.id}">
    <div class="pj-card-top">
      <div class="pj-card-prio" style="background:${prio.cor}"></div>
      <div class="pj-card-title">${escapeHtml(t.titulo)}</div>
    </div>
    ${t.descricao ? `<div class="pj-card-desc">${escapeHtml(t.descricao).slice(0,80)}${t.descricao.length>80?'…':''}</div>` : ''}
    <div class="pj-card-foot">
      ${prazoChip(t.prazo)}
      ${subs.length ? `<span class="pj-sub-chip">${done}/${subs.length}</span>` : ''}
    </div>
  </div>`
}

function statusPill(s) {
  const col = COLS.find(c => c.k === s) || COLS[0]
  return `<span class="pj-pill" style="background:${col.cor}22;color:${col.cor}">${col.l}</span>`
}

function prioPill(p) {
  const prio = PRIO_MAP[p] || PRIO_MAP.media
  return `<span class="pj-pill" style="background:${prio.cor}22;color:${prio.cor}">${prio.l}</span>`
}

function prazoChip(prazo) {
  if (!prazo) return ''
  const d = new Date(prazo + 'T00:00:00')
  const hoje = new Date(); hoje.setHours(0,0,0,0)
  const diff = Math.round((d - hoje) / 86400000)
  let cls = 'pj-prazo'
  if (diff < 0)       cls += ' late'
  else if (diff <= 2) cls += ' soon'
  return `<span class="${cls}">${fmtd(prazo)}</span>`
}

// ── Drag & drop entre colunas ───────────────────────────
function wireKanbanInteractions() {
  const main = document.getElementById('pj-main')
  if (!main) return

  // Click no card → abrir
  main.addEventListener('click', e => {
    const card = e.target.closest('.pj-card')
    const row  = e.target.closest('.pj-row')
    const del  = e.target.closest('.del-tar')
    if (del) {
      e.stopPropagation()
      const t = _tars.find(x => x.id === del.dataset.tid)
      if (t && confirm(`Excluir "${t.titulo}"?`)) delTar(t.id)
      return
    }
    if (card) { const t = _tars.find(x => x.id === card.dataset.tid); if (t) tarForm(t) }
    else if (row) { const t = _tars.find(x => x.id === row.dataset.tid); if (t) tarForm(t) }
  })

  let dragged = null
  main.querySelectorAll('.pj-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      dragged = card.dataset.tid
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
      e.preventDefault()
      drop.classList.remove('over')
      if (!dragged) return
      const newStatus = drop.dataset.drop
      const tar = _tars.find(t => t.id === dragged)
      if (!tar || tar.status === newStatus) return
      tar.status = newStatus
      const { error } = await db.from('tarefas').update({
        status: newStatus, atualizado_em: new Date().toISOString(),
      }).eq('id', dragged)
      if (error) { toast('Erro: ' + error.message, 'err'); return }
      renderMain()
    })
  })
}

// ─── FORM PROJETO ───────────────────────────────────────
function projForm(p = {}) {
  const cliOpts = `<option value="">— sem cliente (interno) —</option>` +
    _clis.map(c => `<option value="${c.id}"${p.cliente_id===c.id?' selected':''}>${escapeHtml(c.empresa || c.nome)}</option>`).join('')
  const corOpts = CORES.map(c => `<span class="pj-cor-opt${(p.cor||CORES[0])===c?' on':''}" data-cor="${c}" style="background:${c}"></span>`).join('')

  openModal(p.id ? 'Editar projeto' : 'Novo projeto', `
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="pj-nome" value="${escapeAttr(p.nome || '')}" placeholder="Ex: Site Desjoyaux"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="pj-desc" rows="2" placeholder="Resumo do projeto">${escapeHtml(p.descricao || '')}</textarea></div>
    <div class="frow">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="pj-cli">${cliOpts}</select></div>
      <div class="fg"><label class="fl">Prazo</label><input class="fi" type="date" id="pj-prazo" value="${p.prazo || ''}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Cor</label>
      <div class="pj-cor-row" id="pj-cor-row">${corOpts}</div></div>
  `, `
    <button class="btn bg" id="pj-cancel">Cancelar</button>
    <button class="btn bp" id="pj-save">${p.id ? 'Salvar' : 'Criar'}</button>
  `)

  let cor = p.cor || CORES[0]
  document.getElementById('pj-cor-row').addEventListener('click', e => {
    const opt = e.target.closest('.pj-cor-opt')
    if (!opt) return
    cor = opt.dataset.cor
    document.querySelectorAll('.pj-cor-opt').forEach(el => el.classList.toggle('on', el.dataset.cor === cor))
  })
  document.getElementById('pj-cancel').addEventListener('click', closeModal)
  document.getElementById('pj-save').addEventListener('click', async () => {
    const payload = {
      nome: document.getElementById('pj-nome').value.trim(),
      descricao: document.getElementById('pj-desc').value.trim() || null,
      cliente_id: document.getElementById('pj-cli').value || null,
      prazo: document.getElementById('pj-prazo').value || null,
      cor,
      atualizado_em: new Date().toISOString(),
    }
    if (!payload.nome) return toast('Nome é obrigatório', 'err')
    const q = p.id
      ? db.from('projetos').update(payload).eq('id', p.id)
      : db.from('projetos').insert(payload).select().single()
    const { data, error } = await q
    if (error) return toast('Erro: ' + error.message, 'err')
    if (!p.id && data) _curProj = data.id
    closeModal()
    toast(p.id ? 'Projeto salvo' : 'Projeto criado')
    render()
  })
}

async function delProj(p) {
  if (!confirm(`Excluir o projeto "${p.nome}" e TODAS as tarefas dele?`)) return
  const { error } = await db.from('projetos').delete().eq('id', p.id)
  if (error) return toast('Erro: ' + error.message, 'err')
  _curProj = null
  toast('Projeto excluído')
  render()
}

// ─── FORM TAREFA ────────────────────────────────────────
function tarForm(t = {}) {
  const isNew = !t.id
  const statusOpts = COLS.map(c => `<option value="${c.k}"${(t.status||'todo')===c.k?' selected':''}>${c.l}</option>`).join('')
  const prioOpts   = PRIOS.map(p => `<option value="${p.k}"${(t.prioridade||'media')===p.k?' selected':''}>${p.l}</option>`).join('')
  const subs = isNew ? [] : _subs.filter(s => s.tarefa_id === t.id)

  openModal(isNew ? 'Nova tarefa' : 'Editar tarefa', `
    <div class="fg" style="margin-bottom:11px"><label class="fl">Título *</label>
      <input class="fi" id="tr-titulo" value="${escapeAttr(t.titulo || '')}" placeholder="O que precisa ser feito?"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="tr-desc" rows="3" placeholder="Detalhes, contexto, links...">${escapeHtml(t.descricao || '')}</textarea></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="tr-status">${statusOpts}</select></div>
      <div class="fg"><label class="fl">Prioridade</label><select class="fsl" id="tr-prio">${prioOpts}</select></div>
    </div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Prazo</label>
      <input class="fi" type="date" id="tr-prazo" value="${t.prazo || ''}"></div>
    <div class="fg">
      <label class="fl">Checklist</label>
      <div id="tr-subs" class="pj-subs">
        ${subs.map(s => subRow(s.id, s.texto, s.feito)).join('')}
      </div>
      <div style="display:flex;gap:6px;margin-top:6px">
        <input class="fi" id="tr-sub-new" placeholder="+ adicionar item" style="flex:1">
        <button class="btn bg bsm" id="tr-sub-add">Add</button>
      </div>
    </div>
  `, `
    ${isNew ? '' : '<button class="btn bd" id="tr-del">Excluir</button>'}
    <button class="btn bg" id="tr-cancel">Cancelar</button>
    <button class="btn bp" id="tr-save">${isNew ? 'Criar' : 'Salvar'}</button>
  `)

  document.getElementById('tr-sub-add').addEventListener('click', () => {
    const inp = document.getElementById('tr-sub-new')
    const v = inp.value.trim()
    if (!v) return
    const tmpId = 'new-' + Math.random().toString(36).slice(2)
    document.getElementById('tr-subs').insertAdjacentHTML('beforeend', subRow(tmpId, v, false))
    inp.value = ''
    inp.focus()
  })
  document.getElementById('tr-sub-new').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('tr-sub-add').click() }
  })
  document.getElementById('tr-subs').addEventListener('click', e => {
    const del = e.target.closest('.pj-sub-del')
    if (del) del.closest('.pj-sub-row').remove()
  })
  document.getElementById('tr-cancel').addEventListener('click', closeModal)
  if (!isNew) document.getElementById('tr-del').addEventListener('click', async () => {
    if (!confirm(`Excluir "${t.titulo}"?`)) return
    await delTar(t.id)
    closeModal()
  })
  document.getElementById('tr-save').addEventListener('click', async () => {
    const payload = {
      projeto_id: t.projeto_id || _curProj,
      titulo: document.getElementById('tr-titulo').value.trim(),
      descricao: document.getElementById('tr-desc').value.trim() || null,
      status: document.getElementById('tr-status').value,
      prioridade: document.getElementById('tr-prio').value,
      prazo: document.getElementById('tr-prazo').value || null,
      atualizado_em: new Date().toISOString(),
    }
    if (!payload.titulo) return toast('Título é obrigatório', 'err')

    let tarId = t.id
    if (isNew) {
      const { data, error } = await db.from('tarefas').insert(payload).select().single()
      if (error) return toast('Erro: ' + error.message, 'err')
      tarId = data.id
    } else {
      const { error } = await db.from('tarefas').update(payload).eq('id', tarId)
      if (error) return toast('Erro: ' + error.message, 'err')
    }

    // Sync subtasks
    const formRows = [...document.querySelectorAll('.pj-sub-row')]
    const existing = isNew ? [] : _subs.filter(s => s.tarefa_id === tarId)
    const keepIds = new Set()
    let ord = 0
    for (const row of formRows) {
      const id = row.dataset.sid
      const texto = row.querySelector('.pj-sub-text').value.trim()
      const feito = row.querySelector('.pj-sub-cb').checked
      if (!texto) continue
      if (id.startsWith('new-')) {
        await db.from('tarefa_subtasks').insert({ tarefa_id: tarId, texto, feito, ordem: ord++ })
      } else {
        keepIds.add(id)
        await db.from('tarefa_subtasks').update({ texto, feito, ordem: ord++ }).eq('id', id)
      }
    }
    for (const s of existing) {
      if (!keepIds.has(s.id)) await db.from('tarefa_subtasks').delete().eq('id', s.id)
    }

    closeModal()
    toast(isNew ? 'Tarefa criada' : 'Tarefa salva')
    render()
  })
}

function subRow(id, texto, feito) {
  return `<div class="pj-sub-row" data-sid="${id}">
    <input type="checkbox" class="pj-sub-cb" ${feito ? 'checked' : ''}>
    <input type="text" class="pj-sub-text fi" value="${escapeAttr(texto)}" style="flex:1">
    <button class="pj-sub-del" type="button" title="Remover">×</button>
  </div>`
}

async function delTar(id) {
  const { error } = await db.from('tarefas').delete().eq('id', id)
  if (error) return toast('Erro: ' + error.message, 'err')
  toast('Tarefa excluída')
  render()
}

// ─── Helpers ────────────────────────────────────────────
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]))
}
function escapeAttr(s) { return escapeHtml(s) }
