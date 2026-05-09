import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const UAZAPI_URL         = Deno.env.get('UAZAPI_URL')!
const UAZAPI_TOKEN       = Deno.env.get('UAZAPI_TOKEN')!
const OPENROUTER_API_KEY  = Deno.env.get('OPENROUTER_API_KEY')!
const GROQ_API_KEY        = Deno.env.get('GROQ_API_KEY')!
const CAL_API_KEY         = Deno.env.get('CAL_API_KEY')!
const ELEVENLABS_API_KEY  = Deno.env.get('ELEVENLABS_API_KEY')!

const ELEVENLABS_VOICE_ID = '33B4UnXyTNbgLmdEDh5P' // Keren — Young Brazilian Female

const CAL_EVENT_TYPE_ID  = 3266163          // Reunião de 60 min
const CAL_TIMEZONE       = 'America/Sao_Paulo'
const LIRA_PHONE         = '5512981668507'   // Notificação de booking
const LIRA_PERSONAL      = '5512981668507'   // Modo assistente pessoal

const WELCOME_MSGS = [
  `Oi! 👋 Aqui é a Sofia, assistente virtual do Lira, da *Edlira* — agência de marketing com IA e tráfego pago.`,
  `Fico feliz que entrou em contato! Com quem tenho o prazer de falar? 😊`
]

const SYSTEM_PROMPT = `Você é a Sofia, assistente virtual do Lira, da Edlira — agência especializada em IA aplicada ao marketing e tráfego pago.

Seu único objetivo é qualificar o lead e agendar uma reunião de diagnóstico GRATUITA de 60 minutos com o Lira (fundador da agência).

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
- Diga que a reunião é gratuita, dura 60 min e é sem compromisso
- NÃO mencione preço em nenhum momento

### FASE 6 — FECHAMENTO (agendamento real)
Quando o lead aceitar a reunião, você receberá no contexto uma lista de HORÁRIOS DISPONÍVEIS na agenda do Lira.
- Apresente 3 a 4 opções de horários de forma amigável (ex: "Tenho *segunda às 9h*, *terça às 14h* ou *quarta às 10h* — qual fica melhor?")
- Quando o lead escolher um horário, retorne action "book" com o campo slot_iso preenchido com o ISO exato do slot escolhido
- Confirme também o e-mail do lead (necessário para enviar o link da reunião)
- Após confirmar, retorne action "book"

## REGRAS GERAIS
1. Escreva como humano — quebre em 2 a 3 mensagens curtas separadas, como se estivesse digitando no WhatsApp
2. UMA pergunta por vez, nunca duas seguidas
3. Tom profissional mas descontraído — você é humana, não robô
4. Não use listas com bullet points — escreva em texto corrido
5. Não mencione o método SPIN em nenhum momento
6. Se o lead não tiver interesse, agradeça com gentileza e encerre
7. Capture sutilmente: nome, empresa, segmento, faturamento aproximado, se já investe em ads
8. Nunca prometa resultado específico sem diagnóstico

## RETORNO
Sempre retorne APENAS um JSON válido, sem markdown, sem \`\`\`json, apenas o objeto.
{
  "messages": ["primeira mensagem curta", "segunda mensagem", "pergunta final (se houver)"],
  "stage": "inicio|situacao|problema|implicacao|necessidade|proposta|fechamento|encerrado",
  "action": "none|book",
  "slot_iso": "",
  "lead_data": {
    "nome": "",
    "empresa": "",
    "email": "",
    "segmento": "",
    "faturamento": "",
    "investe_ads": "",
    "dores": [],
    "interesse": "alto|medio|baixo|indefinido"
  }
}`

// ─── Cal.com ──────────────────────────────────────────────────────────────────

const CAL_HEADERS = {
  'Authorization': `Bearer ${CAL_API_KEY}`,
  'cal-api-version': '2024-06-14',
  'Content-Type': 'application/json'
}

