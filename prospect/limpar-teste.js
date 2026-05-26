// ════════════════════════════════════════════════════════════════
//  Limpeza de leads de teste — Eleva Digital
//    node limpar-teste.js                      lista os candidatos
//    node limpar-teste.js --commit --ids "a,b" remove só os ids passados
// ════════════════════════════════════════════════════════════════
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true })

const args = process.argv.slice(2)
const COMMIT = args.includes('--commit')
const idsArg = (() => { const i = args.indexOf('--ids'); return i >= 0 ? args[i + 1] : '' })()
const IDS = idsArg.split(',').map(s => s.trim()).filter(Boolean)

const db = createClient(process.env.SB_URL, process.env.SB_KEY)
const dig = (s) => String(s || '').replace(/\D/g, '')

async function main() {
  // Tudo que NÃO é da prospecção em massa (status 'prospeccao') — testes ou reais.
  const { data: clientes, error } = await db.from('clientes')
    .select('id, nome, whatsapp, status, criado_em')
    .neq('status', 'prospeccao')
    .order('criado_em', { ascending: true })
  if (error) throw new Error('clientes: ' + error.message)

  const { data: convs } = await db.from('chatbot_conversations').select('phone, messages')
  const convByPhone = new Map((convs || []).map(c => [dig(c.phone), c]))

  if (!COMMIT) {
    console.log(`\n📋  Leads fora da prospecção em massa — ${clientes.length} encontrado(s):\n`)
    for (const c of clientes) {
      const conv = convByPhone.get(dig(c.whatsapp))
      const n = Array.isArray(conv?.messages) ? conv.messages.length : 0
      console.log(`  ${c.nome}`)
      console.log(`    id:  ${c.id}`)
      console.log(`    tel: ${c.whatsapp || '—'}  |  status: ${c.status}  |  conversa: ${conv ? n + ' msgs' : 'não'}`)
      console.log('')
    }
    console.log('💡  Preview — nada apagado. Remover: --commit --ids "id1,id2,..."\n')
    return
  }

  if (!IDS.length) { console.log('\n⚠️  Informe --ids "..." com os ids a remover.\n'); return }

  let cli = 0, cnv = 0
  for (const id of IDS) {
    const c = clientes.find(x => x.id === id)
    if (!c) { console.log(`  ? id ${id} não encontrado — pulado`); continue }
    const fone = dig(c.whatsapp)
    if (fone && convByPhone.has(fone)) {
      await db.from('chatbot_conversations').delete().eq('phone', convByPhone.get(fone).phone)
      cnv++
    }
    await db.from('clientes').delete().eq('id', id)
    cli++
    console.log(`  🗑️  ${c.nome} (${c.whatsapp || '—'}) removido`)
  }
  console.log(`\n✅  ${cli} cliente(s) + ${cnv} conversa(s) removidos.\n`)
}

main().catch(e => { console.error('\n❌ ', e.message, '\n'); process.exit(1) })
