import { db } from '../db.js'
import { fmtd, toast, openModal, closeModal } from '../utils.js'

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
))

let _tokens = []
let _clientes = []

export async function render() {
  document.getElementById('tbacts').innerHTML =
    `<button class="btn bp" id="btn-novo-onb">+ Novo link de onboarding</button>`
  document.getElementById('btn-novo-onb').addEventListener('click', abrirModalNovo)

  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  // tokens (com status calculado via view)
  const { data: tk, error } = await db
    .from('onboarding_tokens_status')
    .select('*')
    .order('criado_em', { ascending: false })
  if (error) {
    c.innerHTML = `<div class="empty">Erro: ${esc(error.message)}</div>`
    return
  }
  _tokens = tk || []

  // clientes ativos (filtrando prospects)
  const { data: cl } = await db
    .from('clientes')
    .select('id, nome, empresa, status')
    .not('status', 'in', '(prospeccao,perdido)')
    .order('nome')
  _clientes = cl || []

  renderTable()
}

function renderTable() {
  const total = _tokens.length
  const pendentes = _tokens.filter((t) => t.status === 'pendente').length
  const preenchidos = _tokens.filter((t) => t.status === 'preenchido').length
  const expirados = _tokens.filter((t) => t.status === 'expirado').length

  const stats = `
    <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:22px">
      <div class="sc"><div class="sl">Total</div><div class="sv">${total}</div></div>
      <div class="sc"><div class="sl">Pendentes</div><div class="sv" style="color:var(--warn)">${pendentes}</div></div>
      <div class="sc"><div class="sl">Preenchidos</div><div class="sv" style="color:var(--ok)">${preenchidos}</div></div>
      <div class="sc"><div class="sl">Expirados</div><div class="sv" style="color:var(--text-3)">${expirados}</div></div>
    </div>`

  const rows = _tokens.length
    ? _tokens.map((t) => `
        <tr>
          <td class="tn">${esc(t.cliente_nome || '—')}</td>
          <td class="tm">${fmtd(t.criado_em)}</td>
          <td class="tm">${fmtd(t.expira_em)}</td>
          <td>${badgeStatus(t.status)}</td>
          <td class="tm">${fmtd(t.usado_em) || '—'}</td>
          <td class="tm" style="text-align:right">${acoes(t)}</td>
        </tr>`).join('')
    : `<tr><td colspan="6"><div class="empty">Nenhum link gerado ainda. Crie o primeiro acima.</div></td></tr>`

  document.getElementById('content').innerHTML = `
    ${stats}
    <div class="tw">
      <div class="th"><h3>Links de onboarding</h3></div>
      <table>
        <thead><tr><th>Cliente</th><th>Criado</th><th>Expira</th><th>Status</th><th>Preenchido em</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`

  document.getElementById('content').addEventListener('click', (e) => {
    const a = e.target.closest('button[data-act]')
    if (!a) return
    const act = a.dataset.act
    if (act === 'copiar') copiarLink(a.dataset.token)
    else if (act === 'ver')  verDados(a.dataset.cliente)
  })
}

function badgeStatus(s) {
  const cores = { pendente: 'var(--warn)', preenchido: 'var(--ok)', expirado: 'var(--text-3)' }
  const labels = { pendente: 'Pendente', preenchido: 'Preenchido', expirado: 'Expirado' }
  return `<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:${cores[s]}22;color:${cores[s]}">${labels[s] || s}</span>`
}

function acoes(t) {
  if (t.status === 'pendente') {
    return `<button class="btn bg bsm" data-act="copiar" data-token="${esc(t.token)}">Copiar link</button>`
  }
  if (t.status === 'preenchido') {
    return `<button class="btn bg bsm" data-act="ver" data-cliente="${esc(t.cliente_id)}">Ver dados</button>`
  }
  return '<span style="font-size:12px;color:var(--text-3)">—</span>'
}

