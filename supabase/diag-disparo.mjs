// Diagnóstico do disparo. Roda SELECTs no Supabase via Management API.
// Uso: SB_ACCESS_TOKEN=sbp_xxx node supabase/diag-disparo.mjs
const token = process.env.SB_ACCESS_TOKEN
const ref   = 'flzpblpegoqjxaacjvhf'
if (!token) { console.error('Falta SB_ACCESS_TOKEN'); process.exit(1) }

async function q(sql, label) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const txt = await res.text()
  console.log(`\n── ${label} (HTTP ${res.status}) ──`)
  try { console.log(JSON.stringify(JSON.parse(txt), null, 2)) }
  catch { console.log(txt.slice(0, 1000)) }
}

const hojeBR = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

await q(`SELECT now() AT TIME ZONE 'America/Sao_Paulo' AS agora_br;`, '1) Hora atual em Brasília')
await q(`SELECT jobname, schedule, active, last_run_started_at FROM cron.job WHERE jobname IN ('edlira-disparo','sofia-followup');`, '2) Cron jobs')
await q(`SELECT id, nome, status, canal FROM agentes ORDER BY criado_em;`, '3) Agentes (liga/desliga)')
await q(`SELECT count(*) AS pool FROM clientes WHERE status='prospeccao' AND whatsapp IS NOT NULL;`, '4) Pool de prospecção')
await q(`SELECT count(*) AS disparos_hoje FROM chatbot_conversations WHERE lead_data->>'origem' = 'disparo_prospeccao' AND lead_data->>'disparo_dia' = '${hojeBR}';`, `5) Disparos hoje (${hojeBR})`)
await q(`SELECT count(*) AS total_disparos FROM chatbot_conversations WHERE lead_data->>'origem' = 'disparo_prospeccao';`, '6) Total de disparos já feitos')
await q(`SELECT start_time, status, return_message FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname='edlira-disparo') ORDER BY start_time DESC LIMIT 8;`, '7) Últimas execuções do cron de disparo')
