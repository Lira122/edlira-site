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

interface IgCommentValue {
  id?: string                // comment id
  text?: string
  from?: { id?: string; username?: string }
  media?: { id?: string; media_product_type?: string }
  parent_id?: string         // se for reply de outro comment
  created_time?: number
}

interface IgEntry {
  id: string
  time: number
  messaging?: IgMessage[]
  changes?: Array<{ field: string; value: IgCommentValue | Record<string, unknown> }>
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

// ─── Comments: like, reply público, private reply (DM via comment_id) ──────

async function likeComment(commentId: string): Promise<boolean> {
  try {
    const res = await fetch(`${GRAPH_API}/${commentId}/likes?access_token=${IG_ACCESS_TOKEN}`, {
      method: 'POST'
    })
    if (!res.ok) console.error('[IG like] falha:', res.status, await res.text())
    return res.ok
  } catch (err) { console.error('[IG like] erro:', err); return false }
}

async function replyToComment(commentId: string, message: string): Promise<boolean> {
  try {
    const url = `${GRAPH_API}/${commentId}/replies?access_token=${IG_ACCESS_TOKEN}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    if (!res.ok) console.error('[IG reply] falha:', res.status, await res.text())
    return res.ok
  } catch (err) { console.error('[IG reply] erro:', err); return false }
}

async function sendPrivateReplyToComment(commentId: string, text: string): Promise<boolean> {
  try {
    // Private reply via comment_id: permitido até 7 dias após o comment, sem opt-in prévio
    const res = await fetch(`${GRAPH_API}/${IG_USER_ID}/messages?access_token=${IG_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { comment_id: commentId },
        message: { text }
      })
    })
    if (!res.ok) console.error('[IG private reply] falha:', res.status, await res.text())
    return res.ok
  } catch (err) { console.error('[IG private reply] erro:', err); return false }
}

// Detecção rápida de interesse por palavras-chave (rule-based, antes do AI)
function detectInterestKeywords(text: string): boolean {
  const t = (text || '').toLowerCase()
  const patterns = [
    /\beu quero\b/, /\beu preciso\b/, /\bquero\b/, /\bpreciso\b/,
    /\bme interessa\b/, /\binteresse\b/, /\binteressad/,
    /\brob[oôõ]\b/, /\bbot\b/, /\bia\b/,
    /\bcomo funciona\b/, /\bcomo faz\b/, /\bcomo fazer\b/,
    /\bquanto custa\b/, /\bpre[cç]o\b/, /\bvalor\b/, /\borçament/, /\borcament/,
    /\binforma[cç]/, /\bme manda\b/, /\bme chama\b/, /\bme passa\b/,
    /\bcontrat/, /\bfechar\b/, /\bagendar\b/, /\breunião\b/, /\breuniao\b/,
    /\bcontato\b/, /\bwhats\b/, /\bzap\b/,
    /^eu$/, /^eu\.$/, /^eu!$/,  // só "EU" sozinho
    /^sim\b/, /^quero\b/
  ]
  return patterns.some(rx => rx.test(t))
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

// ─── Persona pra responder COMENTÁRIO público ────────────────────────────
const SOFIA_IG_COMMENT_PROMPT = `Você É o Lira (Edmilson), dono da Eleva Digital, respondendo um COMENTÁRIO no seu Instagram @o.liraads. NÃO é assistente, NÃO é IA. É VOCÊ MESMO no celular.

## REGRAS DE TOM (idênticas ao DM)
- Brasileiro, informal, gírias naturais ("mano", "cara", "tipo", "salve", "fechado", "boa").
- NUNCA emoji. NUNCA travessão "—". Use vírgula, ponto.
- MÁXIMO 1 frase curtíssima na resposta pública. 2 frases só se for inevitável.
- Sem listas, sem títulos, sem texto formal.

## CONTEXTO
O comentário é PÚBLICO, qualquer um vê. Então a resposta tem que:
- Engajar genuinamente (não parecer atendimento corporativo).
- Não pedir dados pessoais no público.
- Se a pessoa demonstrou interesse claro (perguntou preço, "eu quero", "como funciona", "robô", etc), na resposta pública só fala que chama no Direct. Não responde a dúvida no comentário público.

## CLASSIFICAÇÃO (você decide)
- "interest" = pessoa demonstrou interesse real (quer saber mais, preço, contratar, perguntou sobre o serviço/robô)
- "question" = dúvida genuína de quem só quer aprender, mas sem intenção de comprar
- "feedback" = elogio, comentário positivo sobre o conteúdo
- "neutral" = comentário neutro, vago, ou só interação
- "spam" = óbvio spam, propaganda externa, ofensa

## QUANDO send_dm=true
- Sempre quando intent="interest"
- A mensagem do DM (dm_text) é mais completa: cumprimenta, mostra que viu o comentário, abre conversa pro entendimento da necessidade. Ainda em tom 1ª pessoa Lira.

## EXEMPLOS
Comment: "show, salvei aqui"
→ reply_public: "valeu! qualquer coisa tô por aqui"
→ intent: "feedback", send_dm: false

Comment: "eu quero!!"
→ reply_public: "fechou, te chamo no direct"
→ intent: "interest", send_dm: true
→ dm_text: "fala, vi seu comentário no post. me conta rapidão: tem alguma empresa rodando ou tá começando?"

Comment: "quanto custa pra fazer?"
→ reply_public: "depende do diagnóstico, vou te chamar no direct"
→ intent: "interest", send_dm: true
→ dm_text: "salve, vi seu comentário. me conta seu negócio que eu te passo o caminho de fechar isso"

Comment: "muito bom"
→ reply_public: "obrigado mano"
→ intent: "feedback", send_dm: false

Comment: "como funciona esse robô?"
→ reply_public: "vou te explicar no direct"
→ intent: "interest", send_dm: true
→ dm_text: "fala. então o robô atende lead 24h no whats e marca reunião sozinho. tu tem empresa rodando hoje?"

## RETORNO (sempre JSON, sem markdown):
{
  "intent": "interest|question|feedback|neutral|spam",
  "should_like": true,
  "reply_public": "resposta curta",
  "send_dm": false,
  "dm_text": ""
}

- should_like=true sempre, EXCETO se intent="spam"
- send_dm=true só quando intent="interest"
`

async function aiClassifyComment(text: string, username: string) {
  const userMsg = `Comentário de @${username}: "${text}"`
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://elevabrands.com.br',
      'X-Title': 'Eleva Digital · IG Comments'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4.5',
      max_tokens: 250,
      temperature: 0.7,
      messages: [
        { role: 'system', content: SOFIA_IG_COMMENT_PROMPT },
        { role: 'user', content: userMsg }
      ]
    })
  })
  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const raw = json.choices?.[0]?.message?.content || ''
  try {
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    return JSON.parse(match![0])
  } catch {
    console.error('[AI comment] parse fail:', raw)
    return { intent: 'neutral', should_like: true, reply_public: 'valeu', send_dm: false, dm_text: '' }
  }
}

