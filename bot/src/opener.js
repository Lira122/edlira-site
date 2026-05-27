import axios from 'axios'

// ─── Gerador da 1ª mensagem de prospecção (persona: Lira, o dono) ──
const SYSTEM = `Você é o Lira, dono da Eleva Digital — uma agência de marketing digital de Taubaté (SP).
Você ajuda pequenos e médios negócios locais a atrair mais clientes pela internet: Google, Instagram e tráfego pago.

Escreva a PRIMEIRA conversa de WhatsApp para o dono de uma empresa local que nunca falou com você.
OBJETIVO: causar uma boa impressão e conseguir um "sim" para um diagnóstico gratuito de 20 minutos.

COMO ESCREVER — MUITO IMPORTANTE:
As pessoas têm preguiça de ler texto grande. Seja CURTO e direto ao ponto.
Mande de 2 a 3 mensagens curtinhas no total, uma embaixo da outra — NUNCA um texto grande e corrido.
Cada mensagem deve ter só 1 ou 2 frases curtas. Separe cada mensagem por UMA linha em branco.

A ORDEM DAS MENSAGENS (uma ideia por mensagem):
1. Saudação + quem você é, numa frase só: comece com a saudação informada (Bom dia / Boa tarde /
   Boa noite) e diga que é o Lira, da Eleva Digital — agência de marketing digital de Taubaté.
2. O convite, numa frase só: ofereça um diagnóstico gratuito de 20 minutos, sem compromisso, para
   ajudar a [empresa] a atrair mais clientes pela internet.
3. Uma pergunta curta pra marcar, com saída leve ("se não for um bom momento, sem problema 😊").

TOM: caloroso, educado, empático, humano. Nada de vendedor agressivo. Nunca aponte defeito do negócio.
No máximo 1 emoji no total. Português do Brasil. Cite a empresa pelo nome. Varie a redação.
Responda SOMENTE com as mensagens, cada uma separada por UMA linha em branco. Não numere as mensagens.`

export async function gerarOpener({ empresa, segmento, cidade, saudacao }) {
  const userMsg = `Empresa: ${empresa}
Segmento: ${segmento || 'comércio local'}
Cidade: ${cidade || 'região do Vale do Paraíba'}
Saudação a usar: ${saudacao || 'Olá'}

Escreva a mensagem de WhatsApp — calorosa, educada e empática.`

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: userMsg },
    ],
    temperature: 0.9,
    max_tokens: 180,
  }

  // Groq primeiro (rápido)
  try {
    const { data } = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      payload,
      { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` }, timeout: 12000 }
    )
    return limpar(data.choices[0].message.content)
  } catch (err) {
    console.warn('[OPENER] Groq falhou, tentando OpenRouter...', err.message)
  }

  // Fallback OpenRouter
  const { data } = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    { ...payload, model: 'meta-llama/llama-3.1-70b-instruct' },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://elevabrands.com.br',
        'X-Title': 'Eleva Digital Disparo',
      },
      timeout: 18000,
    }
  )
  return limpar(data.choices[0].message.content)
}

// ─── Gerador da mensagem de FOLLOW-UP (quem não respondeu o 1º disparo) ──
const SYSTEM_FU = `Você é o Lira, dono da Eleva Digital — agência de marketing digital de Taubaté (SP).
Você já mandou UMA mensagem no WhatsApp dessa empresa há alguns dias, oferecendo um diagnóstico
gratuito, e não teve resposta. Escreva uma mensagem de FOLLOW-UP.

REGRAS:
- Curtíssima: 2 a 3 frases curtas.
- Leve, sem cobrança e sem culpa — tom de "passando pra lembrar".
- NÃO repita a primeira mensagem; traga o valor por um ângulo novo.
- Termine com uma pergunta fácil de responder.
- No máximo 1 emoji. Português do Brasil, informal.
- Se for a 2ª tentativa, seja ainda mais leve e diga que é a última vez que toca no assunto.
- Responda SOMENTE com o texto da mensagem.`

export async function gerarFollowup({ empresa, cidade, tentativa = 1 }) {
  const userMsg = `Empresa: ${empresa}
Cidade: ${cidade || 'região do Vale do Paraíba'}
Tentativa de follow-up: nº ${tentativa} (de no máximo 2).

Escreva a mensagem de follow-up.`

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_FU },
      { role: 'user', content: userMsg },
    ],
    temperature: 0.95,
    max_tokens: 200,
  }

  try {
    const { data } = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      payload,
      { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` }, timeout: 12000 }
    )
    return limpar(data.choices[0].message.content)
  } catch (err) {
    console.warn('[FOLLOWUP] Groq falhou, tentando OpenRouter...', err.message)
  }

  const { data } = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    { ...payload, model: 'meta-llama/llama-3.1-70b-instruct' },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://elevabrands.com.br',
        'X-Title': 'Eleva Digital Disparo',
      },
      timeout: 18000,
    }
  )
  return limpar(data.choices[0].message.content)
}

function limpar(txt) {
  return String(txt).trim().replace(/^["']+|["']+$/g, '').trim()
}
