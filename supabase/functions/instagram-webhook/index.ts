// ════════════════════════════════════════════════════════════════
//  Edge Function: instagram-webhook
//
//  Webhook do Instagram Graph API (DMs, comentários, mentions).
//  Roda na nuvem (Supabase Edge Functions).
//
//  Configuração no Facebook Developers:
//    URL de callback: https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/instagram-webhook
//    Verify token: valor do secret IG_VERIFY_TOKEN
//
//  Persona Sofia-IG: tom educacional, amigável, gera autoridade.
//  Distinto da Sofia-WhatsApp (focada em conversão SPIN).
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const IG_VERIFY_TOKEN  = Deno.env.get('IG_VERIFY_TOKEN')!
const IG_ACCESS_TOKEN  = Deno.env.get('IG_ACCESS_TOKEN')!
const IG_USER_ID       = Deno.env.get('IG_USER_ID')!
const OPENROUTER_KEY   = Deno.env.get('OPENROUTER_API_KEY')!
const GRAPH_API        = 'https://graph.instagram.com/v21.0'

const SOFIA_IG_PROMPT = `Você É o Lira (Edmilson), dono da Eleva Digital, respondendo o DM do seu Instagram pessoal @o.liraads. Você NÃO é assistente, NÃO é IA, NÃO é Sofia. É VOCÊ MESMO conversando pelo celular.

## TOM ABSOLUTO
- Como você fala no WhatsApp do dia a dia. Brasileiro, informal, com gírias naturais ("mano", "cara", "tipo", "tá ligado", "saca", "tranquilo", "bora", "fechou", "deu pra entender", "boa", "fechado").
- NUNCA use emojis. NENHUM. Nem 😅 nem 👋 nem ✓ nem 🚀.
- NUNCA use travessão "—" ou "–" nem hífen comprido. Use vírgula, ponto, dois-pontos. Travessão denuncia IA na hora.
- Mensagem MÁXIMA: 1 frase curta. 2 só se for inevitável. NUNCA texto grande.
- Sem listas, sem bullet points, sem títulos. Texto corrido só.
- Erros leves de digitação OU português coloquial são OK (ex: "pra" em vez de "para", "tá" em vez de "está", "vc" em vez de "você" se ficar natural).

## VOCÊ É O LIRA
- Tem agência de marketing digital em Taubaté/SP. Faz tráfego pago, automação com IA, sites, edição de vídeo, tracking server-side.
- Tem WhatsApp pessoal: 12 98168-0894. Pode passar quando a conversa fizer sentido pra reunião.
- Tem 3 vagas pra diagnóstico gratuito por mês. Diagnóstico é 30 min, sem custo, sem proposta engessada.

## COMO RESPONDER
1. Acolhe natural ("oi, tudo certo?", "fala, tudo bem por aí?", "salve").
2. Pergunta UMA coisa rápida ("qual seu negócio?", "tá rodando ads?", "que tipo de empresa?").
3. Se a pessoa contou problema, dá UM insight curto e útil de graça. Tipo amigo dando dica.
4. Se interesse alto (perguntou preço, serviço, contratação, agendar): manda o link do WhatsApp e fala que lá conversa melhor. NUNCA fale preço.
5. Se a pessoa não tem interesse, encerra de boa ("tranquilo, qualquer coisa tô por aqui").

## REGRAS DURAS
- NUNCA "espero que esteja bem", "atenciosamente", "fico à disposição". Linguagem corporativa MATA o tom.
- NUNCA "como posso ajudar?". Pergunta direta sobre o negócio.
- Nunca admita ser robô. Se perguntarem: "sou o Lira mesmo, só tô no Insta agora".
- Não promete resultado específico. Não inventa case.

## EXEMPLOS DO TOM CERTO
Lead: "oi tudo bem"
Você: "fala, tudo certo. tá com algum projeto rolando?"

Lead: "tenho uma clínica e quero crescer no insta"
Você: "boa. tá investindo em ads hoje ou tá no orgânico ainda?"

Lead: "quanto custa o serviço?"
Você: "depende do diagnóstico, fica melhor falar no whats. me chama em wa.me/5512981680894 que a gente alinha"

## RETORNO (sempre JSON válido, sem markdown):
{
  "messages": ["mensagem curta como vc falaria"],
  "interest_level": "low|medium|high",
  "should_send_to_whatsapp": false,
  "lead_info": { "name": "", "business": "", "main_pain": "" }
}

Quando interest_level=high E pessoa demonstrou querer contratar/agendar/saber preço: should_send_to_whatsapp=true e na messages cole o link wa.me/5512981680894.`

interface IgMessage {
  sender: { id: string }
  recipient: { id: string }
  timestamp?: number
  message?: { mid?: string; text?: string }
}

interface IgEntry {
  id: string
  time: number
  messaging?: IgMessage[]
  changes?: Array<{ field: string; value: unknown }>
}

interface IgWebhookBody {
  object?: string
  entry?: IgEntry[]
}

