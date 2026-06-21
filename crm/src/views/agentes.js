import { db, CFG } from '../db.js'
import { toast, openModal, closeModal, CANAIS } from '../utils.js'

let _ag = []
let _convs = []
let _msgs = []
let _testing = false

// ── Ícones (todos com width/height inline — bombproof contra cache de CSS) ─────
const ICON_BOT   = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8" width="17" height="11.5" rx="2.5"/><path d="M12 8V4.5"/><circle cx="12" cy="3" r="1.3"/><path d="M8.5 13v1.5M15.5 13v1.5"/><path d="M1.5 13v3M22.5 13v3"/></svg>`
const ICON_BOT_LG= `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8" width="17" height="11.5" rx="2.5"/><path d="M12 8V4.5"/><circle cx="12" cy="3" r="1.3"/><path d="M8.5 13v1.5M15.5 13v1.5"/><path d="M1.5 13v3M22.5 13v3"/></svg>`
const ICON_WA    = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.78.98-.95 1.18-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.62.71.22 1.36.19 1.87.12.57-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.07-.13-.27-.2-.57-.35zM12 2C6.6 2 2.1 6.45 2.1 11.91c0 1.75.45 3.46 1.32 4.96L2 22l5.25-1.38c1.45.79 3.08 1.2 4.74 1.2 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.8 9.8 0 0 0 12 2z"/></svg>`
const ICON_IG    = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".9" fill="currentColor" stroke="none"/></svg>`
const ICON_TG    = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6l-.4 4.5c.6 0 .8-.3 1.1-.6l2.6-2.5 5.4 4c1 .5 1.7.3 2-.9l3.5-16.4c.3-1.4-.5-2-1.5-1.6L2.5 9.3c-1.4.6-1.4 1.4-.3 1.7l5 1.6L18.7 5.5c.6-.4 1.1-.2.7.2"/></svg>`
const ICON_MAIL  = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>`
const ICON_SITE  = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`

const ICON_TRASH = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>`
const ICON_EDIT  = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>`
const ICON_PLAY  = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
const ICON_PAUSE = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
const ICON_TEST  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 1 1 16.1-3.8z"/></svg>`
const ICON_SEND  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`

const IC_BACK   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`
const IC_USERS  = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
const IC_CHAT   = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
const IC_PULSE  = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
const IC_CLOCK  = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
const IC_TARGET = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
))

function tempoRel(iso) {
  if (!iso) return ''
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d < 30) return `há ${d}d`
  return new Date(iso).toLocaleDateString('pt-BR')
}

const AV_CORES = ['#4A9EFF', '#A78BFA', '#34D399', '#F5A623', '#FF6B9D', '#22D3EE']
function corAvatar(s) {
  let h = 0
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AV_CORES[h % AV_CORES.length]
}

// Ícone do canal — usado nos cards
function iconeCanal(c) {
  const canal = String(c || '').toLowerCase()
  if (canal.includes('whatsapp')) return ICON_WA
  if (canal.includes('instagram')) return ICON_IG
  if (canal.includes('telegram')) return ICON_TG
  if (canal.includes('email')) return ICON_MAIL
  if (canal.includes('site')) return ICON_SITE
  return ICON_BOT
}

function corCanal(c) {
  const canal = String(c || '').toLowerCase()
  if (canal.includes('whatsapp')) return '#25D366'
  if (canal.includes('instagram')) return '#E1306C'
  if (canal.includes('telegram')) return '#229ED9'
  if (canal.includes('email')) return '#F5A623'
  if (canal.includes('site')) return '#A78BFA'
  return 'var(--accent)'
}

// ════════════════════════════════════════════════════════════════
//   AGREGADOS GERAIS — usados no header da lista
// ════════════════════════════════════════════════════════════════

async function carregarAgregados() {
  const [conv, msg] = await Promise.all([
    db.from('chatbot_conversations').select('phone, messages, stage, updated_at'),
    db.from('mensagens').select('id, created_at', { count: 'exact' }).gte('created_at', new Date(Date.now() - 24*3600*1000).toISOString())
  ])
  _convs = conv.data || []
  _msgs  = msg.data || []
  return { msgsHoje: msg.count || _msgs.length }
}

