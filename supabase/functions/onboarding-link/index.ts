// ════════════════════════════════════════════════════════════════
//  Edge Function: onboarding-link (chamada pelo CRM admin)
//  POST com { cliente_id, dias_validade? } → cria token e devolve URL
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)
const ONBOARDING_BASE_URL = Deno.env.get('ONBOARDING_BASE_URL') || 'https://elevabrands.com.br/onboarding/'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function novoToken(): string {
  // UUID v4 (122 bits de entropia) + 8 chars extras = ~190 bits — impossível adivinhar
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  try {
    const { cliente_id, dias_validade = 7 } = await req.json()
    if (!cliente_id) {
      return Response.json({ ok: false, error: 'cliente_id é obrigatório' }, { status: 400, headers: CORS })
    }

    // Busca o nome (snapshot pra histórico, mesmo se o cliente for renomeado depois)
    const { data: cliente } = await supabase
      .from('clientes').select('nome, empresa').eq('id', cliente_id).maybeSingle()
    if (!cliente) {
      return Response.json({ ok: false, error: 'Cliente não encontrado' }, { status: 404, headers: CORS })
    }

    const token = novoToken()
    const expira_em = new Date(Date.now() + dias_validade * 24 * 60 * 60 * 1000).toISOString()
    const cliente_nome = cliente.empresa || cliente.nome || 'Cliente'

    const { error } = await supabase.from('onboarding_tokens').insert({
      token, cliente_id, cliente_nome, expira_em,
    })
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500, headers: CORS })
    }

    const sep = ONBOARDING_BASE_URL.includes('?') ? '&' : '?'
    const url = `${ONBOARDING_BASE_URL}${sep}t=${token}`
    return Response.json({ ok: true, token, url, expira_em, cliente_nome }, { headers: CORS })
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500, headers: CORS })
  }
})
