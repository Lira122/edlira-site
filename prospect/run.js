// ════════════════════════════════════════════════════════════════
//  Motor de prospecção Eleva Digital
//  Coleta empresas reais no Google, pontua o "marketing fraco"
//  e (opcionalmente) grava os prospects no CRM.
//
//  Uso:
//    node run.js                          preview (gera só o CSV)
//    node run.js --commit                 grava no CRM
//    node run.js --nichos dentista,academia
//    node run.js --cidades "Taubaté,Jacareí"
//    node run.js --max 40   --score 5
// ════════════════════════════════════════════════════════════════
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(ROOT, '.env') })

const { CIDADES, NICHOS, MIN_SCORE } = await import('./config.js')
const { buscarEmpresas } = await import('./lib/places.js')
const { checarSite, normalizarTelefone, ehCelular } = await import('./lib/web.js')
const { scoreLead, classificarTemp } = await import('./lib/score.js')
const { conectarSupabase, carregarExistentes, inserirProspects } = await import('./lib/crm.js')

// ─── Flags da linha de comando ──────────────────────────────────
const args = process.argv.slice(2)
const flag = (n) => {
  const i = args.indexOf(n)
  return i >= 0 ? args[i + 1] : null
}
const COMMIT   = args.includes('--commit')
const MAX_POR  = Number(flag('--max')) || 60
const MIN      = Number(flag('--score')) || MIN_SCORE
const fNichos  = flag('--nichos')?.split(',').map((s) => s.trim()).filter(Boolean)
const fCidades = flag('--cidades')?.split(',').map((s) => s.trim()).filter(Boolean)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Link para conferir manualmente se a empresa roda anúncios na Meta.
function adLibraryURL(nome) {
  return (
    'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR' +
    '&q=' + encodeURIComponent(nome) + '&search_type=keyword_unordered'
  )
}

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_KEY
  if (!apiKey || apiKey.startsWith('cole_aqui')) {
    console.error('\n❌ Falta a GOOGLE_PLACES_KEY no arquivo .env. Veja o README.md.\n')
    process.exit(1)
  }

  const cidades = CIDADES.filter((c) => !fCidades || fCidades.includes(c.nome))
  const nichos  = NICHOS.filter((n) => !fNichos || fNichos.includes(n.key))

  if (!cidades.length || !nichos.length) {
    console.error('\n❌ Nenhuma cidade ou nicho corresponde aos filtros.\n')
    process.exit(1)
  }

  console.log('\n🔎  Prospecção Eleva Digital')
  console.log(`    ${nichos.length} nicho(s) × ${cidades.length} cidade(s) = ${nichos.length * cidades.length} buscas`)
  console.log(`    Score mínimo: ${MIN}  |  Modo: ${COMMIT ? 'GRAVAR NO CRM' : 'preview (só CSV)'}\n`)

  const coletados = []
  const vistos = new Set()

  for (const cidade of cidades) {
    for (const nicho of nichos) {
      const query = `${nicho.query} em ${cidade.nome} ${cidade.uf}`
      process.stdout.write(`    ${query} ... `)

      let empresas = []
      try {
        empresas = await buscarEmpresas(query, apiKey, {
          maxPaginas: Math.min(3, Math.ceil(MAX_POR / 20)),
        })
      } catch (e) {
        console.log(`erro: ${e.message}`)
        continue
      }

      let novos = 0
      for (const p of empresas) {
        if (p.businessStatus && p.businessStatus !== 'OPERATIONAL') continue

        const nome = p.displayName?.text || p.displayName || 'Empresa sem nome'
        const tel = normalizarTelefone(p.nationalPhoneNumber || p.internationalPhoneNumber)
        const chave = tel || p.id
        if (vistos.has(chave)) continue
        vistos.add(chave)

        const site = await checarSite(p.websiteUri)
        const { score, detalhe } = scoreLead(p, site)
        if (score < MIN) continue

        coletados.push({
          nome,
          telefone: tel,
          celular: ehCelular(tel),
          cidade: cidade.nome,
          segmento: nicho.label,
          site: p.websiteUri || '',
          maps: p.googleMapsUri || '',
          endereco: p.formattedAddress || '',
          avaliacoes: p.userRatingCount || 0,
          score,
          temperatura: classificarTemp(score),
          detalhe,
          adLibrary: adLibraryURL(nome),
        })
        novos++
      }
      console.log(`${empresas.length} achadas, ${novos} qualificadas`)
      await sleep(300)
    }
  }

  coletados.sort((a, b) => b.score - a.score)
  console.log(`\n✅  ${coletados.length} prospects qualificados (score ≥ ${MIN})`)

  if (!coletados.length) {
    console.log('   Nada a salvar. Tente baixar o --score ou ampliar nichos/cidades.\n')
    return
  }

  // ─── Exporta CSV para conferência ─────────────────────────────
  await fs.mkdir(path.join(ROOT, 'output'), { recursive: true })
  const stamp = new Date().toISOString().slice(0, 10)
  const csvPath = path.join(ROOT, 'output', `prospects-${stamp}.csv`)
  const linhas = [
    'Empresa;Telefone;Celular?;Cidade;Segmento;Score;Temperatura;Site;Avaliacoes;Diagnostico;GoogleMaps;ConferirAnuncios',
    ...coletados.map((l) =>
      [
        l.nome, l.telefone || '', l.celular ? 'sim' : 'nao', l.cidade, l.segmento,
        l.score, l.temperatura, l.site, l.avaliacoes,
        l.detalhe.join(' | '), l.maps, l.adLibrary,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(';')
    ),
  ]
  await fs.writeFile(csvPath, '﻿' + linhas.join('\r\n'), 'utf8')
  console.log(`📄  Planilha: ${path.relative(process.cwd(), csvPath)}  (abre no Excel)\n`)

  console.log('    Top 10 prospects:')
  coletados.slice(0, 10).forEach((l, i) =>
    console.log(`    ${String(i + 1).padStart(2)}. [${l.score}] ${l.temperatura.padEnd(6)} ${l.nome} — ${l.cidade}`)
  )

  if (!COMMIT) {
    console.log('\n💡  Confira o CSV. Se estiver bom, rode de novo com --commit para gravar no CRM.\n')
    return
  }

  // ─── Grava no CRM ─────────────────────────────────────────────
  const db = conectarSupabase()
  const existentes = await carregarExistentes(db)
  const novos = coletados.filter(
    (l) => !l.telefone || !existentes.has(l.telefone.replace(/\D/g, ''))
  )
  const pulados = coletados.length - novos.length
  const agora = new Date().toISOString()

  const payload = novos.map((l) => ({
    nome: l.nome,
    empresa: l.nome,
    whatsapp: l.telefone || null,
    status: 'prospeccao',
    temperatura: l.temperatura,
    origem: `Prospecção Google — ${l.segmento}`,
    site: l.site || null,
    cidade: l.cidade,
    endereco: l.endereco || null,
    score: l.score,
    score_detalhe: l.detalhe.join(' | '),
    observacoes: [
      `Segmento: ${l.segmento}`,
      `Telefone: ${l.telefone || '—'}${l.celular ? ' (celular)' : ' (fixo — confirmar WhatsApp)'}`,
      `Diagnóstico: ${l.detalhe.join(' | ')}`,
      `Google Maps: ${l.maps}`,
      `Conferir se roda anúncios: ${l.adLibrary}`,
    ].join('\n'),
    criado_em: agora,
    atualizado_em: agora,
  }))

  const { ok, erros } = await inserirProspects(db, payload)
  console.log(`\n💾  CRM: ${ok} gravados | ${erros} com erro | ${pulados} já existiam (pulados).\n`)
}

main().catch((e) => {
  console.error('\n❌  Erro:', e.message, '\n')
  process.exit(1)
})
