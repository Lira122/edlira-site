// ════════════════════════════════════════════════════════════════
//  Edge Function: claude-usage-ingest
//  Recebe snapshot da extensão de browser sobre uso do Claude.ai
//  consumer (plano Pro/Max). Salva em claude_usage_snapshots pra
//  o painel mostrar.
//
//  Autenticação: precisa de um token compartilhado em
//  CLAUDE_INGEST_TOKEN nos secrets (a extensão usa o mesmo).
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const INGEST_TOKEN = Deno.env.get('CLAUDE_INGEST_TOKEN') || ''

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-ingest-token',
}

interface Snapshot {
  plano?: string
  sessao_pct?: number
  sessao_reseta_em?: string
  semana_pct?: number
  semana_reseta_em?: string
  opus_pct?: number
  dados_brutos?: unknown
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, erro: 'method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...CORS } })
  }

  // Token compartilhado simples (a extensão envia em x-ingest-token)
  const token = req.headers.get('x-ingest-token') || ''
  if (!INGEST_TOKEN || token !== INGEST_TOKEN) {
    return new Response(JSON.stringify({ ok: false, erro: 'invalid ingest token' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...CORS } })
  }

  let body: Snapshot
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ ok: false, erro: 'invalid json' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } })
  }

  const row = {
    plano: body.plano ?? null,
    sessao_pct: body.sessao_pct ?? null,
    sessao_reseta_em: body.sessao_reseta_em ?? null,
    semana_pct: body.semana_pct ?? null,
    semana_reseta_em: body.semana_reseta_em ?? null,
    opus_pct: body.opus_pct ?? null,
    dados_brutos: body.dados_brutos ?? {},
    fonte: 'extension',
  }

  const { error } = await supabase.from('claude_usage_snapshots').insert(row)
  if (error) {
    console.error('[claude-ingest]', error)
    return new Response(JSON.stringify({ ok: false, erro: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } })
  }

  return new Response(JSON.stringify({ ok: true, salvo_em: new Date().toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } })
})
