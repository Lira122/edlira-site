import { db } from '../db.js'
import { brl, bk, fmtd, toast, openModal, closeModal, MES, MESF } from '../utils.js'

let _fat = []

export async function render() {
  document.getElementById('tbacts').innerHTML =
    `<button class="btn bp" id="btn-add-fat">+ Lançamento</button>`
  document.getElementById('btn-add-fat').addEventListener('click', addFat)

  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  const { data, error } = await db.from('faturamento').select('*')
    .order('ano', { ascending: false }).order('mes', { ascending: false })
  if (error) { c.innerHTML = `<div class="empty">Erro: ${error.message}</div>`; return }
  _fat = data || []

  const now  = new Date()
  const ano  = now.getFullYear()
  const mes  = now.getMonth() + 1

  const totAno   = _fat.filter(f => f.ano === ano).reduce((s, f) => s + Number(f.valor), 0)
  const mWithData = [...new Set(_fat.filter(f => f.ano === ano).map(f => f.mes))]
  const media    = mWithData.length ? totAno / mWithData.length : 0
  const melhor   = _fat.reduce((b, f) => (!b || Number(f.valor) > Number(b.valor) ? f : b), null)

  const chart = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(ano, mes - 1 - i, 1)
    const m = d.getMonth() + 1, y = d.getFullYear()
    const val = _fat.filter(f => f.mes === m && f.ano === y).reduce((s, f) => s + Number(f.valor), 0)
    chart.push({ label: MES[m - 1], val, cur: i === 0 })
  }
  const maxV = Math.max(...chart.map(d => d.val), 1)

  const barRows = chart.map(d => {
    const pct = Math.round(d.val / maxV * 100)
    return `<div class="bg2">
      <div class="bv">${d.val > 0 ? 'R$' + bk(d.val) : ''}</div>
      <div class="bar${d.cur ? ' cur' : ''}" style="height:${pct}%"></div>
      <div class="bl">${d.label}</div>
    </div>`
  }).join('')

  const fatRows = _fat.length
    ? _fat.map(f => `
        <tr>
          <td>${MESF[f.mes - 1]}</td>
          <td class="tm">${f.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${brl(f.valor)}</td>
          <td class="tm">${f.descricao || '—'}</td>
          <td class="tm">${fmtd(f.criado_em)}</td>
          <td style="display:flex;gap:6px;align-items:center">
            <button class="btn bg bsm edit-fat" data-id="${f.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${f.id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </td>
        </tr>`).join('')
    : `<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>`

  c.innerHTML = `
    <div class="fs">
      <div class="sc"><div class="sl">Total ${ano}</div><div class="sv ac">${brl(totAno)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${brl(media)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${melhor ? brl(melhor.valor) : '—'}</div>
        <div class="ss">${melhor ? MESF[melhor.mes - 1] + ' ' + melhor.ano : ''}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Faturamento — últimos 12 meses</div>
      <div class="bc">${barRows}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${fatRows}</tbody>
      </table>
    </div>`

  c.querySelectorAll('.edit-fat').forEach(btn =>
    btn.addEventListener('click', () => editFat(btn.dataset.id))
  )
  c.querySelectorAll('.del-fat').forEach(btn =>
    btn.addEventListener('click', () => delFat(btn.dataset.id))
  )
}

function fatForm(f = {}) {
  const now = new Date()
  return `
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${MESF.map((m, i) => `<option value="${i + 1}"${(f.mes || now.getMonth() + 1) === i + 1 ? ' selected' : ''}>${m}</option>`).join('')}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${f.ano || now.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${f.valor || ''}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${f.descricao || ''}" placeholder="Ex: Clientes recorrentes"></div>`
}

function addFat() {
  openModal(
    'Novo lançamento', fatForm(),
    `<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`
  )
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', () => saveFat())
}

function editFat(id) {
  const f = _fat.find(x => x.id === id)
  if (!f) return
  openModal(
    'Editar lançamento', fatForm(f),
    `<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`
  )
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', () => saveFat(id))
}

async function saveFat(id) {
  const d = {
    mes:       parseInt(document.getElementById('fmes').value),
    ano:       parseInt(document.getElementById('fano').value),
    valor:     parseFloat(document.getElementById('fval').value) || 0,
    descricao: document.getElementById('fdesc').value.trim(),
  }
  if (!d.valor) { toast('Valor obrigatório.', 'er'); return }
  const { error } = id
    ? await db.from('faturamento').update(d).eq('id', id)
    : await db.from('faturamento').insert(d)
  if (error) { toast('Erro.', 'er'); return }
  toast(id ? 'Atualizado.' : 'Adicionado.')
  closeModal()
  render()
}

async function delFat(id) {
  if (!confirm('Remover?')) return
  await db.from('faturamento').delete().eq('id', id)
  toast('Removido.')
  render()
}
