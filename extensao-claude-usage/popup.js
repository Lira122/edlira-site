const $ = (id) => document.getElementById(id)

async function carregar() {
  const { ingest_token } = await chrome.storage.sync.get('ingest_token')
  if (ingest_token) $('token').value = ingest_token
  atualizarStatus()
}

async function atualizarStatus() {
  const resp = await chrome.runtime.sendMessage({ tipo: 'status' })
  const el = $('status')
  if (!resp) { el.textContent = 'Nunca sincronizou ainda. Salva o token e clica em sincronizar.'; return }
  const quando = new Date(resp.ts).toLocaleTimeString('pt-BR')
  if (resp.ok) {
    const s = resp.snap || {}
    el.innerHTML = `<span class="ok">✓ Última sync às ${quando}</span><pre>plano: ${s.plano || '?'}\nsessao 5h: ${s.sessao_pct == null ? '?' : s.sessao_pct + '%'}\nreset: ${s.sessao_reseta_em || '?'}</pre>`
  } else {
    el.innerHTML = `<span class="err">✗ Falhou às ${quando}</span><pre>${resp.erro || JSON.stringify(resp.resposta || {}, null, 2)}</pre>`
  }
}

$('salvar').addEventListener('click', async () => {
  const token = $('token').value.trim()
  if (!token) { alert('Cola o token primeiro'); return }
  await chrome.storage.sync.set({ ingest_token: token })
  $('salvar').textContent = 'Salvo ✓'
  setTimeout(() => { $('salvar').textContent = 'Salvar token' }, 1500)
})

$('sync').addEventListener('click', async () => {
  $('sync').textContent = 'Sincronizando…'
  $('sync').disabled = true
  await chrome.runtime.sendMessage({ tipo: 'forcar_sync' })
  $('sync').textContent = 'Sincronizar agora'
  $('sync').disabled = false
  atualizarStatus()
})

carregar()
