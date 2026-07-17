import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envText = fs.readFileSync(path.join(__dirname, '..', 'bot', '.env'), 'utf8')
const m = envText.match(/^SB_KEY=(.+)$/m)
const sb = createClient('https://flzpblpegoqjxaacjvhf.supabase.co', m[1].trim())

// supabase-js nao roda DDL, mas nao precisa: uso a REST API do Supabase
// pra rodar SQL via /rest/v1/rpc/exec_sql (se existir) ou tento uma escrita
// direta. O jeito certo aqui e' via CLI ou dashboard. Como CLI esta deslogado,
// checo se a tabela existe: se der erro 42P01, mando SQL pro user rodar.

const { error } = await sb.from('teleprompter_scripts').select('id').limit(1)
if (!error) {
  console.log('Tabela teleprompter_scripts ja existe.')
} else if (error.code === '42P01' || /does not exist/.test(error.message)) {
  const sql = fs.readFileSync(path.join(__dirname, 'teleprompter-schema.sql'), 'utf8')
  console.log('\n==== RODE ESSE SQL NO SQL EDITOR ====\n')
  console.log(sql)
  console.log('\n=====================================\n')
} else {
  console.error('Erro inesperado:', error)
}
