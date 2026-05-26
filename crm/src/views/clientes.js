import { db, selectAll } from '../db.js'
import { brl, fmtd, badge, tempBadge, toast, openModal, closeModal, STATS, TEMPS, STATUS_LABEL } from '../utils.js'

let _cl = []
let cFil  = 'todos'
let cSrch = ''

export async function render() {
  document.getElementById('tbacts').innerHTML =
    `<button class="btn bp" id="btn-add-cliente">+ Novo cliente</button>`
  document.getElementById('btn-add-cliente').addEventListener('click', addCliente)

  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  const { data, error } = await selectAll('clientes', { order: { column: 'criado_em', ascending: false } })
  if (error) { c.innerHTML = `<div class="empty">Erro: ${error.message}</div>`; return }
  _cl = data || []
  renderTable()
}

function renderTable() {
  let list = _cl
  if (cFil !== 'todos') list = list.filter(x => x.status === cFil)
  if (cSrch) {
    const q = cSrch.toLowerCase()
    list = list.filter(x =>
      x.nome.toLowerCase().includes(q) || (x.empresa || '').toLowerCase().includes(q)
    )
  }

  const filters = ['todos', ...STATS].map(s =>
    `<div class="fc${cFil === s ? ' on' : ''}" data-fil="${s}">
      ${s === 'todos' ? 'Todos' : (STATUS_LABEL[s] || s.charAt(0).toUpperCase() + s.slice(1))}
    </div>`
  ).join('')

  const rows = list.length
    ? list.map(x => `
        <tr data-id="${x.id}" class="cl-row">
          <td class="tn">${x.nome}</td>
          <td class="tm">${x.empresa || '—'}</td>
          <td class="tm">${x.servico || '—'}</td>
          <td>${badge(x.status)}${x.status==='em_pausa'&&x.pausado_ate?`<div style="font-size:10px;color:var(--text-3);margin-top:2px">até ${new Date(x.pausado_ate).toLocaleDateString('pt-BR')}</div>`:''}</td>
          <td>${tempBadge(x.temperatura)}</td>
          <td>${brl(x.valor)}</td>
          <td class="tm">${x.whatsapp
            ? `<a href="https://wa.me/${x.whatsapp.replace(/\D/g, '')}" target="_blank" class="wa-link">${x.whatsapp}</a>`
            : '—'}</td>
          <td class="tm">${fmtd(x.criado_em)}</td>
          <td><button class="btn bd bsm bic del-cl" data-id="${x.id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button></td>
        </tr>`).join('')
    : `<tr><td colspan="8"><div class="empty">Nenhum resultado.</div></td></tr>`

  document.getElementById('content').innerHTML = `
    <div class="tw">
      <div class="th">
        <h3>Clientes <span style="color:var(--text-3);font-weight:400">(${list.length})</span></h3>
        <input class="si" id="cl-search" placeholder="Buscar..." value="${cSrch}">
      </div>
      <div class="fr" id="cl-filters">${filters}</div>
      <table>
        <thead><tr><th>Nome</th><th>Empresa</th><th>Serviço</th><th>Status</th><th>Temp.</th><th>Valor</th><th>WhatsApp</th><th>Entrada</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`

  document.getElementById('cl-search').addEventListener('input', e => { cSrch = e.target.value; renderTable() })
  document.getElementById('cl-filters').addEventListener('click', e => {
    const fil = e.target.closest('.fc')
    if (fil) { cFil = fil.dataset.fil; renderTable() }
  })
  document.getElementById('content').addEventListener('click', e => {
    const row = e.target.closest('.cl-row')
    const del = e.target.closest('.del-cl')
    if (del) { e.stopPropagation(); delCliente(del.dataset.id) }
    else if (row) editCliente(row.dataset.id)
  })
}

