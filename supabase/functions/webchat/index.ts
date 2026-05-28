import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
}

const SYSTEM_PROMPT = `Você é o Lira, fundador da Eleva Digital, agência especializada em IA aplicada ao marketing e tráfego pago. Você conversa pessoalmente com o visitante, sempre na primeira pessoa. Nunca diga que é assistente ou robô.

O usuário está no site da Eleva Digital e iniciou uma conversa. Seu objetivo é qualificar esse visitante e convencê-lo a agendar uma reunião gratuita de 60 minutos com você.

## SOBRE A ELEVA DIGITAL
- Gerenciamos Meta Ads, TikTok Ads e Google Ads com IA
- Rastreamento avançado de onde vem cada cliente e cada real investido
- Clientes aumentam em média 3x o ROAS nos primeiros 90 dias
- Empresas que faturam R$30k+/mês e querem crescer sistematicamente

## REGRA MAIS IMPORTANTE: NUNCA FALE PREÇO
Se perguntarem sobre preço, valor, pacote ou mensalidade:
→ Diga que varia conforme o diagnóstico de cada empresa
→ Convide para a reunião gratuita
→ Nunca dê nenhum valor ou estimativa

## FLUXO DA CONVERSA (máx 6 trocas no total)
Seja objetivo e breve, o usuário tem preguiça de ler texto grande. Cada mensagem sua deve ter no máximo 1 ou 2 frases curtas.

1. Boas-vindas calorosas + pergunta sobre o negócio (1 troca)
2. Identifique a dor principal (1-2 trocas)
3. Apresente brevemente como a Eleva Digital resolve (1 troca)
4. Convide para reunião gratuita (1 troca)
5. Capture o WhatsApp para continuar (última troca obrigatória)

## CAPTURA DO WHATSAPP
Quando o lead demonstrar interesse ou você chegar na troca 5:
- Peça o número de WhatsApp naturalmente: "Me passa seu WhatsApp que eu te chamo por lá pra agendar."
- Quando o usuário enviar o número, retorne whatsapp_captured: true no JSON

## REGRAS
1. Máximo 1 ou 2 frases curtas por mensagem, seja breve, sem encher de texto
2. Uma pergunta por vez
3. NUNCA use emojis
4. Tom leve, direto e natural. Escreva como você fala, sem bullet points
5. Não mencione o método SPIN
6. Se o lead não tiver interesse, agradeça e encerre gentilmente
7. Se o visitante perguntar se você é um robô/IA ou disser que percebeu que é automático: não negue de forma robótica. Assuma com leveza que o atendimento inicial usa IA pra agilizar, mas que quem cuida de tudo é você mesmo, o Lira, e convide pra conversar ao vivo na reunião
8. NUNCA use travessões (— ou –) nem hífens compridos como pausa. Use vírgula, ponto, ponto e vírgula ou dois-pontos. Travessão denuncia texto de IA
9. Se o visitante disser que FECHOU o negócio, encerrou as atividades, vendeu a empresa, está aposentado ou fora do mercado: agradeça com gentileza em UMA frase, deseje sucesso e encerre. Não insista, não pergunte sobre outros projetos, novos negócios, indicação. Marque stage como "encerrado"

## RETORNO
Sempre retorne APENAS JSON válido:
{
  "message": "sua resposta aqui (1-2 frases)",
  "stage": "inicio|qualificando|proposta|captura|encerrado",
  "whatsapp_captured": false,
  "whatsapp": "",
  "lead_data": {
    "nome": "",
    "empresa": "",
    "segmento": "",
    "dor_principal": "",
    "interesse": "alto|medio|baixo|indefinido"
  }
}`

