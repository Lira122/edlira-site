// ════════════════════════════════════════════════════════════════
//  Edge Function: onboarding (JSON API)
//  GET  /functions/v1/onboarding?t=TOKEN  → valida token, devolve JSON
//  POST /functions/v1/onboarding?t=TOKEN  → grava dados + criptografa
//                                            credenciais + notifica
//  HTML do formulário vive em /onboarding/ no site principal
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const AES_KEY_HEX = Deno.env.get('ONBOARDING_AES_KEY')!
const UAZAPI_URL  = Deno.env.get('UAZAPI_URL')!
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')!
const LIRA_PHONE  = '5512981668507'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ─── Crypto helpers (Web Crypto nativo, AES-256-GCM) ──────────────
function hexToBytes(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
}
function b64(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf))
}
let _keyCache: CryptoKey | null = null
async function getAesKey(): Promise<CryptoKey> {
  if (_keyCache) return _keyCache
  _keyCache = await crypto.subtle.importKey('raw', hexToBytes(AES_KEY_HEX), 'AES-GCM', false, ['encrypt', 'decrypt'])
  return _keyCache
}
async function encrypt(text: string): Promise<string> {
  if (!text) return ''
  const key = await getAesKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text))
  const arr = new Uint8Array(ct)
  return `${b64(iv)}:${b64(arr.slice(0, -16))}:${b64(arr.slice(-16))}`
}

// ─── Token validation ──────────────────────────────────────────
async function validateToken(token: string) {
  const { data } = await supabase
    .from('onboarding_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle()
  if (!data) return { valid: false, reason: 'inexistente' as const }
  if (data.usado_em) return { valid: false, reason: 'usado' as const, data }
  if (new Date(data.expira_em) < new Date()) return { valid: false, reason: 'expirado' as const, data }
  return { valid: true, data }
}

// ─── Submit: grava + criptografa + notifica ────────────────────
async function processSubmit(token: string, body: Record<string, string>, req: Request): Promise<Response> {
  const v = await validateToken(token)
  if (!v.valid || !v.data) {
    return jsonResponse({ ok: false, error: v.reason }, 400)
  }
  const cliente_id = v.data.cliente_id
  const cliente_nome = v.data.cliente_nome || 'Cliente'
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null
  const userAgent = req.headers.get('user-agent') || null

  const { error: errDados } = await supabase.from('onboarding_dados').upsert({
    cliente_id,
    token,
    ramo: body.ramo || null,
    ticket_medio: body.ticket_medio ? Number(body.ticket_medio) : null,
    objetivo_90d: body.objetivo_90d || null,
    site: body.site || null,
    produtos: body.produtos || null,
    faqs: body.faqs || null,
    horario_atend: body.horario_atend || null,
    tom_de_voz: body.tom_de_voz || null,
  }, { onConflict: 'cliente_id' })
  if (errDados) {
    console.error('[onboarding_dados] upsert falhou:', errDados)
    return jsonResponse({ ok: false, error: 'Falha ao salvar dados: ' + errDados.message }, 500)
  }

  const cred_jsonb: Record<string, string> = {}
  for (const campo of ['insta_pass', 'meta_pass', 'google_pass']) {
    const val = body[campo]
    if (val && val.length > 0) cred_jsonb[campo] = await encrypt(val)
  }
  const { error: errCred } = await supabase.from('onboarding_credenciais').upsert({
    cliente_id,
    token,
    insta_handle: body.insta_handle || null,
    meta_bm_id: body.meta_bm_id || null,
    google_ads_id: body.google_ads_id || null,
    whatsapp_com: body.whatsapp_com || null,
    cred_jsonb,
  }, { onConflict: 'cliente_id' })
  if (errCred) {
    console.error('[onboarding_credenciais] upsert falhou:', errCred)
    return jsonResponse({ ok: false, error: 'Falha ao salvar acessos: ' + errCred.message }, 500)
  }

  await supabase.from('onboarding_tokens').update({
    usado_em: new Date().toISOString(),
    ip_uso: ip,
    user_agent: userAgent,
  }).eq('token', token)

  const msg = `Onboarding concluído!\n\n${cliente_nome} acabou de preencher o formulário. Veja no CRM > Onboarding pra começar a montar.`
  fetch(`${UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: { 'token': UAZAPI_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: LIRA_PHONE, text: msg }),
  }).catch((e) => console.error('[Notify] Falhou:', e))

  return jsonResponse({ ok: true })
}

// ─── Handler principal ────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const url = new URL(req.url)
  const token = url.searchParams.get('t') || ''

  if (!token) {
    return jsonResponse({ ok: false, reason: 'inexistente', error: 'Token ausente' }, 400)
  }

  if (req.method === 'GET') {
    const v = await validateToken(token)
    if (!v.valid) {
      return jsonResponse({ ok: false, reason: v.reason }, 404)
    }
    return jsonResponse({ ok: true, cliente_nome: v.data!.cliente_nome || 'Cliente' })
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()
      return await processSubmit(token, body, req)
    } catch (e) {
      return jsonResponse({ ok: false, error: String(e) }, 400)
    }
  }

  return jsonResponse({ ok: false, error: 'Method not allowed' }, 405)
})