// ════════════════════════════════════════════════════════════════
//   LISTA DE AGENTES (com header de métricas agregadas)
// ════════════════════════════════════════════════════════════════
export async function render() {
  document.getElementById('tbacts').innerHTML =
    `<button class="btn bp" id="btn-add-ag">+ Novo agente</button>`
  document.getElementById('btn-add-ag').addEventListener('click', addAgente)

  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando agentes...</div>'

  const [{ data, error }, agreg] = await Promise.all([
    db.from('agentes').select('*').order('criado_em', { ascending: false }),
    carregarAgregados(),
  ])
  if (error) { c.innerHTML = `<div class="empty">Erro: ${error.message}</div>`; return }
  _ag = data || []

  const ativos = _ag.filter(a => a.status === 'ativo').length
  const corte7 = Date.now() - 7*24*3600*1000
  const ativas7d = _convs.filter(x =>
    !['opt_out','pausado'].includes(x.stage) &&
    x.updated_at && new Date(x.updated_at).getTime() > corte7
  ).length

  const headerStats = `
    <div class="ag-hero">
      <div class="ag-hero-st">
        <div class="ag-hero-ic" style="background:rgba(193,255,42,.10);color:var(--accent)">${ICON_BOT}</div>
        <div>
          <div class="ag-hero-v">${ativos}<span class="ag-hero-tot">/${_ag.length}</span></div>
          <div class="ag-hero-l">Agentes ativos</div>
        </div>
      </div>
      <div class="ag-hero-st">
        <div class="ag-hero-ic" style="background:rgba(74,158,255,.10);color:var(--info)">${IC_USERS}</div>
        <div>
          <div class="ag-hero-v">${_convs.length.toLocaleString('pt-BR')}</div>
          <div class="ag-hero-l">Conversas no total</div>
        </div>
      </div>
      <div class="ag-hero-st">
        <div class="ag-hero-ic" style="background:rgba(52,211,153,.10);color:var(--ok)">${IC_PULSE}</div>
        <div>
          <div class="ag-hero-v">${ativas7d.toLocaleString('pt-BR')}</div>
          <div class="ag-hero-l">Ativas nos últimos 7 dias</div>
        </div>
      </div>
      <div class="ag-hero-st">
        <div class="ag-hero-ic" style="background:rgba(245,166,35,.10);color:var(--warn)">${IC_CHAT}</div>
        <div>
          <div class="ag-hero-v">${agreg.msgsHoje.toLocaleString('pt-BR')}</div>
          <div class="ag-hero-l">Mensagens nas últimas 24h</div>
        </div>
      </div>
    </div>`

  if (!_ag.length) {
    c.innerHTML = `
      ${headerStats}
      <div class="ag-empty">
        ${ICON_BOT_LG}
        <h3>Nenhum agente de IA ainda</h3>
        <p>Crie seu primeiro agente para qualificar leads e agendar reuniões automaticamente.</p>
        <button class="btn bp" id="btn-add-ag2">+ Criar agente</button>
      </div>`
    document.getElementById('btn-add-ag2').addEventListener('click', addAgente)
    return
  }

  const cards = _ag.map(a => {
    const ativo = a.status === 'ativo'
    const cor = corCanal(a.canal)
    // estats por agente (todas as conversations contam — só temos 1 bot por enquanto;
    // se houver canal-specific no futuro, dá pra filtrar)
    const total = _convs.length
    const corte = Date.now() - 7*24*3600*1000
    const ult = _convs[0]?.updated_at
    const ativas = _convs.filter(x =>
      !['opt_out','pausado'].includes(x.stage) &&
      x.updated_at && new Date(x.updated_at).getTime() > corte
    ).length

    return `
    <div class="acard" data-painel="${a.id}">
      <div class="acard-top">
        <div class="acard-id">
          <div class="acard-av" style="background:${cor}1A;color:${cor}">${iconeCanal(a.canal)}</div>
          <div>
            <div class="acard-nm">${esc(a.nome)}</div>
            <div class="acard-ch" style="color:${cor}">${esc(a.canal || 'Canal não definido')}</div>
          </div>
        </div>
        <button class="acard-pill ${ativo ? 'on' : 'off'} toggle-ag" data-id="${a.id}" data-st="${a.status}" title="${ativo ? 'Pausar bot' : 'Ativar bot'}">
          <span class="dot"></span>${ativo ? 'Ativo' : 'Pausado'}
        </button>
      </div>

      ${a.prompt ? `<div class="acard-desc">${esc(a.prompt.slice(0, 180))}${a.prompt.length > 180 ? '…' : ''}</div>` : '<div class="acard-desc acard-empty-desc">Sem prompt configurado</div>'}

      <div class="acard-mst">
        <div class="acard-mst-i"><span class="acard-mst-l">Conversas</span><span class="acard-mst-v">${total.toLocaleString('pt-BR')}</span></div>
        <div class="acard-mst-i"><span class="acard-mst-l">Ativas 7d</span><span class="acard-mst-v">${ativas.toLocaleString('pt-BR')}</span></div>
        <div class="acard-mst-i"><span class="acard-mst-l">Última</span><span class="acard-mst-v">${ult ? tempoRel(ult) : '—'}</span></div>
      </div>

      <div class="acard-foot">
        <div class="acard-acts">
          <button class="btn bg bsm bic edit-ag" data-id="${a.id}" title="Editar">${ICON_EDIT}</button>
          <button class="btn bd bsm bic del-ag" data-id="${a.id}" title="Remover">${ICON_TRASH}</button>
        </div>
        <span class="acard-open">abrir painel →</span>
      </div>
    </div>`
  }).join('')

  c.innerHTML = `${headerStats}<div class="ag">${cards}</div>`

  c.addEventListener('click', async (e) => {
    const toggle = e.target.closest('.toggle-ag')
    const edit = e.target.closest('.edit-ag')
    const del = e.target.closest('.del-ag')
    const card = e.target.closest('.acard')
    if (toggle) {
      e.stopPropagation()
      await togglePausa(toggle.dataset.id, toggle.dataset.st)
    } else if (edit) { e.stopPropagation(); editAgente(edit.dataset.id) }
    else if (del) { e.stopPropagation(); delAgente(del.dataset.id) }
    else if (card) { renderPainel(card.dataset.painel) }
  })
}

