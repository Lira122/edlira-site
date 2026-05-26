import { db, selectAll } from '../db.js'
import { brl } from '../utils.js'

const ETAPAS = [
  { k: 'novo',        l: 'Novo lead',    cor: '#4A9EFF', desc: 'Acabou de entrar' },
  { k: 'qualificado', l: 'Qualificado',  cor: '#F5A623', desc: 'Situação e problema mapeados' },
  { k: 'proposta',    l: 'Proposta',     cor: '#A78BFA', desc: 'Reunião agendada / proposta enviada' },
  { k: 'ativo',       l: 'Cliente ativo',cor: '#C5F82A', desc: 'Fechou e está em andamento' },
  { k: 'fechado',     l: 'Encerrado',    cor: '#34D399', desc: 'Contrato finalizado' },
  { k: 'perdido',     l: 'Perdido',      cor: '#FF5C5C', desc: 'Não avançou' },
]

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  try {
    const { data, error } = await selectAll('clientes')
    if (error) throw new Error(error.message)

    const cl = data || []
    const total = cl.length
    if (!total) {
      c.innerHTML = '<div class="empty">Nenhum lead cadastrado ainda.</div>'
      return
    }

    // contagem por etapa
    const counts = {}
    const valores = {}
    ETAPAS.forEach(e => {
      counts[e.k]  = cl.filter(x => x.status === e.k).length
      valores[e.k] = cl.filter(x => x.status === e.k).reduce((s, x) => s + Number(x.valor || 0), 0)
    })

    // só as etapas do funil de conversão (sem perdido)
    const funil = ETAPAS.filter(e => e.k !== 'perdido')
    const maxCount = Math.max(...funil.map(e => counts[e.k]), 1)

    // taxa de conversão entre etapas
    function taxa(de, para) {
      if (!counts[de]) return null
      return Math.round((counts[para] / counts[de]) * 100)
    }

    // MRR potencial (ativos) e potencial de negócio (qualificados + proposta)
    const mrr       = valores['ativo']
    const pipeline  = valores['qualificado'] + valores['proposta']
    const perdidos  = counts['perdido']
    const convFinal = total ? Math.round((counts['ativo'] + counts['fechado']) / total * 100) : 0

    // ── HTML ─────────────────────────────────────────
    const statsHTML = `
      <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:28px">
        <div class="sc">
          <div class="sl">Total de leads</div>
          <div class="sv">${total}</div>
          <div class="ss">Na base completa</div>
        </div>
        <div class="sc">
          <div class="sl">Em negociação</div>
          <div class="sv" style="color:#A78BFA">${counts['qualificado'] + counts['proposta']}</div>
          <div class="ss">${brl(pipeline)} em aberto</div>
        </div>
        <div class="sc">
          <div class="sl">MRR (ativos)</div>
          <div class="sv ac">${brl(mrr)}</div>
          <div class="ss">${counts['ativo']} cliente(s)</div>
        </div>
        <div class="sc">
          <div class="sl">Conversão geral</div>
          <div class="sv" style="color:${convFinal > 20 ? 'var(--ok)' : convFinal > 10 ? 'var(--warn)' : 'var(--danger)'}">${convFinal}%</div>
          <div class="ss">${perdidos} lead(s) perdido(s)</div>
        </div>
      </div>`

    const funilHTML = funil.map((etapa, i) => {
      const count  = counts[etapa.k]
      const valor  = valores[etapa.k]
      const pct    = total ? Math.round(count / total * 100) : 0
      const largura = count === 0 ? 12 : Math.max(18, Math.round((count / maxCount) * 100))

      const convHTML = i > 0
        ? (() => {
            const t = taxa(funil[i - 1].k, etapa.k)
            if (t === null) return ''
            const cor = t >= 50 ? 'var(--ok)' : t >= 25 ? 'var(--warn)' : 'var(--danger)'
            return `<div class="fn-conv" style="color:${cor}">↓ ${t}% converteram</div>`
          })()
        : ''

      return `
        ${convHTML}
        <div class="fn-stage">
          <div class="fn-bar-wrap">
            <div class="fn-bar" style="width:${largura}%;background:${etapa.cor}22;border:1px solid ${etapa.cor}44;border-left:3px solid ${etapa.cor}">
              <div class="fn-bar-inner">
                <div class="fn-stage-left">
                  <span class="fn-label" style="color:${etapa.cor}">${etapa.l}</span>
                  <span class="fn-desc">${etapa.desc}</span>
                </div>
                <div class="fn-stage-right">
                  <span class="fn-count">${count}</span>
                  <span class="fn-pct">${pct}% do total</span>
                </div>
              </div>
            </div>
            <div class="fn-valor">${valor > 0 ? brl(valor) : ''}</div>
          </div>
        </div>`
    }).join('')

    const perdidosHTML = `
      <div class="fn-conv" style="color:var(--danger)">↓ ${taxa('novo', 'perdido') ?? 0}% foram perdidos</div>
      <div class="fn-stage">
        <div class="fn-bar-wrap">
          <div class="fn-bar" style="width:${Math.max(8, Math.round(counts['perdido'] / maxCount * 100))}%;background:rgba(255,92,92,.08);border:1px solid rgba(255,92,92,.2);border-left:3px solid #FF5C5C;opacity:.6">
            <div class="fn-bar-inner">
              <div class="fn-stage-left">
                <span class="fn-label" style="color:#FF5C5C">Perdidos</span>
                <span class="fn-desc">Não avançaram no funil</span>
              </div>
              <div class="fn-stage-right">
                <span class="fn-count">${counts['perdido']}</span>
                <span class="fn-pct">${total ? Math.round(counts['perdido']/total*100) : 0}% do total</span>
              </div>
            </div>
          </div>
        </div>
      </div>`

    // detalhes por etapa
    const detalheHTML = ETAPAS.filter(e => counts[e.k] > 0).map(etapa => {
      const leads = cl.filter(x => x.status === etapa.k).slice(0, 5)
      return `
        <div class="fn-detail">
          <div class="fn-detail-head" style="border-left:3px solid ${etapa.cor}">
            <span style="color:${etapa.cor};font-weight:600;font-size:13px">${etapa.l}</span>
            <span style="font-size:11px;color:var(--text-3)">${counts[etapa.k]} lead(s)</span>
          </div>
          ${leads.map(x => `
            <div class="fn-detail-row">
              <span class="fn-detail-nome">${x.nome}</span>
              <span class="fn-detail-val">${x.valor ? brl(x.valor) : '—'}</span>
            </div>`).join('')}
          ${counts[etapa.k] > 5 ? `<div style="font-size:11px;color:var(--text-3);padding:6px 14px">+${counts[etapa.k]-5} mais...</div>` : ''}
        </div>`
    }).join('')

    c.innerHTML = `
      ${statsHTML}
      <div style="display:grid;grid-template-columns:1fr 320px;gap:18px;align-items:start">
        <div class="tw" style="padding:22px">
          <div style="font-size:13px;font-weight:600;margin-bottom:20px">Funil de vendas</div>
          <div class="fn-funil">${funilHTML}${perdidosHTML}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${detalheHTML}
        </div>
      </div>`

  } catch (err) {
    c.innerHTML = `<div class="empty">Erro: ${err.message}</div>`
  }
}
