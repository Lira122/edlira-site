// ═══════════════════════════════════════════════════════════════════
// CAIXINHAS — envelope budgeting mensal
// Cada caixinha tem um valor mensal alocado. Tipo 'gasto' zera todo
// mês (gasolina, mercado), tipo 'reserva' acumula (emergência).
//
// Tabelas: caixinhas, caixinhas_mov
// Schema: supabase/caixinhas.sql
// ═══════════════════════════════════════════════════════════════════
import { db } from '../db.js'
import { brl, toast, openModal, closeModal, fmtd, MES, MESF } from '../utils.js'

let _cxs  = []
let _movs = []
let _mes  = new Date().getMonth() + 1
let _ano  = new Date().getFullYear()

const CORES   = ['#4A9EFF','#F5A623','#EC4899','#34D399','#A78BFA','#FF6B35','#06B6D4','#C5F82A']
const ICONES  = ['⛽','🚗','🏠','🛒','🍔','💊','🎬','📱','✈️','🎁','🏥','💼','🐾','🎓','🆘','💰']

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando…</div>'

  await loadAll()
  c.innerHTML = render_layout()
  wire(c)
}

async function loadAll() {
  const [cxRes, mvRes] = await Promise.all([
    db.from('caixinhas').select('*').eq('ativa', true).order('ordem'),
    db.from('caixinhas_mov').select('*').order('data', { ascending: false }),
  ])
  if (cxRes.error) toast('caixinhas: ' + cxRes.error.message, 'err')
  if (mvRes.error) toast('caixinhas_mov: ' + mvRes.error.message, 'err')
  _cxs  = cxRes.data || []
  _movs = mvRes.data || []
}

// ───────────────────────── Cálculos ─────────────────────────────────
// Saldo no mês selecionado:
//   gasto:   valor_mensal - sum(movs do mês)
//   reserva: sum(valor_mensal de cada mês desde criação) - sum(movs total)
function saldoMes(cx, mes, ano) {
  const mStr = `${ano}-${String(mes).padStart(2,'0')}`
  const usadoMes = _movs
    .filter(m => m.caixinha_id === cx.id && (m.data || '').startsWith(mStr))
    .reduce((s, m) => s + Number(m.valor || 0), 0)

  if (cx.tipo === 'gasto') {
    return {
      alocado: Number(cx.valor_mensal),
      usado:   usadoMes,
      saldo:   Number(cx.valor_mensal) - usadoMes,
      tipo:    'gasto',
    }
  }
  // reserva: acumula valor_mensal de cada mês desde criado_em
  const inicio = new Date(cx.criado_em || new Date())
  const fim    = new Date(ano, mes - 1, 1)
  let meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth()) + 1
  if (meses < 1) meses = 1
  const alocadoAcum = Number(cx.valor_mensal) * meses
  const usadoTotal  = _movs
    .filter(m => m.caixinha_id === cx.id)
    .reduce((s, m) => s + Number(m.valor || 0), 0)
  return {
    alocado: alocadoAcum,
    usado:   usadoTotal,
    saldo:   alocadoAcum - usadoTotal,
    tipo:    'reserva',
    meses,
  }
}

function totalAlocadoMes() {
  // soma valor_mensal de todas (gasto = aloca, reserva = aloca também)
  return _cxs.reduce((s, c) => s + Number(c.valor_mensal || 0), 0)
}

