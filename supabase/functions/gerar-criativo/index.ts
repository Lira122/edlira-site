const HF_TOKEN  = Deno.env.get('HIGGSFIELD_TOKEN')!
const HF_BASE   = 'https://api.higgsfield.ai/v1'

const HEADERS = {
  'Authorization': `Bearer ${HF_TOKEN}`,
  'Content-Type': 'application/json',
}

// Modelos disponíveis por tipo
const MODELOS: Record<string, string> = {
  'ad':        'marketing_studio_image',
  'produto':   'nano_banana_2',
  'cinematic': 'cinematic_studio_2_5',
  'carrossel': 'nano_banana_2',
  'auto':      'image_auto',
}

async function criarJob(model: string, prompt: string, ratio = '1:1'): Promise<string[]> {
  const res = await fetch(`${HF_BASE}/generate`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      job_set_type: model,
      params: {
        prompt,
        aspect_ratio: ratio,
        batch_size: 1,
        resolution: '1k',
      }
    })
  })
  if (!res.ok) throw new Error(`Higgsfield create error: ${await res.text()}`)
  return res.json()
}

async function aguardarJob(jobId: string, tentativas = 30): Promise<Record<string, unknown>> {
  for (let i = 0; i < tentativas; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const res = await fetch(`${HF_BASE}/generate/${jobId}`, { headers: HEADERS })
    if (!res.ok) throw new Error(`Higgsfield poll error: ${await res.text()}`)
    const job = await res.json() as Record<string, unknown>
    if (job.status === 'completed') return job
    if (job.status === 'failed')    throw new Error(`Job falhou: ${JSON.stringify(job)}`)
  }
  throw new Error('Timeout aguardando geração')
}

function buildPrompt(tipo: string, dados: Record<string, string>): string {
  const { cliente, segmento, servico, headline, cta, estilo } = dados
  const agencia = 'Eleva Digital, agência de marketing digital com IA e tráfego pago'

  const prompts: Record<string, string> = {
    ad: `Professional digital marketing advertisement for ${cliente || 'a business'}${segmento ? `, ${segmento} industry` : ''}. Service: ${servico || 'digital marketing with AI'}. Headline: "${headline || 'Scale your business with AI'}". CTA: "${cta || 'Talk to us'}". Style: ${estilo || 'modern, dark background, neon green accent (#C5F82A), clean typography, high-end agency aesthetic'}. Ultra realistic, 4K quality, professional ad layout.`,

    produto: `High-end product photography for ${cliente || 'a brand'} in ${segmento || 'digital marketing'}. Product: ${servico || 'marketing services'}. ${estilo || 'Clean white studio background, dramatic lighting, premium brand feeling, minimalist composition'}. Commercial photography quality.`,

    carrossel: `Social media carousel slide for ${cliente || 'a business'}. Topic: ${servico || 'digital marketing results'}. Content: "${headline || 'How we 3x your ROAS in 90 days'}". ${estilo || 'Bold typography, dark background, green accent color, modern design, Instagram carousel style'}. Clean, engaging, professional.`,

    cinematic: `Cinematic brand video thumbnail for ${cliente || 'a brand'}. ${headline || 'Transform your marketing with AI'}. ${estilo || 'Cinematic lighting, dramatic colors, high contrast, premium brand feel, dark moody atmosphere'}. Ultra HD, professional cinematography.`,

    auto: `Marketing visual for ${cliente || 'business'}${segmento ? ` in ${segmento}` : ''}. ${headline || servico || 'digital marketing'}. ${estilo || 'Professional, modern, high quality'}.`,
  }

  return prompts[tipo] || prompts.auto
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  try {
    const body = await req.json() as {
      tipo?: string        // 'ad' | 'produto' | 'carrossel' | 'cinematic' | 'auto'
      ratio?: string       // '1:1' | '16:9' | '9:16' | '4:5'
      cliente?: string
      segmento?: string
      servico?: string
      headline?: string
      cta?: string
      estilo?: string
      prompt?: string      // prompt customizado (opcional)
    }

    const tipo   = body.tipo   || 'ad'
    const ratio  = body.ratio  || (tipo === 'carrossel' ? '4:5' : '1:1')
    const model  = MODELOS[tipo] || MODELOS.auto
    const prompt = body.prompt || buildPrompt(tipo, {
      cliente:  body.cliente  || '',
      segmento: body.segmento || '',
      servico:  body.servico  || '',
      headline: body.headline || '',
      cta:      body.cta      || '',
      estilo:   body.estilo   || '',
    })

    console.log(`[CRIATIVO] tipo=${tipo} model=${model} ratio=${ratio}`)
    console.log(`[CRIATIVO] prompt: ${prompt.slice(0, 100)}...`)

    // Cria job
    const jobIds = await criarJob(model, prompt, ratio)
    const jobId  = jobIds[0]
    console.log(`[CRIATIVO] Job criado: ${jobId}`)

    // Aguarda resultado
    const resultado = await aguardarJob(jobId)
    const url = resultado.result_url as string

    console.log(`[CRIATIVO] ✅ Gerado: ${url}`)

    return new Response(JSON.stringify({
      ok: true,
      url,
      jobId,
      model,
      prompt: prompt.slice(0, 200),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (err) {
    console.error('[CRIATIVO] Erro:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
