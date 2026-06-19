import './style.css'
import { closeModal } from './utils.js'
import { signIn, signOut, getSession, bootstrapAdmin } from './auth.js'

// View imports são lazy — só carregam após login.
let VIEWS = null
async function loadViews() {
  if (VIEWS) return VIEWS
  const [
    { render: renderDash },
    { render: renderAgenda },
    { render: renderMeus },
    { render: renderClientes },
    { render: renderProspeccao },
    { render: renderPipeline },
    { render: renderFunil },
    { render: renderFollowup },
    { render: renderMensalidades },
    { render: renderFat },
    { render: renderAgentes },
    { render: renderInstancia },
    { render: renderCriativos },
    { render: renderEmpresa },
    { render: renderOnboarding },
    { render: renderProjetos },
  ] = await Promise.all([
    import('./views/dashboard.js'),
    import('./views/agenda.js'),
    import('./views/meus.js'),
    import('./views/clientes.js'),
    import('./views/prospeccao.js'),
    import('./views/pipeline.js'),
    import('./views/funil.js'),
    import('./views/followup.js'),
    import('./views/mensalidades.js'),
    import('./views/faturamento.js'),
    import('./views/agentes.js'),
    import('./views/instancia.js'),
    import('./views/criativos.js'),
    import('./views/empresa.js'),
    import('./views/onboarding.js'),
    import('./views/projetos.js'),
  ])
  VIEWS = {
    dashboard:    { title: 'Dashboard',    render: renderDash },
    agenda:       { title: 'Agenda',       render: renderAgenda },
    projetos:     { title: 'Projetos',     render: renderProjetos },
    meus:         { title: 'Meus Clientes', render: renderMeus },
    clientes:     { title: 'Clientes',     render: renderClientes },
    prospeccao:   { title: 'Prospecção',   render: renderProspeccao },
    pipeline:     { title: 'Pipeline',     render: renderPipeline },
    followup:     { title: 'Follow-up',    render: renderFollowup },
    funil:        { title: 'Funil',        render: renderFunil },
    mensalidades: { title: 'Mensalidades', render: renderMensalidades },
    faturamento:  { title: 'Faturamento',  render: renderFat },
    agentes:      { title: 'Agentes IA',   render: renderAgentes },
    instancia:    { title: 'WhatsApp',     render: renderInstancia },
    criativos:    { title: 'Criativos IA', render: renderCriativos },
    empresa:      { title: 'Empresa',      render: renderEmpresa },
    onboarding:   { title: 'Onboarding',   render: renderOnboarding },
  }
  return VIEWS
}

export function go(v) {
  if (!VIEWS || !VIEWS[v]) return
  document.querySelectorAll('.ni').forEach(el => el.classList.toggle('on', el.dataset.v === v))
  document.getElementById('vtitle').textContent = VIEWS[v].title
  document.getElementById('tbacts').innerHTML = ''
  VIEWS[v].render()
}

async function showApp() {
  await loadViews()
  document.getElementById('auth').style.display = 'none'
  document.getElementById('app').classList.remove('h')
  go('dashboard')
}

function setErr(msg) {
  const el = document.getElementById('ae-err')
  el.textContent = msg || ''
  if (msg) setTimeout(() => { if (el.textContent === msg) el.textContent = '' }, 4000)
}

async function doLogin() {
  const email = document.getElementById('ae-email').value.trim()
  const password = document.getElementById('ae-pw').value
  const btn = document.getElementById('ae-btn')
  if (!email || !password) return setErr('Preenche email e senha.')
  btn.disabled = true
  btn.textContent = 'Entrando…'
  try {
    await signIn(email, password)
    await showApp()
  } catch (e) {
    setErr(e.message || 'Erro ao entrar.')
    btn.disabled = false
    btn.textContent = 'Entrar'
  }
}

document.getElementById('ae-btn').addEventListener('click', doLogin)
document.getElementById('ae-email').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin() })
document.getElementById('ae-pw').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin() })
document.getElementById('logout-link').addEventListener('click', e => { e.preventDefault(); signOut() })

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

// ── Auto-login se sessão ainda válida ─────────────
;(async () => {
  const session = await getSession()
  if (!session) return
  try {
    await bootstrapAdmin(session)
    await showApp()
  } catch (e) {
    // sessão existe mas server rejeitou — força login manual
    await signOut()
  }
})()
