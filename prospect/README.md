# Motor de Prospecção — Eleva Digital

Coleta empresas **reais** do Google (Vale do Paraíba + SP), pontua o quão
**fraco** é o marketing de cada uma e joga os melhores prospects no seu CRM.

> Quanto **maior o score** (0 a 9), mais carente de marketing a empresa está
> — ou seja, melhor o prospect pra você.

---

## Como pontuamos "marketing fraco"

| Sinal | Pontos |
|---|---|
| Não tem site nenhum | +4 |
| Tem site, mas está fora do ar / instável | +3 |
| Tem site, mas sem HTTPS (cadeado) — sinal de site velho | +2 |
| 0 avaliações no Google | +3 |
| Menos de 10 avaliações | +2 |
| Entre 10 e 29 avaliações | +1 |
| Nenhuma foto no perfil do Google | +2 |
| Menos de 5 fotos | +1 |

Cada prospect ainda recebe um **link da Biblioteca de Anúncios da Meta** —
um clique e você vê se a empresa roda (ou não) anúncios. "Não roda" = não
investe em tráfego = sua deixa pra entrar.

---

## Passo 1 — Preparar o CRM (uma vez)

1. Abra o Supabase → **SQL Editor**.
2. Cole o conteúdo de [`schema.sql`](schema.sql) e clique **Run**.

Isso cria as colunas `site`, `cidade`, `score`, `origem`, `opt_out` etc. na
tabela `clientes`. É seguro — não apaga nada.

## Passo 2 — Pegar a chave do Google Places

A Places API é o Google Maps "automatizado". Você precisa de uma chave.
É grátis dentro de uma cota mensal generosa.

1. Acesse **console.cloud.google.com** e entre com sua conta Google.
2. No topo, no seletor de projeto → **Novo projeto** → nome `Eleva Digital Prospeccao` → **Criar**.
3. Menu lateral → **Faturamento** → vincule uma conta de faturamento (precisa
   cadastrar um cartão — é só identificação; dentro da cota você não paga).
4. Menu → **APIs e serviços** → **Biblioteca** → busque **"Places API (New)"**
   → abra → **Ativar**.
5. Menu → **APIs e serviços** → **Credenciais** → **Criar credenciais** →
   **Chave de API** → **copie a chave**.
6. (Recomendado) clique na chave → em *Restrições de API* escolha
   **Places API (New)** → Salvar. Assim a chave só serve pra isso.
7. (Proteção) Menu → **Faturamento** → **Orçamentos e alertas** → crie um
   orçamento baixo (ex.: R$ 20) com alertas em 50% / 90% / 100%. Você recebe
   e-mail muito antes de qualquer susto.

> **Custo real:** o Google dá uma cota gratuita mensal grande. Para alguns
> milhares de empresas você não paga nada. Mesmo assim, **comece pequeno**
> (veja abaixo) e acompanhe o painel de faturamento nos primeiros dias.

## Passo 3 — Configurar o projeto

```powershell
cd prospect
npm install
copy .env.example .env
```

Abra o `.env` e preencha:

- `SB_KEY` → Supabase → **Project Settings** → **API** → copie a chave
  **`service_role`** (a secreta).
- `GOOGLE_PLACES_KEY` → a chave do Passo 2.

## Passo 4 — Rodar

**Sempre comece em modo preview** (não grava nada, só gera uma planilha):

```powershell
# Teste pequeno: 2 nichos, 1 cidade
node run.js --nichos dentista,academia --cidades "Taubaté"
```

Confira o arquivo gerado em `prospect/output/prospects-AAAA-MM-DD.csv`
(abre direto no Excel).

Gostou? Rode de novo com `--commit` para gravar no CRM:

```powershell
node run.js --nichos dentista,academia --cidades "Taubaté" --commit
```

Os leads aparecem no CRM com status **Prospecção**.

### Opções

| Flag | O que faz |
|---|---|
| _(nenhuma)_ | Roda todos os nichos e cidades, modo preview |
| `--commit` | Grava os prospects no CRM (sem isso, só gera o CSV) |
| `--nichos dentista,academia` | Só esses nichos (os `key` do `config.js`) |
| `--cidades "Taubaté,Jacareí"` | Só essas cidades |
| `--max 40` | Limite de empresas por busca (padrão 60, máx. do Google) |
| `--score 5` | Score mínimo para o lead entrar (padrão 3) |

### Recomendação de uso

1. Rode **1 nicho × 1 cidade** primeiro pra ver o custo no painel do Google.
2. Vá ampliando aos poucos. A lista completa do `config.js` são 22 nichos ×
   12 cidades = 264 buscas — rode isso só depois de confirmar que está barato.
3. Rode **mensalmente** — empresas novas abrem o tempo todo.

---

## Próxima etapa: o disparo

Os prospects entram com `status = prospeccao` e `opt_out = false`. O esquema
de contato (próxima etapa) vai usar esses campos para **nunca** mandar
mensagem para quem marcou opt-out, e para abordar cada empresa de forma
**personalizada** (citando o diagnóstico do `score_detalhe`), no ritmo certo
— em vez de disparo idêntico em massa, que derruba o número e expõe na LGPD.
