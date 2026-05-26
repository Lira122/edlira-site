// ════════════════════════════════════════════════════════════════
//  Prospecção via OpenStreetMap — sem chave, sem cartão.
//  Coleta empresas SEM SITE (alvo principal: "não têm página") e
//  grava no CRM com status "prospeccao".
//
//  Uso:
//    node run-osm.js                       preview (não grava)
//    node run-osm.js --commit              grava no CRM
//    node run-osm.js --cidades "Taubaté"   cidades específicas
//    node run-osm.js --max 500             limita o total
// ════════════════════════════════════════════════════════════════
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { buscarOSM } from './lib/osm.js'
import { normalizarTelefone, ehCelular } from './lib/web.js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true })

const args = process.argv.slice(2)
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null }
const COMMIT = args.includes('--commit')
const SO_COM_TEL = args.includes('--com-telefone')
const MAX = Number(flag('--max')) || Infinity

// Órgãos públicos / equipamentos que NÃO são prospects comerciais.
const EXCLUIR = /\b(UPA|UBS|PSF|AMA|Pronto[- ]?Socorro|Hospital|Santa Casa|Prefeitura|Secretaria|C[âa]mara Municipal|Cart[óo]rio|F[óo]rum|Tribunal|Detran|Poupatempo|INSS|Correios|Posto de Sa[úu]de|Delegacia|Batalh[ãa]o|Bombeiros|Minist[ée]rio|SAMU|CRAS|CAPS|Receita Federal)\b/i
const CIDADES = flag('--cidades')?.split(',').map((s) => s.trim()).filter(Boolean) || [
  'São José dos Campos', 'Taubaté', 'Jacareí', 'Pindamonhangaba',
]

const tag = (t, ...ks) => { for (const k of ks) if (t[k]) return String(t[k]).trim(); return '' }