async function getAvailableSlots(): Promise<Record<string, string[]>> {
  try {
    const now   = new Date()
    const start = new Date(now.getTime() + 2 * 60 * 60 * 1000)   // mín 2h à frente
    const end   = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000) // próximos 8 dias

    const url = `https://api.cal.com/v2/slots/available?eventTypeId=${CAL_EVENT_TYPE_ID}` +
      `&startTime=${start.toISOString()}&endTime=${end.toISOString()}&timeZone=${CAL_TIMEZONE}`

    const res  = await fetch(url, { headers: CAL_HEADERS })
    const json = await res.json() as { status: string; data?: { slots?: Record<string, Array<{ time: string }>> } }

    if (json.status !== 'success' || !json.data?.slots) return {}

    // Converte para { "2026-05-12": ["2026-05-12T09:00:00-03:00", ...] }
    const result: Record<string, string[]> = {}
    for (const [date, slots] of Object.entries(json.data.slots)) {
      result[date] = (slots as Array<{ time: string }>).map(s => s.time)
    }
    return result
  } catch (err) {
    console.error('[Cal] Erro ao buscar slots:', err)
    return {}
  }
}

function formatSlotsForContext(slots: Record<string, string[]>): string {
  if (!Object.keys(slots).length) return 'Nenhum horário disponível nos próximos dias.'

  const diasPT: Record<number, string> = {
    0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
    4: 'Quinta', 5: 'Sexta', 6: 'Sábado'
  }

  const lines: string[] = []
  let count = 0

  for (const [date, times] of Object.entries(slots)) {
    if (count >= 4) break  // máx 4 dias para não sobrecarregar o AI
    const d = new Date(date + 'T12:00:00-03:00')
    const diaNome = diasPT[d.getDay()]
    const diaNum  = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: CAL_TIMEZONE })

    const horariosStr = times.slice(0, 5).map(t => {
      const dt = new Date(t)
      return dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: CAL_TIMEZONE }) + 'h'
    }).join(', ')

    lines.push(`*${diaNome} (${diaNum})*: ${horariosStr}`)
    count++
  }

  return lines.join('\n')
}

async function createCalBooking(slotIso: string, leadData: Record<string, unknown>): Promise<string | null> {
  try {
    const name  = String(leadData.nome  || 'Lead')
    const email = String(leadData.email || `lead_${Date.now()}@sem-email.com`)

    const body = {
      eventTypeId: CAL_EVENT_TYPE_ID,
      start: slotIso,
      attendee: {
        name,
        email,
        timeZone: CAL_TIMEZONE,
        language: 'pt'
      },
      metadata: {
        empresa:   String(leadData.empresa  || ''),
        whatsapp:  String(leadData.whatsapp || ''),
        segmento:  String(leadData.segmento || ''),
        interesse: String(leadData.interesse || '')
      }
    }

    const res  = await fetch('https://api.cal.com/v2/bookings', {
      method: 'POST',
      headers: CAL_HEADERS,
      body: JSON.stringify(body)
    })
    const json = await res.json() as { status: string; data?: { uid?: string; meetingUrl?: string } }
    console.log('[Cal] Booking response:', JSON.stringify(json).slice(0, 500))

    if (json.status !== 'success') {
      console.error('[Cal] Falha no booking:', JSON.stringify(json))
      return null
    }

    return json.data?.meetingUrl || json.data?.uid || 'confirmado'
  } catch (err) {
    console.error('[Cal] Erro ao criar booking:', err)
    return null
  }
}

function formatBookingConfirmation(slotIso: string, meetingUrl: string | null): string {
  const dt = new Date(slotIso)
  const diasPT: Record<number, string> = {
    0: 'domingo', 1: 'segunda-feira', 2: 'terça-feira', 3: 'quarta-feira',
    4: 'quinta-feira', 5: 'sexta-feira', 6: 'sábado'
  }
  const diaNome = diasPT[dt.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: CAL_TIMEZONE }).toLowerCase().split('-')[0] as unknown as number]
    ?? dt.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: CAL_TIMEZONE })
  const hora = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: CAL_TIMEZONE })
  const dataFmt = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: CAL_TIMEZONE })

  let msg = `✅ *Reunião confirmada!*\n📅 ${dataFmt} (${diaNome}) às ${hora}h\n⏱ 60 minutos com o Lira`
  if (meetingUrl && meetingUrl !== 'confirmado') {
    msg += `\n🔗 Link: ${meetingUrl}`
  }
  msg += `\n\nVocê vai receber um e-mail de confirmação com os detalhes. Qualquer dúvida, é só chamar aqui! 😊`
  return msg
}

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

