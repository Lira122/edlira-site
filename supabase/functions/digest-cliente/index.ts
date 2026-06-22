// ════════════════════════════════════════════════════════════════
//  Edge Function: digest-cliente
//  Roda 1x por dia (pg_cron, seg-sex 18h BRT) e manda no WhatsApp
//  do CLIENTE um resumão das tarefas concluídas hoje no projeto dele.
//
//  Critério: tarefas com status='done', atualizado_em hoje (BRT),
//  notificar_cliente=true e notificado_cliente_em IS NULL.
//
//  Cliente recebe o WhatsApp se tiver ao menos 1 tarefa elegível.
//  Não envia pra cliente sem whatsapp ou status diferente de
//  ativo/proposta/fechado.
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const UAZAPI_URL   = Deno.env.get('UAZAPI_URL')!
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')!
const TZ           = 'America/Sao_Paulo'

// Clientes que recebem digest. 'novo'/'qualificado' são leads frios,
// não recebem digest de execução porque ainda não tem projeto rodando.
const STATUS_ELEGIVEIS = ['ativo', 'proposta', 'fechado']

const FMT_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: TZ })

function hojeBR(): string { return FMT_DATE.format(new Date()) }

function inicioFimDiaBR(): { ini: string; fim: string } {
  // Pega início e fim do dia em BRT como ISO UTC
  const partes = FMT_DATE.format(new Date()).split('-').map(Number)
  // Dia BRT começa às 03:00 UTC (BRT = UTC-3)
  const ini = new Date(Date.UTC(partes[0], partes[1] - 1, partes[2], 3, 0, 0)).toISOString()
  const fim = new Date(Date.UTC(partes[0], partes[1] - 1, partes[2] + 1, 3, 0, 0)).toISOString()
  return { ini, fim }
}