async function togglePausa(id, statAtual) {
  const novo = statAtual === 'ativo' ? 'inativo' : 'ativo'
  const { error } = await db.from('agentes').update({ status: novo }).eq('id', id)
  if (error) { toast('Erro ao alterar status.', 'er'); return }
  toast(novo === 'ativo' ? 'Bot ativado.' : 'Bot pausado.')
  render()
}

// ════════════════════════════════════════════════════════════════
//   PAINEL DO AGENTE — sparkline + stats + testador + conversas
// ════════════════════════════════════════════════════════════════
async function renderPainel(id) {
  const a = _ag.find(x => x.id === id)
  if (!a) { render(); return }

  document.getElementById('tbacts').innerHTML = ''
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando painel...</div>'

  // Conversas + total mensagens
  const { data: convs } = await db.from('chatbot_conversations')
    .select('phone, messages, stage, lead_data, updated_at, created_at')
    .order('updated_at', { ascending: false })
  const lista = convs || []

  const mr = await db.from('mensagens').select('id', { count: 'exact', head: true })
  const msgTotal = mr.count || lista.reduce(
    (s, x) => s + (Array.isArray(x.messages) ? x.messages.length : 0), 0)

  const corte = Date.now() - 7*24*3600*1000
  const ultRole = (x) => {
    const m = x.messages
    return Array.isArray(m) && m.length ? m[m.length - 1]?.role : null
  }
  const aguardando = lista.filter(x => ultRole(x) === 'user').length
  const andamento = lista.filter(x =>
    !['opt_out','pausado'].includes(x.stage) &&
    x.updated_at && new Date(x.updated_at).getTime() > corte
  ).length

  // Sparkline: conversas atualizadas por dia nos últimos 14 dias
  const dias = 14
  const buckets = new Array(dias).fill(0)
  const hoje0 = new Date(); hoje0.setHours(0,0,0,0)
  lista.forEach(x => {
    if (!x.updated_at) return
    const t = new Date(x.updated_at); t.setHours(0,0,0,0)
    const diff = Math.round((hoje0 - t) / (24*3600*1000))
    if (diff >= 0 && diff < dias) buckets[dias - 1 - diff]++
  })

  // Funil de stages
  const stageMap = {}
  lista.forEach(x => {
    const s = x.stage || 'sem_stage'
    stageMap[s] = (stageMap[s] || 0) + 1
  })
  const stages = Object.entries(stageMap).sort((a,b) => b[1] - a[1]).slice(0, 6)
  const maxStage = Math.max(...stages.map(s => s[1]), 1)

  const ativo = a.status === 'ativo'
  const cor = corCanal(a.canal)

  const stats = [
    { ic: IC_USERS,  l: 'Conversas',           v: lista.length, cor: 'var(--info)' },
    { ic: IC_CHAT,   l: 'Mensagens trocadas',  v: msgTotal,     cor: 'var(--text)' },
    { ic: IC_PULSE,  l: 'Ativas (7 dias)',     v: andamento,    cor: 'var(--ok)' },
    { ic: IC_CLOCK,  l: 'Aguardando resposta', v: aguardando,   cor: 'var(--warn)' },
  ]
  const statCards = stats.map(s => `
    <div class="apnl-st">
      <div class="apnl-st-ic">${s.ic}</div>
      <div class="apnl-st-l">${s.l}</div>
      <div class="apnl-st-v" style="color:${s.cor}">${s.v.toLocaleString('pt-BR')}</div>
    </div>`).join('')

  const convRows = lista.slice(0, 8).map(x => {
    const nome = x.lead_data?.nome || x.phone || '—'
    const msgs = Array.isArray(x.messages) ? x.messages : []
    const ult = msgs.length ? msgs[msgs.length - 1] : null
    const txt = ult?.content ? ult.content.replace(/\s+/g, ' ').trim() : 'Sem mensagens'
    const encerrada = x.stage === 'opt_out' || x.stage === 'encerrado'
    const pausada   = x.stage === 'em_pausa'
    const esperando = ult?.role === 'user'
    const chip = pausada ? ['off', 'Pausada']
               : encerrada ? ['off', 'Encerrada']
               : esperando ? ['wait', 'Aguardando']
               : ['on', 'Ativa']
    const ini = (nome.replace(/[^a-zA-Z0-9]/g, '')[0] || '#').toUpperCase()
    const corAv = corAvatar(nome)
    return `
      <div class="apnl-conv-row" data-phone="${esc(x.phone)}">
        <div class="apnl-av" style="background:${corAv}22;color:${corAv}">${ini}</div>
        <div class="apnl-cinfo">
          <div class="apnl-cname">${esc(nome)} <span class="apnl-cphone">${esc(x.phone || '')}</span></div>
          <div class="apnl-cmsg">${esc(txt)}</div>
        </div>
        <div class="apnl-cmeta">
          <span class="apnl-chip ${chip[0]}">${chip[1]}</span>
          <span class="apnl-ctime">${tempoRel(x.updated_at)}</span>
        </div>
      </div>`
  }).join('')

  const stageRows = stages.length ? stages.map(([k, v]) => `
    <div class="apnl-stage-row">
      <div class="apnl-stage-l">${esc(k.replace(/_/g,' '))}</div>
      <div class="apnl-stage-bar"><div class="apnl-stage-fill" style="width:${(v/maxStage)*100}%"></div></div>
      <div class="apnl-stage-v">${v}</div>
    </div>
  `).join('') : '<div class="apnl-stage-empty">Sem dados ainda.</div>'

  c.innerHTML = `
    <div class="apnl">
      <div class="apnl-back" id="apnl-back">${IC_BACK} Voltar para agentes</div>

      <div class="apnl-head">
        <div class="apnl-hic" style="background:${cor}1A;color:${cor}">${iconeCanal(a.canal)}</div>
        <div class="apnl-htxt">
          <div class="apnl-title">${esc(a.nome)}</div>
          <div class="apnl-sub">${esc(a.canal || 'WhatsApp')} · IA: <b>Groq llama-3.3-70b</b> + OpenRouter (Claude)</div>
        </div>
        <div class="apnl-hacts">
          <button class="btn bg bsm" id="apnl-edit">${ICON_EDIT} Editar agente</button>
        </div>
      </div>

      <div class="apnl-banner ${ativo ? 'on' : 'off'}">
        <span><span class="dot"></span>${ativo
          ? 'Bot ativo — respondendo no WhatsApp'
          : 'Bot pausado — não está respondendo mensagens'}</span>
        <button class="apnl-toggle" id="apnl-toggle">${ativo ? `${ICON_PAUSE} Pausar bot` : `${ICON_PLAY} Ativar bot`}</button>
      </div>

      <div class="apnl-stats">${statCards}</div>

      <div class="apnl-grid">
        <div class="apnl-card">
          <div class="apnl-card-h">
            <div class="apnl-card-t">Atividade últimos 14 dias</div>
            <div class="apnl-card-s">${buckets.reduce((s,n)=>s+n,0)} conversas</div>
          </div>
          <canvas id="apnl-spark" class="apnl-spark" height="80"></canvas>
        </div>

        <div class="apnl-card">
          <div class="apnl-card-h">
            <div class="apnl-card-t">Funil por etapa</div>
            <div class="apnl-card-s">${stages.length} stages</div>
          </div>
          <div class="apnl-stages">${stageRows}</div>
        </div>
      </div>

      <div class="apnl-card apnl-prompt">
        <div class="apnl-card-h">
          <div class="apnl-card-t">Prompt do agente</div>
          <button class="btn bp bsm" id="apnl-prompt-save" style="display:none">Salvar</button>
        </div>
        <textarea id="apnl-prompt-ta" class="apnl-prompt-ta" placeholder="Defina como o agente deve se comportar...">${esc(a.prompt || '')}</textarea>
        <div class="apnl-prompt-foot">
          <span class="apnl-hint">Variáveis: <code>{nome}</code>, <code>{empresa}</code>, <code>{segmento}</code></span>
          <span class="apnl-prompt-len"><span id="apnl-prompt-count">${(a.prompt || '').length}</span> caracteres</span>
        </div>
      </div>

      <div class="apnl-card apnl-test">
        <div class="apnl-card-h">
          <div class="apnl-card-t">${ICON_TEST} Testar agente</div>
          <div class="apnl-card-s">Simula resposta usando o prompt atual</div>
        </div>
        <div class="apnl-test-thread" id="apnl-test-thread">
          <div class="apnl-test-empty">Digite uma mensagem como se fosse um lead e veja como o bot responderia.</div>
        </div>
        <div class="apnl-test-input">
          <input id="apnl-test-in" type="text" placeholder="Ex: Quanto custa o serviço de tráfego pago?" />
          <button class="btn bp bic" id="apnl-test-send" title="Enviar">${ICON_SEND}</button>
        </div>
      </div>

      <div class="apnl-conv">
        <div class="apnl-conv-h">Conversas recentes</div>
        ${convRows || '<div class="empty" style="padding:28px">Nenhuma conversa ainda.</div>'}
      </div>
    </div>`

  // ── Sparkline render ──
  renderSpark(document.getElementById('apnl-spark'), buckets, cor)

  // ── Events ──
  document.getElementById('apnl-back').addEventListener('click', render)
  document.getElementById('apnl-edit').addEventListener('click', () => editAgente(id))
  document.getElementById('apnl-toggle').addEventListener('click', async () => {
    const novo = ativo ? 'inativo' : 'ativo'
    const { error } = await db.from('agentes').update({ status: novo }).eq('id', a.id)
    if (error) { toast('Erro ao alterar status.', 'er'); return }
    a.status = novo
    const idx = _ag.findIndex(x => x.id === a.id)
    if (idx >= 0) _ag[idx].status = novo
    toast(novo === 'ativo' ? 'Bot ativado.' : 'Bot pausado.')
    renderPainel(id)
  })

  // Prompt editor inline
  const ta = document.getElementById('apnl-prompt-ta')
  const saveBtn = document.getElementById('apnl-prompt-save')
  const countEl = document.getElementById('apnl-prompt-count')
  const orig = a.prompt || ''
  ta.addEventListener('input', () => {
    countEl.textContent = ta.value.length
    saveBtn.style.display = ta.value === orig ? 'none' : 'inline-flex'
  })
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true
    const novoPrompt = ta.value.trim()
    const { error } = await db.from('agentes').update({ prompt: novoPrompt }).eq('id', id)
    saveBtn.disabled = false
    if (error) { toast('Erro ao salvar prompt.', 'er'); return }
    a.prompt = novoPrompt
    const idx = _ag.findIndex(x => x.id === a.id)
    if (idx >= 0) _ag[idx].prompt = novoPrompt
    toast('Prompt atualizado.')
    saveBtn.style.display = 'none'
  })

  // Testador IA
  const inEl = document.getElementById('apnl-test-in')
  const sendBtn = document.getElementById('apnl-test-send')
  const thread = document.getElementById('apnl-test-thread')

  const enviarTeste = async () => {
    const msg = inEl.value.trim()
    if (!msg || _testing) return
    _testing = true
    sendBtn.disabled = true
    inEl.disabled = true
    inEl.value = ''
    const empty = thread.querySelector('.apnl-test-empty')
    if (empty) empty.remove()
    thread.insertAdjacentHTML('beforeend', `
      <div class="apnl-test-bub user"><div class="apnl-test-bub-c">${esc(msg)}</div></div>
      <div class="apnl-test-bub bot loading" id="apnl-test-loading">
        <div class="apnl-test-bub-c"><span class="apnl-test-dots"><span></span><span></span><span></span></span></div>
      </div>`)
    thread.scrollTop = thread.scrollHeight

    try {
      const resposta = await chamarAgente(a.prompt || '', msg)
      document.getElementById('apnl-test-loading')?.remove()
      thread.insertAdjacentHTML('beforeend', `
        <div class="apnl-test-bub bot"><div class="apnl-test-bub-c">${esc(resposta)}</div></div>`)
    } catch (err) {
      document.getElementById('apnl-test-loading')?.remove()
      thread.insertAdjacentHTML('beforeend', `
        <div class="apnl-test-bub bot err"><div class="apnl-test-bub-c">Erro: ${esc(err.message || 'falha ao gerar resposta')}</div></div>`)
    } finally {
      _testing = false
      sendBtn.disabled = false
      inEl.disabled = false
      inEl.focus()
      thread.scrollTop = thread.scrollHeight
    }
  }

  sendBtn.addEventListener('click', enviarTeste)
  inEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') enviarTeste() })

  // Click em conversa → drawer com histórico
  c.querySelectorAll('.apnl-conv-row').forEach(row => {
    row.addEventListener('click', () => {
      const phone = row.dataset.phone
      const conv = lista.find(x => x.phone === phone)
      if (conv) abrirHistorico(conv)
    })
  })
}

