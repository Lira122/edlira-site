// Aplica supabase/caixinhas.sql no Supabase via Management API.
//   Uso:  SB_ACCESS_TOKEN=sbp_xxx node supabase/aplicar-caixinhas.mjs
import fs from 'node:fs'

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

const migration = fs.readFileSync(new URL('./caixinhas.sql', import.meta.url), 'utf8')

console.log('── Aplicando schema caixinhas ──')
const r1 = await sql(migration)
console.log('HTTP', r1.status); console.log(r1.body.slice(0, 600))

console.log('\n── Verificação: tabelas criadas ──')
const r2 = await sql(`SELECT table_name FROM information_schema.tables
                      WHERE table_schema='public' AND table_name IN ('caixinhas','caixinhas_mov')
                      ORDER BY table_name;`)
console.log('HTTP', r2.status); console.log(r2.body)
