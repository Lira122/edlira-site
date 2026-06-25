import { db, selectAll } from '../db.js'
import { toast, openModal, closeModal } from '../utils.js'

// ════════════════════════════════════════════════════════════════
//  Cofre de senhas com criptografia client-side (AES-GCM 256).
//
//  Como funciona:
//  1. Primeira vez: usuário cria uma SENHA MESTRA. Geramos um salt
//     aleatório, derivamos uma chave via PBKDF2 (310k iterações,
//     SHA-256), e criptografamos a string "OK" pra usar como verify.
//     Salt + verify ficam em vault_meta.
//  2. Próximas vezes: usuário digita a senha mestra. Derivamos a chave
//     com o salt salvo, tentamos descriptografar o verify. Se sair "OK",
//     senha tá certa. A chave fica SÓ na memória.
//  3. Senhas guardadas: cada uma cifrada com AES-GCM (IV aleatório por
//     entrada). Mesmo que vaze o banco, vira blob ilegível sem a chave.
//  4. Auto-lock: 10 min de inatividade. Limpa chave da memória.
//
//  IMPORTANTE: se você esquecer a senha mestra, NÃO TEM COMO RECUPERAR
//  as senhas guardadas. A criptografia é forte de propósito.
// ════════════════════════════════════════════════════════════════

let _key = null               // CryptoKey (em memória apenas)
let _meta = null              // { salt, verify_cifrado, verify_iv }
let _lockTimer = null
const LOCK_MS = 10 * 60 * 1000

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
))

// ─── Helpers de cripto (Web Crypto API nativa do browser) ─────────────
const b64enc = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const b64dec = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0))
const enc = new TextEncoder()
const dec = new TextDecoder()

async function deriveKey(senhaMestra, saltB64) {
  const salt = b64dec(saltB64)
  const material = await crypto.subtle.importKey(
    'raw', enc.encode(senhaMestra), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 310_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

async function encryptText(key, texto) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(texto))
  return { cifrado: b64enc(ct), iv: b64enc(iv) }
}

async function decryptText(key, cifradoB64, ivB64) {
  try {
    const ct = b64dec(cifradoB64)
    const iv = b64dec(ivB64)
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
    return dec.decode(pt)
  } catch {
    return null
  }
}

function randomB64(bytes = 16) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes))
  return b64enc(arr)
}

// ─── Estado da sessão / auto-lock ─────────────────────────────────────
function resetLockTimer() {
  if (_lockTimer) clearTimeout(_lockTimer)
  _lockTimer = setTimeout(() => {
    _key = null
    toast('Cofre travado por inatividade (10 min)', 'warn')
    if (document.body.dataset.view === 'senhas') render()
  }, LOCK_MS)
}

function travar() {
  _key = null
  if (_lockTimer) { clearTimeout(_lockTimer); _lockTimer = null }
  render()
  toast('Cofre travado')
}

