import { db } from '../db.js'
import { fmtd, toast, openModal, closeModal, CANAIS } from '../utils.js'

let _ag = []

// ── Ícones ───────────────────────────────────────
const ICON_BOT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8" width="17" height="11.5" rx="2.5"/><path d="M12 8V4.5"/><circle cx="12" cy="3" r="1.3"/><path d="M8.5 13v1.5M15.5 13v1.5"/><path d="M1.5 13v3M22.5 13v3"/></svg>`
const ICON_CH = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 1 1 16.1-3.8z"/></svg>`
const ICON_TRASH = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>`
const IC_BACK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`
const IC_USERS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
const IC_CHAT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
const IC_PULSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
const IC_CLOCK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
))

// Tempo relativo amigável ("há 3h", "há 2d")
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

// ════════ LISTA DE AGENTES ════════════════════════════════════
export async function render() {
  document.getElementById('tbacts').innerHTML =
    `<button class="btn bp" id="btn-add-ag">+ Novo agente</button>`
  document.getElementById('btn-add-ag').addEventListener('click', addAgente)

  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  const { data, error } = await db.from('agentes').select('*').order('criado_em', { ascending: false })
  if (error) { c.innerHTML = `<div class="empty">Erro: ${error.message}</div>`; return }
  _ag = data || []

  if (!_ag.length) {
    c.innerHTML = `
      <div class="ag-empty">
        ${ICON_BOT}
        <h3>Nenhum agente de IA ainda</h3>
        <p>Crie seu primeiro agente para qualificar leads e agendar reuniões automaticamente.</p>
        <button class="btn bp" id="btn-add-ag2">+ Criar agente</button>
      </div>`
    document.getElementById('btn-add-ag2').addEventListener('click', addAgente)
    return
  }

  const cards = _ag.map(a => {
    const ativo = a.status === 'ativo'
    return `
    <div class="acard" data-painel="${a.id}">
      <div class="ach">
        <div class="aav">${ICON_BOT}</div>
        <div class="ahinfo">
          <div class="an">${esc(a.nome)}</div>
          <div class="acan">${ICON_CH}${esc(a.canal || 'Canal não definido')}</div>
        </div>
        <span class="apill ${ativo ? 'on' : 'off'}">${ativo ? 'Ativo' : 'Inativo'}</span>
      </div>
      ${a.prompt ? `<div class="adesc">${esc(a.prompt)}</div>` : ''}
      ${a.notas  ? `<div class="anote">${esc(a.notas)}</div>` : ''}
      <div class="aft">
        <div class="aacts">
          <button class="btn bg bsm edit-ag" data-id="${a.id}">Editar</button>
          <button class="btn bd bsm bic del-ag" data-id="${a.id}">${ICON_TRASH}</button>
        </div>
        <span class="adate">abrir painel →</span>
      </div>
    </div>`
  }).join('')

  c.innerHTML = `<div class="ag">${cards}</div>`

  c.addEventListener('click', (e) => {
    const edit = e.target.closest('.edit-ag')
    const del = e.target.closest('.del-ag')
    const card = e.target.closest('.acard')
    if (edit) { e.stopPropagation(); editAgente(edit.dataset.id) }
    else if (del) { e.stopPropagation(); delAgente(del.dataset.id) }
    else if (card) { renderPainel(card.dataset.painel) }
  })
}