// ── Sparkline simples em canvas ──
function renderSpark(canvas, data, cor) {
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const W = canvas.clientWidth
  const H = canvas.clientHeight || 80
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)
  const max = Math.max(...data, 1)
  const pad = 4
  const stepX = (W - pad*2) / (data.length - 1 || 1)
  const points = data.map((v, i) => ({
    x: pad + i * stepX,
    y: H - pad - (v / max) * (H - pad*2)
  }))
  // Fill area
  ctx.beginPath()
  ctx.moveTo(points[0].x, H - pad)
  points.forEach(p => ctx.lineTo(p.x, p.y))
  ctx.lineTo(points[points.length-1].x, H - pad)
  ctx.closePath()
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, hexToRgba(cor, 0.28))
  grad.addColorStop(1, hexToRgba(cor, 0))
  ctx.fillStyle = grad
  ctx.fill()
  // Line
  ctx.beginPath()
  points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
  ctx.strokeStyle = cor
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.stroke()
  // Dots no último ponto
  const last = points[points.length-1]
  ctx.beginPath()
  ctx.arc(last.x, last.y, 3.5, 0, Math.PI*2)
  ctx.fillStyle = cor
  ctx.fill()
  ctx.beginPath()
  ctx.arc(last.x, last.y, 6, 0, Math.PI*2)
  ctx.fillStyle = hexToRgba(cor, 0.18)
  ctx.fill()
}

