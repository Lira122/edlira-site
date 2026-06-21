import { db, selectAll } from '../db.js'
import { brl, bk, fmtd, toast, openModal, closeModal, MES, MESF } from '../utils.js'

// ════════ CATEGORIAS DE DESPESA ═════════════════════════════════════════
const CATS = [
  { k: 'ia',          l: 'IA / Software',   cor: '#A78BFA' },  // Claude, OpenAI, ChatGPT
  { k: 'infra',       l: 'Infra',           cor: '#4A9EFF' },  // Supabase, Vercel, UazAPI
  { k: 'marketing',   l: 'Marketing/Ads',   cor: '#F5A623' },  // Meta Ads, Google Ads
  { k: 'operacional', l: 'Operacional',     cor: '#34D399' },  // Cartão, contador, escritório
  { k: 'pessoal',     l: 'Pessoal',         cor: '#EC4899' },
  { k: 'outro',       l: 'Outro',           cor: '#A0A0A0' },
]
const CAT_MAP = Object.fromEntries(CATS.map(c => [c.k, c]))

let _fat         = []
let _despesas    = []
let _recDespesas = []
let _recReceitas = []
let _clis        = []
let _view        = 'receita'

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  await loadAll()
  await gerarRecorrentes()
  await loadAll()

  renderToolbar()
  renderView()
}

async function loadAll() {
  const [f, d, rd, rr, cli] = await Promise.all([
    db.from('faturamento').select('*').order('ano', { ascending: false }).order('mes', { ascending: false }),
    selectAll('despesas',             { order: { column: 'data', ascending: false } }),
    selectAll('despesas_recorrentes', { order: { column: 'criado_em', ascending: false } }),
    selectAll('receitas_recorrentes', { order: { column: 'criado_em', ascending: false } }),
    selectAll('clientes', { columns: 'id,nome,empresa,status' }),
  ])
  _fat         = f.data || []
  _despesas    = d.data || []
  _recDespesas = rd.data || []
  _recReceitas = rr.data || []
  _clis        = cli.data || []
}

function renderToolbar() {
  const tab = (k, l) => `<button class="pj-tab${_view===k?' on':''}" data-tab="${k}">${l}</button>`
  let addBtn = ''
  if (_view === 'receita')     addBtn = `<button class="btn bp" id="btn-add">+ Receita</button>`
  if (_view === 'despesas')    addBtn = `<button class="btn bp" id="btn-add">+ Despesa</button>`
  if (_view === 'recorrentes') addBtn = `
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`

  document.getElementById('tbacts').innerHTML = `
    <div class="pj-tabs">${tab('receita','Receita')}${tab('despesas','Despesas')}${tab('recorrentes','Recorrentes')}${tab('resumo','Resumo')}</div>
    ${addBtn}
  `
  document.querySelectorAll('.pj-tab').forEach(el => el.addEventListener('click', () => {
    _view = el.dataset.tab; renderToolbar(); renderView()
  }))
  const add = document.getElementById('btn-add')
  if (add) {
    if (_view === 'receita')  add.addEventListener('click', () => fatForm())
    if (_view === 'despesas') add.addEventListener('click', () => despForm())
  }
  const addRecR = document.getElementById('btn-add-rec-receita')
  const addRecD = document.getElementById('btn-add-rec-despesa')
  if (addRecR) addRecR.addEventListener('click', () => recReceitaForm())
  if (addRecD) addRecD.addEventListener('click', () => recDespesaForm())
}

function renderView() {
  if (_view === 'despesas')    return renderDespesas()
  if (_view === 'recorrentes') return renderRecorrentes()
  if (_view === 'resumo')      return renderResumo()
  return renderReceita()
}