const ONBOARDING_BASE_URL = 'https://elevabrands.com.br/onboarding/'
function linkUrl(token) {
  return `${ONBOARDING_BASE_URL}?t=${token}`
}

async function copiarLink(token) {
  const url = linkUrl(token)
  try {
    await navigator.clipboard.writeText(url)
    toast('Link copiado pro clipboard!')
  } catch {
    prompt('Copie o link:', url)
  }
}

// ─── Modal: novo link ──────────────────────────────────────────
function abrirModalNovo() {
  const opts = _clientes.length
    ? _clientes.map((c) => `<option value="${esc(c.id)}">${esc(c.empresa || c.nome)}${c.nome && c.empresa ? ' — ' + esc(c.nome) : ''}</option>`).join('')
    : `<option value="">Nenhum cliente ativo</option>`
  openModal(
    'Gerar link de onboarding',
    `<div class="fg">
       <label class="fl">Cliente *</label>
       <select class="fsl" id="onb-cli">
         <option value="">Selecione…</option>
         ${opts}
       </select>
     </div>
     <div class="fg">
       <label class="fl">Validade (dias)</label>
       <input class="fi" id="onb-dias" type="number" value="7" min="1" max="60">
       <span style="font-size:11px;color:var(--text-3);margin-top:4px;display:block">O link expira automaticamente após esse prazo, ou no primeiro envio.</span>
     </div>
     <div id="onb-result" style="display:none"></div>`,
    `<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-gerar">Gerar link</button>`
  )
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-gerar').addEventListener('click', gerar)
}

