import 'dotenv/config'
import express from 'express'
import { startFollowupScheduler, resetFollowup } from './src/followup.js'
import { generateReply, detectTemperature, detectPauseIntent, isOptOut } from './src/ai.js'
import { sendTextTyping } from './src/whatsapp.js'
import {
  getConversation, upsertConversation,
  getLeadByPhone, createLead, updateLead, pauseLead, syncLeadCRM,
  isBotActive,
} from './src/crm.js'

const app  = express()
const PORT = process.env.PORT || 3000
const BOT  = (process.env.BOT_NUMBER || '').replace(/\D/g, '')

app.use(express.json({ limit: '5mb' }))

// Health check
app.get('/', (_, res) => res.json({ status: 'ok', bot: 'Sofia', ts: new Date().toISOString() }))

// ── Parser do formato UazAPI ──────────────────────────────────────────────────
function parseWebhook(body) {
  try {
    const events = Array.isArray(body) ? body : [body]

    for (const event of events) {
      if (!event || typeof event !== 'object') continue

      // Formato UazAPI nativo: { EventType, message, chat, ... }
      if (event.EventType === 'messages' && event.message) {
        const msg = event.message
        if (msg.fromMe === true)       continue
        if (msg.wasSentByApi === true) continue
        if (msg.isGroup === true)      continue

        const chatid = String(msg.chatid || msg.chatId || '')
        const phone  = chatid.replace(/@s\.whatsapp\.net$/, '').replace(/@c\.us$/, '')
        if (!phone) continue

        const text     = msg.text || msg.content || msg.body || null
        const pushName = String(msg.senderName || msg.pushName || event.chat?.wa_name || '')

        if (!text) continue
        return { phone, text, pushName }
      }
    }
    return null
  } catch (err) {
    console.error('[WEBHOOK] Parse error:', err.message)
    return null
  }
}

// ── Webhook ───────────────────────────────────────────────────────────────────
app.post('/webhook', async (req, res) => {
  res.sendStatus(200) // responde rápido

  try {
    const parsed = parseWebhook(req.body)
    if (!parsed) return

    const { phone, text, pushName } = parsed
    if (phone === BOT || phone === '') return

    console.log(`\n[MSG] ${phone} (${pushName}): ${text}`)
    await handleIncoming(phone, text, pushName)
  } catch (err) {
    console.error('[WEBHOOK] Error:', err)
  }
})

// ── Lógica principal ──────────────────────────────────────────────────────────
async function handleIncoming(phone, text, pushName = '') {
  // 0. Robô desativado no painel — não responde a nada
  if (!(await isBotActive())) {
    console.log(`[BOT] Robô desativado no painel — ignorando msg de ${phone}`)
    return
  }

  // 1. Busca ou cria lead no CRM
  let lead = await getLeadByPhone(phone)
  if (!lead) {
    lead = await createLead({ nome: pushName || 'Lead WhatsApp', whatsapp: phone })
    if (!lead) { console.error('[BOT] Falha ao criar lead'); return }
  }

  // 2. Lead em pausa ativa — ignora
  if (lead.status === 'em_pausa') {
    const pauseEnd = lead.pausado_ate ? new Date(lead.pausado_ate) : null
    if (pauseEnd && pauseEnd > new Date()) {
      console.log(`[BOT] Lead ${lead.nome} em pausa — ignorando`)
      return
    }
    await updateLead(lead.id, { status: 'qualificado', pausado_ate: null, temperatura: 'frio' })
    lead.status = 'qualificado'
  }

  // 3. Busca conversa
  let conv = await getConversation(phone)
  const messages = conv?.messages || []
  const stage    = conv?.stage    || 'inicio'
  const leadData = conv?.lead_data || { nome: pushName }

  // 3.5 Opt-out definitivo — respeita o pedido e encerra de vez (LGPD)
  if (isOptOut(text)) {
    const msg = `Entendido! 🙏 Não vou te enviar mais mensagens. Desejo muito sucesso pro seu negócio — qualquer coisa, é só me chamar. Abraço!`
    await sendTextTyping(phone, msg)
    await updateLead(lead.id, {
      status: 'perdido',
      temperatura: 'gelado',
      observacoes: `[OPT-OUT] Pediu para não receber contato em ${new Date().toLocaleString('pt-BR')}.`,
    })
    await upsertConversation(phone, {
      stage: 'opt_out',
      messages: [...messages, { role: 'user', content: text }, { role: 'assistant', content: msg }],
      lead_data: leadData,
    })
    console.log(`[BOT] Opt-out registrado: ${lead.nome} (${phone})`)
    return
  }

  // 4. Detecta intenção de pausa
  const wantsPause = await detectPauseIntent(text)
  if (wantsPause && messages.length > 0) {
    const pauseDate = await pauseLead(lead.id, 7)
    const msg = `Entendido, sem problema! 😊 Vou te deixar à vontade. Quando quiser conversar sobre como escalar seu negócio, pode me chamar quando quiser. Até mais! 👋`
    await sendTextTyping(phone, msg)
    await upsertConversation(phone, {
      stage: 'pausado',
      messages: [...messages, { role: 'user', content: text }, { role: 'assistant', content: msg }],
      lead_data: leadData,
    })
    await updateLead(lead.id, { status: 'em_pausa', pausado_ate: pauseDate })
    return
  }

  // 5. Adiciona mensagem do usuário ao histórico
  const updatedMessages = [...messages, { role: 'user', content: text }]

  // 6. Se primeira mensagem — envia boas-vindas
  if (messages.length === 0) {
    const welcome1 = `Oi! 👋 Aqui é a Sofia, assistente virtual do Lira, da *Eleva Digital* — agência de marketing com IA e tráfego pago.`
    const welcome2 = `Fico feliz que entrou em contato! Com quem tenho o prazer de falar? 😊`

    await sendTextTyping(phone, welcome1, 1500)
    await sendTextTyping(phone, welcome2, 2000)

    await upsertConversation(phone, {
      stage: 'situacao',
      messages: [
        { role: 'assistant', content: welcome1 },
        { role: 'assistant', content: welcome2 },
      ],
      lead_data: { nome: pushName },
    })
    await updateLead(lead.id, { status: 'qualificado', atualizado_em: new Date().toISOString() })
    resetFollowup(phone)
    return
  }

  // 7. Detecta temperatura
  const novaTemp = await detectTemperature(updatedMessages.slice(-6), lead.temperatura)
  if (novaTemp !== lead.temperatura) {
    await updateLead(lead.id, { temperatura: novaTemp })
    lead.temperatura = novaTemp
    console.log(`[BOT] Temperatura ${lead.nome}: ${novaTemp}`)
  }

  // 8. Gera resposta com IA
  const aiReply = await generateReply(updatedMessages, { ...lead, stage })

  // 9. Envia resposta (pode vir em múltiplas mensagens separadas por \n\n)
  const parts = aiReply.split(/\n\n+/).filter(p => p.trim())
  for (const part of parts) {
    await sendTextTyping(phone, part.trim())
  }

  // 10. Salva conversa atualizada
  const finalMessages = [
    ...updatedMessages,
    { role: 'assistant', content: aiReply },
  ].slice(-40) // mantém as últimas 40 mensagens

  await upsertConversation(phone, {
    stage,
    messages: finalMessages,
    lead_data: leadData,
  })

  // 11. Sincroniza com CRM e reseta follow-up
  await syncLeadCRM(phone, stage, leadData)
  resetFollowup(phone)
}

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🤖 Sofia Bot rodando na porta ${PORT}`)
  console.log(`   Webhook: POST http://localhost:${PORT}/webhook`)
  startFollowupScheduler()
})