// ─── Carregamento e setup inicial ─────────────────────────────────────
async function carregarMeta() {
  const { data, error } = await db.from('vault_meta').select('*').eq('id', 1).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

async function criarMeta(senhaMestra) {
  const salt = randomB64(16)
  const key = await deriveKey(senhaMestra, salt)
  const { cifrado, iv } = await encryptText(key, 'OK')
  const { error } = await db.from('vault_meta').insert({
    id: 1, salt, verify_cifrado: cifrado, verify_iv: iv,
  })
  if (error) throw new Error(error.message)
  return { key, meta: { salt, verify_cifrado: cifrado, verify_iv: iv } }
}

async function destravar(senhaMestra) {
  if (!_meta) _meta = await carregarMeta()
  if (!_meta) {
    // Primeira vez: cria o cofre
    const { key } = await criarMeta(senhaMestra)
    _key = key
    _meta = await carregarMeta()
    return true
  }
  const key = await deriveKey(senhaMestra, _meta.salt)
  const ok = await decryptText(key, _meta.verify_cifrado, _meta.verify_iv)
  if (ok !== 'OK') return false
  _key = key
  return true
}

// ─── Render: tela de unlock OU lista de senhas ────────────────────────
export async function render() {
  const c = document.getElementById('content')
  document.getElementById('tbacts').innerHTML = ''

  if (_key) {
    resetLockTimer()
    return renderLista()
  }

  c.innerHTML = '<div class="empty">Verificando cofre...</div>'
  try { _meta = await carregarMeta() } catch (e) {
    c.innerHTML = `<div class="empty">Erro: ${esc(e.message)}</div>`; return
  }
  const primeiraVez = !_meta

  c.innerHTML = `
    <div style="max-width:440px;margin:80px auto;padding:36px 32px;background:var(--bg-card);border:1px solid var(--line);border-radius:14px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-flex;width:54px;height:54px;border-radius:14px;background:rgba(197,248,42,.08);border:1px solid rgba(197,248,42,.2);align-items:center;justify-content:center;margin-bottom:14px">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C5F82A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 style="font-size:18px;font-weight:600;margin-bottom:6px">${primeiraVez ? 'Criar cofre de senhas' : 'Cofre de senhas'}</h2>
        <p style="font-size:13px;color:var(--text-3);line-height:1.5">
          ${primeiraVez
            ? 'Crie uma senha mestra. Vai ser pedida toda vez que você abrir o cofre. Se esquecer, NÃO tem como recuperar as senhas guardadas.'
            : 'Digite sua senha mestra pra destravar.'}
        </p>
      </div>

      <form id="vault-form" style="display:flex;flex-direction:column;gap:12px">
        <input type="password" id="vault-pw" class="fi" placeholder="Senha mestra" autocomplete="off" autofocus
          style="font-size:15px;padding:13px 16px;letter-spacing:.1em">
        ${primeiraVez ? `
          <input type="password" id="vault-pw2" class="fi" placeholder="Confirme a senha mestra" autocomplete="off"
            style="font-size:15px;padding:13px 16px;letter-spacing:.1em">
          <div style="font-size:11px;color:var(--warn);background:rgba(245,166,35,.06);border:1px solid rgba(245,166,35,.2);padding:10px 12px;border-radius:8px;line-height:1.5">
            ⚠️ Use uma senha forte. <strong>Anote num lugar seguro fora deste sistema</strong>. Se perder, perde tudo que tiver salvo aqui.
          </div>` : ''}
        <button type="submit" class="btn bp" style="padding:13px;font-size:14px;font-weight:600">
          ${primeiraVez ? 'Criar cofre' : 'Destravar'}
        </button>
        <div id="vault-err" style="color:var(--danger);font-size:12px;text-align:center;min-height:16px"></div>
      </form>
    </div>`

  document.getElementById('vault-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const pw  = document.getElementById('vault-pw').value
    const pw2 = document.getElementById('vault-pw2')?.value
    const errEl = document.getElementById('vault-err')
    errEl.textContent = ''
    if (!pw) { errEl.textContent = 'Digite a senha'; return }
    if (primeiraVez) {
      if (pw.length < 8) { errEl.textContent = 'Senha mestra precisa ter pelo menos 8 caracteres'; return }
      if (pw !== pw2)    { errEl.textContent = 'As senhas não coincidem'; return }
    }
    try {
      const ok = await destravar(pw)
      if (!ok) { errEl.textContent = 'Senha mestra incorreta'; return }
      toast(primeiraVez ? 'Cofre criado e destravado' : 'Cofre destravado')
      render()
    } catch (err) {
      errEl.textContent = err.message
    }
  })
}