function hexToRgba(hex, a) {
  // suporta tanto #RRGGBB quanto var()
  if (!hex || hex.startsWith('var(')) return `rgba(193,255,42,${a})`
  const h = hex.replace('#','')
  const n = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return `rgba(${r},${g},${b},${a})`
}

// Testar agente via OpenRouter — usa OR_KEY que vem do server local
async function chamarAgente(prompt, userMsg) {
  const orKey = CFG.OR_KEY
  if (!orKey) throw new Error('OR_KEY não disponível (faça login de novo pra recarregar).')

  const sistema = (prompt || '').replace(/\{nome\}/g, 'Teste')
    .replace(/\{empresa\}/g, 'Empresa Teste')
    .replace(/\{segmento\}/g, 'Diagnóstico')

  // modelos em ordem de preferência — tenta o próximo se falhar com 404
  const modelos = [
    'anthropic/claude-haiku-4.5',
    'anthropic/claude-3-haiku',
    'meta-llama/llama-3.3-70b-instruct',
  ]

  let lastErr = ''
  for (const model of modelos) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${orKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: sistema || 'Você é um assistente prestativo.' },
          { role: 'user', content: userMsg },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    })
    if (res.ok) {
      const json = await res.json()
      return json?.choices?.[0]?.message?.content?.trim() || '(sem resposta)'
    }
    if (res.status === 404) {
      // tenta o próximo modelo
      lastErr = `modelo ${model} indisponível`
      continue
    }
    const body = await res.text().catch(() => '')
    let msg = `OpenRouter ${res.status}`
    try { msg = JSON.parse(body)?.error?.message || msg } catch (_) {}
    throw new Error(msg)
  }
  throw new Error(lastErr || 'Nenhum modelo disponível')
}

