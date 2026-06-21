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

// Campos que NUNCA podem voltar pro browser
const SENSITIVE_KEYS = new Set([
  'token', 'openai_apikey', 'apikey', 'api_key',
  'adminField01', 'adminField02', 'profilePicUrl',
])

function sanitize(value: any): any {
  if (Array.isArray(value)) return value.map(sanitize)
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(k)) continue
      out[k] = sanitize(v)
    }
    return out
  }
  return value
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
    return { ok: res.ok, httpStatus: res.status, path, data: sanitize(data) }
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
      case 'connect':
        // /instance/connect é idempotente: retorna dados completos se já tá
        // conectado, ou retorna QR pra escanear quando offline.
        result = await uaz('/instance/connect', 'POST', {})
        break

      case 'disconnect':
        result = await uaz('/instance/disconnect', 'POST', {})
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
