// Painel de controle da instância WhatsApp (UazAPI) — Sofia.
// Mostra status, último contato recebido, QR pra reconectar, restart.
// Chama a edge function /functions/v1/instancia (proxy server-side).
import { db } from '../db.js'
import { fmtd, toast } from '../utils.js'

const SB_URL = 'https://flzpblpegoqjxaacjvhf.supabase.co'
const FN_URL = `${SB_URL}/functions/v1/instancia`

let _polling = null
let _state   = null

// Marca: quando a view tá montada, o body tem data-view="instancia" (setado
// pelo main.js.go()). Se o usuário navega pra outra tela, o body muda pra
// outra view — aí abortamos o polling. ANTES a gente checava só content.dataset,
// mas isso era bug: innerHTML=... não limpa atributos do próprio elemento,
// então o polling continuava sobrescrevendo o Pipeline etc.
function viewAtiva() {
  return document.body.dataset.view === 'instancia'
}
function pararPolling() {
  if (_polling) { clearInterval(_polling); _polling = null }
}

export async function render() {
  pararPolling()
  document.getElementById('tbacts').innerHTML =
    `<button class="btn bp bsm" id="ins-refresh">Atualizar</button>`
  document.getElementById('ins-refresh').addEventListener('click', () => carregar(true))

  const c = document.getElementById('content')
  c.dataset.view = 'instancia'
  c.innerHTML = '<div class="empty">Consultando a UazAPI...</div>'
  await carregar(true)
}