// ════════ RECEITA (era o conteúdo original) ════════════════════════════
function renderReceita() {
  const c = document.getElementById('content')
  const now = new Date()
  const ano = now.getFullYear()
  const mes = now.getMonth() + 1

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
          <td class="tm">${esc(f.descricao || '—')}${f.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':''}</td>
          <td class="tm">${fmtd(f.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${f.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${f.id}">×</button>
          </td>
        </tr>`).join('')
    : `<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>`

  c.innerHTML = `
    <div class="sg">
      <div class="sc"><div class="sl">Total ${ano}</div><div class="sv ac">${brl(totAno)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${brl(media)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${melhor ? brl(melhor.valor) : '—'}</div>
        <div class="ss">${melhor ? MESF[melhor.mes - 1] + ' ' + melhor.ano : ''}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Receita — últimos 12 meses</div>
      <div class="bc">${barRows}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${fatRows}</tbody>
      </table>
    </div>`

  c.querySelectorAll('.edit-fat').forEach(b => b.addEventListener('click', () => {
    const f = _fat.find(x => x.id === b.dataset.id); if (f) fatForm(f)
  }))
  c.querySelectorAll('.del-fat').forEach(b => b.addEventListener('click', () => delFat(b.dataset.id)))
}

// ════════ DESPESAS ═══════════════════════════════════════════════════════
function renderDespesas() {
  const c = document.getElementById('content')
  const now = new Date()
  const ano = now.getFullYear()
  const mesAtual = now.getMonth() + 1
  const mesAtualStr = `${ano}-${String(mesAtual).padStart(2,'0')}`

  const doMes = _despesas.filter(d => (d.data || '').startsWith(mesAtualStr))
  const totMes = doMes.reduce((s, d) => s + Number(d.valor), 0)
  const totAno = _despesas.filter(d => (d.data || '').startsWith(String(ano))).reduce((s, d) => s + Number(d.valor), 0)
  const totRec = _recorrentes.filter(r => r.ativa).reduce((s, r) => s + Number(r.valor), 0)

  // Por categoria (mês atual)
  const porCat = {}
  for (const d of doMes) {
    porCat[d.categoria || 'outro'] = (porCat[d.categoria || 'outro'] || 0) + Number(d.valor)
  }
  const catCards = Object.entries(porCat)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => {
      const c = CAT_MAP[k] || CAT_MAP.outro
      const pct = totMes > 0 ? Math.round(v / totMes * 100) : 0
      return `<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${c.cor}"></span>
          <span class="desp-cat-name">${c.l}</span>
          <span class="desp-cat-pct">${pct}%</span>
        </div>
        <div class="desp-cat-val">${brl(v)}</div>
      </div>`
    }).join('') || `<div class="empty">Sem despesas neste mês.</div>`

  const rows = _despesas.length
    ? _despesas.map(d => {
        const cat = CAT_MAP[d.categoria] || CAT_MAP.outro
        return `<tr>
          <td class="tm">${fmtd(d.data)}</td>
          <td class="tn">${esc(d.descricao)}${d.recorrente_id?'<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>':''}</td>
          <td><span class="desp-cat-pill" style="background:${cat.cor}22;color:${cat.cor}">${cat.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${brl(d.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${d.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${d.id}">×</button>
          </td>
        </tr>`
      }).join('')
    : `<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>`

  c.innerHTML = `
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${MESF[mesAtual-1]}</div><div class="sv" style="color:var(--danger)">${brl(totMes)}</div></div>
      <div class="sc"><div class="sl">Despesas ${ano}</div><div class="sv">${brl(totAno)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${brl(totRec)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${MESF[mesAtual-1]} ${ano}</div>
      <div class="desp-cat-grid">${catCards}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`

  c.querySelectorAll('.edit-desp').forEach(b => b.addEventListener('click', () => {
    const d = _despesas.find(x => x.id === b.dataset.id); if (d) despForm(d)
  }))
  c.querySelectorAll('.del-desp').forEach(b => b.addEventListener('click', () => delDesp(b.dataset.id)))
}

// ════════ RECORRENTES (RECEITAS + DESPESAS lado a lado) ═════════════════
function renderRecorrentes() {
  const c = document.getElementById('content')

  const totRecAtivas = _recReceitas.filter(r => r.ativa).reduce((s, r) => s + Number(r.valor), 0)
  const totDesAtivas = _recDespesas.filter(r => r.ativa).reduce((s, r) => s + Number(r.valor), 0)
  const lucroMensal  = totRecAtivas - totDesAtivas

  const renderRecCard = (r, tipo) => {
    const tabela = tipo === 'receita' ? 'receitas_recorrentes' : 'despesas_recorrentes'
    const cor    = tipo === 'receita' ? 'var(--accent)' : 'var(--danger)'
    const cat    = tipo === 'despesa' ? (CAT_MAP[r.categoria] || CAT_MAP.outro) : null
    const cli    = tipo === 'receita' && r.cliente_id ? _clis.find(x => x.id === r.cliente_id) : null
    const diaLbl = r.dia_util ? `${r.dia_mes}º dia útil` : `Dia ${r.dia_mes}`
    return `<div class="desp-rec-card ${r.ativa?'':'paused'}" data-rid="${r.id}" data-tipo="${tipo}">
      <div class="desp-rec-head">
        ${cat ? `<span class="desp-cat-pill" style="background:${cat.cor}22;color:${cat.cor}">${cat.l}</span>` : (cli ? `<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${esc(cli.empresa||cli.nome)}</span>` : '<span></span>')}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${r.id}" data-tipo="${tipo}" ${r.ativa?'checked':''}>
          <span>${r.ativa ? 'Ativa' : 'Pausada'}</span>
        </label>
      </div>
      <div class="desp-rec-name">${esc(r.descricao)}</div>
      <div class="desp-rec-val" style="color:${cor}">${brl(r.valor)}</div>
      <div class="desp-rec-meta">${diaLbl} de cada mês${r.ultima_geracao ? ' · Última: '+fmtd(r.ultima_geracao) : ''}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${r.id}" data-tipo="${tipo}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${r.id}" data-tipo="${tipo}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${r.id}" data-tipo="${tipo}">Excluir</button>
      </div>
    </div>`
  }

  const receitaCards = _recReceitas.map(r => renderRecCard(r, 'receita')).join('')
                       || `<div class="empty">Nenhuma receita recorrente cadastrada.</div>`
  const despesaCards = _recDespesas.map(r => renderRecCard(r, 'despesa')).join('')
                       || `<div class="empty">Nenhuma despesa recorrente cadastrada.</div>`

  c.innerHTML = `
    <div class="sg">
      <div class="sc"><div class="sl">Receitas/mês</div><div class="sv" style="color:var(--accent)">${brl(totRecAtivas)}</div></div>
      <div class="sc"><div class="sl">Despesas/mês</div><div class="sv" style="color:var(--danger)">${brl(totDesAtivas)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/mês</div><div class="sv" style="color:${lucroMensal>=0?'var(--ok)':'var(--danger)'}">${brl(lucroMensal)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/ano</div><div class="sv">${brl(lucroMensal*12)}</div></div>
    </div>

    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>💰 Receitas Recorrentes — entram automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${receitaCards}</div></div>
    </div>

    <div class="tw">
      <div class="th"><h3>💸 Despesas Recorrentes — saem automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${despesaCards}</div></div>
    </div>`

  c.addEventListener('click', async e => {
    const edit = e.target.closest('.rec-edit')
    const del  = e.target.closest('.rec-del')
    const run  = e.target.closest('.rec-run')
    const tog  = e.target.closest('.desp-rec-active')
    const action = edit || del || run || tog
    if (!action) return
    const tipo = action.dataset.tipo
    const list = tipo === 'receita' ? _recReceitas : _recDespesas
    const tbl  = tipo === 'receita' ? 'receitas_recorrentes' : 'despesas_recorrentes'
    const r    = list.find(x => x.id === action.dataset.rid)
    if (!r) return

    if (edit) {
      tipo === 'receita' ? recReceitaForm(r) : recDespesaForm(r)
    } else if (del) {
      if (!confirm(`Excluir "${r.descricao}"? (Lançamentos já gerados continuam)`)) return
      await db.from(tbl).delete().eq('id', r.id)
      toast('Excluída'); render()
    } else if (run) {
      await rodarRecorrenteAgora(r, tipo)
      toast(tipo === 'receita' ? 'Receita lançada' : 'Despesa lançada')
      render()
    } else if (tog) {
      r.ativa = tog.checked
      await db.from(tbl).update({ ativa: r.ativa, atualizado_em: new Date().toISOString() }).eq('id', r.id)
      render()
    }
  })
}

// ════════ RESUMO (receita - despesa = lucro) ════════════════════════════
function renderResumo() {
  const c = document.getElementById('content')
  const now = new Date()
  const ano = now.getFullYear()
  const mes = now.getMonth() + 1

  // 12 meses
  const chart = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(ano, mes - 1 - i, 1)
    const m = d.getMonth() + 1, y = d.getFullYear()
    const mStr = `${y}-${String(m).padStart(2,'0')}`
    const rec = _fat.filter(f => f.mes === m && f.ano === y).reduce((s, f) => s + Number(f.valor), 0)
    const des = _despesas.filter(x => (x.data||'').startsWith(mStr)).reduce((s, x) => s + Number(x.valor), 0)
    chart.push({ label: MES[m - 1], rec, des, lucro: rec - des, cur: i === 0 })
  }
  const maxV = Math.max(...chart.flatMap(d => [d.rec, d.des, Math.abs(d.lucro)]), 1)

  const mesAtual = chart[chart.length - 1]

  const rows = chart.slice().reverse().map(d => `
    <tr>
      <td>${d.label}${d.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':''}</td>
      <td style="color:var(--accent);font-weight:500">${brl(d.rec)}</td>
      <td style="color:var(--danger);font-weight:500">${brl(d.des)}</td>
      <td style="font-weight:700;color:${d.lucro>=0?'var(--ok)':'var(--danger)'}">${brl(d.lucro)}</td>
    </tr>`).join('')

  const barRows = chart.map(d => {
    const recPct = Math.round(d.rec / maxV * 100)
    const desPct = Math.round(d.des / maxV * 100)
    return `<div class="resumo-bg">
      <div class="resumo-bars">
        <div class="resumo-bar rec" style="height:${recPct}%" title="Receita ${brl(d.rec)}"></div>
        <div class="resumo-bar des" style="height:${desPct}%" title="Despesa ${brl(d.des)}"></div>
      </div>
      <div class="bl">${d.label}</div>
    </div>`
  }).join('')

  c.innerHTML = `
    <div class="sg">
      <div class="sc"><div class="sl">Receita ${MESF[mes-1]}</div><div class="sv" style="color:var(--accent)">${brl(mesAtual.rec)}</div></div>
      <div class="sc"><div class="sl">Despesa ${MESF[mes-1]}</div><div class="sv" style="color:var(--danger)">${brl(mesAtual.des)}</div></div>
      <div class="sc"><div class="sl">Lucro ${MESF[mes-1]}</div><div class="sv" style="color:${mesAtual.lucro>=0?'var(--ok)':'var(--danger)'}">${brl(mesAtual.lucro)}</div></div>
      <div class="sc"><div class="sl">Margem</div><div class="sv">${mesAtual.rec>0?Math.round(mesAtual.lucro/mesAtual.rec*100)+'%':'—'}</div></div>
    </div>
    <div class="cw">
      <div class="ct">Receita vs Despesa — últimos 12 meses</div>
      <div class="bc">${barRows}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

// ════════ FORMS ══════════════════════════════════════════════════════════
function fatForm(f = {}) {
  const isNew = !f.id
  const now = new Date()
  openModal(isNew ? 'Nova receita' : 'Editar receita', `
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${MESF.map((m, i) => `<option value="${i + 1}"${(f.mes || now.getMonth() + 1) === i + 1 ? ' selected' : ''}>${m}</option>`).join('')}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${f.ano || now.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${f.valor || ''}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${escAttr(f.descricao || '')}" placeholder="Ex: Clientes recorrentes"></div>
  `, `
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `)
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', async () => {
    const d = {
      mes:       parseInt(document.getElementById('fmes').value),
      ano:       parseInt(document.getElementById('fano').value),
      valor:     parseFloat(document.getElementById('fval').value) || 0,
      descricao: document.getElementById('fdesc').value.trim(),
    }
    if (!d.valor) return toast('Valor obrigatório', 'err')
    const { error } = f.id
      ? await db.from('faturamento').update(d).eq('id', f.id)
      : await db.from('faturamento').insert(d)
    if (error) return toast('Erro: '+error.message, 'err')
    closeModal(); toast('Salvo'); render()
  })
}

async function delFat(id) {
  if (!confirm('Remover?')) return
  await db.from('faturamento').delete().eq('id', id)
  toast('Removido'); render()
}

function despForm(d = {}) {
  const isNew = !d.id
  const hoje = new Date().toISOString().slice(0,10)
  const catOpts = CATS.map(c => `<option value="${c.k}"${(d.categoria||'outro')===c.k?' selected':''}>${c.l}</option>`).join('')

  openModal(isNew ? 'Nova despesa' : 'Editar despesa', `
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${escAttr(d.descricao || '')}" placeholder="Ex: Fatura Nubank, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${catOpts}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${d.valor || ''}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data *</label>
      <input class="fi" type="date" id="d-data" value="${d.data || hoje}"></div>
  `, `
    ${isNew ? '' : '<button class="btn bd" id="d-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `)
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  if (!isNew) document.getElementById('d-del').addEventListener('click', async () => {
    if (!confirm('Excluir?')) return
    await delDesp(d.id); closeModal()
  })
  document.getElementById('m-save').addEventListener('click', async () => {
    const payload = {
      descricao: document.getElementById('d-desc').value.trim(),
      categoria: document.getElementById('d-cat').value,
      valor:     parseFloat(document.getElementById('d-val').value) || 0,
      data:      document.getElementById('d-data').value,
    }
    if (!payload.descricao) return toast('Descrição obrigatória', 'err')
    if (!payload.valor)     return toast('Valor obrigatório', 'err')
    if (!payload.data)      return toast('Data obrigatória', 'err')
    const { error } = d.id
      ? await db.from('despesas').update(payload).eq('id', d.id)
      : await db.from('despesas').insert(payload)
    if (error) return toast('Erro: '+error.message, 'err')
    closeModal(); toast('Salvo'); render()
  })
}

async function delDesp(id) {
  await db.from('despesas').delete().eq('id', id)
  toast('Removida'); render()
}

function recDespesaForm(r = {}) {
  const isNew = !r.id
  const catOpts = CATS.map(c => `<option value="${c.k}"${(r.categoria||'outro')===c.k?' selected':''}>${c.l}</option>`).join('')

  openModal(isNew ? 'Nova despesa recorrente' : 'Editar despesa recorrente', `
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${escAttr(r.descricao || '')}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="r-cat">${catOpts}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="r-val" type="number" step="0.01" value="${r.valor || ''}"></div>
    </div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Dia *</label>
        <input class="fi" type="number" min="1" max="31" id="r-dia" value="${r.dia_mes || 1}"></div>
      <div class="fg"><label class="fl">Tipo de dia</label>
        <select class="fsl" id="r-dia-util">
          <option value="false"${!r.dia_util?' selected':''}>Dia do calendário</option>
          <option value="true"${r.dia_util?' selected':''}>Dia útil (seg-sex)</option>
        </select></div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-3);line-height:1.5">A despesa é lançada automaticamente toda vez que você abre essa tela e chega o dia configurado.<br>Ex: "Dia 30" cai no último dia em fevereiro. "5º dia útil" pula sáb/dom.</div>
  `, `
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `)
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', async () => {
    const payload = {
      descricao: document.getElementById('r-desc').value.trim(),
      categoria: document.getElementById('r-cat').value,
      valor:     parseFloat(document.getElementById('r-val').value) || 0,
      dia_mes:   parseInt(document.getElementById('r-dia').value) || 1,
      dia_util:  document.getElementById('r-dia-util').value === 'true',
      atualizado_em: new Date().toISOString(),
    }
    if (!payload.descricao) return toast('Descrição obrigatória', 'err')
    if (!payload.valor)     return toast('Valor obrigatório', 'err')
    if (payload.dia_mes < 1 || payload.dia_mes > 31) return toast('Dia entre 1 e 31', 'err')
    const { error } = r.id
      ? await db.from('despesas_recorrentes').update(payload).eq('id', r.id)
      : await db.from('despesas_recorrentes').insert({ ...payload, ativa: true })
    if (error) return toast('Erro: '+error.message, 'err')
    closeModal(); toast('Salvo'); render()
  })
}

function recReceitaForm(r = {}) {
  const isNew = !r.id
  const ativos = _clis.filter(c => ['proposta','ativo','em_pausa','fechado'].includes(c.status) || c.id === r.cliente_id)
  const cliOpts = `<option value="">— sem cliente vinculado —</option>` +
    ativos.map(c => `<option value="${c.id}"${r.cliente_id===c.id?' selected':''}>${escAttr(c.empresa || c.nome)}</option>`).join('')

  openModal(isNew ? 'Nova receita recorrente' : 'Editar receita recorrente', `
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${escAttr(r.descricao || '')}" placeholder="Ex: Vale Pet — mensalidade"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rr-cli">${cliOpts}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="rr-val" type="number" step="0.01" value="${r.valor || ''}"></div>
    </div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Dia *</label>
        <input class="fi" type="number" min="1" max="31" id="rr-dia" value="${r.dia_mes || 1}"></div>
      <div class="fg"><label class="fl">Tipo de dia</label>
        <select class="fsl" id="rr-dia-util">
          <option value="false"${!r.dia_util?' selected':''}>Dia do calendário</option>
          <option value="true"${r.dia_util?' selected':''}>Dia útil (seg-sex)</option>
        </select></div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-3);line-height:1.5">A receita entra automaticamente na aba Faturamento quando chegar o dia configurado.</div>
  `, `
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `)
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', async () => {
    const payload = {
      descricao:  document.getElementById('rr-desc').value.trim(),
      cliente_id: document.getElementById('rr-cli').value || null,
      valor:      parseFloat(document.getElementById('rr-val').value) || 0,
      dia_mes:    parseInt(document.getElementById('rr-dia').value) || 1,
      dia_util:   document.getElementById('rr-dia-util').value === 'true',
      atualizado_em: new Date().toISOString(),
    }
    if (!payload.descricao) return toast('Descrição obrigatória', 'err')
    if (!payload.valor)     return toast('Valor obrigatório', 'err')
    if (payload.dia_mes < 1 || payload.dia_mes > 31) return toast('Dia entre 1 e 31', 'err')
    const { error } = r.id
      ? await db.from('receitas_recorrentes').update(payload).eq('id', r.id)
      : await db.from('receitas_recorrentes').insert({ ...payload, ativa: true })
    if (error) return toast('Erro: '+error.message, 'err')
    closeModal(); toast('Salvo'); render()
  })
}

// ════════ Auto-geração ═══════════════════════════════════════════════════
function diasNoMes(year, month1to12) {
  return new Date(year, month1to12, 0).getDate()
}

// N-ésimo dia útil do mês (segunda a sexta). Retorna day-of-month ou null.
function nthDiaUtil(year, month1to12, n) {
  let count = 0
  const limit = diasNoMes(year, month1to12)
  for (let day = 1; day <= limit; day++) {
    const dow = new Date(year, month1to12 - 1, day).getDay()
    if (dow !== 0 && dow !== 6) {
      count++
      if (count === n) return day
    }
  }
  return limit  // se "10º dia útil" mas só tem 8, usa o último
}

// Dia do calendário em que essa recorrente deve disparar no mês dado
function diaAlvoNoMes(r, year, month1to12) {
  if (r.dia_util) return nthDiaUtil(year, month1to12, r.dia_mes)
  return Math.min(r.dia_mes, diasNoMes(year, month1to12))
}

async function gerarRecorrentes() {
  const hoje = new Date()
  const hojeStr = hoje.toISOString().slice(0,10)
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth() + 1
  const diaHoje = hoje.getDate()
  const mesPref = `${ano}-${String(mes).padStart(2,'0')}`

  // Receitas → faturamento
  for (const r of _recReceitas) {
    if (!r.ativa) continue
    if (r.ultima_geracao && r.ultima_geracao.startsWith(mesPref)) continue
    const diaAlvo = diaAlvoNoMes(r, ano, mes)
    if (diaHoje < diaAlvo) continue
    await db.from('faturamento').insert({
      mes, ano,
      valor: r.valor,
      descricao: r.descricao,
      cliente_id: r.cliente_id || null,
      recorrente_id: r.id,
    })
    await db.from('receitas_recorrentes').update({ ultima_geracao: hojeStr }).eq('id', r.id)
  }

  // Despesas → despesas
  for (const r of _recDespesas) {
    if (!r.ativa) continue
    if (r.ultima_geracao && r.ultima_geracao.startsWith(mesPref)) continue
    const diaAlvo = diaAlvoNoMes(r, ano, mes)
    if (diaHoje < diaAlvo) continue
    await db.from('despesas').insert({
      descricao: r.descricao,
      categoria: r.categoria,
      valor:     r.valor,
      data:      `${mesPref}-${String(diaAlvo).padStart(2,'0')}`,
      recorrente_id: r.id,
    })
    await db.from('despesas_recorrentes').update({ ultima_geracao: hojeStr }).eq('id', r.id)
  }
}

async function rodarRecorrenteAgora(r, tipo) {
  const hoje = new Date()
  const hojeStr = hoje.toISOString().slice(0,10)
  if (tipo === 'receita') {
    await db.from('faturamento').insert({
      mes: hoje.getMonth() + 1, ano: hoje.getFullYear(),
      valor: r.valor, descricao: r.descricao,
      cliente_id: r.cliente_id || null, recorrente_id: r.id,
    })
    await db.from('receitas_recorrentes').update({ ultima_geracao: hojeStr }).eq('id', r.id)
  } else {
    await db.from('despesas').insert({
      descricao: r.descricao, categoria: r.categoria, valor: r.valor,
      data: hojeStr, recorrente_id: r.id,
    })
    await db.from('despesas_recorrentes').update({ ultima_geracao: hojeStr }).eq('id', r.id)
  }
}

// ════════ Helpers ════════════════════════════════════════════════════════
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])) }
function escAttr(s) { return esc(s) }
