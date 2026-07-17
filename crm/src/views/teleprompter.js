import { db, selectAll } from '../db.js'
import { toast, openModal, closeModal } from '../utils.js'

// ═══════════════════════════════════════════════════════════════════════
//  Teleprompter — scroll automatico de roteiro pra voce gravar Reels,
//  YouTube, TikTok, etc. Funciona no PC e no celular (touch controls).
//
//  Modo player: overlay fullscreen com texto grande, autoscroll suave,
//  play/pause com espaco/toque, ajuste de velocidade e fonte na hora,
//  mirror mode (pra usar com espelho fisico de teleprompter).
//
//  Atalhos de teclado: espaco=play/pause, esc=sair, setas=fonte/velocidade
// ═══════════════════════════════════════════════════════════════════════

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
))

let _scripts = []
let _wakeLock = null

const PREFS_KEY = 'teleprompter_prefs'
function getPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') } catch { return {} }
}
function setPrefs(p) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(p))
}

function estimarDuracaoSeg(texto, wpm) {
  const palavras = String(texto || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(palavras / wpm * 60))
}
function fmtDur(seg) {
  if (seg < 60) return `${seg}s`
  const m = Math.floor(seg / 60), s = seg % 60
  return s ? `${m}min ${s}s` : `${m}min`
}

export async function render() {
  const c = document.getElementById('content')
  document.getElementById('tbacts').innerHTML = `
    <button class="btn bp" id="tp-new">+ Novo roteiro</button>`

  c.innerHTML = '<div class="empty">Carregando roteiros...</div>'
  const { data, error } = await selectAll('teleprompter_scripts', {
    order: { column: 'atualizado_em', ascending: false }
  })

  if (error) {
    c.innerHTML = `
      <div class="empty" style="padding:60px 20px;text-align:center">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Tabela ainda nao existe</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:18px;line-height:1.5;max-width:520px;margin-left:auto;margin-right:auto">
          Roda o SQL em <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace">supabase/teleprompter-schema.sql</code>
          no <a href="https://supabase.com/dashboard/project/flzpblpegoqjxaacjvhf/sql" target="_blank" style="color:var(--accent)">SQL Editor</a>
          e recarrega essa aba.
        </div>
        <div style="font-size:11px;color:var(--text-3)">${esc(error.message)}</div>
      </div>`
    document.getElementById('tp-new').disabled = true
    return
  }

  _scripts = data || []
  document.getElementById('tp-new').addEventListener('click', () => editorForm())

  if (!_scripts.length) {
    c.innerHTML = `
      <div class="empty" style="padding:60px 20px;text-align:center">
        <div style="font-size:48px;margin-bottom:14px">🎬</div>
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhum roteiro salvo</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:22px;line-height:1.5;max-width:420px;margin-left:auto;margin-right:auto">
          Cria seu primeiro roteiro. Depois clica em Executar e o texto rola sozinho na tela enquanto voce le em frente a camera.
        </div>
        <button class="btn bp" id="tp-first">Criar meu primeiro roteiro</button>
      </div>`
    document.getElementById('tp-first').addEventListener('click', () => editorForm())
    return
  }

  c.innerHTML = `
    <div style="margin-bottom:14px;font-size:12px;color:var(--text-3)">
      ${_scripts.length} roteiro${_scripts.length===1?'':'s'} · dica: rotaciona o celular pro modo paisagem antes de executar
    </div>
    <div id="tp-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px"></div>`

  document.getElementById('tp-list').innerHTML = _scripts.map(cardHTML).join('')

  document.querySelectorAll('.tp-play').forEach(b => b.addEventListener('click', () => {
    const s = _scripts.find(x => x.id === b.dataset.id); if (s) player(s)
  }))
  document.querySelectorAll('.tp-edit').forEach(b => b.addEventListener('click', () => {
    const s = _scripts.find(x => x.id === b.dataset.id); if (s) editorForm(s)
  }))
  document.querySelectorAll('.tp-del').forEach(b => b.addEventListener('click', async () => {
    const s = _scripts.find(x => x.id === b.dataset.id); if (!s) return
    if (!confirm(`Excluir roteiro "${s.titulo}"?`)) return
    const { error } = await db.from('teleprompter_scripts').delete().eq('id', s.id)
    if (error) { toast('Erro: ' + error.message, 'err'); return }
    toast('Roteiro excluido'); render()
  }))
}

