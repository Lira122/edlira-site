// ════════════════════════════════════════════════════════════════
//  Eleva · Claude Usage Monitor — background service worker
//
//  A cada 5min:
//   1. Faz fetch no endpoint interno do claude.ai (autenticado via
//      cookie da sessão logada do usuário)
//   2. Extrai % da sessão atual, reset, semanal, opus
//   3. POSTa pro CRM (claude-usage-ingest)
//
//  Tudo silencioso. Usuário só interage se clicar no ícone (popup).
// ════════════════════════════════════════════════════════════════

const INGEST_URL = 'https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/claude-usage-ingest'
const ALARM_NAME = 'eleva-claude-usage-tick'

// Endpoint interno do claude.ai que retorna o uso. Confirmado
// inspecionando a aba Network ao abrir /settings/usage. Pode mudar
// no futuro — se quebrar, atualiza aqui.
const CLAUDE_USAGE_URL = 'https://claude.ai/api/account/usage'

async function getIngestToken() {
  const { ingest_token } = await chrome.storage.sync.get('ingest_token')
  return ingest_token || ''
}

async function fetchClaudeUsage() {
  // O fetch usa os cookies já logados do usuário no claude.ai
  // (porque temos host_permissions pra claude.ai)
  const r = await fetch(CLAUDE_USAGE_URL, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  })
  if (!r.ok) throw new Error(`claude.ai HTTP ${r.status}`)
  return r.json()
}

// Normaliza o JSON pra formato simples que o CRM entende.
// Os nomes dos campos podem variar conforme claude.ai atualiza.
function normalizar(raw) {
  // Tenta vários caminhos comuns
  const plano = raw?.subscription?.plan
              || raw?.plan
              || raw?.account?.plan
              || null

  // Sessão atual (5h window)
  const sessao = raw?.current_session
              || raw?.session
              || raw?.fiveHourWindow
              || {}
  const sessao_pct       = num(sessao.usage_percent ?? sessao.usagePercent ?? sessao.percent_used)
  const sessao_reseta_em = sessao.resets_at || sessao.reset_at || sessao.resetAt || null

  // Limite semanal
  const semana = raw?.weekly || raw?.week || raw?.weeklyLimits || {}
  const semana_pct       = num(semana.usage_percent ?? semana.usagePercent ?? semana.percent_used)
  const semana_reseta_em = semana.resets_at || semana.reset_at || semana.resetAt || null

  // Opus específico (se aparecer)
  const opus_pct = num(raw?.opus?.usage_percent ?? raw?.opusUsage?.percent ?? null)

  return {
    plano,
    sessao_pct,
    sessao_reseta_em,
    semana_pct,
    semana_reseta_em,
    opus_pct,
    dados_brutos: raw, // mando o JSON inteiro pra debugar/ajustar depois
  }
}

function num(v) {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

async function enviar(snapshot) {
  const token = await getIngestToken()
  if (!token) {
    console.warn('[Eleva] ingest_token não configurado. Clica no ícone da extensão pra configurar.')
    return { ok: false, motivo: 'sem token' }
  }
  const r = await fetch(INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ingest-token': token,
    },
    body: JSON.stringify(snapshot),
  })
  return r.json().catch(() => ({ ok: false }))
}

async function ciclo() {
  try {
    const raw = await fetchClaudeUsage()
    const snap = normalizar(raw)
    const res = await enviar(snap)
    await chrome.storage.local.set({
      ultimo_status: { ts: Date.now(), ok: !!res?.ok, snap, resposta: res },
    })
    console.log('[Eleva]', new Date().toLocaleTimeString(), 'snapshot enviado', snap)
  } catch (e) {
    await chrome.storage.local.set({
      ultimo_status: { ts: Date.now(), ok: false, erro: String(e) },
    })
    console.error('[Eleva] falha no ciclo:', e)
  }
}

// Cria alarme periódico (5min) na instalação
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 5, delayInMinutes: 0.5 })
  console.log('[Eleva] extensão instalada — alarme de 5min criado')
})

// Recria o alarme quando o service worker reinicia
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 5, delayInMinutes: 0.5 })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) ciclo()
})

// Endpoint pra popup forçar uma sincronização manual
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.tipo === 'forcar_sync') {
    ciclo().then(() => sendResponse({ ok: true })).catch((e) => sendResponse({ ok: false, erro: String(e) }))
    return true // async response
  }
  if (msg?.tipo === 'status') {
    chrome.storage.local.get('ultimo_status').then(({ ultimo_status }) => sendResponse(ultimo_status || null))
    return true
  }
})