// ════════ PAINEL DO AGENTE ═════════════════════════════════════
async function renderPainel(id) {
  const a = _ag.find(x => x.id === id)
  if (!a) { render(); return }

  document.getElementById('tbacts').innerHTML = ''
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando painel...</div>'

  // Conversas do bot
  const { data: convs } = await db.from('chatbot_conversations')
    .select('phone, messages, stage, lead_data, updated_at')
    .order('updated_at', { ascending: false })
  const lista = convs || []

  // Total de mensagens — usa a tabela `mensagens` se houver, senão soma os históricos
  const mr = await db.from('mensagens').select('id', { count: 'exact', head: true })
  const msgTotal = mr.count || lista.reduce(
    (s, x) => s + (Array.isArray(x.messages) ? x.messages.length : 0), 0)

  const corte = Date.now() - 7 * 24 * 60 * 60 * 1000
  const ultRole = (x) => {
    const m = x.messages
    return Array.isArray(m) && m.length ? m[m.length - 1]?.role : null
  }
  const aguardando = lista.filter(x => ultRole(x) === 'user').length
  const andamento = lista.filter(x =>
    !['opt_out', 'pausado'].includes(x.stage) &&
    x.updated_at && new Date(x.updated_at).getTime() > corte
  ).length

  const ativo = a.status === 'ativo'
  const stats = [
    { ic: IC_USERS, l: 'Conversas',          v: lista.length, cor: 'var(--info)' },
    { ic: IC_CHAT,  l: 'Mensagens trocadas', v: msgTotal,     cor: 'var(--text)' },
    { ic: IC_PULSE, l: 'Ativas (7 dias)',    v: andamento,    cor: 'var(--ok)' },
    { ic: IC_CLOCK, l: 'Aguardando resposta',v: aguardando,   cor: 'var(--warn)' },
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
    const encerrada = x.stage === 'opt_out'
    const esperando = ult?.role === 'user'
    const chip = encerrada ? ['off', 'Encerrada'] : esperando ? ['wait', 'Aguardando'] : ['on', 'Ativa']
    const ini = (nome.replace(/[^a-zA-Z0-9]/g, '')[0] || '#').toUpperCase()
    const cor = corAvatar(nome)
    return `
      <div class="apnl-conv-row">
        <div class="apnl-av" style="background:${cor}22;color:${cor}">${ini}</div>
        <div class="apnl-cinfo">
          <div class="apnl-cname">${esc(nome)}</div>
          <div class="apnl-cmsg">${esc(txt)}</div>
        </div>
        <div class="apnl-cmeta">
          <span class="apnl-chip ${chip[0]}">${chip[1]}</span>
          <span class="apnl-ctime">${tempoRel(x.updated_at)}</span>
        </div>
      </div>`
  }).join('')

  c.innerHTML = `
    <div class="apnl">
      <div class="apnl-back" id="apnl-back">${IC_BACK} Voltar para agentes</div>

      <div class="apnl-head">
        <div class="apnl-hic">${ICON_BOT}</div>
        <div>
          <div class="apnl-title">${esc(a.nome)}</div>
          <div class="apnl-sub">${esc(a.canal || 'WhatsApp')} · IA: <b>Groq llama-3.3-70b</b> + OpenRouter</div>
        </div>
      </div>

      <div class="apnl-banner ${ativo ? 'on' : 'off'}">
        <span><span class="dot"></span>${ativo
          ? 'Bot ativo — respondendo no WhatsApp'
          : 'Bot desativado — não está respondendo mensagens'}</span>
        <button class="apnl-toggle" id="apnl-toggle">${ativo ? 'Desativar bot' : 'Ativar bot'}</button>
      </div>

      <div class="apnl-stats">${statCards}</div>

      <div class="apnl-conv">
        <div class="apnl-conv-h">Conversas recentes</div>
        ${convRows || '<div class="empty" style="padding:28px">Nenhuma conversa ainda.</div>'}
      </div>
    </div>`

  document.getElementById('apnl-back').addEventListener('click', render)
  document.getElementById('apnl-toggle').addEventListener('click', async () => {
    const novo = ativo ? 'inativo' : 'ativo'
    const { error } = await db.from('agentes').update({ status: novo }).eq('id', a.id)
    if (error) { toast('Erro ao alterar status.', 'er'); return }
    a.status = novo
    const idx = _ag.findIndex(x => x.id === a.id)
    if (idx >= 0) _ag[idx].status = novo
    toast(novo === 'ativo' ? 'Bot ativado.' : 'Bot desativado.')
    renderPainel(id)
  })
}

// ════════ FORMULÁRIO ═══════════════════════════════════════════
function agForm(a = {}) {
  const canalOpts = CANAIS.map(ch =>
    `<option value="${ch}"${a.canal === ch ? ' selected' : ''}>${ch}</option>`
  ).join('')
  return `
    <div class="frow">
      <div class="fg"><label class="fl">Nome *</label><input class="fi" id="agn" value="${esc(a.nome || '')}" placeholder="Ex: Qualificador WA"></div>
      <div class="fg"><label class="fl">Canal</label>
        <select class="fsl" id="agc"><option value="">Selecione...</option>${canalOpts}</select>
      </div>
    </div>
    <div class="fg"><label class="fl">Status</label>
      <select class="fsl" id="agst">
        <option value="ativo"${a.status === 'ativo' ? ' selected' : ''}>Ativo</option>
        <option value="inativo"${a.status === 'inativo' ? ' selected' : ''}>Inativo</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Prompt / Instrução</label>
      <textarea class="fta" id="agp" style="min-height:110px;font-family:ui-monospace,monospace;font-size:12px">${esc(a.prompt || '')}</textarea>
    </div>
    <div class="fg"><label class="fl">Notas</label><textarea class="fta" id="agno">${esc(a.notas || '')}</textarea></div>`
}

function addAgente() {
  openModal(
    'Novo agente IA', agForm(),
    `<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`
  )
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', () => saveAgente())
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
  if (error) { toast('Erro.', 'er'); return }
  toast(id ? 'Agente atualizado.' : 'Agente criado.')
  closeModal()
  render()
}

async function delAgente(id) {
  if (!confirm('Remover agente?')) return
  await db.from('agentes').delete().eq('id', id)
  toast('Removido.')
  render()
}
