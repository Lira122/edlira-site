// ════════════════════════════════════════════════════════════════
//  Prospecção FOCO ICP ValePet
//
//  Perfil do cliente que converteu (ValePet Distribuidora):
//   • Distribuidora/varejo local, 5-10 anos de mercado, casal sócio
//   • Múltiplos verticais (pet doméstico + agro + nicho)
//   • Sem site próprio, presença social pequena, já testou ads
//   • Cidade do Vale do Paraíba, próxima de Taubaté (visitável)
//
//  Este script busca empresas SIMILARES dentro de raio visitável
//  pra você bater na porta, não só mandar Zap.
//
//  Uso:
//    node run-icp-valepet.js                  preview
//    node run-icp-valepet.js --commit         grava no CRM
//    node run-icp-valepet.js --max 200        limita total
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
const MAX = Number(flag('--max')) || Infinity

// Cidades dentro de raio visitável do Lira (Taubaté). Distância máx ~45 min de carro.
const CIDADES = flag('--cidades')?.split(',').map((s) => s.trim()).filter(Boolean) || [
  'Taubaté',
  'Tremembé',
  'Caçapava',
  'Pindamonhangaba',
  'Roseira',
  'Aparecida',
  'Guaratinguetá',
  'Lorena',
]

// SEGMENTOS PRIORITÁRIOS (em ordem do que bate mais com perfil ValePet)
// Tier 1 = ICP puro (mesmo tipo de negócio, alta probabilidade de fechar igual)
// Tier 2 = ICP adjacente (negócio familiar local de varejo/distribuição)
// Tier 3 = ICP distante (varejo geral, mais difícil)
function tier(tags) {
  const s = tags.shop || ''
  const c = tags.craft || ''
  const a = tags.amenity || ''
  const o = tags.office || ''

  // Tier 1 — ICP puro (igual ValePet)
  if (s === 'pet') return 1
  if (a === 'veterinary') return 1
  if (s === 'agrarian') return 1
  if (s === 'farm') return 1
  if (a === 'pharmacy' && /agro|rural|veteri/i.test(tags.name || '')) return 1

  // Tier 2 — distribuidoras/varejo familiar
  if (s === 'car_parts') return 2          // autopeças locais
  if (s === 'hardware') return 2            // ferragens
  if (s === 'doityourself') return 2        // material construção
  if (s === 'paint') return 2               // tintas
  if (s === 'fishing') return 2             // pesca (vertical ValePet)
  if (s === 'bicycle') return 2             // bike
  if (s === 'motorcycle') return 2          // moto
  if (s === 'electronics') return 2
  if (s === 'tyres') return 2               // pneu
  if (c === 'car_repair' || s === 'car_repair') return 2

  // Tier 3 — varejo de bairro
  if (s === 'optician') return 3
  if (s === 'jewelry') return 3
  if (s === 'shoes') return 3
  if (s === 'sports') return 3
  if (s === 'furniture') return 3
  if (s === 'mobile_phone') return 3
  if (s === 'computer') return 3
  if (s === 'clothes') return 3
  if (s === 'beauty' || s === 'hairdresser') return 3

  return 9 // não bate o ICP, ignora
}

function segmentoLabel(tags) {
  const s = tags.shop, a = tags.amenity, c = tags.craft
  const map = {
    'pet': 'Pet shop / Distribuidora pet',
    'agrarian': 'Agropecuária / Insumos agro',
    'farm': 'Loja rural',
    'fishing': 'Pesca / Náutica',
    'car_parts': 'Autopeças',
    'hardware': 'Ferragens',
    'doityourself': 'Material de construção',
    'paint': 'Tintas',
    'bicycle': 'Bike shop',
    'motorcycle': 'Motopeças',
    'electronics': 'Eletrônicos',
    'tyres': 'Pneus',
    'car_repair': 'Oficina mecânica',
    'optician': 'Ótica',
    'jewelry': 'Joalheria',
    'shoes': 'Calçados',
    'sports': 'Loja esportiva',
    'furniture': 'Móveis',
    'mobile_phone': 'Celulares / acessórios',
    'computer': 'Informática',
    'clothes': 'Moda',
    'beauty': 'Estética / Beleza',
    'hairdresser': 'Salão',
  }
  if (a === 'veterinary') return 'Veterinária'
  if (a === 'pharmacy') return 'Farmácia'
  return map[s] || map[c] || 'Comércio local'
}

const EXCLUIR = /\b(UPA|UBS|PSF|AMA|Pronto[- ]?Socorro|Hospital|Santa Casa|Prefeitura|Secretaria|C[âa]mara Municipal|Cart[óo]rio|F[óo]rum|Tribunal|Detran|Poupatempo|INSS|Correios|Posto de Sa[úu]de|Delegacia|Batalh[ãa]o|Bombeiros|Minist[ée]rio|SAMU|CRAS|CAPS|Receita Federal|Banco do Brasil|Caixa Econ[ôo]mica|Bradesco|Ita[úu]|Santander)\b/i