// Envia pra qualquer destino válido do WhatsApp:
//  - número solto (51999999999) → vira 55...@s.whatsapp.net
//  - JID de grupo já formatado (120363xxx@g.us) → usa direto
async function sendToWhatsApp(target: string, text: string) {
  let dest: string
  if (target.includes('@')) {
    dest = target // JID completo (grupo ou DM já formatado)
  } else {
    const number = String(target).replace(/\D/g, '')
    dest = (number.startsWith('55') ? number : '55' + number) + '@s.whatsapp.net'
  }
  const r = await fetch(`${UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: { 'token': UAZAPI_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: dest, text }),
  })
  if (!r.ok) throw new Error(`UazAPI ${r.status}: ${(await r.text()).slice(0, 200)}`)
}

function primeiroNome(nome: string): string {
  return (nome || '').trim().split(/\s+/)[0] || ''
}

function rotuloTarefa(t: { titulo: string; apelido_cliente: string | null }): string {
  const ap = (t.apelido_cliente || '').trim()
  return ap || t.titulo
}

function montarMensagem(saudacao: string, itens: string[], paraGrupo: boolean): string {
  let head: string
  if (paraGrupo) {
    head = `Boa noite, pessoal! Fechando o dia aqui.`
  } else {
    head = saudacao ? `Oi, ${saudacao}! Fechando o dia aqui.` : `Oi! Fechando o dia aqui.`
  }
  const corpo = itens.map((i) => `✓ ${i}`).join('\n')
  const rodape = `_Essa é uma mensagem automática gerada no fim do dia pelo nosso sistema._`
  return `${head}\n\nHoje a gente avançou:\n${corpo}\n\nQualquer dúvida é só chamar.\n\n${rodape}`
}

// Rótulo amigável do destino (mostra no preview do front)
function rotuloDestino(tipo: 'grupo' | 'dm', destino: string): string {
  if (tipo === 'grupo') return `Grupo · ${destino}`
  return destino
}

// ─── CORS ──────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  // Modo:
  //   GET / POST {} → preview (lista blocos pendentes, NÃO envia, NÃO marca)
  //   POST {bloco_id, apelidos?} → envia só esse bloco
  //   (compat: POST {cliente_id} ainda funciona, vira o 1º bloco daquele cliente)
  let body: { bloco_id?: string; cliente_id?: string; apelidos?: Record<string, string> } = {}
  if (req.method === 'POST') {
    try { body = await req.json() } catch { /* body vazio = preview */ }
  }
  const modoEnvio = !!(body.bloco_id || body.cliente_id)

  try {
    const hoje = hojeBR()
    const { ini, fim } = inicioFimDiaBR()

    // 1. Tarefas concluídas hoje, ainda não notificadas
    const { data: tars, error: terr } = await supabase
      .from('tarefas')
      .select('id, titulo, apelido_cliente, projeto_id, atualizado_em')
      .eq('status', 'done')
      .eq('notificar_cliente', true)
      .is('notificado_cliente_em', null)
      .gte('atualizado_em', ini)
      .lt('atualizado_em', fim)
    if (terr) throw terr

    if (!tars || !tars.length) {
      return Response.json(
        { ok: true, hoje, modo: modoEnvio ? 'envio' : 'preview', clientes: [], motivo: 'sem_tarefas' },
        { headers: CORS },
      )
    }

    // 2. Resolve projeto (com jid_grupo) → cliente
    const projIds = [...new Set(tars.map((t) => t.projeto_id).filter(Boolean))]
    const { data: projs } = projIds.length
      ? await supabase.from('projetos').select('id, cliente_id, jid_grupo, nome').in('id', projIds)
      : { data: [] as Array<{ id: string; cliente_id: string; jid_grupo: string | null; nome: string }> }
    const cliIds = [...new Set((projs || []).map((p) => p.cliente_id).filter(Boolean))]
    const { data: clis } = cliIds.length
      ? await supabase.from('clientes').select('id, nome, empresa, whatsapp, status, apelido_saudacao').in('id', cliIds)
      : { data: [] as Array<{ id: string; nome: string; empresa: string | null; whatsapp: string; status: string; apelido_saudacao: string | null }> }

    const projMap = Object.fromEntries((projs || []).map((p) => [p.id, p]))
    const cliMap  = Object.fromEntries((clis  || []).map((c) => [c.id, c]))

    // 3. Agrupa por DESTINO (jid de grupo do projeto OU whatsapp do cliente).
    //    Dois projetos do mesmo cliente com destinos diferentes viram 2 blocos.
    type Item = { id: string; titulo: string; apelido_db: string | null; rotulo: string }
    type Bloco = {
      bloco_id: string         // = destino (chave única)
      destino: string          // phone OU JID
      tipo: 'grupo' | 'dm'
      cliente_id: string
      cli_nome: string
      saudacao: string         // apelido_saudacao || primeiro nome real
      nome_exibicao: string    // "Spetialist (grupo)" / "Adriane"
      itens: Item[]
    }
    const porDestino = new Map<string, Bloco>()
    const ignoradas: { id: string; motivo: string }[] = []

    for (const t of tars) {
      const proj = projMap[t.projeto_id as string]
      if (!proj?.cliente_id) { ignoradas.push({ id: t.id, motivo: 'sem_cliente' }); continue }
      const cli = cliMap[proj.cliente_id]
      if (!cli) { ignoradas.push({ id: t.id, motivo: 'cliente_nao_encontrado' }); continue }
      if (!STATUS_ELEGIVEIS.includes(cli.status)) { ignoradas.push({ id: t.id, motivo: 'status_nao_elegivel' }); continue }

      // Destino: grupo do projeto OU whatsapp do cliente
      let destino: string
      let tipo: 'grupo' | 'dm'
      if (proj.jid_grupo) {
        destino = proj.jid_grupo
        tipo = 'grupo'
      } else if (cli.whatsapp) {
        destino = cli.whatsapp
        tipo = 'dm'
      } else {
        ignoradas.push({ id: t.id, motivo: 'sem_destino' })
        continue
      }

      let bloco = porDestino.get(destino)
      if (!bloco) {
        const baseNome = cli.empresa || cli.nome
        const saud = (cli.apelido_saudacao || '').trim() || primeiroNome(cli.nome)
        bloco = {
          bloco_id: destino,
          destino,
          tipo,
          cliente_id: cli.id,
          cli_nome: cli.nome,
          saudacao: saud,
          nome_exibicao: tipo === 'grupo' ? `${baseNome} (grupo)` : baseNome,
          itens: [],
        }
        porDestino.set(destino, bloco)
      }
      bloco.itens.push({
        id: t.id,
        titulo: t.titulo,
        apelido_db: t.apelido_cliente,
        rotulo: rotuloTarefa(t),
      })
    }

    // ─── Modo PREVIEW: devolve cada bloco com a mensagem renderizada ──────
    if (!modoEnvio) {
      const clientes = [...porDestino.values()].map((b) => ({
        cliente_id: b.bloco_id,       // mantém o nome do campo pro frontend antigo
        bloco_id: b.bloco_id,
        tipo: b.tipo,
        destino: b.destino,
        destino_label: rotuloDestino(b.tipo, b.destino),
        nome: b.nome_exibicao,
        saudacao: b.saudacao,
        whatsapp: b.destino,          // compat com UI atual (mostra o destino)
        tarefas: b.itens.map((i) => ({ id: i.id, titulo: i.titulo, apelido: i.apelido_db })),
        preview_mensagem: montarMensagem(b.saudacao, b.itens.map((i) => i.rotulo), b.tipo === 'grupo'),
      }))
      return Response.json(
        { ok: true, hoje, modo: 'preview', tarefas_total: tars.length, tarefas_ignoradas: ignoradas.length, clientes },
        { headers: CORS },
      )
    }

    // ─── Modo ENVIO: pega o bloco pelo bloco_id (ou pelo cliente_id legado) ──
    let bloco: Bloco | undefined
    if (body.bloco_id) {
      bloco = porDestino.get(body.bloco_id)
    } else if (body.cliente_id) {
      bloco = [...porDestino.values()].find((b) => b.cliente_id === body.cliente_id)
    }
    if (!bloco) {
      return Response.json(
        { ok: false, erro: 'bloco sem tarefas pendentes hoje' },
        { status: 404, headers: CORS },
      )
    }
    const itens = bloco.itens
    const apelidosOverride = body.apelidos || {}
    const rotulosFinais = itens.map((i) => {
      const override = (apelidosOverride[i.id] || '').trim()
      return override || i.rotulo
    })
    const msg = montarMensagem(bloco.saudacao, rotulosFinais, bloco.tipo === 'grupo')

    try {
      await sendToWhatsApp(bloco.destino, msg)
    } catch (e) {
      console.error(`[digest-cliente] falha ao enviar pra ${bloco.nome_exibicao}:`, e)
      return Response.json(
        { ok: false, erro: String(e), cliente: bloco.nome_exibicao },
        { status: 502, headers: CORS },
      )
    }

    const agora = new Date().toISOString()
    // Atualiza apelidos overridos antes de marcar notificado (pra ficar
    // gravado pro caso de reabrir/concluir de novo)
    for (const [tarId, novoApelido] of Object.entries(apelidosOverride)) {
      const apelido = (novoApelido || '').trim()
      if (apelido) {
        await supabase.from('tarefas').update({ apelido_cliente: apelido }).eq('id', tarId)
      }
    }
    const tarIds = itens.map((i) => i.id)
    await supabase.from('tarefas').update({ notificado_cliente_em: agora }).in('id', tarIds)

    return Response.json(
      { ok: true, modo: 'envio', cliente: bloco.nome_exibicao, destino: bloco.destino, tipo: bloco.tipo, tarefas: itens.length, mensagem: msg },
      { headers: CORS },
    )
  } catch (e) {
    console.error('[digest-cliente]', e)
    return Response.json({ ok: false, erro: String(e) }, { status: 500, headers: CORS })
  }
})
