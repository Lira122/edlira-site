import { sbAuth } from '../auth.js'
import { toast } from '../utils.js'

const SB_URL = 'https://flzpblpegoqjxaacjvhf.supabase.co'

let _timer = null
let _pipWindow = null
let _pipTimer = null

// ─── Sistema de alerta: janela 5h (principal) + budget mensal (secundário) ─
const LS_LIMIT_5H = 'uso_limit_5h_tokens'      // limite em tokens da janela rolante
const LS_BUDGET   = 'uso_budget_mes_usd'       // teto mensal em USD (opcional)
const LS_ALERTED_5H = 'uso_alerted_5h'         // alertas da janela 5h
const LS_ALERTED_MES = 'uso_alerted_mes'       // alertas do mês
const THRESHOLDS = [0.5, 0.7, 0.8, 0.9, 0.95, 1.0]

// Defaults conservadores. Usuário ajusta no UI.
//   Plano Claude Pro: ~45 msgs / 5h
//   Plano Max 5x:     ~225 msgs / 5h
//   Plano Max 20x:    ~900 msgs / 5h
// Em TOKENS (estimativa) por janela de 5h:
const DEFAULT_LIMIT_5H = 500_000

function getLimit5h() {
  const v = Number(localStorage.getItem(LS_LIMIT_5H) || '0')
  return v > 0 ? v : DEFAULT_LIMIT_5H
}
function setLimit5h(v) {
  localStorage.setItem(LS_LIMIT_5H, String(Math.max(0, Number(v) || 0)))
  localStorage.setItem(LS_ALERTED_5H, JSON.stringify([]))
}
function getBudget() {
  const v = Number(localStorage.getItem(LS_BUDGET) || '0')
  return v > 0 ? v : 50
}
function setBudget(v) {
  localStorage.setItem(LS_BUDGET, String(Math.max(0, Number(v) || 0)))
  localStorage.setItem(LS_ALERTED_MES, JSON.stringify({ mes: mesAtual(), t: [] }))
}
function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
// Para a janela 5h, o "reset" é rolante. Reseta thresholds quando o uso CAI
// (ou seja, o pico saiu da janela). Senão pessoa fica re-alertando toda chamada.
function getAlerted5h() {
  try { return JSON.parse(localStorage.getItem(LS_ALERTED_5H) || '[]') } catch { return [] }
}
function setAlerted5h(arr) { localStorage.setItem(LS_ALERTED_5H, JSON.stringify(arr)) }
function getAlertedMes() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_ALERTED_MES) || '{}')
    if (raw.mes !== mesAtual()) return []
    return raw.t || []
  } catch { return [] }
}
function setAlertedMes(arr) { localStorage.setItem(LS_ALERTED_MES, JSON.stringify({ mes: mesAtual(), t: arr })) }

// Som de alerta: 3 beeps via Web Audio (não precisa de arquivo).
// Tom mais grave = aviso (50/70%); tom agudo = urgente (80%+).
function beep(level = 'aviso') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const freq = level === 'urgente' ? 880 : 523 // A5 vs C5
    const ganho = 0.18
    const dur = 0.18
    const n = level === 'urgente' ? 3 : 2
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = freq
      o.connect(g); g.connect(ctx.destination)
      const t0 = ctx.currentTime + i * (dur + 0.08)
      g.gain.setValueAtTime(0, t0)
      g.gain.linearRampToValueAtTime(ganho, t0 + 0.02)
      g.gain.linearRampToValueAtTime(0, t0 + dur)
      o.start(t0); o.stop(t0 + dur)
    }
    setTimeout(() => ctx.close().catch(() => {}), n * 400)
  } catch (e) { console.warn('[beep] falhou:', e) }
}

// Notificação do sistema (se permissão concedida)
function notificar(titulo, corpo) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification(titulo, { body: corpo, icon: '/assets/favicon-192.png' })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') new Notification(titulo, { body: corpo, icon: '/assets/favicon-192.png' })
    })
  }
}

// Alerta da janela 5h (rate limit Claude). Roda em CADA atualização.
// Thresholds zeram quando o pct cai abaixo (uso saiu da janela rolante).
function checarAlerta5h(tokens5h) {
  const limit = getLimit5h()
  if (limit <= 0) return null
  const pct = tokens5h / limit
  let alerted = getAlerted5h()

  // Limpa thresholds que não se aplicam mais (uso caiu)
  alerted = alerted.filter(t => pct >= t)

  const novos = THRESHOLDS.filter(t => pct >= t && !alerted.includes(t))
  if (novos.length) {
    const maior = Math.max(...novos)
    const nivel = maior >= 0.8 ? 'urgente' : 'aviso'
    const pctStr = Math.round(maior * 100)
    const titulo = nivel === 'urgente'
      ? `🚨 Janela 5h em ${pctStr}% do limite do Claude`
      : `⚠️ Janela 5h em ${pctStr}% do limite`
    const corpo  = `${tokens5h.toLocaleString('pt-BR')} de ${limit.toLocaleString('pt-BR')} tokens consumidos nas últimas 5 horas.`
    beep(nivel)
    notificar(titulo, corpo)
    toast(`${titulo} — ${corpo}`, 'warn')
    alerted = [...alerted, ...novos]
  }
  setAlerted5h(alerted)
  return { pct, limit, tokens: tokens5h }
}

