// ════════════════════════════════════════════════════════════════════
//  Edge Function: agent-api
//  API pública protegida por bearer token pra agentes autônomos (Hermes
//  e outros) lerem/escreverem no CRM da Eleva.
//
//  Auth: header `Authorization: Bearer <token>`. O token é gerado no CRM,
//  guardado como SHA-256 no banco, e verificado em cada request.
//
//  Cada agente tem permissoes[] granulares. Sem permissão → 403.
//  Todas as chamadas são logadas em agent_logs.
// ════════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const UAZAPI_URL   = Deno.env.get('UAZAPI_URL')   || ''
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN') || ''
const LIRA_PHONE   = '5512981668507'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type':                 'application/json; charset=utf-8',
}

// ─── Helpers ────────────────────────────────────────────────────────────
async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const hash  = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('')
}

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS })
}

function erro(msg: string, status = 400) {
  return reply({ ok: false, erro: msg }, status)
}

// Verifica bearer token no header, retorna { agent, error }
async function autenticar(req: Request) {
  const auth = req.headers.get('Authorization') || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) return { agent: null, error: 'Header Authorization: Bearer <token> obrigatório' }
  const token = m[1].trim()
  const hash = await sha256(token)
  const { data, error } = await supabase
    .from('agent_tokens')
    .select('id, nome, permissoes, ativo')
    .eq('token_hash', hash)
    .maybeSingle()
  if (error || !data) return { agent: null, error: 'Token inválido' }
  if (!data.ativo)    return { agent: null, error: 'Token desativado' }
  return { agent: data, error: null }
}

async function registrarLog(tokenId: string | null, endpoint: string, metodo: string, status: number, erroMsg: string | null, ip: string) {
  try {
    await supabase.from('agent_logs').insert({ token_id: tokenId, endpoint, metodo, status, erro: erroMsg, ip })
    if (tokenId) {
      await supabase.from('agent_tokens').update({
        ultimo_uso: new Date().toISOString(),
        ultima_ip: ip,
        total_chamadas: (await supabase.from('agent_tokens').select('total_chamadas').eq('id', tokenId).single()).data?.total_chamadas + 1 || 1,
      }).eq('id', tokenId)
    }
  } catch (_) { /* silencioso */ }
}

function tem(agent: any, perm: string): boolean {
  const perms = agent.permissoes || []
  return perms.includes(perm) || perms.includes('*')
}

// ─── Endpoints ──────────────────────────────────────────────────────────
async function handlePOST_pesquisa(body: any, agent: any) {
  if (!tem(agent, 'write:pesquisa')) return erro('Sem permissão write:pesquisa', 403)
  if (!body?.titulo) return erro('titulo é obrigatório')

  const payload = {
    titulo: String(body.titulo).slice(0, 500),
    categoria: body.categoria || 'concorrencia',
    resumo: body.resumo ? String(body.resumo).slice(0, 4000) : null,
    fonte_url: body.fonte_url || null,
    prioridade: body.prioridade || 'media',
    status: 'nova',
    responsavel: body.responsavel || agent.nome,
    cliente_id: body.cliente_id || null,
    tags: Array.isArray(body.tags) ? body.tags.slice(0, 20) : [],
    acao_proposta: body.acao_proposta ? String(body.acao_proposta).slice(0, 2000) : null,
  }

  const { data, error } = await supabase.from('pesquisas').insert(payload).select('id, titulo, criado_em').single()
  if (error) return erro('Erro no insert: ' + error.message, 500)
  return reply({ ok: true, id: data.id, titulo: data.titulo, criado_em: data.criado_em })
}

async function handleGET_pesquisas(url: URL, agent: any) {
  if (!tem(agent, 'read:all') && !tem(agent, 'read:pesquisa')) return erro('Sem permissão read:pesquisa', 403)
  let q = supabase.from('pesquisas').select('id,titulo,categoria,status,prioridade,cliente_id,responsavel,resumo,fonte_url,criado_em').order('criado_em', { ascending: false }).limit(100)
  const status = url.searchParams.get('status')
  if (status) q = q.eq('status', status)
  const cat = url.searchParams.get('categoria')
  if (cat) q = q.eq('categoria', cat)
  const { data, error } = await q
  if (error) return erro(error.message, 500)
  return reply({ ok: true, total: data?.length || 0, pesquisas: data })
}

async function handlePATCH_pesquisa(id: string, body: any, agent: any) {
  if (!tem(agent, 'write:pesquisa')) return erro('Sem permissão write:pesquisa', 403)
  const patch: Record<string, any> = { atualizado_em: new Date().toISOString() }
  if (body.status)         patch.status = body.status
  if (body.prioridade)     patch.prioridade = body.prioridade
  if (body.acao_proposta)  patch.acao_proposta = body.acao_proposta
  if (body.resumo)         patch.resumo = body.resumo
  const { error } = await supabase.from('pesquisas').update(patch).eq('id', id)
  if (error) return erro(error.message, 500)
  return reply({ ok: true, id })
}