async function carregar(showLoading = false) {
  if (!viewAtiva()) { pararPolling(); return }
  const c = document.getElementById('content')
  if (showLoading && !_state) c.innerHTML = '<div class="empty">Consultando a UazAPI...</div>'

  try {
    const [apiRes, db1, db2] = await Promise.all([
      fetch(`${FN_URL}?action=status`).then(r => r.json()).catch(e => ({ error: String(e) })),
      // Última mensagem recebida de lead
      db.from('chatbot_conversations')
        .select('phone, last_message_at, updated_at, lead_data')
        .not('phone', 'like', '__%')
        .not('last_message_at', 'is', null)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      // Total de conversas atualizadas hoje
      db.from('chatbot_conversations')
        .select('phone', { count: 'exact', head: true })
        .gte('updated_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .not('phone', 'like', '__%'),
    ])

    _state = {
      api:        apiRes,
      ultimaMsg:  db1?.data || null,
      hoje:       db2?.count || 0,
    }
    renderPage()
    decidirPolling()
  } catch (e) {
    c.innerHTML = `<div class="empty">Erro: ${e.message}</div>`
  }
}

// ── Parsing da resposta UazAPI ─────────────────────────────────────────────
// Estrutura real:
// { ok, data: { connected: bool, loggedIn: bool, instance: { status, name, owner, qrcode, profileName, ... } } }
function inst(api) { return api?.data?.instance || {} }

function getStatus(api) {
  const d = api?.data
  if (!d) return 'unknown'
  if (d.connected === true)  return 'connected'
  if (inst(api).qrcode)      return 'connecting'
  if (d.connected === false) return 'disconnected'
  return 'unknown'
}

function getPhone(api) {
  return inst(api).owner || inst(api).phone || null
}

function getProfileName(api) {
  return inst(api).profileName || null
}

function getInstanceName(api) {
  return inst(api).name || 'sofia'
}

function getQR(api) {
  let qr = inst(api).qrcode
  if (!qr) return null
  qr = String(qr)
  if (qr.startsWith('data:image')) return qr
  if (qr.startsWith('http'))       return qr
  return `data:image/png;base64,${qr}`
}

// ── Render ──────────────────────────────────────────────────────────────────
function renderPage() {
  if (!viewAtiva()) { pararPolling(); return }
  const status   = getStatus(_state.api)
  const phone    = getPhone(_state.api)
  const profName = getProfileName(_state.api)
  const instName = getInstanceName(_state.api)
  const qr       = getQR(_state.api)
  const apiOk    = _state.api?.ok !== false
  const apiErr   = _state.api?.error || (_state.api?.httpStatus && _state.api.httpStatus >= 400 ? `HTTP ${_state.api.httpStatus}` : null)

  const corStatus = {
    connected:    { bg: 'rgba(193,255,42,.10)', border: 'var(--ok)',    cor: 'var(--ok)',    icon: '✓', label: 'CONECTADA' },
    disconnected: { bg: 'rgba(255,92,92,.10)',  border: 'var(--danger)', cor: 'var(--danger)', icon: '✕', label: 'DESCONECTADA' },
    connecting:   { bg: 'rgba(245,166,35,.10)', border: 'var(--warn)',   cor: 'var(--warn)',   icon: '⟳', label: 'AGUARDANDO QR' },
    unknown:      { bg: 'rgba(255,255,255,.04)', border: 'var(--line)',   cor: 'var(--text-3)', icon: '?', label: 'DESCONHECIDO' },
  }[status] || { bg: 'rgba(255,255,255,.04)', border: 'var(--line)', cor: 'var(--text-3)', icon: '?', label: status.toUpperCase() }

  const ultMsgInfo = _state.ultimaMsg
    ? `<b style="color:var(--text-2)">${esc(_state.ultimaMsg.lead_data?.nome || _state.ultimaMsg.phone)}</b><br>
       <span style="font-size:11px;color:var(--text-3)">${fmtd(_state.ultimaMsg.last_message_at)}</span>`
    : `<span style="color:var(--text-3)">Nenhuma mensagem registrada</span>`

  const qrBox = qr ? `
    <div style="background:#fff;padding:14px;border-radius:12px;display:inline-block">
      <img src="${qr}" alt="QR code WhatsApp" style="width:280px;height:280px;display:block">
    </div>
    <div style="font-size:12px;color:var(--text-3);margin-top:10px;text-align:center;max-width:300px">
      Abra o WhatsApp do número da Sofia → ⋮ → Dispositivos conectados → Conectar um aparelho → Escaneie o QR acima.
    </div>` : ''

  const acoes = status === 'connected'
    ? `<button class="btn bd" id="ins-disconnect">Desconectar</button>`
    : `<button class="btn bp" id="ins-connect">Gerar QR / Reconectar</button>`

  const c = document.getElementById('content')
  c.innerHTML = `
    <!-- Status principal -->
    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>Instância WhatsApp</h3></div>
      <div style="padding:24px;display:grid;grid-template-columns:1.2fr 1fr;gap:24px">
        <div>
          <div style="display:inline-flex;align-items:center;gap:10px;background:${corStatus.bg};border:1px solid ${corStatus.border};color:${corStatus.cor};padding:8px 16px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.08em">
            <span style="font-size:14px">${corStatus.icon}</span>
            ${corStatus.label}
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;margin-top:22px">
            <div>
              <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Número conectado</div>
              <div style="font-size:18px;font-weight:600;font-family:ui-monospace,monospace">${phone ? formatPhone(phone) : '—'}</div>
              ${profName ? `<div style="font-size:12px;color:var(--text-3);margin-top:2px">${esc(profName)}</div>` : ''}
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Última mensagem recebida</div>
              <div style="font-size:13px;line-height:1.5">${ultMsgInfo}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Conversas atualizadas hoje</div>
              <div style="font-size:24px;font-weight:700;color:var(--accent)">${_state.hoje}</div>
            </div>
          </div>

          <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap">${acoes}</div>

          ${apiErr ? `<div style="margin-top:18px;padding:12px 14px;border-left:3px solid var(--danger);background:rgba(255,92,92,.08);color:var(--danger);font-size:12px;border-radius:0 6px 6px 0">UazAPI erro: ${esc(apiErr)}</div>` : ''}
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;background:var(--bg-card);border:1px solid var(--line);border-radius:12px">
          ${qr ? qrBox : `
            <div style="text-align:center;color:var(--text-3);font-size:13px;line-height:1.6">
              ${status === 'connected'
                ? '🟢 Tudo no ar.<br>Sofia respondendo via WhatsApp.'
                : 'Clique em <b>Gerar QR / Reconectar</b><br>pra ver o QR aqui.'}
            </div>`}
        </div>
      </div>
    </div>

    <!-- Detalhes técnicos -->
    <div class="tw">
      <div class="th"><h3>Detalhes técnicos</h3></div>
      <div style="padding:18px 22px;display:grid;grid-template-columns:1fr 1fr;gap:18px;font-size:12px">
        <div>
          <div style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Endpoint UazAPI</div>
          <div style="font-family:ui-monospace,monospace;color:var(--text-2)">adriane.uazapi.com</div>
        </div>
        <div>
          <div style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Instância</div>
          <div style="font-family:ui-monospace,monospace;color:var(--text-2)">${esc(instName)}</div>
        </div>
        <div>
          <div style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Webhook</div>
          <div style="font-family:ui-monospace,monospace;color:var(--text-2);word-break:break-all;font-size:11px">${SB_URL}/functions/v1/webhook</div>
        </div>
        <div>
          <div style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Polling automático</div>
          <div style="color:var(--text-2)">${_polling ? '🔴 ativo (a cada 5s enquanto não conecta)' : 'desligado (conectado)'}</div>
        </div>
      </div>
    </div>

    <!-- Raw response (debug) -->
    <details style="margin-top:18px">
      <summary style="cursor:pointer;font-size:12px;color:var(--text-3);padding:8px">Ver resposta crua da UazAPI</summary>
      <pre style="background:var(--bg-card);border:1px solid var(--line);border-radius:8px;padding:14px;font-size:11px;color:var(--text-2);overflow:auto;max-height:300px;font-family:ui-monospace,monospace">${esc(JSON.stringify(_state.api, null, 2))}</pre>
    </details>`

  // Listeners dos botões
  const cn = document.getElementById('ins-connect')
  const ds = document.getElementById('ins-disconnect')
  if (cn) cn.addEventListener('click', () => acao('connect',    'Gerando QR…',     'QR gerado'))
  if (ds) ds.addEventListener('click', () => acao('disconnect', 'Desconectando…', 'Desconectada'))
}

async function acao(action, msgInicio, msgFim) {
  toast(msgInicio)
  try {
    const r = await fetch(`${FN_URL}?action=${action}`, { method: 'POST' }).then(r => r.json())
    if (r.error || r.ok === false) {
      toast('Falhou: ' + (r.error || `HTTP ${r.httpStatus}`), 'er')
    } else {
      toast(msgFim)
    }
    // Aguarda 1s e atualiza
    setTimeout(() => carregar(false), 1000)
  } catch (e) {
    toast('Erro: ' + e.message, 'er')
  }
}

// Polling automático apenas quando a view tá ativa E não conectado
function decidirPolling() {
  const status = getStatus(_state.api)
  const naoConectado = status !== 'connected'

  if (!viewAtiva()) { pararPolling(); return }

  if (naoConectado && !_polling) {
    _polling = setInterval(() => {
      if (!viewAtiva()) { pararPolling(); return }
      carregar(false)
    }, 5000)
  } else if (!naoConectado && _polling) {
    pararPolling()
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
function formatPhone(p) {
  const d = String(p).replace(/\D/g, '').replace(/^55/, '')
  if (d.length === 11) return `+55 (${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  if (d.length === 10) return `+55 (${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return p
}