// ─── ElevenLabs TTS ──────────────────────────────────────────────────────────

async function textToSpeech(text: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          output_format: 'mp3_44100_32',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      }
    )

    if (!res.ok) {
      console.error('[ElevenLabs] Erro:', await res.text())
      return null
    }

    const buffer = await res.arrayBuffer()
    const bytes  = new Uint8Array(buffer)
    let binary   = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
  } catch (err) {
    console.error('[ElevenLabs] Erro TTS:', err)
    return null
  }
}

async function sendVoice(phone: string, audioBase64: string) {
  // Tenta PTT (mensagem de voz) primeiro, fallback para audio normal
  const res = await fetch(`${UAZAPI_URL}/send/ptt`, {
    method: 'POST',
    headers: { 'token': UAZAPI_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: phone, audio: audioBase64 })
  })
  if (!res.ok) {
    console.error('[UazAPI] PTT falhou, tentando /send/audio:', await res.text())
    await fetch(`${UAZAPI_URL}/send/audio`, {
      method: 'POST',
      headers: { 'token': UAZAPI_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: phone, audio: audioBase64, mimetype: 'audio/mpeg' })
    })
  }
}

async function sendMessagesWithVoice(phone: string, messages: string[], replyAsAudio: boolean) {
  for (const msg of messages) {
    if (replyAsAudio) {
      const audio = await textToSpeech(msg)
      if (audio) {
        await sendVoice(phone, audio)
        // Simula tempo de digitação entre mensagens de voz
        const delay = Math.min(1000 + msg.length * 20, 3000)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
    }
    await sendTextDelayed(phone, msg)
  }
}

function parseWebhook(body: unknown) {
  try {
    console.log('[RAW]', JSON.stringify(body).slice(0, 3000))

    const events = Array.isArray(body) ? body : [body]

    for (const event of events) {
      if (!event || typeof event !== 'object') continue
      const e = event as Record<string, unknown>

      // ── Formato UazAPI nativo (BaseUrl + EventType + message) ──
      if (e.EventType === 'messages' && e.message) {
        const msg = e.message as Record<string, unknown>
        if (msg.fromMe === true) continue
        if (msg.wasSentByApi === true) continue
        if (msg.isGroup === true) continue

        const chatid = String(msg.chatid || msg.chatId || msg.from || '')
        const phone  = chatid.replace(/@s\.whatsapp\.net$/, '').replace(/@c\.us$/, '')
        if (!phone) continue

        const msgType  = String(msg.type || msg.messageType || '')
        const mediaType = String(msg.mediaType || '')
        const content  = (msg.content && typeof msg.content === 'object') ? msg.content as Record<string, unknown> : null
        const isAudio  = msgType === 'audio' || msgType === 'ptt' || msgType === 'AudioMessage'
                      || mediaType === 'ptt' || mediaType === 'audio'
                      || (content?.PTT === true)

        // URL do áudio: UazAPI coloca em msg.content.URL para mensagens de mídia
        const audioUrl = (msg.mediaUrl as string)
                      || (content?.URL as string)
                      || (content?.url as string)
                      || null

        // Texto: ignora o campo content quando for objeto (é mídia)
        const text = (msg.text as string) || (typeof msg.content === 'string' ? msg.content : null) || (msg.body as string) || null

        const pushName = String(msg.senderName || msg.pushName || (e.chat as Record<string, unknown>)?.name || '')

        if (!text && !isAudio) continue
        return { phone, text, isAudio, audioBase64: null, audioUrl, pushName }
      }

      // ── Formato Evolution/WhatsApp Web (key + message) ──
      const data = e.data || e
      const d    = data as Record<string, unknown>
      const raw  = (Array.isArray(d.messages) ? d.messages[0] : d.message || (d.key ? d : null)) as Record<string, unknown> | null
      if (!raw) continue

      const key    = raw.key as Record<string, unknown> | undefined
      const fromMe = key?.fromMe === true
      if (fromMe) continue

      const jid   = String(key?.remoteJid || raw.remoteJid || '')
      const phone = jid.replace(/@s\.whatsapp\.net$/, '').replace(/@c\.us$/, '')
      if (!phone || jid.includes('@g')) continue

      const msgContent = (raw.message || raw) as Record<string, unknown>
      const text =
        (msgContent.conversation as string) ||
        ((msgContent.extendedTextMessage as Record<string, unknown>)?.text as string) ||
        null

      const isAudio  = !!(msgContent.audioMessage || msgContent.pttMessage)
      const audioSrc = ((msgContent.audioMessage || msgContent.pttMessage || {}) as Record<string, unknown>)
      const pushName = String(raw.pushName || '')

      if (!text && !isAudio) continue
      return {
        phone,
        text,
        isAudio,
        audioBase64: (audioSrc.base64 as string) || null,
        audioUrl:    (audioSrc.url    as string) || null,
        pushName
      }
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
  { stage, messages, lead_data, last_message_at }: {
    stage?: string; messages?: unknown[]; lead_data?: unknown; last_message_at?: string
  }
) {
  const now = new Date().toISOString()
  const update: Record<string, unknown> = { updated_at: now, last_message_at: last_message_at || now }
  if (stage !== undefined)     update.stage     = stage
  if (messages !== undefined)  update.messages  = messages
  if (lead_data !== undefined) update.lead_data = lead_data

  const { error } = await supabase
    .from('chatbot_conversations')
    .update(update)
    .eq('phone', phone)

  if (error) throw error
}

function spinToPipeline(stage: string, interesse: string): string {
  if (stage === 'encerrado') return interesse === 'baixo' ? 'perdido' : 'proposta'
  if (['proposta', 'fechamento'].includes(stage)) return 'proposta'
  if (['implicacao', 'necessidade'].includes(stage)) return 'qualificado'
  return 'novo'
}

function interesseToTemp(interesse: string): string {
  if (interesse === 'alto')  return 'quente'
  if (interesse === 'medio') return 'morno'
  if (interesse === 'baixo') return 'frio'
  return 'frio'
}

function detectPauseIntent(text: string): boolean {
  const lower = text.toLowerCase()
  const triggers = [
    'não é o momento', 'nao e o momento', 'não tenho tempo', 'nao tenho tempo',
    'depois', 'outro momento', 'semana que vem', 'mês que vem', 'mes que vem',
    'agora não', 'agora nao', 'não quero', 'nao quero', 'não preciso', 'nao preciso',
    'tô bem', 'to bem', 'tô ocupado', 'to ocupado', 'não tenho interesse',
    'nao tenho interesse', 'não tenho verba', 'nao tenho verba',
    'volto depois', 'te chamo', 'deixa pra depois',
  ]
  return triggers.some(t => lower.includes(t))
}

async function syncLeadCRM(
  phone: string,
  stage: string,
  lead_data: Record<string, unknown>,
  opts: { pausar?: boolean; pausado_ate?: string } = {}
) {
  if (stage === 'inicio') return
  const pipelineStatus = opts.pausar ? 'em_pausa' : spinToPipeline(stage, String(lead_data.interesse || ''))
  const temperatura    = interesseToTemp(String(lead_data.interesse || ''))

  try {
    const payload: Record<string, unknown> = {
      nome:     lead_data.nome    || 'Lead WhatsApp',
      empresa:  lead_data.empresa || '',
      whatsapp: phone,
      email:    lead_data.email   || '',
      servico:  'Marketing IA + Tráfego Pago',
      status:   pipelineStatus,
      temperatura,
      atualizado_em: new Date().toISOString(),
      observacoes: [
        lead_data.segmento    ? `Segmento: ${lead_data.segmento}`        : '',
        lead_data.faturamento ? `Faturamento: ${lead_data.faturamento}`  : '',
        lead_data.investe_ads ? `Ads atual: ${lead_data.investe_ads}`    : '',
        Array.isArray(lead_data.dores) && lead_data.dores.length
          ? `Dores: ${(lead_data.dores as string[]).join(', ')}`         : '',
        `Interesse: ${lead_data.interesse || 'indefinido'}`,
        `Etapa SPIN: ${stage}`
      ].filter(Boolean).join(' | ')
    }
    if (opts.pausar && opts.pausado_ate) payload.pausado_ate = opts.pausado_ate

    const { error } = await supabase.from('clientes').upsert(payload, { onConflict: 'whatsapp' })
    if (error) throw error
    console.log(`[CRM] ${phone} → ${pipelineStatus} | temp: ${temperatura} (SPIN: ${stage})`)
  } catch (err) {
    console.error('[CRM] Erro ao sincronizar lead:', err)
  }
}

// ─── Conhecimentos ────────────────────────────────────────────────────────────

async function loadKnowledge(): Promise<string> {
  const { data } = await supabase
    .from('conhecimentos')
    .select('titulo, conteudo')
    .eq('ativo', true)
    .order('criado_em', { ascending: true })

  if (!data?.length) return ''
  return '\n\n## CONHECIMENTOS ADICIONAIS (use quando relevante)\n' +
    data.map(k => `### ${k.titulo}\n${k.conteudo}`).join('\n\n')
}

// ─── Agente IA (OpenRouter) ───────────────────────────────────────────────────

async function processMessage(
  conversation: Record<string, unknown>,
  userMessage: string
) {
  const messages  = (conversation.messages  as unknown[]) || []
  const stage     = (conversation.stage     as string)   || 'inicio'
  const lead_data = (conversation.lead_data as Record<string, unknown>) || {}

  // Busca slots disponíveis quando lead está no fechamento
  let slotsContext = ''
  if (stage === 'fechamento' || stage === 'proposta') {
    const slots = await getAvailableSlots()
    const formatted = formatSlotsForContext(slots)
    slotsContext = `\n\nHORÁRIOS DISPONÍVEIS NA AGENDA DO LIRA (use esses para oferecer ao lead):\n${formatted}\n` +
      `\nIMPORTANTE: Quando o lead confirmar um horário, retorne action "book" com o campo slot_iso preenchido com o datetime ISO completo do slot escolhido (ex: "2026-05-12T10:00:00-03:00"). Peça também o e-mail se ainda não tiver.`
  }

  const knowledge = await loadKnowledge()
  const systemWithKnowledge = SYSTEM_PROMPT + knowledge

  const history = (messages.slice(-12) as Array<{ role: string; content: string }>).map(m => ({
    role: m.role,
    content: m.content
  }))

  const origemNote = lead_data.origem === 'formulario_site'
    ? 'FORMULÁRIO DO SITE — lead já demonstrou intenção de agendar. Vá direto para o fechamento.'
    : 'WhatsApp orgânico — siga o SPIN normalmente.'

  history.push({
    role: 'user',
    content: `[CONTEXTO INTERNO — NÃO REVELAR AO LEAD]
Estágio atual: ${stage}
Dados coletados: ${JSON.stringify(lead_data)}
Origem: ${origemNote}${slotsContext}
[FIM DO CONTEXTO]

Mensagem do lead: ${userMessage}

Retorne apenas JSON válido com os campos: messages (array), stage, action ("none" ou "book"), slot_iso (preenchido só quando action="book"), lead_data.`
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
      model: 'anthropic/claude-sonnet-4.5',
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemWithKnowledge },
        ...history
      ]
    })
  })

  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const rawText = json.choices?.[0]?.message?.content || ''

  let parsed: {
    messages: string[]
    stage: string
    action: string
    slot_iso: string
    lead_data: Record<string, unknown>
  }
  try {
    const clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    const obj   = JSON.parse(match![0])
    const msgs  = obj.messages || (obj.message ? [obj.message] : null)
    parsed = {
      messages:  Array.isArray(msgs) ? msgs : ['Desculpe, pode repetir?'],
      stage:     obj.stage    || stage,
      action:    obj.action   || 'none',
      slot_iso:  obj.slot_iso || '',
      lead_data: obj.lead_data || lead_data
    }
  } catch {
    console.error('[Agent] Falha no parse JSON:', rawText)
    parsed = { messages: ['Desculpe, pode repetir?'], stage, action: 'none', slot_iso: '', lead_data }
  }

  const fullText = parsed.messages.join('\n')

  const updatedMessages = [
    ...messages,
    { role: 'user', content: userMessage },
    { role: 'assistant', content: fullText }
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
    messages:  parsed.messages,
    stage:     parsed.stage || stage,
    action:    parsed.action,
    slot_iso:  parsed.slot_iso,
    history:   updatedMessages,
    lead_data: mergedLeadData
  }
}