async function handleGET_clientes(url: URL, agent: any) {
  if (!tem(agent, 'read:all') && !tem(agent, 'read:cliente')) return erro('Sem permissão read:cliente', 403)
  let q = supabase.from('clientes').select('id,nome,empresa,servico,valor,status,whatsapp').order('nome')
  const status = url.searchParams.get('status')
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) return erro(error.message, 500)
  return reply({ ok: true, total: data?.length || 0, clientes: data })
}

async function handleGET_dashboard(_url: URL, agent: any) {
  if (!tem(agent, 'read:all') && !tem(agent, 'read:dashboard')) return erro('Sem permissão read:dashboard', 403)
  const hoje = new Date()
  const mes  = hoje.getMonth() + 1
  const ano  = hoje.getFullYear()
  const mStr = `${ano}-${String(mes).padStart(2,'0')}`

  const [cliAtivos, pesqNovas, tarefasAbertas, faturamento] = await Promise.all([
    supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('pesquisas').select('*', { count: 'exact', head: true }).eq('status', 'nova'),
    supabase.from('tarefas').select('*', { count: 'exact', head: true }).neq('status', 'done'),
    supabase.from('faturamento').select('valor').eq('mes', mes).eq('ano', ano),
  ])

  const receitaMes = (faturamento.data || []).reduce((s, f) => s + Number(f.valor || 0), 0)
  return reply({
    ok: true,
    hoje: hoje.toISOString().slice(0, 10),
    mes: mStr,
    clientes_ativos: cliAtivos.count || 0,
    pesquisas_novas: pesqNovas.count || 0,
    tarefas_abertas: tarefasAbertas.count || 0,
    receita_mes: receitaMes,
  })
}

async function handlePOST_notificarLira(body: any, agent: any) {
  if (!tem(agent, 'notify:lira')) return erro('Sem permissão notify:lira', 403)
  if (!body?.texto) return erro('texto é obrigatório')
  if (!UAZAPI_URL || !UAZAPI_TOKEN) return erro('UazAPI não configurada no server', 500)

  const texto = `🤖 *${agent.nome}*\n\n${String(body.texto).slice(0, 4000)}`
  const r = await fetch(`${UAZAPI_URL}/send/text`, {
    method: 'POST',
    headers: { 'token': UAZAPI_TOKEN, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ number: LIRA_PHONE, text: texto }),
  })
  if (!r.ok) return erro('Falha ao enviar via UazAPI: ' + r.status, 500)
  return reply({ ok: true, enviado: true })
}

// ─── Router ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const url = new URL(req.url)
  const ip  = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
              || req.headers.get('x-real-ip')
              || 'unknown'

  // Path relativo dentro do endpoint (tira /functions/v1/agent-api)
  const pathMatch = url.pathname.match(/\/agent-api(\/.*)?$/)
  const path = (pathMatch?.[1] || '/').replace(/\/$/, '') || '/'

  // Health / help público
  if (req.method === 'GET' && (path === '/' || path === '/health')) {
    return reply({
      ok: true,
      service: 'eleva-agent-api',
      version: '1.0.0',
      endpoints: [
        'POST   /pesquisa',
        'GET    /pesquisas',
        'PATCH  /pesquisa/:id',
        'GET    /clientes',
        'GET    /dashboard',
        'POST   /notificar-lira',
      ],
      docs: 'Envie header Authorization: Bearer <token>',
    })
  }

  // ── Autentica ──
  const { agent, error: authErr } = await autenticar(req)
  if (!agent) {
    await registrarLog(null, path, req.method, 401, authErr, ip)
    return erro(authErr || 'Não autenticado', 401)
  }

  // ── Roteia ──
  let body: any = {}
  if (req.method === 'POST' || req.method === 'PATCH') {
    try { body = await req.json() } catch { /* body vazio ok */ }
  }

  let response: Response
  try {
    if (req.method === 'POST'  && path === '/pesquisa')        response = await handlePOST_pesquisa(body, agent)
    else if (req.method === 'GET'   && path === '/pesquisas')  response = await handleGET_pesquisas(url, agent)
    else if (req.method === 'PATCH' && path.startsWith('/pesquisa/')) response = await handlePATCH_pesquisa(path.split('/')[2], body, agent)
    else if (req.method === 'GET'   && path === '/clientes')   response = await handleGET_clientes(url, agent)
    else if (req.method === 'GET'   && path === '/dashboard')  response = await handleGET_dashboard(url, agent)
    else if (req.method === 'POST'  && path === '/notificar-lira') response = await handlePOST_notificarLira(body, agent)
    else response = erro(`Rota não encontrada: ${req.method} ${path}`, 404)
  } catch (e) {
    response = erro('Erro interno: ' + String(e), 500)
  }

  await registrarLog(agent.id, path, req.method, response.status, response.status >= 400 ? await response.clone().text() : null, ip)
  return response
})
