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

      case 'groups': {
        // Lista grupos do WhatsApp. UazAPI tem variações entre builds —
        // tenta endpoints comuns em ordem e devolve o que funcionar.
        const buscar = url.searchParams.get('q')?.toLowerCase() || ''
        const tentativas = [
          { path: '/group/list',     method: 'POST', body: { force: true } },
          { path: '/group/list',     method: 'GET',  body: null },
          { path: '/group',          method: 'GET',  body: null },
          { path: '/group/findAll',  method: 'GET',  body: null },
          { path: '/chats',          method: 'POST', body: { onlyGroups: true } },
        ]
        let achados: any = null
        for (const t of tentativas) {
          const r: any = await uaz(t.path, t.method, t.body)
          if (r.ok && r.data && (Array.isArray(r.data) || typeof r.data === 'object')) {
            achados = r
            break
          }
        }
        if (!achados) {
          result = { ok: false, erro: 'Nenhum endpoint de grupos respondeu', tentativas: tentativas.map(t => t.path) }
          break
        }
        // Normaliza: extrai array de grupos do payload
        const raw = achados.data
        let grupos: any[] = []
        if (Array.isArray(raw))           grupos = raw
        else if (Array.isArray(raw.data)) grupos = raw.data
        else if (Array.isArray(raw.groups)) grupos = raw.groups
        else if (Array.isArray(raw.chats)) grupos = raw.chats.filter((c: any) => c.isGroup || c.JID?.endsWith('@g.us'))
        // Filtra por busca, se houver
        const nomeDe = (g: any) =>
          g.name || g.subject || g.chatName || g.title || g.groupName || g.Name || g.Subject || ''
        const filtrados = buscar
          ? grupos.filter((g: any) => nomeDe(g).toLowerCase().includes(buscar))
          : grupos
        const debug = url.searchParams.get('debug') === '1'
        result = {
          ok: true,
          path_usado: achados.path,
          total: grupos.length,
          encontrados: filtrados.length,
          grupos: filtrados.map((g: any) => ({
            nome:       g.name || g.subject || g.chatName || g.title || g.groupName || g.Name || g.Subject || '(sem nome)',
            jid:        g.JID || g.id || g.chatId || g.jid,
            participantes: g.size || g.participantsCount || g.participants?.length || null,
            criado_em:  g.creation || g.created || null,
          })),
          raw_sample: debug ? grupos.slice(0, 2) : undefined,
        }
        break
      }

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
