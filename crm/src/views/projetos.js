import { db, selectAll } from '../db.js'
import { sbAuth } from '../auth.js'
import { fmtd, toast, openModal, closeModal } from '../utils.js'

const SB_URL = 'https://flzpblpegoqjxaacjvhf.supabase.co'

// Chama edge function direto via fetch — evita esquisitices do supabase-js
// quando o client tá usando service_role e o browser faz CORS preflight.
async function invokeFn(name, body) {
  const { data } = await sbAuth.auth.getSession()
  const tok = data?.session?.access_token
  const r = await fetch(`${SB_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
    },
    body: JSON.stringify(body || {}),
  })
  const txt = await r.text()
  let json
  try { json = JSON.parse(txt) } catch { json = { ok: false, erro: txt } }
  if (!r.ok || json?.ok === false) {
    throw new Error(json?.erro || `HTTP ${r.status}`)
  }
  return json
}

const DEFAULT_ETAPAS = [
  { k: 'todo',   l: 'A fazer',  cor: '#A0A0A0' },
  { k: 'doing',  l: 'Fazendo',  cor: '#4A9EFF' },
  { k: 'review', l: 'Revisão',  cor: '#F5A623' },
  { k: 'done',   l: 'Feito',    cor: '#34D399' },
]

const PRIOS = [
  { k: 'baixa',   l: 'Baixa',   cor: '#A0A0A0' },
  { k: 'media',   l: 'Média',   cor: '#4A9EFF' },
  { k: 'alta',    l: 'Alta',    cor: '#F5A623' },
  { k: 'urgente', l: 'Urgente', cor: '#FF5C5C' },
]
const PRIO_MAP = Object.fromEntries(PRIOS.map(p => [p.k, p]))

const CORES_PROJ  = ['#C5F82A', '#4A9EFF', '#A78BFA', '#F5A623', '#34D399', '#FF5C5C', '#EC4899', '#06B6D4']
const CORES_ETAPA = ['#A0A0A0', '#4A9EFF', '#A78BFA', '#F5A623', '#34D399', '#FF5C5C', '#EC4899', '#06B6D4', '#C5F82A']

const DIAS = [
  { k: 1, l: 'Seg' }, { k: 2, l: 'Ter' }, { k: 3, l: 'Qua' },
  { k: 4, l: 'Qui' }, { k: 5, l: 'Sex' }, { k: 6, l: 'Sáb' }, { k: 0, l: 'Dom' },
]

let _projs   = []
let _clis    = []
let _tars    = []
let _subs    = []
let _rotinas = []
let _curProj = null
let _view    = 'kanban' // kanban | lista | hoje | rotinas

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  await loadAll()
  await gerarTarefasDeRotinas()  // auto-cria tarefas das rotinas que devem rodar hoje
  await loadAll()                 // recarrega pra mostrar tarefas recém-criadas

  if (_curProj && !_projs.find(x => x.id === _curProj)) _curProj = null
  if (!_curProj && _projs.length) _curProj = _projs[0].id

  renderToolbar()
  renderView()
}

async function loadAll() {
  const [p, cli, t, s, r] = await Promise.all([
    selectAll('projetos', { order: { column: 'criado_em', ascending: false } }),
    selectAll('clientes', { columns: 'id,nome,empresa,status,whatsapp', order: { column: 'nome', ascending: true } }),
    selectAll('tarefas',  { order: { column: 'ordem', ascending: true } }),
    selectAll('tarefa_subtasks', { order: { column: 'ordem', ascending: true } }),
    selectAll('rotinas',  { order: { column: 'criado_em', ascending: false } }),
  ])
  _projs   = p.data || []
  _clis    = cli.data || []
  _tars    = t.data || []
  _subs    = s.data || []
  _rotinas = r.data || []
}

function renderToolbar() {
  const tab = (k, l) => `<button class="pj-tab${_view===k?' on':''}" data-tab="${k}">${l}</button>`
  const addBtn = _view === 'rotinas'
    ? `<button class="btn bp" id="btn-add-rotina">+ Nova rotina</button>`
    : `<button class="btn bp" id="btn-add-proj">+ Novo projeto</button>`

  document.getElementById('tbacts').innerHTML = `
    <div class="pj-tabs">${tab('kanban','Kanban')}${tab('lista','Lista')}${tab('hoje','Hoje')}${tab('resumao','Resumão')}${tab('rotinas','Rotinas')}</div>
    ${addBtn}
  `
  document.querySelectorAll('.pj-tab').forEach(el => el.addEventListener('click', () => {
    _view = el.dataset.tab
    renderToolbar(); renderView()
  }))
  const addProj = document.getElementById('btn-add-proj')
  const addRot  = document.getElementById('btn-add-rotina')
  if (addProj) addProj.addEventListener('click', () => projForm())
  if (addRot)  addRot.addEventListener('click',  () => rotinaForm())
}

function renderView() {
  if (_view === 'hoje')    return renderHoje()
  if (_view === 'rotinas') return renderRotinasList()
  if (_view === 'resumao') return renderResumao()
  return renderProjetoArea()
}

// ════════ RESUMÃO — revisão das notificações pro cliente ═════════════════
// Lista as tarefas que viraram 'done' hoje e tão esperando serem avisadas.
// Você edita o apelido, decide quais incluem, e dispara só com seu OK.
async function renderResumao() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando resumão…</div>'

  let preview
  try {
    preview = await invokeFn('digest-cliente', {})
  } catch (e) {
    c.innerHTML = `<div class="empty">Erro ao carregar: ${escapeHtml(e.message)}</div>`
    return
  }

  const clientes = preview?.clientes || []

  if (!clientes.length) {
    c.innerHTML = `
      <div class="tw" style="padding:60px 20px;text-align:center">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nada pra avisar hoje 🎯</div>
        <div style="font-size:12px;color:var(--text-3)">Conclua tarefas com cliente vinculado e elas aparecem aqui pra revisão.</div>
      </div>`
    return
  }

  const blocoCliente = (cli) => {
    const linhasTarefas = cli.tarefas.map(t => `
      <tr data-tid="${t.id}">
        <td style="width:30px">
          <input type="checkbox" class="rs-tar-cb" data-tid="${t.id}" checked>
        </td>
        <td style="color:var(--text-3);font-size:12px;width:42%">${escapeHtml(t.titulo)}</td>
        <td>
          <input type="text"
            class="fi rs-apelido"
            data-tid="${t.id}"
            value="${escapeAttr(t.apelido || t.titulo)}"
            placeholder="Como mostrar pro cliente"
            style="width:100%">
        </td>
      </tr>`).join('')

    return `
      <div class="tw" data-cid="${cli.cliente_id}" style="margin-bottom:18px">
        <div class="th" style="align-items:flex-start">
          <div>
            <h3 style="font-size:14px">${escapeHtml(cli.nome)}</h3>
            <div style="font-size:11px;color:var(--text-3);margin-top:3px">${cli.tarefas.length} tarefa${cli.tarefas.length===1?'':'s'} pendente${cli.tarefas.length===1?'':'s'} · ${escapeHtml(cli.whatsapp || '')}</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn bg bsm rs-skip" data-cid="${cli.cliente_id}">Pular hoje</button>
            <button class="btn bp bsm rs-send" data-cid="${cli.cliente_id}">Revisar e enviar →</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Tarefa interna</th>
              <th>O que o cliente vai ver</th>
            </tr>
          </thead>
          <tbody>${linhasTarefas}</tbody>
        </table>
      </div>`
  }

  c.innerHTML = `
    <div style="font-size:13px;color:var(--text-3);margin-bottom:16px;line-height:1.5">
      ${clientes.length} cliente${clientes.length===1?'':'s'} esperando aviso.
      Revise os apelidos, desmarque o que não quer mandar, e clique <strong style="color:var(--text-2)">Revisar e enviar</strong> — vai abrir uma confirmação com o texto final.
    </div>
    ${clientes.map(blocoCliente).join('')}
  `

  // Enviar
  c.querySelectorAll('.rs-send').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cid = btn.dataset.cid
      const cli = clientes.find(x => x.cliente_id === cid)
      if (!cli) return
      const bloco = c.querySelector(`.tw[data-cid="${cid}"]`)
      const tarefasOK = [...bloco.querySelectorAll('.rs-tar-cb')]
        .filter(cb => cb.checked).map(cb => cb.dataset.tid)
      if (!tarefasOK.length) { toast('Nenhuma tarefa marcada.', 'err'); return }

      const apelidos = {}
      tarefasOK.forEach(tid => {
        const inp = bloco.querySelector(`.rs-apelido[data-tid="${tid}"]`)
        if (inp) apelidos[tid] = inp.value.trim()
      })

      // Monta preview da mensagem pro modal de confirmação
      const nomeCli = (cli.nome || '').split(' ')[0] || ''
      const head = nomeCli ? `Oi, ${nomeCli}! Fechando o dia aqui.` : `Oi! Fechando o dia aqui.`
      const corpo = tarefasOK.map(tid => `✓ ${apelidos[tid] || cli.tarefas.find(t => t.id === tid)?.titulo || ''}`).join('\n')
      const previewMsg = `${head}\n\nHoje a gente avançou:\n${corpo}\n\nQualquer dúvida é só chamar.`

      openModal(
        `Enviar pra ${cli.nome}?`,
        `<div style="font-size:12px;color:var(--text-3);margin-bottom:8px">Texto final que vai pelo WhatsApp:</div>
         <pre style="background:var(--bg-input);border:1px solid var(--line);border-radius:var(--rs);padding:14px;font-family:inherit;font-size:13px;color:var(--text);white-space:pre-wrap;line-height:1.5;margin-bottom:10px">${escapeHtml(previewMsg)}</pre>
         <div style="font-size:11px;color:var(--text-3)">Pro: <strong style="color:var(--text-2)">${escapeHtml(cli.whatsapp || '—')}</strong></div>`,
        `<button class="btn bg" id="rs-cancel">Cancelar</button>
         <button class="btn bp" id="rs-confirm">Confirmar envio</button>`
      )
      document.getElementById('rs-cancel').addEventListener('click', closeModal)
      document.getElementById('rs-confirm').addEventListener('click', async () => {
        const btnConf = document.getElementById('rs-confirm')
        btnConf.disabled = true; btnConf.textContent = 'Enviando…'
        try {
          // Tarefas DESMARCADAS recebem notificar_cliente=false (não voltam amanhã)
          const desmarcadas = cli.tarefas.filter(t => !tarefasOK.includes(t.id)).map(t => t.id)
          for (const tid of desmarcadas) {
            await db.from('tarefas').update({ notificar_cliente: false }).eq('id', tid)
          }
          await invokeFn('digest-cliente', { cliente_id: cid, apelidos })
          toast(`Enviado pra ${cli.nome} ✓`)
          closeModal()
          renderResumao()
        } catch (e) {
          btnConf.disabled = false; btnConf.textContent = 'Confirmar envio'
          toast('Erro: ' + e.message, 'err')
        }
      })
    })
  })

  // Pular hoje — marca tudo como notificado pra sumir da lista, sem enviar
  c.querySelectorAll('.rs-skip').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cid = btn.dataset.cid
      const cli = clientes.find(x => x.cliente_id === cid)
      if (!cli) return
      if (!confirm(`Pular ${cli.nome} hoje? As tarefas somem do resumão e não viram aviso.`)) return
      const ids = cli.tarefas.map(t => t.id)
      const agora = new Date().toISOString()
      await db.from('tarefas').update({ notificado_cliente_em: agora }).in('id', ids)
      toast(`${cli.nome} pulado`)
      renderResumao()
    })
  })
}

// ════════ HOJE — tudo que vence até hoje, agrupado por projeto ═════════
function renderHoje() {
  const c = document.getElementById('content')
  const hojeStr = new Date().toISOString().slice(0,10)
  const tars = _tars.filter(t => t.status !== 'done' && t.prazo && t.prazo <= hojeStr)
  if (!tars.length) {
    c.innerHTML = `<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nada pra hoje</div>
      <div style="font-size:12px">Sem tarefas vencidas ou pra hoje. Tá em dia.</div>
    </div>`
    return
  }

  const porProj = {}
  for (const t of tars) {
    (porProj[t.projeto_id] = porProj[t.projeto_id] || []).push(t)
  }

  const blocos = Object.entries(porProj).map(([pid, lista]) => {
    const proj = _projs.find(p => p.id === pid)
    if (!proj) return ''
    const cli = _clis.find(x => x.id === proj.cliente_id)
    const rows = lista
      .sort((a,b) => (a.prazo||'').localeCompare(b.prazo||''))
      .map(t => `<div class="pj-hoje-row" data-tid="${t.id}">
        <input type="checkbox" class="pj-hoje-cb" data-tid="${t.id}">
        <div class="pj-hoje-title">${escapeHtml(t.titulo)}</div>
        ${prioPill(t.prioridade)}
        ${prazoChip(t.prazo)}
      </div>`).join('')

    return `<div class="pj-hoje-block">
      <div class="pj-hoje-head">
        <span class="pj-side-dot" style="background:${proj.cor||'#C5F82A'}"></span>
        <span class="pj-hoje-proj">${escapeHtml(proj.nome)}</span>
        <span class="pj-hoje-cli">${cli ? escapeHtml(cli.empresa||cli.nome) : 'Interno'}</span>
        <span class="pj-col-count">${lista.length}</span>
      </div>
      <div class="pj-hoje-rows">${rows}</div>
    </div>`
  }).join('')

  c.innerHTML = `<div class="pj-hoje">${blocos}</div>`

  c.addEventListener('click', async e => {
    const cb = e.target.closest('.pj-hoje-cb')
    if (cb) {
      e.stopPropagation()
      const tar = _tars.find(t => t.id === cb.dataset.tid)
      if (!tar) return
      await concluirTarefa(tar, () => render())
      return
    }
    const row = e.target.closest('.pj-hoje-row')
    if (row) {
      const t = _tars.find(x => x.id === row.dataset.tid)
      if (t) tarForm(t)
    }
  })
}

// ════════ ROTINAS — agrupadas por projeto ═══════════════════════════════
function renderRotinasList() {
  const c = document.getElementById('content')
  if (!_rotinas.length) {
    c.innerHTML = `<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhuma rotina ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Rotinas geram tarefas automaticamente em dias específicos.<br>Ex: toda segunda criar "Mandar vídeo motivacional pra Adriane".</div>
      <button class="btn bp" id="btn-first-rot">+ Criar primeira rotina</button>
    </div>`
    document.getElementById('btn-first-rot').addEventListener('click', () => rotinaForm())
    return
  }

  // Agrupa rotinas por projeto (rotinas sem projeto ficam no fim)
  const porProjeto = new Map()
  const semProjeto = []

  _rotinas.forEach(r => {
    if (!r.projeto_id) { semProjeto.push(r); return }
    if (!porProjeto.has(r.projeto_id)) porProjeto.set(r.projeto_id, [])
    porProjeto.get(r.projeto_id).push(r)
  })

  // Ordena projetos: ativos primeiro, depois alfabético
  const gruposProjetos = [..._projs]
    .filter(p => porProjeto.has(p.id))
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))

  const renderRot = (r) => {
    const cli = _clis.find(x => x.id === r.cliente_id)
    const tarefas = Array.isArray(r.tarefas) ? r.tarefas : []
    return `<div class="pj-rot-item ${r.ativa ? '' : 'paused'}" data-rid="${r.id}">
      <div class="pj-rot-item-main">
        <div class="pj-rot-item-top">
          <div class="pj-rot-item-name">${escapeHtml(r.nome)}</div>
          <label class="pj-rot-toggle">
            <input type="checkbox" class="pj-rot-active" data-rid="${r.id}" ${r.ativa?'checked':''}>
            <span>${r.ativa ? 'Ativa' : 'Pausada'}</span>
          </label>
        </div>
        <div class="pj-rot-item-meta">
          ${cli ? `<span class="pj-rot-chip">${escapeHtml(cli.empresa||cli.nome)}</span>` : ''}
          <span class="pj-rot-chip">${cadenciaLabel(r)}</span>
          <span class="pj-rot-chip">${tarefas.length} tarefa${tarefas.length===1?'':'s'}</span>
          ${r.ultima_geracao ? `<span class="pj-rot-chip pj-rot-chip-dim">Última: ${fmtd(r.ultima_geracao)}</span>` : ''}
        </div>
        ${tarefas.length ? `<div class="pj-rot-item-tarefas">${tarefas.map(t => `<span class="pj-rot-tlbl">• ${escapeHtml(t.titulo||'')}</span>`).join('')}</div>` : ''}
      </div>
      <div class="pj-rot-item-acts">
        <button class="btn bg bsm rot-edit" data-rid="${r.id}">Editar</button>
        <button class="btn bg bsm rot-run"  data-rid="${r.id}">Rodar agora</button>
        <button class="btn bd bsm rot-del"  data-rid="${r.id}">Excluir</button>
      </div>
    </div>`
  }

  const grupos = gruposProjetos.map(p => {
    const rotinas = porProjeto.get(p.id) || []
    const ativas = rotinas.filter(r => r.ativa).length
    const cor = p.cor || '#C5F82A'
    return `<div class="pj-rot-group" style="--proj-color:${cor}">
      <div class="pj-rot-group-h">
        <div class="pj-rot-group-h-l">
          <span class="pj-rot-group-dot" style="background:${cor}"></span>
          <span class="pj-rot-group-name">${escapeHtml(p.nome)}</span>
        </div>
        <div class="pj-rot-group-h-r">
          <span class="pj-rot-group-count">${ativas}/${rotinas.length} ativa${rotinas.length===1?'':'s'}</span>
          <button class="btn bp bsm rot-add-proj" data-pid="${p.id}">+ Rotina</button>
        </div>
      </div>
      <div class="pj-rot-group-list">
        ${rotinas.map(renderRot).join('')}
      </div>
    </div>`
  }).join('')

  const grupoSem = semProjeto.length ? `<div class="pj-rot-group pj-rot-group-orphan">
    <div class="pj-rot-group-h">
      <div class="pj-rot-group-h-l">
        <span class="pj-rot-group-dot" style="background:var(--text-3)"></span>
        <span class="pj-rot-group-name">Sem projeto vinculado</span>
      </div>
      <span class="pj-rot-group-count">${semProjeto.length}</span>
    </div>
    <div class="pj-rot-group-list">
      ${semProjeto.map(renderRot).join('')}
    </div>
  </div>` : ''

  c.innerHTML = `<div class="pj-rot-groups">${grupos}${grupoSem}</div>`

  c.addEventListener('click', async e => {
    const addPj = e.target.closest('.rot-add-proj')
    if (addPj) {
      rotinaForm({ projeto_id: addPj.dataset.pid })
      return
    }
    const edit = e.target.closest('.rot-edit')
    const del  = e.target.closest('.rot-del')
    const run  = e.target.closest('.rot-run')
    const tog  = e.target.closest('.pj-rot-active')
    if (edit) { const r = _rotinas.find(x => x.id === edit.dataset.rid); if (r) rotinaForm(r) }
    else if (del) {
      const r = _rotinas.find(x => x.id === del.dataset.rid)
      if (r && confirm(`Excluir rotina "${r.nome}"? (Tarefas já geradas continuam)`)) {
        await db.from('rotinas').delete().eq('id', r.id)
        toast('Rotina excluída'); render()
      }
    }
    else if (run) {
      const r = _rotinas.find(x => x.id === run.dataset.rid)
      if (r) { await rodarRotinaAgora(r); toast('Tarefas geradas'); render() }
    }
    else if (tog) {
      const r = _rotinas.find(x => x.id === tog.dataset.rid)
      if (r) {
        r.ativa = tog.checked
        await db.from('rotinas').update({ ativa: r.ativa, atualizado_em: new Date().toISOString() }).eq('id', r.id)
      }
    }
  })
}

function cadenciaLabel(r) {
  if (r.cadencia === 'diaria')  return 'Todos os dias'
  if (r.cadencia === 'semanal') {
    const dias = (r.dias_semana||[]).map(d => DIAS.find(x => x.k === d)?.l).filter(Boolean).join(', ')
    return dias ? `Semanal: ${dias}` : 'Semanal'
  }
  if (r.cadencia === 'mensal')  return `Mensal: dia ${r.dia_mes || 1}`
  return r.cadencia
}

// ════════ KANBAN + LISTA (com sidebar de projetos) ══════════════════════
function renderProjetoArea() {
  const c = document.getElementById('content')

  if (!_projs.length) {
    c.innerHTML = `<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Nenhum projeto ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Crie seu primeiro projeto pra começar.</div>
      <button class="btn bp" id="btn-add-first">+ Criar projeto</button>
    </div>`
    document.getElementById('btn-add-first').addEventListener('click', () => projForm())
    return
  }

  const sidebar = _projs.map(p => {
    const cli = _clis.find(x => x.id === p.cliente_id)
    const totT = _tars.filter(t => t.projeto_id === p.id).length
    const doneT = _tars.filter(t => t.projeto_id === p.id && t.status === 'done').length
    return `<div class="pj-side ${p.id === _curProj ? 'on' : ''}" data-pid="${p.id}">
      <div class="pj-side-dot" style="background:${p.cor || '#C5F82A'}"></div>
      <div class="pj-side-body">
        <div class="pj-side-name">${escapeHtml(p.nome)}</div>
        <div class="pj-side-meta">${cli ? escapeHtml(cli.empresa || cli.nome) : 'Interno'} · ${doneT}/${totT}</div>
      </div>
    </div>`
  }).join('')

  c.innerHTML = `<div class="pj-wrap">
    <div class="pj-sidebar">
      <div class="pj-sidebar-head">Projetos <span style="color:var(--text-3);font-weight:400">(${_projs.length})</span></div>
      <div class="pj-sidebar-list">${sidebar}</div>
    </div>
    <div class="pj-main" id="pj-main"></div>
  </div>`

  c.querySelector('.pj-sidebar-list').addEventListener('click', e => {
    const item = e.target.closest('.pj-side')
    if (item) { _curProj = item.dataset.pid; renderProjetoArea() }
  })

  renderMain()
}

function renderMain() {
  const proj = _projs.find(p => p.id === _curProj)
  if (!proj) return
  const cli = _clis.find(x => x.id === proj.cliente_id)
  const tars = _tars.filter(t => t.projeto_id === proj.id)
  const etapas = etapasDe(proj)

  const head = `<div class="pj-head">
    <div class="pj-head-left">
      <div class="pj-head-dot" style="background:${proj.cor || '#C5F82A'}"></div>
      <div>
        <div class="pj-head-name">${escapeHtml(proj.nome)}</div>
        <div class="pj-head-meta">
          ${cli ? `<span>${escapeHtml(cli.empresa || cli.nome)}</span>` : '<span>Interno</span>'}
          ${proj.prazo ? ` · <span>Prazo ${fmtd(proj.prazo)}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="pj-head-acts">
      <button class="btn bg bsm" id="pj-edit">Editar</button>
      <button class="btn bd bsm" id="pj-del">Excluir</button>
      <button class="btn bp" id="pj-add-tar">+ Tarefa</button>
    </div>
  </div>`

  const body = _view === 'lista' ? renderLista(tars, etapas) : renderKanban(tars, etapas)
  document.getElementById('pj-main').innerHTML = head + body

  document.getElementById('pj-edit').addEventListener('click', () => projForm(proj))
  document.getElementById('pj-del').addEventListener('click',  () => delProj(proj))
  document.getElementById('pj-add-tar').addEventListener('click', () => tarForm({ projeto_id: proj.id, status: etapas[0]?.k || 'todo' }))

  wireBoardInteractions()
}

function etapasDe(proj) {
  const e = proj?.etapas
  if (Array.isArray(e) && e.length) return e
  return DEFAULT_ETAPAS
}

function renderKanban(tars, etapas) {
  const cols = etapas.map(col => {
    const cards = tars.filter(t => t.status === col.k)
    const cardHTML = cards.length
      ? cards.map(t => taskCard(t)).join('')
      : `<div class="pj-empty">—</div>`
    return `<div class="pj-col" data-status="${col.k}">
      <div class="pj-col-head">
        <span class="pj-col-title" style="color:${col.cor}">
          <span class="pj-col-bullet" style="background:${col.cor}"></span>${escapeHtml(col.l)}
        </span>
        <span class="pj-col-count">${cards.length}</span>
      </div>
      <div class="pj-col-cards" data-drop="${col.k}">${cardHTML}</div>
    </div>`
  }).join('')
  return `<div class="pj-kanban">${cols}</div>`
}

function renderLista(tars, etapas) {
  if (!tars.length) return `<div class="empty" style="padding:40px">Sem tarefas neste projeto.</div>`
  const order = etapas.map(e => e.k)
  const sorted = [...tars].sort((a, b) => {
    return order.indexOf(a.status) - order.indexOf(b.status) || (a.prazo || '').localeCompare(b.prazo || '')
  })
  const rows = sorted.map(t => {
    const subs = _subs.filter(s => s.tarefa_id === t.id)
    const done = subs.filter(s => s.feito).length
    return `<tr class="pj-row" data-tid="${t.id}">
      <td>${statusPill(t.status, etapas)}</td>
      <td class="pj-row-title">${escapeHtml(t.titulo)}${subs.length ? `<span class="pj-sub-chip">${done}/${subs.length}</span>` : ''}${t.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':''}</td>
      <td>${prioPill(t.prioridade)}</td>
      <td class="tm">${prazoChip(t.prazo)}</td>
      <td><button class="btn bd bsm bic del-tar" data-tid="${t.id}">×</button></td>
    </tr>`
  }).join('')
  return `<div class="tw" style="margin-top:14px">
    <table>
      <thead><tr><th>Status</th><th>Tarefa</th><th>Prio</th><th>Prazo</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`
}

function taskCard(t) {
  const subs = _subs.filter(s => s.tarefa_id === t.id)
  const done = subs.filter(s => s.feito).length
  const prio = PRIO_MAP[t.prioridade] || PRIO_MAP.media
  return `<div class="pj-card" draggable="true" data-tid="${t.id}">
    <div class="pj-card-top">
      <div class="pj-card-prio" style="background:${prio.cor}"></div>
      <div class="pj-card-title">${escapeHtml(t.titulo)}${t.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':''}</div>
    </div>
    ${t.descricao ? `<div class="pj-card-desc">${escapeHtml(t.descricao).slice(0,80)}${t.descricao.length>80?'…':''}</div>` : ''}
    <div class="pj-card-foot">
      ${prazoChip(t.prazo)}
      ${subs.length ? `<span class="pj-sub-chip">${done}/${subs.length}</span>` : ''}
    </div>
  </div>`
}

function statusPill(s, etapas) {
  const col = (etapas||DEFAULT_ETAPAS).find(c => c.k === s) || DEFAULT_ETAPAS[0]
  return `<span class="pj-pill" style="background:${col.cor}22;color:${col.cor}">${escapeHtml(col.l)}</span>`
}
function prioPill(p) {
  const prio = PRIO_MAP[p] || PRIO_MAP.media
  return `<span class="pj-pill" style="background:${prio.cor}22;color:${prio.cor}">${prio.l}</span>`
}
function prazoChip(prazo) {
  if (!prazo) return ''
  const d = new Date(prazo + 'T00:00:00')
  const hoje = new Date(); hoje.setHours(0,0,0,0)
  const diff = Math.round((d - hoje) / 86400000)
  let cls = 'pj-prazo'
  if (diff < 0)       cls += ' late'
  else if (diff <= 2) cls += ' soon'
  return `<span class="${cls}">${fmtd(prazo)}</span>`
}

function wireBoardInteractions() {
  const main = document.getElementById('pj-main')
  if (!main) return

  main.addEventListener('click', e => {
    const card = e.target.closest('.pj-card')
    const row  = e.target.closest('.pj-row')
    const del  = e.target.closest('.del-tar')
    if (del) {
      e.stopPropagation()
      const t = _tars.find(x => x.id === del.dataset.tid)
      if (t && confirm(`Excluir "${t.titulo}"?`)) delTar(t.id)
      return
    }
    if (card) { const t = _tars.find(x => x.id === card.dataset.tid); if (t) tarForm(t) }
    else if (row) { const t = _tars.find(x => x.id === row.dataset.tid); if (t) tarForm(t) }
  })

  let dragged = null
  main.querySelectorAll('.pj-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      dragged = card.dataset.tid
      card.classList.add('drag')
      e.dataTransfer.effectAllowed = 'move'
    })
    card.addEventListener('dragend', () => {
      card.classList.remove('drag')
      main.querySelectorAll('.pj-col-cards.over').forEach(el => el.classList.remove('over'))
    })
  })
  main.querySelectorAll('.pj-col-cards').forEach(drop => {
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over') })
    drop.addEventListener('dragleave', () => drop.classList.remove('over'))
    drop.addEventListener('drop', async e => {
      e.preventDefault(); drop.classList.remove('over')
      if (!dragged) return
      const newStatus = drop.dataset.drop
      const tar = _tars.find(t => t.id === dragged)
      if (!tar || tar.status === newStatus) return
      if (newStatus === 'done') {
        await concluirTarefa(tar, () => renderMain())
        return
      }
      tar.status = newStatus
      const { error } = await db.from('tarefas').update({ status: newStatus, atualizado_em: new Date().toISOString() }).eq('id', dragged)
      if (error) { toast('Erro: ' + error.message, 'err'); return }
      renderMain()
    })
  })
}

