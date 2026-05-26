import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const UAZAPI_URL   = Deno.env.get('UAZAPI_URL')!
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')!

// ─── Normaliza telefone para formato WhatsApp (5511999999999) ──────────────────
function normalizePhone(raw: string): string | null {
  // Remove tudo que não for dígito
  let digits = raw.replace(/\D/g, '')

  // Remove zero inicial de discagem (ex: 011...)
  if (digits.startsWith('0')) digits = digits.slice(1)

  // Se começar com 55 e tiver 12-13 dígitos, já está ok
  if (digits.startsWith('55') && digits.length >= 12 && digits.length <= 13) {
    return digits
  }

  // Se tiver 10-11 dígitos, é número brasileiro sem código do país
  if (digits.length === 10 || digits.length === 11) {
    return '55' + digits
  }

  // Se já tem 55 na frente mas veio com algum problema
  if (digits.startsWith('55') && digits.length > 13) {
    return digits.slice(0, 13)
  }

  return digits.length >= 8 ? '55' + digits : null
}

// ─── Envia mensagem WhatsApp via UazAPI ───────────────────────────────────────
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

function buildWelcomeMsgs(name: string, company: string): string[] {
  const firstName = name.trim().split(' ')[0]
  const companyPart = company ? ` da ${company}` : ''

  return [
    `Oi, ${firstName}! Aqui é o Lira, da Eleva Digital. Vi que você${companyPart} pediu um diagnóstico gratuito.`,
    `Pra eu reservar o melhor horário: prefere de manhã ou à tarde? E que dia da semana fica melhor?`
  ]
}

// ─── Handler principal ────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: corsHeaders })
  }

  const { name, company, whatsapp, email, segment } = body

  if (!name || !whatsapp) {
    return new Response(JSON.stringify({ error: 'name e whatsapp são obrigatórios' }), { status: 400, headers: corsHeaders })
  }

  const phone = normalizePhone(whatsapp)
  if (!phone) {
    return new Response(JSON.stringify({ error: 'Telefone inválido' }), { status: 400, headers: corsHeaders })
  }

  console.log(`[form-lead] Lead recebido: ${name} | ${phone} | ${company}`)

  try {
    // 1. Salva/atualiza lead no CRM
    await supabase.from('clientes').upsert({
      nome:     name,
      empresa:  company || '',
      whatsapp: phone,
      email:    email || '',
      servico:  'Marketing IA + Tráfego Pago',
      status:   'lead_novo',
      observacoes: [
        segment ? `Segmento: ${segment}` : '',
        'Origem: formulário site'
      ].filter(Boolean).join(' | ')
    }, { onConflict: 'whatsapp' })

    // 2. Cria conversa no chatbot (se ainda não existir)
    const { data: existing } = await supabase
      .from('chatbot_conversations')
      .select('phone')
      .eq('phone', phone)
      .single()

    if (!existing) {
      const welcomeMsgs = buildWelcomeMsgs(name, company || '')

      await supabase.from('chatbot_conversations').insert({
        phone,
        stage: 'fechamento',  // lead já demonstrou intenção — vai direto pro agendamento
        messages: [{ role: 'assistant', content: welcomeMsgs.join('\n') }],
        lead_data: {
          nome: name,
          empresa: company || '',
          segmento: segment || '',
          interesse: 'alto',
          origem: 'formulario_site'
        }
      })

      // 3. Dispara mensagens personalizadas no WhatsApp
      for (const msg of welcomeMsgs) await sendTextDelayed(phone, msg)
    }

    return new Response(JSON.stringify({ ok: true, phone }), { status: 200, headers: corsHeaders })

  } catch (err) {
    console.error('[form-lead] Erro:', err)
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500, headers: corsHeaders })
  }
})
