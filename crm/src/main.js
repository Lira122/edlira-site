import './style.css'
import { closeModal } from './utils.js'
import { signIn, signOut, getSession, bootstrapAdmin } from './auth.js'
import { db, isDbReady } from './db.js'

// ─── Engine state: pulso do motor de aquisição no topbar ─────────
async function refreshEngineState() {
  const el = document.getElementById('engine-state')
  if (!el || !isDbReady()) return
  try {
    const { data } = await db.from('agentes').select('status')
    const on = !data || !data.length || data.some(a => a.status === 'ativo')
    el.classList.toggle('on', on)
    el.querySelector('.lbl').textContent = on ? 'RODANDO' : 'PARADO'
  } catch (_) { /* silencioso */ }
}

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
    { render: renderBlog },
    { render: renderUso },
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
    import('./views/blog.js'),
    import('./views/uso.js'),
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
    blog:         { title: 'Blog',         render: renderBlog },
    uso:          { title: 'Uso de IA',    render: renderUso },
  }
  return VIEWS
}

export function go(v) {
  if (!VIEWS || !VIEWS[v]) return
  document.querySelectorAll('.ni').forEach(el => el.classList.toggle('on', el.dataset.v === v))
  document.getElementById('vtitle').textContent = VIEWS[v].title
  document.getElementById('tbacts').innerHTML = ''
  document.body.dataset.view = v
  VIEWS[v].render()
}

async function showApp() {
  await loadViews()
  document.getElementById('auth').style.display = 'none'
  document.getElementById('app').classList.remove('h')
  go('dashboard')
  refreshEngineState()
  setInterval(refreshEngineState, 30000) // sincroniza a cada 30s
}

function setErr(msg) {
  const el = document.getElementById('ae-err')
  const inputs = [document.getElementById('ae-email'), document.getElementById('ae-pw')]
  el.textContent = msg || ''
  el.classList.toggle('on', !!msg)
  if (msg) {
    inputs.forEach(i => i.classList.add('err'))
    setTimeout(() => inputs.forEach(i => i.classList.remove('err')), 420)
    setTimeout(() => {
      if (el.textContent === msg) { el.textContent = ''; el.classList.remove('on') }
    }, 4000)
  }
}

async function doLogin() {
  const email = document.getElementById('ae-email').value.trim()
  const password = document.getElementById('ae-pw').value
  const btn = document.getElementById('ae-btn')
  const lbl = btn.querySelector('.auth-btn-label')
  if (!email || !password) return setErr('Preenche email e senha.')
  btn.disabled = true
  btn.classList.add('loading')
  if (lbl) lbl.textContent = 'Entrando'
  try {
    await signIn(email, password)
    await showApp()
  } catch (e) {
    setErr(e.message || 'Erro ao entrar.')
    btn.disabled = false
    btn.classList.remove('loading')
    if (lbl) lbl.textContent = 'Entrar'
  }
}

document.getElementById('auth-form').addEventListener('submit', e => { e.preventDefault(); doLogin() })

// Toggle mostrar/ocultar senha
document.getElementById('ae-eye').addEventListener('click', () => {
  const pw  = document.getElementById('ae-pw')
  const eye = document.getElementById('ae-eye')
  const showing = pw.type === 'text'
  pw.type = showing ? 'password' : 'text'
  eye.classList.toggle('on', !showing)
})

// Spotlight segue o mouse — só enquanto a tela de login estiver visível
;(() => {
  const auth = document.getElementById('auth')
  if (!auth) return
  let raf = 0
  document.addEventListener('mousemove', e => {
    if (auth.classList.contains('h') || auth.style.display === 'none') return
    if (raf) return
    raf = requestAnimationFrame(() => {
      auth.style.setProperty('--mx', e.clientX + 'px')
      auth.style.setProperty('--my', e.clientY + 'px')
      raf = 0
    })
  })
})()
document.getElementById('logout-link').addEventListener('click', e => { e.preventDefault(); signOut() })

// Nav clicks (fecha drawer mobile ao escolher item)
document.getElementById('sb-nav').addEventListener('click', e => {
  const ni = e.target.closest('.ni')
  if (ni) { go(ni.dataset.v); document.body.classList.remove('sb-open') }
})

// Toggle drawer (mobile)
document.getElementById('sb-toggle')?.addEventListener('click', () => {
  document.body.classList.toggle('sb-open')
})
// Fecha drawer clicando no overlay (fora do menu)
document.addEventListener('click', (e) => {
  if (!document.body.classList.contains('sb-open')) return
  if (e.target.closest('.sb') || e.target.closest('#sb-toggle')) return
  document.body.classList.remove('sb-open')
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
