import axios from 'axios'

const SPIN_SYSTEM = `Você é Sofia, assistente de vendas da Eleva Digital — agência de marketing digital especializada em tráfego pago, IA e automações para pequenas e médias empresas.

Seu objetivo é conduzir uma conversa natural usando o método SPIN Selling para agendar uma reunião de diagnóstico gratuita com o dono/gestor da empresa.

CONTEXTO DE ABERTURA: Em alguns casos a conversa já foi iniciada por uma mensagem pessoal do Lira (o dono da Eleva Digital), oferecendo o diagnóstico gratuito. Se for esse o caso, na sua PRIMEIRA resposta deixe claro de forma leve e natural que você é a Sofia, assistente do Lira, que vai ajudar a organizar o diagnóstico. Continue a conversa a partir do que o lead respondeu, sem reapresentar a empresa do zero.

MÉTODO SPIN:
1. Situação — entenda o contexto atual do negócio (faturamento, equipe, como captam clientes hoje)
2. Problema — descubra as dores e frustrações (leads não convertendo, CAC alto, falta de tempo, dependência de indicação)
3. Implicação — amplifique o impacto do problema (quanto custa não resolver isso? O que acontece se continuar assim?)
4. Necessidade — faça o lead concluir sozinho que precisa de ajuda ("então você precisaria de algo que...")

REGRAS ABSOLUTAS:
- Nunca envie mais de 2 parágrafos curtos por mensagem
- Nunca use linguagem corporativa ou robótica
- Faça UMA pergunta por vez, nunca bombardeie
- Use emojis com moderação (1–2 por mensagem, apenas se natural)
- Se a pessoa disser que não é o momento, aceite com leveza e diga que pode voltar quando quiser
- Se a pessoa perguntar preço, diga que depende do diagnóstico e convide para a reunião
- Só proponha a reunião depois de identificar pelo menos UMA dor clara
- Fale como brasileiro, informal mas profissional

TEMPERATURA DA CONVERSA (campo temperatura):
- quente: pessoa engajada, respondendo rápido, interesse alto — empurre para fechar a reunião
- morno: interesse moderado, respostas curtas — entregue valor, faça perguntas de implicação
- frio: respostas genéricas ou demoradas — abordagem leve, reabra o diálogo com curiosidade
- gelado: sumiu ou disse que não quer — reengajamento com ângulo diferente

OBJETIVO FINAL: Conseguir que o lead diga "sim" para uma reunião de diagnóstico (call de 30 min no Google Meet).`

export async function generateReply(messages, lead = {}) {
  const systemMsg = SPIN_SYSTEM + (lead.temperatura
    ? `\n\nTemperatura atual da conversa: ${lead.temperatura}. Adapte seu tom.`
    : '')

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemMsg },
      ...messages.slice(-12), // janela de contexto de 12 mensagens
    ],
    temperature: 0.75,
    max_tokens: 300,
  }

  // Tenta Groq primeiro (mais rápido)
  try {
    const { data } = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      payload,
      { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` }, timeout: 10000 }
    )
    return data.choices[0].message.content.trim()
  } catch (err) {
    console.warn('[AI] Groq failed, trying OpenRouter...', err.message)
  }

  // Fallback: OpenRouter
  const { data } = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    { ...payload, model: 'meta-llama/llama-3.1-70b-instruct' },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://elevabrands.com.br',
        'X-Title': 'Sofia Bot',
      },
      timeout: 15000,
    }
  )
  return data.choices[0].message.content.trim()
}

// Analisa a última mensagem e retorna a nova temperatura
export async function detectTemperature(lastMessages, currentTemp) {
  const prompt = `Analise estas mensagens de WhatsApp de um prospect e classifique a temperatura da conversa.

Mensagens recentes:
${lastMessages.map(m => `${m.role === 'user' ? 'PROSPECT' : 'SOFIA'}: ${m.content}`).join('\n')}

Temperatura atual: ${currentTemp || 'não definida'}

Classifique APENAS com uma palavra: quente, morno, frio ou gelado.

Critérios:
- quente: respondendo rápido, fazendo perguntas, demonstrando interesse real
- morno: respondendo mas com cautela, interesse moderado
- frio: respostas curtas, demoradas ou genéricas
- gelado: sumiu, disse "não tenho interesse" ou "não é o momento"`

  try {
    const { data } = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant', // fast model for classification
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 10,
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` }, timeout: 8000 }
    )
    const raw = data.choices[0].message.content.toLowerCase().trim()
    const temps = ['quente', 'morno', 'frio', 'gelado']
    return temps.find(t => raw.includes(t)) || currentTemp || 'frio'
  } catch {
    return currentTemp || 'frio'
  }
}

// Detecta se o prospect disse "não é o momento / me liga depois / etc."
export async function detectPauseIntent(message) {
  const triggers = [
    'não é o momento', 'nao e o momento', 'não tenho tempo', 'nao tenho tempo',
    'depois', 'outro momento', 'semana que vem', 'mês que vem', 'mes que vem',
    'agora não', 'agora nao', 'não quero', 'nao quero', 'não preciso', 'nao preciso',
    'tô bem', 'to bem', 'tô ocupado', 'to ocupado', 'volto', 'te chamo',
  ]
  const low = message.toLowerCase()
  return triggers.some(t => low.includes(t))
}

// Detecta pedido EXPLÍCITO de não receber mais contato (opt-out / LGPD).
// Diferente da pausa: aqui o lead é encerrado de vez, não volta em 7 dias.
export function isOptOut(message) {
  const t = (message || '').toLowerCase()
  return /(pare de me (mandar|enviar)|n[ãa]o me (mande|envie|manda)( mais)?|me (tira|tire|remova|remove)\b.*\b(lista|daqui|disso)|descadastr|sair da lista|n[ãa]o quero receber|n[ãa]o autorizo|isso [ée] spam|vou denunciar|me deixa em paz|n[ãa]o me perturbe)/.test(t)
}

// Extrai nome do prospect da conversa
export async function extractName(messages) {
  try {
    const conv = messages.slice(0, 4).map(m => `${m.role === 'user' ? 'PROSPECT' : 'SOFIA'}: ${m.content}`).join('\n')
    const { data } = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant', // fast model for classification
        messages: [{
          role: 'user',
          content: `Extraia APENAS o primeiro nome do prospect nesta conversa. Se não souber, responda "Desconhecido".\n\n${conv}`,
        }],
        temperature: 0,
        max_tokens: 10,
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` }, timeout: 6000 }
    )
    const name = data.choices[0].message.content.trim().split(' ')[0]
    return name.length < 30 ? name : 'Desconhecido'
  } catch {
    return 'Desconhecido'
  }
}
