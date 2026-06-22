// ════════════════════════════════════════════════════════════════
//  Edge Function: digest-diario
//  Roda 1x por dia (pg_cron, seg-sáb 8h BRT) e manda no WhatsApp
//  do Lira um resumão do que tá atrasado, vence hoje e nos próximos
//  7 dias. Fonte = tabela `tarefas` (do painel Projetos).
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const UAZAPI_URL   = Deno.env.get('UAZAPI_URL')!
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')!
const LIRA_PHONE   = Deno.env.get('DIGEST_PHONE') || '5512981668507'
const TZ           = 'America/Sao_Paulo'

const FMT_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: TZ })
const FMT_DOW  = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, weekday: 'short' })

function hojeBR() {
  return FMT_DATE.format(new Date())
}
function dataMaisN(n: number) {
  return FMT_DATE.format(new Date(Date.now() + n * 86400000))
}

async function sendText(phone: string, text: string) {
  const r = await fetch(`${UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: { 'token': UAZAPI_TOKEN, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ number: phone, text }),
  })
  if (!r.ok) throw new Error(`UazAPI ${r.status}: ${(await r.text()).slice(0, 200)}`)
}

Deno.serve(async () => {
  try {
    const hoje    = hojeBR()
    const limite  = dataMaisN(7)

    // 1. Tarefas abertas com prazo nos próximos 7 dias (incluindo atrasadas)
    const { data: tars, error: terr } = await supabase
      .from('tarefas')
      .select('id, titulo, status, prazo, prioridade, projeto_id')
      .neq('status', 'done')
      .not('prazo', 'is', null)
      .lte('prazo', limite)
      .order('prazo', { ascending: true })
    if (terr) throw terr

    if (!tars || !tars.length) {
      await sendText(LIRA_PHONE, `*Bom dia!*\n\nSem tarefas pendentes ou vencendo nos próximos 7 dias. Tá em dia. 🎯`)
      return Response.json({ ok: true, sent: 'vazio', hoje })
    }

    // 2. Resolve projeto + cliente pra cada tarefa
    const projIds = [...new Set(tars.map(t => t.projeto_id).filter(Boolean))]
    const { data: projs } = projIds.length
      ? await supabase.from('projetos').select('id, nome, cliente_id').in('id', projIds)
      : { data: [] as any[] }
    const cliIds = [...new Set((projs || []).map((p: any) => p.cliente_id).filter(Boolean))]
    const { data: clis } = cliIds.length
      ? await supabase.from('clientes').select('id, nome, empresa').in('id', cliIds)
      : { data: [] as any[] }

    const projMap = Object.fromEntries((projs || []).map((p: any) => [p.id, p]))
    const cliMap  = Object.fromEntries((clis  || []).map((c: any) => [c.id, c]))

    // 3. Classifica
    const atrasadas: any[] = []
    const paraHoje:  any[] = []
    const proximas:  any[] = []
    for (const t of tars) {
      if (t.prazo < hoje)        atrasadas.push(t)
      else if (t.prazo === hoje) paraHoje.push(t)
      else                       proximas.push(t)
    }

    // 4. Helpers de formatação
    const tagDe = (t: any) => {
      const proj = projMap[t.projeto_id]
      const cli  = proj?.cliente_id ? cliMap[proj.cliente_id] : null
      return cli ? (cli.empresa || cli.nome) : (proj?.nome || 'Interno')
    }
    const linha = (t: any, comData = false) => {
      const tag = tagDe(t)
      if (comData) {
        const d   = new Date(t.prazo + 'T00:00:00')
        const dia = String(d.getDate()).padStart(2, '0')
        const dow = FMT_DOW.format(d).replace('.', '').replace(/^./, c => c.toUpperCase())
        return `• *${dia} ${dow}* — ${t.titulo} _(${tag})_`
      }
      return `• ${t.titulo} _(${tag})_`
    }

    // 5. Monta a mensagem
    let msg = `*Bom dia! Resumão do dia*\n`

    if (atrasadas.length) {
      msg += `\n🔴 *ATRASADAS (${atrasadas.length})*\n`
      msg += atrasadas.map(t => linha(t, true)).join('\n')
    }
    if (paraHoje.length) {
      msg += `\n\n🟡 *HOJE (${paraHoje.length})*\n`
      msg += paraHoje.map(t => linha(t)).join('\n')
    }
    if (proximas.length) {
      msg += `\n\n🟢 *PRÓXIMOS 7 DIAS (${proximas.length})*\n`
      msg += proximas.map(t => linha(t, true)).join('\n')
    }
    msg += `\n\n_Total: ${tars.length} ${tars.length === 1 ? 'tarefa aberta' : 'tarefas abertas'}_`

    await sendText(LIRA_PHONE, msg)

    return Response.json({
      ok: true,
      hoje,
      total: tars.length,
      atrasadas: atrasadas.length,
      paraHoje: paraHoje.length,
      proximas: proximas.length,
      enviado_para: LIRA_PHONE,
    })
  } catch (e) {
    console.error('[digest-diario]', e)
    return Response.json({ ok: false, erro: String(e) }, { status: 500 })
  }
})
