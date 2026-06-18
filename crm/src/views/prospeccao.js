import { db } from '../db.js'
import { toast } from '../utils.js'

let _timer = null

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
))

// ─── Pausar / retomar o bot pra um lead específico ──────────────
async function pausarBot(phone) {
  const pausado_ate = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
  // Busca o lead_data atual pra preservar e adicionar pausado_ate
  const { data: row } = await db.from('chatbot_conversations')
    .select('lead_data, stage').eq('phone', phone).maybeSingle()
  if (!row) { toast('Conversa não encontrada.', 'er'); return }
  const lead_data = { ...(row.lead_data || {}), pausado_ate, stage_antes_pausa: row.stage }
  const { error } = await db.from('chatbot_conversations')
    .update({ stage: 'em_pausa', lead_data, updated_at: new Date().toISOString() })
    .eq('phone', phone)
  if (error) { toast('Erro: ' + error.message, 'er'); return }
  toast('Bot pausado pra este lead.')
  render()
}

async function retomarBot(phone) {
  const { data: row } = await db.from('chatbot_conversations')
    .select('lead_data').eq('phone', phone).maybeSingle()
  if (!row) { toast('Conversa não encontrada.', 'er'); return }
  const ld = { ...(row.lead_data || {}) }
  const stageAntes = ld.stage_antes_pausa || 'situacao'
  delete ld.pausado_ate
  delete ld.stage_antes_pausa
  const { error } = await db.from('chatbot_conversations')
    .update({ stage: stageAntes, lead_data: ld, updated_at: new Date().toISOString() })
    .eq('phone', phone)
  if (error) { toast('Erro: ' + error.message, 'er'); return }
  toast('Bot retomado.')
  render()
}

function tempoRel(iso) {
  if (!iso) return ''
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return d < 30 ? `há ${d}d` : new Date(iso).toLocaleDateString('pt-BR')
}

const AV_CORES = ['#4A9EFF', '#A78BFA', '#34D399', '#F5A623', '#FF6B9D', '#22D3EE']
function corAvatar(s) {
  let h = 0
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AV_CORES[h % AV_CORES.length]
}

