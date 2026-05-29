// Agenda pessoal — eventos/reuniões/conversas agrupados por data.
// Link opcional pra um cliente já cadastrado (pré-preenche o nome via datalist).
import { db, selectAll } from '../db.js'
import { fmtd, toast, openModal, closeModal } from '../utils.js'

const LOCAL_OPTS = [
  { v: '',            l: '— Sem local —', icon: '' },
  { v: 'google_meet', l: 'Google Meet',   icon: '🎥' },
  { v: 'whatsapp',    l: 'WhatsApp',      icon: '💬' },
  { v: 'telefone',    l: 'Telefone',      icon: '📞' },
  { v: 'presencial',  l: 'Presencial',    icon: '🏢' },
  { v: 'outro',       l: 'Outro',         icon: '📍' },
]
const LOCAL_LABEL = Object.fromEntries(LOCAL_OPTS.map(o => [o.v, o.l]))
const LOCAL_ICON  = Object.fromEntries(LOCAL_OPTS.map(o => [o.v, o.icon]))

const STATUS_OPTS = [
  { v: 'agendado',  l: 'Agendado',  cor: 'var(--accent)' },
  { v: 'realizado', l: 'Realizado', cor: 'var(--ok)' },
  { v: 'cancelado', l: 'Cancelado', cor: 'var(--text-3)' },
]
const STATUS_LABEL = Object.fromEntries(STATUS_OPTS.map(o => [o.v, o.l]))
const STATUS_COR   = Object.fromEntries(STATUS_OPTS.map(o => [o.v, o.cor]))

const DIAS_SEMANA  = ['domingo','segunda','terça','quarta','quinta','sexta','sábado']
const DIAS_ABREV   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MES_ABREV    = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const MES_NOME     = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

let _eventos     = []
let _clientes    = []
let _filtroStatus = 'pendente'  // pendente (agendado), realizado, cancelado, todos
let _filtroBusca  = ''
let _viewMode    = 'lista'      // 'lista' | 'mes'
let _mesView     = null         // Date apontando pro 1º dia do mês mostrado no calendário

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function hojeStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

function formataData(yyyymmdd) {
  if (!yyyymmdd) return ''
  const [y, m, d] = yyyymmdd.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return `${DIAS_SEMANA[dt.getDay()]}, ${String(d).padStart(2, '0')} ${MES_ABREV[m - 1]}`
}

function formataHora(t) {
  if (!t) return ''
  return String(t).slice(0, 5)
}

export async function render() {
  document.getElementById('tbacts').innerHTML =
    `<button class="btn bp" id="btn-add-ev">+ Novo evento</button>`
  document.getElementById('btn-add-ev').addEventListener('click', () => abrirNovo())

  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  const [ev, cl] = await Promise.all([
    selectAll('agenda', { order: { column: 'data', ascending: true } }),
    selectAll('clientes', { columns: 'id, nome, empresa', order: { column: 'nome', ascending: true } }),
  ])
  if (ev.error) {
    c.innerHTML = `<div class="empty">Erro: ${ev.error.message}<br><br>Rode <code>supabase/agenda.sql</code> no SQL Editor primeiro.</div>`
    return
  }
  _eventos  = ev.data || []
  _clientes = cl.data || []
  if (!_mesView) {
    const h = hojeStr().split('-').map(Number)
    _mesView = new Date(h[0], h[1] - 1, 1)
  }
  renderPage()
}