async function gerar() {
  const cliente_id = document.getElementById('onb-cli').value
  const dias = Number(document.getElementById('onb-dias').value) || 7
  if (!cliente_id) { toast('Escolha um cliente.', 'er'); return }

  const btn = document.getElementById('m-gerar')
  btn.disabled = true
  btn.textContent = 'Gerando…'

  const { data, error } = await db.functions.invoke('onboarding-link', {
    body: { cliente_id, dias_validade: dias },
  })
  if (error || !data?.ok) {
    toast(data?.error || error?.message || 'Erro ao gerar', 'er')
    btn.disabled = false
    btn.textContent = 'Gerar link'
    return
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(
    `Oi! Pra começar, preciso de algumas informações. Acessa esse link e preenche quando puder:\n\n${data.url}\n\n— Lira, Eleva Digital`
  )}`

  document.getElementById('onb-result').style.display = 'block'
  document.getElementById('onb-result').innerHTML = `
    <div style="background:rgba(193,255,42,.07);border:1px solid rgba(193,255,42,.22);border-left:3px solid var(--accent);border-radius:10px;padding:14px 16px;margin-top:6px">
      <div style="font-size:12px;font-weight:700;color:var(--accent);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">Link gerado pra ${esc(data.cliente_nome)}</div>
      <div style="font-family:ui-monospace,monospace;font-size:12px;color:var(--text);word-break:break-all;padding:8px 10px;background:rgba(0,0,0,.25);border-radius:6px;margin-bottom:10px">${esc(data.url)}</div>
      <div style="display:flex;gap:8px">
        <button class="btn bg bsm" id="onb-copiar">Copiar link</button>
        <a class="btn bg bsm" href="${wa}" target="_blank" rel="noopener" style="text-decoration:none">Compartilhar no WhatsApp</a>
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:10px">Expira em ${fmtd(data.expira_em)}.</div>
    </div>`
  document.getElementById('onb-copiar').addEventListener('click', () => copiarLink(data.token))
  btn.disabled = false
  btn.textContent = 'Gerar novo'

  // recarrega lista no fundo
  render()
}

// ─── Modal: ver dados preenchidos ──────────────────────────────
async function verDados(cliente_id) {
  const { data: d } = await db.from('onboarding_dados').select('*').eq('cliente_id', cliente_id).maybeSingle()
  const { data: c } = await db.from('onboarding_credenciais').select('*').eq('cliente_id', cliente_id).maybeSingle()

  const credCampos = ['insta_pass', 'meta_pass', 'google_pass']
  const credBotoes = credCampos.map((campo) => {
    const tem = c?.cred_jsonb?.[campo]
    if (!tem) return ''
    return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)">
      <span style="font-size:13px;color:var(--text)">${labelCampo(campo)}</span>
      <button class="btn bg bsm" data-cred="${esc(campo)}" data-cliente="${esc(cliente_id)}">Ver senha</button>
    </div>`
  }).filter(Boolean).join('') || '<div style="font-size:13px;color:var(--text-3)">Nenhuma senha guardada.</div>'

  openModal(
    'Dados do onboarding',
    `<div style="font-size:11px;color:var(--accent);font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px">Negócio</div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Ramo</span><div>${esc(d?.ramo) || '—'}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Ticket médio</span><div>${d?.ticket_medio ? 'R$ ' + Number(d.ticket_medio).toLocaleString('pt-BR') : '—'}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Objetivo 90 dias</span><div style="white-space:pre-wrap">${esc(d?.objetivo_90d) || '—'}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Site</span><div>${d?.site ? `<a href="${esc(d.site)}" target="_blank" style="color:var(--accent)">${esc(d.site)}</a>` : '—'}</div></div>

     <div style="font-size:11px;color:var(--accent);font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin:24px 0 8px">Acessos</div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">@ Instagram</span><div>${esc(c?.insta_handle) || '—'}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">BM / Meta</span><div>${esc(c?.meta_bm_id) || '—'}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Google Ads</span><div>${esc(c?.google_ads_id) || '—'}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">WhatsApp comercial</span><div>${esc(c?.whatsapp_com) || '—'}</div></div>
     <div style="margin-top:14px;border-top:1px solid var(--line);padding-top:14px">
       <div style="font-size:12px;color:var(--text-2);margin-bottom:8px">Senhas (cifradas, cada visualização fica registrada em log):</div>
       ${credBotoes}
     </div>

     <div style="font-size:11px;color:var(--accent);font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin:24px 0 8px">Bot / Conhecimento</div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Produtos & preços</span><div style="white-space:pre-wrap">${esc(d?.produtos) || '—'}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">FAQs</span><div style="white-space:pre-wrap">${esc(d?.faqs) || '—'}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Horário</span><div>${esc(d?.horario_atend) || '—'}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Tom de voz</span><div>${esc(d?.tom_de_voz) || '—'}</div></div>

     <div id="cred-revealed" style="margin-top:14px"></div>`,
    `<button class="btn bg" id="m-fechar">Fechar</button>`
  )
  document.getElementById('m-fechar').addEventListener('click', closeModal)
  document.getElementById('mbody').addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-cred]')
    if (!b) return
    b.disabled = true
    b.textContent = 'Carregando…'
    const { data } = await db.functions.invoke('onboarding-cred-ver', {
      body: { cliente_id: b.dataset.cliente, campo: b.dataset.cred, origem: 'crm' },
    })
    if (!data?.ok) { toast(data?.error || 'Erro', 'er'); b.disabled = false; b.textContent = 'Ver senha'; return }
    document.getElementById('cred-revealed').innerHTML = `
      <div style="background:rgba(193,255,42,.07);border:1px solid rgba(193,255,42,.22);border-radius:8px;padding:12px 14px">
        <div style="font-size:11px;color:var(--text-2);margin-bottom:4px">${labelCampo(b.dataset.cred)}</div>
        <div style="font-family:ui-monospace,monospace;font-size:14px;color:var(--accent);word-break:break-all">${esc(data.valor)}</div>
        <div style="font-size:10px;color:var(--text-3);margin-top:6px">Visualização registrada em log de auditoria.</div>
      </div>`
    b.disabled = false
    b.textContent = 'Ver senha'
  })
}

function labelCampo(c) {
  return { insta_pass: 'Senha do Instagram', meta_pass: 'Senha do Meta/Facebook', google_pass: 'Senha do Google' }[c] || c
}