// ════════ FORM PROJETO (com editor de etapas) ════════════════════════════
function projForm(p = {}) {
  const cliOpts = `<option value="">— sem cliente (interno) —</option>` +
    clientesAtivos(p.cliente_id).map(c => `<option value="${c.id}"${p.cliente_id===c.id?' selected':''}>${escapeHtml(c.empresa || c.nome)}</option>`).join('')
  const corOpts = CORES_PROJ.map(c => `<span class="pj-cor-opt${(p.cor||CORES_PROJ[0])===c?' on':''}" data-cor="${c}" style="background:${c}"></span>`).join('')

  let etapasState = Array.isArray(p.etapas) && p.etapas.length ? JSON.parse(JSON.stringify(p.etapas)) : JSON.parse(JSON.stringify(DEFAULT_ETAPAS))

  openModal(p.id ? 'Editar projeto' : 'Novo projeto', `
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="pj-nome" value="${escapeAttr(p.nome || '')}" placeholder="Ex: Conteúdo semanal Adriane"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="pj-desc" rows="2" placeholder="Resumo do projeto">${escapeHtml(p.descricao || '')}</textarea></div>
    <div class="frow">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="pj-cli">${cliOpts}</select></div>
      <div class="fg"><label class="fl">Prazo</label><input class="fi" type="date" id="pj-prazo" value="${p.prazo || ''}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Cor</label>
      <div class="pj-cor-row" id="pj-cor-row">${corOpts}</div></div>
    <div class="fg" style="margin-top:11px">
      <label class="fl">JID do grupo WhatsApp <span style="color:var(--text-3);font-weight:400">(opcional — deixe vazio pra enviar no DM do cliente)</span></label>
      <input class="fi" id="pj-jid" value="${escapeAttr(p.jid_grupo || '')}" placeholder="Ex: 120363409551896994@g.us">
      <div style="font-size:11px;color:var(--text-3);margin-top:5px">Se preenchido, o resumão deste projeto vai pro grupo (e não pro DM do cliente).</div>
    </div>
    <div class="fg" style="margin-top:14px">
      <label class="fl">Etapas do fluxo</label>
      <div id="pj-etapas-list" class="pj-etapas-list"></div>
      <button class="btn bg bsm" id="pj-etapa-add" type="button" style="margin-top:6px;align-self:flex-start">+ Etapa</button>
    </div>
  `, `
    <button class="btn bg" id="pj-cancel">Cancelar</button>
    <button class="btn bp" id="pj-save">${p.id ? 'Salvar' : 'Criar'}</button>
  `)

  let cor = p.cor || CORES_PROJ[0]
  document.getElementById('pj-cor-row').addEventListener('click', e => {
    const opt = e.target.closest('.pj-cor-opt')
    if (!opt) return
    cor = opt.dataset.cor
    document.querySelectorAll('.pj-cor-opt').forEach(el => el.classList.toggle('on', el.dataset.cor === cor))
  })

  const renderEtapas = () => {
    document.getElementById('pj-etapas-list').innerHTML = etapasState.map((e, i) => `
      <div class="pj-etapa-row" data-i="${i}">
        <span class="pj-etapa-color" data-i="${i}" style="background:${e.cor}"></span>
        <input type="text" class="fi pj-etapa-l" data-i="${i}" value="${escapeAttr(e.l)}" style="flex:1;padding:6px 9px;font-size:12.5px">
        <button class="pj-etapa-up"   type="button" data-i="${i}" ${i===0?'disabled':''}>↑</button>
        <button class="pj-etapa-down" type="button" data-i="${i}" ${i===etapasState.length-1?'disabled':''}>↓</button>
        <button class="pj-sub-del"    type="button" data-i="${i}" ${etapasState.length<=1?'disabled':''} title="Remover">×</button>
      </div>
    `).join('')
  }
  renderEtapas()

  document.getElementById('pj-etapa-add').addEventListener('click', () => {
    const slug = 'etapa_' + Math.random().toString(36).slice(2,7)
    etapasState.push({ k: slug, l: 'Nova etapa', cor: CORES_ETAPA[etapasState.length % CORES_ETAPA.length] })
    renderEtapas()
  })
  document.getElementById('pj-etapas-list').addEventListener('click', e => {
    const up   = e.target.closest('.pj-etapa-up')
    const down = e.target.closest('.pj-etapa-down')
    const del  = e.target.closest('.pj-sub-del')
    const colorBtn = e.target.closest('.pj-etapa-color')
    if (up)   { const i = +up.dataset.i;   [etapasState[i-1], etapasState[i]] = [etapasState[i], etapasState[i-1]]; renderEtapas() }
    if (down) { const i = +down.dataset.i; [etapasState[i+1], etapasState[i]] = [etapasState[i], etapasState[i+1]]; renderEtapas() }
    if (del && etapasState.length > 1)   { const i = +del.dataset.i;  etapasState.splice(i,1); renderEtapas() }
    if (colorBtn) {
      const i = +colorBtn.dataset.i
      const cur = etapasState[i].cor
      const idx = CORES_ETAPA.indexOf(cur)
      etapasState[i].cor = CORES_ETAPA[(idx + 1) % CORES_ETAPA.length]
      renderEtapas()
    }
  })
  document.getElementById('pj-etapas-list').addEventListener('input', e => {
    const inp = e.target.closest('.pj-etapa-l')
    if (inp) etapasState[+inp.dataset.i].l = inp.value
  })

  document.getElementById('pj-cancel').addEventListener('click', closeModal)
  document.getElementById('pj-save').addEventListener('click', async () => {
    // Sanitiza etapas: tira em branco, garante slug único
    const etapasClean = etapasState.filter(e => (e.l||'').trim()).map(e => ({
      k: e.k || ('etapa_' + Math.random().toString(36).slice(2,7)),
      l: e.l.trim(),
      cor: e.cor || '#A0A0A0',
    }))
    if (!etapasClean.length) return toast('Adicione pelo menos 1 etapa', 'err')

    const payload = {
      nome: document.getElementById('pj-nome').value.trim(),
      descricao: document.getElementById('pj-desc').value.trim() || null,
      cliente_id: document.getElementById('pj-cli').value || null,
      jid_grupo: document.getElementById('pj-jid').value.trim() || null,
      prazo: document.getElementById('pj-prazo').value || null,
      cor,
      etapas: etapasClean,
      atualizado_em: new Date().toISOString(),
    }
    if (!payload.nome) return toast('Nome é obrigatório', 'err')

    const q = p.id
      ? db.from('projetos').update(payload).eq('id', p.id)
      : db.from('projetos').insert(payload).select().single()
    const { data, error } = await q
    if (error) return toast('Erro: ' + error.message, 'err')
    if (!p.id && data) _curProj = data.id
    closeModal()
    toast(p.id ? 'Projeto salvo' : 'Projeto criado')
    render()
  })
}

