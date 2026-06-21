// ════════════════════════════════════════════════════════════════
//  Edge Function: gerar-recorrentes
//  Roda 1x por dia (pg_cron) e cria automaticamente os lançamentos
//  de receitas/despesas recorrentes que chegaram no dia. Independente
//  do usuário abrir o CRM.
// ════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const TZ = 'America/Sao_Paulo'

// ── Helpers de data ─────────────────────────────────────────────────────
function hojeBR(): { ano: number; mes: number; dia: number; iso: string; mesPref: string } {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ })
  const iso = fmt.format(new Date()) // "YYYY-MM-DD"
  const [ano, mes, dia] = iso.split('-').map(Number)
  return { ano, mes, dia, iso, mesPref: `${ano}-${String(mes).padStart(2,'0')}` }
}

function diasNoMes(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate()
}

function nthDiaUtil(year: number, month1to12: number, n: number): number {
  let count = 0
  const limit = diasNoMes(year, month1to12)
  for (let day = 1; day <= limit; day++) {
    const dow = new Date(year, month1to12 - 1, day).getDay()
    if (dow !== 0 && dow !== 6) {
      count++
      if (count === n) return day
    }
  }
  return limit
}

function diaAlvoNoMes(r: { dia_util: boolean; dia_mes: number }, year: number, month1to12: number): number {
  if (r.dia_util) return nthDiaUtil(year, month1to12, r.dia_mes)
  return Math.min(r.dia_mes, diasNoMes(year, month1to12))
}

// ─────────────────────────────────────────────────────────────────────────
Deno.serve(async () => {
  try {
    const { ano, mes, dia, iso, mesPref } = hojeBR()

    const [{ data: rReceitas }, { data: rDespesas }] = await Promise.all([
      supabase.from('receitas_recorrentes').select('*').eq('ativa', true),
      supabase.from('despesas_recorrentes').select('*').eq('ativa', true),
    ])

    const receitasCriadas: any[] = []
    const despesasCriadas: any[] = []

    // Receitas → faturamento
    for (const r of (rReceitas || [])) {
      if (r.ultima_geracao && r.ultima_geracao.startsWith(mesPref)) continue
      const diaAlvo = diaAlvoNoMes(r, ano, mes)
      if (dia < diaAlvo) continue

      const { error: insErr } = await supabase.from('faturamento').insert({
        mes, ano,
        valor: r.valor,
        descricao: r.descricao,
        cliente_id: r.cliente_id || null,
        recorrente_id: r.id,
      })
      if (insErr) {
        console.error(`[receita ${r.descricao}]`, insErr)
        continue
      }
      await supabase.from('receitas_recorrentes').update({ ultima_geracao: iso }).eq('id', r.id)
      receitasCriadas.push({ descricao: r.descricao, valor: Number(r.valor), dia_alvo: diaAlvo })
    }

    // Despesas → despesas
    for (const r of (rDespesas || [])) {
      if (r.ultima_geracao && r.ultima_geracao.startsWith(mesPref)) continue
      const diaAlvo = diaAlvoNoMes(r, ano, mes)
      if (dia < diaAlvo) continue

      const { error: insErr } = await supabase.from('despesas').insert({
        descricao: r.descricao,
        categoria: r.categoria,
        valor: r.valor,
        data: `${mesPref}-${String(diaAlvo).padStart(2,'0')}`,
        recorrente_id: r.id,
      })
      if (insErr) {
        console.error(`[despesa ${r.descricao}]`, insErr)
        continue
      }
      await supabase.from('despesas_recorrentes').update({ ultima_geracao: iso }).eq('id', r.id)
      despesasCriadas.push({ descricao: r.descricao, valor: Number(r.valor), dia_alvo: diaAlvo })
    }

    return Response.json({
      ok: true,
      hoje: iso,
      receitas_criadas: receitasCriadas.length,
      despesas_criadas: despesasCriadas.length,
      detalhe_receitas: receitasCriadas,
      detalhe_despesas: despesasCriadas,
    })
  } catch (e) {
    console.error('[gerar-recorrentes]', e)
    return Response.json({ ok: false, erro: String(e) }, { status: 500 })
  }
})
