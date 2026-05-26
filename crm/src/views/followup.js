import { db, selectAll } from '../db.js'
import { toast, badge, tempBadge, openModal, closeModal, TEMPS } from '../utils.js'

const MSGS = {
  f1: 'Oi, tudo chegou aí? 😅',
  f2: 'Sei que o dia a dia é corrido. Me diz uma coisa rápida: o maior desafio do seu negócio hoje é captar mais leads ou converter os que já chegam?',
  f3: 'Oi {nome}, passando pra não sumir. Se ainda fizer sentido conversar, ótimo. Se não for o momento certo, sem problema também — é só me falar e a gente retoma quando você quiser. O que você prefere?',
  reng: 'Oi {nome}! Faz um tempo que não conversamos. Tava aqui e lembrei de você. Como tá o negócio? Ainda com os mesmos desafios ou mudou algo?',
  fim: 'Oi {nome}, vou deixar você à vontade por aqui. Se quiser conversar sobre como escalar seu negócio, pode me chamar quando quiser. Abraço! 👋',
}

function diffHoras(iso) {
  if (!iso) return 9999
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60)
}

function diffLabel(iso) {
  const h = diffHoras(iso)
  if (h < 1) return `${Math.round(h * 60)} min atrás`
  if (h < 24) return `${Math.round(h)}h atrás`
  const d = Math.floor(h / 24)
  return `${d} dia${d > 1 ? 's' : ''} atrás`
}

function alertColor(h) {
  if (h < 1)   return 'var(--ok)'
  if (h < 24)  return 'var(--warn)'
  return 'var(--danger)'
}