// Drawer com histórico completo da conversa
function abrirHistorico(conv) {
  const nome = conv.lead_data?.nome || conv.phone || '—'
  const msgs = Array.isArray(conv.messages) ? conv.messages : []
  const body = msgs.length ? `
    <div class="hist-thread">
      ${msgs.map(m => `
        <div class="hist-bub ${m.role === 'user' ? 'user' : 'bot'}">
          <div class="hist-bub-c">${esc(m.content || '')}</div>
        </div>
      `).join('')}
    </div>
  ` : '<div class="empty" style="padding:24px">Sem mensagens.</div>'

  openModal(
    `Histórico — ${esc(nome)}`,
    body,
    `<button class="btn bg" id="m-close">Fechar</button>`
  )
  document.getElementById('m-close').addEventListener('click', closeModal)
}

// ════════════════════════════════════════════════════════════════
//   FORM (criar / editar) — com templates e tom de voz
// ════════════════════════════════════════════════════════════════
const TEMPLATES = [
  {
    id: 'sofia-wa',
    nome: 'Sofia — WhatsApp',
    canal: 'WhatsApp',
    prompt: `Você é Sofia, IA da Eleva Digital. Qualifica leads via SPIN Selling e agenda diagnóstico gratuito com o Lira.

Tom: profissional, claro, sem floreio. Use frases curtas. Sem emojis.

Fluxo:
1. Pergunte sobre o negócio do lead (situação)
2. Identifique a maior dor (problema)
3. Mostre o impacto de não resolver (implicação)
4. Direcione pra reunião de diagnóstico (necessidade)

Quando o lead aceitar, ofereça 2-3 horários nos próximos 3 dias e confirme.`
  },
  {
    id: 'lira-ig',
    nome: 'LIRA — Instagram DMs',
    canal: 'Instagram',
    prompt: `Você É o Lira (Edmilson), fundador da Eleva Digital. NÃO é assistente, NÃO é IA.

Tom: brasileiro coloquial, gírias (mano, cara, fechou, salve), SEM emoji, SEM travessão, máximo 1 frase por resposta.

Responda comentários e DMs do Instagram como se fosse uma conversa rápida no celular.

Se a pessoa demonstrar interesse claro (eu quero, robô, preço, como funciona), puxe pro WhatsApp pra detalhar.`
  },
  {
    id: 'qualifier',
    nome: 'Qualificador genérico',
    canal: 'WhatsApp',
    prompt: `Você é um assistente de qualificação. Sua missão é entender se o lead tem fit com o serviço e agendar uma conversa.

Tom: educado, direto. Pergunta uma coisa por vez.

Variáveis disponíveis: {nome}, {empresa}, {segmento}.

Sempre termine perguntando algo que avance a conversa.`
  },
]