function clForm(x = {}) {
  const statusOpts = STATS.map(s => {
    const label = s === 'em_pausa'
      ? 'Em pausa (não agora)'
      : (STATUS_LABEL[s] || s.charAt(0).toUpperCase() + s.slice(1))
    return `<option value="${s}"${x.status === s ? ' selected' : ''}>${label}</option>`
  }).join('')
  const tempOpts = `<option value="">— não definida —</option>` + TEMPS.map(t => {
    const icons = { quente:'🔥 Quente', morno:'🌡️ Morno', frio:'❄️ Frio', gelado:'🧊 Gelado' }
    return `<option value="${t}"${x.temperatura === t ? ' selected' : ''}>${icons[t]}</option>`
  }).join('')
  const pausaVal = x.pausado_ate ? new Date(x.pausado_ate).toISOString().slice(0,10) : ''
  return `
    <div class="frow">
      <div class="fg"><label class="fl">Nome *</label><input class="fi" id="fn" value="${x.nome || ''}"></div>
      <div class="fg"><label class="fl">Empresa</label><input class="fi" id="fe" value="${x.empresa || ''}"></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">WhatsApp</label><input class="fi" id="fw" value="${x.whatsapp || ''}" placeholder="5512..."></div>
      <div class="fg"><label class="fl">E-mail</label><input class="fi" id="fem" value="${x.email || ''}"></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Serviço</label><input class="fi" id="fs" value="${x.servico || ''}" placeholder="Ex: Tráfego + IA"></div>
      <div class="fg"><label class="fl">Valor/mês (R$)</label><input class="fi" id="fv" type="number" value="${x.valor || ''}"></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="fst" onchange="document.getElementById('pausa-row').style.display=this.value==='em_pausa'?'flex':'none'">${statusOpts}</select></div>
      <div class="fg"><label class="fl">Temperatura da conversa</label><select class="fsl" id="ftemp">${tempOpts}</select></div>
    </div>
    <div class="frow" id="pausa-row" style="display:${x.status==='em_pausa'?'flex':'none'}">
      <div class="fg" style="grid-column:1/-1">
        <label class="fl">Retomar contato em</label>
        <input class="fi" id="fpause" type="date" value="${pausaVal}" min="${new Date().toISOString().slice(0,10)}">
        <span style="font-size:11px;color:var(--text-3);margin-top:4px">O lead ficará pausado até esta data — o follow-up automático não será disparado nesse período.</span>
      </div>
    </div>
    <div class="fg"><label class="fl">Observações / notas da conversa</label><textarea class="fta" id="fob">${x.observacoes || ''}</textarea></div>`
}

function getFormData() {
  const status = document.getElementById('fst').value
  const pauseEl = document.getElementById('fpause')
  return {
    nome:         document.getElementById('fn').value.trim(),
    empresa:      document.getElementById('fe').value.trim(),
    whatsapp:     document.getElementById('fw').value.trim(),
    email:        document.getElementById('fem').value.trim(),
    servico:      document.getElementById('fs').value.trim(),
    valor:        parseFloat(document.getElementById('fv').value) || null,
    status,
    temperatura:  document.getElementById('ftemp').value || null,
    pausado_ate:  status === 'em_pausa' && pauseEl?.value ? new Date(pauseEl.value).toISOString() : null,
    observacoes:  document.getElementById('fob').value.trim(),
    atualizado_em: new Date().toISOString(),
  }
}

function addCliente() {
  openModal(
    'Novo cliente',
    clForm(),
    `<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`
  )
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', () => saveCliente())
}

function editCliente(id) {
  const x = _cl.find(c => c.id === id)
  if (!x) return
  openModal(
    'Editar cliente',
    clForm(x),
    `<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`
  )
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', () => saveCliente(id))
}

async function saveCliente(id) {
  const d = getFormData()
  if (!d.nome) { toast('Nome obrigatório.', 'er'); return }
  const { error } = id
    ? await db.from('clientes').update(d).eq('id', id)
    : await db.from('clientes').insert(d)
  if (error) { toast('Erro ao salvar.', 'er'); console.error(error); return }
  toast(id ? 'Cliente atualizado.' : 'Cliente adicionado.')
  closeModal()
  render()
}

async function delCliente(id) {
  if (!confirm('Remover este cliente?')) return
  const { error } = await db.from('clientes').delete().eq('id', id)
  if (error) { toast('Erro.', 'er'); return }
  toast('Removido.')
  render()
}

// expose for use in pipeline/mensalidades
export { editCliente, _cl }
