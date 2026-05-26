import 'dotenv/config'
import express from 'express'
import { parseWebhook, sendTextDelayed, setWebhook } from './uazapi.js'
import { getOrCreateConversation, updateConversation, saveLeadToCRM } from './supabase.js'
import { processMessage } from './agent.js'
import { transcribeAudio } from './groq.js'

const app = express()
app.use(express.json({ limit: '10mb' }))

const WELCOME = `Olá! 👋 Aqui é a *Sofia*, da *Eleva Digital* — agência de marketing com IA e tráfego pago.

Fico feliz que entrou em contato! Com quem tenho o prazer de falar? 😊`

// Evita processar a mesma mensagem duas vezes
const processing = new Set()

app.post('/webhook', async (req, res) => {
  res.sendStatus(200) // responde imediato pro UazAPI

  // Log do payload bruto para debug
  console.log('[Webhook RAW]', JSON.stringify(req.body).slice(0, 300))

  const parsed = parseWebhook(req.body)
  if (!parsed) return

  const { phone, text, isAudio, audioBase64, audioUrl, pushName } = parsed

  // Anti-duplicata
  const lockKey = `${phone}:${text || 'audio'}`
  if (processing.has(lockKey)) return
  processing.add(lockKey)
  setTimeout(() => processing.delete(lockKey), 8000)

  console.log(`[MSG] ${phone} (${pushName}): ${isAudio ? '[ÁUDIO]' : text}`)

  try {
    // Transcreve áudio se necessário
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

    // Primeira mensagem — envia boas-vindas
    if (conversation.messages.length === 0) {
      await sendTextDelayed(phone, WELCOME)
      await updateConversation(phone, {
        stage: 'situacao',
        messages: [{ role: 'assistant', content: WELCOME }],
        lead_data: { nome: pushName || '' }
      })
      return
    }

    // Conversa já encerrada — ignora
    if (conversation.stage === 'encerrado') return

    // Processa com o agente SPIN
    const result = await processMessage(conversation, messageText)
    console.log(`[Agent] ${phone} → estágio: ${result.stage} | interesse: ${result.lead_data.interesse}`)

    // Envia a resposta
    await sendTextDelayed(phone, result.message)

    // Atualiza estado no Supabase
    await updateConversation(phone, {
      stage: result.stage,
      messages: result.messages,
      lead_data: result.lead_data
    })

    // Salva no CRM quando lead avança para fechamento ou encerramento
    if (['fechamento', 'encerrado'].includes(result.stage)) {
      await saveLeadToCRM(phone, result.lead_data)
      console.log(`[CRM] Lead salvo: ${phone} — ${result.lead_data.nome || 'sem nome'}`)
    }

  } catch (err) {
    console.error(`[ERRO] ${phone}:`, err.message)
  }
})

app.get('/health', (_, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, async () => {
  console.log(`\n🚀 Chatbot Eleva Digital rodando na porta ${PORT}`)
  console.log(`📡 Webhook: POST http://localhost:${PORT}/webhook`)

  // Configura webhook automaticamente se URL definida
  if (process.env.WEBHOOK_URL) {
    try {
      await setWebhook(`${process.env.WEBHOOK_URL}/webhook`)
      console.log(`✅ Webhook configurado: ${process.env.WEBHOOK_URL}/webhook`)
    } catch {
      console.warn('⚠️  Webhook não configurado automaticamente — faça manualmente')
    }
  } else {
    console.log('⚠️  WEBHOOK_URL não definida no .env — configure manualmente após o deploy')
  }
})
