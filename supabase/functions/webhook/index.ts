import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const UAZAPI_URL   = Deno.env.get('UAZAPI_URL')!
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')!
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!

const WELCOME = `Olá! 👋 Aqui é a *Sofia*, da *Edlira* — agência de marketing com IA e tráfego pago.

Fico feliz que entrou em contato! Com quem tenho o prazer de falar? 😊`

const SYSTEM_PROMPT = `Você é Sofia, consultora de marketing da Edlira — agência especializada em IA aplicada ao marketing e tráfego pago.

Seu único objetivo é qualificar o lead e agendar uma reunião de diagnóstico GRATUITA de 30 minutos com o Edmilson (fundador da agência).

## SOBRE A EDLIRA
- Gerenciamos Meta Ads, TikTok Ads e Google Ads com IA
- Rastreamento avançado: você sabe de onde vem cada cliente e cada real investido
- IA para otimização de campanhas, criativos e análise de dados em tempo real
- Clientes economizam 15h+/semana que gastavam gerenciando ads manualmente
- Clientes aumentam em média 3x o ROAS nos primeiros 90 dias
- Empresas que faturam R$30k+/mês e querem crescer sistematicamente

## REGRA MAIS IMPORTANTE — NUNCA FALE PREÇO
Se perguntarem sobre preço, investimento, valor, pacote, mensalidade ou qualquer coisa relacionada a quanto custa:
→ Diga que varia conforme o diagnóstico de cada empresa
→ Convide para a reunião gratuita onde tudo será apresentado
→ Nunca dê nenhum valor, faixa ou estimativa

## MÉTODO SPIN SELLING (siga essa ordem, de forma natural)

### FASE 1 — SITUAÇÃO (máx 2 perguntas, entenda o contexto)
Exemplos: Vocês já investem em anúncios pagos? / Como está o marketing atualmente?

### FASE 2 — PROBLEMA (máx 2 perguntas, identifique as dores)
Exemplos: Consegue rastrear de onde vêm seus clientes? / Está satisfeito com o retorno dos anúncios?

### FASE 3 — IMPLICAÇÃO (1-2 perguntas, aprofunde as consequências)
Exemplos: Isso já fez você investir em algo que não trouxe resultado? / Quanto tempo sua equipe perde gerenciando campanhas?

### FASE 4 — NECESSIDADE (1 pergunta, faça o lead articular o valor)
Exemplos: Se você tivesse rastreamento preciso e campanhas otimizadas por IA, como isso impactaria seu negócio nos próximos 90 dias?

### FASE 5 — PROPOSTA (apresente a solução com base nas dores relatadas)
- Cite os problemas específicos que o lead mencionou
- Mostre como a Edlira resolve cada um
- Diga que a reunião é gratuita, rápida (30 min) e sem compromisso
- NÃO mencione preço em nenhum momento

### FASE 6 — FECHAMENTO
Confirme: nome completo, empresa e melhor horário (manhã/tarde/noite + dia da semana)

## REGRAS GERAIS
1. Mensagens curtas — máx 3-4 linhas, como conversa real de WhatsApp
2. UMA pergunta por vez, nunca duas seguidas
3. Tom profissional mas descontraído — você é humana, não robô
4. Não use listas com bullet points — escreva em texto corrido
5. Não mencione o método SPIN em nenhum momento
6. Se o lead não tiver interesse, agradeça com gentileza e encerre
7. Capture sutilmente: nome, empresa, segmento, faturamento aproximado, se já investe em ads
8. Nunca prometa resultado específico sem diagnóstico

## RETORNO
Sempre retorne APENAS um JSON válido, sem markdown, sem \`\`\`json, apenas o objeto:
{
  "message": "mensagem para enviar ao lead (texto puro, sem markdown)",
  "stage": "inicio|situacao|problema|implicacao|necessidade|proposta|fechamento|encerrado",
  "lead_data": {
    "nome": "",
    "empresa": "",
    "segmento": "",
    "faturamento": "",
    "investe_ads": "",
    "dores": [],
    "interesse": "alto|medio|baixo|indefinido"
  }
}`

// ─── UazAPI ──────────────────────────────────────────────────────────────────