async function delProj(p) {
  if (!confirm(`Excluir "${p.nome}" e TODAS as tarefas e rotinas dele?`)) return
  const { error } = await db.from('projetos').delete().eq('id', p.id)
  if (error) return toast('Erro: ' + error.message, 'err')
  _curProj = null
  toast('Projeto excluído')
  render()
}

// ════════ CONCLUIR TAREFA (com aviso opcional pro cliente) ══════════════
// Marca status=done. Se a tarefa pertence a um projeto com cliente E está
// marcada como `notificar_cliente`, abre um modal pra confirmar o apelido
// que vai no resumão das 18h, ou disparar um WhatsApp na hora pelo wa.me
// (usando a conta do dono do CRM — não vai pelo bot).
async function concluirTarefa(tar, after) {
  // Já estava feita? não faz nada
  if (tar.status === 'done') { after && after(); return }

  // Marca feita imediatamente. Se cancelar o modal, fica feita do mesmo
  // jeito — o resumão decide se notifica o cliente.
  tar.status = 'done'
  const { error } = await db.from('tarefas')
    .update({ status: 'done', atualizado_em: new Date().toISOString() })
    .eq('id', tar.id)
  if (error) { toast('Erro: ' + error.message, 'err'); return }

  const proj = _projs.find(p => p.id === tar.projeto_id)
  const cli  = proj ? _clis.find(c => c.id === proj.cliente_id) : null

  // Sem cliente, sem whatsapp ou opt-out → só conclui, sem perguntar
  if (!cli || !cli.whatsapp || tar.notificar_cliente === false) {
    toast('Marcada como feita')
    after && after()
    return
  }

  const apelidoInicial = tar.apelido_cliente || tar.titulo || ''
  const nomeCli = (cli.nome || '').split(' ')[0] || ''
  openModal('Tarefa concluída — avisar o cliente?', `
    <div style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:14px">
      Cliente: <strong style="color:var(--text)">${escapeHtml(cli.empresa || cli.nome)}</strong>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Como mostrar pro cliente</label>
      <input class="fi" id="cn-apelido" value="${escapeAttr(apelidoInicial)}" placeholder="Ex: Criativo de feed dessa semana">
      <div style="font-size:11px;color:var(--text-3);margin-top:5px">Linguagem de cliente, não de tarefa interna.</div>
    </div>
    <div class="fg" style="margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
        <input type="checkbox" id="cn-incluir" checked>
        <span>Incluir no resumão automático das 18h</span>
      </label>
    </div>
  `, `
    <button class="btn bg" id="cn-skip">Não notificar</button>
    <button class="btn bg" id="cn-save">Salvar no resumão</button>
    <button class="btn bp" id="cn-now">Avisar agora</button>
  `)

  const fechar = (cb) => { closeModal(); after && after(); cb && cb() }
  const lerApelido = () => document.getElementById('cn-apelido').value.trim() || tar.titulo
  const lerIncluir = () => document.getElementById('cn-incluir').checked

  document.getElementById('cn-skip').addEventListener('click', async () => {
    await db.from('tarefas')
      .update({ apelido_cliente: lerApelido(), notificar_cliente: false })
      .eq('id', tar.id)
    toast('Concluída — cliente não vai ser avisado')
    fechar()
  })

  document.getElementById('cn-save').addEventListener('click', async () => {
    const apelido = lerApelido()
    const incluir = lerIncluir()
    await db.from('tarefas')
      .update({ apelido_cliente: apelido, notificar_cliente: incluir })
      .eq('id', tar.id)
    toast(incluir ? 'No resumão das 18h' : 'Concluída — sem aviso')
    fechar()
  })

  document.getElementById('cn-now').addEventListener('click', async () => {
    const apelido = lerApelido()
    const msg = `Oi${nomeCli ? `, ${nomeCli}` : ''}! Terminei aqui: ${apelido}.`
    // Marca como já notificada pra não duplicar no resumão das 18h
    await db.from('tarefas').update({
      apelido_cliente: apelido,
      notificar_cliente: true,
      notificado_cliente_em: new Date().toISOString(),
    }).eq('id', tar.id)
    const wa = String(cli.whatsapp).replace(/\D/g, '')
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')
    toast('Abrindo WhatsApp…')
    fechar()
  })
}

