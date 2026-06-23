// ════════════════════════════════════════════════════════════════
//  Helper compartilhado: registra uso de IA pra dashboard de monitoramento.
//  Use fire-and-forget (não dá await pra não atrasar a função principal).
//
//  Exemplo:
//    import { logIAUsage } from '../_shared/usage-log.ts'
//    logIAUsage({
//      provider: 'groq', modelo: 'llama-3.3-70b-versatile',
//      origem: 'webhook-sofia',
//      input_tokens: 1240, output_tokens: 87,
//      latencia_ms: 980, sucesso: true,
//    })
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const SB_URL = Deno.env.get('SUPABASE_URL')!
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Preços em USD por milhão de tokens. Atualize quando os provedores mudarem.
// Match por substring no nome do modelo (lowercase).
const PRICES: Array<{ match: RegExp; in: number; out: number }> = [
  // Groq (preços do tier paid; o free tier é grátis até o limite)
  { match: /llama-3\.3-70b/i,            in: 0.59,  out: 0.79  },
  { match: /llama-3\.1-70b/i,            in: 0.59,  out: 0.79  },
  { match: /llama-3\.1-8b/i,             in: 0.05,  out: 0.08  },
  { match: /llama-3-70b/i,               in: 0.59,  out: 0.79  },
  { match: /mixtral-8x7b/i,              in: 0.24,  out: 0.24  },
  // OpenRouter / Anthropic
  { match: /claude.*opus.*4\.7/i,        in: 15.00, out: 75.00 },
  { match: /claude.*opus.*4/i,           in: 15.00, out: 75.00 },
  { match: /claude.*sonnet.*4\.6/i,      in: 3.00,  out: 15.00 },
  { match: /claude.*sonnet.*4/i,         in: 3.00,  out: 15.00 },
  { match: /claude.*sonnet/i,            in: 3.00,  out: 15.00 },
  { match: /claude.*haiku.*4/i,          in: 0.80,  out: 4.00  },
  { match: /claude.*haiku/i,             in: 0.25,  out: 1.25  },
  { match: /gpt-4o-mini/i,               in: 0.15,  out: 0.60  },
  { match: /gpt-4o/i,                    in: 2.50,  out: 10.00 },
  { match: /gpt-4/i,                     in: 10.00, out: 30.00 },
  // Llama via OpenRouter (mark-up pequeno)
  { match: /meta-llama\/llama-3\.1-70b/i, in: 0.88, out: 0.88  },
  { match: /meta-llama\/llama-3-70b/i,    in: 0.88, out: 0.88  },
]

function calcCost(modelo: string, inTokens: number, outTokens: number): number {
  const m = String(modelo || '').toLowerCase()
  const p = PRICES.find((x) => x.match.test(m))
  if (!p) return 0
  const cost = (inTokens / 1_000_000) * p.in + (outTokens / 1_000_000) * p.out
  return Math.round(cost * 1_000_000) / 1_000_000 // 6 casas decimais
}

export interface IAUsageEntry {
  provider: 'groq' | 'openrouter' | 'anthropic' | 'openai' | string
  modelo?: string
  origem?: string                     // ex: 'webhook-sofia', 'disparo-opener'
  input_tokens?: number
  output_tokens?: number
  cache_read_tokens?: number
  cache_write_tokens?: number
  latencia_ms?: number
  sucesso?: boolean
  erro?: string
  request_id?: string
  meta?: Record<string, unknown>
  cost_usd?: number                    // se já souber o custo (sobrescreve cálculo)
}

let _sb: ReturnType<typeof createClient> | null = null
function sb() {
  if (!_sb) _sb = createClient(SB_URL, SB_KEY)
  return _sb
}

/**
 * Registra uma chamada de IA. NÃO bloqueia: erros internos são silenciosos
 * (loga no console mas não relança). Pode ser chamado SEM await.
 */
export function logIAUsage(entry: IAUsageEntry): Promise<void> {
  const inTok  = entry.input_tokens  ?? 0
  const outTok = entry.output_tokens ?? 0
  const cost   = entry.cost_usd ?? calcCost(entry.modelo || '', inTok, outTok)

  const row = {
    provider: entry.provider,
    modelo: entry.modelo ?? null,
    origem: entry.origem ?? null,
    input_tokens: inTok,
    output_tokens: outTok,
    cache_read_tokens: entry.cache_read_tokens ?? 0,
    cache_write_tokens: entry.cache_write_tokens ?? 0,
    cost_usd: cost,
    request_id: entry.request_id ?? null,
    latencia_ms: entry.latencia_ms ?? null,
    sucesso: entry.sucesso ?? true,
    erro: entry.erro ?? null,
    meta: entry.meta ?? {},
  }

  return sb().from('ia_usage_log').insert(row).then(
    ({ error }) => {
      if (error) console.error('[usage-log] insert falhou:', error.message)
    },
    (err) => console.error('[usage-log] insert exception:', err),
  )
}