// ───────────────────────── LAYOUT ───────────────────────────────────
function render_layout() {
  const totMensal = totalAlocadoMes()
  const totUsado  = _cxs.reduce((s, c) => s + saldoMes(c, _mes, _ano).usado, 0)
  const totSaldo  = _cxs.reduce((s, c) => {
    const sm = saldoMes(c, _mes, _ano)
    return s + (c.tipo === 'gasto' ? sm.saldo : sm.saldo)
  }, 0)

  const isHoje = _mes === new Date().getMonth() + 1 && _ano === new Date().getFullYear()
  const pickerHTML = `
    <div class="cx-picker">
      <button class="btn bg bsm" id="cx-prev">◀</button>
      <select class="fsl" id="cx-mes">${MESF.map((m,i)=>`<option value="${i+1}"${i+1===_mes?' selected':''}>${m}</option>`).join('')}</select>
      <input class="fi" type="number" id="cx-ano" value="${_ano}" style="width:90px;text-align:center;padding:6px 9px">
      <button class="btn bg bsm" id="cx-next">▶</button>
      ${!isHoje ? `<button class="btn bg bsm" id="cx-hoje">Voltar pra hoje</button>` : ''}
    </div>`

  return `
  <div class="cx">
    ${pickerHTML}

    <!-- Resumo do mês -->
    <div class="cx-resumo">
      <div class="cx-resumo-card">
        <div class="cx-resumo-lbl">Alocado / mês</div>
        <div class="cx-resumo-val">${brl(totMensal)}</div>
        <div class="cx-resumo-sub">${_cxs.length} caixinha${_cxs.length===1?'':'s'} ativa${_cxs.length===1?'':'s'}</div>
      </div>
      <div class="cx-resumo-card">
        <div class="cx-resumo-lbl">Usado neste mês</div>
        <div class="cx-resumo-val" style="color:var(--danger)">${brl(totUsado)}</div>
        <div class="cx-resumo-sub">${totMensal > 0 ? Math.round(totUsado/totMensal*100) : 0}% do alocado</div>
      </div>
      <div class="cx-resumo-card">
        <div class="cx-resumo-lbl">Disponível agora</div>
        <div class="cx-resumo-val" style="color:${totSaldo>=0?'#34D399':'var(--danger)'}">${brl(totSaldo)}</div>
        <div class="cx-resumo-sub">soma de todas as caixinhas</div>
      </div>
    </div>

    <!-- Grid de caixinhas -->
    <div class="cx-grid">
      ${_cxs.map(renderCaixinha).join('')}
      <div class="cx-card cx-card-add" id="cx-add">
        <div class="cx-add-icon">＋</div>
        <div class="cx-add-lbl">Nova caixinha</div>
        <div class="cx-add-sub">Gasolina, mercado, emergência…</div>
      </div>
    </div>

    <!-- Histórico do mês -->
    <div class="cx-block">
      <div class="cx-block-head">
        <h3>Movimentações de ${MESF[_mes-1]}/${_ano}</h3>
        <button class="btn bp bsm" id="cx-add-mov">+ Registrar gasto</button>
      </div>
      ${renderMovs()}
    </div>
  </div>`
}

function renderCaixinha(cx) {
  const sm  = saldoMes(cx, _mes, _ano)
  const pct = sm.alocado > 0 ? Math.min(100, sm.usado / sm.alocado * 100) : 0
  const alerta = pct >= 100 ? 'over' : (pct >= 80 ? 'warn' : 'ok')
  const cor   = cx.cor || '#4A9EFF'

  return `
  <div class="cx-card ${alerta}" style="--cx-color:${cor}" data-cxid="${cx.id}">
    <div class="cx-top">
      <div class="cx-ico" style="background:${hexA(cor,.14)};color:${cor}">${cx.icone || '💰'}</div>
      <div class="cx-name-box">
        <div class="cx-name">${escapeHtml(cx.nome)}</div>
        <div class="cx-type">${cx.tipo === 'reserva' ? 'reserva acumulada' : 'gasto mensal'}</div>
      </div>
      <button class="cx-menu" data-cx-edit="${cx.id}">⋯</button>
    </div>

    <div class="cx-saldo">
      <div class="cx-saldo-val" style="color:${sm.saldo>=0?'var(--text)':'var(--danger)'}">${brl(sm.saldo)}</div>
      <div class="cx-saldo-lbl">disponível</div>
    </div>

    <div class="cx-bar">
      <div class="cx-bar-fill" style="width:${pct.toFixed(1)}%;background:${pct>=100?'var(--danger)':cor}"></div>
    </div>
    <div class="cx-bar-info">
      <span>${brl(sm.usado)} usado</span>
      <span>${brl(sm.alocado)} ${cx.tipo === 'reserva' ? `(${sm.meses}m)` : '/ mês'}</span>
    </div>

    <div class="cx-acts">
      <button class="btn bp bsm" data-cx-mov="${cx.id}">− Gasto</button>
      <button class="btn bg bsm" data-cx-ext="${cx.id}">Histórico</button>
    </div>
  </div>`
}