async function handleComment(value: IgCommentValue) {
  const commentId = value.id
  const text      = value.text || ''
  const fromId    = value.from?.id
  const username  = value.from?.username || 'usuario'
  if (!commentId || !text) return

  // Ignora comentário da própria conta (auto-replies)
  if (fromId === IG_USER_ID) {
    console.log('[IG comment] ignorando comentário da própria conta')
    return
  }

  console.log(`[IG comment] @${username}: ${text}`)

  // Boost: keywords de interesse forçam classificação como "interest"
  const keywordInterest = detectInterestKeywords(text)

  // Classifica via IA
  const result = await aiClassifyComment(text, username)
  if (keywordInterest && result.intent !== 'spam') {
    result.intent = 'interest'
    result.send_dm = true
    if (!result.dm_text) {
      result.dm_text = 'fala, vi seu comentário aqui no post. me conta rapidão: tem alguma empresa rodando ads hoje?'
    }
    if (!result.reply_public) result.reply_public = 'fechou, te chamo no direct'
  }

  // 1. Curte o comentário (se não for spam)
  if (result.should_like !== false && result.intent !== 'spam') {
    await likeComment(commentId)
  }

  // 2. Responde publicamente (se tem texto)
  if (result.reply_public && result.intent !== 'spam') {
    await replyToComment(commentId, result.reply_public)
  }

  // 3. Manda DM privada se interest
  let dmSent = false
  if (result.send_dm && result.dm_text) {
    dmSent = await sendPrivateReplyToComment(commentId, result.dm_text)
  }

  // 4. Loga no banco pra histórico/CRM
  const phoneKey = `ig:comment:${fromId || commentId}`
  try {
    await supabase.from('chatbot_conversations').upsert({
      phone: phoneKey,
      stage: result.intent === 'interest' ? 'qualificado' : 'inicio',
      messages: [
        { role: 'user', content: `[comment @${username}]: ${text}` },
        { role: 'assistant', content: `[reply public]: ${result.reply_public}` },
        ...(dmSent ? [{ role: 'assistant', content: `[dm]: ${result.dm_text}` }] : [])
      ],
      lead_data: {
        canal: 'instagram_comment',
        ig_username: username,
        ig_user_id: fromId,
        comment_id: commentId,
        media_id: value.media?.id,
        intent: result.intent,
        keyword_match: keywordInterest
      },
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'phone' })
  } catch (err) {
    console.error('[IG comment] db log falhou:', err)
  }

  // Lead quente direto no CRM se interest
  if (result.intent === 'interest') {
    try {
      await supabase.from('clientes').upsert({
        nome: `@${username} (IG)`,
        whatsapp: phoneKey,
        servico: 'Marketing IA + Tráfego Pago',
        status: 'qualificado',
        temperatura: 'quente',
        observacoes: `Origem: Instagram comment | Comment: "${text.slice(0, 200)}" | DM enviada: ${dmSent ? 'sim' : 'não'}`,
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'whatsapp' })
    } catch (err) {
      console.error('[IG comment] crm upsert falhou:', err)
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

      // ── Comments + mentions ──────────────────────────────────────
      for (const change of entry.changes || []) {
        console.log('[IG change]', change.field)
        if (change.field === 'comments') {
          await handleComment(change.value as IgCommentValue)
        }
        // mentions ainda não implementado
      }
    }
  } catch (err) {
    console.error('[IG webhook] erro no processamento:', err)
  }

  // Responder 200 rápido (Meta espera <2s)
  return new Response('EVENT_RECEIVED', { status: 200 })
})
