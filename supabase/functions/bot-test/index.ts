// ════════════════════════════════════════════════════════════════
//  bot-test — sandbox pra testar o bot do WhatsApp sem mandar pra
//  ninguém de verdade. Recebe histórico + mensagem nova, chama o
//  mesmo Claude com o mesmo system prompt do webhook, retorna a
//  resposta que ele MANDARIA — mas não envia nada na UazAPI nem
//  persiste no banco.
//
//  Body: { history: [{role, content}, ...], userMessage: string }
//  Resp: { ok, messages: [string], stage, lead_data, raw }
// ════════════════════════════════════════════════════════════════
import { SYSTEM_PROMPT } from '../_shared/persona-lira.ts'

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST')    return new Response('use POST', { status: 405, headers: CORS })

  let body: { history?: Array<{role:string, content:string}>, userMessage?: string, stage?: string, lead_data?: Record<string, unknown> }
  try { body = await req.json() } catch { return Response.json({ ok: false, erro: 'JSON inválido' }, { status: 400, headers: CORS }) }

  const history     = Array.isArray(body.history) ? body.history.slice(-12) : []
  const userMessage = String(body.userMessage || '').trim()
  const stage       = String(body.stage || 'inicio')
  const lead_data   = body.lead_data || {}

  if (!userMessage) return Response.json({ ok: false, erro: 'userMessage vazio' }, { status: 400, headers: CORS })

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: `[CONTEXTO INTERNO: NÃO REVELAR AO LEAD]
Estágio atual: ${stage}
Dados coletados: ${JSON.stringify(lead_data)}
Origem: MODO TESTE (sandbox interno — responda como responderia em produção)
[FIM DO CONTEXTO]

Mensagem do lead: ${userMessage}

Retorne apenas JSON válido com os campos: messages (array), stage, action ("none" ou "book"), slot_iso (preenchido só quando action="book"), lead_data.` },
  ]

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://elevabrands.com.br',
      'X-Title': 'Eleva Bot Test',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4.5',
      max_tokens: 600,
      temperature: 0.7,
      messages,
    }),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    return Response.json({ ok: false, erro: `OpenRouter ${res.status}: ${txt.slice(0,200)}` }, { status: 500, headers: CORS })
  }

  const json = await res.json()
  const raw  = json?.choices?.[0]?.message?.content || ''

  // O bot retorna JSON dentro de texto — extrai
  let parsed: { messages?: string[], stage?: string, lead_data?: Record<string, unknown>, action?: string }
  try {
    const m = raw.match(/\{[\s\S]*\}/)
    parsed = m ? JSON.parse(m[0]) : { messages: [raw] }
  } catch {
    parsed = { messages: [raw] }
  }

  return Response.json({
    ok: true,
    messages: parsed.messages || [],
    stage:    parsed.stage    || stage,
    action:   parsed.action   || 'none',
    lead_data: parsed.lead_data || lead_data,
    raw,
  }, { headers: CORS })
})