// ════════ FORM TAREFA ════════════════════════════════════════════════════
function tarForm(t = {}) {
  const isNew = !t.id
  const proj = _projs.find(p => p.id === (t.projeto_id || _curProj))
  const etapas = etapasDe(proj)

  const statusOpts = etapas.map(c => `<option value="${c.k}"${(t.status||etapas[0].k)===c.k?' selected':''}>${escapeHtml(c.l)}</option>`).join('')
  const prioOpts   = PRIOS.map(p => `<option value="${p.k}"${(t.prioridade||'media')===p.k?' selected':''}>${p.l}</option>`).join('')
  const subs = isNew ? [] : _subs.filter(s => s.tarefa_id === t.id)

  openModal(isNew ? 'Nova tarefa' : 'Editar tarefa', `
    <div class="fg" style="margin-bottom:11px"><label class="fl">Título *</label>
      <input class="fi" id="tr-titulo" value="${escapeAttr(t.titulo || '')}" placeholder="O que precisa ser feito?"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="tr-desc" rows="3" placeholder="Detalhes, contexto, links...">${escapeHtml(t.descricao || '')}</textarea></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Etapa</label><select class="fsl" id="tr-status">${statusOpts}</select></div>
      <div class="fg"><label class="fl">Prioridade</label><select class="fsl" id="tr-prio">${prioOpts}</select></div>
    </div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Prazo</label>
      <input class="fi" type="date" id="tr-prazo" value="${t.prazo || ''}"></div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Como mostrar pro cliente <span style="color:var(--text-3);font-weight:400">(opcional)</span></label>
      <input class="fi" id="tr-apelido" value="${escapeAttr(t.apelido_cliente || '')}" placeholder="Se vazio, usa o título da tarefa">
      <div style="font-size:11px;color:var(--text-3);margin-top:5px">Aparece no resumão das 18h pro cliente.</div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
        <input type="checkbox" id="tr-notif" ${t.notificar_cliente === false ? '' : 'checked'}>
        <span>Incluir esta tarefa no resumão automático pro cliente</span>
      </label>
    </div>
    <div class="fg">
      <label class="fl">Checklist</label>
      <div id="tr-subs" class="pj-subs">${subs.map(s => subRow(s.id, s.texto, s.feito)).join('')}</div>
      <div style="display:flex;gap:6px;margin-top:6px">
        <input class="fi" id="tr-sub-new" placeholder="+ adicionar item" style="flex:1">
        <button class="btn bg bsm" id="tr-sub-add">Add</button>
      </div>
    </div>
  `, `
    ${isNew ? '' : '<button class="btn bd" id="tr-del">Excluir</button>'}
    <button class="btn bg" id="tr-cancel">Cancelar</button>
    <button class="btn bp" id="tr-save">${isNew ? 'Criar' : 'Salvar'}</button>
  `)

  document.getElementById('tr-sub-add').addEventListener('click', () => {
    const inp = document.getElementById('tr-sub-new')
    const v = inp.value.trim()
    if (!v) return
    const tmpId = 'new-' + Math.random().toString(36).slice(2)
    document.getElementById('tr-subs').insertAdjacentHTML('beforeend', subRow(tmpId, v, false))
    inp.value = ''; inp.focus()
  })
  document.getElementById('tr-sub-new').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('tr-sub-add').click() }
  })
  document.getElementById('tr-subs').addEventListener('click', e => {
    const del = e.target.closest('.pj-sub-del')
    if (del) del.closest('.pj-sub-row').remove()
  })
  document.getElementById('tr-cancel').addEventListener('click', closeModal)
  if (!isNew) document.getElementById('tr-del').addEventListener('click', async () => {
    if (!confirm(`Excluir "${t.titulo}"?`)) return
    await delTar(t.id); closeModal()
  })
  document.getElementById('tr-save').addEventListener('click', async () => {
    const payload = {
      projeto_id: t.projeto_id || _curProj,
      titulo: document.getElementById('tr-titulo').value.trim(),
      descricao: document.getElementById('tr-desc').value.trim() || null,
      status: document.getElementById('tr-status').value,
      prioridade: document.getElementById('tr-prio').value,
      prazo: document.getElementById('tr-prazo').value || null,
      apelido_cliente: document.getElementById('tr-apelido').value.trim() || null,
      notificar_cliente: document.getElementById('tr-notif').checked,
      atualizado_em: new Date().toISOString(),
    }
    if (!payload.titulo) return toast('Título é obrigatório', 'err')

    let tarId = t.id
    if (isNew) {
      const { data, error } = await db.from('tarefas').insert(payload).select().single()
      if (error) return toast('Erro: ' + error.message, 'err')
      tarId = data.id
    } else {
      const { error } = await db.from('tarefas').update(payload).eq('id', tarId)
      if (error) return toast('Erro: ' + error.message, 'err')
    }

    const formRows = [...document.querySelectorAll('.pj-sub-row')]
    const existing = isNew ? [] : _subs.filter(s => s.tarefa_id === tarId)
    const keepIds = new Set()
    let ord = 0
    for (const row of formRows) {
      const id = row.dataset.sid
      const texto = row.querySelector('.pj-sub-text').value.trim()
      const feito = row.querySelector('.pj-sub-cb').checked
      if (!texto) continue
      if (id.startsWith('new-')) await db.from('tarefa_subtasks').insert({ tarefa_id: tarId, texto, feito, ordem: ord++ })
      else { keepIds.add(id); await db.from('tarefa_subtasks').update({ texto, feito, ordem: ord++ }).eq('id', id) }
    }
    for (const s of existing) if (!keepIds.has(s.id)) await db.from('tarefa_subtasks').delete().eq('id', s.id)

    closeModal()
    toast(isNew ? 'Tarefa criada' : 'Tarefa salva')
    render()
  })
}

