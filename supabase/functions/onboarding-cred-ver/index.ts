// ════════════════════════════════════════════════════════════════
//  Edge Function: onboarding-cred-ver (chamada pelo CRM admin)
//  POST { cliente_id, campo } → descriptografa UM campo + grava
//  audit. Cada visualização fica registrada em onboarding_cred_audit.
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)
const AES_KEY_HEX = Deno.env.get('ONBOARDING_AES_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─── Crypto helpers ──────────────────────────────────────────
function hexToBytes(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
}
function fromB64(s: string): Uint8Array {
  return new Uint8Array(atob(s).split('').map((c) => c.charCodeAt(0)))
}
let _keyCache: CryptoKey | null = null
async function getAesKey(): Promise<CryptoKey> {
  if (_keyCache) return _keyCache
  _keyCache = await crypto.subtle.importKey('raw', hexToBytes(AES_KEY_HEX), 'AES-GCM', false, ['encrypt', 'decrypt'])
  return _keyCache
}
async function decrypt(packed: string): Promise<string> {
  const [ivb, ctb, atb] = packed.split(':')
  const iv = fromB64(ivb)
  const ct = fromB64(ctb)
  const at = fromB64(atb)
  // Reassemble ciphertext+authTag pra Web Crypto
  const combined = new Uint8Array(ct.length + at.length)
  combined.set(ct); combined.set(at, ct.length)
  const key = await getAesKey()
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, combined)
  return new TextDecoder().decode(pt)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  try {
    const { cliente_id, campo, origem = 'crm-admin' } = await req.json()
    if (!cliente_id || !campo) {
      return Response.json({ ok: false, error: 'cliente_id e campo são obrigatórios' }, { status: 400, headers: CORS })
    }

    const { data: cred } = await supabase
      .from('onboarding_credenciais')
      .select('cred_jsonb')
      .eq('cliente_id', cliente_id)
      .maybeSingle()
    if (!cred?.cred_jsonb?.[campo]) {
      return Response.json({ ok: false, error: 'Campo não encontrado pra esse cliente' }, { status: 404, headers: CORS })
    }

    const valor = await decrypt(cred.cred_jsonb[campo])

    // Audit — registra a visualização ANTES de devolver
    await supabase.from('onboarding_cred_audit').insert({
      cliente_id,
      campo,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null,
      user_agent: req.headers.get('user-agent') || null,
      origem,
    })

    return Response.json({ ok: true, valor }, { headers: CORS })
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500, headers: CORS })
  }
})
