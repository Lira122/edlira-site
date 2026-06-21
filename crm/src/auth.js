import { createClient } from '@supabase/supabase-js'
import { setDb, setCfg } from './db.js'

// Anon key é seguro expor — ele é o token usado por qualquer browser pra
// falar com o Supabase Auth. O service_role só chega depois do login validado.
const SB_URL = 'https://flzpblpegoqjxaacjvhf.supabase.co'
const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsenBibHBlZ29xanhhYWNqdmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODM2NDUsImV4cCI6MjA5Mzc1OTY0NX0.U_JPnFs2ZJ-E5PQqqrUR-KZewysszgMCwWpi82zTy10'

export const sbAuth = createClient(SB_URL, SB_ANON_KEY, {
  auth: { persistSession: true, storageKey: 'eleva_crm_auth' },
})

// Endpoint do server.js que valida o JWT do user e devolve service_role
const ADMIN_CONFIG_URL = '/admin-config-auth'

export async function bootstrapAdmin(session) {
  const r = await fetch(ADMIN_CONFIG_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (!r.ok) {
    if (r.status === 403) throw new Error('Email não autorizado.')
    if (r.status === 401) throw new Error('Sessão inválida.')
    throw new Error('Server respondeu ' + r.status)
  }
  const cfg = await r.json()
  if (!cfg.ok || !cfg.SB_KEY) throw new Error('Server não devolveu as chaves.')
  setDb(SB_URL, cfg.SB_KEY)
  setCfg({ OR_KEY: cfg.OR_KEY || '' })
  return cfg
}

export async function signIn(email, password) {
  const { data, error } = await sbAuth.auth.signInWithPassword({ email, password })
  if (error) throw error
  await bootstrapAdmin(data.session)
  return data
}

export async function signOut() {
  try { await sbAuth.auth.signOut() } catch (_) {}
  location.reload()
}

export async function getSession() {
  const { data } = await sbAuth.auth.getSession()
  return data?.session || null
}