function renderPage() {
  // Filtra
  let lista = _eventos
  if (_filtroStatus === 'pendente')  lista = lista.filter(x => x.status === 'agendado')
  else if (_filtroStatus !== 'todos') lista = lista.filter(x => x.status === _filtroStatus)
  if (_filtroBusca) {
    const q = _filtroBusca.toLowerCase()
    lista = lista.filter(x =>
      (x.titulo || '').toLowerCase().includes(q) ||
      (x.cliente_nome || '').toLowerCase().includes(q) ||
      (x.descricao || '').toLowerCase().includes(q)
    )
  }

  // Agrupa por bucket de data
  const hoje = hojeStr()
  const t = new Date(hoje + 'T00:00:00')
  const amanha = new Date(t); amanha.setDate(t.getDate() + 1)
  const fimSemana = new Date(t); fimSemana.setDate(t.getDate() + 7)
  const amanhaStr = amanha.toLocaleDateString('en-CA')
  const fimSemanaStr = fimSemana.toLocaleDateString('en-CA')

  const buckets = { hoje: [], amanha: [], semana: [], futuro: [], passado: [] }
  for (const ev of lista) {
    const d = String(ev.data || '').slice(0, 10)
    if (!d)                       continue
    else if (d < hoje)            buckets.passado.push(ev)
    else if (d === hoje)          buckets.hoje.push(ev)
    else if (d === amanhaStr)     buckets.amanha.push(ev)
    else if (d <= fimSemanaStr)   buckets.semana.push(ev)
    else                          buckets.futuro.push(ev)
  }
  // Ordena dentro de cada bucket por data+hora
  for (const k of Object.keys(buckets)) {
    buckets[k].sort((a, b) => (a.data + (a.hora_inicio || '99:99')).localeCompare(b.data + (b.hora_inicio || '99:99')))
  }
  // Passados em ordem reversa (mais recente primeiro)
  buckets.passado.reverse()

  const stats = {
    pendente:  _eventos.filter(x => x.status === 'agendado').length,
    realizado: _eventos.filter(x => x.status === 'realizado').length,
    cancelado: _eventos.filter(x => x.status === 'cancelado').length,
  }

  const filtros = [
    { k: 'pendente',  l: `Pendentes (${stats.pendente})` },
    { k: 'realizado', l: `Realizados (${stats.realizado})` },
    { k: 'cancelado', l: `Cancelados (${stats.cancelado})` },
    { k: 'todos',     l: 'Todos' },
  ].map(f => `<div class="fc${_filtroStatus === f.k ? ' on' : ''}" data-fil="${f.k}">${f.l}</div>`).join('')

  const corpo = _viewMode === 'mes'
    ? renderCalendarioMes(lista)
    : `<div id="ag-lista" style="padding:8px 0 12px">
         ${secao('Hoje',          buckets.hoje,    'var(--accent)')}
         ${secao('Amanhã',        buckets.amanha,  'var(--ok)')}
         ${secao('Próximos dias', buckets.semana,  'var(--text-2)')}
         ${secao('Mais à frente', buckets.futuro,  'var(--text-3)')}
         ${secao('Passados',      buckets.passado, 'var(--text-3)', true)}
         ${lista.length === 0 ? '<div class="empty" style="padding:40px 20px">Nada agendado por aqui. Clique em "+ Novo evento" pra começar.</div>' : ''}
       </div>`

  const c = document.getElementById('content')
  c.innerHTML = `
    <div class="tw">
      <div class="th" style="flex-wrap:wrap;gap:10px">
        <h3>Agenda</h3>
        <div style="display:flex;gap:6px">
          <button class="btn ${_viewMode === 'lista' ? 'bp' : 'bg'} bsm" data-view="lista">Lista</button>
          <button class="btn ${_viewMode === 'mes' ? 'bp' : 'bg'} bsm" data-view="mes">Calendário</button>
        </div>
        <input class="si" id="ag-search" placeholder="Buscar por título, cliente ou nota..." value="${esc(_filtroBusca)}">
      </div>
      <div class="fr" id="ag-filters">${filtros}</div>
      ${corpo}
    </div>`

  document.getElementById('ag-search').addEventListener('input', e => { _filtroBusca = e.target.value; renderPage() })
  document.getElementById('ag-filters').addEventListener('click', e => {
    const fil = e.target.closest('.fc')
    if (fil) { _filtroStatus = fil.dataset.fil; renderPage() }
  })
  c.querySelectorAll('[data-view]').forEach(btn =>
    btn.addEventListener('click', () => { _viewMode = btn.dataset.view; renderPage() })
  )
  c.querySelectorAll('.ev-card').forEach(card =>
    card.addEventListener('click', () => abrirEdicao(card.dataset.id))
  )
  // Calendário: nav + clicks
  const navPrev  = document.getElementById('cal-prev')
  const navNext  = document.getElementById('cal-next')
  const navHoje  = document.getElementById('cal-hoje')
  if (navPrev) navPrev.addEventListener('click', () => { _mesView = new Date(_mesView.getFullYear(), _mesView.getMonth() - 1, 1); renderPage() })
  if (navNext) navNext.addEventListener('click', () => { _mesView = new Date(_mesView.getFullYear(), _mesView.getMonth() + 1, 1); renderPage() })
  if (navHoje) navHoje.addEventListener('click', () => {
    const h = hojeStr().split('-').map(Number)
    _mesView = new Date(h[0], h[1] - 1, 1); renderPage()
  })
  c.querySelectorAll('.cal-chip').forEach(chip =>
    chip.addEventListener('click', e => { e.stopPropagation(); abrirEdicao(chip.dataset.id) })
  )
  c.querySelectorAll('.cal-cell[data-data]').forEach(cell =>
    cell.addEventListener('click', () => abrirNovo(cell.dataset.data))
  )
}

