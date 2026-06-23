// ═══════════════════════════════════════════════════════════════════
// LIBERDADE FINANCEIRA — V2 com múltiplas metas
// Cada meta é uma "caixinha" independente (Liberdade R$100k, Macbook,
// viagem, etc). Cada aporte vincula a UMA meta. Selic puxada do BCB
// em tempo real toda vez que a view abre.
//
// Source of truth: tabelas metas_fin, aportes_fin, config_fin
// Schema: supabase/liberdade-financeira-v2.sql
// ═══════════════════════════════════════════════════════════════════
import { db } from '../db.js'
import { brl, toast, openModal, closeModal, fmtd, MES } from '../utils.js'

let _cfg     = null
let _metas   = []
let _aportes = []
let _fat     = []

// Simulador — qual meta tá projetando + parâmetros
let _sim = { metaId: null, aporte: 2000, meses: 60, taxa: 14.25 }

// Cores predefinidas pra picker de meta
const CORES = ['#C5F82A', '#4A9EFF', '#A78BFA', '#F5A623', '#EC4899', '#34D399', '#FF6B35', '#06B6D4']
const ICONES_SUG = ['🚀','💻','✈️','🏠','🚗','💍','📚','🎓','🎯','💰','🏖️','📱','🎸','🎮']

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando…</div>'

  await loadAll()
  await tentarAtualizarSelic()  // não-bloqueante, atualiza se conseguir

  // Inicializa simulador apontando pra meta principal
  if (!_sim.metaId || !_metas.find(m => m.id === _sim.metaId)) {
    const principal = _metas.find(m => m.principal) || _metas[0]
    _sim.metaId = principal?.id || null
  }
  _sim.aporte = Math.max(_sim.aporte, sugestaoAporteMensal())
  _sim.taxa   = Number(_cfg.selic_aa) || 14.25

  c.innerHTML = render_layout()
  wire(c)
}

// ───────────────────────────── LOAD ─────────────────────────────────
async function loadAll() {
  const [cfgRes, metasRes, apoRes, fatRes] = await Promise.all([
    db.from('config_fin').select('*').eq('id', 'main').maybeSingle(),
    db.from('metas_fin').select('*').neq('status', 'arquivada').order('principal', { ascending: false }).order('ordem'),
    db.from('aportes_fin').select('*').order('data', { ascending: false }),
    db.from('faturamento').select('*').order('ano', { ascending: false }).order('mes', { ascending: false }),
  ])

  if (cfgRes.error)   toast('config_fin: ' + cfgRes.error.message, 'err')
  if (metasRes.error) toast('metas_fin: ' + metasRes.error.message, 'err')
  if (apoRes.error)   toast('aportes_fin: ' + apoRes.error.message, 'err')

  _cfg     = cfgRes.data || { id:'main', meta_brl:100000, saldo_atual_brl:0, selic_aa:14.25, aporte_pct_faturamento:20 }
  _metas   = metasRes.data || []
  _aportes = apoRes.data || []
  _fat     = fatRes.data || []
}

// Puxa Selic atual do Banco Central. Se BCB não responder (CORS, fora do
// ar), mantém o valor que tá na config_fin. Não bloqueia o render.
async function tentarAtualizarSelic() {
  try {
    const r = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json')
    if (!r.ok) return
    const arr = await r.json()
    const v = Number(arr?.[0]?.valor)
    if (!isFinite(v) || v <= 0) return
    const atual = Number(_cfg.selic_aa)
    if (Math.abs(v - atual) > 0.01) {
      _cfg.selic_aa = v
      await db.from('config_fin').upsert({ id:'main', selic_aa: v, atualizado_em: new Date().toISOString() })
      toast(`Selic atualizada: ${v.toFixed(2)}% a.a.`)
    } else {
      _cfg.selic_aa = v
    }
  } catch (_) { /* silencioso — offline ou CORS bloqueou */ }
}

