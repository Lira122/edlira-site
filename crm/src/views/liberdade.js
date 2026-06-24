// ═══════════════════════════════════════════════════════════════════
// LIBERDADE FINANCEIRA — V2 com múltiplas metas
// Cada meta é uma "caixinha" independente (Liberdade R$100k, Macbook,
// viagem, etc). Cada aporte vincula a UMA meta. Selic puxada do BCB
// em tempo real toda vez que a view abre.
//
// Source of truth: tabelas metas_fin, aportes_fin, config_fin
// Schema: supabase/liberdade-financeira-v2.sql
// ═══════════════════════════════════════════════════════════════════
import { db, CFG, selectAll } from '../db.js'
import { brl, toast, openModal, closeModal, fmtd, MES } from '../utils.js'

let _cfg     = null
let _metas   = []
let _aportes = []
let _fat     = []
let _desp    = []   // despesas pontuais
let _despRec = []   // despesas recorrentes (assinaturas, contas fixas)
let _recRec  = []   // receitas recorrentes
let _cxs     = []   // caixinhas (definição)
let _cxsMov  = []   // caixinhas movimentações (gastos reais)
let _selicTimer = null  // setInterval handle pra re-fetch periódico

// Simulador — qual meta + parâmetros + FASES (aporte muda ao longo do tempo)
// fases: [{ inicio: 0, aporte: 2500 }, { inicio: 6, aporte: 4000 }]
// Significa: do mês 0 ao 5 = R$2500, do mês 6 em diante = R$4000.
let _sim = {
  metaId: null,
  meses:  60,
  taxa:   14.25,
  fases: [{ inicio: 0, aporte: 2000 }],
}

// Cores predefinidas pra picker de meta
const CORES = ['#C5F82A', '#4A9EFF', '#A78BFA', '#F5A623', '#EC4899', '#34D399', '#FF6B35', '#06B6D4']
const ICONES_SUG = ['🚀','💻','✈️','🏠','🚗','💍','📚','🎓','🎯','💰','🏖️','📱','🎸','🎮']

// Re-checa a Selic a cada 6h (caso usuário deixe a aba aberta o dia todo)
const SELIC_REFRESH_MS = 6 * 60 * 60 * 1000

// Chat IA — conversa persiste durante a sessão (volta vazia ao trocar de view)
let _chat = {
  open: false,
  msgs: [],         // [{ role: 'user'|'assistant', content: '...' }]
  loading: false,
}

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando…</div>'

  await loadAll()
  await tentarAtualizarSelic()  // não-bloqueante, atualiza se conseguir
  scheduleSelicRefresh()        // a cada 6h re-checa BCB enquanto a view tá aberta

  // Inicializa simulador apontando pra meta principal
  if (!_sim.metaId || !_metas.find(m => m.id === _sim.metaId)) {
    const principal = _metas.find(m => m.principal) || _metas[0]
    _sim.metaId = principal?.id || null
  }
  if (!_sim.fases?.length) _sim.fases = [{ inicio: 0, aporte: 2000 }]
  _sim.fases[0].aporte = Math.max(_sim.fases[0].aporte, sugestaoAporteMensal())
  _sim.taxa = Number(_cfg.selic_aa) || 14.25

  c.innerHTML = render_layout()
  wire(c)
  wireChat(c)
  const chartHost = c.querySelector('.lib-sim-chart')
  if (chartHost) wireChartHover(chartHost)
}

// ───────────────────────────── LOAD ─────────────────────────────────
async function loadAll() {
  // selectAll evita o limite de 1000 linhas/query do Supabase
  // (importante pra despesas e caixinhas_mov que podem crescer muito)
  const [cfgRes, metasRes, apoRes, fatRes, dRes, drRes, rrRes, cxRes, cmRes] = await Promise.all([
    db.from('config_fin').select('*').eq('id', 'main').maybeSingle(),
    db.from('metas_fin').select('*').neq('status', 'arquivada').order('principal', { ascending: false }).order('ordem'),
    selectAll('aportes_fin', { order: { column: 'data', ascending: false } }),
    selectAll('faturamento'),
    selectAll('despesas', { order: { column: 'data', ascending: false } }),
    selectAll('despesas_recorrentes', { order: { column: 'criado_em', ascending: false } }),
    selectAll('receitas_recorrentes', { order: { column: 'criado_em', ascending: false } }),
    db.from('caixinhas').select('*').eq('ativa', true).order('ordem'),
    selectAll('caixinhas_mov', { order: { column: 'data', ascending: false } }),
  ])

  if (cfgRes.error)   toast('config_fin: ' + cfgRes.error.message, 'err')
  if (metasRes.error) toast('metas_fin: ' + metasRes.error.message, 'err')
  if (apoRes.error)   toast('aportes_fin: ' + apoRes.error.message, 'err')

  _cfg     = cfgRes.data || { id:'main', meta_brl:100000, saldo_atual_brl:0, selic_aa:14.25, aporte_pct_faturamento:20 }
  _metas   = metasRes.data || []
  _aportes = apoRes.data || []
  _fat     = fatRes.data || []
  _desp    = (dRes  && !dRes.error)  ? (dRes.data  || []) : []
  _despRec = (drRes && !drRes.error) ? (drRes.data || []) : []
  _recRec  = (rrRes && !rrRes.error) ? (rrRes.data || []) : []
  _cxs     = (cxRes && !cxRes.error) ? (cxRes.data || []) : []
  _cxsMov  = (cmRes && !cmRes.error) ? (cmRes.data || []) : []
}

// Puxa Selic atual do Banco Central. Se BCB não responder (CORS, fora do
// ar), mantém o valor que tá na config_fin. Não bloqueia o render.
// Retorna true se atualizou de fato, false caso contrário.
async function tentarAtualizarSelic({ manual = false } = {}) {
  try {
    const r = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json')
    if (!r.ok) { if (manual) toast('BCB respondeu ' + r.status, 'err'); return false }
    const arr = await r.json()
    const v = Number(arr?.[0]?.valor)
    if (!isFinite(v) || v <= 0) { if (manual) toast('Resposta inválida do BCB', 'err'); return false }

    const atual    = Number(_cfg.selic_aa)
    const mudou    = Math.abs(v - atual) > 0.01
    const agora    = new Date().toISOString()
    _cfg.selic_aa  = v
    _cfg.atualizado_em = agora
    await db.from('config_fin').upsert({ id:'main', selic_aa: v, atualizado_em: agora })

    if (mudou) toast(`Selic atualizada: ${v.toFixed(2)}% a.a.`)
    else if (manual) toast(`Selic confirmada: ${v.toFixed(2)}% a.a.`)

    // Se a view tá visível, atualiza só o chip e re-projeta com a nova taxa
    refreshSelicUI()
    return true
  } catch (_) {
    if (manual) toast('Sem conexão com o BCB', 'err')
    return false
  }
}

// Agenda re-check periódico (idempotente — não cria múltiplos timers)
function scheduleSelicRefresh() {
  if (_selicTimer) clearInterval(_selicTimer)
  _selicTimer = setInterval(() => { tentarAtualizarSelic() }, SELIC_REFRESH_MS)
}

// Atualiza só o chip da Selic no DOM (sem re-render completo)
function refreshSelicUI() {
  const chip = document.querySelector('.lib-chip-selic')
  if (!chip) return
  chip.innerHTML = chipSelicHTML()
}

function chipSelicHTML() {
  const v = Number(_cfg.selic_aa).toFixed(2)
  const ts = _cfg.atualizado_em ? formatRelativo(_cfg.atualizado_em) : 'não verificada'
  return `<b>Selic</b> ${v}% a.a. <small>BCB · ${ts}</small>
    <button class="lib-selic-refresh" id="lib-selic-refresh" title="Atualizar agora">↻</button>`
}

function formatRelativo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)        return 'agora'
  if (diff < 3600)      return `há ${Math.floor(diff/60)}min`
  if (diff < 86400)     return `há ${Math.floor(diff/3600)}h`
  if (diff < 86400*30)  return `há ${Math.floor(diff/86400)}d`
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ─────────────────────────── MATEMÁTICA ─────────────────────────────
// Aporte do mês `m` (0-indexed): pega a última fase com inicio <= m
function pmtNoMes(fases, m) {
  if (!fases?.length) return 0
  const ord = [...fases].sort((a, b) => a.inicio - b.inicio)
  let pmt = 0
  for (const f of ord) {
    if (f.inicio <= m) pmt = Number(f.aporte) || 0
  }
  return pmt
}

function projetar({ pv, fases, taxaAA, meses }) {
  const i = Math.pow(1 + taxaAA/100, 1/12) - 1
  const pontos = []
  let saldo = pv
  let aportadoAcum = pv
  for (let m = 0; m <= meses; m++) {
    if (m > 0) {
      const pmt = pmtNoMes(fases, m - 1)  // aporte feito no início do mês m
      saldo = saldo * (1 + i) + pmt
      aportadoAcum += pmt
    }
    pontos.push({ mes: m, saldo, aportado: aportadoAcum, juros: saldo - aportadoAcum })
  }
  return pontos
}

function mesesAteMeta({ pv, fases, taxaAA, meta }) {
  if (pv >= meta) return 0
  const i = Math.pow(1 + taxaAA/100, 1/12) - 1
  let saldo = pv, m = 0
  while (m < 1200) {
    const pmt = pmtNoMes(fases, m)
    saldo = saldo * (1 + i) + pmt
    m++
    if (saldo >= meta) return m
    // Se aporte é zero e juros não crescem o saldo, sai
    if (pmt === 0 && saldo <= pv * 1.0001 && m > 12) return null
  }
  return null
}

function fatTotalNoMes(ano, mes) {
  return _fat.filter(r => r.ano === ano && r.mes === mes).reduce((s, r) => s + Number(r.valor || 0), 0)
}
function fatMedio6m() {
  const hoje = new Date()
  let soma = 0, n = 0
  for (let k = 1; k <= 6; k++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - k, 1)
    const v = fatTotalNoMes(d.getFullYear(), d.getMonth() + 1)
    if (v > 0) { soma += v; n++ }
  }
  return n ? soma / n : 0
}
function fatMesAtual() {
  const d = new Date()
  return fatTotalNoMes(d.getFullYear(), d.getMonth() + 1)
}
function sugestaoAporteMensal() {
  const pct = Number(_cfg?.aporte_pct_faturamento || 20) / 100
  const ref = fatMedio6m() || fatMesAtual()
  return Math.max(0, Math.round(ref * pct))
}