// ── Calendário (grade do mês) ────────────────────────────────────────────────

function renderCalendarioMes(eventos) {
  const ano   = _mesView.getFullYear()
  const mes   = _mesView.getMonth()   // 0-11
  const hoje  = hojeStr()

  // Agrupa eventos por data (YYYY-MM-DD) — só os do mês visualizado e adjacentes
  const porData = {}
  for (const ev of eventos) {
    const d = String(ev.data || '').slice(0, 10)
    if (!d) continue
    if (!porData[d]) porData[d] = []
    porData[d].push(ev)
  }

  // 1º dia do mês e quantos dias tem
  const primeiro = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0).getDate()
  // Quantos dias do mês anterior aparecem (Domingo = 0)
  const padInicio = primeiro.getDay()
  // Total de células: múltiplo de 7 que cubra padInicio + ultimoDia
  const totalCelulas = Math.ceil((padInicio + ultimoDia) / 7) * 7

  const celulas = []
  for (let i = 0; i < totalCelulas; i++) {
    const offset = i - padInicio
    const dt = new Date(ano, mes, offset + 1)
    const dStr = ymd(dt)
    const inMes = dt.getMonth() === mes
    const isHoje = dStr === hoje
    const evs = (porData[dStr] || []).sort((a, b) =>
      (a.hora_inicio || '99:99').localeCompare(b.hora_inicio || '99:99')
    )

    const chips = evs.slice(0, 3).map(ev => {
      const cor = STATUS_COR[ev.status] || 'var(--accent)'
      const h = formataHora(ev.hora_inicio)
      const label = (h ? h + ' ' : '') + (ev.titulo || '')
      return `<div class="cal-chip" data-id="${ev.id}" style="background:${cor}22;color:${cor};border-left:2px solid ${cor};padding:2px 5px;border-radius:3px;font-size:10px;line-height:1.3;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" title="${esc(ev.titulo)}">${esc(label)}</div>`
    }).join('')
    const overflow = evs.length > 3 ? `<div style="font-size:9px;color:var(--text-3);padding:0 5px">+${evs.length - 3} mais</div>` : ''

    celulas.push(`
      <div class="cal-cell" ${inMes ? `data-data="${dStr}"` : ''} style="
        background:${isHoje ? 'rgba(193,255,42,.08)' : 'var(--bg-card)'};
        min-height:96px;padding:5px 5px 4px;cursor:${inMes ? 'pointer' : 'default'};
        ${isHoje ? 'box-shadow:inset 2px 0 0 var(--accent);' : ''}
        ${!inMes ? 'opacity:.32;' : ''}
        display:flex;flex-direction:column;gap:2px;overflow:hidden;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:${isHoje ? 'var(--accent)' : 'var(--text-3)'};font-weight:${isHoje ? '700' : '500'};margin-bottom:3px">
          <span>${dt.getDate()}</span>
          ${evs.length ? `<span style="font-size:9px;color:var(--text-3)">${evs.length}</span>` : ''}
        </div>
        ${chips}${overflow}
      </div>`)
  }

  const hdr = DIAS_ABREV.map(d =>
    `<div style="background:var(--bg-card);padding:8px 5px;font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:.1em;text-align:center;font-weight:600">${d}</div>`
  ).join('')

  return `
    <div style="padding:14px 18px 6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <h3 style="margin:0;font-size:16px">${MES_NOME[mes]} ${ano}</h3>
      <div style="display:flex;gap:4px;margin-left:auto">
        <button class="btn bg bsm" id="cal-hoje">Hoje</button>
        <button class="btn bg bsm" id="cal-prev" style="padding:4px 10px">‹</button>
        <button class="btn bg bsm" id="cal-next" style="padding:4px 10px">›</button>
      </div>
    </div>
    <div style="padding:0 14px 16px">
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:6px;overflow:hidden">
        ${hdr}
        ${celulas.join('')}
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:8px">Clique numa célula vazia pra criar um evento naquela data, ou num evento pra editar.</div>
    </div>`
}

