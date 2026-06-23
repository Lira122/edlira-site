// Roda 1x pra inserir/atualizar os posts iniciais.
//   SB_KEY=sb_secret_xxx node supabase/seed-blog-posts.mjs
// Upsert por slug: rodar de novo atualiza o conteúdo.
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
    resumo: 'Quanto investir em anúncio no Instagram pra negócio local em Taubaté. Faixas de orçamento, CPL real do Vale do Paraíba e quando vale a pena começar.',
    keywords: 'quanto custa anuncio instagram taubate, preço anuncio instagram, instagram ads vale do paraiba, custo trafego pago taubate, orçamento instagram ads',
    tags: ['Tráfego Pago', 'Instagram Ads', 'Taubaté', 'Orçamento'],
    autor: 'Lira',
    publicado: true,
    cover_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80&auto=format&fit=crop',
    cover_alt: 'Pessoa segurando smartphone com Instagram aberto',
    conteudo: `O preço do anúncio no Instagram não tem valor fixo. Você define o orçamento. O Instagram (Meta) cobra por leilão: quanto mais empresas querendo aparecer pro mesmo público, mais caro fica. Em Taubaté e no Vale do Paraíba, a competição ainda é baixa comparado a São Paulo capital, e isso é a sua vantagem.

Esse post mostra quanto custa de verdade pra anunciar aqui em 2026, baseado no que a gente vê rodando em campanhas reais de clientes da Eleva Digital.

## A faixa real de investimento em Taubaté

Pra ter alguma chance de gerar resultado consistente, o piso é **R$ 600 a R$ 900 por mês em orçamento de mídia** (sem contar a agência ou o profissional). Abaixo disso, o algoritmo do Instagram não tem dado suficiente pra otimizar. Você vai gastar do mesmo jeito e não vai aprender nada.

| Cenário | Orçamento mensal | O que esperar |
|---|---|---|
| **Teste mínimo** | R$ 600 a R$ 900 | Validar criativo e público. 30 a 80 leads/mês. |
| **Operação saudável** | R$ 1.500 a R$ 3.000 | Fluxo consistente de cliente novo. ROI mensurável. |
| **Escala** | R$ 4.000 + | Crescimento agressivo. Múltiplos públicos rodando. |

Esses valores são pro investimento direto no Meta. Gestão de tráfego, criativo e estratégia entram por fora.

## Quanto custa cada clique e cada lead no Vale do Paraíba

Em janeiro de 2026, rodando campanhas pra clientes em Taubaté, São José dos Campos e Jacareí, a gente vê esses números:

- **CPC médio** (custo por clique): R$ 0,80 a R$ 2,40
- **CPM médio** (custo por mil impressões): R$ 6 a R$ 22
- **CPL médio** (custo por lead via formulário): R$ 8 a R$ 35
- **CPL no WhatsApp** (cliente já chamando direto): R$ 12 a R$ 60

Esses valores variam muito por segmento. Estética e odontologia ficam no topo da faixa (concorrência alta). Comércio local, pet shop e lanchonete ficam no piso.

> Numa campanha de estética em Taubaté que rodamos no início desse ano, o CPL ficou em R$ 18 nos primeiros 15 dias. Depois dos ajustes de criativo e público, caiu pra R$ 11. Em São Paulo capital, a mesma campanha estaria custando o dobro.

## O custo invisível que ninguém te conta

Investir R$ 1.000 no Meta não significa gerar R$ 1.000 de vendas. Pra ter retorno previsível, você precisa de:

1. **Criativo bom**. Sem isso, nenhum orçamento salva. Vídeos curtos, autênticos e que mostram o produto funcionam melhor que foto bonita.
2. **Landing page ou WhatsApp preparado**. Anúncio mandando pro Instagram (que ninguém checa direito) é dinheiro queimado. WhatsApp com atendimento rápido converte 3x a 5x mais.
3. **Acompanhamento dos números**. Pelo menos uma vez por semana alguém precisa olhar e ajustar. "Botar e esquecer" mata 70% dos investimentos.

## Quando vale a pena começar a anunciar?

Se você responde sim pra essas 3 perguntas, anunciar no Instagram em Taubaté faz sentido:

- ✅ Tenho um produto ou serviço com margem mínima de R$ 80 (pra absorver o custo de aquisição)
- ✅ Consigo atender novos clientes (não adianta gerar 100 leads e não dar conta)
- ✅ Posso manter o investimento por pelo menos 90 dias (campanha sem tempo não otimiza)

Se respondeu não pra alguma, espera. Anúncio antes de estar pronto é o jeito mais rápido de criar a impressão errada de que "Instagram não funciona pro meu negócio".

## Quanto custa contratar uma agência pra cuidar disso

Em Taubaté e Vale do Paraíba, o investimento em gestão de tráfego com agência séria fica entre **R$ 900 e R$ 2.500 por mês** (varia conforme escopo: só Meta Ads, Meta mais Google, com criativo incluso ou não).

Existe quem cobre R$ 400. Geralmente é freelancer começando ou alguém que vai rodar campanha automática sem cuidado. Também existe quem cobre R$ 5.000 ou mais. Geralmente é estrutura grande de São Paulo atendendo remoto.

O bom custo-benefício pra negócio local fica na faixa intermediária: agência pequena, próxima, que conhece o público da região, com 5 a 15 clientes ativos. Aí o preço bate com a entrega.

## Resumo: quanto separar pra começar

Se você tá começando agora:

- R$ 900 de mídia mais R$ 900 de gestão dá R$ 1.800 por mês total
- Compromete por 90 dias (mínimo)
- Espera retorno mensurável a partir do 2º mês

Esse é o ponto mais honesto de início pra negócio local. Abaixo disso, você tá rezando. Acima disso, você tá tentando correr antes de andar.

E lembra: o Instagram não é mágico. Ele amplifica o que você já tem. Se seu produto é bom e seu atendimento é rápido, o anúncio multiplica. Se não, ele acelera o problema.`,
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
    cover_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop',
    cover_alt: 'Reunião de negócios com aperto de mão',
    conteudo: `Contratar agência de marketing digital é como contratar contador. Você não vê o trabalho acontecendo no dia a dia, e quando vê que tá ruim, já queimou meses de orçamento. No Vale do Paraíba (Taubaté, São José dos Campos, Jacareí, Pinda) tem dezenas de agências e freelancers oferecendo serviço, com preços que vão de R$ 400 a R$ 5.000 por mês. Como saber qual é a certa pra você?

Esse post é o checklist que eu daria pro meu primo se ele tivesse esse problema.

## As 9 perguntas que separam agência séria de vendedor de fumaça

### 1. "Quanto tempo demora pra ver resultado?"

**Resposta ruim:** "Em 30 dias você já vai estar bombando!"
**Resposta boa:** "Os primeiros 30 dias são pra testar e calibrar. Resultado consistente a partir do 60º ao 90º dia."

Marketing digital é como academia: ninguém vira fortão em 30 dias. Quem promete resultado rápido tá vendendo expectativa, não resultado.

### 2. "Vocês vão me mostrar os números?"

**Resposta ruim:** "A gente cuida de tudo, você não precisa se preocupar com isso."
**Resposta boa:** "Toda semana você recebe um relatório com gastos, leads gerados, custo por lead e taxa de conversão."

Se a agência esconde os números, é porque os números não tão bons. Transparência é não-negociável.

### 3. "Vocês trabalham com contrato de fidelidade?"

**Resposta ruim:** "Sim, contrato de 12 meses com multa rescisória de 50%."
**Resposta boa:** "Trabalhamos com mensalidade, sem multa pra sair. Se a gente não entregar, você não tem nada te prendendo."

Agência boa não precisa amarrar o cliente. O resultado amarra. Multa pesada é sinal de que ela sabe que o cliente vai querer sair.

### 4. "Quem vai cuidar da minha conta?"

**Resposta ruim:** "Temos uma equipe que cuida de tudo."
**Resposta boa:** "O Fulano vai ser seu gerente de conta, e a Beltrana cuida do tráfego. Você tem o WhatsApp deles."

Você precisa saber quem tá tocando sua campanha. Se não consegue nome e contato, é sinal de que sua conta é mais um número numa esteira.

### 5. "Vocês fazem o criativo ou eu mando?"

**Resposta ruim:** "A gente usa os criativos que você mandar."
**Resposta boa:** "A gente produz vídeo, foto e copy, ou trabalha com material seu se preferir. Vamos te mostrar exemplos."

Criativo é 60% do resultado em tráfego pago. Agência que não tem braço de criativo tá entregando metade do serviço.

### 6. "Posso falar com 2 clientes atuais de vocês?"

**Resposta ruim:** "Confidencial."
**Resposta boa:** "Claro. Aqui vão dois contatos de clientes nossos no Vale: um na área de estética em Taubaté, outro em comércio em São José."

Toda agência boa tem cliente disposto a falar bem dela. Se não consegue te dar referência, desconfia.

### 7. "Quanto vocês cobram e o que tá incluso?"

**Resposta ruim:** "Depende, vamos fazer um diagnóstico primeiro."
**Resposta boa:** "Nosso plano base é R$ X, inclui gestão de Meta Ads, criação de 4 criativos por mês e relatório semanal. Pra adicionar Google Ads, mais R$ Y."

Agência boa sabe o que cobra e por quê. Preço vago é desculpa pra negociar conforme o tamanho do bolso do cliente. Geralmente mais caro pra quem aparenta ter mais.

### 8. "O que acontece se eu quiser pausar a campanha?"

**Resposta ruim:** "A gente continua cobrando."
**Resposta boa:** "Você avisa com 15 dias e a gente pausa. Não tem cobrança de campanha que não tá rodando."

Detalhe pequeno que mostra postura. Agência que cobra serviço que não tá entregando é antiética.

### 9. "Vocês têm cases reais de negócios parecidos com o meu?"

**Resposta ruim:** Mostra "logo de clientes" sem detalhes.
**Resposta boa:** Conta o desafio, o que foi feito, os números antes e depois.

Logo na parede não significa nada. Resultado contado em detalhe, sim.

## Sinais de alerta (corre)

- 🚩 Garante resultado fixo ("vou te dar X leads por mês ou devolvo o dinheiro")
- 🚩 Não tem CNPJ ou trabalha "no preto"
- 🚩 Pede pra criar conta de anúncio no nome dele (sempre crie a sua e dê acesso)
- 🚩 Não conhece nada do seu segmento e nem perguntou nada antes de mandar proposta
- 🚩 Te oferece "pacote SEO, tráfego, redes sociais, site, e-mail e automação" por R$ 800 (não dá pra entregar tudo bem por esse preço; vai entregar mal)

## O custo-benefício real pra negócio local no Vale

Pra negócio local em Taubaté, SJC, Jacareí ou Pinda, o investimento mensal saudável em agência fica em:

| Estágio | Faixa de investimento | O que esperar |
|---|---|---|
| **Validação** | R$ 900 a R$ 1.500, mais R$ 600 de mídia | Aprender o que funciona |
| **Operação** | R$ 1.500 a R$ 2.500, mais R$ 1.500 de mídia | Resultado previsível |
| **Escala** | R$ 3.000+, mais R$ 3.000+ de mídia | Crescimento agressivo |

## A pergunta final que ninguém faz

Antes de fechar com qualquer agência, pergunta pra você mesmo: **"Eu confio nessa pessoa que tá na minha frente?"**

Marketing digital é uma relação de confiança longa. Você vai compartilhar números do faturamento, dar acesso ao seu Instagram, falar de problemas do negócio. Se você não confia na pessoa do outro lado, o resultado nunca vai vir. Você vai segurar informação, eles vão segurar entrega, e os dois saem perdendo.

A melhor agência pra você não é a maior nem a mais barata. É a que você sente que tá do seu lado.`,
  },

  {
    slug: '5-erros-google-ads-queimam-dinheiro',
    titulo: '5 erros que fazem você queimar dinheiro com Google Ads',
    subtitulo: 'Os deslizes que estouram orçamento em 48h e como corrigir agora',
    resumo: 'Os 5 erros mais comuns que fazem pequenas empresas queimarem orçamento em Google Ads. Como identificar, corrigir e parar de financiar concorrente.',
    keywords: 'erros google ads, google ads pequena empresa, como nao gastar dinheiro google ads, otimizar google ads, gestao google ads',
    tags: ['Google Ads', 'Tráfego Pago', 'Otimização'],
    autor: 'Lira',
    publicado: true,
    cover_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop',
    cover_alt: 'Painel de analytics com gráficos de campanhas',
    conteudo: `Google Ads é a plataforma de anúncio mais poderosa que existe. Também é a mais fácil de detonar R$ 3.000 em uma semana sem gerar uma venda. A maioria das empresas que diz que "Google Ads não funciona" tá cometendo pelo menos 3 dos 5 erros desse post.

Vou listar em ordem de quanto dinheiro cada erro queima, do menor pro maior.

## Erro 5: Não usar palavras-chave negativas

Quando você anuncia pra "dentista em Taubaté", o Google vai te mostrar pra quem busca:

- "dentista em Taubaté" ✅
- "curso de dentista em Taubaté" ❌
- "dentista barato em Taubaté" ❌ (se você não é barato)
- "vagas dentista Taubaté" ❌

Cada clique desses você paga. Sem negativar, 20% a 40% do orçamento vai pra busca irrelevante.

**Como corrigir agora:** entra no painel do Google Ads, vai em Palavras-chave, depois em Palavras-chave negativas. Adiciona pelo menos: "curso", "vagas", "salário", "como ser", "concurso", "barato" (se você não compete por preço), "grátis", "gratuito".

Faz isso agora. É 5 minutos e você para de pagar pelos cliques errados.

## Erro 4: Deixar Google decidir tudo (campanhas Performance Max sem controle)

A Google empurra a campanha Performance Max porque ela dá ao algoritmo do Google controle total do seu orçamento. Em teoria, IA otimiza. Na prática, sem dados suficientes (e a maioria dos negócios pequenos não tem), ela gasta seu dinheiro testando o que funciona, com o seu cartão.

Performance Max só faz sentido depois que você já tem histórico de conversões (mínimo 30 a 50 conversões por mês) e quer escalar.

**Como corrigir:** se você tá começando, foco em campanha **Pesquisa** (Search) com palavras-chave **exatas** e de **correspondência de frase**. Você controla o que disparou cada clique. Custa mais por clique, mas converte muito mais.

## Erro 3: Anunciar pro Brasil inteiro quando seu negócio é local

Esse é o mais comum em Vale do Paraíba: empresa de Taubaté com campanha rodando pra "todo o Brasil" porque ninguém ajustou a localização. Resultado: você paga pra alguém de Rio Branco clicar no seu anúncio sem nenhuma chance de virar cliente.

**Como corrigir:** no painel da campanha vai em Configurações, depois Locais, e seleciona Taubaté mais raio de 30km (ou as cidades específicas que você atende: SJC, Jacareí, Pinda). Importante: marca a opção **"Presença: pessoas em ou frequentemente nos locais segmentados"**. Não marca "interesse em locais segmentados", essa pega gente que busca sobre Taubaté, não que está em Taubaté.

Esse ajuste sozinho pode cortar 40% do desperdício.

## Erro 2: Mandar tráfego pra página errada

O cliente busca "ortodontista em Taubaté" e clica no seu anúncio. Aí cai na sua home que fala de "qualidade, tradição e excelência". Cadê o ortodontista? Cadê o preço? Cadê o WhatsApp pra marcar?

A pessoa fecha em 6 segundos. Você acabou de pagar pra ela não comprar nada.

**Como corrigir:** cada anúncio precisa cair numa página que fala exatamente do que o anúncio prometeu. Se anunciou "Avaliação ortodôntica gratuita", a landing page tem que ter no primeiro scroll:

1. "Avaliação ortodôntica gratuita em Taubaté" (mesmo título)
2. O que tá incluído na avaliação
3. Foto da clínica (prova social)
4. Botão grande "Agendar pelo WhatsApp" mais o número

Se não tiver isso, sua taxa de conversão fica em 1% a 2%. Com isso, sobe pra 8% a 15%. A diferença é 5x mais vendas com o mesmo orçamento.

## Erro 1: Não acompanhar conversão de verdade

Esse é o mais caro de todos, e o mais comum. A empresa roda Google Ads, vê "300 cliques esse mês" no painel e acha que tá funcionando. Não tem ideia se aqueles cliques viraram venda, porque nunca configurou conversão.

Sem rastreamento de conversão, você tá voando às cegas. Pior: a IA do Google não consegue otimizar sem saber o que é conversão. Então ela vai te trazer clique barato, não cliente.

**Como corrigir:**

1. Instala o **Google Tag Manager** no seu site (15min de trabalho).
2. Configura conversão pra **clique no botão de WhatsApp** (a maioria dos negócios locais vende por WA, então essa é a conversão mais importante).
3. Configura conversão pra **envio de formulário** se você tiver formulário.
4. Configura conversão pra **chamada telefônica** se cliente liga.
5. Importante: dentro de 30 dias com conversão rodando, o algoritmo do Google começa a otimizar pra essas ações em vez de só clique.

Quem corrige esse erro vê o CPL cair entre 30% e 50% no segundo mês. É o ajuste com maior impacto possível.

## O cálculo simples que muda tudo

Pega seu painel agora e responde:

- Quanto eu gastei mês passado?
- Quantos clientes novos vieram do Google Ads (não chute, conta os que falaram que vieram por lá)?
- Qual o ticket médio?

Se gasto dividido por clientes for maior que o ticket médio, você tá perdendo dinheiro. Corrige os erros acima e roda mais 60 dias. Se a conta não bater depois disso, o problema não é Google Ads. É seu produto, seu preço ou seu funil de vendas.

## A boa notícia

Esses 5 erros são todos corrigíveis em menos de 1 dia de trabalho sério. Não precisa de agência cara, não precisa de curso de R$ 2.000. Precisa de 4 horas de atenção plena no seu painel.

Quem corrige esses 5, em média, vê o CPL cair pela metade no mês seguinte. É a coisa de maior alavancagem que existe em tráfego pago.

Se você quiser que a gente olhe sua conta e te diga exatamente o que tá queimando dinheiro hoje, faz um diagnóstico gratuito comigo. Demora 30 minutos e você sai com o caminho claro pra parar de pagar pelo erro do mês passado.`,
  },

  {
    slug: 'por-que-whatsapp-vazio-mesmo-com-anuncio-rodando',
    titulo: 'Por que seu WhatsApp tá vazio mesmo gastando com anúncio',
    subtitulo: 'O furo silencioso entre clicar no anúncio e virar cliente, explicado em 5 minutos',
    resumo: 'Anúncio rodando mas WhatsApp parado? O problema raramente é o anúncio. Mostro os 4 furos do funil onde o cliente desiste antes de chegar até você.',
    keywords: 'whatsapp vazio anuncio nao funciona, instagram ads sem resultado, leads que nao respondem, funil de vendas whatsapp, conversao anuncio whatsapp',
    tags: ['WhatsApp', 'Funil', 'Conversão', 'Atendimento'],
    autor: 'Lira',
    publicado: true,
    cover_url: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1200&q=80&auto=format&fit=crop',
    cover_alt: 'Smartphone aberto no WhatsApp com mensagens',
    conteudo: `Você liberou R$ 1.500 no anúncio do Instagram. O painel diz que teve 4.230 visualizações, 87 cliques e 12 leads. Mas o seu WhatsApp tá com 2 mensagens. E uma é spam.

Esse cenário é tão comum que virou meme entre quem mexe com tráfego pago. A maioria das pessoas culpa o anúncio. "O anúncio não tá performando", "O criativo tá ruim". Quase sempre o problema mora em outro lugar do funil.

Vou te mostrar os 4 furos onde o lead some entre clicar no anúncio e virar cliente, em ordem do mais comum pro menos comum.

## Furo 1: O lead nem chegou no seu WhatsApp

Esse é o mais bobo e o mais frequente. O anúncio leva pro WhatsApp, o lead clica, mas o link tá errado, expirado ou aponta pro número do dono que mudou de telefone faz 1 ano.

**Como saber se é isso:** abre o anúncio agora, clica no botão de WhatsApp como se fosse um cliente. Caiu no seu Zap atual? Se sim, manda uma mensagem de teste. Caiu na conversa? Bom. Se algo deu errado, é aí.

**Como corrigir:** usa link wa.me com mensagem pré-preenchida (wa.me/55SEUNUMERO?text=Oi%20vim%20do%20anuncio). Isso já filtra spam e te ajuda a saber de onde veio o lead.

## Furo 2: O atendimento demorou mais que 5 minutos

Tem estudo do Harvard Business Review mostrando que a chance de fechar uma venda cai 80% se você demora mais de 5 minutos pra responder o primeiro contato. O cliente já mudou de aba, já tá olhando concorrente, já esqueceu de você.

A realidade da maioria dos negócios locais: anúncio roda às 14h, lead manda mensagem às 14h12, dono vê a mensagem só de noite (porque tava atendendo loja física), responde "oi, tudo bem?" às 21h. O lead já comprou em outro lugar.

**Como corrigir:**

1. **Resposta automática imediata.** Não precisa ser IA. Pode ser uma mensagem padrão tipo "Oi! Recebi sua mensagem, em até 10 minutos volto com tudo." Já segura a pessoa.
2. **Notificação no celular.** WhatsApp Business permite separar conversas de cliente das pessoais. Faz isso.
3. **Se você não consegue responder em 5 minutos, automatiza.** Bot de WhatsApp custa R$ 200 a R$ 500 por mês e responde, qualifica e até marca reunião na sua agenda. Pra negócio que gasta R$ 1.500 com anúncio, é o ROI mais óbvio que existe.

## Furo 3: A primeira resposta matou o interesse

Lead chega assim: "Oi, vi o anúncio. Vocês fazem [serviço X]?"

Resposta ruim: "Sim, fazemos."

Pronto, conversa morreu. O cliente queria envolvimento, contexto, próxima ação. Você deu um sim seco.

Resposta boa: "Oi, tudo bem? Faço sim. Qual é a sua situação atual? Pergunto pra entender se a gente é o que você precisa ou se faz mais sentido outro caminho."

A diferença é gritante. A primeira fecha a porta. A segunda abre a conversa.

**Princípio simples:** toda resposta sua tem que terminar com pergunta ou próximo passo claro. Nunca com "sim", "não", "ok", "obrigado".

## Furo 4: O lead era ruim mesmo

Esse é o último porque é o mais raro de ser o real problema. Mas existe.

Se você anuncia pra "qualquer pessoa interessada em estética" sem segmentação, vai vir gente curiosa, gente que só queria saber preço, gente que mora a 80km de você. Esses leads são caros e não convertem.

**Como saber se é isso:** olha as 10 últimas mensagens que chegaram. Quantas eram do seu público real? Se mais da metade era de gente fora do perfil, o anúncio tá pegando errado.

**Como corrigir:**

1. **Restringe localização.** Raio de 15-20 km do seu negócio, não 50 km.
2. **Coloca preço aproximado no anúncio.** Sim, isso espanta curioso. É exatamente o que você quer.
3. **Pede 1 informação no clique pro WhatsApp.** Tipo: "Quero saber o valor da minha aplicação. Tenho cabelo crespo." Quem não preenche não tá interessado de verdade.

## Como achar qual é o seu furo em 1 dia

Faz esse exercício:

1. Pega os últimos 30 leads que chegaram do anúncio.
2. Classifica cada um:
   - Nunca chegou de verdade (link errado)?
   - Chegou mas você demorou pra responder?
   - Você respondeu rápido mas a conversa morreu?
   - Lead era do perfil errado?
3. Conta qual categoria tem mais. Esse é seu furo principal.

Em 80% dos negócios que a gente atende na Eleva, o furo principal é o **número 2 (demora pra responder)**. Quando consertam, faturamento sobe 30% a 50% no mesmo mês, mantendo o mesmo orçamento de anúncio.

Não dá pra acelerar o tráfego sem consertar o funil primeiro. É como botar mais água numa mangueira furada. Vai gastar mais e molhar a mesma coisa.

Se você quer que a gente analise o seu funil de verdade, faz um diagnóstico gratuito. Em 30 minutos a gente identifica onde tá o vazamento e quanto você tá perdendo por mês por causa dele.`,
  },

  {
    slug: 'trafego-pago-vs-seo-qual-usar-primeiro-negocio-local',
    titulo: 'Tráfego pago vs SEO: qual usar primeiro pro seu negócio local',
    subtitulo: 'A escolha errada custa 6 meses e R$ 12 mil. A certa, em 60 dias você tá vendendo.',
    resumo: 'Tráfego pago ou SEO? Pra negócio local em Taubaté, a resposta certa depende de 3 fatores. Como decidir sem queimar dinheiro nem tempo.',
    keywords: 'trafego pago vs seo, seo ou trafego pago, marketing digital negocio local, agencia marketing taubate, como comecar marketing digital',
    tags: ['Estratégia', 'SEO', 'Tráfego Pago', 'Decisão'],
    autor: 'Lira',
    publicado: true,
    cover_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop',
    cover_alt: 'Laptop com gráficos de performance digital',
    conteudo: `Toda semana alguém me pergunta a mesma coisa: "Lira, eu invisto em tráfego pago ou em SEO?" Quem responde "depende" tá fugindo. A resposta certa depende de 3 fatores, e em quase todo caso de negócio local em Taubaté ou no Vale, dá pra dar uma recomendação clara.

Vou destrinchar.

## A diferença prática entre os dois

| | Tráfego pago | SEO |
|---|---|---|
| **Quando começa a gerar lead** | 24 horas | 4 a 8 meses |
| **Investimento inicial** | R$ 1.500 a R$ 3.000/mês | R$ 1.500 a R$ 4.000/mês |
| **Para de gerar quando** | Você para de pagar | Concorrente passa você |
| **Previsibilidade** | Alta (CPL conhecido) | Baixa (depende do Google) |
| **Quem domina** | Quem tem dinheiro pra escalar | Quem tem paciência e conteúdo |

Tráfego pago é torneira. Você abre, vem água. Fecha, para. SEO é poço. Demora pra cavar. Depois que cava, dá água sem você fazer nada.

A questão não é qual é melhor. É qual faz sentido pra **onde você tá agora**.

## Fator 1: Você precisa de cliente esse mês ou em 8 meses?

Se a resposta é "esse mês", você tem zero opção. Tem que ser tráfego pago. Não tem como SEO te resgatar agora.

A maioria dos pequenos negócios chega buscando marketing depois que o caixa apertou. Faturamento caiu, precisa de cliente novo já. Nesse cenário, começar SEO é correr atrás do prejuízo. Você gasta R$ 2.000 por mês durante 6 meses pra ver resultado. Total: R$ 12 mil queimados antes do primeiro retorno. Negócio nenhum sobrevive a isso.

Tráfego pago, mesmo mal otimizado, traz 3 a 5 leads na primeira semana. Bem otimizado, vira fluxo previsível em 60 dias.

**Regra simples:** se você precisa de cliente nos próximos 90 dias, começa com tráfego pago. Ponto.

## Fator 2: Quanto vale um cliente seu?

Faz essa conta:

- **Ticket médio:** quanto um cliente gasta com você na primeira compra?
- **Lifetime value (LTV):** quanto ele gasta em 12 meses?
- **CAC máximo aceitável:** quanto você pode pagar pra adquirir um cliente?

Regra prática: CAC máximo é 30% do LTV de 12 meses.

Exemplo: clínica de estética, ticket médio R$ 250, cliente faz 4 sessões/ano, LTV R$ 1.000. CAC máximo R$ 300. Tem espaço pra tráfego pago confortável.

Outro exemplo: hamburgueria, ticket médio R$ 50, cliente vai 1x/mês, LTV R$ 600. CAC máximo R$ 180. Difícil, mas dá. Mas se CAC for R$ 60, sobra muito mais, e SEO local (Google Maps + página otimizada) faz mais sentido a médio prazo.

**Regra simples:** ticket médio acima de R$ 200 favorece tráfego pago. Abaixo de R$ 80, SEO local começa a fazer mais sentido.

## Fator 3: Você consegue produzir conteúdo de verdade?

SEO precisa de conteúdo. Não é "post bonito no Instagram". É artigo de 1.500 a 2.500 palavras, explicando algo que o cliente procura, com cara de quem entende.

Pra negócio local, isso pode ser 2 a 4 posts por mês durante 6 a 12 meses. Quem escreve? Você, sua agência, ou um redator contratado. Cada caminho tem custo:

- **Você escrevendo:** custo zero em dinheiro, custo alto em tempo (4h por post)
- **Redator contratado:** R$ 150 a R$ 400 por post
- **Agência com SEO incluso:** R$ 800 a R$ 2.000 por mês adicional

Se você não tem braço pra produzir conteúdo consistente, SEO não vai funcionar. Vai virar mais um plano que começa empolgado e morre em 3 meses.

**Regra simples:** SEO sem compromisso de 6 meses produzindo conteúdo é dinheiro queimado.

## O caminho que funciona na prática

Pra 80% dos negócios locais no Vale do Paraíba, a sequência ideal é:

1. **Mês 1 a 3:** tráfego pago no Meta (Instagram + Facebook). Aprende seu público, gera os primeiros clientes, fatura.
2. **Mês 4 a 6:** mantém tráfego pago, adiciona SEO local básico (Google Business Profile otimizado, página principal com texto SEO-friendly).
3. **Mês 7 em diante:** começa blog focado em palavras-chave locais ("dentista taubaté", "estética jacareí"). Mantém tráfego pago.
4. **Mês 12 em diante:** SEO começa a render. Você consegue reduzir gradualmente o investimento em tráfego pago se quiser.

Esse caminho funciona porque tráfego pago paga as contas enquanto SEO cresce no background. Quem tenta atalho (só SEO, sem tráfego) costuma fechar antes do retorno chegar.

## A exceção: o negócio que tá em SEO desde o dia 1

Tem um caso onde começar pelo SEO faz sentido: negócio sem urgência de caixa, com produto único e dono que ama escrever ou tem equipe pra isso. Tipo dentista boutique, advogado especializado em nicho, consultor independente.

Mas pra padaria, pet shop, lanchonete, clínica, estética, oficina, comércio em geral? Tráfego pago primeiro. Sem exceção.

## E aquela história de "site bem feito não precisa de anúncio"?

Isso é meme. Site bem feito (SEO técnico, rápido, conteúdo bom) ajuda muito. Mas no primeiro ano de um negócio, o Google não confia em você. Não importa o quão bom seja seu site. Você precisa construir autoridade, links, conteúdo, antes que o Google te coloque na primeira página.

Tráfego pago não tem essa fila. Pagou, apareceu.

## Resumindo em uma frase

Tráfego pago é pra agora. SEO é pra daqui 6 meses. Negócio local precisa dos dois, mas começa pelo primeiro.

Se você ainda tá em dúvida do que faz mais sentido pro seu caso específico, manda mensagem que a gente faz um diagnóstico gratuito. Em 30 minutos você sai com a sequência certa pro seu negócio.`,
  },

  // ════════════════════════════════════════════════════════════════
  //  RASCUNHOS (publicado: false) — você revisa no CRM antes de
  //  publicar. Calendário editorial pras próximas semanas.
  // ════════════════════════════════════════════════════════════════

  {
    slug: 'google-business-profile-guia-taubate',
    titulo: 'Google Business Profile: o guia pra aparecer no mapa em Taubaté',
    subtitulo: 'O cadastro de 15 minutos que pode trazer 30 clientes por mês de graça',
    resumo: 'Como configurar e otimizar seu Google Business Profile pra negócio em Taubaté e Vale do Paraíba. Aparecer no Google Maps de graça quando buscam perto de você.',
    keywords: 'google business profile taubate, google meu negocio, aparecer no google maps, seo local taubate, google business vale do paraiba',
    tags: ['SEO Local', 'Google Business', 'Taubaté'],
    autor: 'Lira',
    publicado: false,
    cover_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80&auto=format&fit=crop',
    cover_alt: 'Fachada de comércio local em rua movimentada',
    conteudo: `Existe uma coisa de graça que a maioria dos negócios em Taubaté ignora e que poderia trazer 20 a 50 clientes por mês: o Google Business Profile (o antigo "Google Meu Negócio"). É o cadastro que faz seu comércio aparecer no Google Maps quando alguém busca "pizzaria perto de mim" ou "dentista em Taubaté".

Se você ainda não tem ou tem mal configurado, esse post é seu plano de ação. Em 15 minutos você sai com tudo pronto.

## Por que o Google Business é tão importante pra negócio local

Pensa nessa busca: "lanchonete perto de mim". O Google mostra primeiro 3 resultados de **negócios físicos** (mapa, fotos, avaliações) antes de qualquer resultado de site. Essa caixa de 3 negócios concentra 70% dos cliques. Quem aparece ali ganha o cliente.

Se você não tá no Google Business, você nem disputa essa posição. Tá deixando dinheiro na mesa.

E o melhor: cadastrar é grátis. O Google não cobra pra te listar. Eles ganham quando você anuncia, mas a listagem orgânica é gratuita.

## Passo a passo: como criar seu perfil

### 1. Acessa o site oficial

Entra em business.google.com. Loga com a conta Gmail do negócio (de preferência uma conta dedicada, não o seu Gmail pessoal).

### 2. Procura seu negócio

Digita o nome da empresa. Se já existir um cadastro (alguém pode ter criado antes), você pede pra reivindicar. Se não existir, clica em "Adicionar seu negócio".

### 3. Preenche os dados básicos

- **Nome:** exatamente como o negócio se chama. Sem palavras-chave forçadas tipo "Pizzaria Taubaté Melhor Preço". O Google pune isso.
- **Categoria principal:** escolhe a mais específica possível. "Pizzaria" é melhor que "Restaurante". Você pode adicionar categorias secundárias depois.
- **Endereço:** completo, com CEP.
- **Telefone:** o WhatsApp Business funciona como número principal.
- **Site:** se não tem, deixa o link do Instagram ou WhatsApp por enquanto.

### 4. Verificação

O Google manda um cartão postal com código pro seu endereço (chega em 7 a 14 dias) ou faz verificação por telefone/vídeo dependendo do caso. Sem verificação você não aparece nas buscas.

## O que separa um perfil que vende de um perfil esquecido

Cadastrar é só o começo. O que faz seu perfil render é a otimização. Aqui vai o que mais importa, em ordem:

### Fotos (peso enorme)

O Google e os clientes amam foto. Negócios com 10+ fotos recebem 2x mais cliques que os com 0 ou 1. Sobe:

- 1 foto da fachada
- 3 a 5 fotos do interior (ambiente, atendimento)
- 5 a 10 fotos dos produtos/serviços
- 1 foto do time (humaniza muito)

Atualiza pelo menos 1 vez por mês com foto nova. O Google premia perfis ativos.

### Avaliações (peso enorme também)

Avaliação é o que mais converte. Cliente lê review antes de comprar. Negócios com nota acima de 4,5 e 30+ avaliações vendem 3x mais que os com nota 4 e 5 avaliações.

**Como conseguir avaliações sem pagar por elas:**

1. Manda um link direto pra avaliar no Google pra cada cliente satisfeito (formato: g.page/r/SUA-ID/review)
2. Pede DEPOIS de uma experiência boa (não antes, não no meio)
3. Facilita ao máximo: link no WhatsApp, QR code no balcão
4. Responde TODAS as avaliações (positivas e negativas). Isso o Google adora.

### Postagens semanais

O Google Business permite que você poste atualizações tipo "post de Instagram" no seu perfil. Quase ninguém usa. Quem usa, sobe nas buscas. Posta 1x por semana: promoção, novidade, foto do dia.

### Horário sempre atualizado

Feriado, mudança de horário, dia que vai fechar mais cedo. Atualiza. Cliente chegando em loja fechada e Google dizendo que tá aberto é estrago de reputação. O Google deixa de te mostrar pra quem busca naquele horário.

### Atributos específicos

Marca todos os atributos que se aplicam: "aceita Pix", "tem Wi-Fi", "estacionamento", "atende delivery", "acessível pra cadeira de rodas". Cada um deles é uma busca a mais onde você pode aparecer.

## O que NÃO fazer (cuidado, dá penalidade)

- ❌ Colocar palavras-chave no nome do negócio (ex: "Padaria Pão Fresco Taubaté Avenida Tiradentes 24h")
- ❌ Criar perfis duplicados
- ❌ Comprar avaliações falsas (o Google detecta e suspende)
- ❌ Endereço falso ou caixa postal
- ❌ Usar foto do Google Imagens (precisa ser sua, original)

Penalidade do Google = perfil suspenso = você some dos mapas. Recuperar leva semanas.

## Resultado esperado

Negócio local em Taubaté que parte do zero, faz cadastro completo, sobe 20 fotos, consegue 30 avaliações reais nos primeiros 3 meses e mantém o perfil ativo:

- **Mês 1 a 2:** começa a aparecer pra buscas muito específicas (ex: "estética facial Taubaté Centro")
- **Mês 3 a 4:** entra no top 10 de buscas relevantes da região
- **Mês 6 em diante:** disputa o top 3 pra buscas do seu segmento

Não é mágica. É consistência. E o ROI é absurdo porque o custo é zero.

## Por onde começar agora

Se você ainda não tem perfil, hoje é o dia. Se já tem mas tá largado:

1. Bate uma foto da fachada
2. Tira 5 fotos do interior
3. Adiciona ou atualiza horário
4. Pede 3 avaliações pra 3 clientes que você sabe que vão dar 5 estrelas
5. Faz isso de novo na próxima semana

Em 60 dias o perfil tá outro. Em 90 dias o telefone começa a tocar.

Se você quer que a gente cuide do seu perfil junto com o resto do marketing, manda mensagem. O Google Business entra junto no plano sem cobrar a parte.`,
  },

  {
    slug: 'quanto-tempo-demora-resultado-marketing-digital',
    titulo: 'Quanto tempo demora pra ver resultado em marketing digital pro seu negócio',
    subtitulo: 'O cronograma honesto que separa expectativa de realidade',
    resumo: 'Quanto tempo realmente leva pra marketing digital trazer cliente novo? Cronograma honesto por estratégia, pra você saber o que esperar e quando reclamar.',
    keywords: 'quanto tempo marketing digital demora, resultado marketing digital, marketing digital pequena empresa, agencia trafego pago, quando ver resultado',
    tags: ['Estratégia', 'Expectativa', 'Cronograma'],
    autor: 'Lira',
    publicado: false,
    cover_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=80&auto=format&fit=crop',
    cover_alt: 'Calendário com planejamento mensal',
    conteudo: `"Em quanto tempo eu vejo resultado?" é a primeira pergunta de 9 em 10 clientes que chegam pra mim. E é justa. Você vai investir dinheiro, tem que saber quando esperar retorno.

O problema é que a resposta honesta não vende. Quem promete "30 dias" tá mentindo ou tem sorte. A realidade depende de qual estratégia você escolheu, e cada uma tem seu cronograma.

Vou dar o cronograma real, baseado em centenas de campanhas que a gente já rodou.

## Tráfego pago (Meta Ads e Google Ads)

A modalidade mais rápida de gerar resultado. Mas "rápida" não é "instantânea".

| Período | O que acontece |
|---|---|
| **Semana 1 a 2** | Campanha aprendendo. Custos altos, conversões irregulares. |
| **Semana 3 a 4** | Algoritmo começa a entender. Primeiros leads começam a chegar consistentemente. |
| **Mês 2** | Operação estabilizada. CPL conhecido, fluxo previsível. |
| **Mês 3 em diante** | Otimização contínua. Escala possível. |

**Importante:** os primeiros 14 dias o algoritmo TEM que ter liberdade pra testar. Se você fica mexendo (mudando público, criativo, orçamento) toda hora nesse período, ele nunca aprende. É como ensinar criança a andar e ficar empurrando ela toda hora.

Se em 60 dias o tráfego pago não tá dando retorno mensurável, alguma coisa tá errada. Geralmente é uma dessas três:
- Criativo ruim
- Landing page ou WhatsApp não preparado
- Público mal segmentado

Não é "Instagram não funciona". É algum desses 3.

## Google Business Profile (SEO local)

Mais lento que tráfego pago, mas o resultado é orgânico e gratuito.

| Período | O que acontece |
|---|---|
| **Mês 1** | Cadastro completo. Aparece em buscas com seu nome direto. |
| **Mês 2 a 3** | Começa a aparecer em buscas relacionadas (ex: "pizzaria Centro Taubaté"). |
| **Mês 4 a 6** | Sobe pro top 10 de buscas relevantes. |
| **Mês 6 a 12** | Disputa top 3. Recebe chamadas consistentes. |

Pra acelerar: 2 ou 3 avaliações novas por semana, mais 1 foto nova por semana, mais 1 postagem semanal.

## SEO de blog

O mais demorado mas o mais lucrativo no longo prazo. Cliente que chega via Google buscando algo específico converte muito.

| Período | O que acontece |
|---|---|
| **Mês 1 a 3** | Escrever posts. Quase ninguém visita ainda. |
| **Mês 4 a 6** | Posts começam a ranquear pra termos de cauda longa. Tráfego começa. |
| **Mês 6 a 12** | Crescimento exponencial. Posts antigos rendem todo dia. |
| **Mês 12 em diante** | Tráfego orgânico previsível, escalável, gratuito. |

Atenção: o cronograma acima assume que você publica 4 a 8 posts por mês de qualidade. Publicar 1 post por mês não funciona.

## Redes sociais orgânicas (Instagram/TikTok)

O mais imprevisível. Pode estourar em uma semana ou nunca decolar.

| Período | O que acontece |
|---|---|
| **Mês 1 a 3** | Testando o que funciona. Postando 4x/semana. |
| **Mês 3 a 6** | Encontrou seu formato. Engajamento começa a crescer. |
| **Mês 6 a 12** | Audiência consolidada. Vendas diretas começam. |

A maior parte dos negócios desiste no mês 3 porque "não tá indo a lugar nenhum". Quem aguenta os 6 meses iniciais costuma colher por anos.

## Marketing de WhatsApp (lista de transmissão, broadcast, automação)

Resultado mais rápido se você já tem base de cliente. Quase nulo se não tem.

| Período | O que acontece |
|---|---|
| **Semana 1** | Setup da automação, mensagens de boas-vindas. |
| **Mês 1** | Primeiras vendas pra base existente. |
| **Mês 2 a 3** | Fluxo de recompra estabilizado. |

Esse é o canal mais subvalorizado. Quem tem 200+ clientes em base consegue gerar venda recorrente com mensagem semanal bem feita.

## A combinação mais comum (e funcional)

Pra negócio local em Taubaté ou Vale do Paraíba que começa hoje, o cronograma real combinando tudo:

- **Mês 1:** tráfego pago liga. Google Business sendo cadastrado. WhatsApp Business configurado.
- **Mês 2:** primeiros leads pagos chegam consistentes. Google Business começa a aparecer.
- **Mês 3:** primeiros clientes vindo de orgânico (Google Maps). Tráfego pago otimizado.
- **Mês 4 a 6:** redução do CPL no tráfego pago. Volume de chamadas orgânicas crescendo.
- **Mês 6 em diante:** equilíbrio entre pago e orgânico. Custo de aquisição médio cai.

Quem corta o investimento no mês 2 porque "não tá dando resultado" tá cortando justamente quando ia começar a render.

## A pergunta certa não é "quanto demora"

A pergunta certa é "quanto vai me custar até o primeiro retorno mensurável". E a resposta é:

- **Tráfego pago:** 30 a 60 dias, R$ 3.000 a R$ 6.000 investidos
- **Google Business:** 60 a 120 dias, custo zero (só tempo)
- **SEO blog:** 6 a 12 meses, R$ 8.000 a R$ 20.000 investidos
- **Redes sociais:** 90 a 180 dias, custo de produção de conteúdo

Tem que ter caixa pra aguentar esse tempo. Senão escolhe só uma estratégia e foca nela.

## Quando começar a se preocupar

Se você tá fazendo direito e:

- **Tráfego pago aos 60 dias** ainda tem CPL acima de R$ 100 pra produto de R$ 200: rever urgentemente.
- **Google Business aos 90 dias** ainda não aparece em "[seu segmento] [sua cidade]": tem coisa errada no cadastro.
- **SEO blog aos 6 meses** com zero post no top 10 do Google: a estratégia de palavra-chave tá errada.
- **Redes sociais aos 6 meses** com menos de 100 seguidores reais: o conteúdo não tá batendo com o público certo.

Antes desses prazos, mantém o curso. Marketing digital é maratona, não 100 metros rasos.

Se quiser que a gente desenhe o cronograma realista pro seu negócio específico, agenda um diagnóstico gratuito. 30 minutos, sem compromisso.`,
  },

  {
    slug: 'video-vertical-converte-mais-que-foto-2026',
    titulo: 'Por que vídeo vertical converte mais que foto profissional em 2026',
    subtitulo: 'O criativo que parece amador é o que mais vende. Entenda por quê.',
    resumo: 'Vídeo curto e amador converte mais que foto profissional em anúncio? Sim. Mostro por que isso acontece e como aproveitar pro seu negócio local sem gastar com equipamento.',
    keywords: 'video reels converte mais, criativo trafego pago, video vertical instagram ads, anuncio video celular, como gravar reels que vende',
    tags: ['Criativo', 'Vídeo', 'Reels', 'Tráfego Pago'],
    autor: 'Lira',
    publicado: false,
    cover_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80&auto=format&fit=crop',
    cover_alt: 'Pessoa gravando vídeo vertical com celular',
    conteudo: `Fala uma verdade desconfortável: aquela foto profissional do seu produto, com iluminação perfeita, fundo branco e fotógrafo cobrando R$ 800 pela sessão, provavelmente converte menos que um vídeo de 15 segundos que você gravou no celular dentro da sua loja.

Pra quem investiu em ensaio profissional, isso machuca. Mas é a realidade de 2026, e quem entende isso ganha muito dinheiro com pouco orçamento.

Vou explicar por que isso acontece e o que fazer com essa informação.

## Por que o "amador" ganha do "profissional"

### 1. O algoritmo do Meta favorece vídeo

Instagram e Facebook decidiram nos últimos 3 anos que o futuro deles é vídeo (Reels). Eles boostam organicamente conteúdo em vídeo e cobram mais barato pra promover vídeo. CPM de vídeo no Vale do Paraíba é 30% a 50% menor que CPM de foto.

Tradução: mesmo orçamento, mais pessoas vendo.

### 2. Vídeo vertical entrega mais informação

Foto mostra UMA coisa. Vídeo de 15 segundos mostra:
- O produto/serviço
- O ambiente (sua loja, seu atendimento)
- O preço/oferta
- A pessoa por trás (você ou seu time)
- A textura, movimento, uso real

Em 15 segundos a pessoa "visita" seu negócio. Foto não faz isso.

### 3. Amador parece honesto. Profissional parece anúncio.

Esse é o ponto que mais machuca quem investiu em produção. Em 2026, as pessoas tão saturadas de anúncio polido. Quando rolam o feed e vêm:

- Foto perfeita com tipografia bonita: "ah, anúncio". Rolam.
- Vídeo de pessoa real falando direto pra câmera: "espera, deixa eu ver". Param.

O cérebro humano reconhece anúncio em 0,4 segundos. Conteúdo que parece feito por uma pessoa do dia a dia passa o filtro.

> Numa campanha de estética em Taubaté, a gente testou 3 criativos: foto polida (R$ 800 de produção), vídeo amador (cliente real falando), vídeo profissional (R$ 2.500 de produção). O vídeo amador teve CPL de R$ 14. A foto polida, R$ 47. O vídeo profissional, R$ 38.

## Os 4 formatos de vídeo que mais convertem pra negócio local

### 1. "Antes e depois" (campeão absoluto)

Funciona pra estética, dentista, oficina, reforma, jardinagem, qualquer transformação visível. Em 15 segundos:

- Foto/vídeo do "antes" com texto
- Transição
- Foto/vídeo do "depois" com texto
- Frase final tipo "Quer um igual? Manda mensagem"

Custo de produção: zero. Você tem o material todo no celular.

### 2. "Tour pela loja" (peso emocional)

Pessoa real (você ou alguém do time) andando pela loja, mostrando produtos, falando direto pra câmera. Tipo "Oi, sou a Júlia, e essa é a nossa nova coleção de inverno. Olha esse casaco aqui que chegou hoje, sente como é macio". 30 a 45 segundos.

Esse formato cria vínculo. Quando a pessoa vê você na loja, ela "te conhece" antes de chegar.

### 3. "Cliente real depoimento" (autoridade instantânea)

Cliente seu real, falando da experiência. 30 segundos no máximo. Sem roteiro decorado (fica falso). Pode ser gravado pelo próprio cliente em casa, mandado por WhatsApp.

Dica: pede pro cliente falar "qual era meu problema antes" e "o que aconteceu depois". Esse é o roteiro de prova social mais forte que existe.

### 4. "Bastidores" (humaniza)

Mostra como o produto é feito, como o atendimento funciona, como você prepara as coisas. 20 a 30 segundos. Funciona muito pra negócios artesanais, gastronomia, beleza.

Esse formato faz a pessoa pensar "olha, eles fazem com cuidado". Aumenta valor percebido sem dizer "qualidade".

## O setup técnico que basta

Você NÃO precisa de:
- Câmera profissional
- Microfone caro
- Iluminação de estúdio
- Editor de vídeo complexo
- Curso de filmagem

Você PRECISA de:
- Celular dos últimos 3 anos (qualquer iPhone 11+ ou Android intermediário 2022+)
- Luz natural (gravar perto de uma janela)
- Apoio simples pro celular (R$ 30 num tripé de mesa)
- Aplicativo CapCut (grátis) pra cortar e legendar

Total de investimento em equipamento: R$ 30. Pra sempre.

## Os 3 erros mais comuns que matam o vídeo

### 1. Querer fazer "produção"

Pessoa pega o celular, começa a filmar, fica insegura, refilma 8 vezes, edita pesado, joga texto bonito. Quando termina, parece anúncio. Volta o filtro.

Faz uma tomada. Se ficou OK, é OK. Naturalidade vence perfeição.

### 2. Texto sem legenda

83% dos vídeos no Instagram são vistos SEM SOM. Se você fala 30 segundos e não tem legenda na tela, ninguém escuta. Sempre legendar (CapCut faz automático).

### 3. Não chamar pra ação

Vídeo lindo, sem pedir nada no final. Pessoa assiste, gosta, sai do feed. Nunca chamou pelo WhatsApp.

Termina TODO vídeo com chamada clara: "Manda mensagem que a gente te atende", "Comenta aí abaixo e eu te respondo", "Salva pra não esquecer". Sem isso, vídeo é entretenimento, não venda.

## Mas a foto profissional não serve pra nada?

Serve. Pra catálogo no site, pra cardápio, pra capa do Instagram, pra prints de divulgação. Em contexto controlado onde a pessoa já tá interessada e quer ver o produto, foto bonita ajuda.

O que não funciona é foto polida pra atrair quem ainda não te conhece. Pra atrair, vídeo vertical autêntico ganha hoje. E vai continuar ganhando enquanto Instagram e TikTok continuarem priorizando esse formato (provavelmente por muitos anos ainda).

## Um plano simples pra começar

Semana 1:
- Grava 5 vídeos de 15 a 30 segundos (1 "antes e depois", 1 tour, 1 bastidores, 2 mostrando produto)
- Posta 1 por dia no Reels
- Olha qual teve mais visualizações

Semana 2:
- Pega o que mais funcionou
- Boost com R$ 50 (vai pra muito mais gente)
- Replica o formato com outros produtos

Semana 3 em diante:
- Mantém ritmo de 5 vídeos por semana
- Identifica o "estilo" que funciona pra sua loja
- Escala o orçamento nos que viralizam

Em 60 dias você tem um motor de criativo rodando sem depender de fotógrafo. E vai pagar menos por cliente novo do que pagou ano passado.

Quer que a gente cuide dos criativos do seu negócio? A gente filma na sua loja, edita, posta e roda anúncio. Manda mensagem que conversa.`,
  },

  {
    slug: 'gestao-trafego-pago-sozinho-ou-agencia',
    titulo: 'Fazer tráfego pago sozinho ou contratar agência: vale a pena DIY?',
    subtitulo: 'Faz a conta dos dois lados antes de decidir.',
    resumo: 'Cuidar do tráfego pago sozinho economiza R$ 1.500 por mês ou queima R$ 5.000 em aprendizado? Análise honesta com a conta dos dois lados.',
    keywords: 'gestao trafego pago sozinho, agencia ou faz sozinho, curso trafego pago, como aprender meta ads, vale a pena contratar agencia',
    tags: ['Estratégia', 'Decisão', 'Tráfego Pago'],
    autor: 'Lira',
    publicado: false,
    cover_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80&auto=format&fit=crop',
    cover_alt: 'Pessoa trabalhando em laptop em escritório',
    conteudo: `"Lira, fiz um curso de tráfego pago. Acho que consigo cuidar disso sozinho." Ouço isso toda semana. Às vezes a pessoa tem razão. Na maioria das vezes, não. Mas a decisão é dela, e não tem certo absoluto.

Vou fazer a conta dos dois lados, com transparência total (mesmo que isso me coloque do lado errado da escolha em alguns casos).

## O caso pra fazer sozinho

Cuidar do próprio tráfego pago pode fazer sentido se você:

- **Tem tempo de verdade.** Não "tempo livre". Tempo dedicado. Mínimo 4 horas por semana.
- **Gosta do processo.** Você não vai persistir se for sofrer. Tráfego pago precisa de testes, leitura de números, ajustes. Quem não curte, abandona em 2 meses.
- **Tem orçamento baixo (R$ 500 a R$ 1.500/mês de mídia).** Nesse range, pagar R$ 1.500 pra agência cuidar de R$ 500 de mídia não faz sentido econômico.
- **Vai escalar devagar.** Sem pressa de crescer 50% em 3 meses.
- **Tem o produto/atendimento já bem afinado.** Tráfego não conserta produto ruim.

Se você marcou os 5, vai sozinho. Faz curso, estuda, testa. Em 6 a 12 meses você fica bom.

## O caso pra contratar agência

Faz mais sentido terceirizar se você:

- **Já tem operação rodando** e o tempo seu vale mais cuidando do negócio.
- **Quer escalar rápido** (mais de R$ 3.000 de mídia/mês justifica gestão dedicada).
- **Não gosta de mexer com números** e prefere focar no que você é bom.
- **Quer aprender com curva mais curta.** Agência boa traz aprendizado de outros clientes (sem entregar dados, mas entregando padrões).
- **Não tem tempo de verdade.** Você "ia cuidar de noite" e na prática nunca cuida.

## A conta real do "fazer sozinho"

Vou ser honesto. Vou contar o que vai acontecer se você decidir gerenciar.

### Primeiro mês: curva de aprendizado

Você vai gastar 12 a 20 horas estudando, configurando, criando primeiras campanhas. Vai cometer 3 a 5 erros básicos (segmentação errada, não negativar palavra, criativo ruim). CPL inicial vai ser 2x a 3x maior que poderia ser.

**Custo escondido:** se seu salário-hora é R$ 50, 20 horas dá R$ 1.000 de tempo seu. Mais orçamento queimado em aprendizado: outros R$ 800 a R$ 1.500.

Total real do primeiro mês: R$ 1.800 a R$ 2.500.

### Segundo mês: estabilizando

Você começou a entender. Aprendeu a olhar relatório, fez ajustes. CPL caindo. Ainda gasta umas 6 a 8 horas no mês. Resultado começa a aparecer.

Custo: tempo seu mais mídia.

### Terceiro mês em diante: piloto automático ou desistência

Aqui acontece a bifurcação. Quem aguentou os 2 primeiros meses entra em modo "operação". Gasta 4 horas por mês mantendo, resultado consistente. Vale a pena.

Quem desistiu, geralmente é nesse momento. Cansou, achou complicado, voltou pra "vou postar no Instagram orgânico mesmo". Resultado: gastou R$ 5.000 pra terminar sem nada.

**Taxa de desistência real:** 60% dos donos de negócio que tentam gerir o próprio tráfego pago largam antes do 4º mês.

## A conta real de contratar agência

Vou ser igualmente honesto.

### O que você paga

R$ 900 a R$ 2.500 por mês de gestão. Mais o orçamento de mídia. Total: R$ 1.500 a R$ 5.500/mês saindo do bolso.

### O que você recebe (de uma agência boa)

- Setup profissional desde o dia 1 (sem desperdício de aprendizado)
- Relatório semanal claro
- Otimização contínua (a agência cuida disso na rotina dela)
- Acesso a padrões de outros clientes (não os dados, mas o conhecimento)
- Tempo seu liberado pra cuidar do produto e atendimento

### Os riscos

Nem toda agência entrega. Tem agência ruim que cobra caro. Por isso o post anterior sobre como escolher agência é importante. Se cair com agência ruim, é pior que fazer sozinho. Pior gastar R$ 1.500 sem retorno do que gastar R$ 800 com você mesmo.

## A tabela de decisão simples

| Cenário | Recomendação |
|---|---|
| Orçamento de mídia até R$ 800/mês | Faz sozinho. Custo da agência come o lucro. |
| Orçamento de R$ 800 a R$ 2.500/mês, com tempo e vontade | Faz sozinho se gosta. Senão, agência. |
| Orçamento de R$ 2.500 a R$ 5.000/mês | Agência quase sempre vale. |
| Acima de R$ 5.000/mês de mídia | Agência sempre vale. |

## O meio-termo que muitos esquecem

Existe uma terceira opção que poucos falam: **mentoria pontual**.

Em vez de assinar agência mensal, você contrata 2 a 4 horas de consultoria pra montar o setup inicial. Depois, gerencia sozinho. A cada 60 ou 90 dias, faz uma sessão de revisão. Custa R$ 300 a R$ 800 por sessão.

Esse modelo funciona pra quem quer aprender, mas não quer começar errando do zero.

## A pergunta final

Em última instância, a pergunta não é "agência ou eu mesmo". É qual é o seu maior gargalo agora:

- Se é dinheiro: faz sozinho, mas separa R$ 300 pra uma mentoria inicial.
- Se é tempo: contrata agência mesmo no começo.
- Se é conhecimento: estuda 1 mês, depois decide com mais clareza.

Não existe escolha errada se você for honesto sobre seus recursos. Existe escolha errada quando você tenta fazer sozinho sem tempo, ou quando contrata agência sem orçamento pra mídia ficar consistente.

Se quiser conversar 30 minutos comigo sobre o seu caso específico, marca diagnóstico gratuito. Não vou empurrar agência. Se for melhor pra você fazer sozinho, vou falar.`,
  },
]

async function main() {
  let inseridos = 0, atualizados = 0, erros = 0
  for (const p of POSTS) {
    const palavras = p.conteudo.split(/\s+/).filter(Boolean).length
    const tempo_leitura_min = Math.max(1, Math.round(palavras / 200))
    const agora = new Date().toISOString()

    const { data: existe } = await sb.from('blog_posts').select('id, publicado_em').eq('slug', p.slug).maybeSingle()
    const payload = {
      ...p,
      tempo_leitura_min,
      atualizado_em: agora,
    }
    if (p.publicado && !existe?.publicado_em) payload.publicado_em = agora

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
