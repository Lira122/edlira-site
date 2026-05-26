// ════════════════════════════════════════════════════════════════
//  Edge Function: disparo
//  Roda na NUVEM — chamada pelo pg_cron. A cada chamada, dispara a
//  1ª mensagem para 1 lead da prospecção. Sem depender de PC ligado.
//
//  Controles:
//   - Horário comercial (seg-sáb, 8h-19h Brasília)
//   - Cota diária (DISPARO_CAP, padrão 20)
//   - Respeita o liga/desliga do agente no painel
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const UAZAPI_URL         = Deno.env.get('UAZAPI_URL')!
const UAZAPI_TOKEN       = Deno.env.get('UAZAPI_TOKEN')!
const GROQ_API_KEY       = Deno.env.get('GROQ_API_KEY')
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

const DAILY_CAP = Number(Deno.env.get('DISPARO_CAP') ?? '20')
const TZ = 'America/Sao_Paulo'

// ─── Persona Lira — 1ª mensagem de prospecção ─────────────────────
const SYSTEM = `Você é o Lira, dono da Eleva Digital — uma agência de marketing digital de São José dos Campos (SP).
Você ajuda pequenos e médios negócios locais a atrair mais clientes pela internet: Google, Instagram e tráfego pago.

Escreva a PRIMEIRA conversa de WhatsApp para o dono de uma empresa local que nunca falou com você.
OBJETIVO: causar uma boa impressão e conseguir um "sim" para um diagnóstico gratuito de 20 minutos.

COMO ESCREVER — MUITO IMPORTANTE:
As pessoas têm preguiça de ler e se irritam com excesso de mensagens. Seja CURTO e direto.
Mande NO MÁXIMO 2 mensagens curtinhas no total, uma embaixo da outra — nunca um texto grande e corrido.
Cada mensagem deve ter só 1 ou 2 frases curtas. Separe as duas mensagens por UMA linha em branco.

AS 2 MENSAGENS:
1. Saudação + quem você é + o convite: comece com a saudação informada (Bom dia / Boa tarde /
   Boa noite), diga que é o Lira, da Eleva Digital — agência de marketing digital de São José dos Campos —
   e ofereça um diagnóstico gratuito de 20 minutos, sem compromisso, pra ajudar a [empresa] a
   atrair mais clientes pela internet.
2. Uma pergunta curta pra marcar, com saída leve ("se não for um bom momento, sem problema").

TOM: caloroso, educado, empático, humano. Nada de vendedor agressivo. Nunca aponte defeito do negócio.
NUNCA use emojis. Português do Brasil. Cite a empresa pelo nome. Varie a redação.
Responda SOMENTE com as mensagens, cada uma separada por UMA linha em branco. Não numere as mensagens.`

const limpa = (t: string) => String(t).trim().replace(/^["']+|["']+$/g, '').trim()

async function gerarOpener(empresa: string, segmento: string, cidade: string, saudacao: string): Promise<string> {
  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: `Empresa: ${empresa}\nSegmento: ${segmento || 'comércio local'}\nCidade: ${cidade || 'Vale do Paraíba'}\nSaudação a usar: ${saudacao}\n\nEscreva a mensagem de WhatsApp — calorosa, educada e empática.` },
    ],
    temperature: 0.9,
    max_tokens: 180,
  }

  if (GROQ_API_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (r.ok) {
        const j = await r.json()
        return limpa(j.choices[0].message.content)
      }
    } catch (_) { /* cai pro fallback */ }
  }

  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://elevabrands.com.br',
      'X-Title': 'Eleva Digital Disparo',
    },
    body: JSON.stringify({ ...body, model: 'meta-llama/llama-3.1-70b-instruct' }),
  })
  const j = await r.json()
  return limpa(j.choices[0].message.content)
}

function extrair(obs: string, rotulo: string): string {
  const m = (obs || '').match(new RegExp(rotulo + ':\\s*(.+)'))
  return m ? m[1].trim() : ''
}

// Prioridade do segmento — 1 = melhor lead
function tier(obs: string): number {
  const s = (extrair(obs, 'Segmento') || '').toLowerCase()
  if (/sa[úu]de|odontolog|est[ée]tica|advoca|contabil|veterin/.test(s)) return 1
  if (/academia|beleza|sal[ãa]o|imobili|[óo]tica/.test(s)) return 2
  if (/alimenta|com[ée]rcio local|padaria|restaurante|lanchonete/.test(s)) return 4
  return 3
}

