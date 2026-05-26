// ════════════════════════════════════════════════════════════════
//  Agente de disparo — Eleva Digital
//  Envia a 1ª mensagem personalizada (persona: Lira) para os leads
//  prospectados e "planta" a conversa para a Sofia continuar.
//
//  Uso:
//    node disparo.js                 PREVIEW — gera e mostra, não envia
//    node disparo.js --send          envia de verdade
//    node disparo.js --send --max 8  limita a rodada (use no aquecimento)
//    node disparo.js --send --force  ignora a trava de horário comercial
//
//  Aquecimento recomendado (número principal):
//    Dia 1-2: --max 8   |  Dia 3-4: --max 12  |  Dia 5-7: --max 18
//    Semana 2+: --max 25
// ════════════════════════════════════════════════════════════════
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { sendText } from './src/whatsapp.js'
import { gerarOpener } from './src/opener.js'

const db = createClient(process.env.SB_URL, process.env.SB_KEY)

const args = process.argv.slice(2)
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null }
const ENVIAR = args.includes('--send')
const FORCE = args.includes('--force')
const MAX = Number(flag('--max')) || 15

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a))

// Extrai um campo ("Segmento", "Cidade") das observações do lead.
function extrair(obs, rotulo) {
  const m = (obs || '').match(new RegExp(rotulo + ':\\s*(.+)'))
  return m ? m[1].trim() : ''
}

// Saudação conforme a hora atual.
function saudacaoAgora() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

// Prioridade do segmento — 1 = melhor lead (mais dinheiro, ROI de marketing claro).
function tierSegmento(obs) {
  const seg = (extrair(obs, 'Segmento') || '').toLowerCase()
  if (/sa[úu]de|odontolog|est[ée]tica|advoca|contabil|veterin/.test(seg)) return 1
  if (/academia|beleza|sal[ãa]o|imobili|[óo]tica/.test(seg)) return 2
  if (/alimenta|com[ée]rcio local|padaria|restaurante|lanchonete/.test(seg)) return 4
  return 3
}

function horarioComercial() {
  const agora = new Date()
  const h = agora.getHours()
  const dia = agora.getDay() // 0 = domingo
  return dia >= 1 && dia <= 6 && h >= 8 && h < 19
}

async function main() {
  console.log('\n📣  Disparo de prospecção — Eleva Digital')
  console.log(`    Modo: ${ENVIAR ? '🔴 ENVIANDO DE VERDADE' : '🟡 preview (não envia)'}`)
  console.log(`    Limite desta rodada: ${MAX} leads\n`)

  if (ENVIAR && !horarioComercial() && !FORCE) {
    console.log('⏰  Fora do horário comercial (seg-sáb, 8h-19h).')
    console.log('    Disparo frio fora de hora parece spam e prejudica o número.')
    console.log('    Se for proposital, rode com --force.\n')
    return
  }

  // Busca um lote maior e prioriza os melhores segmentos antes de cortar em MAX.
  const { data: pool, error } = await db
    .from('clientes')
    .select('id, nome, empresa, whatsapp, observacoes')
    .eq('status', 'prospeccao')
    .not('whatsapp', 'is', null)
    .order('criado_em', { ascending: true })
    .limit(800)

  if (error) throw new Error('Erro ao ler leads: ' + error.message)
  const leads = (pool || [])
    .sort((a, b) => tierSegmento(a.observacoes) - tierSegmento(b.observacoes))
    .slice(0, MAX)
  if (!leads.length) {
    console.log('✅  Nenhum lead pendente de disparo (todos já contatados).\n')
    return
  }
  console.log(`    ${leads.length} leads nesta rodada (priorizados por segmento).\n`)

  let enviados = 0, falhas = 0, consecutivas = 0

  for (const lead of leads) {
    const empresa = lead.empresa || lead.nome
    const segmento = extrair(lead.observacoes, 'Segmento')
    const cidade = extrair(lead.observacoes, 'Cidade')
    const phone = lead.whatsapp.replace(/\D/g, '')

    // Já existe conversa? então já foi abordado — pula.
    const { data: convExiste } = await db
      .from('chatbot_conversations')
      .select('phone')
      .eq('phone', phone)
      .maybeSingle()
    if (convExiste) {
      console.log(`   • ${empresa} — já tem conversa aberta, pulado`)
      continue
    }

    // Gera a mensagem personalizada.
    let opener
    try {
      opener = await gerarOpener({ empresa, segmento, cidade, saudacao: saudacaoAgora() })
    } catch (e) {
      console.log(`   ✗ ${empresa} — erro ao gerar mensagem: ${e.message}`)
      continue
    }

    const partes = opener.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean)

    // PREVIEW — só mostra.
    if (!ENVIAR) {
      console.log(`   ─── ${empresa}  (${cidade || 's/ cidade'} · ${segmento || 's/ segmento'})`)
      partes.forEach((p, i) => console.log(`   [msg ${i + 1}] ${p}`))
      console.log('')
      enviados++
      continue
    }

    // ENVIO REAL — várias mensagens curtas, com pausa entre elas.
    try {
      for (let i = 0; i < partes.length; i++) {
        if (i > 0) await sleep(rnd(2, 4) * 1000)
        await sendText(phone, partes[i])
      }
    } catch (e) {
      falhas++; consecutivas++
      console.log(`   ✗ ${empresa} — falha no envio (${consecutivas}ª seguida)`)
      await db.from('clientes').update({
        status: 'perdido',
        observacoes: (lead.observacoes || '') + '\n[Disparo] Falha no envio — número provavelmente sem WhatsApp.',
        atualizado_em: new Date().toISOString(),
      }).eq('id', lead.id)

      if (consecutivas >= 5) {
        console.log('\n🛑  5 falhas seguidas — ABORTANDO a rodada.')
        console.log('    Verifique no celular se o número não foi bloqueado pelo WhatsApp.\n')
        break
      }
      continue
    }
    consecutivas = 0

    // "Planta" a conversa para a Sofia continuar de onde parou.
    await db.from('chatbot_conversations').insert({
      phone,
      stage: 'situacao',
      messages: partes.map((p) => ({ role: 'assistant', content: p })),
      lead_data: { nome: lead.nome, empresa, segmento, cidade, origem: 'disparo_prospeccao' },
      updated_at: new Date().toISOString(),
    })

    await db.from('clientes').update({
      status: 'novo',
      temperatura: 'frio',
      observacoes: (lead.observacoes || '') + `\n[Disparo] 1ª mensagem enviada em ${new Date().toLocaleString('pt-BR')}.`,
      atualizado_em: new Date().toISOString(),
    }).eq('id', lead.id)

    enviados++
    console.log(`   ✓ ${empresa} — enviado  (${enviados}/${leads.length})`)

    // Ritmo humano: espera 1 a 3 min entre cada lead.
    if (enviados < leads.length) {
      const espera = rnd(60, 180)
      console.log(`     aguardando ${espera}s...`)
      await sleep(espera * 1000)
    }
  }

  console.log(`\n📊  Rodada encerrada: ${enviados} ${ENVIAR ? 'enviados' : 'gerados'} | ${falhas} falha(s)`)
  if (ENVIAR) {
    console.log('    Quando um lead responder, a Sofia assume a conversa automaticamente.')
    console.log('    Rode de novo amanhã para a próxima leva.\n')
  } else {
    console.log('    Isto foi um PREVIEW. Revise as mensagens e rode com --send para disparar.\n')
  }
}

main().catch((e) => {
  console.error('\n❌  Erro:', e.message, '\n')
  process.exit(1)
})