function renderMovs() {
  const mStr = `${_ano}-${String(_mes).padStart(2,'0')}`
  const list = _movs.filter(m => (m.data || '').startsWith(mStr))
  if (!list.length) {
    return `<div class="empty" style="padding:30px;text-align:center;color:var(--text-3)">Nenhuma movimentação neste mês.</div>`
  }
  return `
  <div class="cx-mov-list">
    ${list.map(m => {
      const cx = _cxs.find(x => x.id === m.caixinha_id)
      const cor = cx?.cor || '#4A9EFF'
      const eh_devolucao = Number(m.valor) < 0
      return `
      <div class="cx-mov-row">
        <div class="cx-mov-data">${fmtd(m.data)}</div>
        <div class="cx-mov-cx">
          ${cx
            ? `<span class="cx-mov-tag" style="background:${hexA(cor,.15)};color:${cor}">${cx.icone||'💰'} ${escapeHtml(cx.nome)}</span>`
            : `<span class="cx-mov-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">caixinha excluída</span>`}
        </div>
        <div class="cx-mov-desc">${escapeHtml(m.descricao || '—')}</div>
        <div class="cx-mov-val" style="color:${eh_devolucao?'#34D399':'var(--danger)'}">${eh_devolucao ? '+' : '−'}${brl(Math.abs(Number(m.valor)))}</div>
        <button class="cx-mov-del" data-mov-del="${m.id}" title="Excluir">×</button>
      </div>`
    }).join('')}
  </div>`
}

// ─────────────────────── INTERAÇÃO ──────────────────────────────────
function wire(root) {
  // Picker
  root.querySelector('#cx-prev')?.addEventListener('click', () => goto(_mes === 1 ? 12 : _mes - 1, _mes === 1 ? _ano - 1 : _ano))
  root.querySelector('#cx-next')?.addEventListener('click', () => goto(_mes === 12 ? 1 : _mes + 1, _mes === 12 ? _ano + 1 : _ano))
  root.querySelector('#cx-mes')?.addEventListener('change', e => goto(parseInt(e.target.value), _ano))
  root.querySelector('#cx-ano')?.addEventListener('change', e => {
    const v = parseInt(e.target.value)
    if (v >= 2020 && v <= 2099) goto(_mes, v)
  })
  root.querySelector('#cx-hoje')?.addEventListener('click', () => {
    const d = new Date(); goto(d.getMonth() + 1, d.getFullYear())
  })

  // Add caixinha
  root.querySelector('#cx-add')?.addEventListener('click', () => cxForm())
  root.querySelector('#cx-add-mov')?.addEventListener('click', () => movForm())

  // Delegação
  root.addEventListener('click', async e => {
    const mov   = e.target.closest('[data-cx-mov]')
    const edit  = e.target.closest('[data-cx-edit]')
    const ext   = e.target.closest('[data-cx-ext]')
    const movDel = e.target.closest('[data-mov-del]')

    if (mov)   return movForm({ caixinhaId: mov.dataset.cxMov })
    if (edit)  { const cx = _cxs.find(x => x.id === edit.dataset.cxEdit); return cx && cxForm(cx) }
    if (ext)   return historicoModal(ext.dataset.cxExt)
    if (movDel) {
      if (!confirm('Excluir essa movimentação?')) return
      const { error } = await db.from('caixinhas_mov').delete().eq('id', movDel.dataset.movDel)
      if (error) return toast('Erro: ' + error.message, 'err')
      toast('Removida'); render()
    }
  })
}

function goto(m, a) { _mes = m; _ano = a; render() }