function agForm(a = {}) {
  const canalOpts = CANAIS.map(ch =>
    `<option value="${ch}"${a.canal === ch ? ' selected' : ''}>${ch}</option>`
  ).join('')

  const templateChips = !a.id ? `
    <div class="fg">
      <label class="fl">Começar de um template <span style="color:var(--text-3);font-weight:400">(opcional)</span></label>
      <div class="ag-tpls">
        ${TEMPLATES.map(t => `
          <button type="button" class="ag-tpl" data-tpl="${t.id}">
            <div class="ag-tpl-n">${esc(t.nome)}</div>
            <div class="ag-tpl-c">${esc(t.canal)}</div>
          </button>
        `).join('')}
      </div>
    </div>
  ` : ''

  return `
    ${templateChips}
    <div class="frow">
      <div class="fg"><label class="fl">Nome *</label><input class="fi" id="agn" value="${esc(a.nome || '')}" placeholder="Ex: Sofia — Qualificador WA"></div>
      <div class="fg"><label class="fl">Canal</label>
        <select class="fsl" id="agc"><option value="">Selecione...</option>${canalOpts}</select>
      </div>
    </div>
    <div class="fg"><label class="fl">Status</label>
      <select class="fsl" id="agst">
        <option value="ativo"${a.status === 'ativo' ? ' selected' : ''}>Ativo</option>
        <option value="inativo"${a.status === 'inativo' ? ' selected' : ''}>Pausado</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Prompt / Instrução do bot</label>
      <textarea class="fta" id="agp" style="min-height:180px;font-family:ui-monospace,monospace;font-size:12px" placeholder="Defina como o bot deve se comportar, o tom de voz, o fluxo da conversa...">${esc(a.prompt || '')}</textarea>
      <div class="fhint" style="margin-top:6px;font-size:11px;color:var(--text-3)">Variáveis disponíveis: <code>{nome}</code>, <code>{empresa}</code>, <code>{segmento}</code></div>
    </div>
    <div class="fg"><label class="fl">Notas internas</label><textarea class="fta" id="agno" placeholder="Anotações pra você lembrar...">${esc(a.notas || '')}</textarea></div>`
}

