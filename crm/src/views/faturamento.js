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
let _aportes     = []  // aportes_fin — descontados do lucro mensal no Resumo
let _cxsMov      = []  // caixinhas_mov — gastos reais registrados nas caixinhas
let _cxs         = []  // caixinhas — definição (valor_mensal alocado por mês)
let _clis        = []
let _view        = 'receita'
let _delegationAttached = false
// Mês/ano selecionado na aba Resumo (default: hoje)
let _resumoMes   = new Date().getMonth() + 1
let _resumoAno   = new Date().getFullYear()

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'
  attachDelegation()  // listener único guardado por flag — evita acúmulo entre re-renders

  // Auto-geração agora é server-side via pg_cron (edge function gerar-recorrentes).
  // Cliente só carrega os dados.
  await loadAll()

  renderToolbar()
  renderView()
}

// Listener delegado, anexado UMA vez por sessão. Roteia por _view e classes.
function attachDelegation() {
  if (_delegationAttached) return
  _delegationAttached = true
  document.getElementById('content').addEventListener('click', async (e) => {
    if (_view !== 'recorrentes') return
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

    try {
      if (edit) {
        tipo === 'receita' ? recReceitaForm(r) : recDespesaForm(r)
      } else if (del) {
        if (!confirm(`Excluir "${r.descricao}"? (Lançamentos já gerados continuam)`)) return
        const { error } = await db.from(tbl).delete().eq('id', r.id)
        if (error) throw error
        toast('Excluída'); render()
      } else if (run) {
        await rodarRecorrenteAgora(r, tipo)
        toast(tipo === 'receita' ? 'Receita lançada' : 'Despesa lançada')
        render()
      } else if (tog) {
        r.ativa = tog.checked
        const { error } = await db.from(tbl).update({ ativa: r.ativa, atualizado_em: new Date().toISOString() }).eq('id', r.id)
        if (error) throw error
        render()
      }
    } catch (err) {
      console.error('[recorrentes]', err)
      toast('Erro: ' + (err.message || err), 'err')
    }
  })
}