function classificarSegmento(t) {
  const a = t.amenity, s = t.shop, o = t.office, h = t.healthcare, c = t.craft, l = t.leisure
  if (a === 'dentist' || h === 'dentist') return 'Saúde — Odontologia'
  if (a === 'veterinary') return 'Saúde — Veterinária'
  if (a === 'pharmacy') return 'Saúde — Farmácia'
  if (a === 'clinic' || a === 'doctors' || h) return 'Saúde — Clínica'
  if (['restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'ice_cream'].includes(a)) return 'Alimentação'
  if (s === 'bakery') return 'Alimentação — Padaria'
  if (l === 'fitness_centre') return 'Serviços — Academia'
  if (o === 'lawyer') return 'Serviços — Advocacia'
  if (o === 'accountant') return 'Serviços — Contabilidade'
  if (o === 'estate_agent') return 'Serviços — Imobiliária'
  if (o) return 'Serviços — Escritório'
  if (s === 'hairdresser' || s === 'beauty') return 'Serviços — Beleza'
  if (s === 'car_repair' || c === 'car_repair') return 'Serviços — Oficina'
  if (s === 'clothes' || s === 'shoes' || s === 'boutique') return 'Varejo — Moda'
  if (s === 'optician') return 'Varejo — Ótica'
  if (s) return 'Varejo — ' + s
  if (c) return 'Serviços — ' + c
  return 'Comércio local'
}

const mapsURL = (nome, cidade) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${nome} ${cidade}`)
const adURL = (nome) =>
  'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=' +
  encodeURIComponent(nome) + '&search_type=keyword_unordered'

async function main() {
  console.log('\n🗺️  Prospecção via OpenStreetMap — empresas SEM SITE')
  console.log(`    Cidades: ${CIDADES.join(', ')}`)
  console.log(`    Modo: ${COMMIT ? 'GRAVAR NO CRM' : 'preview (não grava)'}\n`)

  const coletados = []
  const vistos = new Set()

  for (const cidade of CIDADES) {
    process.stdout.write(`    ${cidade} ... `)
    let elementos = []
    try {
      elementos = await buscarOSM(cidade, { log: (m) => console.log(m) })
    } catch (e) {
      console.log(`erro: ${e.message}`)
      continue
    }

    let semSite = 0
    for (const el of elementos) {
      const t = el.tags || {}
      const nome = (t.name || '').trim()
      if (!nome) continue

      // Órgão público / equipamento urbano — não é prospect.
      if (EXCLUIR.test(nome)) continue

      // Tem página própria? então não é o alvo desta varredura.
      if (tag(t, 'website', 'contact:website', 'url', 'contact:url')) continue

      const chave = (nome + '|' + cidade).toLowerCase()
      if (vistos.has(chave)) continue
      vistos.add(chave)

      const tel = normalizarTelefone(tag(t, 'contact:phone', 'phone', 'contact:mobile', 'mobile'))
      coletados.push({
        nome,
        cidade,
        segmento: classificarSegmento(t),
        telefone: tel,
        celular: ehCelular(tel),
        instagram: tag(t, 'contact:instagram', 'instagram'),
        endereco: [tag(t, 'addr:street'), tag(t, 'addr:housenumber'), tag(t, 'addr:suburb')]
          .filter(Boolean).join(', '),
      })
      semSite++
    }
    console.log(`${elementos.length} empresas, ${semSite} sem site`)
  }

  // telefone direto primeiro
  coletados.sort((a, b) => (b.telefone ? 1 : 0) - (a.telefone ? 1 : 0))
  const base = SO_COM_TEL ? coletados.filter((c) => c.telefone) : coletados
  const lista = base.slice(0, MAX)
  const comTel = lista.filter((c) => c.telefone).length

  console.log(`\n✅  ${lista.length} empresas sem site  (${comTel} com telefone direto)\n`)
  console.log('    Amostra:')
  lista.slice(0, 12).forEach((c, i) =>
    console.log(`    ${String(i + 1).padStart(2)}. ${c.nome} — ${c.cidade} — ${c.segmento} — ${c.telefone || 'sem telefone'}`)
  )

  if (!COMMIT) {
    console.log('\n💡  Preview. Rode de novo com --commit para gravar no CRM.\n')
    return
  }

  // ─── Grava no CRM ─────────────────────────────────────────────
  const db = createClient(process.env.SB_URL, process.env.SB_KEY)

  const { data: existentes, error: e1 } = await db.from('clientes').select('whatsapp,nome')
  if (e1) throw new Error('Erro ao ler clientes: ' + e1.message)
  const telsCRM = new Set()
  const nomesCRM = new Set()
  for (const r of existentes || []) {
    if (r.whatsapp) telsCRM.add(r.whatsapp.replace(/\D/g, ''))
    if (r.nome) nomesCRM.add(r.nome.trim().toLowerCase())
  }

  const agora = new Date().toISOString()
  const telsLote = new Set()
  const linhas = []
  let pulados = 0

  for (const c of lista) {
    const telDig = c.telefone ? c.telefone.replace(/\D/g, '') : null
    if (nomesCRM.has(c.nome.toLowerCase()) || (telDig && (telsCRM.has(telDig) || telsLote.has(telDig)))) {
      pulados++
      continue
    }
    if (telDig) telsLote.add(telDig)

    linhas.push({
      nome: c.nome,
      empresa: c.nome,
      whatsapp: c.telefone || null,
      status: 'prospeccao',
      temperatura: c.telefone ? 'quente' : 'morno',
      observacoes: [
        `Segmento: ${c.segmento}`,
        `Cidade: ${c.cidade}`,
        c.endereco ? `Endereço: ${c.endereco}` : '',
        'Diagnóstico: SEM SITE / página própria — prospect forte',
        `Telefone: ${c.telefone || '— não encontrado (buscar contato)'}`,
        c.instagram ? `Instagram: ${c.instagram}` : '',
        'Origem: OpenStreetMap',
        `Ver no Google Maps: ${mapsURL(c.nome, c.cidade)}`,
        `Conferir se roda anúncios: ${adURL(c.nome)}`,
      ].filter(Boolean).join('\n'),
      criado_em: agora,
      atualizado_em: agora,
    })
  }

  let ok = 0, erros = 0
  for (let i = 0; i < linhas.length; i += 100) {
    const lote = linhas.slice(i, i + 100)
    // de-duplicação já foi feita acima (nomes/telefones); insert direto.
    const { error } = await db.from('clientes').insert(lote)
    if (error) { erros += lote.length; console.error('   erro no lote:', error.message) }
    else ok += lote.length
  }

  console.log(`\n💾  CRM: ${ok} gravados | ${pulados} já existiam (pulados) | ${erros} com erro`)
  console.log('    Abra o CRM > Clientes > aba "Prospecção".\n')
}

main().catch((e) => {
  console.error('\n❌  Erro:', e.message, '\n')
  process.exit(1)
})
