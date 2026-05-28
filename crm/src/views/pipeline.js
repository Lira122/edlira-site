import { db, selectAll } from '../db.js'
import { brl } from '../utils.js'
import { editCliente } from './clientes.js'

const COLS = [
  { k: 'novo',        l: 'Novo',        cor: '#4A9EFF' },
  { k: 'qualificado', l: 'Qualificado', cor: '#F5A623' },
  { k: 'proposta',    l: 'Proposta',    cor: '#A78BFA' },
  { k: 'ativo',       l: 'Ativo',       cor: '#C5F82A' },
  { k: 'fechado',     l: 'Fechado',     cor: '#34D399' },
  { k: 'perdido',     l: 'Perdido',     cor: '#FF5C5C' },
]

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  const { data, error } = await selectAll('clientes', { order: { column: 'criado_em', ascending: false } })
  if (error) { c.innerHTML = `<div class="empty">Erro: ${error.message}</div>`; return }

  const clientes = data || []

  const cols = COLS.map(col => {
    const cards = clientes.filter(x => x.status === col.k)
    const tot   = cards.reduce((s, x) => s + Number(x.valor || 0), 0)
    const cardHTML = cards.length
      ? cards.map(x => `
          <div class="kcard" data-id="${x.id}">
            <div class="kcard-name">${x.nome}</div>
            ${x.empresa ? `<div class="kcard-co">${x.empresa}</div>` : ''}
            <div class="kcard-ft">
              <span class="kcard-val">${x.valor ? brl(x.valor) : '—'}</span>
              <span class="kcard-svc">${x.servico || ''}</span>
            </div>
          </div>`).join('')
      : `<div style="font-size:12px;color:var(--text-3);text-align:center;padding:14px 0">Vazio</div>`

    return `<div class="kc">
      <div class="kch">
        <span class="kct" style="color:${col.cor}">${col.l}</span>
        <span class="kcn">${cards.length}</span>
      </div>
      ${tot > 0 ? `<div style="padding:5px 13px;font-size:11px;color:var(--text-3);border-bottom:1px solid var(--line)">${brl(tot)}</div>` : ''}
      <div class="kcards">${cardHTML}</div>
    </div>`
  }).join('')

  c.innerHTML = `<div class="kanban">${cols}</div>`

  c.addEventListener('click', e => {
    const card = e.target.closest('.kcard')
    if (card) editCliente(card.dataset.id, () => render())
  })
}