const tag = (t, ...ks) => { for (const k of ks) if (t[k]) return String(t[k]).trim(); return '' }
const mapsURL = (nome, cidade) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${nome} ${cidade}`)
const adURL   = (nome) => 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=' + encodeURIComponent(nome) + '&search_type=keyword_unordered'

async function main() {
  console.log('\n🎯  Prospecção ICP ValePet — perto de Taubaté, segmentos similares')
  console.log(`    Cidades (raio ~45 min): ${CIDADES.join(', ')}`)
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

    let bateICP = 0
    for (const el of elementos) {
      const t = el.tags || {}
      const nome = (t.name || '').trim()
      if (!nome) continue
      if (EXCLUIR.test(nome)) continue

      const tierLvl = tier(t)
      if (tierLvl > 3) continue // não bate ICP, descarta

      // Tem site? então já tá menos vulnerável (ainda assim entra se tier 1)
      const temSite = !!tag(t, 'website', 'contact:website', 'url', 'contact:url')
      if (temSite && tierLvl > 1) continue // tier 2/3 com site = sai

      const chave = (nome + '|' + cidade).toLowerCase()
      if (vistos.has(chave)) continue
      vistos.add(chave)

      const tel = normalizarTelefone(tag(t, 'contact:phone', 'phone', 'contact:mobile', 'mobile'))
      coletados.push({
        nome,
        cidade,
        tier: tierLvl,
        segmento: segmentoLabel(t),
        telefone: tel,
        celular: ehCelular(tel),
        temSite,
        instagram: tag(t, 'contact:instagram', 'instagram'),
        endereco: [tag(t, 'addr:street'), tag(t, 'addr:housenumber'), tag(t, 'addr:suburb')].filter(Boolean).join(', '),
      })
      bateICP++
    }
    console.log(`${elementos.length} empresas, ${bateICP} batem ICP`)
  }

  // Ordena: tier 1 primeiro, depois quem tem CELULAR, depois telefone fixo, depois sem tel
  coletados.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier
    if (a.celular !== b.celular) return (b.celular ? 1 : 0) - (a.celular ? 1 : 0)
    return (b.telefone ? 1 : 0) - (a.telefone ? 1 : 0)
  })

  const lista = coletados.slice(0, MAX)
  const comCel = lista.filter(c => c.celular).length

  // Stats por tier
  const t1 = lista.filter(x => x.tier === 1).length
  const t2 = lista.filter(x => x.tier === 2).length
  const t3 = lista.filter(x => x.tier === 3).length

  console.log(`\n✅  ${lista.length} empresas no ICP  (${comCel} com celular/WhatsApp)`)
  console.log(`    Tier 1 (ICP puro): ${t1}`)
  console.log(`    Tier 2 (distribuidora/varejo familiar): ${t2}`)
  console.log(`    Tier 3 (varejo bairro): ${t3}`)
  console.log('\n    Top 15:')
  lista.slice(0, 15).forEach((c, i) => {
    const tagT = `T${c.tier}`
    const celT = c.celular ? '📱' : (c.telefone ? '☎️' : '❌')
    console.log(`    ${String(i + 1).padStart(2)}. ${tagT} ${celT} ${c.nome} — ${c.cidade} — ${c.segmento}`)
  })

  if (!COMMIT) {
    console.log('\n💡  Preview. Rode de novo com --commit para gravar no CRM.\n')
    return
  }

  // ─── Grava no CRM ─────────────────────────────────────────────
  const db = createClient(process.env.SB_URL, process.env.SB_KEY)
  const { data: existentes } = await db.from('clientes').select('whatsapp,nome')
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
      pulados++; continue
    }
    if (telDig) telsLote.add(telDig)

    linhas.push({
      nome: c.nome,
      empresa: c.nome,
      whatsapp: c.telefone || null,
      status: 'prospeccao',
      temperatura: c.celular ? 'quente' : 'morno',
      observacoes: [
        `Segmento: ${c.segmento}`,
        `Cidade: ${c.cidade}`,
        `Tier ICP: T${c.tier} (perfil ValePet)`,
        c.endereco ? `Endereço: ${c.endereco}` : '',
        c.temSite ? 'Diagnóstico: tem site (mas Tier 1 = atacar mesmo assim)' : 'Diagnóstico: SEM SITE',
        `Telefone: ${c.telefone || '— buscar contato'}`,
        c.instagram ? `Instagram: ${c.instagram}` : '',
        'Origem: OSM ICP-ValePet (perto de Taubaté, visitável)',
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
    const { error } = await db.from('clientes').insert(lote)
    if (error) { erros += lote.length; console.error('   erro no lote:', error.message) }
    else ok += lote.length
  }

  console.log(`\n💾  CRM: ${ok} gravados | ${pulados} já existiam | ${erros} erros`)
  console.log('    Abra o CRM > Prospecção pra ver os novos leads ICP.\n')
}

main().catch((e) => { console.error('\n❌  Erro:', e.message, '\n'); process.exit(1) })
