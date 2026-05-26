import axios from 'axios'

const BASE  = process.env.UAZAPI_URL
const TOKEN = process.env.UAZAPI_TOKEN
const INST  = process.env.UAZAPI_INSTANCE

const api = axios.create({
  baseURL: BASE,
  headers: { token: TOKEN, 'Content-Type': 'application/json' },
  timeout: 15000,
})

export async function sendText(phone, text) {
  const number = normalizePhone(phone)
  try {
    const { data } = await api.post('/send/text', { number, text })
    console.log(`[WA] Sent to ${number}:`, text.slice(0, 60))
    return data
  } catch (err) {
    console.error('[WA] sendText error:', err.response?.data || err.message)
    throw err
  }
}

// Simula digitação antes de enviar (mais humano)
export async function sendTextTyping(phone, text, delayMs = null) {
  const number = normalizePhone(phone)
  const delay  = delayMs ?? Math.min(2000 + text.length * 30, 6000)

  try {
    // Ativa "digitando..."
    await api.post('/send/presence', { number, presence: 'composing' })
    await sleep(delay)
    await api.post('/send/presence', { number, presence: 'paused' })
    await sendText(phone, text)
  } catch {
    // Se falhar o presence, manda direto mesmo
    await sendText(phone, text)
  }
}

export function normalizePhone(phone) {
  let n = phone.replace(/\D/g, '')
  if (!n.startsWith('55')) n = '55' + n
  return n + '@s.whatsapp.net'
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}
