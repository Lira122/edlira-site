// ════════════════════════════════════════════════════════════════
//  Edge Function: usage-stats
//  Agrega uso de IA em tempo real pra dashboard do CRM.
//
//  Fontes:
//   1. Bot interno (ia_usage_log): Groq, OpenRouter, etc — REAL-TIME
//   2. Anthropic Admin API: uso da conta Anthropic do dono — atualiza ~5min
//      (só ativo se ANTHROPIC_ADMIN_KEY tiver setado nos secrets)
//
//  Retorno:
//   {
//     bot: { hoje, sete_dias, mes, por_provider, por_modelo, por_origem,
//            ultimas_chamadas, custo_hoje, custo_mes },
//     anthropic: { configurado, hoje, mes, por_modelo, rate_limits } | null
//   }
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const ANTHROPIC_ADMIN_KEY = Deno.env.get('ANTHROPIC_ADMIN_KEY') || ''
const TZ = 'America/Sao_Paulo'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
}

function inicioHojeBR(): string {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date()).split('-').map(Number)
  // 00h BRT = 03h UTC
  return new Date(Date.UTC(partes[0], partes[1] - 1, partes[2], 3, 0, 0)).toISOString()
}

function inicioMesBR(): string {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date()).split('-').map(Number)
  return new Date(Date.UTC(partes[0], partes[1] - 1, 1, 3, 0, 0)).toISOString()
}

function isoMinusDias(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString()
}

interface UsageRow {
  criado_em: string
  provider: string
  modelo: string | null
  origem: string | null
  input_tokens: number
  output_tokens: number
  cost_usd: number
  latencia_ms: number | null
  sucesso: boolean
}

interface Resumo {
  chamadas: number
  input_tokens: number
  output_tokens: number
  total_tokens: number
  custo_usd: number
}

function vazio(): Resumo {
  return { chamadas: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0, custo_usd: 0 }
}

function acumular(acc: Resumo, r: UsageRow): Resumo {
  return {
    chamadas: acc.chamadas + 1,
    input_tokens: acc.input_tokens + (r.input_tokens || 0),
    output_tokens: acc.output_tokens + (r.output_tokens || 0),
    total_tokens: acc.total_tokens + (r.input_tokens || 0) + (r.output_tokens || 0),
    custo_usd: Number((acc.custo_usd + Number(r.cost_usd || 0)).toFixed(6)),
  }
}

async function buscarBot() {
  const inicio7d = isoMinusDias(7)
  const inicioHoje = inicioHojeBR()
  const inicioMes = inicioMesBR()

  // Pega tudo dos últimos 30 dias (ou desde o início do mês, o que for maior)
  const desde = inicioMes < isoMinusDias(30) ? inicioMes : isoMinusDias(30)

  const { data, error } = await supabase
    .from('ia_usage_log')
    .select('criado_em, provider, modelo, origem, input_tokens, output_tokens, cost_usd, latencia_ms, sucesso')
    .gte('criado_em', desde)
    .order('criado_em', { ascending: false })
    .limit(5000)

  if (error) throw new Error(`bot fetch: ${error.message}`)
  const rows = (data || []) as UsageRow[]

  const hoje      = vazio()
  const seteDias  = vazio()
  const mes       = vazio()
  const porProvider: Record<string, Resumo> = {}
  const porModelo: Record<string, Resumo> = {}
  const porOrigem: Record<string, Resumo> = {}
  const porDia: Record<string, Resumo> = {} // YYYY-MM-DD → Resumo (últimos 7d)

  for (const r of rows) {
    if (r.criado_em >= inicioMes)  Object.assign(mes,      acumular(mes,      r))
    if (r.criado_em >= inicio7d)   Object.assign(seteDias, acumular(seteDias, r))
    if (r.criado_em >= inicioHoje) Object.assign(hoje,     acumular(hoje,     r))

    porProvider[r.provider] = acumular(porProvider[r.provider] || vazio(), r)
    const m = r.modelo || 'desconhecido'
    porModelo[m] = acumular(porModelo[m] || vazio(), r)
    const o = r.origem || 'desconhecido'
    porOrigem[o] = acumular(porOrigem[o] || vazio(), r)

    if (r.criado_em >= inicio7d) {
      const dia = r.criado_em.slice(0, 10)
      porDia[dia] = acumular(porDia[dia] || vazio(), r)
    }
  }

  const ultimas = rows.slice(0, 12).map((r) => ({
    quando: r.criado_em,
    provider: r.provider,
    modelo: r.modelo,
    origem: r.origem,
    tokens: (r.input_tokens || 0) + (r.output_tokens || 0),
    custo: Number(r.cost_usd),
    latencia: r.latencia_ms,
    sucesso: r.sucesso,
  }))

  return { hoje, sete_dias: seteDias, mes, por_provider: porProvider, por_modelo: porModelo, por_origem: porOrigem, por_dia: porDia, ultimas_chamadas: ultimas }
}

