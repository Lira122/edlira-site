import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase    = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const UAZAPI_URL  = Deno.env.get('UAZAPI_URL')!
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')!
const CAL_TIMEZONE = 'America/Sao_Paulo'

// ─── Mensagens personalizadas Eleva Digital ─────────────────────────────────────────

function msg5min(nome: string) {
  return `Oi${nome ? `, ${nome}` : ''}! Vi sua mensagem aqui. Qual é o maior desafio do seu marketing hoje?`
}

function msg1h(nome: string, interesse: string) {
  if (interesse === 'alto' || interesse === 'medio') {
    return `${nome ? `${nome}, ` : ''}passando rapidinho. Você já tentou anúncios pagos antes ou está começando agora?`
  }
  return `Oi${nome ? `, ${nome}` : ''}! Aqui é o Lira, da Eleva Digital. Qual é o maior obstáculo que está travando o crescimento do seu negócio hoje?`
}

function msg24h(nome: string, segmento: string) {
  const segNote = segmento ? ` no segmento de ${segmento}` : ''
  return `Oi${nome ? `, ${nome}` : ''}! Só pra deixar registrado: nossos clientes${segNote} aumentam em média 3x o retorno dos anúncios em 90 dias. Se quiser entender como, é só me chamar.`
}

function msg48h(nome: string) {
  return `Oi${nome ? `, ${nome}` : ''}! Faz um tempo que não falamos. Como está o negócio, ainda com os mesmos desafios ou mudou algo?`
}

function msgFim(nome: string) {
  return `Oi${nome ? `, ${nome}` : ''}! Vou te deixar à vontade. Se um dia quiser escalar o negócio com tráfego pago e IA, é só me chamar aqui.`
}

// ─── Envio WhatsApp ───────────────────────────────────────────────────────────

async function sendText(phone: string, text: string) {
  const number = phone.replace(/\D/g, '')
  const full   = (number.startsWith('55') ? number : '55' + number) + '@s.whatsapp.net'

  const delay = Math.min(1200 + text.length * 25, 3500)
  await new Promise(r => setTimeout(r, delay))

  const res = await fetch(`${UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: { token: UAZAPI_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: full, text })
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`[FOLLOWUP] Erro ao enviar para ${phone}:`, err)
    return false
  }
  return true
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Só aceita POST (chamado pelo pg_cron via http)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const now = new Date()
  let enviados = 0
  let erros    = 0

  try {
    // Busca conversas ativas (não encerradas nem em_pausa ativa)
    const { data: convs, error } = await supabase
      .from('chatbot_conversations')
      .select('phone, stage, messages, lead_data, last_message_at, updated_at')
      .not('stage', 'in', '("encerrado","em_pausa","__debug__")')
      .not('phone', 'like', '__%') // exclui __debug__

    if (error) throw error
    if (!convs?.length) {
      console.log('[FOLLOWUP] Nenhuma conversa ativa.')
      return new Response(JSON.stringify({ ok: true, enviados: 0 }), { status: 200 })
    }

    // Pré-busca: telefones que estão como PERDIDO no CRM. Esses NUNCA recebem
    // follow-up — o usuário marcou como descarte definitivo.
    const phones = (convs || []).map((c) => c.phone as string).filter(Boolean)
    const { data: perdidos } = await supabase
      .from('clientes').select('whatsapp').eq('status', 'perdido').in('whatsapp', phones)
    const phonesPerdidos = new Set((perdidos || []).map((p: { whatsapp: string }) => p.whatsapp))

    let descartados = 0

    for (const conv of convs) {
      const phone = conv.phone as string
      if (!phone || phone.startsWith('__')) continue

      // Lead descartado no CRM (status=perdido) → ignora pra sempre
      if (phonesPerdidos.has(phone)) {
        console.log(`[FOLLOWUP] ${phone} é PERDIDO no CRM — ignorando.`)
        continue
      }

      // Referência de tempo: última mensagem do lead (last_message_at) ou updated_at
      const ref       = conv.last_message_at || conv.updated_at
      const lastAt    = ref ? new Date(ref).getTime() : 0
      const diffMs    = now.getTime() - lastAt
      const diffH     = diffMs / (1000 * 60 * 60)

      const leadData  = (conv.lead_data || {}) as Record<string, string>
      const nome      = (leadData.nome || '').split(' ')[0] || ''
      const interesse = leadData.interesse || ''
      const segmento  = leadData.segmento  || ''
      const followups = (leadData.followups_enviados as unknown as string[]) || []
      const origem    = leadData.origem || ''
      const messages  = (conv.messages || []) as Array<{ role?: string }>
      const respondeu = messages.some((m) => m?.role === 'user')

      // Regra do dono: lead da prospecção que não respondeu em 48h vira descarte
      // definitivo. Quem respondeu segue o ciclo normal de follow-up.
      if (origem === 'disparo_prospeccao' && !respondeu && diffH >= 48) {
        await supabase.from('chatbot_conversations').update({
          stage: 'encerrado',
          lead_data: { ...leadData, descartado_em: now.toISOString(), motivo_descarte: 'sem_resposta_48h' },
          updated_at: now.toISOString(),
        }).eq('phone', phone)
        await supabase.from('clientes').update({
          status: 'perdido',
          atualizado_em: now.toISOString(),
        }).eq('whatsapp', phone)
        console.log(`[FOLLOWUP] descarte automático: ${phone} sem resposta em ${Math.round(diffH)}h`)
        descartados++
        continue
      }

      let tipo: string | null = null
      let mensagem = ''

      // Define qual follow-up enviar baseado no tempo
      if (diffMs >= 5 * 60 * 1000 && diffH < 1 && !followups.includes('f5min')) {
        tipo = 'f5min'
        mensagem = msg5min(nome)
      } else if (diffH >= 1 && diffH < 24 && !followups.includes('f1h')) {
        tipo = 'f1h'
        mensagem = msg1h(nome, interesse)
      } else if (diffH >= 24 && diffH < 48 && !followups.includes('f24h')) {
        tipo = 'f24h'
        mensagem = msg24h(nome, segmento)
      } else if (diffH >= 48 && diffH < 72 && !followups.includes('f48h')) {
        tipo = 'f48h'
        mensagem = msg48h(nome)
      } else if (diffH >= 72 && !followups.includes('ffim')) {
        tipo = 'ffim'
        mensagem = msgFim(nome)
      }

      if (!tipo || !mensagem) continue

      console.log(`[FOLLOWUP] ${tipo} → ${phone} (${nome || 'sem nome'}, ${Math.round(diffH)}h sem resposta)`)

      const ok = await sendText(phone, mensagem)

      if (ok) {
        enviados++
        const novosFollowups = [...followups, tipo]

        // Salva mensagem no histórico e marca follow-up enviado
        await supabase.from('chatbot_conversations').update({
          messages: [...messages, { role: 'assistant', content: mensagem }],
          lead_data: { ...leadData, followups_enviados: novosFollowups },
          updated_at: now.toISOString(),
        }).eq('phone', phone)

        // Se foi o último toque, marca temperatura como gelado no CRM
        if (tipo === 'ffim') {
          await supabase.from('clientes')
            .update({ temperatura: 'gelado', atualizado_em: now.toISOString() })
            .eq('whatsapp', phone)
        }
      } else {
        erros++
      }
    }

    console.log(`[FOLLOWUP] Rodada finalizada: ${enviados} enviados, ${erros} erros, ${descartados} descartados`)
    return new Response(JSON.stringify({ ok: true, enviados, erros, descartados, total: convs.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('[FOLLOWUP] Erro geral:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 })
  }
})
