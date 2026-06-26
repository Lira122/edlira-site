// ═══════════════════════════════════════════════════════════════════
// TESTAR BOT — sandbox pra conversar com o Lira IA sem mandar pra
// ninguém de verdade. Chama a edge function bot-test que reusa o
// mesmo system prompt do webhook de produção.
//
// Útil pra:
// - Validar mudanças no prompt antes de afetar leads reais
// - Treinar a equipe vendo o que o bot responde em cenários
// - Testar bordas (lead chato, lead frio, lead já fechou negócio)
// ═══════════════════════════════════════════════════════════════════
import { sbAuth } from '../auth.js'
import { toast } from '../utils.js'

let _hist = []           // [{role, content}] (do ponto de vista da IA)
let _stage = 'inicio'
let _lead  = {}
let _busy  = false

const SUGS = [
  { lbl: '👋 "Oi"', txt: 'Oi' },
  { lbl: '🙋 "Tudo bem? Quem fala?"', txt: 'Tudo bem? Quem fala?' },
  { lbl: '🤔 "Por que está me chamando?"', txt: 'Por que tá me chamando?' },
  { lbl: '🏪 Lead engajado', txt: 'Oi! Sou a Maria, tenho uma loja de roupa aqui em Taubaté. Conta mais.' },
  { lbl: '😒 Lead frio', txt: 'Não tô interessado em nada, valeu' },
  { lbl: '💰 Pergunta preço', txt: 'Quanto vocês cobram?' },
  { lbl: '🤖 Desconfia bot', txt: 'Isso é um bot né?' },
  { lbl: '🏁 Lead encerrou negócio', txt: 'Vendi a empresa ano passado, tô aposentado' },
]

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = layout()
  wire(c)
}

function layout() {
  return `
  <div class="tb">
    <div class="tb-side">
      <div class="tb-block">
        <div class="tb-block-tit">Estado da conversa</div>
        <div class="tb-state">
          <div><span class="tb-k">Estágio</span><span class="tb-v" id="tb-stage">${escapeHtml(_stage)}</span></div>
          <div><span class="tb-k">Mensagens</span><span class="tb-v" id="tb-count">${_hist.length}</span></div>
        </div>
        <div class="tb-lead-data" id="tb-lead">${renderLead()}</div>
        <button class="btn bd bsm" id="tb-reset" style="width:100%;margin-top:14px">↻ Limpar conversa</button>
      </div>

      <div class="tb-block">
        <div class="tb-block-tit">Cenários rápidos</div>
        <div class="tb-sugs">
          ${SUGS.map((s, i) => `<button class="tb-sug" data-sug="${i}">${s.lbl}</button>`).join('')}
        </div>
      </div>

      <div class="tb-block tb-hint">
        <div class="tb-block-tit">⚠️ Modo sandbox</div>
        <div class="tb-hint-txt">
          As mensagens NÃO vão pro WhatsApp.<br>
          Não criam lead, não logam disparo.<br>
          Só roda a IA pra você ver a resposta.
        </div>
      </div>
    </div>

    <div class="tb-chat">
      <div class="tb-chat-body" id="tb-body">
        ${_hist.length ? _hist.map(renderMsg).join('') : renderEmpty()}
      </div>
      <form class="tb-input" id="tb-form">
        <textarea id="tb-text" placeholder="Digita como se fosse o lead respondendo no Zap..." rows="1"></textarea>
        <button type="submit" class="tb-send" id="tb-send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
  </div>`
}

function renderEmpty() {
  return `<div class="tb-empty">
    <div class="tb-empty-ico">💬</div>
    <div class="tb-empty-tit">Manda a primeira mensagem</div>
    <div class="tb-empty-sub">Você é o LEAD. Escreve aqui como se tivesse recebido o disparo de prospecção.<br>O Lira-IA vai responder do outro lado.</div>
  </div>`
}

