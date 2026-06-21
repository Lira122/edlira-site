import { createClient } from '@supabase/supabase-js'

// `db` é um Proxy: até o login completar, qualquer acesso lança erro.
// Depois que `setDb(url, key)` for chamado (com a service_role devolvida
// pelo server depois de validar o Supabase Auth), todas as chamadas
// passam a delegar pro client real.
let _client = null

export const db = new Proxy({}, {
  get(_t, prop) {
    if (!_client) throw new Error('DB client ainda não inicializado — faça login primeiro.')
    return _client[prop]
  },
})

export function setDb(url, key) {
  _client = createClient(url, key)
}

export function isDbReady() {
  return _client !== null
}

// Config exposta (OR_KEY, etc) — preenchida pelo auth.js após bootstrap.
// Outras views (como agentes.js) leem aqui pra chamar APIs externas (OpenRouter).
export const CFG = {}

export function setCfg(obj) {
  Object.assign(CFG, obj)
}

// Busca TODAS as linhas de uma tabela, contornando o limite de linhas por
// requisição da API do Supabase (estava cortando as listas em ~100 leads).
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