// Saldo de uma meta = valor_inicial + sum(aportes vinculados)
function saldoMeta(meta) {
  const apo = _aportes.filter(a => a.meta_id === meta.id).reduce((s, a) => s + Number(a.valor || 0), 0)
  return Number(meta.valor_inicial || 0) + apo
}
function aportesDaMeta(meta) {
  return _aportes.filter(a => a.meta_id === meta.id)
}
function aportesMesAtual(metaId) {
  const ym = new Date().toISOString().slice(0,7)
  return _aportes
    .filter(a => (metaId ? a.meta_id === metaId : true) && (a.data || '').startsWith(ym))
    .reduce((s, a) => s + Number(a.valor || 0), 0)
}
function streakAportes(metaId) {
  const sug = sugestaoAporteMensal() || 1
  let n = 0
  const d = new Date()
  for (let k = 0; k < 36; k++) {
    const ref = new Date(d.getFullYear(), d.getMonth() - k, 1)
    const ym  = ref.toISOString().slice(0,7)
    const v = _aportes
      .filter(a => (metaId ? a.meta_id === metaId : true) && (a.data || '').startsWith(ym))
      .reduce((s, a) => s + Number(a.valor || 0), 0)
    if (v >= sug && v > 0) n++
    else break
  }
  return n
}

// ───────────────────────────── CHAT IA ──────────────────────────────
// Monta um snapshot estruturado do contexto financeiro pra IA usar
function contextoIA() {
  const principal = _metas.find(m => m.principal) || _metas[0]
  const metaSim   = _metas.find(m => m.id === _sim.metaId) || principal
  const today     = new Date().toISOString().slice(0,10)
  const hoje      = new Date()

  // ── Metas ────────────────────────────────
  const metasInfo = _metas.map(m => {
    const sm = saldoMeta(m)
    return {
      nome: m.nome, alvo: Number(m.valor_alvo), saldo_atual: sm,
      progresso_pct: +((sm / Number(m.valor_alvo)) * 100).toFixed(1),
      principal: m.principal === true,
      prazo_meses: m.prazo_meses || null,
    }
  })

  // ── Aportes (últimos 12) ────────────────
  const ultimosAportes = _aportes.slice(0, 12).map(a => ({
    data: a.data, valor: Number(a.valor),
    meta: _metas.find(x=>x.id===a.meta_id)?.nome || null,
    fonte: a.fonte, obs: a.observacao,
  }))

  // ── Faturamento ÚLTIMOS 12 MESES + futuros lançados (mês a mês) ──
  const fat12m = []
  for (let k = 0; k <= 11; k++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - k, 1)
    const m = d.getMonth() + 1, y = d.getFullYear()
    const v = _fat.filter(f => f.mes === m && f.ano === y).reduce((s, f) => s + Number(f.valor || 0), 0)
    fat12m.push({ mes: `${y}-${String(m).padStart(2,'0')}`, valor: +v.toFixed(2) })
  }
  // Faturamento JÁ LANÇADO pros próximos meses (raros, mas se tiver, mostra)
  const fatFuturo = _fat
    .filter(f => {
      const fDate = new Date(f.ano, f.mes - 1, 1)
      return fDate > new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    })
    .map(f => ({ mes: `${f.ano}-${String(f.mes).padStart(2,'0')}`, valor: +Number(f.valor).toFixed(2), desc: f.descricao || null }))

  // ── Despesas PASSADAS últimos 12 meses por mês + por categoria ──
  const hojeStr = today
  const ym12m = []
  for (let k = 0; k <= 11; k++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - k, 1)
    ym12m.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  }
  const desp12m = _desp.filter(d => ym12m.some(ym => (d.data||'').startsWith(ym)) && (d.data || '') <= hojeStr)
  const despPorCat = {}
  const despPassadasPorMes = {}
  for (const d of desp12m) {
    const cat = d.categoria || 'outro'
    despPorCat[cat] = (despPorCat[cat] || 0) + Number(d.valor || 0)
    const ym = (d.data || '').slice(0,7)
    despPassadasPorMes[ym] = (despPassadasPorMes[ym] || 0) + Number(d.valor || 0)
  }
  const totalDesp12m = Object.values(despPorCat).reduce((s, v) => s + v, 0)
  for (const k of Object.keys(despPassadasPorMes)) despPassadasPorMes[k] = +despPassadasPorMes[k].toFixed(2)

  // ── Despesas FUTURAS TODAS (sem limite — tudo agendado pra frente) ──
  const despFuturasTodas = _desp
    .filter(d => (d.data || '') > hojeStr)
    .sort((a, b) => (a.data || '').localeCompare(b.data || ''))
    .map(d => ({
      data: d.data,
      descricao: d.descricao || '(sem descrição)',
      categoria: d.categoria || 'outro',
      valor: Number(d.valor || 0),
    }))
  // Agrupa por mês pra ver a curva
  const despFuturasPorMes = {}
  for (const d of despFuturasTodas) {
    const ym = d.data.slice(0,7)
    if (!despFuturasPorMes[ym]) despFuturasPorMes[ym] = { total: 0, qtd: 0, itens: [] }
    despFuturasPorMes[ym].total += d.valor
    despFuturasPorMes[ym].qtd++
    despFuturasPorMes[ym].itens.push(`${d.data}: ${d.descricao} (${d.categoria}) — R$${d.valor.toFixed(2)}`)
  }
  for (const k of Object.keys(despFuturasPorMes)) despFuturasPorMes[k].total = +despFuturasPorMes[k].total.toFixed(2)
  const totalDespFuturas = despFuturasTodas.reduce((s, d) => s + d.valor, 0)
  // Horizonte: do mês atual até a despesa futura mais distante (em meses)
  let horizonteMeses = 0
  if (despFuturasTodas.length) {
    const ultimaData = new Date(despFuturasTodas[despFuturasTodas.length - 1].data)
    horizonteMeses = (ultimaData.getFullYear() - hoje.getFullYear()) * 12 + (ultimaData.getMonth() - hoje.getMonth())
  }

  // ── Contas/despesas recorrentes ativas (cobram todo mês) ──
  const recorrentesAtivas = _despRec.filter(r => r.ativa).map(r => ({
    descricao: r.descricao, valor: Number(r.valor), categoria: r.categoria, dia: r.dia_vencimento || null,
  }))
  const totalRecMensal = recorrentesAtivas.reduce((s, r) => s + r.valor, 0)
  const receitasRec = _recRec.filter(r => r.ativa).map(r => ({
    descricao: r.descricao, valor: Number(r.valor),
  }))
  const totalReceitasRec = receitasRec.reduce((s, r) => s + r.valor, 0)

  // ── Compromisso TOTAL no horizonte futuro (até a última despesa agendada) ──
  const mesesProjetar = Math.max(6, horizonteMeses)
  const compromissoFuturoTotal = +(totalRecMensal * mesesProjetar + totalDespFuturas).toFixed(2)

  // ── PROJEÇÃO CONSOLIDADA MÊS A MÊS (a fonte da verdade pra IA) ──
  // Calcula tudo: receita prevista, despesas, sobra. IA usa essa tabela
  // direto sem precisar somar coisas separadas (que tava errando).
  const aportePctMes = Number(_cfg.aporte_pct_faturamento || 20) / 100
  const totalAlocCaixinhasMensal = _cxs.reduce((s, c) => s + Number(c.valor_mensal || 0), 0)

  const projecaoMensal = []
  for (let k = 0; k <= Math.max(12, mesesProjetar); k++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + k, 1)
    const mm = d.getMonth() + 1, yy = d.getFullYear()
    const ym = `${yy}-${String(mm).padStart(2,'0')}`
    const isPast = k < 0  // sempre false aqui, mas mantém legível
    const isCurrent = k === 0

    // Receita: lançada (_fat) + recorrente ativa (se ainda não está lançada esse mês)
    const fatLancado = _fat.filter(f => f.mes === mm && f.ano === yy)
      .reduce((s, f) => s + Number(f.valor || 0), 0)
    // Receita recorrente ainda não materializada (só conta pra futuro / mês atual)
    let recPend = 0
    for (const r of _recRec) {
      if (!r.ativa) continue
      const jaTem = _fat.some(f => f.recorrente_id === r.id && f.mes === mm && f.ano === yy)
      if (!jaTem) recPend += Number(r.valor || 0)
    }
    const receitaTotal = fatLancado + recPend

    // Despesas: pontuais lançadas + recorrentes que cobram todo mês
    const despPontuais = _desp.filter(x => (x.data || '').startsWith(ym))
      .reduce((s, x) => s + Number(x.valor || 0), 0)
    let despRecPend = 0
    for (const r of _despRec) {
      if (!r.ativa) continue
      const jaTem = _desp.some(x => x.recorrente_id === r.id && (x.data || '').startsWith(ym))
      if (!jaTem) despRecPend += Number(r.valor || 0)
    }
    const despesaTotal = despPontuais + despRecPend

    // Aportes registrados nesse mês (Liberdade)
    const aportesNoMes = _aportes.filter(a => (a.data || '').startsWith(ym))
      .reduce((s, a) => s + Number(a.valor || 0), 0)

    // Caixinhas: gasto efetivo no mês + alocação mensal (compromisso fixo)
    const cxsUsadoMes = _cxsMov.filter(x => (x.data || '').startsWith(ym))
      .reduce((s, x) => s + Number(x.valor || 0), 0)

    const lucroBruto = receitaTotal - despesaTotal
    const sobraPosAporte = lucroBruto - aportesNoMes - totalAlocCaixinhasMensal
    const aporteSugeridoMes = Math.round(receitaTotal * aportePctMes)

    projecaoMensal.push({
      mes: ym,
      receita_prevista: +receitaTotal.toFixed(2),
      _receita_breakdown: {
        lancada: +fatLancado.toFixed(2),
        recorrente_pendente: +recPend.toFixed(2),
      },
      despesa_prevista: +despesaTotal.toFixed(2),
      _despesa_breakdown: {
        pontuais_lancadas: +despPontuais.toFixed(2),
        recorrentes_pendentes: +despRecPend.toFixed(2),
      },
      lucro_bruto: +lucroBruto.toFixed(2),
      aporte_registrado: +aportesNoMes.toFixed(2),
      caixinhas_alocacao_fixa: +totalAlocCaixinhasMensal.toFixed(2),
      caixinhas_usado_real: +cxsUsadoMes.toFixed(2),
      sobra_pos_aporte_e_caixinhas: +sobraPosAporte.toFixed(2),
      aporte_sugerido: aporteSugeridoMes,
      cabe_aporte_sugerido: lucroBruto - totalAlocCaixinhasMensal >= aporteSugeridoMes,
      atual: isCurrent,
    })
  }

  // ── Caixinhas (saldos atuais) — com IDs pra IA poder mandar update ──
  const m = hoje.getMonth() + 1, y = hoje.getFullYear()
  const caixinhasInfo = _cxs.map(c => {
    const mStr = `${y}-${String(m).padStart(2,'0')}`
    const usadoMes = _cxsMov.filter(x => x.caixinha_id === c.id && (x.data||'').startsWith(mStr))
      .reduce((s, x) => s + Number(x.valor || 0), 0)
    const saldoMesAtual = c.tipo === 'gasto'
      ? Number(c.valor_mensal) - usadoMes
      : null
    return {
      id: c.id,
      nome: c.nome, tipo: c.tipo,
      valor_mensal: Number(c.valor_mensal),
      icone: c.icone, cor: c.cor,
      usado_mes_atual: +usadoMes.toFixed(2),
      saldo_mes_atual: saldoMesAtual !== null ? +saldoMesAtual.toFixed(2) : null,
    }
  })

  return {
    hoje: today,
    selic_aa: Number(_cfg.selic_aa),
    selic_atualizada_em: _cfg.atualizado_em,
    faturamento: {
      medio_6m: +fatMedio6m().toFixed(2),
      mes_atual: +fatMesAtual().toFixed(2),
      ultimos_12_meses: fat12m,
      futuro_lancado: fatFuturo,  // raro mas se tiver, mostra
      pct_alvo_aporte: Number(_cfg.aporte_pct_faturamento),
      aporte_sugerido_mensal: sugestaoAporteMensal(),
    },
    despesas_passadas: {
      total_ultimos_12_meses: +totalDesp12m.toFixed(2),
      media_mensal_12m: +(totalDesp12m / 12).toFixed(2),
      por_categoria_12m: Object.fromEntries(Object.entries(despPorCat).map(([k,v]) => [k, +v.toFixed(2)])),
      por_mes_12m: despPassadasPorMes,
    },
    despesas_futuras_agendadas: {
      total: +totalDespFuturas.toFixed(2),
      qtd: despFuturasTodas.length,
      horizonte_meses: horizonteMeses,
      ultima_data: despFuturasTodas[despFuturasTodas.length - 1]?.data || null,
      meses_com_lancamento: Object.keys(despFuturasPorMes).sort(),  // ex: ["2026-07","2026-08",...,"2027-05"]
      por_mes: despFuturasPorMes,  // chave = "AAAA-MM" → {total, qtd, itens: [descrição texto]}
      lista_completa: despFuturasTodas,  // descrição + categoria + valor + data de cada UMA
    },
    contas_fixas_mensais: {
      total: +totalRecMensal.toFixed(2),
      lista: recorrentesAtivas,
      total_projetado_no_horizonte: +(totalRecMensal * mesesProjetar).toFixed(2),
      meses_projetados: mesesProjetar,
    },
    receitas_recorrentes: {
      total_mensal: +totalReceitasRec.toFixed(2),
      lista: receitasRec,
    },
    compromisso_futuro_total: compromissoFuturoTotal,

    // ⭐ TABELA CONSOLIDADA — fonte da verdade pra qualquer projeção mês a mês
    // Já calcula receita_prevista (lançada+recorrente), despesa, lucro, sobra
    // pra cada mês. IA deve usar daqui em vez de somar os campos separados.
    projecao_mensal: projecaoMensal,

    metas: metasInfo,
    aportes: {
      total_geral: +_aportes.reduce((s, a) => s + Number(a.valor || 0), 0).toFixed(2),
      qtd_total: _aportes.length,
      ultimos_12: ultimosAportes,
    },
    caixinhas: caixinhasInfo,
    simulador_atual: {
      meta_em_foco: metaSim?.nome,
      taxa_aa: _sim.taxa,
      prazo_meses: _sim.meses,
      fases: _sim.fases,
    },
  }
}