// Alerta de orçamento mensal (USD). 1 disparo por threshold por mês.
function checarAlertaMes(custoMes) {
  const budget = getBudget()
  if (budget <= 0) return null
  const pct = custoMes / budget
  const alerted = getAlertedMes()
  const novos = THRESHOLDS.filter(t => pct >= t && !alerted.includes(t))
  if (!novos.length) return { pct, budget }

  const maior = Math.max(...novos)
  const nivel = maior >= 0.8 ? 'urgente' : 'aviso'
  const pctStr = Math.round(maior * 100)
  const titulo = nivel === 'urgente' ? `🚨 Custo mensal em ${pctStr}% do teto` : `⚠️ Custo mensal em ${pctStr}% do teto`
  const corpo  = `Você gastou $${custoMes.toFixed(2)} de $${budget.toFixed(2)} este mês.`
  beep(nivel)
  notificar(titulo, corpo)
  toast(`${titulo} — ${corpo}`, 'warn')
  setAlertedMes([...alerted, ...novos])
  return { pct, budget }
}

// ─── Helpers ────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
))

function fmtNum(n) {
  const v = Number(n || 0)
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M'
  if (v >= 1_000)     return (v / 1_000).toFixed(1) + 'k'
  return String(Math.round(v))
}

function fmtUSD(n) {
  const v = Number(n || 0)
  if (v < 0.01) return '$' + v.toFixed(4)
  return '$' + v.toFixed(2)
}

function fmtBRL(usd, taxa = 5.6) {
  return 'R$ ' + (Number(usd || 0) * taxa).toFixed(2)
}

function tempoRel(iso) {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s atrás`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return new Date(iso).toLocaleString('pt-BR')
}

function tempoCompact(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatarTempoAteReset(iso) {
  if (!iso) return '—'
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'agora'
  const min = Math.floor(ms / 60000)
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

// Alerta baseado em % real do claude.ai (não em tokens estimados)
function checarAlerta5hReal(pct) {
  const fracao = pct / 100
  let alerted = getAlerted5h()
  alerted = alerted.filter(t => fracao >= t)
  const novos = THRESHOLDS.filter(t => fracao >= t && !alerted.includes(t))
  if (novos.length) {
    const maior = Math.max(...novos)
    const nivel = maior >= 0.8 ? 'urgente' : 'aviso'
    const pctStr = Math.round(maior * 100)
    const titulo = nivel === 'urgente'
      ? `🚨 Janela 5h do Claude em ${pctStr}%`
      : `⚠️ Janela 5h em ${pctStr}%`
    const corpo = `${pct}% da sessão atual já foi consumido.`
    beep(nivel)
    notificar(titulo, corpo)
    toast(`${titulo} — ${corpo}`, 'warn')
    alerted = [...alerted, ...novos]
  }
  setAlerted5h(alerted)
}

async function fetchStats() {
  const { data } = await sbAuth.auth.getSession()
  const tok = data?.session?.access_token
  const r = await fetch(`${SB_URL}/functions/v1/usage-stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
    },
    body: '{}',
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

