import cron from 'node-cron'
import { getLeadsForFollowup, updateLead, resumeExpiredPauses, isBotActive } from './crm.js'
import { sendTextTyping } from './whatsapp.js'
import axios from 'axios'

// ── Geração de follow-up personalizado por IA ─────────────────────────────────

async function generateFollowup(lead, type) {
  const nome      = (lead.nome || '').split(' ')[0] || 'você'
  const empresa   = lead.empresa   || ''
  const segmento  = lead.segmento  || ''
  const dores     = lead.dores     || ''
  const temp      = lead.temperatura || 'frio'
  const obs       = lead.observacoes || ''

  const contextBlock = [
    `Nome: ${nome}`,
    empresa   ? `Empresa: ${empresa}`         : '',
    segmento  ? `Segmento: ${segmento}`        : '',
    dores     ? `Dores mencionadas: ${dores}`  : '',
    obs       ? `Contexto: ${obs}`             : '',
    `Temperatura: ${temp}`,
  ].filter(Boolean).join('\n')

  const typeInstructions = {
    f5min: `O lead acabou de entrar em contato mas parou de responder há ~5 minutos.
Manda uma mensagem muito curta e casual, como se fosse um "ei, chegou bem?" — sem pressão, sem pitch.
Máx 1 frase. Pode usar 1 emoji.`,

    f1h: `O lead parou de responder há 1 hora.
Manda uma mensagem que entregue um insight de valor pequeno relacionado às dores dele e faça UMA pergunta que abre diálogo.
Não mencione que está fazendo follow-up. Seja natural. 2-3 linhas no máximo.`,

    f24h: `O lead parou de responder há 24 horas.
Manda uma mensagem que cria um leve senso de contexto — pode mencionar algo do mercado, do segmento dele ou uma pergunta direta sobre o negócio.
Tom: amigável, sem pressão. 2-3 linhas.`,

    reng: `O lead sumiu há 48 horas. Tente um ângulo completamente diferente da conversa anterior.
Pode ser uma pergunta curiosa sobre o negócio dele, um fato do mercado, ou simplesmente reabrir com leveza.
Não mencione nada de reunião ou serviço ainda. 2 linhas no máximo.`,

    fim: `O lead está sem responder há 72h+. Este é o último contato.
Manda uma mensagem de encerramento elegante — diga que vai deixar à vontade, mas que a porta está aberta.
Tom: respeitoso, sem ressentimento, com abertura futura. 2-3 linhas.`,
  }

  const system = `Você é Sofia, assistente da Eleva Digital — agência de marketing com IA e tráfego pago.
Você escreve mensagens de WhatsApp humanizadas para follow-up com leads.

REGRAS:
- Escreva como uma pessoa real, não como robô
- Use o nome do lead quando natural, mas não em toda mensagem
- Nunca use bullet points ou listas
- Nunca mencione "follow-up", "automação" ou que é uma mensagem programada
- Adapte o contexto do negócio do lead quando disponível
- Responda APENAS a mensagem, sem explicações`

  const userPrompt = `Contexto do lead:
${contextBlock}

Tipo de follow-up: ${type}
Instrução: ${typeInstructions[type]}

Escreva a mensagem agora:`

  try {
    const { data } = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-sonnet-4.5',
        max_tokens: 150,
        temperature: 0.85,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://elevabrands.com.br',
          'X-Title': 'Eleva Digital Follow-up',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    )
    return data.choices?.[0]?.message?.content?.trim() || null
  } catch (err) {
    console.error('[FOLLOWUP-AI] Erro ao gerar mensagem:', err.message)
    return null
  }
}

// ── Estado de follow-up por lead ──────────────────────────────────────────────

const state = new Map()

function getState(id) {
  if (!state.has(id)) state.set(id, {})
  return state.get(id)
}

export function resetFollowup(phone) {
  state.set(phone, {})
}

async function tryFollowup(lead, type) {
  const s = getState(lead.id)
  if (s[type]) return

  s[type] = true
  console.log(`[FOLLOWUP] ${type} → ${lead.nome} (${lead.whatsapp})`)

  try {
    const msg = await generateFollowup(lead, type)
    if (!msg) { s[type] = false; return }

    await sendTextTyping(lead.whatsapp, msg)
    await updateLead(lead.id, { atualizado_em: new Date().toISOString() })
    console.log(`[FOLLOWUP] ✅ ${type} enviado para ${lead.nome}: "${msg.slice(0, 60)}..."`)
  } catch (err) {
    console.error(`[FOLLOWUP] Erro ao enviar ${type}:`, err.message)
    s[type] = false
  }
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

export function startFollowupScheduler() {
  cron.schedule('*/2 * * * *', async () => {
    try {
      if (!(await isBotActive())) {
        console.log('[FOLLOWUP] Robô desativado no painel — follow-ups pausados')
        return
      }

      const retomados = await resumeExpiredPauses()
      if (retomados.length) {
        console.log(`[FOLLOWUP] Retomando ${retomados.length} leads pausados`)
      }

      const leads = await getLeadsForFollowup()
      const now   = Date.now()
      const BOT   = (process.env.BOT_NUMBER || '').replace(/\D/g, '')

      for (const lead of leads) {
        if (!lead.whatsapp) continue
        const phone = lead.whatsapp.replace(/\D/g, '')
        if (phone === BOT) continue

        const last   = lead.atualizado_em ? new Date(lead.atualizado_em).getTime() : 0
        const diffMs = now - last
        const diffH  = diffMs / (1000 * 60 * 60)

        if (diffMs >= 5 * 60 * 1000 && diffMs < 60 * 60 * 1000) {
          await tryFollowup(lead, 'f5min'); continue
        }
        if (diffH >= 1 && diffH < 24) {
          await tryFollowup(lead, 'f1h'); continue
        }
        if (diffH >= 24 && diffH < 48) {
          await tryFollowup(lead, 'f24h'); continue
        }
        if (diffH >= 48 && diffH < 72) {
          await tryFollowup(lead, 'reng'); continue
        }
        if (diffH >= 72 && !getState(lead.id).fim) {
          await tryFollowup(lead, 'fim')
          await updateLead(lead.id, { temperatura: 'gelado' })
        }
      }
    } catch (err) {
      console.error('[FOLLOWUP] Scheduler error:', err.message)
    }
  })

  console.log('[FOLLOWUP] Scheduler iniciado (a cada 2 min) — follow-ups gerados por IA')
}