async function loadAll() {
  const [f, d, rd, rr, ap, cm, cx, cli] = await Promise.all([
    db.from('faturamento').select('*').order('ano', { ascending: false }).order('mes', { ascending: false }),
    selectAll('despesas',             { order: { column: 'data', ascending: false } }),
    selectAll('despesas_recorrentes', { order: { column: 'criado_em', ascending: false } }),
    selectAll('receitas_recorrentes', { order: { column: 'criado_em', ascending: false } }),
    db.from('aportes_fin').select('data,valor').order('data', { ascending: false }),
    db.from('caixinhas_mov').select('data,valor,caixinha_id').order('data', { ascending: false }),
    db.from('caixinhas').select('id,valor_mensal,ativa,criado_em').eq('ativa', true),
    selectAll('clientes', { columns: 'id,nome,empresa,status' }),
  ])
  _fat         = f.data || []
  _despesas    = d.data || []
  _recDespesas = rd.data || []
  _recReceitas = rr.data || []
  _aportes     = (ap && !ap.error) ? (ap.data || []) : []
  _cxsMov      = (cm && !cm.error) ? (cm.data || []) : []
  _cxs         = (cx && !cx.error) ? (cx.data || []) : []
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
  const doAno = _despesas.filter(d => (d.data || '').startsWith(String(ano)))
  const totMes = doMes.reduce((s, d) => s + Number(d.valor), 0)
  const totAno = doAno.reduce((s, d) => s + Number(d.valor), 0)
  const totRec = _recDespesas.filter(r => r.ativa).reduce((s, r) => s + Number(r.valor), 0)

  // Por categoria — ano todo (alinha com Resumo que também é por ano)
  const porCat = {}
  for (const d of doAno) {
    porCat[d.categoria || 'outro'] = (porCat[d.categoria || 'outro'] || 0) + Number(d.valor)
  }
  const catCards = Object.entries(porCat)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => {
      const c = CAT_MAP[k] || CAT_MAP.outro
      const pct = totAno > 0 ? Math.round(v / totAno * 100) : 0
      return `<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${c.cor}"></span>
          <span class="desp-cat-name">${c.l}</span>
          <span class="desp-cat-pct">${pct}%</span>
        </div>
        <div class="desp-cat-val">${brl(v)}</div>
      </div>`
    }).join('') || `<div class="empty">Sem despesas em ${ano}.</div>`

  const rows = _despesas.length
    ? _despesas.map(d => {
        const cat = CAT_MAP[d.categoria] || CAT_MAP.outro
        const tags = []
        if (d.recorrente_id)   tags.push('<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>')
        if (d.parcelamento_id) tags.push(`<span class="desp-parc-tag" title="Parcelado">${d.parcela_num}/${d.parcelas_total}</span>`)
        return `<tr>
          <td class="tm">${fmtd(d.data)}</td>
          <td class="tn">${esc(d.descricao)}${tags.join('')}</td>
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
      <div class="ct">Por categoria — ${ano}</div>
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
  // Listener é delegado em attachDelegation() — anexado UMA vez no render() inicial.
}

// Projeção de um mês: o que JÁ foi lançado + o que VAI entrar/sair por recorrente
function projecaoMes(mesAlvo, anoAlvo) {
  const hoje = new Date()
  const isPast = (anoAlvo < hoje.getFullYear())
    || (anoAlvo === hoje.getFullYear() && mesAlvo < hoje.getMonth() + 1)
  const mStr = `${anoAlvo}-${String(mesAlvo).padStart(2,'0')}`

  const recReal = _fat.filter(f => f.mes === mesAlvo && f.ano === anoAlvo)
                      .reduce((s, f) => s + Number(f.valor), 0)
  const desReal = _despesas.filter(x => (x.data||'').startsWith(mStr))
                           .reduce((s, x) => s + Number(x.valor), 0)

  let recPend = 0, desPend = 0
  if (!isPast) {
    for (const r of _recReceitas) {
      if (!r.ativa) continue
      const jaTem = _fat.some(f => f.recorrente_id === r.id && f.mes === mesAlvo && f.ano === anoAlvo)
      if (!jaTem) recPend += Number(r.valor)
    }
    for (const r of _recDespesas) {
      if (!r.ativa) continue
      const jaTem = _despesas.some(x => x.recorrente_id === r.id && (x.data||'').startsWith(mStr))
      if (!jaTem) desPend += Number(r.valor)
    }
  }

  // Aportes_fin do mês — comprometido em investimento (Liberdade)
  const aportes = _aportes
    .filter(a => (a.data || '').startsWith(mStr))
    .reduce((s, a) => s + Number(a.valor || 0), 0)

  // Caixinhas: o que está comprometido neste mês.
  // Pra cada caixinha ativa criada até o fim do mês alvo:
  //   comprometido = max(valor_mensal alocado, gasto real registrado no mês)
  // Razão: criar uma caixinha "Gasolina R$500/mês" já reserva R$500 do orçamento
  // do mês — não espera você gastar pra descontar. Se estourou (gastou mais),
  // conta o estouro.
  const fimMes = new Date(anoAlvo, mesAlvo, 0)  // último dia do mês alvo
  const gastoReal = _cxsMov
    .filter(c => (c.data || '').startsWith(mStr))
    .reduce((s, c) => s + Number(c.valor || 0), 0)
  let cxsComprometido = 0
  let cxsAlocacao     = 0
  for (const cx of _cxs) {
    if (!cx.ativa) continue
    const criadoEm = cx.criado_em ? new Date(cx.criado_em) : new Date(0)
    if (criadoEm > fimMes) continue  // caixinha criada depois desse mês, ignora
    const aloc = Number(cx.valor_mensal || 0)
    const gasto = _cxsMov
      .filter(c => c.caixinha_id === cx.id && (c.data || '').startsWith(mStr))
      .reduce((s, c) => s + Number(c.valor || 0), 0)
    cxsAlocacao     += aloc
    cxsComprometido += Math.max(aloc, gasto)
  }

  const lucroProj = (recReal + recPend) - (desReal + desPend)
  const sobra     = lucroProj - aportes - cxsComprometido

  return {
    recReal, recPend, recProj: recReal + recPend,
    desReal, desPend, desProj: desReal + desPend,
    lucroProj,
    aportes,
    cxsUsado:        gastoReal,         // gasto real (legado, ainda mostrado)
    cxsAlocacao,                        // soma dos valor_mensal ativos
    cxsComprometido,                    // o que efetivamente desce do lucro
    sobra,
    isPast,
  }
}

// ════════ RESUMO (receita - despesa = lucro) ════════════════════════════
function renderResumo() {
  const c = document.getElementById('content')
  const now = new Date()
  const ano = _resumoAno
  const mes = _resumoMes
  const mesHoje = now.getMonth() + 1
  const anoHoje = now.getFullYear()

  // Ano calendário Jan–Dez com projeção (do ano selecionado)
  const chart = []
  for (let m = 1; m <= 12; m++) {
    const p = projecaoMes(m, ano)
    chart.push({ label: MES[m - 1], mes: m, ...p, cur: m === mes, hoje: m === mesHoje && ano === anoHoje })
  }
  const maxV = Math.max(...chart.flatMap(d => [d.recProj, d.desProj]), 1)
  const mesSel = chart[mes - 1]  // o "mês em foco" agora é o selecionado, não o atual

  // Próximo mês relativo ao selecionado (mantém pra mostrar como sneak peek)
  let proxMes = null
  if (mes < 12)      proxMes = chart[mes]
  else if (mes === 12) {
    // dezembro do ano selecionado: pula pra janeiro do ano seguinte
    const p = projecaoMes(1, ano + 1)
    proxMes = { label: MES[0], mes: 1, ano: ano + 1, ...p, prox_ano: true }
  }

  // Total realizado YTD vs projeção do ano
  const recRealAno = chart.reduce((s, d) => s + d.recReal, 0)
  const desRealAno = chart.reduce((s, d) => s + d.desReal, 0)
  const lucroRealAno = recRealAno - desRealAno
  const recProjAno = chart.reduce((s, d) => s + d.recProj, 0)
  const desProjAno = chart.reduce((s, d) => s + d.desProj, 0)
  const lucroProjAno = recProjAno - desProjAno

  const rows = chart.slice().reverse().map(d => {
    const recCell = d.recPend > 0
      ? `<b>${brl(d.recProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${brl(d.recReal)} recebido · ${brl(d.recPend)} a receber</div>`
      : brl(d.recReal)
    const desCell = d.desPend > 0
      ? `<b>${brl(d.desProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${brl(d.desReal)} pago · ${brl(d.desPend)} a pagar</div>`
      : brl(d.desReal)
    return `<tr>
      <td>${d.label}${d.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':''}${d.isPast?'':' <span style="font-size:10px;color:var(--text-3)">prev</span>'}</td>
      <td style="color:var(--accent)">${recCell}</td>
      <td style="color:var(--danger)">${desCell}</td>
      <td style="font-weight:700;color:${d.lucroProj>=0?'var(--ok)':'var(--danger)'}">${brl(d.lucroProj)}</td>
    </tr>`
  }).join('')

  const barRows = chart.map(d => {
    const recPct = Math.round(d.recProj / maxV * 100)
    const desPct = Math.round(d.desProj / maxV * 100)
    return `<div class="resumo-bg${d.cur?' cur':''}">
      <div class="resumo-bars">
        <div class="resumo-bar rec${d.isPast?'':' proj'}" style="height:${recPct}%" title="Receita ${brl(d.recProj)}"></div>
        <div class="resumo-bar des${d.isPast?'':' proj'}" style="height:${desPct}%" title="Despesa ${brl(d.desProj)}"></div>
      </div>
      <div class="bl">${d.label}</div>
    </div>`
  }).join('')

  // Próximos 6 meses a partir do selecionado — atravessa anos se necessário
  const cardsProximos = []
  for (let i = 0; i < 6; i++) {
    const targetMes0 = mes - 1 + i
    if (targetMes0 < 12) {
      const d = chart[targetMes0]
      cardsProximos.push(cardMes(d, ano))
    } else {
      const offsetYear = Math.floor(targetMes0 / 12)
      const realMes = (targetMes0 % 12) + 1
      const realAno = ano + offsetYear
      const p = projecaoMes(realMes, realAno)
      const d = { label: MES[realMes - 1], mes: realMes, ...p, cur: realMes === mesHoje && realAno === anoHoje }
      cardsProximos.push(cardMes(d, realAno))
    }
  }

  // Picker: seletor de mês/ano + jump pra hoje
  const isHoje = mes === mesHoje && ano === anoHoje
  const pickerHTML = `
    <div class="resumo-picker">
      <button class="btn bg bsm" id="rsm-prev" title="Mês anterior">◀</button>
      <select class="fsl" id="rsm-mes">${MESF.map((m,i)=>`<option value="${i+1}"${i+1===mes?' selected':''}>${m}</option>`).join('')}</select>
      <input class="fi" type="number" id="rsm-ano" value="${ano}" style="width:90px;text-align:center;padding:6px 9px">
      <button class="btn bg bsm" id="rsm-next" title="Próximo mês">▶</button>
      ${!isHoje ? `<button class="btn bg bsm" id="rsm-hoje">Voltar pra hoje</button>` : ''}
    </div>`

  c.innerHTML = `
    ${pickerHTML}

    <!-- Destaque: mês em foco (o selecionado no picker) -->
    <div class="cw" style="margin-bottom:18px;border:1px solid rgba(193,255,42,.2)">
      <div class="ct" style="color:var(--accent)">${mesSel.isPast ? 'Realizado' : 'Projeção'} — ${MESF[mesSel.mes-1]} ${ano}${mesSel.hoje ? ' · atual' : ''}</div>
      <div class="sg" style="grid-template-columns:repeat(3,1fr);margin-bottom:0;margin-top:12px">
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Receita ${mesSel.isPast?'realizada':'prevista'}</div>
          <div class="sv" style="color:var(--accent)">${brl(mesSel.recProj)}</div>
          ${mesSel.recPend > 0 ? `<div class="ss">${brl(mesSel.recReal)} recebido · ${brl(mesSel.recPend)} a receber</div>` : ''}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Despesa ${mesSel.isPast?'paga':'prevista'}</div>
          <div class="sv" style="color:var(--danger)">${brl(mesSel.desProj)}</div>
          ${mesSel.desPend > 0 ? `<div class="ss">${brl(mesSel.desReal)} pago · ${brl(mesSel.desPend)} a pagar</div>` : ''}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Lucro bruto</div>
          <div class="sv" style="color:${mesSel.lucroProj>=0?'var(--ok)':'var(--danger)'}">${brl(mesSel.lucroProj)}</div>
          <div class="ss">Margem ${mesSel.recProj>0?Math.round(mesSel.lucroProj/mesSel.recProj*100)+'%':'—'}</div>
        </div>
      </div>

      <!-- Linha 2: alocações que abatem do lucro -->
      <div class="sg" style="grid-template-columns:repeat(3,1fr);margin:10px 0 0">
        <div class="sc" style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15)">
          <div class="sl">Investido (Liberdade)</div>
          <div class="sv" style="color:#A78BFA">${brl(mesSel.aportes)}</div>
          <div class="ss">${mesSel.aportes > 0
            ? `${aportesCount(mesSel.mes, ano)} aporte${aportesCount(mesSel.mes, ano)===1?'':'s'}`
            : 'sem aporte'}</div>
        </div>
        <div class="sc" style="background:rgba(74,158,255,.06);border:1px solid rgba(74,158,255,.15)">
          <div class="sl">Caixinhas</div>
          <div class="sv" style="color:#4A9EFF">${brl(mesSel.cxsComprometido)}</div>
          <div class="ss">${mesSel.cxsAlocacao > 0
            ? `${brl(mesSel.cxsUsado)} gasto · ${brl(mesSel.cxsAlocacao)} alocado/mês`
            : 'nenhuma caixinha'}</div>
        </div>
        <div class="sc" style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.18)">
          <div class="sl">Sobrou pra você</div>
          <div class="sv" style="color:${mesSel.sobra>=0?'#34D399':'var(--danger)'}">${brl(mesSel.sobra)}</div>
          <div class="ss">${mesSel.lucroProj > 0
            ? `${Math.round((mesSel.aportes + mesSel.cxsComprometido) / mesSel.lucroProj * 100)}% do lucro alocado`
            : 'lucro insuficiente'}</div>
        </div>
      </div>
    </div>

    <!-- Fluxo dos próximos 6 meses a partir do selecionado -->
    <div class="ct" style="margin-bottom:8px">Próximos meses — lucro projetado</div>
    <div class="sg" style="grid-template-columns:repeat(${cardsProximos.length},1fr);margin-bottom:22px">${cardsProximos.join('')}</div>

    <!-- Ano corrente -->
    <div class="sg" style="grid-template-columns:repeat(3,1fr)">
      <div class="sc"><div class="sl">Realizado em ${ano}</div>
        <div class="sv" style="color:${lucroRealAno>=0?'var(--ok)':'var(--danger)'}">${brl(lucroRealAno)}</div>
        <div class="ss">${brl(recRealAno)} − ${brl(desRealAno)}</div>
      </div>
      <div class="sc"><div class="sl">Projeção ${ano} (com recorrentes)</div>
        <div class="sv" style="color:${lucroProjAno>=0?'var(--ok)':'var(--danger)'}">${brl(lucroProjAno)}</div>
        <div class="ss">${brl(recProjAno)} − ${brl(desProjAno)}</div>
      </div>
      <div class="sc"><div class="sl">Recorrentes ativas</div>
        <div class="sv">${brl(_recReceitas.filter(r=>r.ativa).reduce((s,r)=>s+Number(r.valor),0) - _recDespesas.filter(r=>r.ativa).reduce((s,r)=>s+Number(r.valor),0))}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div>
      </div>
    </div>

    <div class="cw">
      <div class="ct">Receita vs Despesa — ${ano} (projetado)</div>
      <div class="bc">${barRows}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center;flex-wrap:wrap">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
        <span style="opacity:.6">Barras com listras = projeção (ainda não realizada)</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal — ${ano}</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro proj.</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`

  // ── Handlers do picker ──────────────────────────────────────────────────
  const goto = (m, a) => {
    let mm = m, aa = a
    if (mm < 1)  { mm = 12; aa-- }
    if (mm > 12) { mm = 1;  aa++ }
    if (aa < 2020 || aa > 2099) return
    _resumoMes = mm; _resumoAno = aa
    renderResumo()
  }
  document.getElementById('rsm-prev').addEventListener('click', () => goto(mes - 1, ano))
  document.getElementById('rsm-next').addEventListener('click', () => goto(mes + 1, ano))
  document.getElementById('rsm-mes').addEventListener('change', e => goto(parseInt(e.target.value), ano))
  document.getElementById('rsm-ano').addEventListener('change', e => {
    const v = parseInt(e.target.value)
    if (v >= 2020 && v <= 2099) goto(mes, v)
  })
  const hojeBtn = document.getElementById('rsm-hoje')
  if (hojeBtn) hojeBtn.addEventListener('click', () => goto(mesHoje, anoHoje))
}

// Card pequeno usado em "Próximos meses"
function cardMes(d, anoCard) {
  const showSobra = d.aportes > 0
  return `<div class="sc" style="${d.cur?'border-color:rgba(197,248,42,.3)':''}">
    <div class="sl">${MESF[d.mes-1]}${d.cur ? ' · atual' : ''}</div>
    <div class="sv" style="color:${d.lucroProj>=0?'var(--ok)':'var(--danger)'}">${brl(d.lucroProj)}</div>
    <div class="ss">${brl(d.recProj)} − ${brl(d.desProj)}</div>
    ${showSobra ? `<div class="ss" style="margin-top:6px;padding-top:6px;border-top:1px solid var(--line)">
      <span style="color:#A78BFA">−${brl(d.aportes)}</span> aporte
      <div style="color:${d.sobra>=0?'#34D399':'var(--danger)'};font-weight:600;margin-top:2px">${brl(d.sobra)} sobra</div>
    </div>` : ''}
  </div>`
}

// Conta quantos aportes no mês (pra texto auxiliar)
function aportesCount(mes, ano) {
  const mStr = `${ano}-${String(mes).padStart(2,'0')}`
  return _aportes.filter(a => (a.data || '').startsWith(mStr)).length
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
  const jaParcelada = !!d.parcelamento_id

  openModal(isNew ? 'Nova despesa' : 'Editar despesa', `
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${escAttr(d.descricao || '')}" placeholder="Ex: Fatura Nubank, TV Samsung, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${catOpts}</select></div>
      <div class="fg"><label class="fl">Valor ${isNew ? 'TOTAL' : ''} (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${d.valor || ''}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data ${isNew ? 'da 1ª parcela' : ''} *</label>
      <input class="fi" type="date" id="d-data" value="${d.data || hoje}"></div>

    ${isNew ? `
    <div class="fg" style="margin-top:11px">
      <label class="fl">Parcelas</label>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="fi" type="number" min="1" max="36" id="d-parc" value="1" style="width:90px">
        <span style="font-size:12px;color:var(--text-3)" id="d-parc-preview">à vista</span>
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:4px">Ex: TV em 10x — gera 10 lançamentos mensais a partir da data acima.</div>
    </div>
    ` : (jaParcelada ? `
    <div style="margin-top:11px;padding:10px 12px;background:rgba(193,255,42,.06);border:1px solid rgba(193,255,42,.15);border-radius:6px;font-size:12px;color:var(--text-2)">
      ↻ Parcela ${d.parcela_num}/${d.parcelas_total} de um parcelamento. Editar aqui afeta só esta parcela.
    </div>
    ` : '')}
  `, `
    ${isNew ? '' : '<button class="btn bd" id="d-del">Excluir</button>'}
    ${jaParcelada ? '<button class="btn bd" id="d-del-grupo">Excluir TODAS as parcelas</button>' : ''}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `)

  // Preview do parcelamento ao vivo
  if (isNew) {
    const parcInp = document.getElementById('d-parc')
    const valInp  = document.getElementById('d-val')
    const preview = document.getElementById('d-parc-preview')
    const atualiza = () => {
      const n = parseInt(parcInp.value) || 1
      const v = parseFloat(valInp.value) || 0
      if (n <= 1) preview.textContent = 'à vista'
      else if (v > 0) preview.textContent = `${n}x de R$ ${(v/n).toFixed(2).replace('.', ',')}`
      else preview.textContent = `${n}x`
    }
    parcInp.addEventListener('input', atualiza)
    valInp.addEventListener('input', atualiza)
  }

  document.getElementById('m-cancel').addEventListener('click', closeModal)
  if (!isNew) document.getElementById('d-del').addEventListener('click', async () => {
    if (!confirm('Excluir essa despesa?')) return
    await delDesp(d.id); closeModal()
  })
  if (jaParcelada) document.getElementById('d-del-grupo').addEventListener('click', async () => {
    if (!confirm(`Excluir TODAS as ${d.parcelas_total} parcelas desse parcelamento?`)) return
    await db.from('despesas').delete().eq('parcelamento_id', d.parcelamento_id)
    toast('Parcelamento excluído'); closeModal(); render()
  })
  document.getElementById('m-save').addEventListener('click', async () => {
    const descricao = document.getElementById('d-desc').value.trim()
    const categoria = document.getElementById('d-cat').value
    const valorTotal = parseFloat(document.getElementById('d-val').value) || 0
    const dataIni  = document.getElementById('d-data').value
    if (!descricao)  return toast('Descrição obrigatória', 'err')
    if (!valorTotal) return toast('Valor obrigatório', 'err')
    if (!dataIni)    return toast('Data obrigatória', 'err')

    if (d.id) {
      // EDIT — sem parcelamento, atualiza só esse row
      const { error } = await db.from('despesas')
        .update({ descricao, categoria, valor: valorTotal, data: dataIni })
        .eq('id', d.id)
      if (error) return toast('Erro: '+error.message, 'err')
      closeModal(); toast('Salvo'); render()
      return
    }

    // NEW — checa se é parcelado
    const parcelas = Math.max(1, Math.min(36, parseInt(document.getElementById('d-parc').value) || 1))
    if (parcelas === 1) {
      const { error } = await db.from('despesas').insert({
        descricao, categoria, valor: valorTotal, data: dataIni,
      })
      if (error) return toast('Erro: '+error.message, 'err')
      closeModal(); toast('Despesa adicionada'); render()
      return
    }

    // Parcelado: gera N rows com mesmo parcelamento_id
    const parcelamento_id = crypto.randomUUID()
    const valorParcela = Math.round((valorTotal / parcelas) * 100) / 100
    const sobra = Math.round((valorTotal - valorParcela * parcelas) * 100) / 100
    const [ano, mes, dia] = dataIni.split('-').map(Number)
    const rows = []
    for (let i = 0; i < parcelas; i++) {
      // mês i a partir de dataIni
      const novoMes0 = (mes - 1) + i
      const novoAno  = ano + Math.floor(novoMes0 / 12)
      const novoMes  = (novoMes0 % 12) + 1
      const ultimoDia = new Date(novoAno, novoMes, 0).getDate()
      const novoDia = Math.min(dia, ultimoDia)
      const dataIso = `${novoAno}-${String(novoMes).padStart(2,'0')}-${String(novoDia).padStart(2,'0')}`
      // ajusta sobra (centavos) na última parcela
      const v = (i === parcelas - 1) ? (valorParcela + sobra) : valorParcela
      rows.push({
        descricao: `${descricao} (${i+1}/${parcelas})`,
        categoria,
        valor: v,
        data: dataIso,
        parcelamento_id,
        parcela_num: i + 1,
        parcelas_total: parcelas,
      })
    }
    const { error } = await db.from('despesas').insert(rows)
    if (error) return toast('Erro: '+error.message, 'err')
    closeModal(); toast(`${parcelas} parcelas criadas`); render()
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

// ════════ Lançamento manual (botão "Lançar agora") ══════════════════════
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