function ymd(dt) {
  const pad = n => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}

function secao(titulo, eventos, cor, isPassado = false) {
  if (!eventos.length) return ''
  return `
    <div style="margin:14px 0 8px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 18px;font-size:11px;font-weight:600;color:${cor};text-transform:uppercase;letter-spacing:.1em">
        <span>${titulo}</span>
        <span style="font-weight:400;opacity:.5">· ${eventos.length}</span>
        <span style="flex:1;height:1px;background:var(--line);margin-left:4px"></span>
      </div>
      ${eventos.map(ev => cardEvento(ev, isPassado)).join('')}
    </div>`
}

function cardEvento(ev, fade = false) {
  const horaIni = formataHora(ev.hora_inicio)
  const horaFim = formataHora(ev.hora_fim)
  const horaStr = horaIni && horaFim ? `${horaIni} – ${horaFim}` : (horaIni || (fade ? '' : '— sem hora —'))
  const localIcon = LOCAL_ICON[ev.local] || ''
  const dataFmt = formataData(String(ev.data).slice(0, 10))
  const cliente = ev.cliente_nome ? `<span style="color:var(--text-2);font-size:12px"> · com ${esc(ev.cliente_nome)}</span>` : ''
  const corStatus = STATUS_COR[ev.status] || 'var(--text-3)'
  const status = ev.status && ev.status !== 'agendado'
    ? `<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:${corStatus}22;color:${corStatus};text-transform:uppercase;letter-spacing:.06em;flex-shrink:0">${STATUS_LABEL[ev.status]}</span>`
    : ''

  return `
    <div class="ev-card" data-id="${ev.id}" style="margin:0 12px 6px;padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:var(--bg-card);cursor:pointer;display:flex;gap:14px;align-items:flex-start;${fade ? 'opacity:.55' : ''}">
      <div style="min-width:62px;font-size:11px;color:var(--text-3);line-height:1.4">
        <div style="color:var(--text-2);font-weight:600">${horaStr || '—'}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-top:1px">${dataFmt}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:500;color:var(--text)">
          ${localIcon ? `<span style="font-size:14px">${localIcon}</span>` : ''}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(ev.titulo)}</span>
          ${status}
        </div>
        ${ev.cliente_nome || ev.local ? `<div style="font-size:11px;color:var(--text-3);margin-top:2px">${ev.local ? esc(LOCAL_LABEL[ev.local] || ev.local) : ''}${cliente}</div>` : ''}
        ${ev.descricao ? `<div style="font-size:12px;color:var(--text-2);margin-top:5px;line-height:1.45">${esc(ev.descricao)}</div>` : ''}
      </div>
    </div>`
}

// ── Formulário ──────────────────────────────────────────────────────────────

