// Aplica supabase/contrato-fields.sql no Supabase via Management API.
//   Uso:  SB_ACCESS_TOKEN=sbp_xxx node supabase/aplicar-contrato-fields.mjs
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

const migration = fs.readFileSync(new URL('./contrato-fields.sql', import.meta.url), 'utf8')

console.log('── Aplicando ALTER TABLE clientes ──')
const r1 = await sql(migration)
console.log('HTTP', r1.status)
console.log(r1.body.slice(0, 500))

console.log('\n── Verificação: colunas novas ──')
const r2 = await sql(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'clientes'
    AND column_name IN ('razao_social','cnpj','endereco','representante','valor_midia','dia_vencimento')
  ORDER BY column_name;
`)
console.log('HTTP', r2.status)
console.log(r2.body)
