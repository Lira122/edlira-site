// ════════════════════════════════════════════════════════════════
//  Helper: enviar mensagem WhatsApp parecendo humano de verdade
//
//  A UazAPI aceita um campo `delay` no /send/text que mostra
//  "digitando..." pro contato durante esse tempo, ANTES de mandar.
//  Isso é o que faz parecer humano — sem isso a mensagem chega
//  seca e o lead percebe que é bot.
//
//  Calculamos o delay proporcional ao tamanho do texto, simulando
//  uma pessoa digitando: ~40 palavras/min com pausa pra pensar.
//  Faixa: 2s (mín, mensagem curta) até 10s (cap, mensagem longa).
// ════════════════════════════════════════════════════════════════

const UAZAPI_URL   = Deno.env.get('UAZAPI_URL')!
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')!

/**
 * Calcula um delay realista de digitação pra uma mensagem (estilo concierge).
 * - Base de 3s ("pensando antes de digitar com atenção")
 * - + 65ms por caractere (simula ~28 palavras/min, ritmo pausado)
 * - + 0-2s de ruído aleatório (humano não é máquina)
 * - Clamp: 4s mínimo, 15s máximo
 *
 * Filosofia: concierge lê a mensagem, pensa, formula, digita com calma.
 * Não é vendedor jogando texto pronto de script.
 */
export function humanDelay(text: string): number {
  const len = String(text || '').length
  const base = 3000 + len * 65
  const ruido = Math.floor(Math.random() * 2000)
  return Math.min(Math.max(base + ruido, 4000), 15000)
}

/**
 * Envia 1 mensagem mostrando "digitando..." antes (delay nativo UazAPI).
 * @param phone número limpo (ex: "5511999999999") ou completo (@s.whatsapp.net — qualquer um)
 * @param text  conteúdo
 * @param opts.delay override do delay (ms). Se omitido, calcula via humanDelay()
 */
export async function sendTextHumano(
  phone: string,
  text: string,
  opts: { delay?: number } = {},
): Promise<{ ok: boolean; status: number; body?: string }> {
  const delay = opts.delay ?? humanDelay(text)
  const res = await fetch(`${UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: { token: UAZAPI_TOKEN, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ number: phone, text, delay }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return { ok: false, status: res.status, body: body.slice(0, 200) }
  }
  return { ok: true, status: res.status }
}

/**
 * Envia uma SEQUÊNCIA de mensagens (texto separado por parágrafos)
 * com delays naturais entre cada uma. Espera entre msg N e msg N+1
 * o tempo do delay da msg N (a pessoa termina de digitar, manda,
 * só aí pensa na próxima).
 *
 * Retorna o tempo total gasto em ms.
 */
export async function sendSequenciaHumana(
  phone: string,
  partes: string[],
): Promise<{ ok: boolean; enviadas: number; gastoMs: number; erro?: string }> {
  const t0 = Date.now()
  let enviadas = 0
  for (let i = 0; i < partes.length; i++) {
    const delay = humanDelay(partes[i])
    const r = await sendTextHumano(phone, partes[i], { delay })
    if (!r.ok) return { ok: false, enviadas, gastoMs: Date.now() - t0, erro: `UazAPI ${r.status}: ${r.body}` }
    enviadas++
    // Espera o "digitando..." + alguns ms de buffer entre mensagens
    if (i < partes.length - 1) {
      await new Promise((r) => setTimeout(r, delay + 600))
    }
  }
  return { ok: true, enviadas, gastoMs: Date.now() - t0 }
}
