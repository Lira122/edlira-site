// ─── Pontuação de "marketing fraco" ─────────────────────────────
//  Quanto MAIOR o score, mais carente de marketing a empresa está
//  — ou seja, melhor prospect para a Eleva Digital. Máximo possível = 9.

export function scoreLead(place, site) {
  let score = 0
  const detalhe = []

  // Site (0 a 4) — o sinal mais forte
  if (!place.websiteUri) {
    score += 4
    detalhe.push('Sem site (+4)')
  } else if (!site.ok) {
    score += 3
    detalhe.push('Site fora do ar / instável (+3)')
  } else if (!site.https) {
    score += 2
    detalhe.push('Site sem HTTPS / desatualizado (+2)')
  } else {
    detalhe.push('Site ok (0)')
  }

  // Avaliações no Google (0 a 3) — presença/reputação
  const rc = place.userRatingCount || 0
  if (rc === 0) {
    score += 3
    detalhe.push('0 avaliações no Google (+3)')
  } else if (rc < 10) {
    score += 2
    detalhe.push(`${rc} avaliações no Google (+2)`)
  } else if (rc < 30) {
    score += 1
    detalhe.push(`${rc} avaliações no Google (+1)`)
  } else {
    detalhe.push(`${rc} avaliações no Google (0)`)
  }

  // Fotos no perfil do Google (0 a 2)
  const fotos = (place.photos || []).length
  if (fotos === 0) {
    score += 2
    detalhe.push('Sem fotos no perfil Google (+2)')
  } else if (fotos < 5) {
    score += 1
    detalhe.push(`${fotos} foto(s) no Google (+1)`)
  } else {
    detalhe.push(`${fotos} fotos no Google (0)`)
  }

  return { score, detalhe }
}

/** Converte o score em temperatura do CRM. */
export function classificarTemp(score) {
  if (score >= 7) return 'quente'
  if (score >= 4) return 'morno'
  return 'frio'
}