function addAgente() {
  openModal(
    'Novo agente IA', agForm(),
    `<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`
  )
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', () => saveAgente())

  // Templates clicáveis
  document.querySelectorAll('.ag-tpl').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = TEMPLATES.find(x => x.id === btn.dataset.tpl)
      if (!t) return
      document.getElementById('agn').value = t.nome
      document.getElementById('agc').value = t.canal
      document.getElementById('agp').value = t.prompt
      document.querySelectorAll('.ag-tpl').forEach(b => b.classList.remove('on'))
      btn.classList.add('on')
    })
  })
}

function editAgente(id) {
  const a = _ag.find(x => x.id === id)
  if (!a) return
  openModal(
    'Editar agente', agForm(a),
    `<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`
  )
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', () => saveAgente(id))
}

async function saveAgente(id) {
  const d = {
    nome:   document.getElementById('agn').value.trim(),
    canal:  document.getElementById('agc').value,
    status: document.getElementById('agst').value,
    prompt: document.getElementById('agp').value.trim(),
    notas:  document.getElementById('agno').value.trim(),
  }
  if (!d.nome) { toast('Nome obrigatório.', 'er'); return }
  const { error } = id
    ? await db.from('agentes').update(d).eq('id', id)
    : await db.from('agentes').insert(d)
  if (error) { toast('Erro ao salvar.', 'er'); return }
  toast(id ? 'Agente atualizado.' : 'Agente criado.')
  closeModal()
  if (id) renderPainel(id)
  else render()
}

async function delAgente(id) {
  if (!confirm('Remover agente?')) return
  await db.from('agentes').delete().eq('id', id)
  toast('Removido.')
  render()
}
