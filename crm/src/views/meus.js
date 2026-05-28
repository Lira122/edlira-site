// Meus Clientes — só os clientes ATIVOS (que já são seus, pagando).
// Lista filtrada da tabela clientes, com MRR, ticket médio e busca.
// Reaproveita o modal de edição do clientes.js, mas re-renderiza esta view ao salvar.
import { selectAll } from '../db.js'
import { brl, fmtd, tempBadge } from '../utils.js'
import { editCliente } from './clientes.js'

let _meus = []
let mSrch = ''

export async function render() {
  document.getElementById('tbacts').innerHTML = ''
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  const { data, error } = await selectAll('clientes', { order: { column: 'nome', ascending: true } })
  if (error) { c.innerHTML = `<div class="empty">Erro: ${error.message}</div>`; return }
  _meus = (data || []).filter(x => x.status === 'ativo')
  renderTable()
}

function renderTable() {
  let list = _meus
  if (mSrch) {
    const q = mSrch.toLowerCase()
    list = list.filter(x =>
      x.nome.toLowerCase().includes(q) || (x.empresa || '').toLowerCase().includes(q)
    )
  }

  const mrr     = list.reduce((s, x) => s + Number(x.valor || 0), 0)
  const ticket  = list.length ? mrr / list.length : 0

  const rows = list.length ? list.map(x => `
    <tr data-id="${x.id}" class="meu-row" style="cursor:pointer">
      <td class="tn">${x.nome}</td>
      <td class="tm">${x.empresa || '—'}</td>
      <td class="tm">${x.servico || '—'}</td>
      <td>${brl(x.valor)}</td>
      <td>${tempBadge(x.temperatura)}</td>
      <td class="tm">${x.whatsapp
        ? `<a href="https://wa.me/${x.whatsapp.replace(/\D/g, '')}" target="_blank" class="wa-link" onclick="event.stopPropagation()">${x.whatsapp}</a>`
        : '—'}</td>
      <td class="tm">${fmtd(x.criado_em)}</td>
    </tr>`).join('') : `<tr><td colspan="7"><div class="empty">Nenhum cliente ativo ainda.<br>Quando um lead virar contrato, mude o status pra "Ativo" na ficha dele e ele aparece aqui.</div></td></tr>`

  document.getElementById('content').innerHTML = `
    <div class="sg" style="grid-template-columns:repeat(3,1fr);margin-bottom:22px">
      <div class="sc">
        <div class="sl">Clientes ativos</div>
        <div class="sv">${_meus.length}</div>
        <div class="ss">${_meus.length === 1 ? 'Em operação' : 'Em operação'}</div>
      </div>
      <div class="sc">
        <div class="sl">MRR</div>
        <div class="sv ac">${brl(mrr)}</div>
        <div class="ss">Recorrência mensal</div>
      </div>
      <div class="sc">
        <div class="sl">Ticket médio</div>
        <div class="sv">${brl(ticket)}</div>
        <div class="ss">Por cliente</div>
      </div>
    </div>

    <div class="tw">
      <div class="th">
        <h3>Meus clientes <span style="color:var(--text-3);font-weight:400">(${list.length}${mSrch ? ` de ${_meus.length}` : ''})</span></h3>
        <input class="si" id="meu-search" placeholder="Buscar por nome ou empresa..." value="${mSrch}">
      </div>
      <table>
        <thead><tr>
          <th>Nome</th><th>Empresa</th><th>Serviço</th>
          <th>Valor/mês</th><th>Temp.</th><th>WhatsApp</th><th>Cliente desde</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`

  document.getElementById('meu-search').addEventListener('input', e => { mSrch = e.target.value; renderTable() })
  document.getElementById('content').addEventListener('click', e => {
    const row = e.target.closest('.meu-row')
    if (row) editCliente(row.dataset.id, () => render())
  })
}
