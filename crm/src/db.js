import { createClient } from '@supabase/supabase-js'

const SB_URL = import.meta.env.VITE_SB_URL
const SB_KEY = import.meta.env.VITE_SB_KEY

if (!SB_URL || !SB_KEY) {
  throw new Error('Defina VITE_SB_URL e VITE_SB_KEY em crm/.env (veja crm/.env.example).')
}

export const db = createClient(SB_URL, SB_KEY)

// Busca TODAS as linhas de uma tabela, contornando o limite de linhas por
// requisição da API do Supabase (estava cortando as listas em ~100 leads).
// Pagina via .range() até a página vir vazia — funciona com qualquer valor
// de "Max rows" do projeto. Retorna { data, error } igual ao client normal.
export async function selectAll(table, { columns = '*', order } = {}) {
  const PAGE = 1000
  const all  = []
  let from   = 0

  while (true) {
    let q = db.from(table).select(columns).range(from, from + PAGE - 1)
    if (order) q = q.order(order.column, { ascending: order.ascending !== false })

    const { data, error } = await q
    if (error) return { data: null, error }
    if (!data || data.length === 0) break

    all.push(...data)
    from += data.length
  }

  return { data: all, error: null }
}
