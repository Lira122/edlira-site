import { db, selectAll } from '../db.js'
import { toast } from '../utils.js'

const SB_URL = 'https://flzpblpegoqjxaacjvhf.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsenBibHBlZ29xanhhYWNqdmhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE4MzY0NSwiZXhwIjoyMDkzNzU5NjQ1fQ.7Faqa-D_TfflCgZ3Yq7yicZKYAfZ3WHBdSBKvLSDRY8'

const TIPOS = [
  { value: 'ad',        label: '📣 Anúncio / Ad',       ratio: '1:1' },
  { value: 'carrossel', label: '🎠 Carrossel',           ratio: '4:5' },
  { value: 'produto',   label: '📦 Foto de Produto',     ratio: '1:1' },
  { value: 'cinematic', label: '🎬 Cinematic / Story',   ratio: '9:16' },
  { value: 'auto',      label: '✨ Auto (IA decide)',    ratio: '1:1' },
]

const RATIOS = [
  { value: '1:1',  label: 'Quadrado 1:1 (Feed)' },
  { value: '4:5',  label: 'Retrato 4:5 (Instagram)' },
  { value: '9:16', label: 'Story / Reels 9:16' },
  { value: '16:9', label: 'Landscape 16:9 (YouTube)' },
]

let _clientes = []
let _gerados  = []

export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = '<div class="empty">Carregando...</div>'

  // Carrega clientes
  const { data } = await selectAll('clientes', { columns: 'id, nome, empresa, servico, segmento', order: { column: 'nome' } })
  _clientes = data || []

  // Carrega histórico de criativos
  const { data: hist } = await db.from('criativos').select('*').order('criado_em', { ascending: false }).limit(20)
  _gerados = hist || []

  renderPage()
}