function cardHTML(s) {
  const dur = estimarDuracaoSeg(s.conteudo, s.velocidade_wpm || 150)
  const preview = (s.conteudo || '').replace(/\s+/g,' ').slice(0, 100)
  const tags = (s.tags || []).map(t =>
    `<span style="font-size:10px;background:rgba(255,255,255,.04);color:var(--text-3);padding:2px 7px;border-radius:10px;border:1px solid var(--line)">${esc(t)}</span>`
  ).join('')
  return `
    <div class="tw" style="padding:14px 16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px">
        <div style="font-weight:500;font-size:14px;line-height:1.35">${esc(s.titulo)}</div>
        <div style="font-size:11px;color:var(--text-3);white-space:nowrap">~${fmtDur(dur)}</div>
      </div>
      <div style="font-size:12px;color:var(--text-3);margin-bottom:10px;line-height:1.5">${esc(preview)}${(s.conteudo||'').length > 100 ? '…' : ''}</div>
      ${tags ? `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">${tags}</div>` : ''}
      <div style="display:flex;gap:6px;padding-top:10px;border-top:1px solid var(--line)">
        <button class="btn bp bsm tp-play" data-id="${s.id}" style="flex:1">▶ Executar</button>
        <button class="btn bg bsm tp-edit" data-id="${s.id}">✎</button>
        <button class="btn bd bsm tp-del" data-id="${s.id}">🗑</button>
      </div>
      ${s.vezes_usado > 0 ? `<div style="font-size:10px;color:var(--text-3);margin-top:8px">Usado ${s.vezes_usado}x</div>` : ''}
    </div>`
}

function editorForm(s = {}) {
  const isNew = !s.id
  const tagsStr = (s.tags || []).join(', ')
  const conteudo = s.conteudo || ''
  const wpm = s.velocidade_wpm || 150
  const fonte = s.tamanho_fonte || 48

  openModal(isNew ? 'Novo roteiro' : 'Editar roteiro', `
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Titulo *</label>
      <input class="fi" id="tp-titulo" value="${esc(s.titulo || '')}" placeholder="Ex: Reel Marmoraria Colorado antes e depois" autofocus>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Roteiro *</label>
      <textarea class="fta" id="tp-conteudo" rows="14" placeholder="Cola aqui o texto que voce vai ler. Quebras de linha viram pausas naturais.">${esc(conteudo)}</textarea>
      <div id="tp-stats" style="font-size:11px;color:var(--text-3);margin-top:5px"></div>
    </div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg">
        <label class="fl">Velocidade (palavras/min)</label>
        <input class="fi" type="number" id="tp-wpm" value="${wpm}" min="60" max="300" step="10">
        <div style="font-size:10px;color:var(--text-3);margin-top:3px">150 = leitura normal · 180 = ritmo Reels · 220 = rapido</div>
      </div>
      <div class="fg">
        <label class="fl">Tamanho da fonte</label>
        <input class="fi" type="number" id="tp-fonte" value="${fonte}" min="24" max="120" step="4">
        <div style="font-size:10px;color:var(--text-3);margin-top:3px">48 = padrao · maior pra celular longe do olho</div>
      </div>
    </div>
    <div class="fg">
      <label class="fl">Tags (separadas por virgula)</label>
      <input class="fi" id="tp-tags" value="${esc(tagsStr)}" placeholder="reel, adriane, tema-A">
    </div>
  `, `
    ${isNew ? '' : '<button class="btn bd" id="tp-del-modal">Excluir</button>'}
    <button class="btn bg" id="tp-cancel">Cancelar</button>
    <button class="btn bp" id="tp-save">${isNew ? 'Salvar' : 'Atualizar'}</button>
  `)

  const updateStats = () => {
    const txt = document.getElementById('tp-conteudo').value
    const w = Number(document.getElementById('tp-wpm').value) || 150
    const palavras = txt.trim().split(/\s+/).filter(Boolean).length
    const seg = estimarDuracaoSeg(txt, w)
    document.getElementById('tp-stats').textContent = `${palavras} palavras · duracao estimada ~${fmtDur(seg)}`
  }
  document.getElementById('tp-conteudo').addEventListener('input', updateStats)
  document.getElementById('tp-wpm').addEventListener('input', updateStats)
  updateStats()

  document.getElementById('tp-cancel').addEventListener('click', closeModal)

  if (!isNew) {
    document.getElementById('tp-del-modal').addEventListener('click', async () => {
      if (!confirm(`Excluir "${s.titulo}"?`)) return
      await db.from('teleprompter_scripts').delete().eq('id', s.id)
      closeModal(); toast('Roteiro excluido'); render()
    })
  }

  document.getElementById('tp-save').addEventListener('click', async () => {
    const titulo = document.getElementById('tp-titulo').value.trim()
    const conteudo = document.getElementById('tp-conteudo').value.trim()
    if (!titulo) return toast('Titulo obrigatorio', 'err')
    if (!conteudo) return toast('Roteiro vazio', 'err')

    const payload = {
      titulo,
      conteudo,
      velocidade_wpm: Number(document.getElementById('tp-wpm').value) || 150,
      tamanho_fonte: Number(document.getElementById('tp-fonte').value) || 48,
      tags: document.getElementById('tp-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      atualizado_em: new Date().toISOString(),
    }

    const op = isNew
      ? db.from('teleprompter_scripts').insert(payload).select().single()
      : db.from('teleprompter_scripts').update(payload).eq('id', s.id).select().single()

    const { error } = await op
    if (error) return toast('Erro: ' + error.message, 'err')
    toast(isNew ? 'Roteiro criado' : 'Atualizado')
    closeModal(); render()
  })
}

// ═══════════════════════════════════════════════════════════════════════
//  PLAYER: overlay fullscreen com scroll automatico
// ═══════════════════════════════════════════════════════════════════════
async function player(script) {
  const prefs = getPrefs()
  let wpm = prefs.wpm ?? script.velocidade_wpm ?? 150
  let fonte = prefs.fonte ?? script.tamanho_fonte ?? 48
  let mirror = !!prefs.mirror
  let playing = false
  let rafId = 0
  let scrollY = 0
  let ultimoT = 0
  let controlHideT = 0

  const ov = document.createElement('div')
  ov.id = 'tp-player-ov'
  ov.setAttribute('role', 'application')
  ov.innerHTML = `
    <div class="tp-player-marker"></div>
    <div class="tp-player-scroll" id="tp-scroll">
      <div class="tp-player-inner">
        <div class="tp-player-topspacer"></div>
        <div class="tp-player-texto" id="tp-texto">${esc(script.conteudo).replace(/\n/g, '<br>')}</div>
        <div class="tp-player-botspacer"></div>
      </div>
    </div>
    <div class="tp-player-controls" id="tp-controls">
      <button class="tp-btn tp-btn-close" id="tp-close" title="Sair (Esc)">✕</button>
      <div class="tp-btn-group">
        <button class="tp-btn" id="tp-speed-down" title="Mais devagar">−</button>
        <span class="tp-badge" id="tp-speed-lbl">${wpm} wpm</span>
        <button class="tp-btn" id="tp-speed-up" title="Mais rapido">+</button>
      </div>
      <button class="tp-btn tp-btn-play" id="tp-play" title="Play/Pause (Espaco)">▶</button>
      <div class="tp-btn-group">
        <button class="tp-btn" id="tp-font-down" title="Fonte menor">A−</button>
        <button class="tp-btn" id="tp-font-up" title="Fonte maior">A+</button>
      </div>
      <button class="tp-btn ${mirror?'tp-btn-on':''}" id="tp-mirror" title="Modo espelho">⇋</button>
    </div>
    <div class="tp-player-hint" id="tp-hint">Toque na tela pra play/pause</div>
    <style>
      #tp-player-ov {
        position:fixed;inset:0;z-index:9999;background:#000;color:#fff;
        display:flex;flex-direction:column;align-items:stretch;
        overflow:hidden;-webkit-user-select:none;user-select:none;
      }
      .tp-player-marker {
        position:absolute;left:0;right:0;top:35%;height:2px;
        background:linear-gradient(90deg,transparent,#C5F82A,transparent);
        opacity:.45;pointer-events:none;z-index:10;
      }
      .tp-player-scroll {
        flex:1;overflow:hidden;position:relative;
      }
      .tp-player-inner {
        transform: ${mirror ? 'scaleX(-1)' : 'none'};
        transition: transform .2s;
        padding: 0 max(24px, env(safe-area-inset-left)) 0 max(24px, env(safe-area-inset-right));
      }
      .tp-player-topspacer { height: 45vh; }
      .tp-player-botspacer { height: 60vh; }
      .tp-player-texto {
        font-family:'Inter',system-ui,sans-serif;
        font-weight:500;
        font-size:${fonte}px;
        line-height:1.35;
        max-width: 1100px;
        margin: 0 auto;
        text-align:center;
        letter-spacing:-.01em;
      }
      .tp-player-controls {
        position:absolute;left:0;right:0;bottom:0;
        display:flex;align-items:center;justify-content:center;gap:14px;
        padding: 16px max(24px,env(safe-area-inset-left)) max(20px,env(safe-area-inset-bottom)) max(24px,env(safe-area-inset-right));
        background:linear-gradient(to top, rgba(0,0,0,.85), transparent);
        transition:opacity .3s;
        flex-wrap:wrap;
      }
      .tp-player-controls.hidden { opacity:0;pointer-events:none }
      .tp-btn {
        background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);
        color:#fff;font-size:15px;font-weight:600;padding:10px 14px;
        border-radius:10px;cursor:pointer;min-width:44px;
        transition: background .15s, transform .1s;
      }
      .tp-btn:active { transform: scale(.94) }
      .tp-btn:hover { background:rgba(255,255,255,.14) }
      .tp-btn-close { background:rgba(255,92,92,.15);border-color:rgba(255,92,92,.3) }
      .tp-btn-play { background:#C5F82A;color:#000;font-size:22px;min-width:66px;padding:12px 22px }
      .tp-btn-on { background:#C5F82A;color:#000 }
      .tp-btn-group { display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.04);padding:4px;border-radius:12px }
      .tp-badge { font-size:12px;color:#A0A0A0;padding:0 8px;min-width:70px;text-align:center }
      .tp-player-hint {
        position:absolute;top:18px;left:50%;transform:translateX(-50%);
        font-size:12px;color:rgba(255,255,255,.5);padding:6px 14px;
        background:rgba(0,0,0,.5);border-radius:20px;
        pointer-events:none;transition:opacity .4s;
      }
      .tp-player-hint.hidden { opacity:0 }
      @media (max-width: 720px) {
        .tp-player-texto { font-size:${Math.max(28, fonte - 8)}px }
        .tp-btn { padding:9px 12px;font-size:14px }
        .tp-btn-play { font-size:19px;min-width:56px }
        .tp-badge { min-width:60px;font-size:11px }
      }
    </style>`
  document.body.appendChild(ov)

  const scrollEl = document.getElementById('tp-scroll')
  const inner = ov.querySelector('.tp-player-inner')
  const btnPlay = document.getElementById('tp-play')
  const btnClose = document.getElementById('tp-close')
  const btnMirror = document.getElementById('tp-mirror')
  const speedLbl = document.getElementById('tp-speed-lbl')
  const texto = document.getElementById('tp-texto')
  const controls = document.getElementById('tp-controls')
  const hint = document.getElementById('tp-hint')

  async function pedirWakeLock() {
    if (!('wakeLock' in navigator)) return
    try { _wakeLock = await navigator.wakeLock.request('screen') } catch (_) {}
  }
  async function soltarWakeLock() {
    try { await _wakeLock?.release(); _wakeLock = null } catch (_) {}
  }

  function resetControlHide() {
    controls.classList.remove('hidden')
    clearTimeout(controlHideT)
    controlHideT = setTimeout(() => {
      if (playing) controls.classList.add('hidden')
    }, 2800)
  }

  function velocidadePxPorSeg() {
    const linhasPorMin = wpm / 10
    const alturaLinha = fonte * 1.35
    return (linhasPorMin * alturaLinha) / 60
  }

  function loop(t) {
    if (!playing) return
    if (!ultimoT) ultimoT = t
    const dt = (t - ultimoT) / 1000
    ultimoT = t
    scrollY += velocidadePxPorSeg() * dt
    scrollEl.scrollTop = scrollY
    if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 4) {
      pause()
      controls.classList.remove('hidden')
    }
    rafId = requestAnimationFrame(loop)
  }

  function play() {
    if (playing) return
    playing = true
    ultimoT = 0
    btnPlay.textContent = '⏸'
    hint.classList.add('hidden')
    resetControlHide()
    pedirWakeLock()
    rafId = requestAnimationFrame(loop)
  }
  function pause() {
    playing = false
    btnPlay.textContent = '▶'
    controls.classList.remove('hidden')
    cancelAnimationFrame(rafId)
    soltarWakeLock()
  }
  function toggle() {
    if (playing) pause(); else play()
  }

  function fecharPlayer() {
    pause()
    soltarWakeLock()
    ov.remove()
    db.from('teleprompter_scripts').update({
      vezes_usado: (script.vezes_usado || 0) + 1,
      ultimo_uso: new Date().toISOString(),
    }).eq('id', script.id).then(() => {}, () => {})
    document.removeEventListener('keydown', onKey)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }

  function onKey(e) {
    if (e.key === 'Escape') { fecharPlayer(); e.preventDefault() }
    if (e.key === ' ')      { toggle(); e.preventDefault() }
    if (e.key === 'ArrowUp')    { fonte = Math.min(120, fonte + 4); atualizarFonte() }
    if (e.key === 'ArrowDown')  { fonte = Math.max(24, fonte - 4); atualizarFonte() }
    if (e.key === 'ArrowRight') { wpm = Math.min(300, wpm + 10); atualizarWpm() }
    if (e.key === 'ArrowLeft')  { wpm = Math.max(60, wpm - 10); atualizarWpm() }
  }

  function atualizarFonte() {
    texto.style.fontSize = fonte + 'px'
    setPrefs({ ...getPrefs(), fonte })
  }
  function atualizarWpm() {
    speedLbl.textContent = wpm + ' wpm'
    setPrefs({ ...getPrefs(), wpm })
  }
  function atualizarMirror() {
    inner.style.transform = mirror ? 'scaleX(-1)' : 'none'
    btnMirror.classList.toggle('tp-btn-on', mirror)
    setPrefs({ ...getPrefs(), mirror })
  }

  btnPlay.addEventListener('click', toggle)
  btnClose.addEventListener('click', fecharPlayer)
  btnMirror.addEventListener('click', () => { mirror = !mirror; atualizarMirror() })
  document.getElementById('tp-speed-up').addEventListener('click', () => { wpm = Math.min(300, wpm + 10); atualizarWpm() })
  document.getElementById('tp-speed-down').addEventListener('click', () => { wpm = Math.max(60, wpm - 10); atualizarWpm() })
  document.getElementById('tp-font-up').addEventListener('click', () => { fonte = Math.min(120, fonte + 4); atualizarFonte() })
  document.getElementById('tp-font-down').addEventListener('click', () => { fonte = Math.max(24, fonte - 4); atualizarFonte() })

  scrollEl.addEventListener('click', (e) => {
    if (e.target.closest('.tp-btn') || e.target.closest('.tp-btn-group')) return
    toggle()
  })
  scrollEl.addEventListener('touchstart', resetControlHide, { passive: true })
  scrollEl.addEventListener('mousemove', resetControlHide)

  document.addEventListener('keydown', onKey)

  setTimeout(() => hint.classList.add('hidden'), 4000)

  try { await document.documentElement.requestFullscreen() } catch (_) {}

  const countEl = document.createElement('div')
  countEl.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.6);
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Grotesk','Inter',sans-serif;font-size:200px;
    font-weight:700;color:#C5F82A;z-index:10000;transition:opacity .3s;
  `
  ov.appendChild(countEl)
  for (const n of ['3', '2', '1', 'GO']) {
    countEl.textContent = n
    await new Promise(r => setTimeout(r, n === 'GO' ? 500 : 800))
  }
  countEl.remove()
  play()
}