function subRow(id, texto, feito) {
  return `<div class="pj-sub-row" data-sid="${id}">
    <input type="checkbox" class="pj-sub-cb" ${feito ? 'checked' : ''}>
    <input type="text" class="pj-sub-text fi" value="${escapeAttr(texto)}" style="flex:1">
    <button class="pj-sub-del" type="button" title="Remover">×</button>
  </div>`
}

async function delTar(id) {
  const { error } = await db.from('tarefas').delete().eq('id', id)
  if (error) return toast('Erro: ' + error.message, 'err')
  toast('Tarefa excluída')
  render()
}

// ════════ FORM ROTINA ════════════════════════════════════════════════════
function rotinaForm(r = {}) {
  const isNew = !r.id
  const cliOpts = `<option value="">— sem cliente —</option>` +
    clientesAtivos(r.cliente_id).map(c => `<option value="${c.id}"${r.cliente_id===c.id?' selected':''}>${escapeHtml(c.empresa || c.nome)}</option>`).join('')
  const projOpts = `<option value="">— escolha um projeto —</option>` +
    _projs.map(p => `<option value="${p.id}"${r.projeto_id===p.id?' selected':''}>${escapeHtml(p.nome)}</option>`).join('')

  const cad = r.cadencia || 'semanal'
  const dias = r.dias_semana || [1]
  const tarefasState = Array.isArray(r.tarefas) ? JSON.parse(JSON.stringify(r.tarefas)) : []

  const diasHTML = DIAS.map(d => `<label class="pj-dia-chip ${dias.includes(d.k)?'on':''}" data-d="${d.k}"><input type="checkbox" ${dias.includes(d.k)?'checked':''} style="display:none">${d.l}</label>`).join('')

  openModal(isNew ? 'Nova rotina' : 'Editar rotina', `
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="rt-nome" value="${escapeAttr(r.nome || '')}" placeholder="Ex: Rotina semanal Adriane"></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rt-cli">${cliOpts}</select></div>
      <div class="fg"><label class="fl">Projeto *</label><select class="fsl" id="rt-proj">${projOpts}</select></div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Cadência</label>
      <div class="pj-cad-row">
        <label class="pj-cad-opt ${cad==='diaria'?'on':''}"><input type="radio" name="rt-cad" value="diaria" ${cad==='diaria'?'checked':''}>Todo dia</label>
        <label class="pj-cad-opt ${cad==='semanal'?'on':''}"><input type="radio" name="rt-cad" value="semanal" ${cad==='semanal'?'checked':''}>Semanal</label>
        <label class="pj-cad-opt ${cad==='mensal'?'on':''}"><input type="radio" name="rt-cad" value="mensal" ${cad==='mensal'?'checked':''}>Mensal</label>
      </div>
    </div>
    <div class="fg" id="rt-dias-wrap" style="margin-bottom:11px;${cad==='semanal'?'':'display:none'}">
      <label class="fl">Dias da semana</label>
      <div class="pj-dias-row" id="rt-dias">${diasHTML}</div>
    </div>
    <div class="fg" id="rt-mes-wrap" style="margin-bottom:11px;${cad==='mensal'?'':'display:none'}">
      <label class="fl">Dia do mês (1–28)</label>
      <input class="fi" type="number" min="1" max="28" id="rt-dia-mes" value="${r.dia_mes || 1}" style="width:120px">
    </div>
    <div class="fg">
      <label class="fl">Tarefas que serão geradas</label>
      <div id="rt-tars" class="pj-rot-tars-edit"></div>
      <button class="btn bg bsm" id="rt-tar-add" type="button" style="margin-top:6px;align-self:flex-start">+ Tarefa</button>
    </div>
  `, `
    ${isNew ? '' : '<button class="btn bd" id="rt-del">Excluir</button>'}
    <button class="btn bg" id="rt-cancel">Cancelar</button>
    <button class="btn bp" id="rt-save">${isNew ? 'Criar' : 'Salvar'}</button>
  `)

  const renderTars = () => {
    document.getElementById('rt-tars').innerHTML = tarefasState.map((t, i) => {
      const incluir = t.notificar_cliente !== false
      return `
      <div class="pj-rot-tar-row" data-i="${i}" style="flex-direction:column;align-items:stretch;gap:6px;padding:10px;border:1px solid var(--line);border-radius:var(--rs);margin-bottom:6px">
        <div style="display:flex;gap:6px;align-items:center">
          <input type="text" class="fi rt-t-titulo" data-i="${i}" value="${escapeAttr(t.titulo||'')}" placeholder="Título interno" style="flex:2;padding:6px 9px;font-size:12.5px">
          <select class="fsl rt-t-prio" data-i="${i}" style="flex:1;padding:6px 9px;font-size:12.5px">
            ${PRIOS.map(p => `<option value="${p.k}"${(t.prioridade||'media')===p.k?' selected':''}>${p.l}</option>`).join('')}
          </select>
          <button class="pj-sub-del" type="button" data-i="${i}">×</button>
        </div>
        <input type="text" class="fi rt-t-apelido" data-i="${i}" value="${escapeAttr(t.apelido_cliente||'')}" placeholder="Como mostrar pro cliente (opcional)" style="padding:6px 9px;font-size:12.5px">
        <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-3);cursor:pointer">
          <input type="checkbox" class="rt-t-notif" data-i="${i}" ${incluir?'checked':''}>
          <span>Incluir no resumão pro cliente</span>
        </label>
      </div>`
    }).join('')
  }
  renderTars()

  document.getElementById('rt-tar-add').addEventListener('click', () => {
    tarefasState.push({ titulo: '', prioridade: 'media', apelido_cliente: '', notificar_cliente: true })
    renderTars()
  })
  document.getElementById('rt-tars').addEventListener('click', e => {
    const del = e.target.closest('.pj-sub-del')
    if (del) { tarefasState.splice(+del.dataset.i, 1); renderTars() }
  })
  document.getElementById('rt-tars').addEventListener('input', e => {
    const ti = e.target.closest('.rt-t-titulo')
    const pr = e.target.closest('.rt-t-prio')
    const ap = e.target.closest('.rt-t-apelido')
    if (ti) tarefasState[+ti.dataset.i].titulo = ti.value
    if (pr) tarefasState[+pr.dataset.i].prioridade = pr.value
    if (ap) tarefasState[+ap.dataset.i].apelido_cliente = ap.value
  })
  document.getElementById('rt-tars').addEventListener('change', e => {
    const nt = e.target.closest('.rt-t-notif')
    if (nt) tarefasState[+nt.dataset.i].notificar_cliente = nt.checked
  })

  // Cadência toggle
  document.querySelectorAll('input[name="rt-cad"]').forEach(rd => rd.addEventListener('change', () => {
    document.querySelectorAll('.pj-cad-opt').forEach(el => el.classList.toggle('on', el.querySelector('input').checked))
    const v = document.querySelector('input[name="rt-cad"]:checked').value
    document.getElementById('rt-dias-wrap').style.display = v === 'semanal' ? '' : 'none'
    document.getElementById('rt-mes-wrap').style.display  = v === 'mensal'  ? '' : 'none'
  }))
  // Dias da semana toggle
  document.getElementById('rt-dias').addEventListener('click', e => {
    const chip = e.target.closest('.pj-dia-chip')
    if (!chip) return
    e.preventDefault()
    chip.classList.toggle('on')
    chip.querySelector('input').checked = chip.classList.contains('on')
  })

  document.getElementById('rt-cancel').addEventListener('click', closeModal)
  if (!isNew) document.getElementById('rt-del').addEventListener('click', async () => {
    if (!confirm(`Excluir rotina "${r.nome}"?`)) return
    await db.from('rotinas').delete().eq('id', r.id)
    closeModal(); toast('Rotina excluída'); render()
  })

  document.getElementById('rt-save').addEventListener('click', async () => {
    const cadV = document.querySelector('input[name="rt-cad"]:checked').value
    const diasV = [...document.querySelectorAll('#rt-dias .pj-dia-chip.on')].map(el => +el.dataset.d)
    const payload = {
      nome: document.getElementById('rt-nome').value.trim(),
      cliente_id: document.getElementById('rt-cli').value || null,
      projeto_id: document.getElementById('rt-proj').value || null,
      cadencia: cadV,
      dias_semana: cadV === 'semanal' ? diasV : [],
      dia_mes: cadV === 'mensal' ? (+document.getElementById('rt-dia-mes').value || 1) : null,
      tarefas: tarefasState.filter(t => (t.titulo||'').trim()),
      atualizado_em: new Date().toISOString(),
    }
    if (!payload.nome)       return toast('Nome é obrigatório', 'err')
    if (!payload.projeto_id) return toast('Selecione um projeto', 'err')
    if (cadV === 'semanal' && !payload.dias_semana.length) return toast('Marque pelo menos 1 dia', 'err')
    if (!payload.tarefas.length) return toast('Adicione pelo menos 1 tarefa', 'err')

    const q = r.id
      ? db.from('rotinas').update(payload).eq('id', r.id)
      : db.from('rotinas').insert({ ...payload, ativa: true })
    const { error } = await q
    if (error) return toast('Erro: ' + error.message, 'err')
    closeModal()
    toast(r.id ? 'Rotina salva' : 'Rotina criada')
    render()
  })
}

