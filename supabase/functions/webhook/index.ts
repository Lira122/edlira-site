import { createClient } from 'npm:@supabase/supabase-js@2'
import { logIAUsage } from '../_shared/usage-log.ts'
import { sendTextHumano } from '../_shared/humano.ts'
import { SYSTEM_PROMPT } from '../_shared/persona-lira.ts'

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

const ELEVENLABS_VOICE_ID = 'ErXwobaYiN019PkySvjV' // Antoni — voz masculina, warm e natural em pt-BR (premade, OK no plano Free)

const CAL_EVENT_TYPE_ID  = 3266163          // Reunião de 60 min
const CAL_TIMEZONE       = 'America/Sao_Paulo'
const LIRA_PHONE         = '5512981668507'   // Notificação de booking
const LIRA_PERSONAL      = '5512981668507'   // Modo assistente pessoal
// Flag pra testar o bot no próprio número do Lira (vira lead normal). Setar LIRA_PERSONAL_OFF=1 nos secrets.
const LIRA_PERSONAL_OFF  = ['1', 'true', 'on'].includes((Deno.env.get('LIRA_PERSONAL_OFF') ?? '').toLowerCase())

const WELCOME_MSGS = [
  `Oi! Aqui é o Lira, da Eleva Digital (elevabrands.com.br). Que bom que você chamou. Com quem eu falo?`
]


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

  let msg = `Reunião confirmada: ${dataFmt} (${diaNome}) às ${hora}h, 60 minutos comigo.`
  if (meetingUrl && meetingUrl !== 'confirmado') {
    msg += `\nLink: ${meetingUrl}`
  }
  msg += `\nVocê vai receber um e-mail com os detalhes. Qualquer dúvida, é só chamar.`
  return msg
}

// ─── UazAPI ──────────────────────────────────────────────────────────────────