async function sendIgMessage(recipientId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`${GRAPH_API}/${IG_USER_ID}/messages?access_token=${IG_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text }
      })
    })
    if (!res.ok) {
      console.error('[IG send] falha:', res.status, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('[IG send] erro:', err)
    return false
  }
}

async function aiReply(history: Array<{ role: string; content: string }>, userMessage: string) {
  const messages = [
    { role: 'system', content: SOFIA_IG_PROMPT },
    ...history.slice(-10),
    { role: 'user', content: userMessage }
  ]

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://elevabrands.com.br',
      'X-Title': 'Eleva Digital · Instagram Bot'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4.5',
      max_tokens: 400,
      temperature: 0.75,
      messages
    })
  })

  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const raw = json.choices?.[0]?.message?.content || ''

  try {
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    const obj = JSON.parse(match![0])
    return {
      messages: Array.isArray(obj.messages) ? obj.messages : ['Oi! Pode repetir?'],
      interest_level: obj.interest_level || 'medium',
      should_send_to_whatsapp: !!obj.should_send_to_whatsapp,
      lead_info: obj.lead_info || {}
    }
  } catch {
    console.error('[AI] parse fail:', raw)
    return {
      messages: ['Oi! Tive um probleminha aqui, pode mandar de novo?'],
      interest_level: 'low',
      should_send_to_whatsapp: false,
      lead_info: {}
    }
  }
}

async function handleDm(senderId: string, text: string) {
  // Busca histórico (mesma tabela do bot principal, prefixo "ig:" pra separar)
  const phoneKey = `ig:${senderId}`
  const { data: conv } = await supabase
    .from('chatbot_conversations')
    .select('messages, lead_data')
    .eq('phone', phoneKey)
    .single()

  const history = ((conv?.messages || []) as Array<{ role: string; content: string }>)

  const result = await aiReply(history, text)
  const replyText = result.messages.join('\n')

  // Manda a resposta no Instagram
  await sendIgMessage(senderId, replyText)

  // Salva no banco
  const updated = [
    ...history,
    { role: 'user', content: text },
    { role: 'assistant', content: replyText }
  ].slice(-40)

  await supabase.from('chatbot_conversations').upsert({
    phone: phoneKey,
    stage: result.interest_level === 'high' ? 'qualificado' : 'inicio',
    messages: updated,
    lead_data: {
      ...(conv?.lead_data || {}),
      ...result.lead_info,
      canal: 'instagram',
      ig_sender_id: senderId,
      interesse: result.interest_level
    },
    last_message_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, { onConflict: 'phone' })

  // Se interest_level=high, cria/atualiza lead no CRM
  if (result.interest_level === 'high') {
    await supabase.from('clientes').upsert({
      nome: (result.lead_info as Record<string, string>).name || `Instagram lead (${senderId})`,
      empresa: (result.lead_info as Record<string, string>).business || '',
      whatsapp: phoneKey, // marca origem como ig
      servico: 'Marketing IA + Tráfego Pago',
      status: 'qualificado',
      temperatura: 'quente',
      observacoes: `Origem: Instagram DM | Dor: ${(result.lead_info as Record<string, string>).main_pain || 'n/d'}`,
      atualizado_em: new Date().toISOString()
    }, { onConflict: 'whatsapp' })
  }
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)

  // ── GET: handshake do Facebook ─────────────────────────────────────
  if (req.method === 'GET') {
    const mode      = url.searchParams.get('hub.mode')
    const challenge = url.searchParams.get('hub.challenge')
    const token     = url.searchParams.get('hub.verify_token')

    if (mode === 'subscribe' && token === IG_VERIFY_TOKEN && challenge) {
      console.log('[IG webhook] handshake OK')
      return new Response(challenge, { status: 200 })
    }
    console.warn('[IG webhook] handshake REJEITADO', { mode, tokenMatches: token === IG_VERIFY_TOKEN })
    return new Response('Forbidden', { status: 403 })
  }

  // ── POST: eventos (DMs, comments, mentions) ────────────────────────
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body: IgWebhookBody = {}
  try { body = await req.json() } catch { /* body vazio */ }

  // Log do payload bruto pra debug
  try {
    await supabase.from('chatbot_conversations').upsert({
      phone: '__ig_debug__',
      stage: 'debug',
      messages: [{ raw: body }],
      lead_data: {},
      updated_at: new Date().toISOString()
    }, { onConflict: 'phone' })
  } catch (_) { /* ignora */ }

  try {
    for (const entry of body.entry || []) {
      // ── Mensagens DM ─────────────────────────────────────────────
      for (const m of entry.messaging || []) {
        if (m.sender?.id === IG_USER_ID) continue // mensagens enviadas pela própria conta
        const text = m.message?.text
        if (!text) continue // ignora stickers/áudios por enquanto
        const senderId = m.sender.id
        console.log(`[IG DM] ${senderId}: ${text}`)
        await handleDm(senderId, text)
      }

      // ── Comments, mentions (futuro) ──────────────────────────────
      for (const change of entry.changes || []) {
        console.log('[IG change]', change.field)
        // TODO: implementar quando o user pedir
      }
    }
  } catch (err) {
    console.error('[IG webhook] erro no processamento:', err)
  }

  // Responder 200 rápido (Meta espera <2s)
  return new Response('EVENT_RECEIVED', { status: 200 })
})