// ════════ Auto-geração de tarefas a partir de rotinas ═══════════════════
function deveGerar(r, hoje) {
  const hojeStr = hoje.toISOString().slice(0,10)
  if (r.ultima_geracao === hojeStr) return false
  if (r.cadencia === 'diaria')  return true
  if (r.cadencia === 'semanal') return (r.dias_semana || []).includes(hoje.getDay())
  if (r.cadencia === 'mensal')  return hoje.getDate() === (r.dia_mes || 1)
  return false
}

async function gerarTarefasDeRotinas() {
  const hoje = new Date()
  const hojeStr = hoje.toISOString().slice(0,10)
  for (const r of _rotinas) {
    if (!r.ativa) continue
    if (!r.projeto_id) continue
    if (!deveGerar(r, hoje)) continue
    const proj = _projs.find(p => p.id === r.projeto_id)
    const etapaInicial = (etapasDe(proj)[0]?.k) || 'todo'
    const tars = (r.tarefas || []).filter(t => (t.titulo||'').trim()).map(t => ({
      projeto_id: r.projeto_id,
      rotina_id: r.id,
      titulo: t.titulo,
      descricao: t.descricao || `[Gerada pela rotina "${r.nome}"]`,
      prioridade: t.prioridade || 'media',
      status: etapaInicial,
      prazo: hojeStr,
      apelido_cliente: (t.apelido_cliente || '').trim() || null,
      notificar_cliente: t.notificar_cliente !== false,
    }))
    if (!tars.length) continue
    await db.from('tarefas').insert(tars)
    await db.from('rotinas').update({ ultima_geracao: hojeStr }).eq('id', r.id)
  }
}