// ─────────────────────── FORMS ──────────────────────────────────────
function cxForm(cx = {}) {
  const isNew = !cx.id
  const ico   = cx.icone || ICONES[0]
  const cor   = cx.cor   || CORES[_cxs.length % CORES.length]
  const tipo  = cx.tipo  || 'gasto'

  const iconBtns = ICONES.map(i => `<button type="button" class="lib-ico-pick${i===ico?' on':''}" data-ico="${i}">${i}</button>`).join('')
  const corBtns  = CORES.map(c => `<button type="button" class="lib-cor-pick${c===cor?' on':''}" style="background:${c}" data-cor="${c}"></button>`).join('')

  openModal(isNew ? 'Nova caixinha' : 'Editar caixinha', `
    <div class="fg"><label class="fl">Nome</label>
      <input class="fi" type="text" id="cx-nome" placeholder="Ex: Gasolina, Mercado, Emergência…" value="${escapeHtml(cx.nome || '')}">
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Tipo</label>
        <select class="fsl" id="cx-tipo">
          <option value="gasto"${tipo==='gasto'?' selected':''}>Gasto mensal (zera no mês seguinte)</option>
          <option value="reserva"${tipo==='reserva'?' selected':''}>Reserva (acumula sempre)</option>
        </select>
      </div>
      <div class="fg"><label class="fl">Valor mensal (R$)</label>
        <input class="fi" type="number" id="cx-val" step="10" placeholder="500" value="${cx.valor_mensal || ''}">
      </div>
    </div>
    <div class="fg"><label class="fl">Ícone</label>
      <div class="lib-ico-row" id="cx-icones">${iconBtns}</div>
      <input type="hidden" id="cx-ico" value="${ico}">
    </div>
    <div class="fg"><label class="fl">Cor</label>
      <div class="lib-cor-row" id="cx-cores">${corBtns}</div>
      <input type="hidden" id="cx-cor" value="${cor}">
    </div>
  `, `
    ${!isNew ? `<button class="btn bd bsm" id="cx-del" style="margin-right:auto">Excluir</button>` : ''}
    <button class="btn bg" id="cx-cancel">Cancelar</button>
    <button class="btn bp" id="cx-save">Salvar</button>
  `)

  document.getElementById('cx-icones').addEventListener('click', e => {
    const b = e.target.closest('.lib-ico-pick'); if (!b) return
    document.querySelectorAll('#cx-icones .lib-ico-pick').forEach(x => x.classList.remove('on'))
    b.classList.add('on'); document.getElementById('cx-ico').value = b.dataset.ico
  })
  document.getElementById('cx-cores').addEventListener('click', e => {
    const b = e.target.closest('.lib-cor-pick'); if (!b) return
    document.querySelectorAll('#cx-cores .lib-cor-pick').forEach(x => x.classList.remove('on'))
    b.classList.add('on'); document.getElementById('cx-cor').value = b.dataset.cor
  })

  document.getElementById('cx-cancel').addEventListener('click', closeModal)
  document.getElementById('cx-del')?.addEventListener('click', async () => {
    if (!confirm(`Excluir "${cx.nome}"? Movimentações dessa caixinha também serão removidas.`)) return
    const { error } = await db.from('caixinhas').delete().eq('id', cx.id)
    if (error) return toast('Erro: ' + error.message, 'err')
    closeModal(); toast('Caixinha excluída'); render()
  })
  document.getElementById('cx-save').addEventListener('click', async () => {
    const nome = document.getElementById('cx-nome').value.trim()
    const val  = parseFloat(document.getElementById('cx-val').value) || 0
    if (!nome) return toast('Nome obrigatório', 'err')
    if (val <= 0) return toast('Valor mensal inválido', 'err')

    const data = {
      nome,
      valor_mensal:  val,
      tipo:          document.getElementById('cx-tipo').value,
      icone:         document.getElementById('cx-ico').value,
      cor:           document.getElementById('cx-cor').value,
      atualizado_em: new Date().toISOString(),
    }
    const { error } = cx.id
      ? await db.from('caixinhas').update(data).eq('id', cx.id)
      : await db.from('caixinhas').insert(data)
    if (error) return toast('Erro: ' + error.message, 'err')
    closeModal(); toast(cx.id ? 'Caixinha atualizada' : 'Caixinha criada 💰'); render()
  })
}

