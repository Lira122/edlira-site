// Geração de contrato a partir de um cliente.
// Abre um modal pré-preenchido com os dados do CRM, deixa o usuário ajustar/completar,
// salva os campos novos no cliente (razão social, CNPJ, etc.) e abre o contrato
// renderizado em nova aba pronto pra imprimir/salvar como PDF.
import { db } from '../db.js'
import { openModal, closeModal, toast } from '../utils.js'
import { buildContratoHTML } from './contrato-template.js'
import { buildResumoHTML } from './contrato-resumo-template.js'

const MES_PT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']

function esc(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export async function gerarContrato(cliente) {
  // Garante que temos a versão fresca do cliente (caso venha do cache)
  let c = cliente
  if (c?.id) {
    const { data } = await db.from('clientes').select('*').eq('id', c.id).maybeSingle()
    if (data) c = data
  }

  const hoje = new Date()
  const dia  = hoje.getDate()
  const mes  = MES_PT[hoje.getMonth()]
  const ano  = hoje.getFullYear()

  openModal('Gerar contrato — ' + (c.nome || 'Cliente'), formHTML(c, dia, mes, ano),
    `<button class="btn bg" id="ct-cancel">Cancelar</button>
     <button class="btn bg" id="ct-resumo">Gerar resumo simples</button>
     <button class="btn bp" id="ct-gerar">Gerar contrato completo</button>`
  )

  document.getElementById('ct-cancel').addEventListener('click', closeModal)
  document.getElementById('ct-gerar').addEventListener('click', () => submit(c, 'completo'))
  document.getElementById('ct-resumo').addEventListener('click', () => submit(c, 'resumo'))
}

function formHTML(c, dia, mes, ano) {
  const v = (id, val) => `value="${esc(val ?? '')}"`
  return `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="background:rgba(193,255,42,.06);border-left:3px solid var(--accent);padding:10px 14px;border-radius:0 6px 6px 0;font-size:12px;color:var(--text-2);line-height:1.5">
        Os campos abaixo já vêm preenchidos pelo CRM quando disponíveis. O que você ajustar aqui fica salvo na ficha do cliente pra próxima vez.
      </div>

      <div style="font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em">Contratante</div>
      <div class="frow">
        <div class="fg"><label class="fl">Razão social *</label><input class="fi" id="ct-razao" ${v('razao', c.razao_social || c.empresa)} placeholder="Empresa Exemplo LTDA"></div>
        <div class="fg"><label class="fl">CNPJ *</label><input class="fi" id="ct-cnpj" ${v('cnpj', c.cnpj)} placeholder="00.000.000/0001-00"></div>
      </div>
      <div class="fg"><label class="fl">Endereço completo *</label><input class="fi" id="ct-end" ${v('end', c.endereco)} placeholder="Rua, número, bairro, cidade/UF, CEP"></div>
      <div class="frow">
        <div class="fg"><label class="fl">Nome do representante *</label><input class="fi" id="ct-rep" ${v('rep', c.representante || c.nome)}></div>
        <div class="fg"><label class="fl">E-mail do representante *</label><input class="fi" id="ct-email" ${v('email', c.email)} placeholder="contato@empresa.com"></div>
      </div>

      <div style="font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Valores</div>
      <div class="frow">
        <div class="fg"><label class="fl">Mensalidade (R$) *</label><input class="fi" id="ct-valor" type="number" step="0.01" ${v('valor', c.valor)}></div>
        <div class="fg"><label class="fl">Por extenso *</label><input class="fi" id="ct-valor-ext" placeholder="três mil reais"></div>
      </div>
      <div class="frow">
        <div class="fg"><label class="fl">Dia de vencimento *</label><input class="fi" id="ct-dia" type="number" min="1" max="28" ${v('dia', c.dia_vencimento)}></div>
        <div class="fg"><label class="fl">Mínimo de mídia (R$) *</label><input class="fi" id="ct-midia" type="number" step="0.01" ${v('midia', c.valor_midia)}></div>
      </div>

      <div style="font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Assinatura</div>
      <div class="frow">
        <div class="fg"><label class="fl">Cidade</label><input class="fi" id="ct-cidade" value="Taubaté"></div>
        <div class="fg"><label class="fl">Dia</label><input class="fi" id="ct-data-dia" type="number" min="1" max="31" value="${dia}"></div>
      </div>
      <div class="frow">
        <div class="fg"><label class="fl">Mês</label>
          <select class="fsl" id="ct-data-mes">
            ${MES_PT.map((m, i) => `<option value="${m}"${m === mes ? ' selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="fg"><label class="fl">Ano</label><input class="fi" id="ct-data-ano" type="number" min="2024" max="2050" value="${ano}"></div>
      </div>

      <div class="fg" style="margin-top:6px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
          <input type="checkbox" id="ct-portfolio" style="width:16px;height:16px;cursor:pointer">
          Autoriza o uso para fins de portfólio (Cláusula 15ª)
        </label>
      </div>
    </div>`
}

async function submit(c, tipo) {
  const val = id => document.getElementById(id).value.trim()
  const num = id => parseFloat(document.getElementById(id).value) || null
  const int = id => parseInt(document.getElementById(id).value, 10) || null

  const dados = {
    razaoSocial:    val('ct-razao'),
    cnpj:           val('ct-cnpj'),
    endereco:       val('ct-end'),
    representante:  val('ct-rep'),
    email:          val('ct-email'),
    valor:          num('ct-valor'),
    valorExtenso:   val('ct-valor-ext'),
    diaVencimento:  int('ct-dia'),
    valorMidia:     num('ct-midia'),
    cidade:         val('ct-cidade'),
    dataDia:        int('ct-data-dia'),
    dataMes:        val('ct-data-mes'),
    dataAno:        int('ct-data-ano'),
    autorizaPortfolio: document.getElementById('ct-portfolio').checked,
    docNum:         '001',
    clienteNome:    c.nome || '',
  }

  // Resumo precisa só de razão social/nome + dia de vencimento
  const obrig = tipo === 'resumo'
    ? ['diaVencimento']
    : ['razaoSocial','cnpj','endereco','representante','email','valor','valorExtenso','diaVencimento','valorMidia']
  const faltando = obrig.filter(k => !dados[k] && dados[k] !== 0)
  if (faltando.length) { toast('Preencha os campos obrigatórios.', 'er'); return }

  // Salva no cliente o que foi preenchido (mesmo se for só pro resumo)
  if (c?.id) {
    const update = { atualizado_em: new Date().toISOString() }
    if (dados.razaoSocial)   update.razao_social   = dados.razaoSocial
    if (dados.cnpj)          update.cnpj           = dados.cnpj
    if (dados.endereco)      update.endereco       = dados.endereco
    if (dados.representante) update.representante  = dados.representante
    if (dados.email)         update.email          = dados.email
    if (dados.valor)         update.valor          = dados.valor
    if (dados.valorMidia)    update.valor_midia    = dados.valorMidia
    if (dados.diaVencimento) update.dia_vencimento = dados.diaVencimento
    await db.from('clientes').update(update).eq('id', c.id)
  }

  // Formata valores com 2 casas decimais e vírgula (padrão BR)
  if (dados.valor)      dados.valor      = Number(dados.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (dados.valorMidia) dados.valorMidia = Number(dados.valorMidia).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const html = tipo === 'resumo' ? buildResumoHTML(dados) : buildContratoHTML(dados)
  const win = window.open('', '_blank')
  if (!win) {
    toast('Permita pop-ups pra abrir o documento.', 'er')
    return
  }
  win.document.write(html)
  win.document.close()

  closeModal()
  toast(tipo === 'resumo' ? 'Resumo gerado em nova aba.' : 'Contrato gerado em nova aba.')
}