async function rodarRotinaAgora(r) {
  if (!r.projeto_id) { toast('Rotina sem projeto', 'err'); return }
  const proj = _projs.find(p => p.id === r.projeto_id)
  const etapaInicial = (etapasDe(proj)[0]?.k) || 'todo'
  const hojeStr = new Date().toISOString().slice(0,10)

  // Anti-duplicação: checa se já existem tarefas dessa rotina geradas hoje.
  const { count } = await db
    .from('tarefas').select('id', { count: 'exact', head: true })
    .eq('rotina_id', r.id).eq('prazo', hojeStr)
  if ((count || 0) > 0) {
    if (!confirm(`Essa rotina já rodou hoje (${count} tarefa${count === 1 ? '' : 's'} já gerada${count === 1 ? '' : 's'}). Rodar de novo vai duplicar. Continuar mesmo assim?`)) {
      toast('Cancelado.', 'er'); return
    }
  }

  const tars = (r.tarefas || []).filter(t => (t.titulo||'').trim()).map(t => ({
    projeto_id: r.projeto_id,
    rotina_id: r.id,
    titulo: t.titulo,
    descricao: t.descricao || `[Gerada pela rotina "${r.nome}" — manual]`,
    prioridade: t.prioridade || 'media',
    status: etapaInicial,
    prazo: hojeStr,
    apelido_cliente: (t.apelido_cliente || '').trim() || null,
    notificar_cliente: t.notificar_cliente !== false,
  }))
  if (!tars.length) { toast('Rotina sem tarefas', 'err'); return }
  await db.from('tarefas').insert(tars)
  await db.from('rotinas').update({ ultima_geracao: hojeStr }).eq('id', r.id)
}

// Clientes que aparecem nos dropdowns: SÓ quem virou cliente de verdade.
// 'novo'/'qualificado' são leads em qualificação (não cliente ainda).
// 'prospeccao'/'perdido' nem precisam aparecer.
// Sempre inclui o `currentId` pra não quebrar edição de registros antigos.
function clientesAtivos(currentId) {
  const ativos = new Set(['proposta', 'ativo', 'em_pausa', 'fechado'])
  return _clis.filter(c => ativos.has(c.status) || c.id === currentId)
}

// ════════ Helpers ═══════════════════════════════════════════════════════
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]))
}
function escapeAttr(s) { return escapeHtml(s) }
