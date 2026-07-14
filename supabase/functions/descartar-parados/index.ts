// ════════════════════════════════════════════════════════════════
//  Edge Function: descartar-parados
//  Roda 1x/dia (pg_cron, 4h BRT). Move pra 'perdido' todo lead em
//  status='novo' cujo atualizado_em (última atividade no CRM) é
//  mais antigo que 7 dias.
//
//  Nao inclui 'qualificado' nem 'proposta' — esses ficam quietos.
//  Se voce quer descartar mais status no futuro, so adicionar em
//  STATUS_A_DESCARTAR aqui.
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const DIAS_INATIVO = 7
const STATUS_A_DESCARTAR = ['novo']

Deno.serve(async () => {
  try {
    const cutoff = new Date(Date.now() - DIAS_INATIVO * 24 * 60 * 60 * 1000).toISOString()
    const agora = new Date().toISOString()

    // Preview (nao muda nada): quem seria descartado
    const { data: preview, error: previewErr } = await supabase
      .from('clientes')
      .select('id, nome, empresa, status, atualizado_em')
      .in('status', STATUS_A_DESCARTAR)
      .lt('atualizado_em', cutoff)
    if (previewErr) throw previewErr

    if (!preview || !preview.length) {
      return Response.json({ ok: true, descartados: 0, dias: DIAS_INATIVO, cutoff })
    }

    // Marca todos de uma vez
    const ids = preview.map((c) => c.id)
    const { error: updErr } = await supabase
      .from('clientes')
      .update({ status: 'perdido', atualizado_em: agora })
      .in('id', ids)
    if (updErr) throw updErr

    console.log(`[descartar-parados] ${preview.length} leads em ${STATUS_A_DESCARTAR.join(', ')} descartados por inatividade > ${DIAS_INATIVO} dias`)

    return Response.json({
      ok: true,
      descartados: preview.length,
      dias: DIAS_INATIVO,
      cutoff,
      leads: preview.map((c) => ({
        id: c.id,
        nome: c.nome,
        empresa: c.empresa,
        atualizado_em: c.atualizado_em,
      })),
    })
  } catch (e) {
    console.error('[descartar-parados]', e)
    return Response.json({ ok: false, erro: String(e) }, { status: 500 })
  }
})