// ─── Renderização do painel principal ──────────────────────────────────
function buildHTML(stats) {
  const b = stats.bot || {}
  const ant = stats.anthropic || {}

  const cards = [
    { label: 'Tokens HOJE',       v: fmtNum(b.hoje?.total_tokens),     sub: `${b.hoje?.chamadas || 0} chamadas`, cor: 'var(--accent)' },
    { label: '7 DIAS',            v: fmtNum(b.sete_dias?.total_tokens), sub: `${b.sete_dias?.chamadas || 0} chamadas`, cor: 'var(--info)' },
    { label: 'NO MÊS',            v: fmtNum(b.mes?.total_tokens),       sub: `${b.mes?.chamadas || 0} chamadas`, cor: '#A78BFA' },
    { label: 'CUSTO MÊS',         v: fmtUSD(b.mes?.custo_usd),          sub: fmtBRL(b.mes?.custo_usd), cor: 'var(--ok)' },
  ]

  const statCards = cards.map(c => `
    <div class="sc" style="border-left:3px solid ${c.cor}">
      <div class="sl">${esc(c.label)}</div>
      <div class="sv">${esc(c.v)}</div>
      <div class="ss">${esc(c.sub)}</div>
    </div>`).join('')

  // Provider breakdown
  const providers = Object.entries(b.por_provider || {})
    .sort((a, b) => b[1].total_tokens - a[1].total_tokens)
  const totalProviderTokens = providers.reduce((s, [, v]) => s + v.total_tokens, 0) || 1
  const providerHTML = providers.length ? providers.map(([name, v]) => {
    const pct = Math.round(v.total_tokens / totalProviderTokens * 100)
    const cor = name === 'groq' ? '#F55036' : name === 'openrouter' ? '#4A9EFF' : name === 'anthropic' ? '#C5F82A' : '#A0A0A0'
    return `
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px">
          <span style="font-weight:500;color:${cor}">${esc(name)}</span>
          <span style="color:var(--text-3);font-size:12px">${fmtNum(v.total_tokens)} tokens · ${fmtUSD(v.custo_usd)} · ${v.chamadas} chamadas</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${cor};transition:width .3s"></div>
        </div>
      </div>`
  }).join('') : `<div class="empty" style="padding:30px">Nenhum uso registrado ainda. Quando o bot fizer chamadas de IA, vai aparecer aqui em tempo real.</div>`

  // Por modelo
  const modelos = Object.entries(b.por_modelo || {})
    .sort((a, b) => b[1].total_tokens - a[1].total_tokens)
    .slice(0, 8)
  const modeloHTML = modelos.length ? `
    <table style="width:100%;font-size:12px">
      <thead>
        <tr style="color:var(--text-3);text-transform:uppercase;letter-spacing:.05em;font-size:10px">
          <th style="text-align:left;padding:6px 8px">Modelo</th>
          <th style="text-align:right;padding:6px 8px">Tokens</th>
          <th style="text-align:right;padding:6px 8px">Custo</th>
          <th style="text-align:right;padding:6px 8px">Chamadas</th>
        </tr>
      </thead>
      <tbody>
        ${modelos.map(([m, v]) => `
          <tr style="border-top:1px solid var(--line)">
            <td style="padding:8px;font-family:ui-monospace,monospace;font-size:11px">${esc(m)}</td>
            <td style="padding:8px;text-align:right">${fmtNum(v.total_tokens)}</td>
            <td style="padding:8px;text-align:right;color:var(--ok)">${fmtUSD(v.custo_usd)}</td>
            <td style="padding:8px;text-align:right;color:var(--text-3)">${v.chamadas}</td>
          </tr>`).join('')}
      </tbody>
    </table>` : ''

  // Mini chart 7d
  const dias = Object.entries(b.por_dia || {}).sort()
  const maxTokens = Math.max(1, ...dias.map(([, v]) => v.total_tokens))
  const chartHTML = dias.length ? `
    <div style="display:flex;align-items:flex-end;gap:6px;height:80px;padding:8px 0;border-bottom:1px solid var(--line);margin-bottom:8px">
      ${dias.map(([dia, v]) => {
        const altura = Math.max(2, Math.round(v.total_tokens / maxTokens * 70))
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0">
          <div style="font-size:9px;color:var(--text-3)">${fmtNum(v.total_tokens)}</div>
          <div style="width:100%;height:${altura}px;background:linear-gradient(to top,var(--accent),rgba(197,248,42,.3));border-radius:2px"></div>
          <div style="font-size:10px;color:var(--text-3)">${dia.slice(5)}</div>
        </div>`
      }).join('')}
    </div>` : `<div class="empty" style="padding:30px">Sem dados nos últimos 7 dias.</div>`

  // Últimas chamadas
  const ultimas = b.ultimas_chamadas || []
  const ultimasHTML = ultimas.length ? `
    <table style="width:100%;font-size:12px">
      <thead>
        <tr style="color:var(--text-3);text-transform:uppercase;letter-spacing:.05em;font-size:10px">
          <th style="text-align:left;padding:6px 8px">Hora</th>
          <th style="text-align:left;padding:6px 8px">Provider</th>
          <th style="text-align:left;padding:6px 8px">Origem</th>
          <th style="text-align:right;padding:6px 8px">Tokens</th>
          <th style="text-align:right;padding:6px 8px">Custo</th>
          <th style="text-align:right;padding:6px 8px">Latência</th>
        </tr>
      </thead>
      <tbody>
        ${ultimas.map(u => `
          <tr style="border-top:1px solid var(--line)">
            <td style="padding:8px;color:var(--text-3)">${esc(tempoCompact(u.quando))}</td>
            <td style="padding:8px">${esc(u.provider)} ${u.sucesso ? '' : '<span style="color:var(--danger)">✗</span>'}</td>
            <td style="padding:8px;color:var(--text-2)">${esc(u.origem || '—')}</td>
            <td style="padding:8px;text-align:right">${fmtNum(u.tokens)}</td>
            <td style="padding:8px;text-align:right;color:var(--ok)">${fmtUSD(u.custo)}</td>
            <td style="padding:8px;text-align:right;color:var(--text-3)">${u.latencia || '—'}ms</td>
          </tr>`).join('')}
      </tbody>
    </table>` : `<div class="empty" style="padding:30px">Sem chamadas recentes.</div>`

  // Anthropic
  let anthropicHTML = ''
  if (!ant.configurado) {
    anthropicHTML = `
      <div class="tw" style="margin-top:22px;padding:24px;background:rgba(197,248,42,.04);border:1px dashed rgba(197,248,42,.2)">
        <div style="font-size:14px;font-weight:500;margin-bottom:6px;color:var(--accent)">📡 Conta Anthropic não conectada</div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.6">
          Pra ver uso da SUA conta Anthropic (Claude Code etc) em tempo real, gera uma Admin API Key em
          <a href="https://console.anthropic.com/settings/admin-keys" target="_blank" style="color:var(--accent)">console.anthropic.com/settings/admin-keys</a>
          e adiciona como secret <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace">ANTHROPIC_ADMIN_KEY</code> nas
          <a href="https://supabase.com/dashboard/project/flzpblpegoqjxaacjvhf/functions/secrets" target="_blank" style="color:var(--accent)">Edge Functions Secrets</a>.
        </div>
      </div>`
  } else if (ant.erro) {
    anthropicHTML = `
      <div class="tw" style="margin-top:22px;padding:24px;border-left:3px solid var(--danger)">
        <div style="font-size:14px;font-weight:500;margin-bottom:6px;color:var(--danger)">Erro lendo Anthropic Admin API</div>
        <div style="font-size:12px;color:var(--text-3);font-family:ui-monospace,monospace">${esc(ant.erro)}</div>
      </div>`
  } else {
    const aHoje = ant.hoje || {}
    const aMes  = ant.mes  || {}
    const aModelos = Object.entries(aMes.por_modelo || {}).sort((a, b) => b[1].total_tokens - a[1].total_tokens)
    anthropicHTML = `
      <div style="margin-top:30px;margin-bottom:14px;font-size:13px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em">Conta Anthropic (Claude direto)</div>
      <div class="sg" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
        <div class="sc"><div class="sl">Hoje</div><div class="sv">${fmtNum(aHoje.total_tokens)}</div><div class="ss">${aHoje.chamadas || 0} chamadas</div></div>
        <div class="sc"><div class="sl">Este Mês</div><div class="sv">${fmtNum(aMes.total_tokens)}</div><div class="ss">${aMes.chamadas || 0} chamadas</div></div>
        <div class="sc"><div class="sl">Modelos ativos</div><div class="sv">${aModelos.length}</div><div class="ss">no mês</div></div>
      </div>
      ${aModelos.length ? `
        <div class="tw" style="padding:14px 18px">
          <table style="width:100%;font-size:12px">
            <thead><tr style="color:var(--text-3);font-size:10px;text-transform:uppercase">
              <th style="text-align:left;padding:6px 8px">Modelo</th>
              <th style="text-align:right;padding:6px 8px">Tokens (mês)</th>
              <th style="text-align:right;padding:6px 8px">Chamadas</th>
            </tr></thead>
            <tbody>
              ${aModelos.map(([m, v]) => `
                <tr style="border-top:1px solid var(--line)">
                  <td style="padding:8px;font-family:ui-monospace,monospace;font-size:11px">${esc(m)}</td>
                  <td style="padding:8px;text-align:right">${fmtNum(v.total_tokens)}</td>
                  <td style="padding:8px;text-align:right;color:var(--text-3)">${v.chamadas}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>` : ''}`
  }

  // Claude.ai consumer (extensão) — TEM PRIORIDADE se conectada
  const cc = stats.claude_consumer || {}

  let janelaHTML = ''
  if (cc.conectado && !cc.stale && cc.sessao_pct != null) {
    const pct = Math.round(cc.sessao_pct)
    const cor = pct >= 80 ? 'var(--danger)' : pct >= 50 ? 'var(--warn)' : 'var(--ok)'
    const resetTxt = cc.sessao_reseta_em ? formatarTempoAteReset(cc.sessao_reseta_em) : '—'
    const semanaTxt = cc.semana_pct != null ? `<span style="color:var(--text-3);font-size:11px">· Semana: <strong style="color:var(--text-2)">${Math.round(cc.semana_pct)}%</strong></span>` : ''
    const opusTxt = cc.opus_pct != null ? `<span style="color:var(--text-3);font-size:11px">· Opus: <strong style="color:var(--text-2)">${Math.round(cc.opus_pct)}%</strong></span>` : ''
    janelaHTML = `
      <div class="tw" style="padding:18px;margin-bottom:14px;border-left:4px solid ${cor};background:${pct >= 80 ? 'rgba(255,92,92,.05)' : 'transparent'}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:4px">🚦 Janela 5h do Claude · ${esc(cc.plano || 'plano')}</div>
            <div style="font-size:13px;color:var(--text-2)">Dados reais do claude.ai (via extensão) · atualiza a cada 5min</div>
          </div>
          <div style="font-size:12px;color:var(--text-3)">Reinicia em <strong style="color:${cor}">${esc(resetTxt)}</strong></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:13px;margin-bottom:8px">
          <span style="color:${cor};font-weight:600;font-size:24px">${pct}% <span style="font-size:13px;color:var(--text-3);font-weight:400">da sessão atual</span></span>
          <span>${semanaTxt} ${opusTxt}</span>
        </div>
        <div style="height:10px;background:rgba(255,255,255,.04);border-radius:5px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${cor};transition:width .4s,background .4s"></div>
        </div>
      </div>`

    // Atualiza alerta de janela 5h baseado em % real (não tokens estimados)
    checarAlerta5hReal(pct)
  } else if (cc.conectado && cc.stale) {
    janelaHTML = `
      <div class="tw" style="padding:14px 18px;margin-bottom:14px;border-left:3px solid var(--warn)">
        <div style="font-size:13px;color:var(--warn);font-weight:500">⚠️ Extensão conectou mas tá sem atualizar há mais de 30 minutos</div>
        <div style="font-size:12px;color:var(--text-3);margin-top:4px">Abre o claude.ai pra reativar a sessão da extensão, ou clica no ícone dela e em "Sincronizar agora".</div>
      </div>`
  } else {
    janelaHTML = `
      <div class="tw" style="padding:18px;margin-bottom:14px;border-left:4px solid var(--text-3);background:rgba(197,248,42,.04)">
        <div style="font-size:13px;font-weight:600;margin-bottom:6px;color:var(--accent)">🚦 Janela 5h do Claude — extensão não conectada</div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.6">
          Pra ver os 23% da sessão e quanto falta pro reset (como no painel do claude.ai), instale a extensão <strong>Eleva · Claude Usage Monitor</strong> no Chrome.
          <br><span style="color:var(--text-3);font-size:12px">A extensão fica na pasta <code style="background:rgba(255,255,255,.05);padding:1px 5px;border-radius:3px;font-family:ui-monospace,monospace">/extensao-claude-usage</code> do projeto.</span>
        </div>
      </div>`
  }

  // Janela 5h estimada (Anthropic Admin API) — só mostra se Admin Key configurada
  const tokens5h = Number(ant.janela_5h?.total_tokens || 0)
  const limit5h = getLimit5h()
  const pct5h = limit5h > 0 ? Math.min(100, Math.round(tokens5h / limit5h * 100)) : 0
  const cor5h = pct5h >= 80 ? 'var(--danger)' : pct5h >= 50 ? 'var(--warn)' : 'var(--ok)'

  const janelaAdminHTML = ant.configurado && !ant.erro ? `
    <div class="tw" style="padding:18px;margin-bottom:14px;border-left:4px solid ${cor5h};background:${pct5h >= 80 ? 'rgba(255,92,92,.05)' : 'transparent'}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:4px">🚦 Janela 5h do Claude (rate limit rolante)</div>
          <div style="font-size:13px;color:var(--text-2)">A Anthropic limita uso numa janela de 5 horas. Quando atravessar 80%, você ouve um alerta.</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:12px">
          <span style="color:var(--text-3)">Limite (tokens):</span>
          <input type="number" id="uso-limit-5h" value="${limit5h}" min="0" step="50000" style="background:var(--bg-input);border:1px solid var(--line);color:var(--text);padding:5px 10px;border-radius:6px;width:120px;font-size:13px;font-family:inherit">
          <button class="btn bg bsm" id="uso-limit-5h-save">Salvar</button>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:13px;margin-bottom:8px">
        <span style="color:${cor5h};font-weight:600;font-size:20px">${fmtNum(tokens5h)} / ${fmtNum(limit5h)} <span style="font-size:13px;color:var(--text-3);font-weight:400">tokens (${pct5h}%)</span></span>
        <span style="color:var(--text-3);font-size:11px">Atualiza em tempo real conforme tokens saem da janela</span>
      </div>
      <div style="height:10px;background:rgba(255,255,255,.04);border-radius:5px;overflow:hidden">
        <div style="height:100%;width:${pct5h}%;background:${cor5h};transition:width .4s,background .4s"></div>
      </div>
      <div style="display:flex;gap:14px;margin-top:10px;font-size:11px;color:var(--text-3)">
        <span>Chamadas na janela: <strong style="color:var(--text-2)">${ant.janela_5h?.chamadas || 0}</strong></span>
        <span>Input: <strong style="color:var(--text-2)">${fmtNum(ant.janela_5h?.input_tokens)}</strong></span>
        <span>Output: <strong style="color:var(--text-2)">${fmtNum(ant.janela_5h?.output_tokens)}</strong></span>
      </div>
    </div>` : !ant.configurado ? `
    <div class="tw" style="padding:18px;margin-bottom:14px;border-left:4px solid var(--text-3);background:rgba(197,248,42,.04)">
      <div style="font-size:13px;font-weight:600;margin-bottom:6px;color:var(--accent)">🚦 Janela 5h do Claude — não conectada</div>
      <div style="font-size:13px;color:var(--text-2);line-height:1.6">
        Pra monitorar a janela rolante de 5h do seu rate limit Claude/Anthropic, você precisa gerar uma <strong>Admin API Key</strong> em
        <a href="https://console.anthropic.com/settings/admin-keys" target="_blank" style="color:var(--accent)">console.anthropic.com/settings/admin-keys</a>
        e adicionar como secret <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace;font-size:11px">ANTHROPIC_ADMIN_KEY</code> nas
        <a href="https://supabase.com/dashboard/project/flzpblpegoqjxaacjvhf/functions/secrets" target="_blank" style="color:var(--accent)">Edge Functions Secrets</a>.
      </div>
    </div>` : ''

  // Barra de orçamento mensal (secundária)
  const budget = getBudget()
  const custoMes = Number(b.mes?.custo_usd || 0)
  const pctBudget = budget > 0 ? Math.min(100, Math.round(custoMes / budget * 100)) : 0
  const barCor = pctBudget >= 80 ? 'var(--danger)' : pctBudget >= 50 ? 'var(--warn)' : 'var(--ok)'

  const budgetHTML = `
    <div class="tw" style="padding:14px 16px;margin-bottom:18px;border-left:3px solid ${barCor}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:10px">
        <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;font-weight:600">Custo mensal (bot Groq/OpenRouter)</div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px">
          <span style="color:var(--text-3)">Teto US$</span>
          <input type="number" id="uso-budget" value="${budget}" min="0" step="5" style="background:var(--bg-input);border:1px solid var(--line);color:var(--text);padding:4px 8px;border-radius:6px;width:70px;font-size:12px;font-family:inherit">
          <button class="btn bg bsm" id="uso-budget-save">Salvar</button>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
        <span style="color:${barCor};font-weight:500">${fmtUSD(custoMes)} / ${fmtUSD(budget)} (${pctBudget}%)</span>
      </div>
      <div style="height:5px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${pctBudget}%;background:${barCor};transition:width .3s,background .3s"></div>
      </div>
    </div>`

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <div style="font-size:13px;color:var(--text-3);display:flex;align-items:center;gap:8px">
        <span class="uso-dot" style="width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 4px rgba(52,211,153,.15);animation:uso-pulse 2s infinite"></span>
        Atualiza sozinho a cada 30s · última leitura ${esc(tempoRel(stats.gerado_em))}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn bg bsm" id="uso-test-beep" title="Tocar o som de alerta pra você ouvir como é">🔔 Testar alerta</button>
        <button class="btn bp" id="uso-pip" title="Abrir janela flutuante que segue você fora do CRM">📺 Abrir flutuante (PiP)</button>
      </div>
    </div>

    ${janelaHTML}
    ${janelaAdminHTML}
    ${budgetHTML}

    <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">${statCards}</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:22px">
      <div class="tw" style="padding:18px">
        <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;font-weight:600">Por provider (mês)</div>
        ${providerHTML}
      </div>
      <div class="tw" style="padding:18px">
        <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;font-weight:600">Últimos 7 dias</div>
        ${chartHTML}
      </div>
    </div>

    <div class="tw" style="padding:18px;margin-bottom:22px">
      <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;font-weight:600">Top modelos (mês)</div>
      ${modeloHTML || `<div class="empty" style="padding:14px">Sem dados ainda.</div>`}
    </div>

    <div class="tw" style="padding:18px">
      <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;font-weight:600">Últimas chamadas</div>
      ${ultimasHTML}
    </div>

    ${anthropicHTML}

    <style>
      @keyframes uso-pulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(52,211,153,.15); }
        50%      { box-shadow: 0 0 0 8px rgba(52,211,153,.05); }
      }
    </style>
  `
}

// ─── PiP (Picture-in-Picture) — janela flutuante ──────────────────────
async function abrirPiP() {
  if (!('documentPictureInPicture' in window)) {
    // Fallback: abre janela popup normal
    abrirPopupFallback()
    return
  }
  try {
    if (_pipWindow && !_pipWindow.closed) { _pipWindow.focus(); return }
    _pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 380,
      height: 540,
    })

    // Copia estilos do CRM
    const link = _pipWindow.document.createElement('link')
    link.rel = 'stylesheet'
    // Pega a folha de estilo principal do CRM (vite injeta inline em dev, em prod fica linkada)
    const ss = [...document.styleSheets].find(s => s.href && s.href.includes('assets'))
    if (ss?.href) {
      link.href = ss.href
      _pipWindow.document.head.appendChild(link)
    }

    // Copia variáveis CSS root
    const inline = _pipWindow.document.createElement('style')
    inline.textContent = `
      :root { --bg:#0A0A0A; --bg-alt:#111; --bg-card:#161616; --line:rgba(255,255,255,.07); --text:#fff; --text-2:#A0A0A0; --text-3:#555; --accent:#C5F82A; --ok:#34D399; --info:#4A9EFF; --danger:#FF5C5C; }
      *,*::before,*::after { box-sizing:border-box;margin:0;padding:0 }
      body { font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);padding:16px;font-size:13px;line-height:1.5 }
      .pip-head { display:flex;align-items:center;gap:8px;margin-bottom:14px }
      .pip-dot { width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 4px rgba(52,211,153,.15);animation:pip-pulse 2s infinite }
      .pip-h { font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;font-weight:600 }
      .pip-card { background:var(--bg-card);border:1px solid var(--line);border-radius:8px;padding:12px;margin-bottom:8px }
      .pip-label { font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px }
      .pip-value { font-size:22px;font-weight:700;letter-spacing:-.02em }
      .pip-sub { font-size:11px;color:var(--text-3);margin-top:2px }
      .pip-row { display:grid;grid-template-columns:1fr 1fr;gap:6px }
      .pip-last { font-size:11px;color:var(--text-2);padding:10px 0;border-top:1px solid var(--line);margin-top:8px }
      .pip-last-row { display:flex;justify-content:space-between;padding:4px 0 }
      .pip-prov-bar { height:4px;border-radius:2px;background:rgba(255,255,255,.04);overflow:hidden;margin:2px 0 8px }
      .pip-prov-fill { height:100%;border-radius:2px;transition:width .3s }
      @keyframes pip-pulse { 0%,100%{box-shadow:0 0 0 4px rgba(52,211,153,.15)} 50%{box-shadow:0 0 0 8px rgba(52,211,153,.05)} }
    `
    _pipWindow.document.head.appendChild(inline)

    const container = _pipWindow.document.createElement('div')
    container.id = 'pip-root'
    _pipWindow.document.body.appendChild(container)
    _pipWindow.document.title = 'Uso IA · ao vivo'

    const atualizar = async () => {
      try {
        const s = await fetchStats()
        container.innerHTML = pipHTML(s)
      } catch (e) {
        container.innerHTML = `<div style="color:var(--danger);padding:20px;text-align:center;font-size:12px">${esc(e.message)}</div>`
      }
    }
    await atualizar()
    _pipTimer = setInterval(atualizar, 15000) // mais frequente que o main (15s)

    _pipWindow.addEventListener('pagehide', () => {
      if (_pipTimer) { clearInterval(_pipTimer); _pipTimer = null }
      _pipWindow = null
    })

    toast('Janela flutuante aberta — fica em cima de qualquer app')
  } catch (e) {
    console.error('[PiP]', e)
    toast('Não consegui abrir PiP: ' + e.message, 'err')
    abrirPopupFallback()
  }
}

function abrirPopupFallback() {
  const w = window.open('', 'usoIA', 'popup,width=380,height=540,resizable=yes')
  if (!w) { toast('Popup bloqueado pelo browser', 'err'); return }
  w.document.write(`<!doctype html><html><head><title>Uso IA</title><meta charset="utf-8"></head><body>Carregando…</body></html>`)
  toast('PiP não suportado neste browser. Abri popup tradicional.', 'warn')
  // Mesmo loop, mas usando popup
  _pipWindow = w
  // (estilos minimos pra fallback)
}

function pipHTML(stats) {
  const b = stats.bot || {}
  const providers = Object.entries(b.por_provider || {}).sort((a, b) => b[1].total_tokens - a[1].total_tokens)
  const totalProv = providers.reduce((s, [, v]) => s + v.total_tokens, 0) || 1
  const ultima = (b.ultimas_chamadas || [])[0]

  const provBars = providers.slice(0, 3).map(([name, v]) => {
    const pct = Math.round(v.total_tokens / totalProv * 100)
    const cor = name === 'groq' ? '#F55036' : name === 'openrouter' ? '#4A9EFF' : name === 'anthropic' ? '#C5F82A' : '#A0A0A0'
    return `
      <div style="font-size:11px;display:flex;justify-content:space-between;color:${cor}">
        <span>${esc(name)}</span><span style="color:var(--text-3)">${fmtNum(v.total_tokens)}</span>
      </div>
      <div class="pip-prov-bar"><div class="pip-prov-fill" style="width:${pct}%;background:${cor}"></div></div>
    `
  }).join('')

  return `
    <div class="pip-head">
      <span class="pip-dot"></span>
      <span class="pip-h">Uso IA · ao vivo</span>
    </div>

    <div class="pip-row">
      <div class="pip-card">
        <div class="pip-label">Hoje</div>
        <div class="pip-value" style="color:var(--accent)">${fmtNum(b.hoje?.total_tokens)}</div>
        <div class="pip-sub">${b.hoje?.chamadas || 0} chamadas · ${fmtUSD(b.hoje?.custo_usd)}</div>
      </div>
      <div class="pip-card">
        <div class="pip-label">Mês</div>
        <div class="pip-value">${fmtNum(b.mes?.total_tokens)}</div>
        <div class="pip-sub">${fmtUSD(b.mes?.custo_usd)} · ${fmtBRL(b.mes?.custo_usd)}</div>
      </div>
    </div>

    <div class="pip-card">
      <div class="pip-label" style="margin-bottom:8px">Providers (mês)</div>
      ${provBars || '<div style="font-size:11px;color:var(--text-3)">Sem dados ainda</div>'}
    </div>

    <div class="pip-card">
      <div class="pip-label">Última chamada</div>
      ${ultima ? `
        <div class="pip-last-row">
          <span>${esc(ultima.provider)}</span>
          <span style="color:var(--text-3)">${esc(tempoCompact(ultima.quando))}</span>
        </div>
        <div class="pip-last-row" style="border:0;padding:0">
          <span style="color:var(--text-2);font-size:11px">${esc(ultima.origem || '—')}</span>
          <span style="color:var(--accent);font-size:11px">${fmtNum(ultima.tokens)} tok</span>
        </div>
      ` : '<div style="font-size:11px;color:var(--text-3)">Nenhuma chamada ainda</div>'}
    </div>

    <div style="font-size:10px;color:var(--text-3);text-align:center;margin-top:8px">atualiza a cada 15s</div>
  `
}

// ─── Render principal da view ──────────────────────────────────────────
export async function render() {
  const c = document.getElementById('content')
  if (!c.dataset.usoInit) {
    c.innerHTML = '<div class="empty">Carregando uso em tempo real…</div>'
    c.dataset.usoInit = '1'
  }

  async function atualizar() {
    try {
      const stats = await fetchStats()
      c.innerHTML = buildHTML(stats)

      // Checa alertas — janela 5h (Anthropic) é o alerta PRINCIPAL
      const t5h = Number(stats.anthropic?.janela_5h?.total_tokens || 0)
      checarAlerta5h(t5h)
      checarAlertaMes(Number(stats.bot?.mes?.custo_usd || 0))

      // Wire dos botões
      c.querySelector('#uso-pip')?.addEventListener('click', abrirPiP)
      c.querySelector('#uso-test-beep')?.addEventListener('click', () => {
        beep('urgente')
        toast('Som de alerta — é assim que você vai escutar ao atingir 80%')
      })
      c.querySelector('#uso-limit-5h-save')?.addEventListener('click', () => {
        const v = Number(document.getElementById('uso-limit-5h').value)
        if (v < 0) return toast('Limite inválido', 'err')
        setLimit5h(v)
        toast(`Limite da janela 5h salvo: ${fmtNum(v)} tokens. Alertas reiniciados.`)
        atualizar()
      })
      c.querySelector('#uso-budget-save')?.addEventListener('click', () => {
        const v = Number(document.getElementById('uso-budget').value)
        if (v < 0) return toast('Teto inválido', 'err')
        setBudget(v)
        toast(`Teto mensal salvo: ${fmtUSD(v)}. Alertas reiniciados.`)
        atualizar()
      })
    } catch (e) {
      c.innerHTML = `<div class="empty">Erro ao carregar: ${esc(e.message)}</div>`
    }
  }

  // Pede permissão de notificação uma vez (não bloqueia se recusar)
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission().catch(() => {}), 2000)
  }

  await atualizar()
  if (_timer) clearInterval(_timer)
  _timer = setInterval(() => {
    // Só atualiza se ainda tá na view de uso
    if (document.body.dataset.view !== 'uso') {
      clearInterval(_timer); _timer = null
      return
    }
    atualizar()
  }, 30000)
}