const IC = {
  fila:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  sent:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  reply: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  meet:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>`,
}

export async function render() {
  if (_timer) { clearInterval(_timer); _timer = null }
  const c = document.getElementById('content')
  document.getElementById('tbacts').innerHTML = ''
  if (!document.getElementById('prosp-root')) {
    c.innerHTML = '<div class="empty">Carregando...</div>'
  }

  try {
    const { count: naFila } = await db.from('clientes')
      .select('*', { count: 'exact', head: true }).eq('status', 'prospeccao')

    const { data: convs } = await db.from('chatbot_conversations')
      .select('phone, messages, lead_data, updated_at, stage')
      .eq('lead_data->>origem', 'disparo_prospeccao')
      .order('updated_at', { ascending: false })
    const lista = convs || []

    // Usuário saiu da aba durante o carregamento? aborta sem sobrescrever.
    if (document.getElementById('vtitle')?.textContent !== 'Prospecção') return

    const contatados  = lista.length
    const responderam = lista.filter(x => Array.isArray(x.messages) && x.messages.some(m => m.role === 'user')).length
    const reunioes    = lista.filter(x => x.lead_data?.reuniao_agendada).length
    const fila        = naFila || 0
    const total       = fila + contatados
    const pct         = total ? Math.round(contatados / total * 100) : 0
    const taxaResp    = contatados ? Math.round(responderam / contatados * 100) : 0

    const stats = [
      { ic: IC.fila,  l: 'Na fila',     v: fila,        cor: 'var(--text)' },
      { ic: IC.sent,  l: 'Contatados',  v: contatados,  cor: 'var(--info)' },
      { ic: IC.reply, l: 'Responderam', v: responderam, cor: 'var(--ok)' },
      { ic: IC.meet,  l: 'Reuniões',    v: reunioes,    cor: 'var(--accent)' },
    ]
    const statCards = stats.map(s => `
      <div class="apnl-st">
        <div class="apnl-st-ic">${s.ic}</div>
        <div class="apnl-st-l">${s.l}</div>
        <div class="apnl-st-v" style="color:${s.cor}">${s.v.toLocaleString('pt-BR')}</div>
      </div>`).join('')

    const rows = lista.slice(0, 12).map(x => {
      const ld = x.lead_data || {}
      const nome = ld.empresa || ld.nome || x.phone || '—'
      const msgs = Array.isArray(x.messages) ? x.messages : []
      const ult = msgs.length ? msgs[msgs.length - 1] : null
      const txt = ult?.content ? ult.content.replace(/\s+/g, ' ').trim() : '—'
      const respondeu = msgs.some(m => m.role === 'user')
      const pausado = x.stage === 'em_pausa'
      let chip
      if (pausado) chip = ['off', 'Pausado']
      else if (ld.reuniao_agendada) chip = ['meet', 'Reunião 🎯']
      else if (x.stage === 'encerrado' || ld.opt_out) chip = ['off', 'Encerrada']
      else if (respondeu) chip = ['on', 'Respondeu']
      else chip = ['wait', 'Aguardando']
      const ini = (nome.replace(/[^a-zA-Z0-9]/g, '')[0] || '#').toUpperCase()
      const cor = corAvatar(nome)
      const btnLabel = pausado ? 'Retomar' : 'Pausar bot'
      const btnAct = pausado ? 'retomar' : 'pausar'
      return `
        <div class="apnl-conv-row" data-phone="${esc(x.phone)}">
          <div class="apnl-av" style="background:${cor}22;color:${cor}">${ini}</div>
          <div class="apnl-cinfo">
            <div class="apnl-cname">${esc(nome)}</div>
            <div class="apnl-cmsg">${esc(txt)}</div>
          </div>
          <div class="apnl-cmeta">
            <span class="apnl-chip ${chip[0]}">${chip[1]}</span>
            <span class="apnl-ctime">${tempoRel(x.updated_at)}</span>
            <button class="btn bg bsm prosp-bot-btn" data-act="${btnAct}" data-phone="${esc(x.phone)}" style="margin-top:4px;font-size:11px;padding:4px 10px">${btnLabel}</button>
          </div>
        </div>`
    }).join('')

    c.innerHTML = `
      <div class="apnl" id="prosp-root">
        <div class="prosp-prog">
          <div class="prosp-prog-top">
            <span><b style="color:var(--text)">${contatados.toLocaleString('pt-BR')}</b> de ${total.toLocaleString('pt-BR')} leads contatados</span>
            <span>${pct}% &nbsp;·&nbsp; taxa de resposta <b style="color:var(--ok)">${taxaResp}%</b></span>
          </div>
          <div class="prosp-prog-bar"><div class="prosp-prog-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="apnl-stats">${statCards}</div>
        <div class="apnl-conv">
          <div class="apnl-conv-h">Atividade recente do disparo</div>
          ${rows || '<div class="empty" style="padding:30px">Nenhum disparo ainda. Quando você rodar o <b>disparo.bat</b>, os contatos vão aparecer aqui ao vivo.</div>'}
        </div>
        <div style="font-size:11px;color:var(--text-3);text-align:right">atualiza sozinho a cada 30s</div>
      </div>`

    // Handler dos botões "Pausar bot" / "Retomar" em cada lead
    document.querySelectorAll('.prosp-bot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phone = e.currentTarget.dataset.phone
        const act = e.currentTarget.dataset.act
        if (!phone) return
        if (act === 'pausar') pausarBot(phone)
        else retomarBot(phone)
      })
    })

    _timer = setInterval(() => {
      if (!document.getElementById('prosp-root')) { clearInterval(_timer); _timer = null; return }
      render()
    }, 30000)
  } catch (e) {
    c.innerHTML = `<div class="empty">Erro ao carregar: ${e.message}</div>`
  }
}