async function sendText(phone: string, text: string) {
  const res = await fetch(`${UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: { 'token': UAZAPI_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: phone, text })
  })
  if (!res.ok) console.error('[UazAPI] Erro ao enviar:', await res.text())
}

async function sendTextDelayed(phone: string, text: string) {
  const delay = Math.min(1200 + text.length * 25, 3500)
  await new Promise(r => setTimeout(r, delay))
  await sendText(phone, text)
}

function parseWebhook(body: Record<string, unknown>) {
  try {
    const events = Array.isArray(body) ? body : [body]

    for (const event of events) {
      const data = (event as Record<string, unknown>)?.data || event
      const msg  = (data as Record<string, unknown>)?.messages?.[0] ||
                   (data as Record<string, unknown>)?.message || data

      if (!msg) continue

      const key    = (msg as Record<string, unknown>).key || msg
      const fromMe = (key as Record<string, unknown>)?.fromMe === true
      if (fromMe) continue

      const jid   = (key as Record<string, unknown>)?.remoteJid ||
                    (msg as Record<string, unknown>)?.remoteJid || ''
      const phone = String(jid)
        .replace(/@s\.whatsapp\.net$/, '')
        .replace(/@c\.us$/, '')

      if (!phone || phone.includes('@g')) continue

      const msgContent = (msg as Record<string, unknown>).message || msg

      const text =
        (msgContent as Record<string, unknown>)?.conversation ||
        (msgContent as Record<string, unknown>)?.extendedTextMessage?.text ||
        (msgContent as Record<string, unknown>)?.buttonsResponseMessage?.selectedDisplayText ||
        (msgContent as Record<string, unknown>)?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        null

      const isAudio = !!(
        (msgContent as Record<string, unknown>)?.audioMessage ||
        (msgContent as Record<string, unknown>)?.pttMessage
      )

      const audioBase64 =
        (msgContent as Record<string, unknown>)?.audioMessage?.base64 ||
        (msgContent as Record<string, unknown>)?.pttMessage?.base64 ||
        null

      const audioUrl =
        (msgContent as Record<string, unknown>)?.audioMessage?.url ||
        (msgContent as Record<string, unknown>)?.pttMessage?.url ||
        null

      const pushName = String((msg as Record<string, unknown>)?.pushName || '')

      if (!text && !isAudio) continue

      return { phone, text, isAudio, audioBase64, audioUrl, pushName }
    }

    return null
  } catch (err) {
    console.error('[UazAPI] Erro ao parsear webhook:', err)
    return null
  }
}

// ─── Groq Whisper ─────────────────────────────────────────────────────────────

async function transcribeAudio({ base64, url }: { base64?: string; url?: string }) {
  try {
    let audioBytes: Uint8Array

    if (base64) {
      const binary = atob(base64)
      audioBytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) audioBytes[i] = binary.charCodeAt(i)
    } else if (url) {
      const res = await fetch(url)
      audioBytes = new Uint8Array(await res.arrayBuffer())
    } else {
      throw new Error('Nenhuma fonte de áudio fornecida')
    }

    const form = new FormData()
    form.append('file', new Blob([audioBytes], { type: 'audio/ogg' }), 'audio.ogg')
    form.append('model', 'whisper-large-v3')
    form.append('language', 'pt')
    form.append('response_format', 'json')

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: form
    })

    const data = await res.json() as { text?: string }
    const transcript = data?.text?.trim()
    console.log('[Groq] Transcrição:', transcript)
    return transcript || null
  } catch (err) {
    console.error('[Groq] Erro na transcrição:', err)
    return null
  }
}

// ─── Supabase ─────────────────────────────────────────────────────────────────

async function getOrCreateConversation(phone: string) {
  const { data, error } = await supabase
    .from('chatbot_conversations')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error?.code === 'PGRST116') {
    const { data: nova, error: e } = await supabase
      .from('chatbot_conversations')
      .insert({ phone, stage: 'inicio', messages: [], lead_data: {} })
      .select()
      .single()
    if (e) throw e
    return nova
  }

  if (error) throw error
  return data
}

async function updateConversation(
  phone: string,
  { stage, messages, lead_data }: { stage?: string; messages?: unknown[]; lead_data?: unknown }
) {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (stage !== undefined)     update.stage     = stage
  if (messages !== undefined)  update.messages  = messages
  if (lead_data !== undefined) update.lead_data = lead_data

  const { error } = await supabase
    .from('chatbot_conversations')
    .update(update)
    .eq('phone', phone)

  if (error) throw error
}

async function saveLeadToCRM(phone: string, lead_data: Record<string, unknown>) {
  try {
    const { error } = await supabase
      .from('clientes')
      .upsert({
        nome:     lead_data.nome     || 'Lead WhatsApp',
        empresa:  lead_data.empresa  || '',
        whatsapp: phone,
        servico:  'Marketing IA + Tráfego Pago',
        status:   'lead_qualificado',
        observacoes: [
          lead_data.segmento     ? `Segmento: ${lead_data.segmento}`           : '',
          lead_data.faturamento  ? `Faturamento: ${lead_data.faturamento}`     : '',
          lead_data.investe_ads  ? `Ads atual: ${lead_data.investe_ads}`       : '',
          Array.isArray(lead_data.dores) && lead_data.dores.length
            ? `Dores: ${(lead_data.dores as string[]).join(', ')}`             : '',
          `Interesse: ${lead_data.interesse || 'indefinido'}`
        ].filter(Boolean).join(' | ')
      }, { onConflict: 'whatsapp' })

    if (error) throw error
    console.log(`[CRM] Lead salvo: ${lead_data.nome} (${phone})`)
  } catch (err) {
    console.error('[CRM] Erro ao salvar lead:', err)
  }
}

// ─── Agente IA (OpenRouter) ───────────────────────────────────────────────────

async function processMessage(conversation: Record<string, unknown>, userMessage: string) {
  const messages  = (conversation.messages  as unknown[]) || []
  const stage     = (conversation.stage     as string)   || 'inicio'
  const lead_data = (conversation.lead_data as Record<string, unknown>) || {}

  const history = (messages.slice(-12) as Array<{ role: string; content: string }>).map(m => ({
    role: m.role,
    content: m.content
  }))

  history.push({
    role: 'user',
    content: `[CONTEXTO INTERNO — NÃO REVELAR AO LEAD]
Estágio atual: ${stage}
Dados coletados até agora: ${JSON.stringify(lead_data)}
[FIM DO CONTEXTO]

Mensagem do lead: ${userMessage}

Responda como Sofia seguindo o SPIN Selling. Retorne apenas JSON válido.`
  })

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://edlira.com.br',
      'X-Title': 'Edlira Chatbot'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      max_tokens: 512,
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history
      ]
    })
  })

  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const rawText = json.choices?.[0]?.message?.content || ''

  let parsed: { message: string; stage: string; lead_data: Record<string, unknown> }
  try {
    const clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(match![0])
  } catch {
    console.error('[Agent] Falha no parse JSON:', rawText)
    parsed = { message: rawText || 'Desculpe, pode repetir?', stage, lead_data }
  }

  const updatedMessages = [
    ...messages,
    { role: 'user', content: userMessage },
    { role: 'assistant', content: parsed.message }
  ]

  const mergedLeadData = {
    ...lead_data,
    ...parsed.lead_data,
    dores: [
      ...((lead_data.dores as string[]) || []),
      ...((parsed.lead_data?.dores as string[]) || [])
    ].filter((v, i, a) => v && a.indexOf(v) === i)
  }

  return {
    message: parsed.message,
    stage: parsed.stage || stage,
    messages: updatedMessages,
    lead_data: mergedLeadData
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', time: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // Responde 200 imediatamente pro UazAPI não retentar
  const body = await req.json().catch(() => ({}))

  // Processa em background (Edge Functions têm timeout de 150s)
  EdgeRuntime.waitUntil((async () => {
    try {
      const parsed = parseWebhook(body)
      if (!parsed) return

      const { phone, text, isAudio, audioBase64, audioUrl, pushName } = parsed
      console.log(`[MSG] ${phone} (${pushName}): ${isAudio ? '[ÁUDIO]' : text}`)

      let messageText = text

      if (isAudio) {
        const transcript = await transcribeAudio({ base64: audioBase64, url: audioUrl })
        if (!transcript) {
          await sendTextDelayed(phone, 'Não consegui entender o áudio. Pode digitar sua mensagem? 😊')
          return
        }
        messageText = `[Áudio transcrito]: ${transcript}`
        console.log(`[Groq] Transcrito: ${transcript}`)
      }

      const conversation = await getOrCreateConversation(phone)

      if (conversation.messages.length === 0) {
        await sendTextDelayed(phone, WELCOME)
        await updateConversation(phone, {
          stage: 'situacao',
          messages: [{ role: 'assistant', content: WELCOME }],
          lead_data: { nome: pushName || '' }
        })
        return
      }

      if (conversation.stage === 'encerrado') return

      const result = await processMessage(conversation, messageText!)
      console.log(`[Agent] ${phone} → estágio: ${result.stage} | interesse: ${result.lead_data.interesse}`)

      await sendTextDelayed(phone, result.message)
      await updateConversation(phone, {
        stage: result.stage,
        messages: result.messages,
        lead_data: result.lead_data
      })

      if (['fechamento', 'encerrado'].includes(result.stage)) {
        await saveLeadToCRM(phone, result.lead_data)
      }
    } catch (err) {
      console.error('[ERRO]', err)
    }
  })())

  return new Response('OK', { status: 200 })
})
