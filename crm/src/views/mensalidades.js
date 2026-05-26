import { db, selectAll } from '../db.js'
import { brl, fmtd, toast, openModal, closeModal, MES, MESF } from '../utils.js'

export async function render() {
  document.getElementById('tbacts').innerHTML =
    `<button class="btn bg bsm" id="btn-fat-manual">+ Lançamento manual</button>`
  document.getElementById('btn-fat-manual').addEventListener('click', addFat)

  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  try {
    const now = new Date()
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()

    const [{ data: cl, error: e1 }, { data: fat, error: e2 }] = await Promise.all([
      selectAll('clientes', { order: { column: 'nome', ascending: true } }),
      db.from('faturamento').select('*').eq('mes', mes).eq('ano', ano),
    ])
    if (e1 || e2) throw new Error((e1 || e2).message)

    const ativos   = (cl || []).filter(x => x.status === 'ativo')
    const fats     = fat || []
    const mrr      = ativos.reduce((s, x) => s + Number(x.valor || 0), 0)
    const recebido = fats.reduce((s, f) => s + Number(f.valor || 0), 0)
    const pendente = Math.max(0, mrr - recebido)

    const ativoRows = ativos.map(x => {
      const jaPagou = fats.some(f => f.cliente_id === x.id)
      const badge   = jaPagou
        ? '<span class="badge b-ativo">Pago</span>'
        : '<span class="badge b-inativo">Pendente</span>'
      const btn = jaPagou
        ? `<button class="btn bg bsm estornar-btn" data-id="${x.id}" data-nome="${x.nome}" data-mes="${mes}" data-ano="${ano}">Estornar</button>`
        : `<button class="btn bp bsm registrar-btn" data-id="${x.id}" data-nome="${x.nome}" data-valor="${x.valor || 0}" data-mes="${mes}" data-ano="${ano}">Registrar</button>`
      return `<tr>
        <td class="tn">${x.nome}</td>
        <td class="tm">${x.empresa || '—'}</td>
        <td class="tm">${x.servico || '—'}</td>
        <td style="font-weight:600;color:var(--accent)">${brl(x.valor)}</td>
        <td>${badge}</td>
        <td>${btn}</td>
      </tr>`
    }).join('')

    const lancRows = fats.map(f => `
      <tr>
        <td class="tn">${f.descricao || '—'}</td>
        <td style="font-weight:600;color:var(--accent)">${brl(f.valor)}</td>
        <td class="tm">${fmtd(f.criado_em)}</td>
        <td><button class="btn bd bsm bic del-fat-btn" data-id="${f.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
          </svg>
        </button></td>
      </tr>`).join('') || `<tr><td colspan="4"><div class="empty">Sem lançamentos este mês.</div></td></tr>`

    const ativoTable = ativos.length
      ? `<table>
          <thead><tr><th>Nome</th><th>Empresa</th><th>Serviço</th><th>Valor/mês</th><th>${MES[mes - 1]}/${ano}</th><th></th></tr></thead>
          <tbody>${ativoRows}</tbody>
        </table>`
      : `<div class="empty">Nenhum cliente com status <strong>Ativo</strong>.<br>Altere o status do cliente em Clientes para ele aparecer aqui.</div>`

    c.innerHTML = `
      <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:22px">
        <div class="sc"><div class="sl">MRR</div><div class="sv ac">${brl(mrr)}</div><div class="ss">Recorrência mensal</div></div>
        <div class="sc"><div class="sl">Clientes ativos</div><div class="sv">${ativos.length}</div><div class="ss">Com contrato vigente</div></div>
        <div class="sc"><div class="sl">Recebido — ${MES[mes - 1]}</div><div class="sv" style="color:var(--ok)">${brl(recebido)}</div><div class="ss">${fats.length} lançamento(s)</div></div>
        <div class="sc"><div class="sl">Pendente</div><div class="sv" style="color:${pendente > 0 ? 'var(--warn)' : 'var(--text-3)'}">${brl(pendente)}</div><div class="ss">${pendente > 0 ? 'A receber' : 'Em dia'}</div></div>
      </div>
      <div class="tw" style="margin-bottom:22px">
        <div class="th">
          <h3>Clientes ativos <span style="color:var(--text-3);font-weight:400">(${ativos.length})</span></h3>
          <span style="font-size:12px;color:var(--text-3)">Clique em Registrar para lançar o pagamento do mês</span>
        </div>
        ${ativoTable}
      </div>
      <div class="tw">
        <div class="th"><h3>Lançamentos — ${MESF[mes - 1]} ${ano}</h3></div>
        <table>
          <thead><tr><th>Descrição</th><th>Valor</th><th>Data</th><th></th></tr></thead>
          <tbody>${lancRows}</tbody>
        </table>
      </div>`

    // eventos
    c.querySelectorAll('.registrar-btn').forEach(btn => {
      btn.addEventListener('click', () =>
        registrarMens(btn.dataset.id, btn.dataset.nome, btn.dataset.valor, Number(btn.dataset.mes), Number(btn.dataset.ano))
      )
    })
    c.querySelectorAll('.estornar-btn').forEach(btn => {
      btn.addEventListener('click', () =>
        estornarMens(btn.dataset.id, btn.dataset.nome, Number(btn.dataset.mes), Number(btn.dataset.ano))
      )
    })
    c.querySelectorAll('.del-fat-btn').forEach(btn => {
      btn.addEventListener('click', () => delFat(btn.dataset.id))
    })
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="empty">Erro ao carregar: ${err.message}</div>`
  }
}

async function registrarMens(clienteId, nome, valor, mes, ano) {
  const { error } = await db.from('faturamento').insert({
    mes, ano, valor: Number(valor) || 0, descricao: nome, cliente_id: clienteId
  })
  if (error) { toast('Erro ao registrar.', 'er'); return }
  toast(`${nome} — pagamento registrado.`)
  render()
}

async function estornarMens(clienteId, nome, mes, ano) {
  if (!confirm(`Estornar pagamento de ${nome}?`)) return
  const { error } = await db.from('faturamento').delete().eq('cliente_id', clienteId).eq('mes', mes).eq('ano', ano)
  if (error) { toast('Erro.', 'er'); return }
  toast('Estornado.')
  render()
}

async function delFat(id) {
  if (!confirm('Remover lançamento?')) return
  await db.from('faturamento').delete().eq('id', id)
  toast('Removido.')
  render()
}

// ── Lançamento manual ─────────────────────────
function addFat() {
  const now = new Date()
  const body = `
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${MESF.map((m, i) => `<option value="${i + 1}"${now.getMonth() === i ? ' selected' : ''}>${m}</option>`).join('')}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${now.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" placeholder="Ex: Clientes recorrentes"></div>`
  openModal(
    'Novo lançamento',
    body,
    `<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`
  )
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', saveFat)
}

async function saveFat() {
  const d = {
    mes:      parseInt(document.getElementById('fmes').value),
    ano:      parseInt(document.getElementById('fano').value),
    valor:    parseFloat(document.getElementById('fval').value) || 0,
    descricao: document.getElementById('fdesc').value.trim(),
  }
  if (!d.valor) { toast('Valor obrigatório.', 'er'); return }
  const { error } = await db.from('faturamento').insert(d)
  if (error) { toast('Erro.', 'er'); return }
  toast('Adicionado.')
  closeModal()
  render()
}