function movForm({ caixinhaId = null } = {}) {
  const hoje = new Date().toISOString().slice(0,10)
  const cxIdPick = caixinhaId || _cxs[0]?.id || ''

  openModal('Registrar gasto', `
    <div class="fg"><label class="fl">Qual caixinha?</label>
      <select class="fsl" id="mv-cx">
        ${_cxs.map(c => `<option value="${c.id}"${c.id===cxIdPick?' selected':''}>${c.icone||'💰'} ${escapeHtml(c.nome)} (${brl(saldoMes(c, _mes, _ano).saldo)} disp.)</option>`).join('')}
      </select>
    </div>
    <div class="fg"><label class="fl">Valor gasto (R$)</label>
      <input class="fi" type="number" id="mv-val" placeholder="0,00" step="0.01">
    </div>
    <div class="fg"><label class="fl">Data</label>
      <input class="fi" type="date" id="mv-data" value="${hoje}">
    </div>
    <div class="fg"><label class="fl">Descrição (opcional)</label>
      <input class="fi" type="text" id="mv-desc" placeholder="Ex: Posto Ipiranga · Av Brasil">
    </div>
  `, `
    <button class="btn bg" id="mv-cancel">Cancelar</button>
    <button class="btn bp" id="mv-save">Registrar</button>
  `)
  document.getElementById('mv-cancel').addEventListener('click', closeModal)
  document.getElementById('mv-save').addEventListener('click', async () => {
    const v = parseFloat(document.getElementById('mv-val').value) || 0
    if (v <= 0) return toast('Valor inválido', 'err')
    const cxId = document.getElementById('mv-cx').value
    if (!cxId) return toast('Escolha uma caixinha', 'err')
    const d = {
      caixinha_id: cxId,
      valor:       v,
      data:        document.getElementById('mv-data').value || hoje,
      descricao:   document.getElementById('mv-desc').value.trim() || null,
    }
    const { error } = await db.from('caixinhas_mov').insert(d)
    if (error) return toast('Erro: ' + error.message, 'err')
    closeModal(); toast('Gasto registrado')
    render()
  })
}

function historicoModal(cxId) {
  const cx = _cxs.find(c => c.id === cxId); if (!cx) return
  const list = _movs.filter(m => m.caixinha_id === cxId).slice(0, 50)

  const rows = list.length
    ? list.map(m => `<tr>
        <td style="color:var(--text-3);font-family:var(--ff-mono)">${fmtd(m.data)}</td>
        <td>${escapeHtml(m.descricao || '—')}</td>
        <td style="text-align:right;font-weight:600;color:${Number(m.valor)<0?'#34D399':'var(--danger)'}">${Number(m.valor)<0?'+':'−'}${brl(Math.abs(Number(m.valor)))}</td>
      </tr>`).join('')
    : '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-3)">Nenhuma movimentação ainda</td></tr>'

  openModal(`${cx.icone||'💰'} ${cx.nome}`, `
    <div class="lib-hint" style="margin-bottom:14px">Últimas 50 movimentações</div>
    <table style="width:100%;font-size:13px">
      <thead style="border-bottom:1px solid var(--line)"><tr>
        <th style="text-align:left;padding:6px 4px;font-weight:500;color:var(--text-3);font-size:11px">Data</th>
        <th style="text-align:left;padding:6px 4px;font-weight:500;color:var(--text-3);font-size:11px">Descrição</th>
        <th style="text-align:right;padding:6px 4px;font-weight:500;color:var(--text-3);font-size:11px">Valor</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `, `<button class="btn bg" onclick="document.getElementById('ov').classList.add('h')">Fechar</button>`)
}

// ─────────────────────────── UTILS ──────────────────────────────────
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))
}
function hexA(hex, a) {
  const h = hex.replace('#',''); const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16)
  return `rgba(${r},${g},${b},${a})`
}
