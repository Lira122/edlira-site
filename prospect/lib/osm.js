// ─── OpenStreetMap / Overpass — empresas reais, sem chave/cartão ──
//  Consulta a base aberta do OpenStreetMap por estabelecimentos
//  comerciais dentro de uma cidade (município = admin_level 8).

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.osm.jp/api/interpreter',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function montarQuery(cidade) {
  return `[out:json][timeout:240];
area["name"="${cidade}"]["admin_level"="8"]["boundary"="administrative"]->.a;
(
  nwr["shop"]["name"](area.a);
  nwr["amenity"~"^(restaurant|cafe|fast_food|bar|pub|ice_cream|dentist|clinic|doctors|pharmacy|veterinary)$"]["name"](area.a);
  nwr["office"]["name"](area.a);
  nwr["healthcare"]["name"](area.a);
  nwr["leisure"="fitness_centre"]["name"](area.a);
  nwr["craft"]["name"](area.a);
);
out tags;`
}

/**
 * Busca estabelecimentos de uma cidade no OpenStreetMap.
 * Tenta vários servidores; em caso de 429/504 espera e tenta de novo.
 */
export async function buscarOSM(cidade, { log = () => {} } = {}) {
  const body = montarQuery(cidade)
  let erro

  for (const url of ENDPOINTS) {
    for (let tentativa = 1; tentativa <= 3; tentativa++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'User-Agent': 'eleva-digital-prospect/1.0 (prospeccao b2b)',
          },
          body,
        })
        if (res.ok) {
          const data = await res.json()
          return data.elements || []
        }
        erro = new Error(`HTTP ${res.status}`)
        log(`      ${new URL(url).host} -> ${res.status} (tentativa ${tentativa})`)
        if (res.status === 429 || res.status === 504) {
          await sleep(4000 * tentativa)
          continue
        }
        break // outro erro: pula para o próximo servidor
      } catch (e) {
        erro = e
        log(`      ${new URL(url).host} -> ${e.message} (tentativa ${tentativa})`)
        await sleep(2000)
      }
    }
  }
  throw erro || new Error('Nenhum servidor Overpass respondeu')
}