// ─── Assistente Pessoal ───────────────────────────────────────────────────────

const PERSONAL_SYSTEM_PROMPT = `Você é a Sofia, assistente pessoal do Edmilson Lira, dono da Edlira — agência de marketing digital com IA e tráfego pago.

Você tem acesso em tempo real ao CRM e à agenda do Lira. Sempre que ele perguntar sobre leads, pipeline ou reuniões, use os dados do CONTEXTO fornecido.

## SUAS CAPACIDADES
- Consultar e resumir dados do CRM (leads, pipeline, clientes)
- Consultar agenda e próximas reuniões
- Responder perguntas gerais com inteligência
- Ajudar com textos, e-mails, mensagens, estratégias
- Fazer cálculos, análises e sugestões de negócio
- Lembrar de tarefas e compromissos mencionados na conversa

## ESTILO
- Direto e objetivo — o Lira é ocupado
- Pode usar emojis com moderação
- Tuteie sempre
- Se não souber algo, diga claramente em vez de inventar
- Responda em texto corrido, sem bullet points desnecessários

Responda em texto livre — sem JSON, sem formatação especial. Apenas a resposta natural.`

async function getCRMContext(): Promise<string> {
  try {
    const { data: leads } = await supabase
      .from('clientes')
      .select('nome, empresa, status, whatsapp, observacoes, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (!leads?.length) return 'CRM: nenhum lead cadastrado ainda.'

    const byStatus: Record<string, number> = {}
    for (const l of leads) {
      byStatus[l.status] = (byStatus[l.status] || 0) + 1
    }
    const resumo = Object.entries(byStatus)
      .map(([s, n]) => `${s}: ${n}`).join(' | ')

    const recentes = leads.slice(0, 5).map(l =>
      `• ${l.nome || 'Sem nome'}${l.empresa ? ` (${l.empresa})` : ''} — ${l.status} — ${l.whatsapp}`
    ).join('\n')

    return `CRM — Total: ${leads.length} leads | ${resumo}\nÚltimos: \n${recentes}`
  } catch {
    return 'CRM: erro ao buscar dados.'
  }
}

async function getAgendaContext(): Promise<string> {
  try {
    const now = new Date()
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const url = `https://api.cal.com/v2/bookings?limit=10`
    const res  = await fetch(url, { headers: CAL_HEADERS })
    const json = await res.json() as {
      status: string
      data?: Array<{
        start: string
        title?: string
        attendees?: Array<{ name: string; email: string }>
        status?: string
        meetingUrl?: string
      }>
    }

    if (json.status !== 'success' || !json.data?.length) return 'Agenda: nenhuma reunião encontrada.'

    const upcoming = json.data.filter(b => {
      const start = new Date(b.start)
      return start >= now && start <= end && b.status !== 'cancelled'
    })

    if (!upcoming.length) return 'Agenda: nenhuma reunião nos próximos 7 dias.'

    const lines = upcoming.map(b => {
      const dt = new Date(b.start)
      const dataHora = dt.toLocaleString('pt-BR', {
        weekday: 'short', day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit', timeZone: CAL_TIMEZONE
      })
      const guest = b.attendees?.[0]?.name || 'Sem nome'
      return `• ${dataHora} — ${guest}`
    }).join('\n')

    return `Agenda — ${upcoming.length} reunião(ões) nos próximos 7 dias:\n${lines}`
  } catch {
    return 'Agenda: erro ao buscar reuniões.'
  }
}

async function handlePersonalAssistant(phone: string, userMessage: string) {
  // Histórico da conversa pessoal (usa phone como chave)
  const { data: conv } = await supabase
    .from('chatbot_conversations')
    .select('messages')
    .eq('phone', phone)
    .single()

  const history = ((conv?.messages || []) as Array<{ role: string; content: string }>)
    .slice(-20)  // últimas 20 mensagens para contexto

  // Contexto em tempo real
  const [crmCtx, agendaCtx] = await Promise.all([getCRMContext(), getAgendaContext()])

  const contextBlock = `[CONTEXTO EM TEMPO REAL — ${new Date().toLocaleString('pt-BR', { timeZone: CAL_TIMEZONE })}]\n${crmCtx}\n\n${agendaCtx}\n[FIM DO CONTEXTO]`

  const messages = [
    { role: 'system', content: PERSONAL_SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: `${contextBlock}\n\nLira: ${userMessage}` }
  ]

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://edlira.com.br',
      'X-Title': 'Edlira PA'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4.5',
      max_tokens: 1024,
      temperature: 0.5,
      messages
    })
  })

  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const reply = json.choices?.[0]?.message?.content?.trim() || 'Não consegui processar. Tenta de novo.'

  // Salva histórico
  const updatedMessages = [
    ...((conv?.messages || []) as unknown[]),
    { role: 'user', content: userMessage },
    { role: 'assistant', content: reply }
  ]

  await supabase.from('chatbot_conversations').upsert({
    phone,
    stage: 'personal',
    messages: updatedMessages.slice(-40),  // mantém só as últimas 40
    lead_data: { modo: 'assistente_pessoal' }
  }, { onConflict: 'phone' })

  return reply
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

  const body = await req.json().catch(() => ({}))

  // DEBUG temporário — salva payload bruto no banco
  try {
    await supabase.from('chatbot_conversations').upsert({
      phone: '__debug__',
      stage: 'debug',
      messages: [{ raw: body }],
      lead_data: {}
    }, { onConflict: 'phone' })
  } catch (_) { /* ignora */ }

  try {
    const parsed = parseWebhook(body)
    if (!parsed) return new Response('OK', { status: 200 })

    const { phone, text, isAudio, audioBase64, audioUrl, pushName } = parsed
    console.log(`[MSG] ${phone} (${pushName}): ${isAudio ? '[ÁUDIO]' : text}`)

    let messageText = text

    if (isAudio) {
      const transcript = await transcribeAudio({ base64: audioBase64, url: audioUrl })
      if (!transcript) {
        await sendTextDelayed(phone, 'Não consegui entender o áudio. Pode digitar sua mensagem? 😊')
        return new Response('OK', { status: 200 })
      }
      messageText = `[Áudio transcrito]: ${transcript}`
      console.log(`[Groq] Transcrito: ${transcript}`)
    }

    // ── Modo assistente pessoal ───────────────────────────────────────────────
    if (phone === LIRA_PERSONAL || phone === LIRA_PERSONAL.replace('55', '')) {
      const reply = await handlePersonalAssistant(phone, messageText!)
      await sendText(phone, reply)
      return new Response('OK', { status: 200 })
    }

    const conversation = await getOrCreateConversation(phone)

    if (conversation.messages.length === 0) {
      for (const msg of WELCOME_MSGS) await sendTextDelayed(phone, msg)
      const welcomeText = WELCOME_MSGS.join('\n')
      await updateConversation(phone, {
        stage: 'situacao',
        messages: [{ role: 'assistant', content: welcomeText }],
        lead_data: { nome: pushName || '' }
      })
      return new Response('OK', { status: 200 })
    }

    if (conversation.stage === 'encerrado' || conversation.stage === 'em_pausa') {
      // Se está em pausa, checa se a data de retomada já passou
      if (conversation.stage === 'em_pausa') {
        const pauseUntil = (conversation.lead_data as Record<string, unknown>)?.pausado_ate as string
        if (pauseUntil && new Date(pauseUntil) > new Date()) {
          console.log(`[BOT] ${phone} em pausa até ${pauseUntil} — ignorando`)
          return new Response('OK', { status: 200 })
        }
        // Pausa venceu — reativa
        await updateConversation(phone, { stage: 'situacao' })
        await supabase.from('clientes').update({ status: 'qualificado', pausado_ate: null, temperatura: 'frio', atualizado_em: new Date().toISOString() })
          .eq('whatsapp', phone)
      } else {
        return new Response('OK', { status: 200 })
      }
    }

    // ── Detecta intenção de pausa ("não é o momento") ────────────────────────
    if (detectPauseIntent(messageText!)) {
      const pausado_ate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const nome = String((conversation.lead_data as Record<string, unknown>)?.nome || '').split(' ')[0] || ''
      const pauseMsg = `Entendido${nome ? `, ${nome}` : ''}! Sem pressão 😊 Cada negócio tem seu momento certo. Quando fizer sentido retomar, é só me chamar aqui — estarei por aqui. Abraço! 👋`

      await sendTextDelayed(phone, pauseMsg)
      await updateConversation(phone, {
        stage: 'em_pausa',
        messages: [
          ...(conversation.messages as unknown[]),
          { role: 'user', content: messageText },
          { role: 'assistant', content: pauseMsg },
        ],
        lead_data: { ...(conversation.lead_data as Record<string, unknown>), pausado_ate }
      })
      await syncLeadCRM(phone, 'em_pausa', conversation.lead_data as Record<string, unknown>, {
        pausar: true,
        pausado_ate
      })
      return new Response('OK', { status: 200 })
    }

    const result = await processMessage(conversation, messageText!)
    console.log(`[Agent] ${phone} → estágio: ${result.stage} | action: ${result.action} | interesse: ${result.lead_data.interesse}`)

    // ── Ação de booking ──────────────────────────────────────────────────────
    if (result.action === 'book' && result.slot_iso) {
      await sendMessagesWithVoice(phone, result.messages, isAudio)

      const leadWithPhone = { ...result.lead_data, whatsapp: phone }
      const meetingUrl = await createCalBooking(result.slot_iso, leadWithPhone)

      if (meetingUrl) {
        const confirmation = formatBookingConfirmation(result.slot_iso, meetingUrl)
        await sendTextDelayed(phone, confirmation)

        await updateConversation(phone, {
          stage: 'encerrado',
          messages: [
            ...result.history,
            { role: 'assistant', content: confirmation }
          ],
          lead_data: { ...result.lead_data, reuniao_agendada: result.slot_iso, cal_meeting: meetingUrl }
        })

        await supabase.from('clientes').upsert({
          nome:         result.lead_data.nome    || 'Lead WhatsApp',
          empresa:      result.lead_data.empresa || '',
          whatsapp:     phone,
          email:        result.lead_data.email   || '',
          servico:      'Marketing IA + Tráfego Pago',
          status:       'proposta',
          temperatura:  'quente',
          atualizado_em: new Date().toISOString(),
          observacoes: `Reunião: ${result.slot_iso} | Cal: ${meetingUrl}`
        }, { onConflict: 'whatsapp' })

        console.log(`[Cal] ✅ Booking criado para ${phone}: ${result.slot_iso}`)

        const nome    = result.lead_data.nome    || 'Lead'
        const empresa = result.lead_data.empresa ? ` (${result.lead_data.empresa})` : ''
        const dt      = new Date(result.slot_iso)
        const dataHora = dt.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: CAL_TIMEZONE })
        await sendText(LIRA_PHONE,
          `🔔 *Nova reunião agendada!*\n👤 ${nome}${empresa}\n📱 ${phone}\n📅 ${dataHora}\n🔗 ${meetingUrl || 'ver Cal.com'}`
        )
      } else {
        await sendMessagesWithVoice(phone, ['Tive um problema ao confirmar automaticamente — mas já passei seu contato pro Lira e ele vai confirmar o horário com você em instantes! 🙏'], isAudio)
        await updateConversation(phone, {
          stage: result.stage,
          messages: result.history,
          lead_data: result.lead_data
        })
        await syncLeadCRM(phone, result.stage, result.lead_data)
      }

      return new Response('OK', { status: 200 })
    }

    // ── Fluxo normal ─────────────────────────────────────────────────────────
    await sendMessagesWithVoice(phone, result.messages, isAudio)
    await updateConversation(phone, {
      stage: result.stage,
      messages: result.history,
      lead_data: result.lead_data
    })
    await syncLeadCRM(phone, result.stage, result.lead_data)

  } catch (err) {
    console.error('[ERRO]', err)
  }

  return new Response('OK', { status: 200 })
})
