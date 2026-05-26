// ─── Utilitários de telefone e checagem de site ─────────────────

/** Normaliza um telefone brasileiro para o formato 55DDXXXXXXXXX. */
export function normalizarTelefone(raw) {
  if (!raw) return null
  let d = String(raw).replace(/\D/g, '')
  if (d.startsWith('0')) d = d.slice(1)
  if (d.startsWith('55') && d.length >= 12 && d.length <= 13) return d
  if (d.length === 10 || d.length === 11) return '55' + d
  if (d.startsWith('55') && d.length > 13) return d.slice(0, 13)
  return d.length >= 8 ? '55' + d : null
}

/** True se o número parece celular (55 + DD + 9XXXXXXXX = 13 dígitos). */
export function ehCelular(tel) {
  if (!tel) return false
  const d = tel.replace(/\D/g, '')
  return d.length === 13 && d[4] === '9'
}

/** Verifica se o site da empresa está no ar e usa HTTPS. */
export async function checarSite(url) {
  if (!url) return { ok: false, https: false, motivo: 'sem site' }
  const https = url.startsWith('https://')
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 9000)
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (prospeccao-eleva-digital)' },
    })
    clearTimeout(t)
    return { ok: res.status < 400, https, status: res.status }
  } catch (e) {
    return { ok: false, https, motivo: e.name === 'AbortError' ? 'timeout' : 'sem resposta' }
  }
}
