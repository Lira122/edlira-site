import axios from 'axios'

const api = axios.create({
  baseURL: process.env.UAZAPI_URL,
  headers: {
    'token': process.env.UAZAPI_TOKEN,
    'Content-Type': 'application/json'
  }
})

/**
 * Envia mensagem de texto
 */
export async function sendText(phone, text) {
  try {
    const res = await api.post('/send/text', {
      number: phone,
      text
    })
    return res.data
  } catch (err) {
    console.error('[UazAPI] Erro ao enviar:', err.response?.data || err.message)
    throw err
  }
}

/**
 * Envia com delay humanizado (1-3s baseado no tamanho da msg)
 */
export async function sendTextDelayed(phone, text) {
  const delay = Math.min(1200 + text.length * 25, 3500)
  await new Promise(r => setTimeout(r, delay))
  return sendText(phone, text)
}

/**
 * Configura o webhook no UazAPI
 */
export async function setWebhook(url) {
  try {
    const res = await api.post('/webhook', {
      url,
      enabled: true,
      events: ['messages.upsert']
    })
    console.log('[UazAPI] Webhook configurado:', res.data)
    return res.data
  } catch (err) {
    console.error('[UazAPI] Erro ao configurar webhook:', err.response?.data || err.message)
    throw err
  }
}

/**
 * Extrai phone + text + tipo de mensagem do payload do webhook
 * Suporta texto, áudio, transcrição de áudio e botões
 */
export function parseWebhook(body) {
  try {
    // UazAPI pode enviar array ou objeto único
    const events = Array.isArray(body) ? body : [body]

    for (const event of events) {
      // Formato evolution-based
      const data = event?.data || event
      const msg = data?.messages?.[0] || data?.message || data

      if (!msg) continue

      const key = msg.key || msg
      const fromMe = key?.fromMe === true
      if (fromMe) continue

      // Extrai o número do remetente
      const jid = key?.remoteJid || msg?.remoteJid || ''
      const phone = jid.replace(/@s\.whatsapp\.net$/, '').replace(/@c\.us$/, '')

      if (!phone || phone.includes('@g')) continue // ignora grupos

      // Extrai tipo e conteúdo da mensagem
      const msgContent = msg.message || msg

      const text =
        msgContent?.conversation ||
        msgContent?.extendedTextMessage?.text ||
        msgContent?.buttonsResponseMessage?.selectedDisplayText ||
        msgContent?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        null

      const isAudio = !!(
        msgContent?.audioMessage ||
        msgContent?.pttMessage
      )

      const audioBase64 =
        msgContent?.audioMessage?.base64 ||
        msgContent?.pttMessage?.base64 ||
        null

      const audioUrl =
        msgContent?.audioMessage?.url ||
        msgContent?.pttMessage?.url ||
        null

      const pushName = msg?.pushName || ''

      if (!text && !isAudio) continue

      return { phone, text, isAudio, audioBase64, audioUrl, pushName }
    }

    return null
  } catch (err) {
    console.error('[UazAPI] Erro ao parsear webhook:', err.message)
    return null
  }
}
