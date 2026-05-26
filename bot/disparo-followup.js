// ════════════════════════════════════════════════════════════════
//  Follow-up de prospecção — Eleva Digital
//  Reenvia para quem recebeu o 1º disparo e NÃO respondeu.
//  Quem respondeu já está com a Sofia — não recebe follow-up.
//
//  Uso:
//    node disparo-followup.js              preview (não envia)
//    node disparo-followup.js --send       envia de verdade
//    node disparo-followup.js --send --max 15
//
//  Rode a cada 2-3 dias, depois do disparo do dia.
// ════════════════════════════════════════════════════════════════
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { sendText } from './src/whatsapp.js'
import { gerarFollowup } from './src/opener.js'

const db = createClient(process.env.SB_URL, process.env.SB_KEY)

const args = process.argv.slice(2)
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null }
const ENVIAR = args.includes('--send')
const FORCE = args.includes('--force')
const MAX = Number(flag('--max')) || 20

const ESPERA_DIAS = 2     // só faz follow-up após 2 dias sem resposta
const MAX_FOLLOWUPS = 2   // no máximo 2 follow-ups por lead

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a))

function horarioComercial() {
  const d = new Date()
  return d.getDay() >= 1 && d.getDay() <= 6 && d.getHours() >= 8 && d.getHours() < 19
}

async function main() {
  console.log('\n🔁  Follow-up de prospecção — Eleva Digital')
  console.log(`    Modo: ${ENVIAR ? '🔴 ENVIANDO' : '🟡 preview (não envia)'}  |  Limite: ${MAX}\n`)

  if (ENVIAR && !horarioComercial() && !FORCE) {
    console.log('⏰  Fora do horário comercial (seg-sáb, 8h-19h). Use --force se for proposital.\n')
    return
  }

  // Conversas que começaram pela prospecção ativa
  const { data: convs, error } = await db
    .from('chatbot_conversations')
    .select('phone, messages, lead_data, updated_at, stage')
    .eq('lead_data->>origem', 'disparo_prospeccao')
  if (error) throw new Error('Erro ao ler conversas: ' + error.message)

  const limite = Date.now() - ESPERA_DIAS * 24 * 60 * 60 * 1000
  const candidatos = []

  for (const c of convs || []) {
    const msgs = Array.isArray(c.messages) ? c.messages : []
    if (!msgs.length) continue
    if (msgs.some(m => m.role === 'user')) continue           // respondeu — Sofia cuida
    if (['encerrado', 'opt_out'].includes(c.stage)) continue   // encerrado / opt-out
    const followupsFeitos = msgs.length - 1                    // além do 1º disparo
    if (followupsFeitos >= MAX_FOLLOWUPS) continue             // já bateu o limite
    if (c.updated_at && new Date(c.updated_at).getTime() > limite) continue  // cedo demais
    candidatos.push({ ...c, followupsFeitos })
  }

  candidatos.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
  const lista = candidatos.slice(0, MAX)

  if (!lista.length) {
    console.log('✅  Nenhum lead pendente de follow-up no momento.\n')
    return
  }
  console.log(`    ${lista.length} leads sem resposta há ${ESPERA_DIAS}+ dias.\n`)

  let enviados = 0, falhas = 0, consecutivas = 0

  for (const c of lista) {
    const ld = c.lead_data || {}
    const empresa = ld.empresa || ld.nome || 'sua empresa'
    const tentativa = c.followupsFeitos + 1

    let msg
    try {
      msg = await gerarFollowup({ empresa, cidade: ld.cidade, tentativa })
    } catch (e) {
      console.log(`   ✗ ${empresa} — erro ao gerar: ${e.message}`)
      continue
    }

    if (!ENVIAR) {
      console.log(`   ─── ${empresa}  (follow-up ${tentativa}/${MAX_FOLLOWUPS})`)
      console.log('   ' + msg.replace(/\n/g, '\n   ') + '\n')
      enviados++
      continue
    }

    try {
      await sendText(c.phone, msg)
    } catch (e) {
      falhas++; consecutivas++
      console.log(`   ✗ ${empresa} — falha no envio (${consecutivas}ª seguida)`)
      if (consecutivas >= 5) {
        console.log('\n🛑  5 falhas seguidas — ABORTANDO. Verifique se o número foi bloqueado.\n')
        break
      }
      continue
    }
    consecutivas = 0

    await db.from('chatbot_conversations').update({
      messages: [...c.messages, { role: 'assistant', content: msg }],
      updated_at: new Date().toISOString(),
    }).eq('phone', c.phone)

    enviados++
    console.log(`   ✓ ${empresa} — follow-up ${tentativa} enviado  (${enviados}/${lista.length})`)

    if (enviados < lista.length) {
      const espera = rnd(60, 180)
      console.log(`     aguardando ${espera}s...`)
      await sleep(espera * 1000)
    }
  }

  console.log(`\n📊  Rodada: ${enviados} ${ENVIAR ? 'enviados' : 'gerados'} | ${falhas} falha(s)`)
  if (ENVIAR) console.log('    Quem responder cai direto na Sofia.\n')
  else console.log('    Preview. Rode com --send para enviar.\n')
}

main().catch((e) => {
  console.error('\n❌  Erro:', e.message, '\n')
  process.exit(1)
})