// ─────────────────────────── MATEMÁTICA ─────────────────────────────
function projetar({ pv, pmt, taxaAA, meses }) {
  const i = Math.pow(1 + taxaAA/100, 1/12) - 1
  const pontos = []
  let saldo = pv
  for (let m = 0; m <= meses; m++) {
    if (m > 0) saldo = saldo * (1 + i) + pmt
    pontos.push({ mes: m, saldo, aportado: pv + pmt * m, juros: saldo - pv - pmt * m })
  }
  return pontos
}
function mesesAteMeta({ pv, pmt, taxaAA, meta }) {
  if (pv >= meta) return 0
  const i = Math.pow(1 + taxaAA/100, 1/12) - 1
  // Se nem o juros do PV cobre, precisa de pmt > 0 pra crescer
  if (pmt <= 0 && pv * (1 + i) <= pv) return null
  let saldo = pv, m = 0
  while (m < 1200) {
    saldo = saldo * (1 + i) + pmt
    m++
    if (saldo >= meta) return m
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
  </div>`
}

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
  const mAte  = mesesAteMeta({ pv: saldo, pmt: sugAp, taxaAA: Number(_cfg.selic_aa), meta: alvo })

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
        <span class="lib-chip"><b>Selic</b> ${Number(_cfg.selic_aa).toFixed(2)}% a.a. <small>(BCB)</small></span>
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
  const mAte  = mesesAteMeta({ pv: saldo, pmt: sugAp, taxaAA: Number(_cfg.selic_aa), meta: alvo })
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
  const projecao = projetar({ pv: saldo, pmt: _sim.aporte, taxaAA: _sim.taxa, meses: _sim.meses })
  const final = projecao[projecao.length - 1]
  const totalAp = saldo + _sim.aporte * _sim.meses
  const jurosAc = final.saldo - totalAp
  const mAte = mesesAteMeta({ pv: saldo, pmt: _sim.aporte, taxaAA: _sim.taxa, meta: alvo })

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
  const projecao = projetar({ pv: saldo, pmt: _sim.aporte, taxaAA: _sim.taxa, meses: _sim.meses })
  const sugAp = sugestaoAporteMensal() || 1000

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
        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Aporte mensal</label>
            <span class="lib-slider-v">${brl(_sim.aporte)}</span>
          </div>
          <input type="range" id="sim-aporte" min="0" max="20000" step="100" value="${_sim.aporte}">
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

        <div class="lib-sim-quick">
          <button class="lib-qk" data-pmt="${sugAp}">Sug. ${brl(sugAp)}</button>
          <button class="lib-qk" data-pmt="2000">R$ 2k</button>
          <button class="lib-qk" data-pmt="5000">R$ 5k</button>
          <button class="lib-qk" data-pmt="10000">R$ 10k</button>
        </div>
      </div>

      <div class="lib-sim-chart">
        ${renderChart(projecao, alvo)}
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

function renderChart(pontos, meta) {
  const W = 640, H = 220, PAD = { t: 14, r: 14, b: 24, l: 50 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const maxY = Math.max(meta, ...pontos.map(p => p.saldo)) * 1.05
  const xs = (i) => PAD.l + (i / (pontos.length - 1)) * innerW
  const ys = (v) => PAD.t + innerH - (v / maxY) * innerH

  const path = (key) => pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(i).toFixed(1)} ${ys(p[key]).toFixed(1)}`).join(' ')
  const area = `${pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(i).toFixed(1)} ${ys(p.saldo).toFixed(1)}`).join(' ')} L ${xs(pontos.length-1).toFixed(1)} ${ys(0).toFixed(1)} L ${PAD.l} ${ys(0).toFixed(1)} Z`

  const yticks = [0, 0.25, 0.5, 0.75, 1].map(p => {
    const v = maxY * p
    return `<g><line x1="${PAD.l}" x2="${W - PAD.r}" y1="${ys(v)}" y2="${ys(v)}" stroke="rgba(255,255,255,.05)" /><text x="${PAD.l - 8}" y="${ys(v) + 3}" font-size="9" fill="rgba(255,255,255,.35)" text-anchor="end" font-family="JetBrains Mono">${kfmt(v)}</text></g>`
  }).join('')

  const step = Math.max(1, Math.round(pontos.length / 8))
  const xticks = pontos.filter((_, i) => i % step === 0).map((p, idx) => {
    const i = idx * step
    return `<text x="${xs(i)}" y="${H - 6}" font-size="9" fill="rgba(255,255,255,.35)" text-anchor="middle" font-family="JetBrains Mono">${p.mes}m</text>`
  }).join('')

  const metaY = ys(meta)
  const metaLine = meta <= maxY
    ? `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${metaY}" y2="${metaY}" stroke="rgba(255,255,255,.35)" stroke-dasharray="4 4"/>
       <text x="${W - PAD.r - 4}" y="${metaY - 5}" font-size="9" text-anchor="end" fill="rgba(255,255,255,.5)" font-family="JetBrains Mono">META ${kfmt(meta)}</text>`
    : ''

  return `
  <svg class="lib-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="lg-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#C5F82A" stop-opacity=".35"/>
        <stop offset="1" stop-color="#C5F82A" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${yticks}
    ${metaLine}
    <path d="${area}" fill="url(#lg-area)"/>
    <path d="${path('aportado')}" fill="none" stroke="#4A9EFF" stroke-width="1.5" stroke-dasharray="3 3" opacity=".7"/>
    <path d="${path('juros')}"    fill="none" stroke="#A78BFA" stroke-width="1.5" opacity=".75"/>
    <path d="${path('saldo')}"    fill="none" stroke="#C5F82A" stroke-width="2.2"/>
    ${xticks}
  </svg>`
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
        <div class="lib-ap-row">
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

  // Sliders
  root.querySelector('#sim-aporte')?.addEventListener('input', e => updateSim({ aporte: +e.target.value }))
  root.querySelector('#sim-taxa')  ?.addEventListener('input', e => updateSim({ taxa:   +e.target.value }))
  root.querySelector('#sim-meses') ?.addEventListener('input', e => updateSim({ meses:  +e.target.value }))
  root.querySelector('#sim-meta')  ?.addEventListener('change', e => { _sim.metaId = e.target.value; render() })

  root.querySelectorAll('.lib-qk').forEach(b =>
    b.addEventListener('click', () => updateSim({ aporte: +b.dataset.pmt })))

  // Delegação geral
  root.addEventListener('click', async e => {
    const aporte = e.target.closest('[data-aporte]')
    const sim    = e.target.closest('[data-sim]')
    const edit   = e.target.closest('[data-meta-edit]')
    const del    = e.target.closest('.lib-ap-del')

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
      if (!confirm('Excluir esse aporte?')) return
      const { error } = await db.from('aportes_fin').delete().eq('id', del.dataset.aid)
      if (error) return toast('Erro: ' + error.message, 'err')
      toast('Aporte removido')
      render()
      return
    }
  })
}

function updateSim(patch) {
  Object.assign(_sim, patch)
  const c = document.getElementById('content')
  const meta = _metas.find(m => m.id === _sim.metaId) || _metas.find(m => m.principal) || _metas[0]
  if (!meta) return

  // Atualiza textos dos sliders
  c.querySelectorAll('.lib-slider-v')[0].textContent = brl(_sim.aporte)
  c.querySelectorAll('.lib-slider-v')[1].textContent = _sim.taxa.toFixed(2) + '% a.a.'
  c.querySelectorAll('.lib-slider-v')[2].textContent = `${_sim.meses} meses (${(_sim.meses/12).toFixed(1)} anos)`

  // Re-renderiza chart
  const saldo = saldoMeta(meta)
  const alvo  = Number(meta.valor_alvo)
  const projecao = projetar({ pv: saldo, pmt: _sim.aporte, taxaAA: _sim.taxa, meses: _sim.meses })
  const final = projecao[projecao.length - 1]
  const totalAp = saldo + _sim.aporte * _sim.meses

  const chartHost = c.querySelector('.lib-sim-chart')
  if (chartHost) {
    const legend = chartHost.querySelector('.lib-chart-legend')
    chartHost.innerHTML = renderChart(projecao, alvo) + (legend ? legend.outerHTML : '')
  }

  // Re-renderiza stats (projeção + falta pra meta)
  const stats = c.querySelectorAll('#lib-stats .lib-stat-val')
  const subs  = c.querySelectorAll('#lib-stats .lib-stat-sub')
  if (stats[2]) { stats[2].textContent = brl(final.saldo); subs[2].textContent = 'Juros: ' + brl(final.saldo - totalAp) }
  const mAte = mesesAteMeta({ pv: saldo, pmt: _sim.aporte, taxaAA: _sim.taxa, meta: alvo })
  if (stats[3]) { stats[3].textContent = brl(Math.max(0, alvo - saldo)); subs[3].textContent = mAte != null ? `Bate em ${dataFutura(mAte)}` : 'Aumente o aporte' }
}

// ─────────────────────────── FORMS ──────────────────────────────────
function aporteForm({ metaId = null } = {}) {
  const hoje = new Date().toISOString().slice(0,10)
  const sug  = sugestaoAporteMensal()
  const metaIdPick = metaId || _metas.find(m => m.principal)?.id || _metas[0]?.id || ''

  openModal('Registrar aporte', `
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${_metas.map(m => `<option value="${m.id}"${m.id === metaIdPick ? ' selected' : ''}>${m.icone || '🎯'} ${escapeHtml(m.nome)}</option>`).join('')}
        <option value="">— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${sug || ''}">
      ${sug ? `<div class="lib-hint">Sugestão: ${brl(sug)} (${_cfg.aporte_pct_faturamento}% do faturamento médio)</div>` : ''}
    </div>
    <div class="fg"><label class="fl">Data</label>
      <input class="fi" type="date" id="ap-data" value="${hoje}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">
        <option value="manual">Manual</option>
        <option value="faturamento">Faturamento</option>
        <option value="bonus">Bônus / Extra</option>
        <option value="outro">Outro</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux">
    </div>
  `, `
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">Salvar aporte</button>
  `)
  document.getElementById('ap-cancel').addEventListener('click', closeModal)
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
    const { error } = await db.from('aportes_fin').insert(d)
    if (error) return toast('Erro: ' + error.message, 'err')
    closeModal(); toast('Aporte registrado 🚀')
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