function renderLead() {
  const keys = Object.keys(_lead).filter(k => _lead[k] && (typeof _lead[k] !== 'object' || _lead[k]?.length))
  if (!keys.length) return '<div class="tb-lead-empty">— ainda sem dados capturados</div>'
  return keys.map(k => `<div><span class="tb-k">${k}</span><span class="tb-v">${escapeHtml(String(Array.isArray(_lead[k]) ? _lead[k].join(', ') : _lead[k]))}</span></div>`).join('')
}

function renderMsg(m) {
  // No bot-test, "user" = LEAD, "assistant" = BOT (Lira)
  const role = m.role === 'user' ? 'lead' : 'bot'
  return `<div class="tb-msg ${role}">
    ${role === 'bot' ? '<div class="tb-msg-av">🤖</div>' : ''}
    <div class="tb-msg-bubble">${escapeHtml(m.content)}</div>
  </div>`
}

function wire(root) {
  root.querySelector('#tb-reset')?.addEventListener('click', () => {
    if (!confirm('Limpar a conversa de teste?')) return
    _hist = []; _stage = 'inicio'; _lead = {}
    render()
  })

  root.querySelectorAll('[data-sug]').forEach(b => {
    b.addEventListener('click', () => {
      const s = SUGS[+b.dataset.sug]
      enviar(s.txt)
    })
  })

  const form = root.querySelector('#tb-form')
  const ta   = root.querySelector('#tb-text')
  form?.addEventListener('submit', e => {
    e.preventDefault()
    const v = ta.value; ta.value = ''; ta.style.height = 'auto'
    enviar(v)
  })
  ta?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit() }
  })
  ta?.addEventListener('input', () => {
    ta.style.height = 'auto'
    ta.style.height = Math.min(120, ta.scrollHeight) + 'px'
  })
}

async function enviar(texto) {
  texto = String(texto || '').trim()
  if (!texto || _busy) return
  _busy = true
  _hist.push({ role: 'user', content: texto })
  patchUI({ thinking: true })

  try {
    const r = await callBot(texto)
    if (!r.ok) throw new Error(r.erro || 'falha')
    // resposta pode ter múltiplas mensagens
    const partes = Array.isArray(r.messages) ? r.messages : [String(r.messages || '')]
    for (const p of partes) if (p) _hist.push({ role: 'assistant', content: p })
    _stage = r.stage || _stage
    _lead  = { ..._lead, ...(r.lead_data || {}) }
    if (r.action === 'book') toast('🗓️ Bot retornou action=book (em produção agendaria no Cal.com)')
  } catch (e) {
    _hist.push({ role: 'assistant', content: '⚠️ Erro ao chamar a IA: ' + (e.message || e) })
  } finally {
    _busy = false
    patchUI({ thinking: false })
  }
}

function patchUI({ thinking }) {
  const body  = document.getElementById('tb-body')
  const stage = document.getElementById('tb-stage')
  const count = document.getElementById('tb-count')
  const lead  = document.getElementById('tb-lead')
  if (!body) return

  let html = _hist.map(renderMsg).join('')
  if (!_hist.length) html = renderEmpty()
  if (thinking) html += `<div class="tb-msg bot"><div class="tb-msg-av">🤖</div><div class="tb-msg-bubble tb-typing">digitando…</div></div>`
  body.innerHTML = html
  body.scrollTop = body.scrollHeight

  if (stage) stage.textContent = _stage
  if (count) count.textContent = _hist.length
  if (lead)  lead.innerHTML  = renderLead()
}

async function callBot(userMessage) {
  // Pega o token JWT da sessão do user logado (auth do Supabase)
  const { data } = await sbAuth.auth.getSession()
  const token = data?.session?.access_token
  if (!token) throw new Error('Sessão expirou. Faça login de novo.')

  // History no formato OpenAI (sem a última do user, ela vai separada)
  const histPraIA = _hist.slice(0, -1).map(m => ({ role: m.role, content: m.content }))

  const res = await fetch('https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/bot-test', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      history: histPraIA,
      userMessage,
      stage: _stage,
      lead_data: _lead,
    }),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    return { ok: false, erro: `bot-test ${res.status}: ${t.slice(0,200)}` }
  }
  return await res.json()
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))
}
