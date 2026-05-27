// Ativa o agente e dispara 1 lead na hora pra validar.
const token = process.env.SB_ACCESS_TOKEN
const ref   = 'flzpblpegoqjxaacjvhf'
if (!token) { console.error('Falta SB_ACCESS_TOKEN'); process.exit(1) }

async function sql(q) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q }),
  })
  return { status: res.status, body: await res.text() }
}

// 1. Ativa todos os agentes do canal WhatsApp
const a = await sql(`UPDATE agentes SET status='ativo' WHERE canal ILIKE '%whats%' RETURNING id, nome, status;`)
console.log('── Ativando agente ──')
console.log('HTTP', a.status, a.body)

// 2. Dispara manualmente
console.log('\n── Trigger manual do disparo ──')
const r = await fetch(`https://${ref}.supabase.co/functions/v1/disparo`, { method: 'POST' })
console.log('HTTP', r.status, await r.text())