async function callAI(userMsg) {
  const orKey = CFG.OR_KEY
  if (!orKey) throw new Error('Chave da IA não disponível. Faça login de novo.')

  const ctx = contextoIA()
  const sistema = `Você é um planejador financeiro pessoal direto, brasileiro, sem firula. Conversa com o usuário sobre as finanças dele dentro do CRM "Eleva Digital". Linguagem informal, tipo amigo que entende de finanças. Seja sincero quando os números não fecham.

Você tem acesso COMPLETO ao contexto financeiro dele em JSON abaixo, atualizado AGORA:

\`\`\`json
${JSON.stringify(ctx, null, 2)}
\`\`\`

⭐ **CAMPO MAIS IMPORTANTE — \`projecao_mensal\`**:
É um array com TODOS os meses já calculados (do mês atual até o horizonte). Cada item tem:
- \`mes\` ("AAAA-MM")
- \`receita_prevista\` = receita lançada + recorrente pendente (JÁ SOMADAS — USE ESTE NÚMERO)
- \`despesa_prevista\` = despesas pontuais + recorrentes (JÁ SOMADAS)
- \`lucro_bruto\` = receita − despesa
- \`aporte_registrado\` = quanto JÁ foi registrado em aportes_fin nesse mês
- \`caixinhas_alocacao_fixa\` = soma do valor_mensal de todas caixinhas (compromisso)
- \`sobra_pos_aporte_e_caixinhas\` = lucro − aporte registrado − caixinhas (a sobra REAL)
- \`aporte_sugerido\` = X% do faturamento desse mês
- \`cabe_aporte_sugerido\` = boolean: se sobraria pra fazer o aporte sugerido

Use esse array como fonte da verdade. NÃO some receita + lançamento separado — já tá somado em \`receita_prevista\`. Se a IA cometer erro de aritmética, é nessa parte.

Explicação dos demais campos:
- **faturamento**: dados históricos. \`medio_6m\`, \`mes_atual\`, \`ultimos_12_meses\` mês a mês passado
- **despesas_passadas**: gastos pontuais já efetuados nos últimos 12 meses. \`por_categoria_12m\` (ia, infra, marketing, operacional, pessoal, outro); \`por_mes_12m\` mostra curva mensal
- **despesas_futuras_agendadas**: TODOS os gastos pontuais agendados pra frente (sem limite). \`horizonte_meses\` = até onde vai a previsão; \`ultima_data\` = data da despesa mais distante; \`lista_completa\` com cada item; \`por_mes\` com curva. SE O USUÁRIO TEM CONTAS LANÇADAS ATÉ JANEIRO, ELAS ESTÃO TODAS AQUI
- **contas_fixas_mensais**: assinaturas/contas recorrentes que cobram TODO mês. \`total\` é o fixo mensal; \`total_projetado_no_horizonte\` = total × meses_projetados (alcance do horizonte de despesas futuras)
- **receitas_recorrentes**: o que entra todo mês (clientes mensais) — \`total_mensal\` + lista
- **compromisso_futuro_total**: soma de contas fixas no horizonte + despesas futuras agendadas — TOTAL DE SAÍDA GARANTIDA até a última despesa lançada
- **metas**: objetivos de poupança ("principal" = norte da pessoa, geralmente liberdade financeira)
- **aportes**: histórico de aportes já feitos pras metas
- **caixinhas**: envelope budgeting (tipo Will) — \`gasto\` = reseta no mês, \`reserva\` = acumula. Cada caixinha tem \`id\` — use o id quando for sugerir update/movimentação
- **simulador_atual**: o que ele tá projetando agora (fases de aporte, taxa, prazo)

Regras:
- Valores em **R$** com vírgula (R$ 1.234,56)
- Taxa Selic atual: ${ctx.selic_aa}% a.a.
- LUCRO LÍQUIDO REAL = faturamento.mes_atual − contas_fixas_mensais.total − despesas_futuras_agendadas (no mês) − despesas_passadas (no mês). É a capacidade de aporte real
- Faz contas de cabeça (juros compostos: FV = PV·(1+i)^n + PMT·((1+i)^n−1)/i com i mensal)
- Não invente dados que não estão no contexto. Se faltar, pergunta
- Respostas curtas e práticas (2-4 parágrafos), a não ser que ele peça detalhe
- Pode ser provocativo se ele tiver gastando mais do que faturando ou aportando pouco

⚠️ IMPORTANTE — HORIZONTE DE PROJEÇÃO:
Quando o usuário pedir fluxo mensal ou projeção, vá ATÉ \`despesas_futuras_agendadas.ultima_data\` (não corte em 6 meses por hábito).
- A lista \`despesas_futuras_agendadas.meses_com_lancamento\` mostra TODOS os meses que têm despesa agendada. ITERE POR TODOS ELES — não pule nenhum.
- Hoje o usuário tem ${ctx.despesas_futuras_agendadas.qtd} despesas futuras cadastradas, indo até **${ctx.despesas_futuras_agendadas.ultima_data || 'nenhuma'}** (horizonte de ${ctx.despesas_futuras_agendadas.horizonte_meses} meses)
- Se ele tem despesas até maio/2027, mostre a tabela até maio/2027. Não pare em dezembro só porque é "ano corrente"

VOCÊ PODE AGIR NO SISTEMA. Inclua blocos quando fizer sentido — cada um vira um botão "Aplicar" no chat:

1. **Mudar fases do simulador**:
\`\`\`apply-fases
[{"inicio": 0, "aporte": 2500}, {"inicio": 6, "aporte": 4000}]
\`\`\`

2. **Criar caixinha nova**:
\`\`\`apply-caixinha-create
{"nome": "Lazer", "valor_mensal": 300, "tipo": "gasto", "icone": "🎬", "cor": "#A78BFA"}
\`\`\`
   (tipo: "gasto" reseta no mês | "reserva" acumula | ícones: ⛽🚗🏠🛒🍔💊🎬📱✈️🎁🏥💼🐾🎓🆘💰)

3. **Atualizar caixinha existente** (ex: aumentar valor mensal alocado, mudar nome):
\`\`\`apply-caixinha-update
{"id": "uuid-aqui", "valor_mensal": 500, "nome": "Gasolina novo"}
\`\`\`

4. **Registrar gasto numa caixinha**:
\`\`\`apply-caixinha-mov
{"caixinha_id": "uuid-aqui", "valor": 80, "descricao": "Posto Shell", "data": "${ctx.hoje}"}
\`\`\`

5. **Excluir caixinha**:
\`\`\`apply-caixinha-delete
{"id": "uuid-aqui", "nome": "Gasolina"}
\`\`\`

Use IDs reais do contexto (caixinhas[].id). Use APENAS quando o usuário pedir explicitamente ou quando você tiver uma sugestão clara de reorganização. Não polua a resposta com muitos blocos — 1 a 3 por mensagem no máximo.`

  const modelos = [
    'anthropic/claude-sonnet-4.6',
    'anthropic/claude-haiku-4.5',
    'meta-llama/llama-3.3-70b-instruct',
  ]

  const messages = [
    { role: 'system', content: sistema },
    ..._chat.msgs.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMsg },
  ]

  let lastErr = ''
  for (const model of modelos) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${orKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: 800, temperature: 0.6 }),
    })
    if (res.ok) {
      const json = await res.json()
      return json?.choices?.[0]?.message?.content?.trim() || '(sem resposta)'
    }
    if (res.status === 404) { lastErr = `${model} indisponível`; continue }
    const body = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 200)}`)
  }
  throw new Error(lastErr || 'Nenhum modelo disponível')
}

async function enviarMsg(text) {
  if (!text.trim() || _chat.loading) return
  _chat.msgs.push({ role: 'user', content: text.trim() })
  _chat.loading = true
  renderChatOnly()

  try {
    // Sempre recarrega dados antes de mandar — pega despesas/aportes adicionados
    // depois do chat ter sido aberto (evita IA com info desatualizada)
    await loadAll()
    const resposta = await callAI(text.trim())
    _chat.msgs.push({ role: 'assistant', content: resposta })
  } catch (e) {
    _chat.msgs.push({ role: 'assistant', content: '⚠️ Erro: ' + e.message })
  } finally {
    _chat.loading = false
    renderChatOnly()
  }
}

// Re-renderiza só o drawer (sem mexer no resto da página)
function renderChatOnly() {
  const host = document.getElementById('lib-chat')
  if (!host) return
  const fresh = renderChatDrawer().match(/<div id="lib-chat"[\s\S]*<\/div>/)?.[0] || ''
  host.outerHTML = fresh
  wireChat(document.getElementById('content'))
  // scroll pro final
  const body = document.getElementById('lib-chat-body')
  if (body) body.scrollTop = body.scrollHeight
}

function wireChat(root) {
  // FAB toggle
  root.querySelector('#lib-fab')?.addEventListener('click', () => {
    _chat.open = true; renderChatOnly()
    setTimeout(() => document.getElementById('lib-chat-text')?.focus(), 250)
  })
  root.querySelector('#lib-chat-close')?.addEventListener('click', () => { _chat.open = false; renderChatOnly() })
  root.querySelector('#lib-chat-clear')?.addEventListener('click', () => {
    if (confirm('Limpar conversa?')) { _chat.msgs = []; renderChatOnly() }
  })

  // Submit
  const form = root.querySelector('#lib-chat-input')
  const ta   = root.querySelector('#lib-chat-text')
  form?.addEventListener('submit', e => {
    e.preventDefault()
    const v = ta.value; ta.value = ''; ta.style.height = 'auto'
    enviarMsg(v)
  })
  ta?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit() }
  })
  // Auto-grow textarea
  ta?.addEventListener('input', () => {
    ta.style.height = 'auto'
    ta.style.height = Math.min(140, ta.scrollHeight) + 'px'
  })

  // Sugestões iniciais
  root.querySelectorAll('.lib-chat-sug-btn').forEach(b =>
    b.addEventListener('click', () => enviarMsg(b.dataset.sug)))

  // Aplicar ação sugerida pela IA (fases ou caixinhas)
  root.querySelectorAll('.lib-chat-apply').forEach(el => {
    const btn = el.querySelector('.btn')
    btn?.addEventListener('click', async () => {
      try {
        const act = JSON.parse(el.dataset.action)
        await aplicarAcao(act)
        btn.disabled = true
        btn.textContent = '✓ Feito'
      } catch (e) {
        toast('Erro ao aplicar: ' + e.message, 'err')
      }
    })
  })
}

async function aplicarAcao(act) {
  const p = act.payload || {}
  switch (act.tipo) {
    case 'fases': {
      if (!Array.isArray(p)) throw new Error('payload inválido')
      _sim.fases = p
        .filter(f => Number.isFinite(+f.inicio) && Number.isFinite(+f.aporte))
        .map(f => ({ inicio: +f.inicio, aporte: +f.aporte }))
        .sort((a,b) => a.inicio - b.inicio)
      // Auto-estende prazo se precisar
      const ultima = _sim.fases[_sim.fases.length - 1]
      if (ultima && ultima.inicio + 6 > _sim.meses) _sim.meses = Math.min(240, ultima.inicio + 24)
      toast('Fases aplicadas no simulador 🎯')
      render()
      setTimeout(() => document.querySelector('.lib-sim')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
      return
    }
    case 'caixinha-create': {
      if (!p.nome || !(+p.valor_mensal > 0)) throw new Error('nome e valor_mensal obrigatórios')
      const d = {
        nome: p.nome,
        valor_mensal: +p.valor_mensal,
        tipo: p.tipo === 'reserva' ? 'reserva' : 'gasto',
        icone: p.icone || '💰',
        cor: p.cor || '#4A9EFF',
      }
      const { error } = await db.from('caixinhas').insert(d)
      if (error) throw error
      toast(`Caixinha "${p.nome}" criada 📦`)
      await loadAll()
      renderChatOnly()
      return
    }
    case 'caixinha-update': {
      if (!p.id) throw new Error('id obrigatório')
      const upd = { atualizado_em: new Date().toISOString() }
      if (p.nome) upd.nome = p.nome
      if (p.valor_mensal != null) upd.valor_mensal = +p.valor_mensal
      if (p.tipo) upd.tipo = p.tipo === 'reserva' ? 'reserva' : 'gasto'
      if (p.icone) upd.icone = p.icone
      if (p.cor) upd.cor = p.cor
      const { error } = await db.from('caixinhas').update(upd).eq('id', p.id)
      if (error) throw error
      toast('Caixinha atualizada ✏️')
      await loadAll()
      renderChatOnly()
      return
    }
    case 'caixinha-mov': {
      if (!p.caixinha_id || !(+p.valor > 0)) throw new Error('caixinha_id e valor obrigatórios')
      const d = {
        caixinha_id: p.caixinha_id,
        valor: +p.valor,
        data: p.data || new Date().toISOString().slice(0,10),
        descricao: p.descricao || null,
      }
      const { error } = await db.from('caixinhas_mov').insert(d)
      if (error) throw error
      toast('Gasto registrado 💸')
      await loadAll()
      renderChatOnly()
      return
    }
    case 'caixinha-delete': {
      if (!p.id) throw new Error('id obrigatório')
      if (!confirm(`Excluir caixinha "${p.nome || ''}"? Movimentações também serão removidas.`)) return
      const { error } = await db.from('caixinhas').delete().eq('id', p.id)
      if (error) throw error
      toast('Caixinha excluída')
      await loadAll()
      renderChatOnly()
      return
    }
    default:
      throw new Error('Tipo de ação desconhecido: ' + act.tipo)
  }
}

// ───────────────────────────── LAYOUT ───────────────────────────────
function render_layout() {
  const principal = _metas.find(m => m.principal) || _metas[0]
  const outras    = _metas.filter(m => m !== principal)
  const metaSim   = _metas.find(m => m.id === _sim.metaId) || principal

  return `
  <div class="lib">
    ${principal ? renderHero(principal) : renderEmpty()}

    <div class="lib-metas-head">
      <h3>Outras metas</h3>
      <button class="btn bp bsm" id="lib-add-meta">+ Nova meta</button>
    </div>
    <div class="lib-metas-grid">
      ${outras.map(renderMetaCard).join('')}
      <div class="lib-meta-card lib-meta-add" id="lib-add-meta-2">
        <div class="lib-meta-add-icon">＋</div>
        <div class="lib-meta-add-lbl">Nova meta</div>
        <div class="lib-meta-add-sub">Macbook, viagem, carro…</div>
      </div>
    </div>

    ${renderStats(metaSim)}
    ${renderSimulator(metaSim)}
    ${renderAportes()}

    ${renderChatFab()}
    ${renderChatDrawer()}
  </div>`
}

function renderChatFab() {
  return `
  <button class="lib-fab" id="lib-fab" title="Conversar com a IA financeira">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <span>IA financeira</span>
    <span class="lib-fab-pulse"></span>
  </button>`
}

function renderChatDrawer() {
  if (!_chat.open) return '<div id="lib-chat" class="lib-chat"></div>'
  const msgsHTML = _chat.msgs.length
    ? _chat.msgs.map(m => renderMsg(m)).join('')
    : `<div class="lib-chat-empty">
        <div class="lib-chat-empty-ico">💭</div>
        <div class="lib-chat-empty-tit">Viaja na maionese aí</div>
        <div class="lib-chat-empty-sub">Eu sei tudo do seu contexto: faturamento, metas, fases, aportes, caixinhas. Pergunta o que quiser.</div>
        <div class="lib-chat-sug">
          <button class="lib-chat-sug-btn" data-sug="Quanto preciso aportar pra bater 100k em 2 anos?">⚡ Quanto pra 100k em 2 anos?</button>
          <button class="lib-chat-sug-btn" data-sug="Vale mais a pena focar tudo na Liberdade ou dividir com o Macbook?">🎯 Focar ou dividir entre metas?</button>
          <button class="lib-chat-sug-btn" data-sug="Que % do meu faturamento eu deveria estar aportando pra ser realista?">💰 Quanto do faturamento aportar?</button>
          <button class="lib-chat-sug-btn" data-sug="Se eu der R$10k de entrada na minha meta e mantiver o aporte atual, quando bato?">🚀 E se eu der entrada agora?</button>
        </div>
      </div>`

  return `
  <div id="lib-chat" class="lib-chat open">
    <div class="lib-chat-head">
      <div class="lib-chat-head-left">
        <div class="lib-chat-avatar">🤖</div>
        <div>
          <div class="lib-chat-title">Planejador IA</div>
          <div class="lib-chat-sub">${_chat.loading ? '<span class="lib-chat-typing">pensando…</span>' : 'sabe tudo do seu contexto'}</div>
        </div>
      </div>
      <div class="lib-chat-head-acts">
        ${_chat.msgs.length ? `<button class="lib-chat-clear" id="lib-chat-clear" title="Limpar conversa">↻</button>` : ''}
        <button class="lib-chat-close" id="lib-chat-close" title="Fechar">×</button>
      </div>
    </div>
    <div class="lib-chat-body" id="lib-chat-body">${msgsHTML}</div>
    <form class="lib-chat-input" id="lib-chat-input">
      <textarea id="lib-chat-text" placeholder="Manda a real... ex: e se eu aumentar pra 5k a partir do mês 6?" rows="1" ${_chat.loading?'disabled':''}></textarea>
      <button type="submit" class="lib-chat-send" ${_chat.loading?'disabled':''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  </div>`
}

function renderMsg(m) {
  const actions = parseActions(m.content)
  // Remove os blocos de ação da resposta visível
  const cleanContent = m.content.replace(/```apply-[a-z-]+[\s\S]*?```/g, '').trim()
  const html = mdLite(cleanContent)
  const role = m.role === 'user' ? 'user' : 'ai'

  const applyBtns = actions.map((act, i) => {
    const meta = describeAction(act)
    return `
      <div class="lib-chat-apply" data-action='${escapeAttr(JSON.stringify(act))}'>
        <div class="lib-chat-apply-info">
          <div class="lib-chat-apply-lbl">${meta.label}</div>
          <div class="lib-chat-apply-desc">${meta.desc}</div>
        </div>
        <button class="btn ${meta.cls || 'bp'} bsm">${meta.btn || 'Aplicar'}</button>
      </div>`
  }).join('')

  return `<div class="lib-msg ${role}">
    ${role === 'ai' ? '<div class="lib-msg-avatar">🤖</div>' : ''}
    <div class="lib-msg-bubble">
      ${html}
      ${applyBtns}
    </div>
  </div>`
}

// Procura todos os blocos ```apply-xxx [...] ``` na resposta
function parseActions(text) {
  const actions = []
  const re = /```apply-([a-z-]+)\s*([\s\S]*?)```/g
  let m
  while ((m = re.exec(text)) !== null) {
    const tipo = m[1]
    try {
      const payload = JSON.parse(m[2].trim())
      actions.push({ tipo, payload })
    } catch (_) { /* ignora JSON inválido */ }
  }
  return actions
}

// Descreve a ação pro card de "Aplicar"
function describeAction(act) {
  const cx = (id) => _cxs.find(c => c.id === id)
  switch (act.tipo) {
    case 'fases': {
      const arr = Array.isArray(act.payload) ? act.payload : []
      const desc = arr.map(f => `${(+f.inicio) === 0 ? 'Início' : `mês ${+f.inicio}+`}: ${brl(+f.aporte)}`).join(' · ')
      return { label: '💡 Sugestão pro simulador', desc, btn: 'Aplicar fases' }
    }
    case 'caixinha-create': {
      const p = act.payload || {}
      return { label: '📦 Criar caixinha', desc: `${p.icone || '💰'} ${p.nome || '?'} · ${brl(+p.valor_mensal || 0)}/mês · ${p.tipo === 'reserva' ? 'reserva' : 'gasto'}`, btn: 'Criar' }
    }
    case 'caixinha-update': {
      const p = act.payload || {}; const c = cx(p.id)
      const muda = []
      if (p.nome && p.nome !== c?.nome) muda.push(`nome → "${p.nome}"`)
      if (p.valor_mensal != null && +p.valor_mensal !== +c?.valor_mensal) muda.push(`valor → ${brl(+p.valor_mensal)}`)
      if (p.icone && p.icone !== c?.icone) muda.push(`ícone → ${p.icone}`)
      if (p.cor && p.cor !== c?.cor) muda.push('nova cor')
      return { label: `✏️ Atualizar "${c?.nome || 'caixinha'}"`, desc: muda.join(' · ') || 'sem mudanças', btn: 'Aplicar' }
    }
    case 'caixinha-mov': {
      const p = act.payload || {}; const c = cx(p.caixinha_id)
      return { label: `− Gasto em "${c?.nome || 'caixinha'}"`, desc: `${p.data || 'hoje'} · ${brl(+p.valor || 0)} · ${p.descricao || 'sem desc'}`, btn: 'Registrar' }
    }
    case 'caixinha-delete': {
      const p = act.payload || {}
      return { label: `🗑️ Excluir caixinha`, desc: `"${p.nome || cx(p.id)?.nome || 'caixinha'}" — movimentações também serão removidas`, cls: 'bd', btn: 'Excluir' }
    }
    default:
      return { label: act.tipo, desc: JSON.stringify(act.payload).slice(0, 80) }
  }
}

// Markdown light — quebra linha, **negrito**, *itálico*, listas simples, código `inline`
function mdLite(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.+<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n/g, '<br>')
}
function escapeAttr(s) { return String(s).replace(/'/g, '&#39;').replace(/"/g, '&quot;') }

function renderEmpty() {
  return `<div class="empty" style="padding:60px;text-align:center">
    <div style="font-size:42px;margin-bottom:14px">🎯</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma meta cadastrada</div>
    <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">Crie sua primeira meta financeira</div>
    <button class="btn bp" id="lib-add-meta">+ Nova meta</button>
  </div>`
}

function renderHero(meta) {
  const saldo = saldoMeta(meta)
  const alvo  = Number(meta.valor_alvo)
  const pct   = Math.min(100, (saldo / alvo) * 100)
  const sugAp = sugestaoAporteMensal()
  const apMes = aportesMesAtual(meta.id)
  const streak = streakAportes(meta.id)
  const mAte  = mesesAteMeta({ pv: saldo, fases: [{inicio:0, aporte: sugAp}], taxaAA: Number(_cfg.selic_aa), meta: alvo })

  return `
  <div class="lib-hero" style="--meta-color:${meta.cor || '#C5F82A'}">
    <div class="lib-hero-left">
      <div class="lib-eyebrow"><span class="lib-meta-ico">${meta.icone || '🎯'}</span> META PRINCIPAL · ${escapeHtml(meta.nome)}</div>
      <div class="lib-hero-big"><span class="lib-curr">R$</span>${formatBig(saldo)}</div>
      <div class="lib-hero-sub">
        de <strong>${brl(alvo)}</strong>
        · ${pct.toFixed(1)}% do caminho
        ${mAte != null ? ` · faltam <strong>${mAte}</strong> meses no aporte sugerido` : ''}
      </div>
      <div class="lib-bar"><div class="lib-bar-fill" style="width:${pct.toFixed(2)}%"></div></div>

      <div class="lib-hero-chips">
        <span class="lib-chip lib-chip-selic">${chipSelicHTML()}</span>
        <span class="lib-chip"><b>Aporte sug.</b> ${brl(sugAp)}/mês <small>(${Number(_cfg.aporte_pct_faturamento)}% do fat)</small></span>
        <span class="lib-chip"><b>Este mês</b> ${brl(apMes)} ${apMes >= sugAp ? '<span class="lib-ok">●</span>' : '<span class="lib-warn">●</span>'}</span>
        <span class="lib-chip"><b>Streak</b> ${streak} ${streak === 1 ? 'mês' : 'meses'} 🔥</span>
      </div>
    </div>

    <div class="lib-hero-right">
      ${renderRing(pct, meta.cor || '#C5F82A')}
      <div class="lib-hero-acts">
        <button class="btn bp" data-aporte="${meta.id}">+ Aporte aqui</button>
        <button class="btn bg bsm" data-meta-edit="${meta.id}">⚙ Editar</button>
      </div>
    </div>
  </div>`
}

function renderMetaCard(meta) {
  const saldo = saldoMeta(meta)
  const alvo  = Number(meta.valor_alvo)
  const pct   = Math.min(100, (saldo / alvo) * 100)
  const cor   = meta.cor || '#C5F82A'
  const sugAp = sugestaoAporteMensal()
  const mAte  = mesesAteMeta({ pv: saldo, fases: [{inicio:0, aporte: sugAp}], taxaAA: Number(_cfg.selic_aa), meta: alvo })
  const concluida = saldo >= alvo

  return `
  <div class="lib-meta-card${concluida ? ' done' : ''}" style="--meta-color:${cor}">
    <div class="lib-meta-top">
      <div class="lib-meta-ico-box" style="background:${hexA(cor, .14)};color:${cor}">${meta.icone || '🎯'}</div>
      <div class="lib-meta-name">${escapeHtml(meta.nome)}</div>
      <button class="lib-meta-menu" data-meta-edit="${meta.id}" title="Editar">⋯</button>
    </div>
    <div class="lib-meta-val">
      <span class="lib-meta-cur">${brl(saldo)}</span>
      <span class="lib-meta-sep">/</span>
      <span class="lib-meta-alvo">${brl(alvo)}</span>
    </div>
    <div class="lib-meta-bar"><div class="lib-meta-bar-fill" style="width:${pct.toFixed(2)}%;background:${cor}"></div></div>
    <div class="lib-meta-foot">
      <span>${pct.toFixed(0)}%</span>
      ${concluida
        ? '<span class="lib-done-tag">✓ Atingida</span>'
        : `<span>${mAte != null ? `${mAte}m no ritmo` : 'sem prazo'}</span>`}
    </div>
    <div class="lib-meta-acts">
      <button class="btn bp bsm" data-aporte="${meta.id}">+ Aporte</button>
      <button class="btn bg bsm" data-sim="${meta.id}">Simular</button>
    </div>
  </div>`
}

function renderStats(meta) {
  if (!meta) return ''
  const saldo = saldoMeta(meta)
  const alvo  = Number(meta.valor_alvo)
  const projecao = projetar({ pv: saldo, fases: _sim.fases, taxaAA: _sim.taxa, meses: _sim.meses })
  const final = projecao[projecao.length - 1]
  const totalAp = final.aportado
  const jurosAc = final.juros
  const mAte = mesesAteMeta({ pv: saldo, fases: _sim.fases, taxaAA: _sim.taxa, meta: alvo })

  return `
  <div class="lib-stats" id="lib-stats">
    <div class="lib-stat">
      <div class="lib-stat-key">Saldo da meta</div>
      <div class="lib-stat-val">${brl(saldo)}</div>
      <div class="lib-stat-sub">${aportesDaMeta(meta).length} aporte${aportesDaMeta(meta).length===1?'':'s'} registrado${aportesDaMeta(meta).length===1?'':'s'}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Faturamento médio 6m</div>
      <div class="lib-stat-val">${brl(fatMedio6m())}</div>
      <div class="lib-stat-sub">Mês atual: ${brl(fatMesAtual())}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Projeção em ${_sim.meses}m</div>
      <div class="lib-stat-val ac">${brl(final.saldo)}</div>
      <div class="lib-stat-sub">Juros: ${brl(jurosAc)}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Falta pra meta</div>
      <div class="lib-stat-val">${brl(Math.max(0, alvo - saldo))}</div>
      <div class="lib-stat-sub">${mAte != null ? `Bate em ${dataFutura(mAte)}` : 'Aumente o aporte'}</div>
    </div>
  </div>`
}

function renderSimulator(meta) {
  if (!meta) return ''
  const saldo = saldoMeta(meta)
  const alvo  = Number(meta.valor_alvo)
  const projecao = projetar({ pv: saldo, fases: _sim.fases, taxaAA: _sim.taxa, meses: _sim.meses })
  const sugAp = sugestaoAporteMensal() || 1000

  // Renderiza as fases — fase 0 fica fixa em "Início (mês 0)"
  const fasesHTML = _sim.fases.map((f, idx) => `
    <div class="lib-fase" data-fase-idx="${idx}">
      <div class="lib-fase-when">
        ${idx === 0
          ? `<span class="lib-fase-tag">Início</span>`
          : `<input type="number" class="lib-fase-inicio" min="1" max="${_sim.meses}" step="1" value="${f.inicio}"> <small>em diante</small>`}
      </div>
      <div class="lib-fase-val">
        <input type="number" class="lib-fase-aporte" min="0" step="100" value="${f.aporte}"> <small>R$/mês</small>
      </div>
      ${idx > 0 ? `<button class="lib-fase-del" title="Remover fase">×</button>` : ''}
    </div>
  `).join('')

  return `
  <div class="lib-block">
    <div class="lib-block-head">
      <div>
        <h3>Simulador de juros compostos</h3>
        <div class="lib-block-sub">
          Projetando: <strong>${escapeHtml(meta.nome)}</strong>
          ${_metas.length > 1 ? `
            <select class="lib-meta-select" id="sim-meta">
              ${_metas.map(m => `<option value="${m.id}"${m.id===meta.id?' selected':''}>${m.icone || '🎯'} ${escapeHtml(m.nome)}</option>`).join('')}
            </select>
          ` : ''}
        </div>
      </div>
    </div>

    <div class="lib-sim">
      <div class="lib-sim-controls">
        <!-- Fases de aporte -->
        <div class="lib-fases">
          <div class="lib-fases-head">
            <label>Fases de aporte</label>
            <span class="lib-fases-hint">Aporta R$X até o mês N, depois aumenta/diminui</span>
          </div>
          <div class="lib-fases-list" id="lib-fases-list">
            ${fasesHTML}
          </div>
          <button type="button" class="btn bg bsm" id="lib-fase-add">+ Adicionar fase</button>
          <div class="lib-sim-quick" style="margin-top:8px">
            <small style="color:var(--text-3);font-family:var(--ff-mono);font-size:10px;text-transform:uppercase;letter-spacing:.12em;align-self:center;margin-right:4px">Aplicar na fase 1:</small>
            <button class="lib-qk" data-pmt="${sugAp}">${brl(sugAp)}</button>
            <button class="lib-qk" data-pmt="2000">R$ 2k</button>
            <button class="lib-qk" data-pmt="5000">R$ 5k</button>
            <button class="lib-qk" data-pmt="10000">R$ 10k</button>
          </div>
        </div>

        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Taxa anual</label>
            <span class="lib-slider-v">${_sim.taxa.toFixed(2)}% a.a.</span>
          </div>
          <input type="range" id="sim-taxa" min="4" max="25" step="0.25" value="${_sim.taxa}">
        </div>
        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Prazo</label>
            <span class="lib-slider-v">${_sim.meses} meses (${(_sim.meses/12).toFixed(1)} anos)</span>
          </div>
          <input type="range" id="sim-meses" min="6" max="240" step="1" value="${_sim.meses}">
        </div>
      </div>

      <div class="lib-sim-chart">
        ${renderChart(projecao, alvo, _sim.fases)}
        <div class="lib-chart-legend">
          <span><i style="background:var(--accent)"></i>Saldo total</span>
          <span><i style="background:#4A9EFF"></i>Aportado</span>
          <span><i style="background:#A78BFA"></i>Juros</span>
          <span><i style="background:rgba(255,255,255,.25);height:2px;width:14px;border-radius:0"></i>Meta ${brl(alvo)}</span>
        </div>
      </div>
    </div>
  </div>`
}

function renderRing(pct, cor) {
  const R = 86, C = 2 * Math.PI * R
  const dash = (C * Math.min(100, pct)) / 100
  return `
  <div class="lib-ring">
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${lighten(cor, 30)}"/>
          <stop offset=".5" stop-color="${cor}"/>
          <stop offset="1" stop-color="${darken(cor, 25)}"/>
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="${R}" stroke="rgba(255,255,255,.06)" stroke-width="14" fill="none"/>
      <circle cx="110" cy="110" r="${R}" stroke="url(#lg-ring)" stroke-width="14" fill="none"
              stroke-linecap="round" stroke-dasharray="${dash} ${C-dash}"
              stroke-dashoffset="${C/4}" transform="rotate(-90 110 110)"
              style="transition: stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1);">
      </circle>
    </svg>
    <div class="lib-ring-inner">
      <div class="lib-ring-pct">${pct.toFixed(1)}<small>%</small></div>
      <div class="lib-ring-lbl">da meta</div>
    </div>
  </div>`
}

// ─────────────── CHART (smooth, glow, crosshair, meta marker) ──────
function renderChart(pontos, meta, fases = null) {
  const W = 760, H = 290, PAD = { t: 38, r: 90, b: 32, l: 56 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const maxY = Math.max(meta, ...pontos.map(p => p.saldo)) * 1.08

  const xs = (i) => PAD.l + (i / (pontos.length - 1)) * innerW
  const ys = (v) => PAD.t + innerH - (Math.max(0, v) / maxY) * innerH

  // Smooth path (Catmull-Rom convertido pra Bézier cúbica)
  function smoothPath(key) {
    const pts = pontos.map((p, i) => [xs(i), ys(p[key])])
    if (pts.length < 2) return ''
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
    const t = 0.18  // tensão da curva
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[i + 2] || p2
      const c1x = p1[0] + (p2[0] - p0[0]) * t
      const c1y = p1[1] + (p2[1] - p0[1]) * t
      const c2x = p2[0] - (p3[0] - p1[0]) * t
      const c2y = p2[1] - (p3[1] - p1[1]) * t
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
    }
    return d
  }
  const saldoPath    = smoothPath('saldo')
  const aportadoPath = smoothPath('aportado')
  const jurosPath    = smoothPath('juros')

  // Área embaixo do saldo
  const lastX = xs(pontos.length - 1)
  const baseY = ys(0)
  const areaPath = `${saldoPath} L ${lastX.toFixed(1)} ${baseY.toFixed(1)} L ${PAD.l} ${baseY.toFixed(1)} Z`

  // Y ticks — só 3, menos clutter
  const yticks = [0, 0.5, 1].map(p => {
    const v = maxY * p
    return `<g>
      <line x1="${PAD.l}" x2="${W - PAD.r}" y1="${ys(v)}" y2="${ys(v)}" stroke="rgba(255,255,255,.04)" stroke-dasharray="${p===0?'':'2 4'}"/>
      <text x="${PAD.l - 10}" y="${ys(v) + 3}" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="end" font-family="JetBrains Mono" font-weight="500">${kfmt(v)}</text>
    </g>`
  }).join('')

  // X ticks — só extremos + meio
  const xtMarcas = [0, Math.floor(pontos.length/2), pontos.length - 1]
  const xticks = xtMarcas.map(i => {
    const p = pontos[i]
    return `<text x="${xs(i)}" y="${H - 10}" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="middle" font-family="JetBrains Mono" font-weight="500">${p.mes}m</text>`
  }).join('')

  // Linhas verticais nas transições de fase (mês N em diante = R$Y)
  let fasesViz = ''
  if (fases && fases.length > 1) {
    fasesViz = fases.slice(1).map(f => {
      if (f.inicio <= 0 || f.inicio >= pontos.length) return ''
      const x = xs(f.inicio)
      return `
        <line x1="${x}" x2="${x}" y1="${PAD.t}" y2="${PAD.t + innerH}" stroke="rgba(167,139,250,.45)" stroke-dasharray="3 3" stroke-width="1"/>
        <g transform="translate(${x} ${PAD.t - 14})">
          <rect x="-44" y="-10" width="88" height="18" rx="9" fill="rgba(167,139,250,.18)" stroke="rgba(167,139,250,.5)"/>
          <text x="0" y="3" font-size="9.5" font-weight="700" fill="#C7B3FB" text-anchor="middle" font-family="JetBrains Mono">→ ${kfmt(f.aporte)}/m</text>
        </g>`
    }).join('')
  }

  // Linha da META + marcador no ponto que cruza
  let metaViz = ''
  let crossViz = ''
  if (meta <= maxY) {
    const metaY = ys(meta)
    metaViz = `
      <line x1="${PAD.l}" x2="${W - PAD.r}" y1="${metaY}" y2="${metaY}" stroke="rgba(255,255,255,.18)" stroke-dasharray="5 5" stroke-width="1"/>
      <g transform="translate(${(W - PAD.r + 4)} ${metaY})">
        <rect x="0" y="-9" width="78" height="18" rx="9" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.15)"/>
        <text x="39" y="3.5" font-size="10" fill="rgba(255,255,255,.7)" text-anchor="middle" font-family="JetBrains Mono" font-weight="600">META ${kfmt(meta)}</text>
      </g>`

    // Acha o índice onde saldo cruza a meta
    const idxCross = pontos.findIndex(p => p.saldo >= meta)
    if (idxCross > 0) {
      const cx = xs(idxCross), cy = ys(pontos[idxCross].saldo)
      crossViz = `
        <g class="lib-chart-cross" transform="translate(${cx} ${cy})">
          <circle r="14" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".4" class="lib-chart-cross-pulse"/>
          <circle r="6"  fill="#34D399" stroke="#0A0F0A" stroke-width="2"/>
          <g transform="translate(0 -22)">
            <rect x="-58" y="-13" width="116" height="22" rx="11" fill="#34D399"/>
            <text x="0" y="2" font-size="10.5" font-weight="700" fill="#0A0F0A" text-anchor="middle" font-family="JetBrains Mono">🎯 ${pontos[idxCross].mes}m · ${dataFutura(pontos[idxCross].mes).toUpperCase()}</text>
          </g>
        </g>`
    }
  }

  // Valor final no fim de cada linha
  const last = pontos[pontos.length - 1]
  const endLabels = `
    <g transform="translate(${(lastX + 8)} ${ys(last.saldo)})">
      <text font-size="11" font-weight="700" fill="#C5F82A" font-family="JetBrains Mono" dy="3">${kfmt(last.saldo)}</text>
    </g>
    <g transform="translate(${(lastX + 8)} ${ys(last.aportado)})">
      <text font-size="10" fill="#4A9EFF" font-family="JetBrains Mono" dy="3">${kfmt(last.aportado)}</text>
    </g>
    <g transform="translate(${(lastX + 8)} ${ys(last.juros)})">
      <text font-size="10" fill="#A78BFA" font-family="JetBrains Mono" dy="3">${kfmt(last.juros)}</text>
    </g>`

  // Dados pro hover/crosshair (serializados em data-attrs)
  const xsArr = pontos.map((_, i) => xs(i).toFixed(1)).join(',')
  const saldoArr = pontos.map(p => Math.round(p.saldo)).join(',')
  const apArr    = pontos.map(p => Math.round(p.aportado)).join(',')
  const juArr    = pontos.map(p => Math.round(p.juros)).join(',')

  return `
  <svg class="lib-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"
       data-w="${W}" data-h="${H}" data-pad-l="${PAD.l}" data-pad-r="${PAD.r}"
       data-pad-t="${PAD.t}" data-pad-b="${PAD.b}"
       data-xs="${xsArr}" data-saldo="${saldoArr}" data-aportado="${apArr}" data-juros="${juArr}"
       data-meses="${pontos.map(p => p.mes).join(',')}">
    <defs>
      <linearGradient id="lg-area-saldo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#C5F82A" stop-opacity=".5"/>
        <stop offset="50%"  stop-color="#C5F82A" stop-opacity=".15"/>
        <stop offset="100%" stop-color="#C5F82A" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="lg-stroke-saldo" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#E6FF7A"/>
        <stop offset=".6" stop-color="#C5F82A"/>
        <stop offset="1"   stop-color="#34D399"/>
      </linearGradient>
      <filter id="f-glow-saldo" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    ${yticks}
    ${fasesViz}
    ${metaViz}

    <path d="${areaPath}" fill="url(#lg-area-saldo)" class="lib-chart-area"/>

    <path d="${aportadoPath}" fill="none" stroke="#4A9EFF" stroke-width="1.5"
          stroke-dasharray="4 4" opacity=".55" class="lib-chart-line"/>
    <path d="${jurosPath}"    fill="none" stroke="#A78BFA" stroke-width="1.5"
          opacity=".6" class="lib-chart-line"/>
    <path d="${saldoPath}"    fill="none" stroke="url(#lg-stroke-saldo)" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"
          filter="url(#f-glow-saldo)" class="lib-chart-line lib-chart-line-main"/>

    ${crossViz}
    ${endLabels}
    ${xticks}

    <g class="lib-chart-hover" style="opacity:0;pointer-events:none">
      <line class="lib-chart-vline" y1="${PAD.t}" y2="${PAD.t + innerH}"
            stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="2 3"/>
      <circle class="lib-chart-dot-s" r="5" fill="#C5F82A" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-a" r="3.5" fill="#4A9EFF" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-j" r="3.5" fill="#A78BFA" stroke="#0A0F0A" stroke-width="2"/>
    </g>

    <rect class="lib-chart-hit" x="${PAD.l}" y="${PAD.t}" width="${innerW}" height="${innerH}" fill="transparent"/>
  </svg>
  <div class="lib-chart-tooltip" style="opacity:0">
    <div class="lib-tt-mes"></div>
    <div class="lib-tt-row"><i style="background:#C5F82A"></i><span>Saldo</span><b class="lib-tt-s"></b></div>
    <div class="lib-tt-row"><i style="background:#4A9EFF"></i><span>Aportado</span><b class="lib-tt-a"></b></div>
    <div class="lib-tt-row"><i style="background:#A78BFA"></i><span>Juros</span><b class="lib-tt-j"></b></div>
  </div>`
}

// Liga o hover do chart (crosshair + tooltip)
function wireChartHover(host) {
  const svg = host.querySelector('.lib-chart')
  const tt  = host.querySelector('.lib-chart-tooltip')
  if (!svg || !tt) return
  const hover = svg.querySelector('.lib-chart-hover')
  const hit   = svg.querySelector('.lib-chart-hit')
  const vline = svg.querySelector('.lib-chart-vline')
  const dS    = svg.querySelector('.lib-chart-dot-s')
  const dA    = svg.querySelector('.lib-chart-dot-a')
  const dJ    = svg.querySelector('.lib-chart-dot-j')

  const xsArr    = svg.dataset.xs.split(',').map(Number)
  const saldoArr = svg.dataset.saldo.split(',').map(Number)
  const apArr    = svg.dataset.aportado.split(',').map(Number)
  const juArr    = svg.dataset.juros.split(',').map(Number)
  const mesesArr = svg.dataset.meses.split(',').map(Number)
  const W = +svg.dataset.w, H = +svg.dataset.h
  const PAD_T = +svg.dataset.padT, PAD_B = +svg.dataset.padB
  const maxY = Math.max(...saldoArr) * 1.08
  const innerH = H - PAD_T - PAD_B
  const ys = v => PAD_T + innerH - (Math.max(0, v) / maxY) * innerH

  hit.addEventListener('mousemove', e => {
    const rect = svg.getBoundingClientRect()
    const scale = W / rect.width
    const svgX = (e.clientX - rect.left) * scale
    // acha índice mais próximo
    let best = 0, bestD = Infinity
    for (let i = 0; i < xsArr.length; i++) {
      const d = Math.abs(xsArr[i] - svgX)
      if (d < bestD) { bestD = d; best = i }
    }
    const xPx = xsArr[best]
    hover.style.opacity = 1
    vline.setAttribute('x1', xPx); vline.setAttribute('x2', xPx)
    dS.setAttribute('cx', xPx); dS.setAttribute('cy', ys(saldoArr[best]))
    dA.setAttribute('cx', xPx); dA.setAttribute('cy', ys(apArr[best]))
    dJ.setAttribute('cx', xPx); dJ.setAttribute('cy', ys(juArr[best]))

    // posiciona tooltip (em px relativo ao host)
    const left = (xPx / W) * rect.width
    const place = left > rect.width / 2 ? 'left' : 'right'
    tt.style.opacity = 1
    tt.style.left = place === 'right' ? (left + 14) + 'px' : (left - 14 - tt.offsetWidth) + 'px'
    tt.style.top  = Math.max(8, ys(saldoArr[best]) / H * rect.height - tt.offsetHeight / 2) + 'px'
    tt.querySelector('.lib-tt-mes').textContent = `${mesesArr[best]}m · ${dataFutura(mesesArr[best])}`
    tt.querySelector('.lib-tt-s').textContent = brl(saldoArr[best])
    tt.querySelector('.lib-tt-a').textContent = brl(apArr[best])
    tt.querySelector('.lib-tt-j').textContent = brl(juArr[best])
  })

  hit.addEventListener('mouseleave', () => {
    hover.style.opacity = 0
    tt.style.opacity = 0
  })
}

function renderAportes() {
  return `
  <div class="lib-block">
    <div class="lib-block-head">
      <h3>Histórico de aportes</h3>
      <button class="btn bp bsm" data-aporte="">+ Aporte</button>
    </div>
    ${_aportes.length ? renderAportesList() : `<div class="empty" style="padding:34px;text-align:center;color:var(--text-3)">Nenhum aporte ainda. Bora começar!</div>`}
  </div>`
}

function renderAportesList() {
  const groups = {}
  for (const a of _aportes) {
    const ym = (a.data || '').slice(0,7)
    if (!groups[ym]) groups[ym] = []
    groups[ym].push(a)
  }
  return Object.entries(groups).sort((a,b) => b[0].localeCompare(a[0])).map(([ym, list]) => {
    const [y, m] = ym.split('-')
    const tot = list.reduce((s, a) => s + Number(a.valor || 0), 0)
    return `
    <div class="lib-mes">
      <div class="lib-mes-head">
        <span class="lib-mes-name">${MES[parseInt(m)-1]} / ${y}</span>
        <span class="lib-mes-tot">${brl(tot)}</span>
      </div>
      ${list.map(a => {
        const meta = _metas.find(x => x.id === a.meta_id)
        return `
        <div class="lib-ap-row" data-ap-edit="${a.id}" title="Clica pra editar">
          <div class="lib-ap-data">${fmtd(a.data)}</div>
          <div class="lib-ap-meta">${meta
            ? `<span class="lib-ap-tag" style="background:${hexA(meta.cor || '#C5F82A', .15)};color:${meta.cor || '#C5F82A'}">${meta.icone || '🎯'} ${escapeHtml(meta.nome)}</span>`
            : `<span class="lib-ap-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">sem meta</span>`}
          </div>
          <div class="lib-ap-fonte">${escapeHtml(a.fonte || 'manual')}${a.observacao ? ' · ' + escapeHtml(a.observacao) : ''}</div>
          <div class="lib-ap-val">${brl(Number(a.valor))}</div>
          <button class="lib-ap-del" data-aid="${a.id}" title="Excluir">×</button>
        </div>`
      }).join('')}
    </div>`
  }).join('')
}

// ─────────────────────────── INTERAÇÃO ──────────────────────────────
function wire(root) {
  // Botões "+ Nova meta"
  root.querySelectorAll('#lib-add-meta, #lib-add-meta-2').forEach(el =>
    el.addEventListener('click', () => metaForm()))

  // Sliders restantes (taxa + prazo)
  root.querySelector('#sim-taxa') ?.addEventListener('input', e => updateSim({ taxa:  +e.target.value }))
  root.querySelector('#sim-meses')?.addEventListener('input', e => updateSim({ meses: +e.target.value }))
  root.querySelector('#sim-meta') ?.addEventListener('change', e => { _sim.metaId = e.target.value; render() })

  // Inputs das fases (delegado pra capturar fases criadas depois também)
  root.querySelector('#lib-fases-list')?.addEventListener('input', e => {
    const row = e.target.closest('.lib-fase'); if (!row) return
    const idx = +row.dataset.faseIdx
    if (!_sim.fases[idx]) return
    if (e.target.classList.contains('lib-fase-aporte')) {
      _sim.fases[idx].aporte = Math.max(0, +e.target.value || 0)
      updateSim({})
    } else if (e.target.classList.contains('lib-fase-inicio')) {
      // Permite mês > prazo: estica o prazo automaticamente pra a fase ser visível
      const novo = Math.max(1, +e.target.value || 1)
      _sim.fases[idx].inicio = novo
      if (novo + 6 > _sim.meses) {
        _sim.meses = Math.min(240, novo + 24)
        render()  // re-render full pra atualizar slider prazo
        return
      }
      updateSim({})
    }
  })

  // + Adicionar fase
  root.querySelector('#lib-fase-add')?.addEventListener('click', () => {
    const ultima = _sim.fases[_sim.fases.length - 1]
    const novaInicio = (ultima?.inicio || 0) + 12  // sem cap — fase nova começa 12m depois da última
    const novoAporte = Math.round((ultima?.aporte || 2000) * 1.5)
    _sim.fases.push({ inicio: novaInicio, aporte: novoAporte })
    // Se a fase nova passa do prazo, estica o prazo pra dar pra ver o efeito
    if (novaInicio + 6 > _sim.meses) _sim.meses = Math.min(240, novaInicio + 24)
    render()
    setTimeout(() => document.querySelector('.lib-fase:last-child .lib-fase-aporte')?.focus(), 50)
  })

  // Remover fase
  root.querySelector('#lib-fases-list')?.addEventListener('click', e => {
    const del = e.target.closest('.lib-fase-del'); if (!del) return
    const row = del.closest('.lib-fase'); const idx = +row.dataset.faseIdx
    if (idx === 0) return  // fase 1 não remove
    _sim.fases.splice(idx, 1)
    render()
  })

  // Quick buttons aplicam na fase 0 (a inicial)
  root.querySelectorAll('.lib-qk').forEach(b =>
    b.addEventListener('click', () => {
      _sim.fases[0].aporte = +b.dataset.pmt
      render()
    }))

  // Delegação geral
  root.addEventListener('click', async e => {
    const aporte  = e.target.closest('[data-aporte]')
    const sim     = e.target.closest('[data-sim]')
    const edit    = e.target.closest('[data-meta-edit]')
    const del     = e.target.closest('.lib-ap-del')
    const refresh = e.target.closest('#lib-selic-refresh')

    if (refresh) {
      e.stopPropagation()
      refresh.classList.add('spinning')
      const ok = await tentarAtualizarSelic({ manual: true })
      refresh.classList.remove('spinning')
      if (ok) {
        _sim.taxa = Number(_cfg.selic_aa)
        const s = document.getElementById('sim-taxa')
        if (s && document.activeElement !== s) {
          s.value = _sim.taxa
          updateSim({ taxa: _sim.taxa })
        }
      }
      return
    }

    if (aporte) {
      aporteForm({ metaId: aporte.dataset.aporte || null })
      return
    }
    if (sim) {
      _sim.metaId = sim.dataset.sim
      render()
      // Scroll suave pro simulador
      setTimeout(() => document.querySelector('.lib-sim')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
      return
    }
    if (edit) {
      const m = _metas.find(x => x.id === edit.dataset.metaEdit)
      if (m) metaForm(m)
      return
    }
    if (del) {
      // Evita que o click no X também dispare o edit da row
      e.stopPropagation()
      if (!confirm('Excluir esse aporte?')) return
      const { error } = await db.from('aportes_fin').delete().eq('id', del.dataset.aid)
      if (error) return toast('Erro: ' + error.message, 'err')
      toast('Aporte removido')
      render()
      return
    }
    // Click na row do aporte = abre form de edição
    const apEdit = e.target.closest('[data-ap-edit]')
    if (apEdit) {
      const a = _aportes.find(x => x.id === apEdit.dataset.apEdit)
      if (a) aporteForm({ aporte: a })
    }
  })
}

function updateSim(patch) {
  Object.assign(_sim, patch)
  const c = document.getElementById('content')
  const meta = _metas.find(m => m.id === _sim.metaId) || _metas.find(m => m.principal) || _metas[0]
  if (!meta) return

  // Sliders restantes (taxa e meses) — usam ordem do DOM
  const sliderVs = c.querySelectorAll('.lib-slider-v')
  if (sliderVs[0]) sliderVs[0].textContent = _sim.taxa.toFixed(2) + '% a.a.'
  if (sliderVs[1]) sliderVs[1].textContent = `${_sim.meses} meses (${(_sim.meses/12).toFixed(1)} anos)`

  // Re-renderiza chart
  const saldo = saldoMeta(meta)
  const alvo  = Number(meta.valor_alvo)
  const projecao = projetar({ pv: saldo, fases: _sim.fases, taxaAA: _sim.taxa, meses: _sim.meses })
  const final = projecao[projecao.length - 1]
  const totalAp = final.aportado

  const chartHost = c.querySelector('.lib-sim-chart')
  if (chartHost) {
    const legend = chartHost.querySelector('.lib-chart-legend')
    chartHost.innerHTML = renderChart(projecao, alvo, _sim.fases) + (legend ? legend.outerHTML : '')
    wireChartHover(chartHost)
  }

  // Re-renderiza stats (projeção + falta pra meta)
  const stats = c.querySelectorAll('#lib-stats .lib-stat-val')
  const subs  = c.querySelectorAll('#lib-stats .lib-stat-sub')
  if (stats[2]) { stats[2].textContent = brl(final.saldo); subs[2].textContent = 'Juros: ' + brl(final.saldo - totalAp) }
  const mAte = mesesAteMeta({ pv: saldo, fases: _sim.fases, taxaAA: _sim.taxa, meta: alvo })
  if (stats[3]) { stats[3].textContent = brl(Math.max(0, alvo - saldo)); subs[3].textContent = mAte != null ? `Bate em ${dataFutura(mAte)}` : 'Aumente o aporte' }
}

// ─────────────────────────── FORMS ──────────────────────────────────
function aporteForm({ metaId = null, aporte = null } = {}) {
  const hoje    = new Date().toISOString().slice(0,10)
  const sug     = sugestaoAporteMensal()
  const isEdit  = !!aporte
  const metaIdPick = isEdit ? (aporte.meta_id || '') : (metaId || _metas.find(m => m.principal)?.id || _metas[0]?.id || '')
  const valor   = isEdit ? aporte.valor : (sug || '')
  const data    = isEdit ? aporte.data  : hoje
  const fonte   = isEdit ? (aporte.fonte || 'manual') : 'manual'
  const obs     = isEdit ? (aporte.observacao || '') : ''

  const fonteOpts = ['manual','faturamento','bonus','outro']
    .map(f => `<option value="${f}"${f===fonte?' selected':''}>${f === 'manual' ? 'Manual' : f === 'faturamento' ? 'Faturamento' : f === 'bonus' ? 'Bônus / Extra' : 'Outro'}</option>`)
    .join('')

  openModal(isEdit ? 'Editar aporte' : 'Registrar aporte', `
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${_metas.map(m => `<option value="${m.id}"${m.id === metaIdPick ? ' selected' : ''}>${m.icone || '🎯'} ${escapeHtml(m.nome)}</option>`).join('')}
        <option value=""${metaIdPick === '' ? ' selected' : ''}>— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${valor}">
      ${!isEdit && sug ? `<div class="lib-hint">Sugestão: ${brl(sug)} (${_cfg.aporte_pct_faturamento}% do faturamento médio)</div>` : ''}
    </div>
    <div class="fg"><label class="fl">Data ${isEdit ? '<small style="color:var(--text-3);font-weight:400">(mude pra mover de mês)</small>' : ''}</label>
      <input class="fi" type="date" id="ap-data" value="${data}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">${fonteOpts}</select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux" value="${escapeHtml(obs)}">
    </div>
  `, `
    ${isEdit ? `<button class="btn bd bsm" id="ap-del" style="margin-right:auto">Excluir</button>` : ''}
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">${isEdit ? 'Salvar alteração' : 'Salvar aporte'}</button>
  `)
  document.getElementById('ap-cancel').addEventListener('click', closeModal)
  document.getElementById('ap-del')?.addEventListener('click', async () => {
    if (!confirm('Excluir esse aporte?')) return
    const { error } = await db.from('aportes_fin').delete().eq('id', aporte.id)
    if (error) return toast('Erro: ' + error.message, 'err')
    closeModal(); toast('Aporte removido'); render()
  })
  document.getElementById('ap-save').addEventListener('click', async () => {
    const v = parseFloat(document.getElementById('ap-val').value) || 0
    if (v <= 0) return toast('Valor inválido', 'err')
    const d = {
      valor:      v,
      data:       document.getElementById('ap-data').value || hoje,
      fonte:      document.getElementById('ap-fonte').value,
      observacao: document.getElementById('ap-obs').value.trim() || null,
      meta_id:    document.getElementById('ap-meta').value || null,
    }
    const { error } = isEdit
      ? await db.from('aportes_fin').update(d).eq('id', aporte.id)
      : await db.from('aportes_fin').insert(d)
    if (error) return toast('Erro: ' + error.message, 'err')
    closeModal(); toast(isEdit ? 'Aporte atualizado' : 'Aporte registrado 🚀')
    render()
  })
}

function metaForm(m = {}) {
  const isNew = !m.id
  const icone = m.icone || ICONES_SUG[0]
  const cor   = m.cor   || CORES[_metas.length % CORES.length]

  const iconBtns = ICONES_SUG.map(i => `<button type="button" class="lib-ico-pick${i===icone?' on':''}" data-ico="${i}">${i}</button>`).join('')
  const corBtns  = CORES.map(c => `<button type="button" class="lib-cor-pick${c===cor?' on':''}" style="background:${c}" data-cor="${c}"></button>`).join('')

  openModal(isNew ? 'Nova meta' : 'Editar meta', `
    <div class="fg"><label class="fl">Nome da meta</label>
      <input class="fi" type="text" id="m-nome" placeholder="Ex: Macbook M4 Pro, Viagem Japão…" value="${escapeHtml(m.nome || '')}">
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Valor alvo (R$)</label>
        <input class="fi" type="number" id="m-alvo" step="100" placeholder="15000" value="${m.valor_alvo || ''}">
      </div>
      <div class="fg"><label class="fl">Saldo inicial (R$)</label>
        <input class="fi" type="number" id="m-ini" step="100" placeholder="0" value="${m.valor_inicial || 0}">
        <div class="lib-hint">Quanto você já tem reservado pra essa meta</div>
      </div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Prazo (meses, opcional)</label>
        <input class="fi" type="number" id="m-prazo" step="1" placeholder="Sem prazo" value="${m.prazo_meses || ''}">
      </div>
      <div class="fg"><label class="fl">
        <input type="checkbox" id="m-principal"${m.principal ? ' checked' : ''}> Marcar como meta principal
      </label>
      <div class="lib-hint">A principal vai no hero (só uma por vez)</div>
      </div>
    </div>
    <div class="fg"><label class="fl">Ícone</label>
      <div class="lib-ico-row" id="m-icones">${iconBtns}</div>
      <input type="hidden" id="m-ico" value="${icone}">
    </div>
    <div class="fg"><label class="fl">Cor</label>
      <div class="lib-cor-row" id="m-cores">${corBtns}</div>
      <input type="hidden" id="m-cor" value="${cor}">
    </div>
  `, `
    ${!isNew ? `<button class="btn bd bsm" id="m-del" style="margin-right:auto">Excluir</button>` : ''}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `)

  // Pickers
  document.getElementById('m-icones').addEventListener('click', e => {
    const b = e.target.closest('.lib-ico-pick'); if (!b) return
    document.querySelectorAll('.lib-ico-pick').forEach(x => x.classList.remove('on'))
    b.classList.add('on'); document.getElementById('m-ico').value = b.dataset.ico
  })
  document.getElementById('m-cores').addEventListener('click', e => {
    const b = e.target.closest('.lib-cor-pick'); if (!b) return
    document.querySelectorAll('.lib-cor-pick').forEach(x => x.classList.remove('on'))
    b.classList.add('on'); document.getElementById('m-cor').value = b.dataset.cor
  })

  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-del')?.addEventListener('click', async () => {
    if (!confirm(`Excluir meta "${m.nome}"? Aportes vinculados ficam sem meta.`)) return
    const { error } = await db.from('metas_fin').delete().eq('id', m.id)
    if (error) return toast('Erro: ' + error.message, 'err')
    closeModal(); toast('Meta excluída'); render()
  })
  document.getElementById('m-save').addEventListener('click', async () => {
    const nome  = document.getElementById('m-nome').value.trim()
    const alvo  = parseFloat(document.getElementById('m-alvo').value) || 0
    if (!nome) return toast('Nome obrigatório', 'err')
    if (alvo <= 0) return toast('Valor alvo inválido', 'err')

    const principal = document.getElementById('m-principal').checked
    const data = {
      nome,
      valor_alvo:     alvo,
      valor_inicial:  parseFloat(document.getElementById('m-ini').value) || 0,
      prazo_meses:    parseInt(document.getElementById('m-prazo').value) || null,
      cor:            document.getElementById('m-cor').value,
      icone:          document.getElementById('m-ico').value,
      principal,
      atualizado_em:  new Date().toISOString(),
    }

    // Se vai marcar como principal, desmarca as outras antes (unique index protege mas erra)
    if (principal) {
      await db.from('metas_fin').update({ principal: false }).neq('id', m.id || '00000000-0000-0000-0000-000000000000')
    }

    const { error } = m.id
      ? await db.from('metas_fin').update(data).eq('id', m.id)
      : await db.from('metas_fin').insert(data)
    if (error) return toast('Erro: ' + error.message, 'err')
    closeModal(); toast(m.id ? 'Meta atualizada' : 'Meta criada 🎯'); render()
  })
}

// ───────────────────────────── UTILS ────────────────────────────────
function formatBig(v) {
  return Math.round(v).toLocaleString('pt-BR')
}
function kfmt(v) {
  if (v >= 1_000_000) return (v/1_000_000).toFixed(1).replace(/\.0$/,'') + 'M'
  if (v >= 1_000)     return (v/1_000)    .toFixed(1).replace(/\.0$/,'') + 'k'
  return Math.round(v).toString()
}
function dataFutura(meses) {
  const d = new Date(); d.setMonth(d.getMonth() + meses)
  return MES[d.getMonth()] + '/' + d.getFullYear()
}
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))
}
function hexA(hex, a) {
  const h = hex.replace('#',''); const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16)
  return `rgba(${r},${g},${b},${a})`
}
function lighten(hex, amt) {
  const h = hex.replace('#',''); const r=Math.min(255,parseInt(h.slice(0,2),16)+amt), g=Math.min(255,parseInt(h.slice(2,4),16)+amt), b=Math.min(255,parseInt(h.slice(4,6),16)+amt)
  return `rgb(${r},${g},${b})`
}
function darken(hex, amt) {
  const h = hex.replace('#',''); const r=Math.max(0,parseInt(h.slice(0,2),16)-amt), g=Math.max(0,parseInt(h.slice(2,4),16)-amt), b=Math.max(0,parseInt(h.slice(4,6),16)-amt)
  return `rgb(${r},${g},${b})`
}
