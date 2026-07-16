// ═══════════════════════════════════════════════════════════════════
// BOM DIA — briefing matinal do CRM
// Feito pra abrir logo depois do café. Em 10 segundos você vê:
//  - o que precisa resolver AGORA (leads esperando, tarefas vencidas)
//  - pulso financeiro (fat mês, aporte, sobra prevista)
//  - prospecção (pool, disparos hoje, novos leads)
//  - wins de ontem (fechamentos, aportes, atingimento)
//  - top 3 pra hoje (foco do dia)
// ═══════════════════════════════════════════════════════════════════
import { db, selectAll } from '../db.js'
import { brl, fmtd, MES, MESF } from '../utils.js'
import { go } from '../main.js'

const FRASES = [
  'quem madruga, tem cliente antes das 10.',
  'meta grande não se resolve num dia — se resolve TODO dia.',
  'aporte pequeno, todo mês, > aporte grande esporádico.',
  'o dia de hoje é o único que você tem controle real.',
  'lead quente esfria em 4h. bora responder.',
  'faturamento não paga a Liberdade, aporte paga.',
  'ninguém acorda R$100k mais rico. você acorda R$500 mais rico, 200 vezes.',
  'foco no processo. resultado é consequência.',
]

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Preparando seu briefing...</div>'

  try {
    const now = new Date()
    const hora = now.getHours()
    const hojeBR   = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now)
    const ontemDate = new Date(now); ontemDate.setDate(ontemDate.getDate() - 1)
    const ontemBR   = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(ontemDate)
    const ymAtual  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

    // ── Puxa TUDO em paralelo ──────────────────────────────────
    const [
      { data: clientes },
      { data: fats },
      { data: tarefas },
      { data: metas },
      { data: aportes },
      { data: planos },
      { data: eventos },
      { count: poolCount },
      { count: disparosHoje },
      { count: novosLeads24h },
    ] = await Promise.all([
      selectAll('clientes'),
      db.from('faturamento').select('*'),
      db.from('tarefas').select('*').is('feito_em', null).order('prazo', { ascending: true }).limit(30),
      db.from('metas_fin').select('*').eq('status', 'ativa'),
      db.from('aportes_fin').select('*').gte('data', ymAtual + '-01').order('data', { ascending: false }),
      db.from('planos_fin').select('*').eq('ativo', true),
      db.from('agenda_eventos').select('*').gte('inicio', hojeBR).order('inicio').limit(10),
      db.from('clientes').select('*', { count: 'exact', head: true }).eq('status', 'prospeccao').not('whatsapp', 'is', null),
      db.from('chatbot_conversations').select('*', { count: 'exact', head: true })
        .eq('lead_data->>origem', 'disparo_prospeccao')
        .eq('lead_data->>disparo_dia', hojeBR),
      db.from('chatbot_conversations').select('*', { count: 'exact', head: true })
        .gte('created_at', ontemBR + 'T00:00:00'),
    ])

    // ── AÇÃO NECESSÁRIA AGORA ──────────────────────────────────
    // Leads "esperando resposta" = status novo/qualificado/proposta atualizados > 4h atrás
    const leadsQuentes = (clientes || [])
      .filter(c => ['novo','qualificado','proposta'].includes(c.status))
      .filter(c => {
        const atu = new Date(c.atualizado_em || c.criado_em)
        return (Date.now() - atu.getTime()) > 4 * 3600 * 1000
      })
      .sort((a,b) => (a.temperatura === 'quente' ? -1 : 1))
      .slice(0, 5)

    // Tarefas vencidas
    const vencidas = (tarefas || [])
      .filter(t => t.prazo && t.prazo < hojeBR)
      .slice(0, 5)

    // Reuniões próximas 24h
    const reunioes24h = (eventos || []).filter(e => {
      const dt = new Date(e.inicio)
      return dt >= now && dt <= new Date(now.getTime() + 24*3600*1000)
    })

    // ── PULSO FINANCEIRO ───────────────────────────────────────
    const fatMes = (fats || []).filter(f => f.mes === now.getMonth()+1 && f.ano === now.getFullYear())
                                 .reduce((s,f) => s + Number(f.valor||0), 0)
    // Média últimos 6 meses (como referência)
    let fat6m = 0, m6nz = 0
    for (let k = 1; k <= 6; k++) {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1)
      const v = (fats || []).filter(f => f.mes === d.getMonth()+1 && f.ano === d.getFullYear())
                              .reduce((s,f) => s + Number(f.valor||0), 0)
      if (v > 0) { fat6m += v; m6nz++ }
    }
    const fatMedio = m6nz ? fat6m/m6nz : 0
    const fatDelta = fatMedio > 0 ? Math.round((fatMes/fatMedio - 1) * 100) : 0

    // Aporte mês vs esperado do plano principal
    const metaPrincipal = (metas || []).find(m => m.principal) || (metas || [])[0]
    const planoAtivo    = metaPrincipal ? (planos || []).find(p => p.meta_id === metaPrincipal.id) : null
    const aporteMesReg  = (aportes || []).reduce((s,a) => s + Number(a.valor||0), 0)
    let aporteEsperado = 0
    if (planoAtivo) {
      // Fase corrente
      const criado = new Date(planoAtivo.criado_em)
      const m = (now.getFullYear() - criado.getFullYear()) * 12 + (now.getMonth() - criado.getMonth())
      const fases = planoAtivo.fases || []
      const ord = [...fases].sort((a,b) => a.inicio - b.inicio)
      for (const f of ord) if (f.inicio <= m) aporteEsperado = Number(f.aporte) || 0
    }
    const aderencia = aporteEsperado > 0 ? Math.round((aporteMesReg/aporteEsperado) * 100) : (aporteMesReg > 0 ? 100 : 0)

    // ── WINS DE ONTEM ──────────────────────────────────────────
    const fechamentosOntem = (clientes || []).filter(c => {
      if (c.status !== 'fechado' && c.status !== 'ativo') return false
      const atu = (c.atualizado_em || '').slice(0,10)
      return atu === ontemBR
    })
    const aportesOntem = (aportes || []).filter(a => a.data === ontemBR)
    const novosOntem   = (clientes || []).filter(c => (c.criado_em || '').slice(0,10) === ontemBR)

    // ── TOP 3 FOCO HOJE ────────────────────────────────────────
    const hojeTop3 = (tarefas || [])
      .filter(t => t.prazo && (t.prazo === hojeBR || (t.prioridade === 'alta')))
      .slice(0, 3)
    const evHoje = (eventos || []).filter(e => (e.inicio || '').startsWith(hojeBR))

    const saudacao = hora < 6 ? 'Boa madrugada' : hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
    const frase   = FRASES[Math.floor((now.getDate()) % FRASES.length)]

    // ═════════════════ RENDER ═════════════════════════════════
    c.innerHTML = `
    <div class="bd">
      <!-- HERO -->
      <div class="bd-hero">
        <div class="bd-hero-left">
          <div class="bd-hero-hi">${saudacao}, Lira ☕</div>
          <div class="bd-hero-date">${diaSemana(now)}, ${now.getDate()} de ${MESF[now.getMonth()].toLowerCase()}</div>
          <div class="bd-hero-frase">"${frase}"</div>
        </div>
        <div class="bd-hero-right">
          <div class="bd-hero-metric">
            <div class="bd-hero-metric-lbl">${planoAtivo ? 'Aderência ao plano' : 'Aportado no mês'}</div>
            <div class="bd-hero-metric-val ${aderencia >= 100 ? 'ok' : aderencia >= 70 ? 'warn' : 'late'}">${planoAtivo ? aderencia + '%' : brl(aporteMesReg)}</div>
            ${planoAtivo ? `<div class="bd-hero-metric-sub">${brl(aporteMesReg)} de ${brl(aporteEsperado)}</div>` : ''}
          </div>
        </div>
      </div>

      <!-- AÇÃO NECESSÁRIA -->
      ${renderAcoes({ leadsQuentes, vencidas, reunioes24h })}

      <!-- PULSO -->
      <div class="bd-block">
        <div class="bd-block-tit">📊 Pulso do dia</div>
        <div class="bd-pulso">
          ${cardPulso('Faturamento mês', brl(fatMes), fatDelta !== 0 ? `${fatDelta > 0 ? '+' : ''}${fatDelta}% vs média 6m` : `média 6m ${brl(fatMedio)}`, fatDelta >= 0 ? 'ok' : 'warn', () => 'go(\'faturamento\')')}
          ${cardPulso('Prospecção pool', poolCount || 0, `${disparosHoje || 0} disparados hoje`, (poolCount || 0) > 20 ? 'ok' : 'warn', () => 'go(\'prospeccao\')')}
          ${cardPulso('Leads novos 24h', novosLeads24h || 0, novosLeads24h > 0 ? 'respostas chegando 🔥' : 'sem tração ainda hoje', novosLeads24h > 0 ? 'ok' : 'muted')}
          ${cardPulso('Reuniões hoje', evHoje.length, evHoje.length > 0 ? evHoje.map(e => hhmm(e.inicio)).join(' · ') : 'agenda livre', evHoje.length > 0 ? 'ok' : 'muted', () => 'go(\'agenda\')')}
        </div>
      </div>

      <!-- WINS DE ONTEM -->
      ${(fechamentosOntem.length + aportesOntem.length + novosOntem.length) > 0 ? `
      <div class="bd-block">
        <div class="bd-block-tit">🔥 Wins de ontem</div>
        <div class="bd-wins">
          ${fechamentosOntem.length ? `<div class="bd-win"><div class="bd-win-ico">💼</div><div><div class="bd-win-v">${fechamentosOntem.length}</div><div class="bd-win-l">cliente${fechamentosOntem.length===1?'':'s'} fechado${fechamentosOntem.length===1?'':'s'}</div></div></div>` : ''}
          ${aportesOntem.length ? `<div class="bd-win"><div class="bd-win-ico">💰</div><div><div class="bd-win-v">${brl(aportesOntem.reduce((s,a)=>s+Number(a.valor),0))}</div><div class="bd-win-l">aportado</div></div></div>` : ''}
          ${novosOntem.length ? `<div class="bd-win"><div class="bd-win-ico">🌱</div><div><div class="bd-win-v">${novosOntem.length}</div><div class="bd-win-l">novo${novosOntem.length===1?'':'s'} lead${novosOntem.length===1?'':'s'}</div></div></div>` : ''}
        </div>
      </div>` : ''}

      <!-- TOP 3 FOCO -->
      ${hojeTop3.length ? `
      <div class="bd-block">
        <div class="bd-block-tit">⭐ Top ${hojeTop3.length} pra hoje</div>
        <div class="bd-focus">
          ${hojeTop3.map((t,i) => `
            <div class="bd-focus-row" data-go="projetos">
              <div class="bd-focus-num">${i+1}</div>
              <div class="bd-focus-body">
                <div class="bd-focus-tit">${escapeHtml(t.titulo || t.descricao || '(sem título)')}</div>
                <div class="bd-focus-sub">${t.prazo ? `prazo: ${fmtd(t.prazo)}` : ''} ${t.prioridade === 'alta' ? '· 🔴 alta' : ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>` : `<div class="bd-block">
        <div class="bd-block-tit">⭐ Foco de hoje</div>
        <div class="bd-empty">Sem tarefas pra hoje. <span class="bd-link" data-go="projetos">Adicione uma</span> ou vá pra prospecção.</div>
      </div>`}

    </div>`

    // Wire clicks — delegação simples
    c.addEventListener('click', e => {
      const goEl = e.target.closest('[data-go]')
      if (goEl) go(goEl.dataset.go)
    })

  } catch (err) {
    console.error('[bomdia]', err)
    c.innerHTML = `<div class="empty" style="padding:40px">Erro carregando briefing: ${err.message}</div>`
  }
}

// ─────────────── helpers de render ─────────────────────────────
function renderAcoes({ leadsQuentes, vencidas, reunioes24h }) {
  const total = leadsQuentes.length + vencidas.length + reunioes24h.length
  if (!total) return `<div class="bd-clean">
    <div class="bd-clean-ico">✨</div>
    <div class="bd-clean-tit">Tudo em dia</div>
    <div class="bd-clean-sub">Nenhum lead esperando, nenhuma tarefa vencida, nenhuma reunião nas próximas 24h.<br>Bom momento pra atacar prospecção ou trabalhar num projeto profundo.</div>
  </div>`

  return `<div class="bd-acoes">
    <div class="bd-acoes-head">
      <div class="bd-acoes-tit">⚡ Resolver AGORA</div>
      <div class="bd-acoes-count">${total} item${total===1?'':'s'}</div>
    </div>
    <div class="bd-acoes-list">
      ${leadsQuentes.map(l => {
        const atu = new Date(l.atualizado_em || l.criado_em)
        const h = Math.floor((Date.now() - atu.getTime()) / 3600000)
        return `<div class="bd-acao" data-go="pipeline">
          <div class="bd-acao-ico q">💬</div>
          <div class="bd-acao-body">
            <div class="bd-acao-tit">${escapeHtml(l.nome || l.empresa || '(lead)')}${l.temperatura === 'quente' ? ' 🔥' : ''}</div>
            <div class="bd-acao-sub">esperando resposta há ${h}h · ${l.status}</div>
          </div>
          <div class="bd-acao-cta">→</div>
        </div>`
      }).join('')}
      ${vencidas.map(t => {
        const diasAtraso = Math.max(1, Math.floor((Date.now() - new Date(t.prazo).getTime()) / 86400000))
        return `<div class="bd-acao" data-go="projetos">
          <div class="bd-acao-ico l">📌</div>
          <div class="bd-acao-body">
            <div class="bd-acao-tit">${escapeHtml(t.titulo || t.descricao || '(tarefa)')}</div>
            <div class="bd-acao-sub">${diasAtraso}d atrasada · prazo ${fmtd(t.prazo)}</div>
          </div>
          <div class="bd-acao-cta">→</div>
        </div>`
      }).join('')}
      ${reunioes24h.map(e => {
        const dt = new Date(e.inicio)
        const minsAte = Math.round((dt.getTime() - Date.now()) / 60000)
        const tempo = minsAte < 60 ? `em ${minsAte}min` : minsAte < 1440 ? `em ${Math.floor(minsAte/60)}h` : `amanhã ${hhmm(e.inicio)}`
        return `<div class="bd-acao" data-go="agenda">
          <div class="bd-acao-ico r">📅</div>
          <div class="bd-acao-body">
            <div class="bd-acao-tit">${escapeHtml(e.titulo || 'Reunião')}</div>
            <div class="bd-acao-sub">${tempo} · ${dt.toLocaleDateString('pt-BR')} ${hhmm(e.inicio)}</div>
          </div>
          <div class="bd-acao-cta">→</div>
        </div>`
      }).join('')}
    </div>
  </div>`
}

function cardPulso(lbl, val, sub, tone, dataGo) {
  const to = dataGo ? dataGo() : ''
  const goAttr = to ? `data-${to.match(/'([^']+)'/)[1] ? 'go="' + to.match(/'([^']+)'/)[1] + '"' : ''}` : ''
  return `<div class="bd-p ${tone}" ${goAttr}>
    <div class="bd-p-lbl">${lbl}</div>
    <div class="bd-p-val">${val}</div>
    <div class="bd-p-sub">${sub}</div>
  </div>`
}

function diaSemana(d) {
  const dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']
  return dias[d.getDay()]
}
function hhmm(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))
}
