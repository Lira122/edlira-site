// Roda 1x pra inserir os 3 posts iniciais.
//   SB_KEY=sb_secret_xxx node supabase/seed-blog-posts.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Tenta ler bot/.env se SB_KEY não tiver setado
if (!process.env.SB_KEY) {
  try {
    const envPath = path.join(__dirname, '..', 'bot', '.env')
    const envText = fs.readFileSync(envPath, 'utf8')
    const m = envText.match(/^SB_KEY=(.+)$/m)
    if (m) process.env.SB_KEY = m[1].trim()
  } catch {}
}

const SB_URL = 'https://flzpblpegoqjxaacjvhf.supabase.co'
const KEY = process.env.SB_KEY
if (!KEY) { console.error('Falta SB_KEY'); process.exit(1) }

const sb = createClient(SB_URL, KEY)

const POSTS = [
  {
    slug: 'quanto-custa-anuncio-instagram-taubate-2026',
    titulo: 'Quanto custa anúncio no Instagram em Taubaté em 2026',
    subtitulo: 'Valores reais, faixa de orçamento e o que esperar de retorno no Vale do Paraíba',
    resumo: 'Guia prático sobre quanto investir em anúncio no Instagram pra negócio local em Taubaté. Faixas de orçamento, CPL real do Vale do Paraíba e quando vale a pena começar.',
    keywords: 'quanto custa anuncio instagram taubate, preço anuncio instagram, instagram ads vale do paraiba, custo trafego pago taubate, orçamento instagram ads',
    tags: ['Tráfego Pago', 'Instagram Ads', 'Taubaté', 'Orçamento'],
    autor: 'Lira',
    publicado: true,
    conteudo: `O preço do anúncio no Instagram não tem **valor fixo** — você define o orçamento. O Instagram (Meta) cobra por **leilão**: quanto mais empresas querendo aparecer pro mesmo público, mais caro fica. Em Taubaté e no Vale do Paraíba, a competição ainda é baixa comparado a São Paulo capital, e isso é a sua vantagem.

Esse post quebra **quanto custa de verdade** pra anunciar aqui em 2026, baseado no que a gente vê rodando em campanhas reais de clientes da Eleva Digital.

## A faixa real de investimento em Taubaté

Pra ter alguma chance de gerar resultado consistente, o piso é **R$ 600 a R$ 900 por mês em orçamento de mídia** (sem contar a agência ou o profissional). Abaixo disso, o algoritmo do Instagram não tem dado suficiente pra otimizar — você vai gastar do mesmo jeito e não vai aprender nada.

| Cenário | Orçamento mensal | O que esperar |
|---|---|---|
| **Teste mínimo** | R$ 600 – R$ 900 | Validar criativo e público. 30 a 80 leads/mês. |
| **Operação saudável** | R$ 1.500 – R$ 3.000 | Fluxo consistente de cliente novo. ROI mensurável. |
| **Escala** | R$ 4.000 + | Crescimento agressivo. Múltiplos públicos rodando. |

Esses valores são pro **investimento direto no Meta**. Gestão de tráfego, criativo e estratégia entram por fora.

## Quanto custa cada clique e cada lead no Vale do Paraíba

Em janeiro de 2026, rodando campanhas pra clientes em Taubaté, São José dos Campos e Jacareí, a gente vê esses números:

- **CPC médio** (custo por clique): R$ 0,80 a R$ 2,40
- **CPM médio** (custo por mil impressões): R$ 6 a R$ 22
- **CPL médio** (custo por lead via formulário): R$ 8 a R$ 35
- **CPL no WhatsApp** (cliente já chamando direto): R$ 12 a R$ 60

Esses valores variam **muito** por segmento. Estética e odontologia ficam no topo da faixa (concorrência alta). Comércio local, pet shop, lanchonete ficam no piso.

> Numa campanha de estética em Taubaté que rodamos no início desse ano, o CPL ficou em R$ 18 nos primeiros 15 dias. Depois dos ajustes de criativo e público, caiu pra R$ 11. Em São Paulo capital, a mesma campanha estaria custando o dobro.

## O custo "invisível" que ninguém te conta

Investir R$ 1.000 no Meta **não significa gerar R$ 1.000 de vendas**. Pra ter retorno previsível, você precisa de:

1. **Criativo bom** — sem isso, nenhum orçamento salva. Vídeos curtos, autênticos e que **mostram o produto** funcionam melhor que foto bonita.
2. **Landing page ou WhatsApp preparado** — anúncio mandando pro Instagram (que ninguém checa direito) é dinheiro queimado. WhatsApp com atendimento rápido converte 3-5x mais.
3. **Acompanhamento dos números** — pelo menos uma vez por semana alguém precisa olhar e ajustar. "Botar e esquecer" mata 70% dos investimentos.

## Quando vale a pena começar a anunciar?

Se você responde **sim** pra essas 3 perguntas, anunciar no Instagram em Taubaté faz sentido:

- ✅ Tenho um produto/serviço com **margem mínima de R$ 80** (pra absorver o custo de aquisição)
- ✅ Consigo **atender** novos clientes (não adianta gerar 100 leads e não dar conta)
- ✅ Posso **manter** o investimento por **pelo menos 90 dias** (campanha sem tempo não otimiza)

Se respondeu não pra alguma, **espera**. Anúncio antes de estar pronto é o jeito mais rápido de criar a impressão errada de que "Instagram não funciona pro meu negócio".

## Quanto custa contratar uma agência pra cuidar disso

Em Taubaté e Vale do Paraíba, o investimento em **gestão de tráfego** com agência sério fica entre **R$ 900 e R$ 2.500/mês** (varia conforme escopo: só Meta Ads, Meta + Google, com criativo incluso ou não).

Existe quem cobre R$ 400 — geralmente é freelancer começando ou alguém que vai rodar campanha automática sem cuidado. Também existe quem cobre R$ 5.000+ — geralmente é estrutura grande de São Paulo atendendo remoto.

**O bom custo-benefício pra negócio local** fica na faixa intermediária: agência pequena, próxima, que conhece o público da região, com 5-15 clientes ativos. Aí o preço bate com a entrega.

## Resumo: quanto separar pra começar

Se você tá começando agora:

- **R$ 900 de mídia** + **R$ 900 de gestão** = **R$ 1.800/mês** total
- Compromete por 90 dias (mínimo)
- Espera retorno mensurável a partir do 2º mês

Esse é o ponto mais honesto de início pra negócio local. Abaixo disso, você tá rezando. Acima disso, você tá tentando correr antes de andar.

E lembra: o Instagram **não é mágico**. Ele amplifica o que você já tem. Se seu produto é bom e seu atendimento é rápido, o anúncio multiplica. Se não, ele acelera o problema.`,
  },

  {
    slug: 'como-escolher-agencia-marketing-digital-vale-paraiba',
    titulo: 'Como escolher uma agência de marketing digital no Vale do Paraíba',
    subtitulo: 'Checklist de 9 perguntas pra não cair em furada na hora de contratar',
    resumo: 'Como avaliar e escolher uma agência de marketing digital no Vale do Paraíba sem cair em furada. Perguntas certas, sinais de alerta e o que esperar de uma agência séria.',
    keywords: 'agencia marketing digital taubate, agencia marketing vale do paraiba, como escolher agencia marketing, agencia trafego pago taubate, marketing digital sao jose dos campos',
    tags: ['Agência', 'Vale do Paraíba', 'Contratação', 'Decisão'],
    autor: 'Lira',
    publicado: true,
    conteudo: `Contratar agência de marketing digital é como contratar contador: você não vê o trabalho acontecendo no dia a dia, e quando vê que tá ruim, já queimou meses de orçamento. No Vale do Paraíba — Taubaté, São José dos Campos, Jacareí, Pinda — tem dezenas de agências e freelancers oferecendo serviço, com preços que vão de R$ 400 a R$ 5.000 por mês. Como saber qual é a certa pra você?

Esse post é o **checklist que eu daria pro meu primo** se ele tivesse esse problema.

## As 9 perguntas que separam agência séria de vendedor de fumaça

### 1. "Quanto tempo demora pra ver resultado?"

**Resposta ruim:** "Em 30 dias você já vai estar bombando!"
**Resposta boa:** "Os primeiros 30 dias são pra testar e calibrar. Resultado consistente a partir do 60º-90º dia."

Marketing digital é como academia: ninguém vira fortão em 30 dias. Quem promete resultado rápido tá vendendo expectativa, não resultado.

### 2. "Vocês vão me mostrar os números?"

**Resposta ruim:** "A gente cuida de tudo, você não precisa se preocupar com isso."
**Resposta boa:** "Toda semana você recebe um relatório com gastos, leads gerados, custo por lead e taxa de conversão."

Se a agência **esconde os números**, é porque os números não tão bons. Transparência é não-negociável.

### 3. "Vocês trabalham com contrato de fidelidade?"

**Resposta ruim:** "Sim, contrato de 12 meses com multa rescisória de 50%."
**Resposta boa:** "Trabalhamos com mensalidade, sem multa pra sair. Se a gente não entregar, você não tem nada te prendendo."

Agência boa não precisa amarrar o cliente — o resultado amarra. Multa pesada é sinal de que ela sabe que o cliente vai querer sair.

### 4. "Quem vai cuidar da minha conta?"

**Resposta ruim:** "Temos uma equipe que cuida de tudo."
**Resposta boa:** "O Fulano vai ser seu gerente de conta, e a Beltrana cuida do tráfego. Você tem o WhatsApp deles."

Você precisa saber **quem** tá tocando sua campanha. Se não consegue nome e contato, é sinal de que sua conta é mais um número numa esteira.

### 5. "Vocês fazem o criativo ou eu mando?"

**Resposta ruim:** "A gente usa os criativos que você mandar."
**Resposta boa:** "A gente produz vídeo, foto e copy, ou trabalha com material seu se preferir. Vamos te mostrar exemplos."

Criativo é **60% do resultado** em tráfego pago. Agência que não tem braço de criativo tá entregando metade do serviço.

### 6. "Posso falar com 2 clientes atuais de vocês?"

**Resposta ruim:** "Confidencial."
**Resposta boa:** "Claro. Aqui vão dois contatos de clientes nossos no Vale: um na área de estética em Taubaté, outro em comércio em São José."

Toda agência boa tem cliente disposto a falar bem dela. Se não consegue te dar referência, desconfia.

### 7. "Quanto vocês cobram e o que tá incluso?"

**Resposta ruim:** "Depende, vamos fazer um diagnóstico primeiro."
**Resposta boa:** "Nosso plano base é R$ X, inclui gestão de Meta Ads, criação de 4 criativos por mês e relatório semanal. Pra adicionar Google Ads, mais R$ Y."

Agência boa **sabe o que cobra** e por quê. Preço vago é desculpa pra negociar conforme o tamanho do bolso do cliente — geralmente mais caro pra quem aparenta ter mais.

### 8. "O que acontece se eu quiser pausar a campanha?"

**Resposta ruim:** "A gente continua cobrando."
**Resposta boa:** "Você avisa com 15 dias e a gente pausa. Não tem cobrança de campanha que não tá rodando."

Detalhe pequeno que mostra **postura**. Agência que cobra serviço que não tá entregando é antiética.

### 9. "Vocês têm cases reais de negócios parecidos com o meu?"

**Resposta ruim:** Mostra "logo de clientes" sem detalhes.
**Resposta boa:** Conta o desafio, o que foi feito, os números antes e depois.

Logo na parede não significa nada. Resultado contado em detalhe, sim.

## Sinais de alerta (corre)

- 🚩 Garante resultado fixo ("vou te dar X leads/mês ou devolvo o dinheiro")
- 🚩 Não tem CNPJ ou trabalha "no preto"
- 🚩 Pede pra criar conta de anúncio **no nome dele** (sempre crie a sua e dê acesso)
- 🚩 Não conhece nada do seu segmento e nem perguntou nada antes de mandar proposta
- 🚩 Te oferece "pacote SEO + tráfego + redes sociais + site + e-mail + automação" por R$ 800 (não dá pra entregar tudo bem por esse preço — vai entregar mal)

## O custo-benefício real pra negócio local no Vale

Pra negócio local em Taubaté, SJC, Jacareí ou Pinda, o investimento mensal saudável em agência fica em:

| Estágio | Faixa de investimento | O que esperar |
|---|---|---|
| **Validação** | R$ 900 – R$ 1.500 + R$ 600 de mídia | Aprender o que funciona |
| **Operação** | R$ 1.500 – R$ 2.500 + R$ 1.500 de mídia | Resultado previsível |
| **Escala** | R$ 3.000+ + R$ 3.000+ de mídia | Crescimento agressivo |

## A pergunta final que ninguém faz

Antes de fechar com qualquer agência, pergunta pra você mesmo: **"Eu confio nessa pessoa que tá na minha frente?"**

Marketing digital é uma relação de **confiança longa**. Você vai compartilhar números do faturamento, dar acesso ao seu Instagram, falar de problemas do negócio. Se você não confia na pessoa do outro lado, o resultado nunca vai vir — você vai segurar informação, eles vão segurar entrega, e os dois saem perdendo.

A melhor agência **pra você** não é a maior nem a mais barata. É a que você sente que tá do seu lado.`,
  },

  {
    slug: '5-erros-google-ads-queimam-dinheiro',
    titulo: '5 erros que fazem você queimar dinheiro com Google Ads',
    subtitulo: 'Os deslizes que estouram orçamento em 48h — e como corrigir agora',
    resumo: 'Os 5 erros mais comuns que fazem pequenas empresas queimarem orçamento em Google Ads. Como identificar, corrigir e parar de financiar concorrente.',
    keywords: 'erros google ads, google ads pequena empresa, como nao gastar dinheiro google ads, otimizar google ads, gestao google ads',
    tags: ['Google Ads', 'Tráfego Pago', 'Otimização'],
    autor: 'Lira',
    publicado: true,
    conteudo: `Google Ads é a plataforma de anúncio mais poderosa que existe. Também é a mais fácil de **detonar R$ 3.000 em uma semana** sem gerar uma venda. A maioria das empresas que diz que "Google Ads não funciona" tá cometendo pelo menos 3 dos 5 erros desse post.

Vou listar em ordem de **quanto dinheiro cada erro queima**, do menor pro maior.

## Erro 5: Não usar palavras-chave negativas

Quando você anuncia pra "dentista em Taubaté", o Google vai te mostrar pra quem busca:

- "dentista em Taubaté" ✅
- "curso de dentista em Taubaté" ❌
- "dentista barato em Taubaté" ❌ (se você não é barato)
- "vagas dentista Taubaté" ❌

Cada clique desses **você paga**. Sem negativar, 20-40% do orçamento vai pra busca irrelevante.

**Como corrigir agora:** entra no painel do Google Ads → Palavras-chave → Palavras-chave negativas. Adiciona pelo menos: "curso", "vagas", "salário", "como ser", "concurso", "barato" (se você não compete por preço), "grátis", "gratuito".

Faz isso AGORA. É 5 minutos e você para de pagar pelos cliques errados.

## Erro 4: Deixar Google decidir tudo (campanhas Performance Max sem controle)

A Google empurra a campanha **Performance Max** porque ela dá ao algoritmo do Google **controle total** do seu orçamento. Em teoria, IA otimiza. Na prática, sem dados suficientes (e a maioria dos negócios pequenos não tem), ela gasta seu dinheiro testando o que funciona — **com o seu cartão**.

Performance Max só faz sentido depois que você já tem **histórico** de conversões (mínimo 30-50 conversões por mês) e quer escalar.

**Como corrigir:** se você tá começando, foco em campanha **Pesquisa** (Search) com palavras-chave **exatas** e de **correspondência de frase**. Você controla o que disparou cada clique. Custa mais por clique, mas converte muito mais.

## Erro 3: Anunciar pro Brasil inteiro quando seu negócio é local

Esse é o mais comum em Vale do Paraíba: empresa de Taubaté com campanha rodando pra "todo o Brasil" porque ninguém ajustou a localização. Resultado: você paga pra alguém de Rio Branco clicar no seu anúncio sem nenhuma chance de virar cliente.

**Como corrigir:** no painel da campanha → Configurações → Locais → seleciona **Taubaté + raio de 30km** (ou as cidades específicas que você atende: SJC, Jacareí, Pinda). E IMPORTANTE: marca a opção **"Presença: pessoas em ou frequentemente nos locais segmentados"** (não "interesse em locais segmentados" — essa pega gente que **busca** sobre Taubaté, não que **está** em Taubaté).

Esse ajuste sozinho pode cortar 40% do desperdício.

## Erro 2: Mandar tráfego pra página errada

O cliente busca "ortodontista em Taubaté" e clica no seu anúncio. Aí cai na sua **home** que fala de "qualidade, tradição e excelência". Cadê o ortodontista? Cadê o preço? Cadê o WhatsApp pra marcar?

A pessoa fecha em 6 segundos. **Você acabou de pagar pra ela não comprar nada.**

**Como corrigir:** cada anúncio precisa cair numa página que **fala exatamente** do que o anúncio prometeu. Se anunciou "Avaliação ortodôntica gratuita", a landing page tem que ter no primeiro scroll:

1. "Avaliação ortodôntica gratuita em Taubaté" (mesmo título)
2. O que tá incluído na avaliação
3. Foto da clínica (prova social)
4. Botão grande "Agendar pelo WhatsApp" + número

Se não tiver isso, sua taxa de conversão fica em 1-2%. Com isso, sobe pra 8-15%. **A diferença é literalmente 5x mais vendas com o mesmo orçamento.**

## Erro 1: Não acompanhar conversão de verdade

Esse é o **mais caro de todos**, e o mais comum. A empresa roda Google Ads, vê "300 cliques esse mês" no painel e acha que tá funcionando. Não tem ideia se aqueles cliques viraram **venda**, porque nunca configurou **conversão**.

Sem rastreamento de conversão, você tá voando às cegas. Pior: a IA do Google **não consegue otimizar** sem saber o que é conversão. Então ela vai te trazer **clique barato**, não cliente.

**Como corrigir:**

1. Instala o **Google Tag Manager** no seu site (15min de trabalho).
2. Configura conversão pra **clique no botão de WhatsApp** (a maioria dos negócios locais vende por WA, então essa é a conversão mais importante).
3. Configura conversão pra **envio de formulário** se você tiver formulário.
4. Configura conversão pra **chamada telefônica** se cliente liga.
5. **Importante:** dentro de 30 dias com conversão rodando, o algoritmo do Google começa a otimizar pra essas ações em vez de só clique.

Quem corrige esse erro vê o **CPL cair entre 30% e 50%** no segundo mês. É o ajuste com maior impacto possível.

## O cálculo simples que muda tudo

Pega seu painel agora e responde:

- Quanto eu gastei mês passado?
- Quantos clientes novos vieram do Google Ads (não chute — conta os que falaram que vieram por lá)?
- Qual o ticket médio?

Se **gasto ÷ clientes** > **ticket médio**, você tá perdendo dinheiro. Corrige os erros acima e roda mais 60 dias. Se a conta não bater depois disso, o problema não é Google Ads — é seu produto, seu preço ou seu funil de vendas.

## A boa notícia

Esses 5 erros são **todos** corrigíveis em **menos de 1 dia de trabalho** sério. Não precisa de agência cara, não precisa de curso de R$ 2.000. Precisa de 4 horas de atenção plena no seu painel.

Quem corrige esses 5, em média, cai o **CPL pela metade** no mês seguinte. É a coisa de maior alavancagem que existe em tráfego pago.

Se você quiser que a gente **olhe sua conta** e te diga exatamente o que tá queimando dinheiro hoje, faz um diagnóstico gratuito comigo. Demora 30 minutos e você sai com o caminho claro pra parar de pagar pelo erro do mês passado.`,
  },
]

async function main() {
  let inseridos = 0, atualizados = 0, erros = 0
  for (const p of POSTS) {
    const palavras = p.conteudo.split(/\s+/).filter(Boolean).length
    const tempo_leitura_min = Math.max(1, Math.round(palavras / 200))
    const agora = new Date().toISOString()

    // Upsert por slug
    const { data: existe } = await sb.from('blog_posts').select('id').eq('slug', p.slug).maybeSingle()
    const payload = {
      ...p,
      tempo_leitura_min,
      atualizado_em: agora,
    }
    if (p.publicado) payload.publicado_em = agora

    if (existe) {
      const { error } = await sb.from('blog_posts').update(payload).eq('id', existe.id)
      if (error) { console.error('UPDATE', p.slug, error); erros++ } else { atualizados++; console.log('atualizado:', p.slug) }
    } else {
      const { error } = await sb.from('blog_posts').insert(payload)
      if (error) { console.error('INSERT', p.slug, error); erros++ } else { inseridos++; console.log('inserido:', p.slug) }
    }
  }
  console.log(`\nFim — inseridos: ${inseridos}, atualizados: ${atualizados}, erros: ${erros}`)
}

main().catch(e => { console.error(e); process.exit(1) })
