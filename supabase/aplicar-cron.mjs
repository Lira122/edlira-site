// Aplica o disparo-cron.sql no Supabase via Management API.
//   Uso:  SB_ACCESS_TOKEN=sbp_xxx node supabase/aplicar-cron.mjs
import fs from 'node:fs'

const token = process.env.SB_ACCESS_TOKEN
const ref = 'flzpblpegoqjxaacjvhf'
if (!token) { console.error('Falta SB_ACCESS_TOKEN'); process.exit(1) }

async function runSQL(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  return { status: res.status, txt: await res.text() }
}

const sql = fs.readFileSync(new URL('./disparo-cron.sql', import.meta.url), 'utf8')

const r1 = await runSQL(sql)
console.log('Aplicar agendamento — HTTP', r1.status)
console.log(r1.txt.slice(0, 600))

const r2 = await runSQL("select jobname, schedule, active from cron.job where jobname = 'edlira-disparo';")
console.log('\nVerificacao do cron — HTTP', r2.status)
console.log(r2.txt.slice(0, 600))