// ─── Lista de senhas destravada ───────────────────────────────────────
async function renderLista() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando senhas...</div>'

  document.getElementById('tbacts').innerHTML = `
    <button class="btn bg bsm" id="vault-lock" title="Travar cofre">🔒 Travar</button>
    <button class="btn bp" id="vault-new">+ Nova senha</button>`
  document.getElementById('vault-lock').addEventListener('click', travar)
  document.getElementById('vault-new').addEventListener('click', () => entradaForm())

  const { data, error } = await selectAll('senhas_vault', { order: { column: 'nome', ascending: true } })
  if (error) { c.innerHTML = `<div class="empty">Erro: ${esc(error.message)}</div>`; return }

  const itens = data || []
  if (!itens.length) {
    c.innerHTML = `
      <div class="empty" style="padding:80px 20px">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Cofre vazio</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:18px">Adicione sua primeira senha. Tudo é criptografado antes de sair do browser.</div>
      </div>`
    return
  }

  c.innerHTML = `
    <div style="margin-bottom:14px;display:flex;gap:10px;align-items:center">
      <input id="vault-busca" class="fi" placeholder="🔍 Buscar por nome, usuário, tag..." style="flex:1;max-width:420px">
      <span style="font-size:12px;color:var(--text-3)">${itens.length} entrada${itens.length===1?'':'s'} · auto-trava em 10min</span>
    </div>
    <div id="vault-lista" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px"></div>`

  function pintar(filtro = '') {
    const f = filtro.toLowerCase()
    const filtrados = itens.filter(x =>
      !f || (x.nome || '').toLowerCase().includes(f)
         || (x.usuario || '').toLowerCase().includes(f)
         || (x.url || '').toLowerCase().includes(f)
         || (x.tags || []).some(t => String(t).toLowerCase().includes(f))
    )
    document.getElementById('vault-lista').innerHTML = filtrados.map(x => cardHTML(x)).join('')
    // Wire eventos por card
    filtrados.forEach(x => wireCard(x))
  }

  document.getElementById('vault-busca').addEventListener('input', e => {
    resetLockTimer()
    pintar(e.target.value)
  })
  pintar('')
}

