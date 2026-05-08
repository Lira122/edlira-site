import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function getOrCreateConversation(phone) {
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

export async function updateConversation(phone, { stage, messages, lead_data }) {
  const update = { updated_at: new Date().toISOString() }
  if (stage !== undefined) update.stage = stage
  if (messages !== undefined) update.messages = messages
  if (lead_data !== undefined) update.lead_data = lead_data

  const { error } = await supabase
    .from('chatbot_conversations')
    .update(update)
    .eq('phone', phone)

  if (error) throw error
}

/**
 * Salva lead qualificado na tabela clientes do CRM
 * Campos reais: nome, empresa, whatsapp, email, servico, status, observacoes
 */
export async function saveLeadToCRM(phone, lead_data) {
  try {
    const { error } = await supabase
      .from('clientes')
      .upsert({
        nome: lead_data.nome || 'Lead WhatsApp',
        empresa: lead_data.empresa || '',
        whatsapp: phone,
        servico: 'Marketing IA + Tráfego Pago',
        status: 'lead_qualificado',
        observacoes: [
          lead_data.segmento ? `Segmento: ${lead_data.segmento}` : '',
          lead_data.faturamento ? `Faturamento: ${lead_data.faturamento}` : '',
          lead_data.investe_ads ? `Ads atual: ${lead_data.investe_ads}` : '',
          lead_data.dores?.length ? `Dores: ${lead_data.dores.join(', ')}` : '',
          `Interesse: ${lead_data.interesse || 'indefinido'}`
        ].filter(Boolean).join(' | ')
      }, { onConflict: 'whatsapp' })

    if (error) throw error
    console.log(`[CRM] Lead salvo: ${lead_data.nome} (${phone})`)
  } catch (err) {
    console.error('[CRM] Erro ao salvar lead:', err.message)
  }
}
