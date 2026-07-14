import{d as l,o as f,f as c,t as d,s as $,S as _,i as O,T as j,a as I,g as S,c as P,h as F}from"./index-BAT77oFl.js";function L(e){const s=q=>String(q??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),i=s(e.razaoSocial||"____________________"),a=s(e.cnpj||"____________________"),t=s(e.endereco||"____________________"),o=s(e.representante||"____________________"),n=s(e.email||"____________________"),A=s(e.valor||"____"),g=s(e.valorExtenso||"____________________"),p=s(e.diaVencimento||"__"),r=s(e.valorMidia||"____"),z=s(e.cidade||"Taubaté"),D=s(e.dataDia||"__"),k=s(e.dataMes||"____________"),x=s(e.dataAno||new Date().getFullYear()),R=s(e.docNum),T=e.autorizaPortfolio===!0;return`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Contrato · ${i}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --ink:#1A1A1A; --ink-2:#4A4A4A; --ink-3:#7A7A7A;
    --green:#6B8E1F; --green-dark:#4F6B12; --green-soft:#F0F4E0;
    --line:#E5E5E5;
  }
  * { box-sizing:border-box }
  html,body { margin:0; padding:0; background:#F4F4F4; font-family:'Inter',sans-serif; color:var(--ink); -webkit-font-smoothing:antialiased }
  .toolbar {
    position:fixed; top:0; left:0; right:0; z-index:100;
    background:#0A0A0A; color:#fff; padding:10px 18px;
    display:flex; gap:10px; justify-content:center; align-items:center;
    font-size:13px; box-shadow:0 2px 8px rgba(0,0,0,.2)
  }
  .toolbar button {
    background:#C1FF2A; color:#0A0A0A; border:none; padding:8px 18px;
    border-radius:6px; font:600 13px Inter,sans-serif; cursor:pointer
  }
  .toolbar button.sec { background:#333; color:#fff }
  .toolbar span { opacity:.7 }
  .page {
    width:210mm; min-height:297mm; background:#fff; margin:60px auto 24px;
    padding:18mm 18mm 22mm; position:relative; box-shadow:0 4px 28px rgba(0,0,0,.08);
    font-size:11pt; line-height:1.65; color:var(--ink); page-break-after:always;
  }
  .page:last-child { page-break-after:auto }

  /* ── Cabeçalho/rodapé que aparecem em TODA página de conteúdo ───────────── */
  .head, .foot { display:flex; justify-content:space-between; align-items:center; font-size:9pt; color:var(--ink-3); letter-spacing:.08em; text-transform:uppercase }
  .head { padding-bottom:8mm; border-bottom:1px solid var(--line); margin-bottom:10mm }
  .foot { padding-top:8mm; border-top:1px solid var(--line); margin-top:auto; position:absolute; left:18mm; right:18mm; bottom:14mm }
  .brand-mini { display:flex; align-items:center; gap:8px; color:var(--ink); font-weight:700; text-transform:none; letter-spacing:0; font-size:11pt }
  .brand-mini .dot { width:18px; height:18px; border-radius:5px; background:var(--green); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:11px }
  .brand-mini .light { color:var(--green); font-weight:700 }

  /* ── Capa ─────────────────────────────────────────────────────────────────── */
  .cover { padding:24mm 18mm; min-height:297mm; display:flex; flex-direction:column }
  .cover-top { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:10mm; border-bottom:1px solid var(--line) }
  .cover-brand { display:flex; align-items:center; gap:12px }
  .cover-brand .dot { width:36px; height:36px; border-radius:8px; background:var(--green); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:18px }
  .cover-brand h1 { margin:0; font-size:18pt; font-weight:800; letter-spacing:-.01em }
  .cover-brand h1 span { color:var(--green) }
  .cover-brand .tag { font-size:9pt; color:var(--ink-3); margin-top:2px; letter-spacing:.05em }
  .cover-doc { text-align:right; font-size:9pt; color:var(--ink-3); letter-spacing:.08em; text-transform:uppercase }
  .cover-doc b { display:block; color:var(--ink); font-size:11pt; letter-spacing:.02em; margin-top:2px }

  .cover-mid { flex:1; padding-top:50mm }
  .cover-kicker { font-size:10pt; color:var(--green); font-weight:600; letter-spacing:.12em; text-transform:uppercase; margin-bottom:14mm }
  .cover-title { font-size:42pt; font-weight:800; line-height:1.04; letter-spacing:-.025em; margin:0 0 14mm }
  .cover-title .accent { color:var(--green) }
  .cover-sub { font-size:11.5pt; color:var(--ink-2); max-width:130mm; line-height:1.55 }
  .cover-sub b { color:var(--ink); font-weight:700 }

  .cover-info { display:grid; grid-template-columns:1fr 1fr; gap:10mm 14mm; padding-top:14mm; border-top:1px solid var(--line); margin-top:18mm }
  .cover-info .l { font-size:9pt; color:var(--ink-3); letter-spacing:.1em; text-transform:uppercase; margin-bottom:3mm }
  .cover-info .v { font-size:11pt; font-weight:600; color:var(--ink) }
  .cover-info .v small { display:block; font-weight:400; color:var(--ink-2); font-size:9.5pt; margin-top:1mm }
  .cover-info .v .green { color:var(--green) }
  .cover-info .v .marker { background:#FFFCD0; padding:1px 5px; border-radius:3px; border-bottom:1px solid var(--green); display:inline-block }

  .cover-foot { display:flex; justify-content:space-between; align-items:center; padding-top:10mm; border-top:1px solid var(--line); margin-top:16mm; font-size:8.5pt; color:var(--ink-3); letter-spacing:.1em; text-transform:uppercase }
  .cover-foot .pill { border:1px solid var(--ink-3); border-radius:20px; padding:5px 14px }

  /* ── Preâmbulo ────────────────────────────────────────────────────────────── */
  .preamble { border:1px solid var(--line); border-radius:8px; padding:8mm; line-height:1.85; text-align:justify; margin-bottom:8mm }
  .preamble .marker { background:#FFFCD0; padding:0 4px; border-radius:2px; border-bottom:1px solid var(--green); font-weight:600 }

  /* ── Cláusulas ────────────────────────────────────────────────────────────── */
  .clause { margin-bottom:6mm; page-break-inside:avoid }
  .clause-num { font-size:9pt; color:var(--green); font-weight:600; letter-spacing:.12em; text-transform:uppercase; display:flex; align-items:center; gap:10px; margin-bottom:2mm }
  .clause-num b { color:var(--green); font-weight:800 }
  .clause-title { font-size:14pt; font-weight:800; margin:0 0 4mm; letter-spacing:-.01em; color:var(--ink) }
  .clause-side { border-left:3px solid var(--green); padding-left:5mm }
  .clause p { margin:0 0 3mm; text-align:justify }
  .clause ul { margin:3mm 0 4mm; padding-left:5mm }
  .clause ul li { margin-bottom:2mm; text-align:justify }
  .clause b { font-weight:700 }

  /* Destaque amarelo de aviso (atraso/inadimplência etc.) */
  .highlight { border-left:3px solid var(--green); background:var(--green-soft); color:var(--green-dark); padding:5mm 6mm; border-radius:0 4px 4px 0; margin:4mm 0; font-size:10.5pt; line-height:1.6 }
  .highlight b { color:var(--green-dark) }

  .marker { background:#FFFCD0; padding:0 4px; border-radius:2px; border-bottom:1px solid var(--green); font-weight:600 }

  /* ── Checkbox ─────────────────────────────────────────────────────────────── */
  .check { display:inline-flex; align-items:center; gap:5px; margin:0 8px; font-weight:700 }
  .check .box { width:13px; height:13px; border:1.5px solid var(--ink); display:inline-block; border-radius:2px; position:relative }
  .check.on .box::after { content:'✓'; position:absolute; left:1px; top:-4px; font-size:13px; line-height:1; color:var(--green); font-weight:800 }

  /* ── Assinatura ───────────────────────────────────────────────────────────── */
  .sign-block { border:1px solid var(--line); border-radius:6px; padding:6mm 8mm; text-align:center; font-size:10.5pt; margin:4mm 0 8mm }
  .sign-block b { font-weight:700 }
  .sign-date { text-align:center; font-size:11pt; margin:8mm 0; letter-spacing:.02em }
  .sign-date span { display:inline-block; border-bottom:1px solid var(--ink); min-width:22mm; margin:0 4px; padding:0 6px; font-weight:600 }
  .sign-pair { display:grid; grid-template-columns:1fr 1fr; gap:14mm; margin-top:6mm }
  .sign-col { border:1px solid var(--line); border-radius:6px; padding:14mm 6mm 5mm; min-height:30mm; text-align:center; position:relative }
  .sign-col .line { border-bottom:1px solid var(--ink); margin:0 8mm 4mm }
  .sign-col .name { font-weight:700; font-size:10.5pt }
  .sign-col .name .marker { background:#FFFCD0; padding:0 5px; border-radius:3px; border-bottom:1px solid var(--green) }
  .sign-col .role { font-size:9pt; color:var(--ink-2); margin-top:1mm }
  .sign-col.contratado { border-color:var(--green) }

  .testemunhas { border:1px solid var(--line); border-radius:6px; padding:5mm 7mm; margin-top:6mm }
  .testemunhas h4 { font-size:9pt; color:var(--green); font-weight:700; letter-spacing:.1em; text-transform:uppercase; margin:0 0 4mm }
  .test-row { display:grid; grid-template-columns:18px 1fr 1fr; gap:8mm; align-items:end; margin-bottom:5mm }
  .test-row b { font-weight:800; color:var(--ink) }
  .test-row .line { border-bottom:1px solid var(--ink); height:16px }
  .test-row .lbl { font-size:8.5pt; color:var(--ink-3); letter-spacing:.1em; text-transform:uppercase }

  /* ── Print ────────────────────────────────────────────────────────────────── */
  @media print {
    @page { size:A4; margin:0 }
    html,body { background:#fff }
    .toolbar { display:none }
    .page { margin:0; box-shadow:none; min-height:auto; page-break-after:always }
    .page:last-child { page-break-after:auto }
  }
</style>
</head>
<body>

<div class="toolbar">
  <button onclick="window.print()">Imprimir / Salvar PDF</button>
  <button class="sec" onclick="window.close()">Fechar</button>
  <span>Use a opção "Salvar como PDF" na janela de impressão.</span>
</div>

<!-- ═════════════ CAPA ═════════════ -->
<div class="page cover">
  <div class="cover-top">
    <div class="cover-brand">
      <div class="dot">A</div>
      <div>
        <h1>Eleva <span>Digital</span></h1>
        <div class="tag">Marketing · Automação · IA</div>
      </div>
    </div>
    <div class="cover-doc">Documento<b>Nº ${R} · ${x}</b></div>
  </div>

  <div class="cover-mid">
    <div class="cover-kicker">Contrato Comercial</div>
    <h2 class="cover-title">Contrato de prestação de <span class="accent">serviços.</span></h2>
    <div class="cover-sub">Serviços técnicos de marketing digital, automação e desenvolvimento de sistemas, em vigor entre <b>Eleva Digital</b> e a empresa CONTRATANTE.</div>

    <div class="cover-info">
      <div>
        <div class="l">Contratado</div>
        <div class="v">Edmilson Rosa Lira Junior<small>Atuando sob a marca <span class="green">Eleva Digital</span></small></div>
      </div>
      <div>
        <div class="l">Contratante</div>
        <div class="v"><span class="marker">${i}</span><small>CNPJ <span class="marker">${a}</span></small></div>
      </div>
      <div>
        <div class="l">Vigência</div>
        <div class="v">Prazo indeterminado<small>A partir da data de assinatura</small></div>
      </div>
      <div>
        <div class="l">Foro</div>
        <div class="v">Comarca de Taubaté/SP<small>Conforme cláusula 18ª</small></div>
      </div>
    </div>
  </div>

  <div class="cover-foot">
    <div class="pill">Eleva Digital · Modelo Oficial</div>
    <div>Confidencial · Uso Interno</div>
  </div>
</div>

<!-- ═════════════ PÁGINA 1: preâmbulo + cláusula 1 + 2 ═════════════ -->
<div class="page">
  <div class="head">
    <div class="brand-mini"><div class="dot">A</div>Eleva <span class="light">Digital</span></div>
    <span>Contrato de Prestação de Serviços</span>
  </div>

  <div class="preamble">
    Pelo presente instrumento particular, de um lado, <span class="marker">${i}</span>, pessoa jurídica de direito privado, inscrita no CNPJ sob nº <span class="marker">${a}</span>, com sede em <span class="marker">${t}</span>, neste ato representada por <span class="marker">${o}</span> (<span class="marker">${n}</span>), doravante denominada simplesmente CONTRATANTE, e, de outro lado, <b>EDMILSON ROSA LIRA JUNIOR</b>, brasileiro, solteiro, portador do RG nº 29.389.286-5, inscrito no CPF nº 181.565.527-50, residente e domiciliado na Avenida Monte Castelo, nº 156, Vila Jaboticabeira, Taubaté – SP, CEP: 12030-660, atuando sob a marca <b>ELEVA DIGITAL</b>, doravante denominado CONTRATADO, têm entre si justo e contratado o que segue.
  </div>

  <div class="clause">
    <div class="clause-num"><b>01</b> Cláusula Primeira</div>
    <h3 class="clause-title">Do objeto</h3>
    <div class="clause-side">
      <p>O presente contrato tem por objeto a prestação, pelo CONTRATADO, de serviços técnicos especializados de implementação, configuração, desenvolvimento e acompanhamento operacional de soluções tecnológicas e estratégicas da CONTRATANTE, abrangendo, conforme escopo validado entre as partes:</p>
      <ul>
        <li>Planejamento, criação, execução e monitoramento de campanhas de tráfego pago nas plataformas <b>Google Ads</b> e <b>Meta Ads</b>;</li>
        <li>Gestão estratégica e operacional de <b>mídias sociais</b>, com utilização de ferramentas de análise, mensuração e trackeamento de desempenho;</li>
        <li>Desenvolvimento e entrega de <b>Landing Page</b> institucional/comercial para a CONTRATANTE;</li>
        <li>Administração e otimização do perfil da CONTRATANTE no <b>Google Meu Negócio</b>;</li>
        <li>Desenvolvimento, configuração e manutenção de sistemas de <b>automação, atendimento automatizado (bots), CRM e integrações</b>, com utilização de inteligência artificial, quando previstos no planejamento validado entre as partes.</li>
      </ul>
      <p>Os serviços poderão compreender automações e integrações, incluindo rotinas de acompanhamento e follow up, sempre observados os limites técnicos das plataformas utilizadas.</p>
      <p>Fica expressamente estabelecido que a atuação do CONTRATADO possui natureza técnica, não configurando obrigação de resultado comercial específico ou performance financeira determinada, limitando-se à adequada execução das atividades contratadas.</p>
      <p>Qualquer ampliação de escopo, inclusão de novas funcionalidades, desenvolvimento adicional ou atividade não expressamente prevista nesta cláusula dependerá de ajuste formal e escrito entre as partes, com definição de prazo e eventual readequação de remuneração.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>02</b> Cláusula Segunda</div>
    <h3 class="clause-title">Da execução dos serviços</h3>
    <div class="clause-side">
      <p>Os serviços serão prestados em dias úteis, em formato remoto, mediante interação entre as partes por meios digitais, podendo, se necessário, ocorrer troca de mensagens, registros de conversas e demonstrações operacionais, as quais poderão ser utilizadas para fins de acompanhamento, validação técnica e comprovação da execução contratual.</p>
      <p>Após o prazo de <b>7 (sete) dias</b> contados do início da execução, as partes realizarão avaliação do produto entregue, exclusivamente para verificação de aderência técnica ao escopo contratado, não se tratando de condição suspensiva, teste gratuito ou garantia de resultado comercial.</p>
    </div>
  </div>

  <div class="foot"><span>Eleva Digital · Contrato</span><span>Página 01</span></div>
</div>

<!-- ═════════════ PÁGINA 2: cláusulas 3, 4, 5 (parte 1) ═════════════ -->
<div class="page">
  <div class="head">
    <div class="brand-mini"><div class="dot">A</div>Eleva <span class="light">Digital</span></div>
    <span>Contrato de Prestação de Serviços</span>
  </div>

  <div class="clause">
    <div class="clause-num"><b>03</b> Cláusula Terceira</div>
    <h3 class="clause-title">Da natureza da prestação de serviços</h3>
    <div class="clause-side">
      <p>O presente CONTRATO será regido pelas disposições do Código Civil, especialmente pelos <b>artigos 593 a 609</b>, que tratam da prestação de serviços, excluindo-se expressamente qualquer aplicação da legislação trabalhista.</p>
      <p>As partes reconhecem e declaram, de comum acordo, que a presente relação contratual possui <b>natureza estritamente civil</b>, inexistindo entre CONTRATANTE e CONTRATADO qualquer vínculo empregatício, subordinação, pessoalidade, habitualidade ou dependência econômica, nos termos da Consolidação das Leis do Trabalho (CLT) ou da legislação previdenciária vigentes.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>04</b> Cláusula Quarta</div>
    <h3 class="clause-title">Do prazo</h3>
    <div class="clause-side">
      <p>O presente contrato tem início na data de sua assinatura e vigorará por <b>prazo indeterminado</b>.</p>
      <p>As partes poderão, a cada período trimestral, realizar reuniões de acompanhamento para análise estratégica dos indicadores de desempenho das ações implementadas, com a finalidade de avaliar os resultados e, se necessário, promover ajustes no planejamento.</p>
      <p>Eventual insatisfação com os resultados não implicará rescisão automática do contrato, podendo qualquer das partes, caso não haja interesse na continuidade da relação, denunciá-lo mediante notificação escrita com <b>antecedência mínima de 30 (trinta) dias</b>, observado o cumprimento das obrigações financeiras até o término do período de aviso prévio.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>05</b> Cláusula Quinta</div>
    <h3 class="clause-title">Do valor e forma de pagamento</h3>
    <div class="clause-side">
      <p>Pelos serviços ora contratados, a CONTRATANTE pagará ao CONTRATADO a remuneração mensal de <span class="marker">R$ ${A} (${g})</span>, mediante emissão de Nota Fiscal, com vencimento todo dia <span class="marker">${p}</span> de cada mês de competência, constituindo tal pagamento condição para a regular continuidade da prestação dos serviços.</p>
      <p>Além da remuneração pelo serviço, a CONTRATANTE arcará mensalmente com o investimento mínimo de <span class="marker">R$ ${r}</span> destinado diretamente às plataformas de mídia paga (Google Ads e/ou Meta Ads), valor este de titularidade exclusiva das referidas plataformas, não constituindo remuneração do CONTRATADO nem sendo por ele administrado em conta própria. O repasse deverá ocorrer diretamente nas contas das plataformas ou por meio indicado pelo CONTRATADO, dentro do prazo necessário para manutenção das campanhas ativas.</p>
    </div>
  </div>

  <div class="foot"><span>Eleva Digital · Contrato</span><span>Página 02</span></div>
</div>

<!-- ═════════════ PÁGINA 3: cláusula 5 (resto) ═════════════ -->
<div class="page">
  <div class="head">
    <div class="brand-mini"><div class="dot">A</div>Eleva <span class="light">Digital</span></div>
    <span>Contrato de Prestação de Serviços</span>
  </div>

  <div class="clause">
    <div class="clause-side">
      <p>Os custos com ferramentas, licenças de software de terceiros, APIs, serviços de mensageria, hospedagem, bancos de dados e processamento de inteligência artificial (a exemplo de <b>UAZAPI, OpenRouter, Supabase</b> e similares), necessários à operação dos sistemas, são de responsabilidade exclusiva da CONTRATANTE, devendo ser contratados e pagos diretamente por ela junto aos respectivos fornecedores, em contas de sua titularidade, não integrando a remuneração do CONTRATADO. O CONTRATADO indicará as ferramentas necessárias e poderá auxiliar na configuração, sem assumir a titularidade ou o custo de tais serviços.</p>
      <p>Os valores contratados serão <b>reajustados anualmente</b>, a cada período de 12 (doze) meses contados da data de início da vigência, mediante aplicação da variação acumulada do IPCA no período, salvo se outro índice vier a substituí-lo, ou se as partes ajustarem expressamente critério diverso por escrito.</p>
      <p>A remuneração ora pactuada possui natureza exclusivamente contraprestativa pelos serviços técnicos prestados, não sendo passível de restituição após iniciado o respectivo período mensal de execução, salvo ajuste expresso e formal entre as partes.</p>
      <div class="highlight">O atraso no pagamento por prazo superior a <b>10 (dez) dias</b> da data de vencimento autorizará o CONTRATADO a suspender a prestação dos serviços, incluindo a pausa de campanhas e a desativação temporária de sistemas, até a regularização, incidindo sobre o valor em atraso <b>multa de 2%</b>, <b>juros de mora de 1% ao mês</b> e correção monetária.</div>
    </div>
  </div>

  <div class="foot"><span>Eleva Digital · Contrato</span><span>Página 03</span></div>
</div>

<!-- ═════════════ PÁGINA 4: cláusulas 6 e 7 ═════════════ -->
<div class="page">
  <div class="head">
    <div class="brand-mini"><div class="dot">A</div>Eleva <span class="light">Digital</span></div>
    <span>Contrato de Prestação de Serviços</span>
  </div>

  <div class="clause">
    <div class="clause-num"><b>06</b> Cláusula Sexta</div>
    <h3 class="clause-title">Da propriedade intelectual</h3>
    <div class="clause-side">
      <p>Todo o código-fonte, arquitetura de software, lógica de programação, fluxos de automação, estruturas de banco de dados, metodologias, modelos de prompts de inteligência artificial e demais elementos técnicos desenvolvidos pelo CONTRATADO são e permanecerão de <b>sua propriedade intelectual exclusiva</b>, constituindo know-how e tecnologia proprietária da marca ELEVA DIGITAL, antes, durante e após a vigência deste contrato.</p>
      <p>Durante a vigência do contrato, a CONTRATANTE recebe <b>licença de uso, não exclusiva e intransferível</b>, dos sistemas e automações desenvolvidos, limitada à sua própria operação comercial, sendo vedada a revenda, sublicenciamento, engenharia reversa, cópia, redistribuição ou cessão a terceiros.</p>
      <p>São e permanecem de propriedade exclusiva da CONTRATANTE: (i) os conteúdos, textos, imagens, marca e materiais por ela fornecidos; (ii) a base de leads, clientes e contatos captados durante a operação; (iii) os dados comerciais e operacionais do seu negócio; e (iv) as contas de anúncio, perfis e ativos digitais criados em seu nome.</p>
      <p>Encerrado o contrato, o CONTRATADO devolverá à CONTRATANTE todos os dados, leads e ativos de titularidade desta, em formato padrão de mercado, e removerá seus acessos das contas da CONTRATANTE, retomando integralmente o código-fonte, a tecnologia e os sistemas de sua propriedade, conforme a Cláusula Sétima.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>07</b> Cláusula Sétima</div>
    <h3 class="clause-title">Do encerramento e dos sistemas</h3>
    <div class="clause-side">
      <p>Em caso de encerramento do contrato, por qualquer motivo, cessará automaticamente a licença de uso prevista na Cláusula Sexta. O CONTRATADO ficará autorizado a desativar e retirar os sistemas, bots, automações, integrações e códigos por ele desenvolvidos e mantidos, os quais constituem sua tecnologia proprietária, observado o prazo de aviso prévio.</p>
      <p>Antes da desativação, e mediante solicitação formal da CONTRATANTE realizada durante o período de aviso prévio, o CONTRATADO entregará à CONTRATANTE, em formato padrão de mercado, todos os dados, base de leads, históricos de atendimento e demais informações de titularidade da CONTRATANTE, garantindo que esta não fique privada de seus próprios dados e ativos.</p>
      <p>A CONTRATANTE manterá, em qualquer hipótese, a titularidade e o controle de suas contas de anúncio, perfis, redes sociais e ativos digitais próprios, dos quais o CONTRATADO removerá seus acessos.</p>
      <p>Caso a CONTRATANTE deseje manter em funcionamento, após o encerramento, os sistemas e tecnologias desenvolvidos pelo CONTRATADO, tal continuidade dependerá de <b>negociação específica e formal</b>, podendo incluir licenciamento, eventual cessão de código ou contratação de manutenção continuada, com remuneração própria a ser ajustada entre as partes.</p>
    </div>
  </div>

  <div class="foot"><span>Eleva Digital · Contrato</span><span>Página 04</span></div>
</div>

<!-- ═════════════ PÁGINA 5: cláusulas 8 e 9 ═════════════ -->
<div class="page">
  <div class="head">
    <div class="brand-mini"><div class="dot">A</div>Eleva <span class="light">Digital</span></div>
    <span>Contrato de Prestação de Serviços</span>
  </div>

  <div class="clause">
    <div class="clause-num"><b>08</b> Cláusula Oitava</div>
    <h3 class="clause-title">Da autorização, acessos e responsabilidade sobre as contas</h3>
    <div class="clause-side">
      <p>A CONTRATANTE autoriza o CONTRATADO a acessar e operar, para a finalidade exclusiva da prestação dos serviços contratados, suas contas e ativos digitais, incluindo: Gerenciador de Negócios e contas de anúncio Meta (Facebook/Instagram); contas Google Ads e Google Meu Negócio; perfis de redes sociais; e ferramentas de terceiros indicadas para a operação.</p>
      <p>A forma de concessão do acesso é de livre escolha e responsabilidade da CONTRATANTE, que declara ciência de que o método de <b>convite de parceria</b> é o recomendado pelas plataformas e o adotado preferencialmente pelo CONTRATADO.</p>
      <p>A CONTRATANTE declara ser a única titular e responsável por suas contas, perfis e credenciais, respondendo integralmente pela regularidade, segurança, conteúdo e conformidade delas com as políticas das plataformas e com a legislação aplicável. A CONTRATANTE isenta o CONTRATADO de responsabilidade por bloqueios, suspensões, restrições, banimentos, reprovações de anúncios ou quaisquer sanções aplicadas pelas plataformas de terceiros às suas contas.</p>
      <p>O CONTRATADO compromete-se a utilizar os acessos concedidos de forma diligente, ética e estritamente para a execução dos serviços, mantendo sigilo sobre as informações acessadas e adotando medidas razoáveis de segurança. Ao término da relação contratual, o CONTRATADO removerá seus acessos das contas da CONTRATANTE.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>09</b> Cláusula Nona</div>
    <h3 class="clause-title">Das plataformas de terceiros e do uso de Inteligência Artificial</h3>
    <div class="clause-side">
      <p>Os serviços prestados dependem de plataformas e ferramentas de terceiros (tais como Meta, Google, provedores de mensageria, hospedagem e modelos de inteligência artificial), cujas regras, disponibilidade, políticas e funcionamento estão fora do controle do CONTRATADO.</p>
      <p>O CONTRATADO não se responsabiliza por bloqueios, suspensões, restrições, banimentos, reprovações de anúncios, alterações de políticas, instabilidades ou indisponibilidades impostas por tais plataformas, ainda que afetem a continuidade ou os resultados das campanhas e sistemas, comprometendo-se, contudo, a envidar esforços técnicos razoáveis para mitigar e solucionar tais ocorrências.</p>
      <p>A CONTRATANTE reconhece que sistemas baseados em inteligência artificial, incluindo bots e automações de atendimento, possuem <b>natureza probabilística</b> e podem, eventualmente, gerar respostas imprecisas, incompletas ou inadequadas. O CONTRATADO compromete-se a configurar e ajustar tais sistemas conforme as boas práticas, não respondendo, todavia, por respostas pontuais incorretas geradas automaticamente, recomendando-se a supervisão humana em interações críticas.</p>
    </div>
  </div>

  <div class="foot"><span>Eleva Digital · Contrato</span><span>Página 05</span></div>
</div>

<!-- ═════════════ PÁGINA 6: cláusulas 10, 11, 12, 13 ═════════════ -->
<div class="page">
  <div class="head">
    <div class="brand-mini"><div class="dot">A</div>Eleva <span class="light">Digital</span></div>
    <span>Contrato de Prestação de Serviços</span>
  </div>

  <div class="clause">
    <div class="clause-num"><b>10</b> Cláusula Décima</div>
    <h3 class="clause-title">Das obrigações do contratado</h3>
    <div class="clause-side">
      <p>O CONTRATADO obriga-se a executar os serviços com diligência, técnica e profissionalismo, observando as boas práticas de mercado, respeitando as limitações operacionais das plataformas utilizadas e atuando de forma autônoma, sem qualquer subordinação jurídica, técnica ou econômica à CONTRATANTE.</p>
      <p>Não se responsabiliza o CONTRATADO por resultados comerciais, captação de leads ou performance financeira da CONTRATANTE, limitando-se sua obrigação à entrega técnica das soluções contratadas.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>11</b> Cláusula Décima Primeira</div>
    <h3 class="clause-title">Das obrigações da contratante</h3>
    <div class="clause-side">
      <p>Compete à CONTRATANTE fornecer todas as informações, acessos, autorizações e dados necessários à correta execução dos serviços, respondendo integralmente por conteúdos, dados inseridos, estratégias comerciais e uso final das ferramentas implementadas.</p>
      <p>Eventuais atrasos ou falhas decorrentes da ausência de informações ou acessos não poderão ser imputados ao CONTRATADO, ficando os prazos automaticamente prorrogados pelo período equivalente ao atraso.</p>
      <p>A CONTRATANTE responsabiliza-se pela <b>veracidade, legalidade e regularidade</b> dos produtos, serviços e ofertas divulgados nas campanhas, isentando o CONTRATADO de qualquer responsabilidade decorrente de propaganda enganosa, infração a direitos de terceiros ou descumprimento de normas aplicáveis ao seu ramo de atividade.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>12</b> Cláusula Décima Segunda</div>
    <h3 class="clause-title">Da limitação de responsabilidade</h3>
    <div class="clause-side">
      <p>A responsabilidade do CONTRATADO, por quaisquer danos comprovadamente decorrentes de sua atuação, ficará limitada ao <b>valor total efetivamente pago pela CONTRATANTE nos últimos 3 (três) meses</b> de vigência contratual.</p>
      <p>Fica expressamente excluída a responsabilidade por lucros cessantes, danos indiretos, perda de oportunidade, prejuízos comerciais ou expectativas de resultado.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>13</b> Cláusula Décima Terceira</div>
    <h3 class="clause-title">Da confidencialidade</h3>
    <div class="clause-side">
      <p>As partes comprometem-se a manter sigilo sobre todas as Informações Confidenciais a que tiverem acesso em razão deste contrato. Consideram-se confidenciais todas as informações, em qualquer formato, incluindo, mas não se limitando a: dados de clientes e leads, bases de contatos, estratégias comerciais, campanhas, configurações, fluxos de trabalho, relatórios, credenciais e acessos, conversas, métricas, preços e metodologias.</p>
    </div>
  </div>

  <div class="foot"><span>Eleva Digital · Contrato</span><span>Página 06</span></div>
</div>

<!-- ═════════════ PÁGINA 7: cláusula 13 (resto), 14, 15 ═════════════ -->
<div class="page">
  <div class="head">
    <div class="brand-mini"><div class="dot">A</div>Eleva <span class="light">Digital</span></div>
    <span>Contrato de Prestação de Serviços</span>
  </div>

  <div class="clause">
    <div class="clause-side">
      <p>Não se consideram confidenciais as informações que: (a) sejam ou se tornem públicas sem culpa da parte receptora; (b) já fossem comprovadamente conhecidas antes da revelação; ou (c) devam ser reveladas por exigência legal ou judicial, hipótese em que a parte notificará a outra previamente, quando possível.</p>
      <p>A obrigação de confidencialidade é recíproca e permanecerá vigente durante toda a relação contratual e pelo prazo de <b>2 (dois) anos</b> após o seu encerramento. Ressalva-se que o know-how, as metodologias e a tecnologia proprietária do CONTRATADO não constituem informação confidencial da CONTRATANTE, nos termos da Cláusula Sexta.</p>
      <p>O descumprimento das obrigações de confidencialidade previstas nesta cláusula sujeitará a parte infratora à reparação integral das perdas e danos comprovadamente causados, sem prejuízo das responsabilidades civis, administrativas e penais cabíveis, nos termos da legislação aplicável, em especial a <b>Lei nº 13.709/2018 (LGPD)</b> e o Código Civil.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>14</b> Cláusula Décima Quarta</div>
    <h3 class="clause-title">Da proteção de dados pessoais (LGPD)</h3>
    <div class="clause-side">
      <p>As partes obrigam-se ao cumprimento integral da <b>Lei nº 13.709/2018</b> (Lei Geral de Proteção de Dados Pessoais, LGPD) e demais normas aplicáveis ao tratamento de dados pessoais.</p>
      <p>Para os fins desta cláusula, a CONTRATANTE figura como <b>CONTROLADORA</b> dos dados pessoais de seus leads, clientes e contatos, cabendo a ela a base legal, a finalidade e as decisões sobre o tratamento. O CONTRATADO atua como <b>OPERADOR</b>, realizando o tratamento de dados estritamente conforme as instruções e finalidades determinadas pela CONTRATANTE e necessárias à execução dos serviços.</p>
      <p>O CONTRATADO compromete-se a adotar medidas técnicas e administrativas razoáveis de segurança da informação e a não utilizar os dados pessoais tratados para finalidade diversa da execução contratual.</p>
      <p>Encerrado o contrato, o CONTRATADO eliminará ou devolverá os dados pessoais sob sua custódia, conforme orientação da CONTRATANTE, ressalvadas as hipóteses de guarda obrigatória previstas em lei.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>15</b> Cláusula Décima Quinta</div>
    <h3 class="clause-title">Do uso para fins de portfólio e divulgação</h3>
    <div class="clause-side">
      <p>A CONTRATANTE <span class="check ${T?"on":""}"><span class="box"></span>AUTORIZA</span> <span class="check ${T?"":"on"}"><span class="box"></span>NÃO AUTORIZA</span> o CONTRATADO a mencionar a prestação dos serviços e a utilizar resultados, métricas, peças e demonstrações desenvolvidas como referência de <b>portfólio</b>, em materiais comerciais, redes sociais e conteúdos institucionais da marca ELEVA DIGITAL.</p>
      <p>Caso autorizado, o CONTRATADO compromete-se a preservar a confidencialidade de dados sensíveis e informações estratégicas, podendo, quando solicitado, anonimizar a identificação da CONTRATANTE. A autorização poderá ser revogada a qualquer tempo mediante comunicação escrita, sem efeitos retroativos sobre materiais já publicados.</p>
    </div>
  </div>

  <div class="foot"><span>Eleva Digital · Contrato</span><span>Página 07</span></div>
</div>

<!-- ═════════════ PÁGINA 8: cláusula 16, 17, 18 ═════════════ -->
<div class="page">
  <div class="head">
    <div class="brand-mini"><div class="dot">A</div>Eleva <span class="light">Digital</span></div>
    <span>Contrato de Prestação de Serviços</span>
  </div>

  <div class="clause">
    <div class="clause-num"><b>16</b> Cláusula Décima Sexta</div>
    <h3 class="clause-title">Da rescisão</h3>
    <div class="clause-side">
      <p>O presente contrato poderá ser rescindido por comum acordo entre as partes ou por infração contratual relevante devidamente comprovada, mediante notificação escrita.</p>
      <p>Na hipótese de rescisão imotivada por iniciativa de qualquer das partes, o encerramento deverá ser comunicado por escrito com <b>antecedência mínima de 30 (trinta) dias</b>, período durante o qual permanecerão plenamente vigentes todas as obrigações contratuais, inclusive o pagamento integral da remuneração mensal.</p>
      <p>O descumprimento do prazo de aviso prévio implicará a obrigação de pagamento do valor correspondente ao período não observado, sem prejuízo de eventuais perdas e danos.</p>
      <p>Em qualquer hipótese de rescisão após o início da execução dos serviços, não haverá devolução de valores já pagos ou referentes a período mensal já iniciado, considerando a natureza técnica, estratégica e intelectual das atividades desempenhadas.</p>
      <p>O inadimplemento de <b>2 (duas) mensalidades consecutivas</b> autorizará o CONTRATADO a rescindir o contrato de pleno direito, independentemente de aviso prévio, sem prejuízo da cobrança dos valores devidos.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>17</b> Cláusula Décima Sétima</div>
    <h3 class="clause-title">Das disposições gerais</h3>
    <div class="clause-side">
      <p>Cada parte será responsável pelos tributos que lhes forem inerentes, conforme legislação em vigor.</p>
      <p>As partes mantêm e se manterão em conformidade e se obrigam ao cumprimento de todas as normas e leis anticorrupção e relativas à prevenção à lavagem de dinheiro, inclusive a <b>Lei nº 9.613/1998</b>, a <b>Lei nº 12.529/2011</b> e a <b>Lei nº 12.846/2013</b>.</p>
      <p>A tolerância de qualquer das partes quanto ao descumprimento de cláusulas deste contrato será considerada mera liberalidade, não constituindo novação, renúncia ou alteração do pactuado.</p>
      <p>Caso qualquer disposição deste contrato seja considerada inválida ou inexequível, as demais permanecerão em pleno vigor e efeito.</p>
      <p>As partes reconhecem e aceitam que este instrumento poderá ser assinado por meio eletrônico ou digital, utilizando-se de certificados digitais emitidos no âmbito da <b>ICP-Brasil</b>, ou por meio de plataformas de assinatura eletrônica que assegurem a autenticidade, integridade e validade jurídica do documento, nos termos da Medida Provisória nº 2.200-2/2001.</p>
    </div>
  </div>

  <div class="clause">
    <div class="clause-num"><b>18</b> Cláusula Décima Oitava</div>
    <h3 class="clause-title">Do foro</h3>
    <div class="clause-side">
      <p>Fica eleito o <b>foro da Comarca de Taubaté/SP</b>, com renúncia a qualquer outro, por mais privilegiado que seja, para dirimir eventuais controvérsias oriundas deste contrato.</p>
    </div>
  </div>

  <div class="foot"><span>Eleva Digital · Contrato</span><span>Página 08</span></div>
</div>

<!-- ═════════════ PÁGINA FINAL: assinatura + testemunhas ═════════════ -->
<div class="page">
  <div class="head">
    <div class="brand-mini"><div class="dot">A</div>Eleva <span class="light">Digital</span></div>
    <span>Contrato de Prestação de Serviços</span>
  </div>

  <div class="sign-block">
    E, por estarem justas e contratadas, as partes assinam o presente instrumento em <b>duas vias de igual teor e forma</b>.
  </div>

  <div class="sign-date">
    <span>${z}</span>, <span>${D}</span> de <span>${k}</span> de 20<span>${String(x).slice(-2)}</span>.
  </div>

  <div class="sign-pair">
    <div class="sign-col">
      <div class="line"></div>
      <div class="name"><span class="marker">${o}</span></div>
      <div class="role">CONTRATANTE</div>
    </div>
    <div class="sign-col contratado">
      <div class="line"></div>
      <div class="name">Edmilson Rosa Lira Junior</div>
      <div class="role">Eleva Digital · CONTRATADO</div>
    </div>
  </div>

  <div class="testemunhas">
    <h4>● Testemunhas</h4>
    <div class="test-row"><b>01</b><div class="line"></div><div><div class="line"></div><div class="lbl">CPF</div></div></div>
    <div class="test-row"><b>02</b><div class="line"></div><div><div class="line"></div><div class="lbl">CPF</div></div></div>
  </div>

  <div class="foot"><span>Eleva Digital · Contrato</span><span>Página 09 · Final</span></div>
</div>

</body>
</html>`}function M(e){const s=n=>String(n??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),i=s(e.razaoSocial||e.clienteNome||"CLIENTE"),a=s(e.diaVencimento||"__"),o=[{n:"1",t:"O que eu entrego",d:"Tráfego pago (Google e Meta), gestão de redes, landing page, Google Meu Negócio e, quando combinado, sistemas de automação, bot e CRM com IA. Meu compromisso é a execução técnica de qualidade, não prometo um número exato de vendas, porque isso depende de muitos fatores."},{n:"2",t:"Quanto custa",d:`Mensalidade combinada, com nota fiscal, vencendo todo dia <span class="mark">${a}</span>. Reajuste só uma vez por ano (pelo IPCA). Se atrasar, posso pausar o serviço até regularizar.`},{n:"3",t:"As ferramentas você paga direto",d:"A verba de anúncios e as ferramentas (UAZAPI, OpenRouter, Supabase, etc.) você contrata e paga direto nas plataformas, em contas suas. Eu indico e configuro, mas o dinheiro não passa por mim, isso é mais seguro e transparente pra você."},{n:"4",t:"Eu nunca peço sua senha",d:"O acesso às suas contas é sempre por convite oficial de parceiro. Você mantém o controle e pode me remover quando quiser. Suas contas são sempre suas."},{n:"5",t:"O que é seu, é seu",d:"Seus dados, seus leads, seus clientes, suas contas de anúncio e redes sociais são 100% seus, durante e depois do contrato. Se a gente encerrar, eu te entrego tudo isso organizado."},{n:"6",t:"A tecnologia é minha",d:"O código e os sistemas que eu construo são a minha tecnologia (meu know-how). Você usa enquanto a gente trabalha junto. Se encerrarmos, eu levo a tecnologia comigo, mas você fica com tudo que é seu (dados e leads). Se quiser manter o sistema funcionando depois, a gente combina isso à parte."},{n:"7",t:"Plataformas e IA têm limites",d:"Meta e Google às vezes bloqueiam contas ou mudam regras, isso foge do meu controle, mas eu faço o possível pra resolver. Sistemas de IA também podem errar de vez em quando, por isso recomendo supervisão humana em momentos importantes."},{n:"8",t:"Pra sair, é tranquilo",d:"Qualquer um de nós pode encerrar avisando com 30 dias de antecedência, por escrito. Sem pegadinha, sem fidelidade longa. O que já foi pago e o mês em andamento não voltam."}].map(n=>`
    <div class="item">
      <div class="num">${n.n}</div>
      <div class="body">
        <h3>${n.t}</h3>
        <p>${n.d}</p>
      </div>
    </div>`).join("");return`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Resumo do Contrato · ${i}</title>
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
    <span>Cliente · <span class="name">${i}</span></span>
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
    ${o}
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
</html>`}const E=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];function B(e){return String(e??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}async function G(e){let s=e;if(s!=null&&s.id){const{data:n}=await l.from("clientes").select("*").eq("id",s.id).maybeSingle();n&&(s=n)}const i=new Date,a=i.getDate(),t=E[i.getMonth()],o=i.getFullYear();f("Gerar contrato — "+(s.nome||"Cliente"),V(s,a,t,o),`<button class="btn bg" id="ct-cancel">Cancelar</button>
     <button class="btn bg" id="ct-resumo">Gerar resumo simples</button>
     <button class="btn bp" id="ct-gerar">Gerar contrato completo</button>`),document.getElementById("ct-cancel").addEventListener("click",c),document.getElementById("ct-gerar").addEventListener("click",()=>C(s,"completo")),document.getElementById("ct-resumo").addEventListener("click",()=>C(s,"resumo"))}function V(e,s,i,a){const t=(o,n)=>`value="${B(n??"")}"`;return`
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="background:rgba(193,255,42,.06);border-left:3px solid var(--accent);padding:10px 14px;border-radius:0 6px 6px 0;font-size:12px;color:var(--text-2);line-height:1.5">
        Os campos abaixo já vêm preenchidos pelo CRM quando disponíveis. O que você ajustar aqui fica salvo na ficha do cliente pra próxima vez.
      </div>

      <div style="font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em">Contratante</div>
      <div class="frow">
        <div class="fg"><label class="fl">Razão social *</label><input class="fi" id="ct-razao" ${t("razao",e.razao_social||e.empresa)} placeholder="Empresa Exemplo LTDA"></div>
        <div class="fg"><label class="fl">CNPJ *</label><input class="fi" id="ct-cnpj" ${t("cnpj",e.cnpj)} placeholder="00.000.000/0001-00"></div>
      </div>
      <div class="fg"><label class="fl">Endereço completo *</label><input class="fi" id="ct-end" ${t("end",e.endereco)} placeholder="Rua, número, bairro, cidade/UF, CEP"></div>
      <div class="frow">
        <div class="fg"><label class="fl">Nome do representante *</label><input class="fi" id="ct-rep" ${t("rep",e.representante||e.nome)}></div>
        <div class="fg"><label class="fl">E-mail do representante *</label><input class="fi" id="ct-email" ${t("email",e.email)} placeholder="contato@empresa.com"></div>
      </div>

      <div style="font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Valores</div>
      <div class="frow">
        <div class="fg"><label class="fl">Mensalidade (R$) *</label><input class="fi" id="ct-valor" type="number" step="0.01" ${t("valor",e.valor)}></div>
        <div class="fg"><label class="fl">Por extenso *</label><input class="fi" id="ct-valor-ext" placeholder="três mil reais"></div>
      </div>
      <div class="frow">
        <div class="fg"><label class="fl">Dia de vencimento *</label><input class="fi" id="ct-dia" type="number" min="1" max="28" ${t("dia",e.dia_vencimento)}></div>
        <div class="fg"><label class="fl">Mínimo de mídia (R$) *</label><input class="fi" id="ct-midia" type="number" step="0.01" ${t("midia",e.valor_midia)}></div>
      </div>

      <div style="font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Assinatura</div>
      <div class="frow">
        <div class="fg"><label class="fl">Cidade</label><input class="fi" id="ct-cidade" value="Taubaté"></div>
        <div class="fg"><label class="fl">Dia</label><input class="fi" id="ct-data-dia" type="number" min="1" max="31" value="${s}"></div>
      </div>
      <div class="frow">
        <div class="fg"><label class="fl">Mês</label>
          <select class="fsl" id="ct-data-mes">
            ${E.map((o,n)=>`<option value="${o}"${o===i?" selected":""}>${o}</option>`).join("")}
          </select>
        </div>
        <div class="fg"><label class="fl">Ano</label><input class="fi" id="ct-data-ano" type="number" min="2024" max="2050" value="${a}"></div>
      </div>

      <div class="fg" style="margin-top:6px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
          <input type="checkbox" id="ct-portfolio" style="width:16px;height:16px;cursor:pointer">
          Autoriza o uso para fins de portfólio (Cláusula 15ª)
        </label>
      </div>
    </div>`}async function C(e,s){const i=r=>document.getElementById(r).value.trim(),a=r=>parseFloat(document.getElementById(r).value)||null,t=r=>parseInt(document.getElementById(r).value,10)||null,o={razaoSocial:i("ct-razao"),cnpj:i("ct-cnpj"),endereco:i("ct-end"),representante:i("ct-rep"),email:i("ct-email"),valor:a("ct-valor"),valorExtenso:i("ct-valor-ext"),diaVencimento:t("ct-dia"),valorMidia:a("ct-midia"),cidade:i("ct-cidade"),dataDia:t("ct-data-dia"),dataMes:i("ct-data-mes"),dataAno:t("ct-data-ano"),autorizaPortfolio:document.getElementById("ct-portfolio").checked,docNum:"001",clienteNome:e.nome||""};if((s==="resumo"?["diaVencimento"]:["razaoSocial","cnpj","endereco","representante","email","valor","valorExtenso","diaVencimento","valorMidia"]).filter(r=>!o[r]&&o[r]!==0).length){d("Preencha os campos obrigatórios.","er");return}if(e!=null&&e.id){const r={atualizado_em:new Date().toISOString()};o.razaoSocial&&(r.razao_social=o.razaoSocial),o.cnpj&&(r.cnpj=o.cnpj),o.endereco&&(r.endereco=o.endereco),o.representante&&(r.representante=o.representante),o.email&&(r.email=o.email),o.valor&&(r.valor=o.valor),o.valorMidia&&(r.valor_midia=o.valorMidia),o.diaVencimento&&(r.dia_vencimento=o.diaVencimento),await l.from("clientes").update(r).eq("id",e.id)}o.valor&&(o.valor=Number(o.valor).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})),o.valorMidia&&(o.valorMidia=Number(o.valorMidia).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}));const g=s==="resumo"?M(o):L(o),p=window.open("","_blank");if(!p){d("Permita pop-ups pra abrir o documento.","er");return}p.document.write(g),p.document.close(),c(),d(s==="resumo"?"Resumo gerado em nova aba.":"Contrato gerado em nova aba.")}let v=[],m="todos",u="";async function h(){document.getElementById("tbacts").innerHTML='<button class="btn bp" id="btn-add-cliente">+ Novo cliente</button>',document.getElementById("btn-add-cliente").addEventListener("click",H);const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';const{data:s,error:i}=await $("clientes",{order:{column:"criado_em",ascending:!1}});if(i){e.innerHTML=`<div class="empty">Erro: ${i.message}</div>`;return}v=s||[],b()}function b(){let e=v;if(m!=="todos"&&(e=e.filter(a=>a.status===m)),u){const a=u.toLowerCase();e=e.filter(t=>t.nome.toLowerCase().includes(a)||(t.empresa||"").toLowerCase().includes(a))}const s=["todos",..._].map(a=>`<div class="fc${m===a?" on":""}" data-fil="${a}">
      ${a==="todos"?"Todos":O[a]||a.charAt(0).toUpperCase()+a.slice(1)}
    </div>`).join(""),i=e.length?e.map(a=>`
        <tr data-id="${a.id}" class="cl-row">
          <td class="tn">${a.nome}</td>
          <td class="tm">${a.empresa||"—"}</td>
          <td class="tm">${a.servico||"—"}</td>
          <td>${I(a.status)}${a.status==="em_pausa"&&a.pausado_ate?`<div style="font-size:10px;color:var(--text-3);margin-top:2px">até ${new Date(a.pausado_ate).toLocaleDateString("pt-BR")}</div>`:""}</td>
          <td>${S(a.temperatura)}</td>
          <td>${P(a.valor)}</td>
          <td class="tm">${a.whatsapp?`<a href="https://wa.me/${a.whatsapp.replace(/\D/g,"")}" target="_blank" class="wa-link">${a.whatsapp}</a>`:"—"}</td>
          <td class="tm">${F(a.criado_em)}</td>
          <td><button class="btn bd bsm bic del-cl" data-id="${a.id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button></td>
        </tr>`).join(""):'<tr><td colspan="8"><div class="empty">Nenhum resultado.</div></td></tr>';document.getElementById("content").innerHTML=`
    <div class="tw">
      <div class="th">
        <h3>Clientes <span style="color:var(--text-3);font-weight:400">(${e.length})</span></h3>
        <input class="si" id="cl-search" placeholder="Buscar..." value="${u}">
      </div>
      <div class="fr" id="cl-filters">${s}</div>
      <table>
        <thead><tr><th>Nome</th><th>Empresa</th><th>Serviço</th><th>Status</th><th>Temp.</th><th>Valor</th><th>WhatsApp</th><th>Entrada</th><th></th></tr></thead>
        <tbody>${i}</tbody>
      </table>
    </div>`,document.getElementById("cl-search").addEventListener("input",a=>{u=a.target.value,b()}),document.getElementById("cl-filters").addEventListener("click",a=>{const t=a.target.closest(".fc");t&&(m=t.dataset.fil,b())}),document.getElementById("content").addEventListener("click",a=>{const t=a.target.closest(".cl-row"),o=a.target.closest(".del-cl");o?(a.stopPropagation(),Q(o.dataset.id)):t&&w(t.dataset.id)})}function N(e={}){const s=_.map(t=>{const o=t==="em_pausa"?"Em pausa (não agora)":O[t]||t.charAt(0).toUpperCase()+t.slice(1);return`<option value="${t}"${e.status===t?" selected":""}>${o}</option>`}).join(""),i='<option value="">— não definida —</option>'+j.map(t=>{const o={quente:"🔥 Quente",morno:"🌡️ Morno",frio:"❄️ Frio",gelado:"🧊 Gelado"};return`<option value="${t}"${e.temperatura===t?" selected":""}>${o[t]}</option>`}).join(""),a=e.pausado_ate?new Date(e.pausado_ate).toISOString().slice(0,10):"";return`
    <div class="frow">
      <div class="fg"><label class="fl">Nome *</label><input class="fi" id="fn" value="${e.nome||""}"></div>
      <div class="fg"><label class="fl">Empresa</label><input class="fi" id="fe" value="${e.empresa||""}"></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">WhatsApp</label><input class="fi" id="fw" value="${e.whatsapp||""}" placeholder="5512..."></div>
      <div class="fg"><label class="fl">E-mail</label><input class="fi" id="fem" value="${e.email||""}"></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Serviço</label><input class="fi" id="fs" value="${e.servico||""}" placeholder="Ex: Tráfego + IA"></div>
      <div class="fg"><label class="fl">Valor/mês (R$)</label><input class="fi" id="fv" type="number" value="${e.valor||""}"></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="fst" onchange="document.getElementById('pausa-row').style.display=this.value==='em_pausa'?'flex':'none'">${s}</select></div>
      <div class="fg"><label class="fl">Temperatura da conversa</label><select class="fsl" id="ftemp">${i}</select></div>
    </div>
    <div class="frow" id="pausa-row" style="display:${e.status==="em_pausa"?"flex":"none"}">
      <div class="fg" style="grid-column:1/-1">
        <label class="fl">Retomar contato em</label>
        <input class="fi" id="fpause" type="date" value="${a}" min="${new Date().toISOString().slice(0,10)}">
        <span style="font-size:11px;color:var(--text-3);margin-top:4px">O lead ficará pausado até esta data — o follow-up automático não será disparado nesse período.</span>
      </div>
    </div>
    <div class="fg"><label class="fl">Observações / notas da conversa</label><textarea class="fta" id="fob">${e.observacoes||""}</textarea></div>`}function U(){const e=document.getElementById("fst").value,s=document.getElementById("fpause");return{nome:document.getElementById("fn").value.trim(),empresa:document.getElementById("fe").value.trim(),whatsapp:document.getElementById("fw").value.trim(),email:document.getElementById("fem").value.trim(),servico:document.getElementById("fs").value.trim(),valor:parseFloat(document.getElementById("fv").value)||null,status:e,temperatura:document.getElementById("ftemp").value||null,pausado_ate:e==="em_pausa"&&(s!=null&&s.value)?new Date(s.value).toISOString():null,observacoes:document.getElementById("fob").value.trim(),atualizado_em:new Date().toISOString()}}function H(){f("Novo cliente",N(),`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`),document.getElementById("m-cancel").addEventListener("click",c),document.getElementById("m-save").addEventListener("click",()=>y())}async function w(e,s){let i=v.find(a=>a.id===e);if(!i){const{data:a}=await l.from("clientes").select("*").eq("id",e).maybeSingle();i=a}if(!i){d("Cliente não encontrado.","er");return}f("Editar cliente",N(i),`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bg" id="m-contrato">Gerar contrato</button>
     <button class="btn bp" id="m-save">Salvar</button>`),document.getElementById("m-cancel").addEventListener("click",c),document.getElementById("m-contrato").addEventListener("click",()=>{c(),G(i)}),document.getElementById("m-save").addEventListener("click",()=>y(e,s))}async function y(e,s){const i=U();if(!i.nome){d("Nome obrigatório.","er");return}const{error:a}=e?await l.from("clientes").update(i).eq("id",e):await l.from("clientes").insert(i);if(a){d("Erro ao salvar.","er"),console.error(a);return}d(e?"Cliente atualizado.":"Cliente adicionado."),c(),s?s():h()}async function Q(e){if(!confirm("Remover este cliente?"))return;const{error:s}=await l.from("clientes").delete().eq("id",e);if(s){d("Erro.","er");return}d("Removido."),h()}const Z=Object.freeze(Object.defineProperty({__proto__:null,get _cl(){return v},editCliente:w,render:h},Symbol.toStringTag,{value:"Module"}));export{Z as c,w as e,G as g};