function nextAction(h) {
  if (h < 0.083) return { label: 'Aguardar 5 min',    urgencia: 'ok' }
  if (h < 1)     return { label: 'Follow-up 1 — enviar', urgencia: 'warn' }
  if (h < 24)    return { label: 'Follow-up 2 — enviar', urgencia: 'warn' }
  if (h < 48)    return { label: 'Follow-up 3 — urgente', urgencia: 'danger' }
  return { label: 'Reengajar agora', urgencia: 'danger' }
}

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  try {
    const { data, error } = await selectAll('clientes', { order: { column: 'atualizado_em', ascending: true } })
    if (error) throw new Error(error.message)

    const cl = data || []

    const hoje = new Date()

    // "Em pausa" que venceram voltam pra qualificado
    const pausaVencida = cl.filter(x =>
      x.status === 'em_pausa' && x.pausado_ate && new Date(x.pausado_ate) <= hoje
    )
    for (const lead of pausaVencida) {
      await db.from('clientes').update({ status: 'qualificado', pausado_ate: null, temperatura: 'frio', atualizado_em: hoje.toISOString() }).eq('id', lead.id)
      lead.status = 'qualificado'; lead.temperatura = 'frio'
    }

    // leads em aberto (excluindo pausados ativos e fechados/perdidos)
    const ativos = cl.filter(x =>
      ['novo', 'qualificado', 'proposta'].includes(x.status)
    )
    const pausados = cl.filter(x =>
      x.status === 'em_pausa' && x.pausado_ate && new Date(x.pausado_ate) > hoje
    )

    // separa por urgência
    const urgentes  = ativos.filter(x => diffHoras(x.atualizado_em) >= 24)
    const atencao   = ativos.filter(x => diffHoras(x.atualizado_em) >= 1 && diffHoras(x.atualizado_em) < 24)
    const ok        = ativos.filter(x => diffHoras(x.atualizado_em) < 1)

    const statHTML = `
      <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:22px">
        <div class="sc">
          <div class="sl">Em negociação</div>
          <div class="sv">${ativos.length}</div>
          <div class="ss">Leads ativos</div>
        </div>
        <div class="sc">
          <div class="sl" style="color:var(--danger)">Urgente</div>
          <div class="sv" style="color:var(--danger)">${urgentes.length}</div>
          <div class="ss">Sem resposta +24h</div>
        </div>
        <div class="sc">
          <div class="sl" style="color:var(--warn)">Atenção</div>
          <div class="sv" style="color:var(--warn)">${atencao.length}</div>
          <div class="ss">Sem resposta 1h–24h</div>
        </div>
        <div class="sc">
          <div class="sl">Em dia</div>
          <div class="sv" style="color:var(--ok)">${ok.length}</div>
          <div class="ss">Menos de 1h</div>
        </div>
      </div>`

    // sugestão de mensagem baseada na temperatura
    function msgSugerida(x) {
      const h = diffHoras(x.atualizado_em)
      const t = x.temperatura
      if (h < 1)   return MSGS.f1
      if (h < 24)  return t === 'quente' ? MSGS.f2 : MSGS.f2
      if (h < 48)  return t === 'morno'  ? MSGS.f3 : MSGS.f3
      return MSGS.reng
    }

    function abordagemSugerida(t) {
      const map = {
        quente: { txt: 'Feche a reunião agora — está engajado',   cor: '#ff6b35' },
        morno:  { txt: 'Entregue valor, não pressione',           cor: '#F5A623' },
        frio:   { txt: 'Follow-up leve, reabra o diálogo',       cor: '#4A9EFF' },
        gelado: { txt: 'Reengajamento — mude o ângulo de abordagem', cor: '#64748b' },
      }
      return map[t] || { txt: 'Defina a temperatura para ver sugestão', cor: 'var(--text-3)' }
    }

    function leadRow(x) {
      const h      = diffHoras(x.atualizado_em)
      const cor    = alertColor(h)
      const next   = nextAction(h)
      const wa     = x.whatsapp ? x.whatsapp.replace(/\D/g, '') : null
      const abord  = abordagemSugerida(x.temperatura)
      const msg    = msgSugerida(x)

      return `
        <tr data-id="${x.id}">
          <td>
            <div style="font-weight:500">${x.nome}</div>
            <div style="font-size:11px;color:var(--text-3)">${x.empresa || '—'}</div>
          </td>
          <td>${badge(x.status)}</td>
          <td>${tempBadge(x.temperatura) || '<span style="color:var(--text-3);font-size:11px">—</span>'}</td>
          <td>
            <div style="font-size:11px;color:${abord.cor};font-weight:500;max-width:160px;line-height:1.3">${abord.txt}</div>
          </td>
          <td>
            <span style="color:${cor};font-size:12px;font-weight:500">${diffLabel(x.atualizado_em)}</span>
          </td>
          <td>
            <span class="badge" style="background:rgba(255,255,255,.04);color:var(--${next.urgencia === 'ok' ? 'ok' : next.urgencia === 'warn' ? 'warn' : 'danger'});border:1px solid currentColor;padding:3px 9px;font-size:10px">
              ${next.label}
            </span>
          </td>
          <td style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            ${wa ? `
              <a href="https://wa.me/${wa}?text=${encodeURIComponent(msg.replace('{nome}', x.nome))}" target="_blank" class="btn bp bsm" style="text-decoration:none">WA →</a>` : ''}
            <button class="btn bg bsm mark-btn" data-id="${x.id}">Mover →</button>
            <button class="btn bg bsm pause-btn" data-id="${x.id}" data-nome="${x.nome}" title="Colocar em pausa">⏸</button>
          </td>
        </tr>`
    }

    function section(titulo, lista, corClass) {
      if (!lista.length) return ''
      return `
        <div class="tw" style="margin-bottom:18px">
          <div class="th" style="border-left:3px solid var(--${corClass})">
            <h3 style="color:var(--${corClass})">${titulo} <span style="font-weight:400;color:var(--text-3)">(${lista.length})</span></h3>
          </div>
          <table>
            <thead><tr><th>Lead</th><th>Status</th><th>Temp.</th><th>Abordagem</th><th>Último contato</th><th>Ação</th><th></th></tr></thead>
            <tbody>${lista.map(leadRow).join('')}</tbody>
          </table>
        </div>`
    }

    function pausadosSection() {
      if (!pausados.length) return ''
      return `
        <div class="tw" style="margin-bottom:18px;opacity:.7">
          <div class="th" style="border-left:3px solid #94a3b8">
            <h3 style="color:#94a3b8">⏸ Em pausa <span style="font-weight:400;color:var(--text-3)">(${pausados.length})</span></h3>
          </div>
          <table>
            <thead><tr><th>Lead</th><th>Temperatura</th><th>Retoma em</th><th></th></tr></thead>
            <tbody>
              ${pausados.map(x => `
                <tr>
                  <td class="tn">${x.nome}<div style="font-size:11px;color:var(--text-3)">${x.empresa||'—'}</div></td>
                  <td>${tempBadge(x.temperatura) || '—'}</td>
                  <td style="font-size:12px;color:var(--warn)">${x.pausado_ate ? new Date(x.pausado_ate).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>
                    <button class="btn bg bsm retomar-btn" data-id="${x.id}">Retomar agora</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`
    }

    // scripts de follow-up
    const scriptsHTML = `
      <div class="tw" style="margin-top:24px">
        <div class="th"><h3>Scripts prontos — copie e envie</h3></div>
        <div style="display:flex;flex-direction:column;gap:1px">
          ${Object.entries({
            '⏱️ 5 min': MSGS.f1,
            '⏱️ 1 hora': MSGS.f2,
            '📅 1 dia': MSGS.f3,
            '🔄 Reengajamento': MSGS.reng,
            '👋 Último toque': MSGS.fim,
          }).map(([label, msg]) => `
            <div style="padding:14px 18px;border-bottom:1px solid var(--line);display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
              <div>
                <div style="font-size:11px;font-weight:600;color:var(--text-3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.07em">${label}</div>
                <div style="font-size:13px;color:var(--text-2);line-height:1.5">${msg}</div>
              </div>
              <button class="btn bg bsm copy-btn" data-msg="${encodeURIComponent(msg)}" style="flex-shrink:0">Copiar</button>
            </div>`).join('')}
        </div>
      </div>`

    c.innerHTML = `
      ${statHTML}
      ${section('🔴 Urgente — follow-up imediato', urgentes, 'danger')}
      ${section('🟡 Atenção — verificar em breve', atencao, 'warn')}
      ${section('🟢 Em dia', ok, 'ok')}
      ${pausadosSection()}
      ${!ativos.length && !pausados.length ? '<div class="empty">Nenhum lead em negociação.</div>' : ''}
      ${scriptsHTML}`

    // eventos
    // pause modal
    c.querySelectorAll('.pause-btn').forEach(btn => {
      btn.addEventListener('click', () => pausarLead(btn.dataset.id, btn.dataset.nome, cl))
    })

    // retomar
    c.querySelectorAll('.retomar-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await db.from('clientes').update({ status: 'qualificado', pausado_ate: null, atualizado_em: new Date().toISOString() }).eq('id', btn.dataset.id)
        toast('Lead retomado.')
        render()
      })
    })

    c.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = decodeURIComponent(btn.dataset.msg)
        navigator.clipboard.writeText(msg).then(() => {
          btn.textContent = 'Copiado!'
          setTimeout(() => { btn.textContent = 'Copiar' }, 2000)
        })
      })
    })

    c.querySelectorAll('.mark-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const statuses = ['novo', 'qualificado', 'proposta', 'ativo', 'fechado', 'perdido']
        const lead = cl.find(x => x.id === btn.dataset.id)
        if (!lead) return
        const cur = statuses.indexOf(lead.status)
        const next = statuses[Math.min(cur + 1, statuses.length - 1)]
        const { error } = await db.from('clientes').update({ status: next, atualizado_em: new Date().toISOString() }).eq('id', btn.dataset.id)
        if (error) { toast('Erro.', 'er'); return }
        toast(`${lead.nome} → ${next}`)
        render()
      })
    })

  } catch (err) {
    c.innerHTML = `<div class="empty">Erro: ${err.message}</div>`
  }
}

function pausarLead(id, nome, cl) {
  const lead = cl.find(x => x.id === id)
  const min = new Date(); min.setDate(min.getDate() + 1)
  const tempOpts = `<option value="">— manter atual —</option>` + TEMPS.map(t => {
    const icons = { quente:'🔥 Quente', morno:'🌡️ Morno', frio:'❄️ Frio', gelado:'🧊 Gelado' }
    return `<option value="${t}"${lead?.temperatura === t ? ' selected' : ''}>${icons[t]}</option>`
  }).join('')

  openModal(
    `Pausar ${nome}`,
    `<div style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:16px">
      A pessoa disse que <strong style="color:var(--text)">não é o momento</strong>.<br>
      Defina quando retomar o contato — o follow-up automático ficará suspenso até lá.
    </div>
    <div class="fg" style="margin-bottom:14px">
      <label class="fl">Retomar contato em</label>
      <input class="fi" id="pause-date" type="date" value="${min.toISOString().slice(0,10)}" min="${min.toISOString().slice(0,10)}">
    </div>
    <div class="fg" style="margin-bottom:14px">
      <label class="fl">Temperatura atual da conversa</label>
      <select class="fsl" id="pause-temp">${tempOpts}</select>
    </div>
    <div class="fg">
      <label class="fl">Motivo / observação</label>
      <textarea class="fta" id="pause-obs" placeholder="Ex: Disse que volta em julho após fechar o trimestre">${lead?.observacoes||''}</textarea>
    </div>`,
    `<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Pausar lead</button>`
  )
  document.getElementById('m-cancel').addEventListener('click', closeModal)
  document.getElementById('m-save').addEventListener('click', async () => {
    const pausado_ate  = new Date(document.getElementById('pause-date').value).toISOString()
    const temperatura  = document.getElementById('pause-temp').value || lead?.temperatura
    const observacoes  = document.getElementById('pause-obs').value.trim()
    const { error } = await db.from('clientes').update({
      status: 'em_pausa', pausado_ate, temperatura, observacoes,
      atualizado_em: new Date().toISOString()
    }).eq('id', id)
    if (error) { toast('Erro.', 'er'); return }
    toast(`${nome} pausado — retoma em ${new Date(pausado_ate).toLocaleDateString('pt-BR')}`)
    closeModal()
    render()
  })
}
