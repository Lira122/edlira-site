// Proxy pra UazAPI: status, QR, reconectar e reiniciar a instância "sofia".
// Não expõe token UazAPI pro browser — fica server-side via Supabase Edge.
const UAZAPI_URL   = Deno.env.get('UAZAPI_URL')!
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Content-Type':                 'application/json',
}

async function uaz(path: string, method: string = 'GET', body: unknown = null) {
  const url = `${UAZAPI_URL.replace(/\/+$/, '')}${path}`
  const init: RequestInit = {
    method,
    headers: { token: UAZAPI_TOKEN, 'Content-Type': 'application/json' },
  }
  if (body !== null) init.body = JSON.stringify(body)
  try {
    const res  = await fetch(url, init)
    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = text }
    return { ok: res.ok, httpStatus: res.status, path, data }
  } catch (err) {
    return { ok: false, httpStatus: 0, path, error: String(err) }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const url    = new URL(req.url)
  const action = url.searchParams.get('action') || 'status'

  try {
    let result: unknown
    switch (action) {
      case 'status':
        // Tenta /instance/me, /status como fallback. Resposta vem normalizada.
        result = await uaz('/instance/me')
        if (!(result as any).ok) result = await uaz('/status')
        break

      case 'connect':
        // Pega o QR (ou retorna conectado se já tá ok)
        result = await uaz('/instance/connect', 'POST', {})
        if (!(result as any).ok) {
          // fallback comum em algumas builds UazAPI
          result = await uaz('/instance/qrcode')
        }
        break

      case 'disconnect':
        result = await uaz('/instance/disconnect', 'POST', {})
        break

      case 'restart':
        result = await uaz('/instance/restart', 'POST', {})
        break

      case 'webhook':
        // Mostra qual webhook está configurado
        result = await uaz('/instance/webhook')
        break

      default:
        return new Response(JSON.stringify({ error: 'Ação inválida: ' + action }), {
          status: 400, headers: CORS,
        })
    }

    return new Response(JSON.stringify(result), { headers: CORS })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: CORS,
    })
  }
})