function eventoForm(ev = {}) {
  const dataDefault = ev.data || hojeStr()
  const statusOpts = STATUS_OPTS.map(o => `<option value="${o.v}"${(ev.status || 'agendado') === o.v ? ' selected' : ''}>${o.l}</option>`).join('')
  const localOpts  = LOCAL_OPTS.map(o => `<option value="${o.v}"${(ev.local || '') === o.v ? ' selected' : ''}>${o.icon} ${o.l}</option>`).join('')
  const clientesDatalist = _clientes.map(c =>
    `<option value="${esc(c.nome)}${c.empresa ? ' · ' + esc(c.empresa) : ''}"></option>`
  ).join('')

  return `
    <div class="fg"><label class="fl">Título *</label>
      <input class="fi" id="ev-titulo" value="${esc(ev.titulo)}" placeholder="Ex: Conversa com Pedro sobre marmoraria">
    </div>

    <div class="fg"><label class="fl">Cliente (opcional)</label>
      <input class="fi" id="ev-cliente" value="${esc(ev.cliente_nome)}" placeholder="Digite ou escolha da lista..." list="ev-clientes-list" autocomplete="off">
      <datalist id="ev-clientes-list">${clientesDatalist}</datalist>
      <span style="font-size:11px;color:var(--text-3);margin-top:4px">Se for um cliente já cadastrado, escolha pra linkar.</span>
    </div>

    <div class="frow">
      <div class="fg"><label class="fl">Data *</label><input class="fi" id="ev-data" type="date" value="${dataDefault}"></div>
      <div class="fg"><label class="fl">Hora início</label><input class="fi" id="ev-hi" type="time" value="${formataHora(ev.hora_inicio)}"></div>
      <div class="fg"><label class="fl">Hora fim</label><input class="fi" id="ev-hf" type="time" value="${formataHora(ev.hora_fim)}"></div>
    </div>

    <div class="frow">
      <div class="fg"><label class="fl">Local</label><select class="fsl" id="ev-local">${localOpts}</select></div>
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="ev-status">${statusOpts}</select></div>
    </div>

    <div class="fg"><label class="fl">Descrição / pauta</label>
      <textarea class="fta" id="ev-desc" placeholder="O que vão tratar, links de reunião, contexto rápido...">${esc(ev.descricao)}</textarea>
    </div>

    <div class="fg"><label class="fl">Notas internas</label>
      <textarea class="fta" id="ev-notas">${esc(ev.notas)}</textarea>
    </div>`
}

function abrirNovo(dataPreFill) {
  openModal('Novo evento', eventoForm(dataPreFill ? { data: dataPreFill } : {}),
    `<button class="btn bg" id="ev-cancel">Cancelar</button>
     <button class="btn bp" id="ev-save">Salvar</button>`)
  document.getElementById('ev-cancel').addEventListener('click', closeModal)
  document.getElementById('ev-save').addEventListener('click', () => salvar())
}

function abrirEdicao(id) {
  const ev = _eventos.find(x => x.id === id)
  if (!ev) return
  openModal('Editar evento', eventoForm(ev),
    `<button class="btn bg" id="ev-cancel">Cancelar</button>
     <button class="btn bd" id="ev-del">Remover</button>
     <button class="btn bp" id="ev-save">Salvar</button>`)
  document.getElementById('ev-cancel').addEventListener('click', closeModal)
  document.getElementById('ev-del').addEventListener('click', () => remover(id))
  document.getElementById('ev-save').addEventListener('click', () => salvar(id))
}

function lerForm() {
  const v = id => document.getElementById(id).value
  const titulo  = v('ev-titulo').trim()
  const data    = v('ev-data')
  const hi      = v('ev-hi') || null
  const hf      = v('ev-hf') || null
  const clienteRaw = v('ev-cliente').trim()
  // Tenta casar com cliente existente (formato "Nome · Empresa" do datalist)
  let cliente_id = null
  let cliente_nome = clienteRaw || null
  if (clienteRaw) {
    const nomePart = clienteRaw.split('·')[0].trim().toLowerCase()
    const match = _clientes.find(c => (c.nome || '').toLowerCase() === nomePart)
    if (match) { cliente_id = match.id; cliente_nome = match.nome }
  }
  return {
    titulo,
    data,
    hora_inicio: hi,
    hora_fim:    hf,
    cliente_id,
    cliente_nome,
    local:       v('ev-local') || null,
    status:      v('ev-status'),
    descricao:   v('ev-desc').trim() || null,
    notas:       v('ev-notas').trim() || null,
    atualizado_em: new Date().toISOString(),
  }
}

async function salvar(id) {
  const d = lerForm()
  if (!d.titulo) { toast('Título obrigatório.', 'er'); return }
  if (!d.data)   { toast('Data obrigatória.', 'er'); return }
  const { error } = id
    ? await db.from('agenda').update(d).eq('id', id)
    : await db.from('agenda').insert(d)
  if (error) { toast('Erro: ' + error.message, 'er'); return }
  toast(id ? 'Evento atualizado.' : 'Evento criado.')
  closeModal()
  render()
}

async function remover(id) {
  if (!confirm('Remover este evento?')) return
  const { error } = await db.from('agenda').delete().eq('id', id)
  if (error) { toast('Erro ao remover: ' + error.message, 'er'); return }
  toast('Removido.')
  closeModal()
  render()
}
