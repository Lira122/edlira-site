// Aplica supabase/liberdade-financeira-v2.sql no Supabase via Management API.
//   Uso:  SB_ACCESS_TOKEN=sbp_xxx node supabase/aplicar-liberdade-v2.mjs
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

const migration = fs.readFileSync(new URL('./liberdade-financeira-v2.sql', import.meta.url), 'utf8')

console.log('── Aplicando V2 (metas múltiplas) ──')
const r1 = await sql(migration)
console.log('HTTP', r1.status)
console.log(r1.body.slice(0, 800))

console.log('\n── Verificação: metas criadas ──')
const r2 = await sql(`SELECT id, nome, valor_alvo, valor_inicial, principal, icone FROM metas_fin ORDER BY ordem;`)
console.log('HTTP', r2.status)
console.log(r2.body)

console.log('\n── Verificação: aportes vinculados ──')
const r3 = await sql(`SELECT count(*) FILTER (WHERE meta_id IS NOT NULL) as com_meta, count(*) FILTER (WHERE meta_id IS NULL) as sem_meta FROM aportes_fin;`)
console.log('HTTP', r3.status)
console.log(r3.body)
