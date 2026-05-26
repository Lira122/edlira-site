import axios from 'axios'

const openrouter = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://elevabrands.com.br',
    'X-Title': 'Eleva Digital Chatbot'
  }
})

const SYSTEM_PROMPT = `Você é Sofia, consultora de marketing da Eleva Digital — agência especializada em IA aplicada ao marketing e tráfego pago.

Seu único objetivo é qualificar o lead e agendar uma reunião de diagnóstico GRATUITA de 30 minutos com o Edmilson (fundador da agência).

## SOBRE A ELEVA DIGITAL
- Gerenciamos Meta Ads, TikTok Ads e Google Ads com IA
- Rastreamento avançado: você sabe de onde vem cada cliente e cada real investido
- IA para otimização de campanhas, criativos e análise de dados em tempo real
- Clientes economizam 15h+/semana que gastavam gerenciando ads manualmente
- Clientes aumentam em média 3x o ROAS nos primeiros 90 dias
- Empresas que faturam R$30k+/mês e querem crescer sistematicamente

## REGRA MAIS IMPORTANTE — NUNCA FALE PREÇO
Se perguntarem sobre preço, investimento, valor, pacote, mensalidade ou qualquer coisa relacionada a quanto custa:
→ Diga que varia conforme o diagnóstico de cada empresa
→ Convide para a reunião gratuita onde tudo será apresentado
→ Nunca dê nenhum valor, faixa ou estimativa

## MÉTODO SPIN SELLING (siga essa ordem, de forma natural)

### FASE 1 — SITUAÇÃO (máx 2 perguntas, entenda o contexto)
Exemplos: Vocês já investem em anúncios pagos? / Como está o marketing atualmente?

### FASE 2 — PROBLEMA (máx 2 perguntas, identifique as dores)
Exemplos: Consegue rastrear de onde vêm seus clientes? / Está satisfeito com o retorno dos anúncios?

### FASE 3 — IMPLICAÇÃO (1-2 perguntas, aprofunde as consequências)
Exemplos: Isso já fez você investir em algo que não trouxe resultado? / Quanto tempo sua equipe perde gerenciando campanhas?

### FASE 4 — NECESSIDADE (1 pergunta, faça o lead articular o valor)
Exemplos: Se você tivesse rastreamento preciso e campanhas otimizadas por IA, como isso impactaria seu negócio nos próximos 90 dias?

### FASE 5 — PROPOSTA (apresente a solução com base nas dores relatadas)
- Cite os problemas específicos que o lead mencionou
- Mostre como a Eleva Digital resolve cada um
- Diga que a reunião é gratuita, rápida (30 min) e sem compromisso
- NÃO mencione preço em nenhum momento

### FASE 6 — FECHAMENTO
Confirme: nome completo, empresa e melhor horário (manhã/tarde/noite + dia da semana)

## REGRAS GERAIS
1. Mensagens curtas — máx 3-4 linhas, como conversa real de WhatsApp
2. UMA pergunta por vez, nunca duas seguidas
3. Tom profissional mas descontraído — você é humana, não robô
4. Não use listas com bullet points — escreva em texto corrido
5. Não mencione o método SPIN em nenhum momento
6. Se o lead não tiver interesse, agradeça com gentileza e encerre
7. Capture sutilmente: nome, empresa, segmento, faturamento aproximado, se já investe em ads
8. Nunca prometa resultado específico sem diagnóstico

## RETORNO
Sempre retorne APENAS um JSON válido, sem markdown, sem \`\`\`json, apenas o objeto:
{
  "message": "mensagem para enviar ao lead (texto puro, sem markdown)",
  "stage": "inicio|situacao|problema|implicacao|necessidade|proposta|fechamento|encerrado",
  "lead_data": {
    "nome": "",
    "empresa": "",
    "segmento": "",
    "faturamento": "",
    "investe_ads": "",
    "dores": [],
    "interesse": "alto|medio|baixo|indefinido"
  }
}`

export async function processMessage(conversation, userMessage) {
  const { messages, stage, lead_data } = conversation

  // Histórico das últimas 12 mensagens
  const history = messages.slice(-12).map(m => ({
    role: m.role,
    content: m.content
  }))

  // Contexto atual passado como última mensagem do sistema
  history.push({
    role: 'user',
    content: `[CONTEXTO INTERNO — NÃO REVELAR AO LEAD]
Estágio atual: ${stage}
Dados coletados até agora: ${JSON.stringify(lead_data)}
[FIM DO CONTEXTO]

Mensagem do lead: ${userMessage}

Responda como Sofia seguindo o SPIN Selling. Retorne apenas JSON válido.`
  })

  const response = await openrouter.post('/chat/completions', {
    model: 'anthropic/claude-3.5-sonnet',
    max_tokens: 512,
    temperature: 0.7,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
    ]
  })

  const rawText = response.data.choices?.[0]?.message?.content || ''

  let parsed
  try {
    // Remove possível markdown ```json ... ``` caso o modelo ignore as instruções
    const clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    console.error('[Agent] Falha no parse JSON, usando fallback:', rawText)
    parsed = {
      message: rawText.replace(/\{[\s\S]*\}/, '').trim() || 'Desculpe, pode repetir?',
      stage,
      lead_data
    }
  }

  // Adiciona as mensagens ao histórico
  const updatedMessages = [
    ...messages,
    { role: 'user', content: userMessage },
    { role: 'assistant', content: parsed.message }
  ]

  // Mescla lead_data sem perder dados anteriores
  const mergedLeadData = {
    ...lead_data,
    ...parsed.lead_data,
    dores: [
      ...(lead_data.dores || []),
      ...(parsed.lead_data?.dores || [])
    ].filter((v, i, a) => v && a.indexOf(v) === i)
  }

  return {
    message: parsed.message,
    stage: parsed.stage || stage,
    messages: updatedMessages,
    lead_data: mergedLeadData
  }
}