async function sendText(phone: string, text: string) {
  const res = await fetch(`${UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: { 'token': UAZAPI_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: phone, text }),
  })
  if (!res.ok) throw new Error(`UazAPI ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

Deno.serve(async () => {
  // Hora de Brasília
  const sp = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
  const hora = sp.getHours()
  const dia = sp.getDay() // 0 = domingo
  const hojeBR = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  // 1. Janela: segunda a sábado, 8h às 19h
  if (dia === 0 || hora < 8 || hora >= 19) {
    return Response.json({ ok: true, skip: 'fora do horário comercial' })
  }

  // 2. Liga/desliga pelo painel — bot ligado se houver pelo menos UM agente ativo.
  //    Se TODOS estão inativos, desliga. Sem agentes, mantém ligado.
  const { data: agentes } = await supabase.from('agentes').select('status')
  const ligado = !agentes || !agentes.length || agentes.some((a) => a.status === 'ativo')
  if (!ligado) {
    return Response.json({ ok: true, skip: 'bot desativado no painel' })
  }

  // 3. Cota diária
  const { count } = await supabase
    .from('chatbot_conversations')
    .select('*', { count: 'exact', head: true })
    .eq('lead_data->>origem', 'disparo_prospeccao')
    .eq('lead_data->>disparo_dia', hojeBR)
  if ((count ?? 0) >= DAILY_CAP) {
    return Response.json({ ok: true, skip: `cota diária atingida (${count}/${DAILY_CAP})` })
  }

  // 4. Próximo lead — pega um lote e prioriza por segmento
  const { data: pool } = await supabase
    .from('clientes')
    .select('id, nome, empresa, whatsapp, observacoes')
    .eq('status', 'prospeccao')
    .not('whatsapp', 'is', null)
    .order('criado_em', { ascending: true })
    .limit(120)
  if (!pool || !pool.length) {
    return Response.json({ ok: true, skip: 'sem leads na fila' })
  }
  pool.sort((a, b) => tier(a.observacoes) - tier(b.observacoes))

  // 5. Procura o próximo CELULAR sem conversa, gera e envia.
  //    Números fixos (sem WhatsApp) são marcados e pulados na hora.
  let falhas = 0
  for (const lead of pool) {
    const phone = String(lead.whatsapp || '').replace(/\D/g, '')

    // WhatsApp exige celular: 55 + DDD + 9XXXXXXXX (13 dígitos, 5º = 9)
    if (phone.length !== 13 || phone[4] !== '9') {
      await supabase.from('clientes').update({
        status: 'perdido',
        observacoes: (lead.observacoes || '') + '\n[Disparo] Número fixo — sem WhatsApp.',
        atualizado_em: new Date().toISOString(),
      }).eq('id', lead.id)
      continue
    }

    const { data: existe } = await supabase
      .from('chatbot_conversations').select('phone').eq('phone', phone).maybeSingle()
    if (existe) continue

    const empresa = lead.empresa || lead.nome
    const segmento = extrair(lead.observacoes, 'Segmento')
    const cidade = extrair(lead.observacoes, 'Cidade')

    let opener: string
    try {
      opener = await gerarOpener(empresa, segmento, cidade, saudacao)
    } catch (e) {
      return Response.json({ ok: false, erro: 'gerar opener: ' + String(e) })
    }

    const partes = opener.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean)
    try {
      for (let i = 0; i < partes.length; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 1800 + Math.random() * 1600))
        await sendText(phone, partes[i])
      }
    } catch (_e) {
      // Número não está no WhatsApp — marca e tenta o próximo
      await supabase.from('clientes').update({
        status: 'perdido',
        observacoes: (lead.observacoes || '') + '\n[Disparo] Número sem WhatsApp.',
        atualizado_em: new Date().toISOString(),
      }).eq('id', lead.id)
      if (++falhas >= 5) {
        return Response.json({ ok: false, erro: '5 falhas de envio seguidas — verifique o número do bot' })
      }
      continue
    }

    await supabase.from('chatbot_conversations').insert({
      phone,
      stage: 'situacao',
      messages: partes.map((p) => ({ role: 'assistant', content: p })),
      lead_data: {
        nome: lead.nome, empresa, segmento, cidade,
        origem: 'disparo_prospeccao', disparo_dia: hojeBR, disparo_em: new Date().toISOString(),
      },
    })
    await supabase.from('clientes').update({
      status: 'novo',
      temperatura: 'frio',
      observacoes: (lead.observacoes || '') + `\n[Disparo] 1ª mensagem enviada em ${sp.toLocaleString('pt-BR')}.`,
      atualizado_em: new Date().toISOString(),
    }).eq('id', lead.id)

    return Response.json({ ok: true, enviado: empresa, fone: phone, hoje: (count ?? 0) + 1, cap: DAILY_CAP })
  }

  return Response.json({ ok: true, skip: 'nenhum celular novo no lote' })
})