async function buscarAnthropic() {
  if (!ANTHROPIC_ADMIN_KEY) {
    return { configurado: false, motivo: 'ANTHROPIC_ADMIN_KEY não configurada nos secrets do Supabase' }
  }

  const hoje  = inicioHojeBR()
  const mes   = inicioMesBR()
  const agora = new Date().toISOString()
  // Janela rolante de 5h (rate limit do Claude Code / Anthropic)
  const ago5h = new Date(Date.now() - 5 * 3600 * 1000).toISOString()

  async function reportar(starting: string, ending: string, bucket = '1d') {
    const url = new URL('https://api.anthropic.com/v1/organizations/usage_report/messages')
    url.searchParams.set('starting_at', starting)
    url.searchParams.set('ending_at', ending)
    url.searchParams.set('bucket_width', bucket)
    const r = await fetch(url.toString(), {
      headers: {
        'x-api-key': ANTHROPIC_ADMIN_KEY,
        'anthropic-version': '2023-06-01',
      },
    })
    if (!r.ok) {
      const txt = await r.text().catch(() => '')
      throw new Error(`Admin API ${r.status}: ${txt.slice(0, 200)}`)
    }
    return r.json()
  }

  try {
    const [reportHoje, reportMes, report5h] = await Promise.all([
      reportar(hoje,  agora, '1d'),
      reportar(mes,   agora, '1d'),
      reportar(ago5h, agora, '1h'),
    ])
    return {
      configurado: true,
      hoje:       agregarReport(reportHoje),
      mes:        agregarReport(reportMes),
      janela_5h:  { ...agregarReport(report5h), iniciou_em: ago5h },
    }
  } catch (e) {
    return { configurado: true, erro: String(e) }
  }
}

function agregarReport(report: unknown): Resumo & { por_modelo: Record<string, Resumo> } {
  const total: Resumo = vazio()
  const porModelo: Record<string, Resumo> = {}
  // Estrutura conforme docs Anthropic Admin: { data: [{ starting_at, ending_at, results: [{ uncached_input_tokens, output_tokens, model, ... }] }] }
  const r = report as { data?: Array<{ results?: Array<Record<string, unknown>> }> }
  for (const bucket of r.data || []) {
    for (const item of bucket.results || []) {
      const inT  = Number(item.uncached_input_tokens || item.input_tokens || 0)
      const outT = Number(item.output_tokens || 0)
      const m    = String(item.model || 'desconhecido')
      total.chamadas      += 1
      total.input_tokens  += inT
      total.output_tokens += outT
      total.total_tokens  += inT + outT
      porModelo[m] = porModelo[m] || vazio()
      porModelo[m].chamadas += 1
      porModelo[m].input_tokens += inT
      porModelo[m].output_tokens += outT
      porModelo[m].total_tokens += inT + outT
    }
  }
  return { ...total, por_modelo: porModelo }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  try {
    const [bot, anthropic] = await Promise.all([
      buscarBot(),
      buscarAnthropic(),
    ])

    return new Response(JSON.stringify({
      ok: true,
      gerado_em: new Date().toISOString(),
      bot,
      anthropic,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS },
    })
  } catch (e) {
    console.error('[usage-stats]', e)
    return new Response(JSON.stringify({ ok: false, erro: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    })
  }
})
