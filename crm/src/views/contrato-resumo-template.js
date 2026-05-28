// Resumo simples do contrato (1 página, tema escuro, linguagem leve).
// Acompanha o contrato completo. Recebe os dados preenchidos e devolve HTML.

export function buildResumoHTML(d) {
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const cliente = esc(d.razaoSocial || d.clienteNome || 'CLIENTE')
  const diaVenc = esc(d.diaVencimento || '__')

  const itens = [
    { n:'1', t:'O que eu entrego',
      d:`Tráfego pago (Google e Meta), gestão de redes, landing page, Google Meu Negócio e, quando combinado, sistemas de automação, bot e CRM com IA. Meu compromisso é a execução técnica de qualidade, não prometo um número exato de vendas, porque isso depende de muitos fatores.` },
    { n:'2', t:'Quanto custa',
      d:`Mensalidade combinada, com nota fiscal, vencendo todo dia <span class="mark">${diaVenc}</span>. Reajuste só uma vez por ano (pelo IPCA). Se atrasar, posso pausar o serviço até regularizar.` },
    { n:'3', t:'As ferramentas você paga direto',
      d:`A verba de anúncios e as ferramentas (UAZAPI, OpenRouter, Supabase, etc.) você contrata e paga direto nas plataformas, em contas suas. Eu indico e configuro, mas o dinheiro não passa por mim, isso é mais seguro e transparente pra você.` },
    { n:'4', t:'Eu nunca peço sua senha',
      d:`O acesso às suas contas é sempre por convite oficial de parceiro. Você mantém o controle e pode me remover quando quiser. Suas contas são sempre suas.` },
    { n:'5', t:'O que é seu, é seu',
      d:`Seus dados, seus leads, seus clientes, suas contas de anúncio e redes sociais são 100% seus, durante e depois do contrato. Se a gente encerrar, eu te entrego tudo isso organizado.` },
    { n:'6', t:'A tecnologia é minha',
      d:`O código e os sistemas que eu construo são a minha tecnologia (meu know-how). Você usa enquanto a gente trabalha junto. Se encerrarmos, eu levo a tecnologia comigo, mas você fica com tudo que é seu (dados e leads). Se quiser manter o sistema funcionando depois, a gente combina isso à parte.` },
    { n:'7', t:'Plataformas e IA têm limites',
      d:`Meta e Google às vezes bloqueiam contas ou mudam regras, isso foge do meu controle, mas eu faço o possível pra resolver. Sistemas de IA também podem errar de vez em quando, por isso recomendo supervisão humana em momentos importantes.` },
    { n:'8', t:'Pra sair, é tranquilo',
      d:`Qualquer um de nós pode encerrar avisando com 30 dias de antecedência, por escrito. Sem pegadinha, sem fidelidade longa. O que já foi pago e o mês em andamento não voltam.` },
  ]

  const itensHTML = itens.map(it => `
    <div class="item">
      <div class="num">${it.n}</div>
      <div class="body">
        <h3>${it.t}</h3>
        <p>${it.d}</p>
      </div>
    </div>`).join('')

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Resumo do Contrato · ${cliente}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#0A0F0A; --bg-2:#0F1810; --bg-card:#121C0E;
    --line:rgba(193,255,42,.18); --line-soft:rgba(193,255,42,.08);
    --green:#C1FF2A; --green-soft:rgba(193,255,42,.65);
    --text:#E8F5D8; --text-2:#A6B597; --text-3:#6C7D5F;
  }
  * { box-sizing:border-box }
  html,body { margin:0; padding:0; background:#1a1a1a; font-family:'Inter',sans-serif; color:var(--text); -webkit-font-smoothing:antialiased }
  .toolbar {
    position:fixed; top:0; left:0; right:0; z-index:100;
    background:#0A0A0A; color:#fff; padding:10px 18px;
    display:flex; gap:10px; justify-content:center; align-items:center;
    font-size:13px; box-shadow:0 2px 8px rgba(0,0,0,.4); border-bottom:1px solid var(--line)
  }
  .toolbar button {
    background:var(--green); color:#0A0A0A; border:none; padding:8px 18px;
    border-radius:6px; font:600 13px Inter,sans-serif; cursor:pointer
  }
  .toolbar button.sec { background:#333; color:#fff }
  .toolbar span { opacity:.6 }

  .page {
    width:210mm; min-height:297mm; background:var(--bg); margin:60px auto 24px;
    padding:14mm 16mm 12mm; position:relative; box-shadow:0 8px 40px rgba(0,0,0,.5);
    font-size:10.5pt; line-height:1.55; color:var(--text);
  }

  /* Header bar */
  .head { display:flex; justify-content:space-between; align-items:center; padding-bottom:8mm; border-bottom:1px solid var(--line) }
  .brand { display:flex; align-items:center; gap:10px; font-size:15pt; font-weight:800; letter-spacing:-.02em }
  .brand .logo { width:26px; height:26px; border-radius:6px; background:var(--green); display:flex; align-items:center; justify-content:center; color:#0A0A0A; font-weight:800; font-size:13px }
  .brand .light { color:var(--green); font-weight:700 }
  .head-right { font-size:8.5pt; color:var(--text-3); letter-spacing:.16em; text-transform:uppercase; text-align:right }

  /* Title */
  .kicker { font-size:9pt; color:var(--green); font-weight:600; letter-spacing:.16em; text-transform:uppercase; margin:8mm 0 3mm }
  .title { font-size:26pt; font-weight:800; line-height:1.1; letter-spacing:-.02em; margin:0 0 4mm; color:var(--text) }
  .title em { font-style:normal; color:var(--green) }
  .lead { font-size:10pt; color:var(--text-2); max-width:160mm; line-height:1.6 }
  .lead b { color:var(--text); font-weight:600 }

  /* Items grid */
  .items { margin-top:7mm; display:flex; flex-direction:column; gap:4mm }
  .item {
    background:var(--bg-card); border:1px solid var(--line-soft); border-radius:8px;
    padding:5mm 6mm 5mm 5mm; display:flex; gap:5mm; align-items:flex-start
  }
  .item .num {
    width:22px; height:22px; border-radius:5px; background:var(--green);
    color:#0A0A0A; font-size:11pt; font-weight:800;
    display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1mm
  }
  .item .body { flex:1 }
  .item h3 { margin:0 0 1.5mm; font-size:11.5pt; font-weight:700; color:var(--text); letter-spacing:-.01em }
  .item p { margin:0; font-size:10pt; color:var(--text-2); line-height:1.55 }
  .item p .mark { background:var(--green); color:#0A0A0A; padding:0 6px; border-radius:3px; font-weight:700 }

  /* Bottom summary */
  .resumo { margin-top:6mm; padding:5mm 6mm; background:rgba(193,255,42,.06); border-left:3px solid var(--green); border-radius:0 6px 6px 0; font-size:9.5pt; color:var(--text-2); line-height:1.6 }
  .resumo b { color:var(--green); font-weight:700 }

  /* Footer */
  .foot { display:flex; justify-content:space-between; align-items:center; padding-top:5mm; margin-top:6mm; border-top:1px solid var(--line); font-size:7.5pt; color:var(--text-3); letter-spacing:.16em; text-transform:uppercase }
  .foot .dot { color:var(--green); margin-right:4px }

  /* Top thin client bar */
  .client-bar { display:flex; justify-content:space-between; align-items:center; padding:0 0 4mm; font-size:7.5pt; color:var(--text-3); letter-spacing:.16em; text-transform:uppercase; border-bottom:1px solid var(--line-soft) }
  .client-bar .name { color:var(--text-2); font-weight:600 }

  @media print {
    @page { size:A4; margin:0 }
    html,body { background:var(--bg) }
    .toolbar { display:none }
    .page { margin:0; box-shadow:none; min-height:auto; page-break-after:auto }
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
  }
  .page { -webkit-print-color-adjust:exact; print-color-adjust:exact }
</style>
</head>
<body>

<div class="toolbar">
  <button onclick="window.print()">Imprimir / Salvar PDF</button>
  <button class="sec" onclick="window.close()">Fechar</button>
  <span>Na janela de impressão, ative "Gráficos de fundo" pra manter o fundo escuro.</span>
</div>

<div class="page">
  <div class="client-bar">
    <span>Cliente · <span class="name">${cliente}</span></span>
    <span>Edmilson · Eleva Digital</span>
  </div>

  <div class="head">
    <div class="brand">
      <div class="logo">A</div>
      <div>Eleva <span class="light">Digital</span></div>
    </div>
    <div class="head-right">Resumo do Contrato<br>Linguagem Simples</div>
  </div>

  <div class="kicker">Pra você entender sem juridiquês</div>
  <h1 class="title">Nosso acordo, <em>em resumo.</em></h1>
  <p class="lead">Este é um resumo simples do contrato pra você bater o olho e entender o combinado. Ele <b>não substitui o contrato completo</b>, em caso de dúvida vale o que está escrito lá. Mas aqui está o essencial:</p>

  <div class="items">
    ${itensHTML}
  </div>

  <div class="resumo">
    <b>Resumindo:</b> você fica com tudo que é seu, paga as ferramentas direto (transparência total), nunca me passa senha, e pode sair quando quiser avisando antes. Eu cuido da parte técnica com qualidade. Simples e justo pros dois lados.
  </div>

  <div class="foot">
    <span>Eleva Digital · elevabrands.com.br</span>
    <span><span class="dot">●</span>Resumo Informativo</span>
  </div>
</div>

</body>
</html>`
}
