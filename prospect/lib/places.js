// ─── Google Places API (New) — busca de empresas reais ──────────
const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText'

// Campos que pedimos de volta. Só o que precisamos = mais barato.
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
  'places.googleMapsUri',
  'places.photos',
  'nextPageToken',
].join(',')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Busca empresas no Google por um termo (ex.: "dentista em Taubaté SP").
 * Devolve até `maxPaginas * 20` resultados (limite do Google = 60).
 */
export async function buscarEmpresas(query, apiKey, { maxPaginas = 3 } = {}) {
  const resultados = []
  let pageToken = null

  for (let pagina = 0; pagina < maxPaginas; pagina++) {
    const body = {
      textQuery: query,
      languageCode: 'pt-BR',
      regionCode: 'BR',
      pageSize: 20,
    }
    if (pageToken) body.pageToken = pageToken

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Places API ${res.status} — ${txt.slice(0, 300)}`)
    }

    const data = await res.json()
    for (const p of data.places || []) resultados.push(p)

    pageToken = data.nextPageToken
    if (!pageToken) break
    await sleep(2000) // o token leva ~1-2s para ficar válido
  }

  return resultados
}