async function sendText(phone: string, text: string, delayMs = 0) {
  // UazAPI dessa build interpreta o body como Latin-1 quando o charset não é
  // declarado, o que corrompia acentos (é → Ã©, ã → Ã£). Forçar UTF-8 resolve.
  const res = await fetch(`${UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: { 'token': UAZAPI_TOKEN, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ number: phone, text, delay: delayMs })
  })
  if (!res.ok) console.error('[UazAPI] Erro ao enviar:', await res.text())
}

// Envio "humano": delay nativo UazAPI 2-10s proporcional ao tamanho do
// texto, mostra "digitando..." pro lead. Espera no JS também pra a próxima
// mensagem não chegar antes dessa terminar.
// (helper compartilhado em _shared/humano.ts)
async function sendTextDelayed(phone: string, text: string) {
  const r = await sendTextHumano(phone, text)
  if (!r.ok) console.error('[UazAPI] sendTextHumano falhou:', r.status, r.body)
  // Buffer entre mensagens sequenciais
  await new Promise(rr => setTimeout(rr, 600))
}

// ─── ElevenLabs TTS ──────────────────────────────────────────────────────────

async function textToSpeech(text: string): Promise<string | null> {
  try {
    // Timeout 8s pra ElevenLabs — se passar disso, desiste e vai pro fallback texto
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_32',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      }
    )
    clearTimeout(timer)

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

// Voz por enquanto DESLIGADA — TTS dependia de ElevenLabs que falhou no caso ValePet
// e o fallback de texto não chegou. Mais confiável responder sempre por texto.
// Pra reabilitar: troca VOICE_REPLY_ENABLED pra true e testa.
const VOICE_REPLY_ENABLED = false

async function sendMessagesWithVoice(phone: string, messages: string[], replyAsAudio: boolean) {
  const useVoice = VOICE_REPLY_ENABLED && replyAsAudio
  for (const msg of messages) {
    if (useVoice) {
      const audio = await textToSpeech(msg)
      if (audio) {
        await sendVoice(phone, audio)
        const delay = Math.min(1000 + msg.length * 20, 3000)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      // ElevenLabs falhou — sempre cai pra texto, sem travar
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
                      || (msgType === 'media' && content?.PTT === true)

        // ID da mensagem para download via UazAPI (áudio encriptado precisa ser baixado pelo servidor)
        const messageId = String(msg.id || '')

        // Texto: ignora o campo content quando for objeto (é mídia)
        const text = (msg.text as string) || (typeof msg.content === 'string' ? msg.content : null) || (msg.body as string) || null

        const pushName = String(msg.senderName || msg.pushName || (e.chat as Record<string, unknown>)?.name || '')

        if (!text && !isAudio) continue
        return { phone, text, isAudio, audioBase64: null, audioUrl: null, audioMessageId: messageId, pushName, msgKey: messageId }
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
        audioBase64:    (audioSrc.base64 as string) || null,
        audioUrl:       (audioSrc.url    as string) || null,
        audioMessageId: null,
        pushName
      }
    }

    return null
  } catch (err) {
    console.error('[UazAPI] Erro ao parsear webhook:', err)
    return null
  }
}

// ─── Download de mídia via UazAPI ────────────────────────────────────────────

async function downloadAudioFromUazAPI(messageId: string): Promise<Uint8Array | null> {
  try {
    // UazAPI: POST /message/download { id } → { fileURL, mimetype }
    // O fileURL é uma URL pública pro mp3 já descriptografado.
    const res = await fetch(`${UAZAPI_URL}/message/download`, {
      method: 'POST',
      headers: { 'token': UAZAPI_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: messageId })
    })

    if (!res.ok) {
      console.error('[UazAPI] /message/download falhou:', res.status, await res.text())
      return null
    }

    const json = await res.json() as { fileURL?: string; url?: string }
    const fileURL = json.fileURL || json.url
    if (!fileURL) {
      console.error('[UazAPI] sem fileURL no retorno:', JSON.stringify(json).slice(0, 200))
      return null
    }

    const fileRes = await fetch(fileURL)
    if (!fileRes.ok) {
      console.error('[UazAPI] fileURL fetch falhou:', fileRes.status)
      return null
    }
    return new Uint8Array(await fileRes.arrayBuffer())
  } catch (err) {
    console.error('[UazAPI] Erro no download:', err)
    return null
  }
}

// ─── Groq Whisper ─────────────────────────────────────────────────────────────

async function transcribeAudio({ base64, url, bytes }: { base64?: string; url?: string; bytes?: Uint8Array }) {
  try {
    let audioBytes: Uint8Array

    if (bytes) {
      audioBytes = bytes
    } else if (base64) {
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

// Retorna false se o robô foi desativado no painel.
// Considera: tem pelo menos UM agente ativo? Se sim, bot ligado.
// Se TODOS os agentes estão inativos, bot desligado.
// Sem agentes cadastrados, mantém ligado (default).
// Em caso de erro de leitura, mantém ligado para não derrubar o bot por engano.
async function isBotActive(): Promise<boolean> {
  const { data, error } = await supabase.from('agentes').select('status')
  if (error) {
    console.error('[BOT] isBotActive erro de leitura:', error.message)
    return true
  }
  if (!data || !data.length) return true
  return data.some(a => a.status === 'ativo')
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

// Pedido EXPLÍCITO de não receber mais contato (opt-out / LGPD).
// Diferente da pausa: encerra de vez, não volta em 7 dias.
function detectOptOut(text: string): boolean {
  const t = text.toLowerCase()
  return /(par[ae] de (me )?(mandar|enviar)|n[ãa]o me (mande|envie|manda) mais|me (tira|tire|remova|remove)\b.*\b(lista|daqui|disso)|descadastr|sair da lista|n[ãa]o quero receber|n[ãa]o autorizo|isso [ée] spam|vou denunciar|me deixa em paz|n[ãa]o me perturbe)/.test(t)
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
    slotsContext = `\n\nHORÁRIOS DISPONÍVEIS NA SUA AGENDA (use esses para oferecer ao lead):\n${formatted}\n` +
      `\nIMPORTANTE: Quando o lead confirmar um horário, retorne action "book" com o campo slot_iso preenchido com o datetime ISO completo do slot escolhido (ex: "2026-05-12T10:00:00-03:00"). Peça também o e-mail se ainda não tiver.`
  }

  const knowledge = await loadKnowledge()
  const systemWithKnowledge = SYSTEM_PROMPT + knowledge

  const history = (messages.slice(-12) as Array<{ role: string; content: string }>).map(m => ({
    role: m.role,
    content: m.content
  }))

  const origemNote = lead_data.origem === 'formulario_site'
    ? 'FORMULÁRIO DO SITE: lead já demonstrou intenção de agendar. Vá direto para o fechamento.'
    : 'WhatsApp orgânico: siga o SPIN normalmente.'

  history.push({
    role: 'user',
    content: `[CONTEXTO INTERNO: NÃO REVELAR AO LEAD]
Estágio atual: ${stage}
Dados coletados: ${JSON.stringify(lead_data)}
Origem: ${origemNote}${slotsContext}
[FIM DO CONTEXTO]

Mensagem do lead: ${userMessage}

Retorne apenas JSON válido com os campos: messages (array), stage, action ("none" ou "book"), slot_iso (preenchido só quando action="book"), lead_data.`
  })

  const modelo = 'anthropic/claude-sonnet-4.5'
  const t0 = Date.now()
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://elevabrands.com.br',
      'X-Title': 'Eleva Digital Chatbot'
    },
    body: JSON.stringify({
      model: modelo,
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemWithKnowledge },
        ...history
      ]
    })
  })

  const json = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>
    usage?: { prompt_tokens?: number; completion_tokens?: number }
    id?: string
  }
  const rawText = json.choices?.[0]?.message?.content || ''

  // Log de uso (fire-and-forget)
  logIAUsage({
    provider: 'openrouter',
    modelo,
    origem: 'webhook-sofia',
    input_tokens: json.usage?.prompt_tokens ?? 0,
    output_tokens: json.usage?.completion_tokens ?? 0,
    latencia_ms: Date.now() - t0,
    sucesso: res.ok && !!rawText,
    request_id: json.id,
  })

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

const PERSONAL_SYSTEM_PROMPT = `Você é a Sofia, assistente pessoal do Edmilson Lira, dono da Eleva Digital, agência de marketing digital com IA e tráfego pago.

Você tem acesso em tempo real ao CRM e à agenda do Lira. Sempre que ele perguntar sobre leads, pipeline ou reuniões, use os dados do CONTEXTO fornecido.

## SUAS CAPACIDADES
- Consultar e resumir dados do CRM (leads, pipeline, clientes)
- Consultar agenda e próximas reuniões
- Responder perguntas gerais com inteligência
- Ajudar com textos, e-mails, mensagens, estratégias
- Fazer cálculos, análises e sugestões de negócio
- Lembrar de tarefas e compromissos mencionados na conversa

## ESTILO
- Direto e objetivo, o Lira é ocupado
- Pode usar emojis com moderação
- Tuteie sempre
- Se não souber algo, diga claramente em vez de inventar
- Responda em texto corrido, sem bullet points desnecessários

Responda em texto livre, sem JSON, sem formatação especial. Apenas a resposta natural. Nunca use travessões (—).`

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
      `• ${l.nome || 'Sem nome'}${l.empresa ? ` (${l.empresa})` : ''} · ${l.status} · ${l.whatsapp}`
    ).join('\n')

    return `CRM. Total: ${leads.length} leads | ${resumo}\nÚltimos: \n${recentes}`
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
      return `• ${dataHora} · ${guest}`
    }).join('\n')

    return `Agenda. ${upcoming.length} reunião(ões) nos próximos 7 dias:\n${lines}`
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

  const contextBlock = `[CONTEXTO EM TEMPO REAL · ${new Date().toLocaleString('pt-BR', { timeZone: CAL_TIMEZONE })}]\n${crmCtx}\n\n${agendaCtx}\n[FIM DO CONTEXTO]`

  const messages = [
    { role: 'system', content: PERSONAL_SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: `${contextBlock}\n\nLira: ${userMessage}` }
  ]

  const modeloPA = 'anthropic/claude-sonnet-4.5'
  const tPA = Date.now()
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://elevabrands.com.br',
      'X-Title': 'Eleva Digital PA'
    },
    body: JSON.stringify({
      model: modeloPA,
      max_tokens: 1024,
      temperature: 0.5,
      messages
    })
  })

  const json = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>
    usage?: { prompt_tokens?: number; completion_tokens?: number }
    id?: string
  }
  const reply = json.choices?.[0]?.message?.content?.trim() || 'Não consegui processar. Tenta de novo.'

  logIAUsage({
    provider: 'openrouter',
    modelo: modeloPA,
    origem: 'webhook-pa-lira',
    input_tokens: json.usage?.prompt_tokens ?? 0,
    output_tokens: json.usage?.completion_tokens ?? 0,
    latencia_ms: Date.now() - tPA,
    sucesso: res.ok && !!json.choices?.[0]?.message?.content,
    request_id: json.id,
  })

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

    const { phone, text, isAudio, audioBase64, audioUrl, audioMessageId, pushName, msgKey } = parsed
    console.log(`[MSG] ${phone} (${pushName}): ${isAudio ? '[ÁUDIO]' : text}`)

    // ── BUFFER DE MENSAGENS + DELAY 30s ─────────────────────────────────────
    // Modo assistente pessoal processa direto (Lira não espera nada).
    // Pra leads comuns:
    //  1. Se áudio: transcreve JÁ (mas em background).
    //  2. Anexa texto ao buffer em lead_data._buffer.
    //  3. Marca timestamp desta chegada.
    //  4. Retorna 200 OK imediato pro UazAPI (senão ele retenta).
    //  5. Em background: espera 30s.
    //  6. Se chegou msg mais nova nesse meio, aborta (a mais nova vai processar
    //     TUDO — inclusive as antigas que estão no buffer).
    //  7. Se ainda somos a última: pega buffer inteiro, junta as mensagens,
    //     limpa buffer, e manda pra IA responder como se fosse uma msg só.
    //
    // Efeito prático: lead manda "oi" ... 5s depois "quanto custa?" ... 3s
    // depois "consegue começar essa semana?" → Sofia responde as 3 juntas
    // com contexto completo, ~30s depois da última.
    const modoPessoal = !LIRA_PERSONAL_OFF && (phone === LIRA_PERSONAL || phone === LIRA_PERSONAL.replace('55', ''))
    if (!modoPessoal && msgKey) {
      // Dedup rápido: msgKey igual a alguma no buffer = retry do UazAPI
      try {
        const { data: convDup } = await supabase
          .from('chatbot_conversations')
          .select('lead_data').eq('phone', phone).maybeSingle()
        const ldDup = (convDup?.lead_data || {}) as Record<string, unknown>
        const bufDup = Array.isArray(ldDup._buffer) ? ldDup._buffer as Array<Record<string, unknown>> : []
        if (bufDup.some(m => m.msg_key === msgKey)) {
          console.log(`[BUFFER] ${phone} msgKey ${msgKey} já está no buffer — retry ignorado`)
          return new Response('OK', { status: 200 })
        }
      } catch (_) { /* segue mesmo se falhar */ }

      const bgTask = (async () => {
        try {
          // 1. Se áudio, transcreve agora pra virar texto que dá pra bufferar
          let textoParaBuffer = text
          if (isAudio) {
            let transcript: string | null = null
            if (audioBase64) transcript = await transcribeAudio({ base64: audioBase64 })
            if (!transcript && audioMessageId) {
              const bytes = await downloadAudioFromUazAPI(audioMessageId)
              if (bytes) transcript = await transcribeAudio({ bytes })
            }
            if (!transcript && audioUrl) transcript = await transcribeAudio({ url: audioUrl })
            if (!transcript) {
              await sendTextDelayed(phone, 'Não consegui entender o áudio. Pode digitar a mensagem?')
              return
            }
            textoParaBuffer = `[Áudio transcrito]: ${transcript}`
          }

          // 2. Anexa ao buffer
          const meuTs = Date.now()
          const { data: conv1 } = await supabase
            .from('chatbot_conversations')
            .select('lead_data').eq('phone', phone).maybeSingle()
          const ld1 = (conv1?.lead_data || {}) as Record<string, unknown>
          const buffer1 = Array.isArray(ld1._buffer) ? ld1._buffer as Array<Record<string, unknown>> : []
          buffer1.push({ text: textoParaBuffer, is_audio: isAudio, msg_key: msgKey, at: meuTs })
          await supabase.from('chatbot_conversations').upsert({
            phone,
            lead_data: {
              ...ld1,
              _buffer: buffer1,
              _buffer_ts: meuTs,
              _pushName: pushName || ld1._pushName,
            },
          }, { onConflict: 'phone' })

          // 3. Espera 30s
          await new Promise(r => setTimeout(r, 30000))

          // 4. Recarrega e verifica se somos ainda a última chegada
          const { data: conv2 } = await supabase
            .from('chatbot_conversations')
            .select('lead_data').eq('phone', phone).maybeSingle()
          const ld2 = (conv2?.lead_data || {}) as Record<string, unknown>
          if (ld2._buffer_ts !== meuTs) {
            console.log(`[BUFFER] ${phone} chegou msg mais nova depois de ${meuTs} — essa aborta, a próxima vai processar tudo`)
            return
          }

          // 5. Somos a última: pega buffer inteiro, junta texto, limpa buffer
          const bufFinal = Array.isArray(ld2._buffer) ? ld2._buffer as Array<Record<string, unknown>> : []
          const textosJuntos = bufFinal.map(m => String(m.text || '')).join('\n').trim()
          const teveAudio = bufFinal.some(m => m.is_audio === true)

          const ldLimpo = { ...ld2 }
          delete ldLimpo._buffer
          delete ldLimpo._buffer_ts
          await supabase.from('chatbot_conversations').update({
            lead_data: ldLimpo,
          }).eq('phone', phone)

          console.log(`[BUFFER] ${phone} processando ${bufFinal.length} msg(s) juntas`)

          // 6. Chama processamento com texto combinado (isAudio=false porque
          //    já viramos tudo em texto; se veio audio, respeitamos a
          //    preferência do lead respondendo em áudio via flag externa)
          await processarMensagem({
            phone, text: textosJuntos, isAudio: teveAudio,
            audioBase64: null, audioUrl: null, audioMessageId: '',
            pushName, msgKey,
          })
        } catch (e) {
          console.error('[BG] falha no buffer/processamento:', e)
        }
      })()

      const rt = (globalThis as unknown as { EdgeRuntime?: { waitUntil: (p: Promise<unknown>) => void } }).EdgeRuntime
      if (rt?.waitUntil) rt.waitUntil(bgTask)

      return new Response('OK', { status: 200 })
    }

    // Modo assistente pessoal segue processo direto (sem buffer)
    await processarMensagem(parsed)
    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('[Webhook] erro no top-level:', err)
    return new Response('OK', { status: 200 })
  }
})

// ═══════════════════════════════════════════════════════════════════════
//  processarMensagem: fluxo original do webhook, agora extraído pra
//  ser chamável em background depois do delay + dedup.
// ═══════════════════════════════════════════════════════════════════════
type ParsedMsg = {
  phone: string
  text: string | null
  isAudio: boolean
  audioBase64: string | null
  audioUrl: string | null
  audioMessageId: string
  pushName: string
  msgKey: string
}

async function processarMensagem(parsed: ParsedMsg) {
  try {
    const { phone, text, isAudio, audioBase64, audioUrl, audioMessageId, pushName } = parsed

    let messageText = text

    // Se veio isAudio=true mas SEM fontes de áudio (base64/messageId/url),
    // significa que já transcrevemos antes de bufferar. Pula transcrição.
    const jaTranscrito = isAudio && !audioBase64 && !audioMessageId && !audioUrl
    if (isAudio && !jaTranscrito) {
      let transcript: string | null = null

      // 1. Tenta base64 direto
      if (audioBase64) {
        transcript = await transcribeAudio({ base64: audioBase64 })
      }

      // 2. Tenta download via UazAPI (áudio encriptado do WhatsApp)
      if (!transcript && audioMessageId) {
        console.log('[Audio] Baixando via UazAPI messageId:', audioMessageId)
        const bytes = await downloadAudioFromUazAPI(audioMessageId)
        if (bytes) {
          transcript = await transcribeAudio({ bytes })
        }
      }

      // 3. Tenta URL direta como fallback
      if (!transcript && audioUrl) {
        transcript = await transcribeAudio({ url: audioUrl })
      }

      if (!transcript) {
        await sendTextDelayed(phone, 'Não consegui entender o áudio. Pode digitar a mensagem?')
        return
      }
      messageText = `[Áudio transcrito]: ${transcript}`
      console.log(`[Groq] Transcrito: ${transcript}`)
    }

    // ── Modo assistente pessoal ───────────────────────────────────────────────
    // LIRA_PERSONAL_OFF=1 nos secrets desliga e trata o número como lead comum (modo teste).
    if (!LIRA_PERSONAL_OFF && (phone === LIRA_PERSONAL || phone === LIRA_PERSONAL.replace('55', ''))) {
      const reply = await handlePersonalAssistant(phone, messageText!)
      await sendText(phone, reply)
      return
    }

    // ── Robô desativado no painel — não responde leads (modo pessoal acima segue ativo) ──
    if (!(await isBotActive())) {
      console.log(`[BOT] Robô desativado no painel — ignorando ${phone}`)
      return
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
      return
    }

    if (conversation.stage === 'encerrado' || conversation.stage === 'em_pausa') {
      // Se está em pausa, checa se a data de retomada já passou
      if (conversation.stage === 'em_pausa') {
        const pauseUntil = (conversation.lead_data as Record<string, unknown>)?.pausado_ate as string
        if (pauseUntil && new Date(pauseUntil) > new Date()) {
          console.log(`[BOT] ${phone} em pausa até ${pauseUntil} — ignorando`)
          return
        }
        // Pausa venceu — reativa
        await updateConversation(phone, { stage: 'situacao' })
        await supabase.from('clientes').update({ status: 'qualificado', pausado_ate: null, temperatura: 'frio', atualizado_em: new Date().toISOString() })
          .eq('whatsapp', phone)
      } else {
        return
      }
    }

    // ── Opt-out definitivo — respeita o pedido e encerra de vez (LGPD) ───────
    if (detectOptOut(messageText!)) {
      const optoutMsg = `Entendido, não te mando mais mensagens. Sucesso pro seu negócio. Se precisar, é só me chamar.`
      await sendTextDelayed(phone, optoutMsg)
      await updateConversation(phone, {
        stage: 'encerrado',
        messages: [
          ...(conversation.messages as unknown[]),
          { role: 'user', content: messageText },
          { role: 'assistant', content: optoutMsg },
        ],
        lead_data: { ...(conversation.lead_data as Record<string, unknown>), opt_out: true }
      })
      await supabase.from('clientes').update({
        status: 'perdido',
        temperatura: 'gelado',
        observacoes: `[OPT-OUT] Pediu para não receber contato em ${new Date().toLocaleString('pt-BR')}.`,
        atualizado_em: new Date().toISOString(),
      }).eq('whatsapp', phone)
      console.log(`[BOT] Opt-out registrado: ${phone}`)
      return
    }

    // ── Detecta intenção de pausa ("não é o momento") ────────────────────────
    if (detectPauseIntent(messageText!)) {
      const pausado_ate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const nome = String((conversation.lead_data as Record<string, unknown>)?.nome || '').split(' ')[0] || ''
      const pauseMsg = `Entendido${nome ? `, ${nome}` : ''}, sem pressão. Quando fizer sentido retomar, é só me chamar aqui.`

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
      return
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
        await sendMessagesWithVoice(phone, ['Tive um probleminha pra confirmar automático aqui, mas já anotei e te confirmo o horário em instantes.'], isAudio)
        await updateConversation(phone, {
          stage: result.stage,
          messages: result.history,
          lead_data: result.lead_data
        })
        await syncLeadCRM(phone, result.stage, result.lead_data)

        // Cal.com falhou — avisa o Lira pra confirmar manualmente (não perder o lead quente)
        const nomeF     = result.lead_data.nome    || 'Lead'
        const empresaF  = result.lead_data.empresa ? ` (${result.lead_data.empresa})` : ''
        const dataHoraF = new Date(result.slot_iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: CAL_TIMEZONE })
        await sendText(LIRA_PHONE,
          `⚠️ *Lead quer reunião — confirmar na mão!*\n👤 ${nomeF}${empresaF}\n📱 ${phone}\n📅 Pediu: ${dataHoraF}\n\nO Cal.com falhou ao agendar sozinho. Chame o lead pra confirmar o horário.`
        )
      }

      return
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
}
