export const MES  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
export const MESF = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
export const STATS  = ['prospeccao','novo','qualificado','proposta','ativo','em_pausa','fechado','perdido']
export const TEMPS  = ['quente','morno','frio','gelado']
export const STATUS_LABEL = { prospeccao: 'Prospecção', em_pausa: 'Em pausa' }
export const CANAIS = ['WhatsApp','Instagram','Site','Telegram','Email','Outro']

export function brl(v) {
  if (v === null || v === undefined || v === '') return '—'
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtd(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function badge(s) {
  const label = STATUS_LABEL[s] || s.charAt(0).toUpperCase() + s.slice(1)
  return `<span class="badge b-${s}">${label}</span>`
}

const TEMP_ICONS = { quente:'🔥', morno:'🌡️', frio:'❄️', gelado:'🧊' }
export function tempBadge(t) {
  if (!t) return ''
  return `<span class="temp temp-${t}">${TEMP_ICONS[t] || ''} ${t.charAt(0).toUpperCase() + t.slice(1)}</span>`
}

export function bk(v) {
  return v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(Math.round(v))
}

// ── Toast ────────────────────────────────────────
export function toast(msg, type = 'ok') {
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = msg
  document.getElementById('tc').appendChild(el)
  setTimeout(() => el.remove(), 3000)
}

// ── Modal ────────────────────────────────────────
export function openModal(title, body, foot) {
  document.getElementById('mtitle').textContent = title
  document.getElementById('mbody').innerHTML = body
  document.getElementById('mfoot').innerHTML = foot
  document.getElementById('ov').classList.remove('h')
}

export function closeModal() {
  document.getElementById('ov').classList.add('h')
}