function cardHTML(x) {
  const cor = x.cor || '#4A9EFF'
  const ini = (x.nome || '#').replace(/[^a-z0-9]/gi, '')[0]?.toUpperCase() || '#'
  const tags = (x.tags || []).slice(0, 3).map(t =>
    `<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(255,255,255,.04);color:var(--text-3);border:1px solid var(--line)">${esc(t)}</span>`).join('')
  const url = x.url
    ? `<a href="${esc(x.url)}" target="_blank" style="color:var(--text-3);font-size:11px;text-decoration:none;display:flex;align-items:center;gap:4px;margin-top:3px">↗ ${esc(x.url.replace(/^https?:\/\//, '').slice(0, 40))}</a>`
    : ''

  return `
    <div class="tw" data-id="${x.id}" style="padding:14px 16px">
      <div style="display:flex;gap:12px;align-items:flex-start">
        <div style="width:38px;height:38px;border-radius:10px;background:${cor}1a;color:${cor};display:flex;align-items:center;justify-content:center;font-weight:600;font-size:16px;flex-shrink:0">${ini}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:500;font-size:14px;color:var(--text)">${esc(x.nome)}</div>
          ${x.usuario ? `<div style="font-size:12px;color:var(--text-2);margin-top:1px">${esc(x.usuario)}</div>` : ''}
          ${url}
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;margin-top:12px;padding-top:11px;border-top:1px solid var(--line)">
        <div class="vault-pw-mask" data-id="${x.id}" style="font-family:ui-monospace,monospace;font-size:13px;color:var(--text-3);letter-spacing:.1em;flex:1;min-width:0;white-space:nowrap;overflow:hidden">••••••••••</div>
        <button class="btn bg bsm vault-show" data-id="${x.id}" title="Mostrar/esconder">👁</button>
        <button class="btn bg bsm vault-copy" data-id="${x.id}" title="Copiar senha">📋</button>
        <button class="btn bg bsm vault-edit" data-id="${x.id}" title="Editar">✎</button>
        <button class="btn bd bsm vault-del" data-id="${x.id}" title="Excluir">🗑</button>
      </div>
      ${tags ? `<div style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap">${tags}</div>` : ''}
    </div>`
}

function wireCard(x) {
  const root = document.querySelector(`.tw[data-id="${x.id}"]`)
  if (!root) return

  root.querySelector('.vault-show').addEventListener('click', async () => {
    resetLockTimer()
    const mask = root.querySelector('.vault-pw-mask')
    if (mask.dataset.aberto === '1') {
      mask.textContent = '••••••••••'
      mask.style.color = 'var(--text-3)'
      mask.dataset.aberto = ''
      return
    }
    const pt = await decryptText(_key, x.senha_cifrada, x.iv)
    if (pt === null) { toast('Falha ao descriptografar (chave inválida?)', 'err'); return }
    mask.textContent = pt
    mask.style.color = 'var(--accent)'
    mask.dataset.aberto = '1'
    // Esconde sozinho depois de 20s
    setTimeout(() => {
      if (mask.dataset.aberto === '1') {
        mask.textContent = '••••••••••'
        mask.style.color = 'var(--text-3)'
        mask.dataset.aberto = ''
      }
    }, 20000)
  })

  root.querySelector('.vault-copy').addEventListener('click', async () => {
    resetLockTimer()
    const pt = await decryptText(_key, x.senha_cifrada, x.iv)
    if (pt === null) { toast('Falha ao descriptografar', 'err'); return }
    try {
      await navigator.clipboard.writeText(pt)
      toast('Senha copiada · limpa do clipboard em 30s')
      // Limpa clipboard depois de 30s
      setTimeout(() => navigator.clipboard.writeText('').catch(() => {}), 30000)
    } catch {
      toast('Não consegui acessar o clipboard', 'err')
    }
  })

  root.querySelector('.vault-edit').addEventListener('click', async () => {
    resetLockTimer()
    const senhaPt = await decryptText(_key, x.senha_cifrada, x.iv)
    const notasPt = x.notas_cifrada ? await decryptText(_key, x.notas_cifrada, x.notas_iv) : ''
    entradaForm({ ...x, _senha: senhaPt || '', _notas: notasPt || '' })
  })

  root.querySelector('.vault-del').addEventListener('click', async () => {
    if (!confirm(`Excluir "${x.nome}"? Essa ação é permanente.`)) return
    const { error } = await db.from('senhas_vault').delete().eq('id', x.id)
    if (error) { toast('Erro: ' + error.message, 'err'); return }
    toast('Excluído')
    render()
  })
}

// ─── Form de criar/editar entrada ─────────────────────────────────────
function entradaForm(x = {}) {
  resetLockTimer()
  const isNew = !x.id
  const tagsStr = (x.tags || []).join(', ')
  const CORES = ['#4A9EFF', '#C5F82A', '#A78BFA', '#F5A623', '#34D399', '#FF5C5C', '#EC4899', '#06B6D4']
  const cor = x.cor || CORES[0]

  openModal(isNew ? 'Nova senha' : 'Editar senha', `
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Nome *</label>
      <input class="fi" id="ve-nome" value="${esc(x.nome || '')}" placeholder="Ex: Google Ads Adriane" autofocus>
    </div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg">
        <label class="fl">Usuário / email</label>
        <input class="fi" id="ve-usuario" value="${esc(x.usuario || '')}" placeholder="email@ou-user.com">
      </div>
      <div class="fg">
        <label class="fl">URL</label>
        <input class="fi" id="ve-url" value="${esc(x.url || '')}" placeholder="https://...">
      </div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Senha *</label>
      <div style="display:flex;gap:6px">
        <input class="fi" id="ve-senha" type="password" value="${esc(x._senha || '')}" placeholder="A senha que você quer guardar" style="flex:1;font-family:ui-monospace,monospace">
        <button class="btn bg bsm" type="button" id="ve-show">👁</button>
        <button class="btn bg bsm" type="button" id="ve-gerar" title="Gerar senha forte">⚡</button>
      </div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Tags (separadas por vírgula)</label>
      <input class="fi" id="ve-tags" value="${esc(tagsStr)}" placeholder="ads, google, cliente-adriane">
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Notas (criptografadas)</label>
      <textarea class="fta" id="ve-notas" rows="2" placeholder="MFA, código backup, observações...">${esc(x._notas || '')}</textarea>
    </div>
    <div class="fg">
      <label class="fl">Cor</label>
      <div id="ve-cores" style="display:flex;gap:8px;flex-wrap:wrap">
        ${CORES.map(c => `<span data-cor="${c}" class="ve-cor${c===cor?' on':''}" style="width:26px;height:26px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${c===cor?'var(--text)':'transparent'};transition:border 100ms"></span>`).join('')}
      </div>
    </div>
  `, `
    ${isNew ? '' : '<button class="btn bd" id="ve-del">Excluir</button>'}
    <button class="btn bg" id="ve-cancel">Cancelar</button>
    <button class="btn bp" id="ve-save">${isNew ? 'Salvar' : 'Atualizar'}</button>
  `)

  let corSelecionada = cor
  document.getElementById('ve-cores').addEventListener('click', e => {
    const el = e.target.closest('.ve-cor')
    if (!el) return
    corSelecionada = el.dataset.cor
    document.querySelectorAll('.ve-cor').forEach(c => {
      c.style.border = '2px solid ' + (c.dataset.cor === corSelecionada ? 'var(--text)' : 'transparent')
    })
  })

  document.getElementById('ve-show').addEventListener('click', () => {
    const inp = document.getElementById('ve-senha')
    inp.type = inp.type === 'password' ? 'text' : 'password'
  })

  document.getElementById('ve-gerar').addEventListener('click', () => {
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*-_+='
    const len = 20
    const arr = crypto.getRandomValues(new Uint8Array(len))
    let s = ''
    for (let i = 0; i < len; i++) s += chars[arr[i] % chars.length]
    const inp = document.getElementById('ve-senha')
    inp.value = s; inp.type = 'text'
    toast('Senha forte gerada')
  })

  document.getElementById('ve-cancel').addEventListener('click', closeModal)
  if (!isNew) {
    document.getElementById('ve-del').addEventListener('click', async () => {
      if (!confirm(`Excluir "${x.nome}"?`)) return
      await db.from('senhas_vault').delete().eq('id', x.id)
      closeModal(); toast('Excluído'); render()
    })
  }

  document.getElementById('ve-save').addEventListener('click', async () => {
    const nome = document.getElementById('ve-nome').value.trim()
    const senha = document.getElementById('ve-senha').value
    if (!nome) return toast('Nome é obrigatório', 'err')
    if (!senha) return toast('Senha é obrigatória', 'err')

    const senhaEnc = await encryptText(_key, senha)
    const notasTxt = document.getElementById('ve-notas').value.trim()
    const notasEnc = notasTxt ? await encryptText(_key, notasTxt) : null

    const payload = {
      nome,
      usuario: document.getElementById('ve-usuario').value.trim() || null,
      url:     document.getElementById('ve-url').value.trim() || null,
      senha_cifrada: senhaEnc.cifrado,
      iv: senhaEnc.iv,
      notas_cifrada: notasEnc?.cifrado || null,
      notas_iv:      notasEnc?.iv || null,
      tags: document.getElementById('ve-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      cor: corSelecionada,
      atualizado_em: new Date().toISOString(),
    }

    const op = isNew
      ? db.from('senhas_vault').insert(payload)
      : db.from('senhas_vault').update(payload).eq('id', x.id)
    const { error } = await op
    if (error) return toast('Erro: ' + error.message, 'err')
    toast(isNew ? 'Senha guardada' : 'Atualizado')
    closeModal()
    render()
  })
}
