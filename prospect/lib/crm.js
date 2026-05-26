// ─── Integração com o CRM (Supabase) ────────────────────────────
import { createClient } from '@supabase/supabase-js'

export function conectarSupabase() {
  const url = process.env.SB_URL
  const key = process.env.SB_KEY
  if (!url || !key) {
    throw new Error('Defina SB_URL e SB_KEY no arquivo .env (veja o README).')
  }
  return createClient(url, key)
}

/** Lê os telefones já cadastrados para não duplicar leads. */
export async function carregarExistentes(db) {
  const tels = new Set()
  const { data, error } = await db.from('clientes').select('whatsapp')
  if (error) throw new Error('Erro ao ler clientes: ' + error.message)
  for (const r of data || []) {
    if (r.whatsapp) tels.add(r.whatsapp.replace(/\D/g, ''))
  }
  return tels
}

/** Insere os prospects em lotes de 50. */
export async function inserirProspects(db, leads) {
  let ok = 0
  let erros = 0
  for (let i = 0; i < leads.length; i += 50) {
    const lote = leads.slice(i, i + 50)
    const { error } = await db.from('clientes').insert(lote)
    if (error) {
      erros += lote.length
      console.error('   erro no lote:', error.message)
    } else {
      ok += lote.length
    }
  }
  return { ok, erros }
}