async function loadKnowledge(): Promise<string> {
  const { data } = await supabase
    .from('conhecimentos')
    .select('titulo, conteudo')
    .eq('ativo', true)
    .order('criado_em', { ascending: true })

  if (!data?.length) return ''
  return '\n\n## CONHECIMENTOS ADICIONAIS\n' +
    data.map(k => `### ${k.titulo}\n${k.conteudo}`).join('\n\n')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  let body: { session_id: string; message: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: CORS })
  }

  const { session_id, message } = body
  if (!session_id || !message) {
    return new Response(JSON.stringify({ error: 'session_id e message são obrigatórios' }), { status: 400, headers: CORS })
  }

  // Carrega histórico da sessão
  const { data: session } = await supabase
    .from('webchat_sessions')
    .select('*')
    .eq('session_id', session_id)
    .single()

  const history = (session?.messages || []) as Array<{ role: string; content: string }>
  const stage   = (session?.stage || 'inicio') as string

  const knowledge = await loadKnowledge()
  const systemFull = SYSTEM_PROMPT + knowledge

  const aiMessages = [
    { role: 'system', content: systemFull },
    ...history.slice(-10),
    { role: 'user', content: `[Estágio: ${stage}]\nVisitante: ${message}` }
  ]

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://elevabrands.com.br',
      'X-Title': 'Eleva Digital Webchat'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4.5',
      max_tokens: 256,
      temperature: 0.7,
      messages: aiMessages
    })
  })

  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const rawText = json.choices?.[0]?.message?.content || ''

  let parsed: {
    message: string
    stage: string
    whatsapp_captured: boolean
    whatsapp: string
    lead_data: Record<string, unknown>
  }

  try {
    const clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(match![0])
  } catch {
    console.error('[Webchat] Parse fail:', rawText)
    parsed = {
      message: 'Desculpe, pode repetir?',
      stage,
      whatsapp_captured: false,
      whatsapp: '',
      lead_data: {}
    }
  }

  // Atualiza histórico
  const updatedMessages = [
    ...history,
    { role: 'user', content: message },
    { role: 'assistant', content: parsed.message }
  ]

  await supabase.from('webchat_sessions').upsert({
    session_id,
    stage: parsed.stage || stage,
    messages: updatedMessages.slice(-20),
    lead_data: { ...(session?.lead_data || {}), ...parsed.lead_data },
    updated_at: new Date().toISOString()
  }, { onConflict: 'session_id' })

  // Se capturou WhatsApp, salva no CRM e dispara Sofia no WhatsApp
  if (parsed.whatsapp_captured && parsed.whatsapp) {
    const phone = parsed.whatsapp.replace(/\D/g, '').replace(/^0/, '')
    const normalizedPhone = phone.startsWith('55') ? phone : '55' + phone

    if (normalizedPhone.length >= 12) {
      const ld = { ...(session?.lead_data || {}), ...parsed.lead_data }

      // Salva no CRM
      await supabase.from('clientes').upsert({
        nome:     ld.nome     || 'Lead Webchat',
        empresa:  ld.empresa  || '',
        whatsapp: normalizedPhone,
        servico:  'Marketing IA + Tráfego Pago',
        status:   'lead_novo',
        observacoes: [
          ld.segmento      ? `Segmento: ${ld.segmento}`         : '',
          ld.dor_principal ? `Dor: ${ld.dor_principal}`         : '',
          `Interesse: ${ld.interesse || 'indefinido'}`,
          'Origem: webchat site'
        ].filter(Boolean).join(' | ')
      }, { onConflict: 'whatsapp' })

      // Cria conversa e dispara Sofia no WhatsApp via form-lead
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/form-lead`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            name:    ld.nome    || 'Lead Webchat',
            company: ld.empresa || '',
            whatsapp: normalizedPhone,
            segment: ld.segmento || ''
          })
        }
      )

      console.log(`[Webchat] WhatsApp capturado: ${normalizedPhone}`)
    }
  }

  return new Response(JSON.stringify({
    message: parsed.message,
    stage: parsed.stage,
    whatsapp_captured: parsed.whatsapp_captured || false
  }), { headers: CORS })
})
