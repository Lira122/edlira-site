import { createClient } from '@supabase/supabase-js'

const db = createClient(process.env.SB_URL, process.env.SB_KEY)

// ── Status do robô (liga/desliga pelo painel) ─────────────────────────────────

// Retorna true se o robô deve responder. O robô fica DESLIGADO quando os
// agentes de canal WhatsApp estão todos como "inativo" no painel.
// Em caso de erro de leitura, mantém o robô ligado para não derrubá-lo por engano.
export async function isBotActive() {
  const { data, error } = await db.from('agentes')
    .select('status, canal')
    .ilike('canal', '%whats%')
  if (error) {
    console.error('[CRM] isBotActive error:', error.message)
    return true
  }
  if (!data || !data.length) return true // nenhum agente WhatsApp configurado — mantém ligado
  return data.some(a => a.status === 'ativo')
}

// ── chatbot_conversations (histórico de conversa) ─────────────────────────────

export async function getConversation(phone) {
  const { data } = await db.from('chatbot_conversations')
    .select('*')
    .eq('phone', phone)
    .single()
  return data || null
}

export async function upsertConversation(phone, updates) {
  const { error } = await db.from('chatbot_conversations').upsert({
    phone,
    ...updates,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'phone' })
  if (error) console.error('[CRM] upsertConversation error:', error)
}

// ── clientes (CRM) ────────────────────────────────────────────────────────────

export async function getLeadByPhone(phone) {
  const clean = phone.replace(/\D/g, '')
  const { data } = await db.from('clientes')
    .select('*')
    .or(`whatsapp.ilike.%${clean}%`)
    .maybeSingle()
  return data || null
}

export async function createLead({ nome, whatsapp, empresa, temperatura = 'frio', status = 'novo' }) {
  const { data, error } = await db.from('clientes').insert({
    nome,
    whatsapp,
    empresa: empresa || null,
    status,
    temperatura,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  }).select().single()
  if (error) { console.error('[CRM] createLead error:', error); return null }
  return data
}

export async function updateLead(id, fields) {
  const { error } = await db.from('clientes').update({
    ...fields,
    atualizado_em: new Date().toISOString(),
  }).eq('id', id)
  if (error) console.error('[CRM] updateLead error:', error)
}

export async function pauseLead(id, diasAte = 7, observacoes = '') {
  const pausado_ate = new Date(Date.now() + diasAte * 24 * 60 * 60 * 1000).toISOString()
  await updateLead(id, { status: 'em_pausa', pausado_ate, observacoes, temperatura: 'frio' })
  return pausado_ate
}

// ── Follow-up ─────────────────────────────────────────────────────────────────

// Leads ativos sem resposta (para follow-up)
export async function getLeadsForFollowup() {
  const { data } = await db.from('clientes')
    .select('*')
    .in('status', ['novo', 'qualificado', 'proposta'])
    .not('whatsapp', 'is', null)
  return data || []
}

// Retoma leads pausados vencidos
export async function resumeExpiredPauses() {
  const now = new Date().toISOString()
  const { data } = await db.from('clientes')
    .select('id, nome')
    .eq('status', 'em_pausa')
    .lt('pausado_ate', now)
  if (!data?.length) return []
  for (const lead of data) {
    await updateLead(lead.id, { status: 'qualificado', pausado_ate: null, temperatura: 'frio' })
  }
  return data
}

export async function syncLeadCRM(phone, stage, leadData) {
  const nome    = leadData.nome    || 'Lead WhatsApp'
  const empresa = leadData.empresa || ''

  const existing = await getLeadByPhone(phone)
  const payload = {
    nome,
    empresa,
    whatsapp: phone,
    email:       leadData.email    || null,
    servico:     'Marketing IA + Tráfego Pago',
    observacoes: leadData.dores?.join(', ') || null,
    temperatura: mapInteresseToTemp(leadData.interesse),
    status:      mapStageToStatus(stage),
    atualizado_em: new Date().toISOString(),
  }

  if (existing) {
    await updateLead(existing.id, payload)
  } else {
    await db.from('clientes').insert({ ...payload, criado_em: new Date().toISOString() })
  }
}

function mapInteresseToTemp(interesse) {
  if (interesse === 'alto')  return 'quente'
  if (interesse === 'medio') return 'morno'
  if (interesse === 'baixo') return 'frio'
  return 'frio'
}

function mapStageToStatus(stage) {
  if (['fechamento', 'encerrado'].includes(stage)) return 'proposta'
  if (['proposta', 'necessidade', 'implicacao'].includes(stage)) return 'qualificado'
  return 'novo'
}
