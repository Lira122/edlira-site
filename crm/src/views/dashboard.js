import { db, selectAll } from '../db.js'
import { brl, bk, badge, MES, MESF } from '../utils.js'

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  try {
    const now = new Date()
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()

    const [{ data: cl, error: e1 }, { data: fat, error: e2 }, { data: ag, error: e3 }] =
      await Promise.all([
        selectAll('clientes', { order: { column: 'criado_em', ascending: false } }),
        db.from('faturamento').select('*'),
        db.from('agentes').select('*'),
      ])

    if (e1 || e2 || e3) throw new Error((e1 || e2 || e3).message)

    const clientes = cl || []
    const fats     = fat || []
    const agentes  = ag || []

    const ativos   = clientes.filter(x => x.status === 'ativo').length
    const mrr      = clientes.filter(x => x.status === 'ativo').reduce((s, x) => s + Number(x.valor || 0), 0)
    const novos    = clientes.filter(x => {
      const d = new Date(x.criado_em)
      return d.getMonth() + 1 === mes && d.getFullYear() === ano
    }).length
    const agAtivos = agentes.filter(a => a.status === 'ativo').length
    const fatMes   = fats.filter(f => f.mes === mes && f.ano === ano).reduce((s, f) => s + Number(f.valor), 0)

    const chart = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ano, mes - 1 - i, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const val = fats.filter(f => f.mes === m && f.ano === y).reduce((s, f) => s + Number(f.valor), 0)
      chart.push({ label: MES[m - 1], val, cur: i === 0 })
    }
    const maxV = Math.max(...chart.map(d => d.val), 1)

    const barRows = chart.map(d => {
      const pct = Math.round(d.val / maxV * 100)
      const vLabel = d.val > 0 ? 'R$' + bk(d.val) : ''
      return `<div class="bg2">
        <div class="bv">${vLabel}</div>
        <div class="bar${d.cur ? ' cur' : ''}" style="height:${pct}%"></div>
        <div class="bl">${d.label}</div>
      </div>`
    }).join('')

    const clienteRows = clientes.slice(0, 6).map(x =>
      `<tr data-go="clientes" style="cursor:pointer">
        <td class="tn">${x.nome}</td>
        <td class="tm">${x.empresa || '—'}</td>
        <td class="tm">${x.servico || '—'}</td>
        <td>${badge(x.status)}</td>
        <td>${brl(x.valor)}</td>
      </tr>`
    ).join('') || `<tr><td colspan="5"><div class="empty">Sem clientes ainda.</div></td></tr>`

    c.innerHTML = `
      <div class="sg">
        <div class="sc">
          <div class="sl">Faturamento — ${MES[mes - 1]}</div>
          <div class="sv ac">${brl(fatMes)}</div>
          <div class="ss">${MESF[mes - 1]} ${ano}</div>
        </div>
        <div class="sc">
          <div class="sl">MRR</div>
          <div class="sv ac">${brl(mrr)}</div>
          <div class="ss">${ativos} cliente(s) ativo(s)</div>
        </div>
        <div class="sc">
          <div class="sl">Leads este mês</div>
          <div class="sv">${novos}</div>
          <div class="ss">${MES[mes - 1]} ${ano}</div>
        </div>
        <div class="sc">
          <div class="sl">Agentes IA ativos</div>
          <div class="sv">${agAtivos}</div>
          <div class="ss">Em operação</div>
        </div>
      </div>
      <div class="cw">
        <div class="ct">Faturamento — últimos 6 meses</div>
        <div class="bc">${barRows}</div>
      </div>
      <div class="tw">
        <div class="th">
          <h3>Últimos clientes</h3>
          <button class="btn bg bsm" data-go="clientes">Ver todos →</button>
        </div>
        <table>
          <thead><tr><th>Nome</th><th>Empresa</th><th>Serviço</th><th>Status</th><th>Valor</th></tr></thead>
          <tbody>${clienteRows}</tbody>
        </table>
      </div>`
  } catch (err) {
    c.innerHTML = `<div class="empty">Erro ao carregar: ${err.message}</div>`
  }
}
