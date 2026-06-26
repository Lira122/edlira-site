# Eleva · Claude Usage Monitor

Extensão de Chrome (manifest v3) que lê o uso da janela 5h da sua conta Claude.ai (planos Pro/Max) e envia o snapshot pro CRM da Eleva Digital.

## O que ela faz
- A cada **5 minutos**, faz uma requisição interna ao claude.ai usando seus cookies já logados
- Extrai: % de uso da sessão de 5h, quando reinicia, % do limite semanal, % do Opus
- Envia pro endpoint `claude-usage-ingest` da edge function do CRM
- Funciona em background. Zero UI a menos que você abra o popup.

## O que ela NÃO faz
- Não vê outros sites (permissão restrita a `claude.ai`)
- Não abre janelas / não notifica nada
- Não funciona sem você estar logado no claude.ai
- Não compartilha o cookie de sessão com ninguém — só faz fetch do próprio domínio

## Setup (5 minutos)

### 1. Gerar o token de ingestão

Esse token é compartilhado entre o servidor e a extensão. Gera local no seu PC:

```powershell
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

Copia o output (uma string hex de 48 caracteres). NÃO compartilha com ninguém — só vai em 2 lugares: Supabase secret + extensão.

### 2. Configurar o secret no Supabase

```powershell
supabase secrets set CLAUDE_INGEST_TOKEN="COLA_O_TOKEN_AQUI" --project-ref flzpblpegoqjxaacjvhf
```

### 3. Instalar a extensão no Chrome

1. Abre `chrome://extensions/`
2. Liga o toggle **"Modo desenvolvedor"** (canto superior direito)
3. Clica em **"Carregar sem compactação"**
4. Seleciona a pasta `extensao-claude-usage` desse projeto
5. A extensão aparece com ícone da Eleva

### 4. Configurar o token na extensão

1. Clica no ícone da extensão na barra do Chrome
2. Cola o mesmo token gerado no passo 1 no campo "Ingest token"
3. Clica em **Salvar token**
4. Clica em **Sincronizar agora** pra forçar o primeiro envio
5. Se aparecer "✓ Última sync às HH:MM" verde, tá funcionando

### 5. Conferir no CRM

Abre o CRM → aba **Uso de IA**. A barra "🚦 Janela 5h do Claude" agora mostra dados reais (% da sessão, reset em XhYY).

## Troubleshooting

**"Falhou - HTTP 401"**: token errado. Verifica se o que você colou na extensão é o mesmo que setou no Supabase secret.

**"Falhou - claude.ai HTTP 401"**: você não tá logado no claude.ai. Abre o claude.ai numa aba, loga, depois volta na extensão e clica em "Sincronizar agora".

**"Falhou - claude.ai HTTP 404"**: o endpoint interno do claude.ai mudou. Abre `background.js` e atualiza a constante `CLAUDE_USAGE_URL` baseado no que aparece no Network tab quando você abre `claude.ai/settings/usage`.

**"plano: ?", "sessao 5h: ?"**: o formato do JSON do claude.ai mudou. Os campos brutos ficam salvos em `dados_brutos` na tabela `claude_usage_snapshots` — abre o Supabase, vê a estrutura, ajusta a função `normalizar()` em `background.js`.

## Atualização

Se você fizer mudanças nessa extensão, em `chrome://extensions/` clica no ícone de "recarregar" do card da extensão. Não precisa reinstalar.

## Desinstalar

`chrome://extensions/` → card da extensão → **Remover**. Os dados na tabela `claude_usage_snapshots` ficam (você pode apagar manualmente se quiser).