function renderPage() {
  const c = document.getElementById('content')

  const clienteOpts = `<option value="">— Selecione um cliente (opcional) —</option>` +
    _clientes.map(cl => `<option value="${cl.id}" data-nome="${cl.nome}" data-empresa="${cl.empresa||''}" data-servico="${cl.servico||''}">${cl.nome}${cl.empresa ? ` — ${cl.empresa}` : ''}</option>`).join('')

  const tipoOpts = TIPOS.map(t =>
    `<option value="${t.value}" data-ratio="${t.ratio}">${t.label}</option>`
  ).join('')

  const ratioOpts = RATIOS.map(r =>
    `<option value="${r.value}">${r.label}</option>`
  ).join('')

  const historico = _gerados.length ? `
    <div class="tw" style="margin-top:24px">
      <div class="th"><h3>Criativos gerados</h3></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding:16px">
        ${_gerados.map(g => `
          <div style="border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--card)">
            <img src="${g.url}" style="width:100%;aspect-ratio:1;object-fit:cover;display:block" loading="lazy">
            <div style="padding:10px">
              <div style="font-size:11px;font-weight:600;color:var(--text-2);margin-bottom:2px">${g.tipo?.toUpperCase() || '—'}</div>
              <div style="font-size:12px;color:var(--text-3);margin-bottom:8px">${g.cliente_nome || 'Sem cliente'}</div>
              <div style="display:flex;gap:6px">
                <a href="${g.url}" target="_blank" class="btn bg bsm" style="text-decoration:none;flex:1;text-align:center">Ver</a>
                <button class="btn bg bsm copy-url" data-url="${g.url}" style="flex:1">Copiar URL</button>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>` : ''

  c.innerHTML = `
    <div class="tw">
      <div class="th">
        <h3>Gerar Criativo com IA</h3>
        <div style="font-size:12px;color:var(--text-3)">Powered by Higgsfield AI</div>
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:16px;max-width:680px">

        <div class="frow">
          <div class="fg">
            <label class="fl">Cliente (opcional)</label>
            <select class="fsl" id="cr-cliente">${clienteOpts}</select>
          </div>
          <div class="fg">
            <label class="fl">Tipo de criativo</label>
            <select class="fsl" id="cr-tipo">${tipoOpts}</select>
          </div>
        </div>

        <div class="frow">
          <div class="fg">
            <label class="fl">Proporção</label>
            <select class="fsl" id="cr-ratio">${ratioOpts}</select>
          </div>
          <div class="fg">
            <label class="fl">Segmento / nicho</label>
            <input class="fi" id="cr-segmento" placeholder="Ex: e-commerce, academia, clínica...">
          </div>
        </div>

        <div class="fg">
          <label class="fl">Headline / mensagem principal</label>
          <input class="fi" id="cr-headline" placeholder="Ex: Aumente seu faturamento 3x em 90 dias">
        </div>

        <div class="frow">
          <div class="fg">
            <label class="fl">CTA (chamada pra ação)</label>
            <input class="fi" id="cr-cta" placeholder="Ex: Fale com a gente, Saiba mais...">
          </div>
          <div class="fg">
            <label class="fl">Serviço / produto</label>
            <input class="fi" id="cr-servico" placeholder="Ex: Tráfego pago + IA">
          </div>
        </div>

        <div class="fg">
          <label class="fl">Estilo visual (opcional)</label>
          <input class="fi" id="cr-estilo" placeholder="Ex: dark, neon green, minimalista, colorido...">
        </div>

        <div class="fg" style="display:none" id="cr-prompt-row">
          <label class="fl">Prompt customizado (avançado)</label>
          <textarea class="fta" id="cr-prompt" placeholder="Descreva o que quer gerar em inglês..."></textarea>
        </div>

        <div style="display:flex;align-items:center;gap:12px">
          <button class="btn bp" id="cr-gerar" style="min-width:160px">Gerar criativo</button>
          <button class="btn bg" id="cr-toggle-prompt" style="font-size:11px">+ Prompt avançado</button>
          <div id="cr-status" style="font-size:12px;color:var(--text-3)"></div>
        </div>

        <div id="cr-resultado" style="display:none;margin-top:8px">
          <img id="cr-img" src="" style="max-width:100%;border-radius:10px;border:1px solid var(--line)">
          <div style="display:flex;gap:8px;margin-top:10px">
            <a id="cr-download" href="#" target="_blank" class="btn bp bsm" style="text-decoration:none">⬇ Baixar</a>
            <button id="cr-copy-url" class="btn bg bsm">Copiar URL</button>
            <button id="cr-salvar" class="btn bg bsm">Salvar no histórico</button>
          </div>
        </div>

      </div>
    </div>
    ${historico}`

  // Eventos
  const sel = document.getElementById('cr-tipo')
  sel.addEventListener('change', () => {
    const opt = sel.options[sel.selectedIndex]
    const ratio = opt.dataset.ratio
    if (ratio) document.getElementById('cr-ratio').value = ratio
  })

  document.getElementById('cr-cliente').addEventListener('change', e => {
    const opt = e.target.options[e.target.selectedIndex]
    if (opt.dataset.servico) document.getElementById('cr-servico').value = opt.dataset.servico
  })

  document.getElementById('cr-toggle-prompt').addEventListener('click', () => {
    const row = document.getElementById('cr-prompt-row')
    const btn = document.getElementById('cr-toggle-prompt')
    const hidden = row.style.display === 'none'
    row.style.display = hidden ? '' : 'none'
    btn.textContent = hidden ? '- Ocultar prompt' : '+ Prompt avançado'
  })

  document.getElementById('cr-gerar').addEventListener('click', gerarCriativo)

  c.querySelectorAll('.copy-url').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.url).then(() => {
        btn.textContent = 'Copiado!'
        setTimeout(() => btn.textContent = 'Copiar URL', 2000)
      })
    })
  })
}

async function gerarCriativo() {
  const btn    = document.getElementById('cr-gerar')
  const status = document.getElementById('cr-status')
  const res    = document.getElementById('cr-resultado')

  const clienteSel = document.getElementById('cr-cliente')
  const clienteOpt = clienteSel.options[clienteSel.selectedIndex]
  const clienteNome = clienteOpt?.dataset?.nome || ''
  const clienteId   = clienteSel.value || null

  const payload = {
    tipo:     document.getElementById('cr-tipo').value,
    ratio:    document.getElementById('cr-ratio').value,
    cliente:  clienteNome,
    segmento: document.getElementById('cr-segmento').value.trim(),
    headline: document.getElementById('cr-headline').value.trim(),
    cta:      document.getElementById('cr-cta').value.trim(),
    servico:  document.getElementById('cr-servico').value.trim(),
    estilo:   document.getElementById('cr-estilo').value.trim(),
    prompt:   document.getElementById('cr-prompt').value.trim() || undefined,
  }

  if (!payload.headline && !payload.prompt) {
    toast('Preencha pelo menos a headline ou o prompt.', 'er'); return
  }

  btn.disabled = true
  btn.textContent = 'Gerando...'
  status.textContent = '⏳ Aguardando a IA... (pode levar ~30s)'
  res.style.display = 'none'

  try {
    const response = await fetch(`${SB_URL}/functions/v1/gerar-criativo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SB_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!data.ok) throw new Error(data.error || 'Erro desconhecido')

    const url = data.url
    status.textContent = '✅ Criativo gerado!'

    // Mostra resultado
    document.getElementById('cr-img').src = url
    document.getElementById('cr-download').href = url
    document.getElementById('cr-copy-url').onclick = () => {
      navigator.clipboard.writeText(url).then(() => toast('URL copiada!'))
    }
    document.getElementById('cr-salvar').onclick = () => salvarCriativo(url, payload, clienteId, clienteNome)
    res.style.display = ''

  } catch (err) {
    toast(`Erro: ${err.message}`, 'er')
    status.textContent = ''
  } finally {
    btn.disabled = false
    btn.textContent = 'Gerar criativo'
  }
}

async function salvarCriativo(url, payload, clienteId, clienteNome) {
  const { error } = await db.from('criativos').insert({
    url,
    tipo:         payload.tipo,
    ratio:        payload.ratio,
    headline:     payload.headline,
    cliente_id:   clienteId,
    cliente_nome: clienteNome,
    prompt:       payload.prompt || null,
    criado_em:    new Date().toISOString(),
  })
  if (error) { toast('Erro ao salvar.', 'er'); return }
  toast('Salvo no histórico!')
  render()
}
