import './style.css'
import { closeModal } from './utils.js'
import { render as renderDash }         from './views/dashboard.js'
import { render as renderClientes }     from './views/clientes.js'
import { render as renderProspeccao }   from './views/prospeccao.js'
import { render as renderPipeline }     from './views/pipeline.js'
import { render as renderFunil }        from './views/funil.js'
import { render as renderFollowup }     from './views/followup.js'
import { render as renderMensalidades } from './views/mensalidades.js'
import { render as renderFat }          from './views/faturamento.js'
import { render as renderAgentes }      from './views/agentes.js'
import { render as renderCriativos }    from './views/criativos.js'
import { render as renderEmpresa }      from './views/empresa.js'

// ── Auth ─────────────────────────────────────────
const _pw = ['X6vk','QW9Y','5mIG','l5W1'].join('')
const AK  = 'e_auth_1'

function authed() {
  try {
    const d = JSON.parse(localStorage.getItem(AK) || 'null')
    return d && Date.now() < d.e
  } catch { return false }
}

function doAuth() {
  const val = document.getElementById('ain').value
  if (val === _pw) {
    localStorage.setItem(AK, JSON.stringify({ e: Date.now() + 30 * 24 * 60 * 60 * 1000 }))
    showApp()
  } else {
    const el = document.getElementById('ain')
    el.classList.add('err')
    document.getElementById('aerr').textContent = 'Senha incorreta.'
    setTimeout(() => { el.classList.remove('err'); document.getElementById('aerr').textContent = '' }, 2000)
  }
}

function showApp() {
  document.getElementById('auth').classList.add('h')
  document.getElementById('app').classList.remove('h')
  go('dashboard')
}

document.getElementById('auth-btn').addEventListener('click', doAuth)
document.getElementById('ain').addEventListener('keydown', e => { if (e.key === 'Enter') doAuth() })

// ── Router ───────────────────────────────────────
const VIEWS = {
  dashboard:    { title: 'Dashboard',    render: renderDash },
  clientes:     { title: 'Clientes',     render: renderClientes },
  prospeccao:   { title: 'Prospecção',   render: renderProspeccao },
  pipeline:     { title: 'Pipeline',     render: renderPipeline },
  followup:     { title: 'Follow-up',    render: renderFollowup },
  funil:        { title: 'Funil',        render: renderFunil },
  mensalidades: { title: 'Mensalidades', render: renderMensalidades },
  faturamento:  { title: 'Faturamento',  render: renderFat },
  agentes:      { title: 'Agentes IA',   render: renderAgentes },
  criativos:    { title: 'Criativos IA', render: renderCriativos },
  empresa:      { title: 'Empresa',      render: renderEmpresa },
}

export function go(v) {
  document.querySelectorAll('.ni').forEach(el => el.classList.toggle('on', el.dataset.v === v))
  document.getElementById('vtitle').textContent = VIEWS[v].title
  document.getElementById('tbacts').innerHTML = ''
  VIEWS[v].render()
}

// Nav clicks
document.getElementById('sb-nav').addEventListener('click', e => {
  const ni = e.target.closest('.ni')
  if (ni) go(ni.dataset.v)
})

// Global event delegation for data-go attributes (e.g. dashboard "Ver todos" button)
document.addEventListener('click', e => {
  const el = e.target.closest('[data-go]')
  if (el) go(el.dataset.go)
})

// Modal close
document.getElementById('modal-close').addEventListener('click', closeModal)
document.getElementById('ov').addEventListener('click', e => {
  if (e.target === document.getElementById('ov')) closeModal()
})

// ── Init ─────────────────────────────────────────
if (authed()) {
  showApp()
} else {
  document.getElementById('auth').style.display = 'flex'
}
