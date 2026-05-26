# Follow-up Inteligente — Eleva Digital
## Scripts humanizados + lógica de automação

---

## LÓGICA GERAL DO SISTEMA

```
[Lead responde pela 1ª vez]
        │
        ▼
[Agente inicia conversa SPIN]
        │
        ├── Lead responde → cancela qualquer follow-up pendente
        │
        └── Lead para de responder
                │
                ├── 5 min  → Follow-up 1 (casual, leve)
                │
                ├── 1 hora → Follow-up 2 (entrega valor)
                │
                └── 1 dia  → Follow-up 3 (cria contexto de urgência suave)
                        │
                        ├── Lead responde → volta para fluxo SPIN
                        │
                        └── Lead abre mas não responde (read receipt)
                                │
                                └── 1 dia → Reengajamento (nova abertura)
                                        │
                                        └── Silêncio novamente
                                                │
                                                └── 1 dia → Último toque
                                                        │
                                                        └── Arquiva lead
```

---

## REGRAS DE ATIVAÇÃO

| Condição | Ação |
|---|---|
| Lead enviou mensagem nova | Cancela todos os timers pendentes |
| Lead abriu o chat (read receipt) mas não respondeu | Pausa timer, reinicia contagem de 1 dia |
| Lead respondeu após follow-up | Retoma fluxo SPIN do ponto onde parou |
| Lead não responde ao "Último toque" | Marca como "frio" no CRM, arquiva por 30 dias |
| Lead retorna após 30 dias | Inicia fluxo de reengajamento de 30 dias |

---

## MENSAGENS DE FOLLOW-UP

> ⚠️ **Regra crítica**: nunca mande dois follow-ups ao mesmo tempo. Espere a janela anterior passar por completo antes de acionar o próximo.

---

### ⏱️ FOLLOW-UP 1 — 5 minutos
**Gatilho:** sem resposta após 5 min da última mensagem do agente  
**Tom:** casual, como se você estivesse verificando se a mensagem chegou  
**Objetivo:** verificar entrega, não pressionar

---

**Opção A (mais casual):**
> "Oi, tudo chegou aí? 😅"

**Opção B (se a pergunta anterior foi aberta):**
> "Me conta quando puder, sem pressa 👍"

**Opção C (se o lead demonstrou interesse antes):**
> "Fica à vontade pra responder quando tiver um minutinho"

> 💡 Use apenas UMA das opções. Escolha baseado no contexto da última mensagem enviada.

---

### ⏱️ FOLLOW-UP 2 — 1 hora
**Gatilho:** sem resposta após 1h do Follow-up 1  
**Tom:** entrega valor, não cobra resposta  
**Objetivo:** manter presença sem pressionar, adicionar algo útil

---

**Opção A — entrega insight:**
> "Enquanto você pensa, deixa eu te contar uma coisa que a maioria das empresas não sabe:
>
> O Meta Pixel nativo hoje perde em média 40% dos eventos de conversão por causa de bloqueadores e iOS. Isso significa que suas campanhas estão otimizando com dado errado.
>
> É exatamente isso que a gente resolve logo de cara pra qualquer cliente."

**Opção B — pergunta simples:**
> "Sei que o dia a dia é corrido.
>
> Me diz uma coisa rápida: o maior desafio do seu negócio hoje é captar mais leads ou converter os que já chegam?"

**Opção C — case:**
> "Tava aqui pensando na sua situação.
>
> A gente atendeu uma [tipo de negócio similar] que tinha o mesmo problema que você me contou. Em 60 dias o custo por lead caiu pela metade.
>
> Se fizer sentido te contar como foi, é só falar."

---

### ⏱️ FOLLOW-UP 3 — 1 dia
**Gatilho:** sem resposta após 24h do Follow-up 2  
**Tom:** cria leveza, oferece saída sem pressão, pequena urgência contextual  
**Objetivo:** última tentativa antes do reengajamento

---

**Opção A — devolve a decisão pra ele:**
> "Oi [nome], passando pra não sumir.
>
> Se ainda fizer sentido conversar, ótimo. Se não for o momento certo agora, sem problema também — é só me falar e a gente retoma quando você quiser.
>
> O que você prefere?"

**Opção B — curiosidade:**
> "Oi [nome], uma pergunta rápida e juro que não incomodo mais hoje 😄
>
> O que tá travando mais o crescimento do seu negócio agora — dinheiro, tempo ou falta de sistema?"

**Opção C — urgência real (use só se tiver uma razão verdadeira):**
> "Oi [nome], essa semana ainda tenho um horário disponível para o diagnóstico gratuito que eu te falei.
>
> Semana que vem a agenda já está lotada. Se quiser garantir, é só me falar agora e eu reservo pra você."

---

## REENGAJAMENTO — 1 dia após lead abrir sem responder

**Gatilho:** lead abriu o chat (leu a mensagem) mas não respondeu em 24h  
**Tom:** reconhece que ele viu, sem cobrar  
**Objetivo:** dar abertura pra ele responder sem sentir culpa

---

**Mensagem:**
> "Oi [nome], vi que você deu uma olhada por aqui 👀
>
> Fica sem pressão — se tiver com dúvida ou quiser retomar quando tiver mais tempo, pode me chamar quando quiser.
>
> Se quiser que eu te mande uma coisa sobre [problema que ele citou], é só falar também."

**Variação B:**
> "Oi [nome]! Sei que o dia a dia é corrido.
>
> Quando tiver 2 minutinhos, adoraria entender um pouco mais do seu negócio pra ver se faz sentido a gente trabalhar juntos.
>
> Sem pressa 👍"

---

## ÚLTIMO TOQUE — 1 dia após reengajamento sem resposta

**Gatilho:** lead não respondeu o reengajamento em 24h  
**Tom:** encerramento elegante, abre porta futura  
**Objetivo:** não desaparecer de forma abrupta, deixar porta aberta

---

**Mensagem:**
> "Oi [nome], vou deixar você à vontade por aqui.
>
> Se em algum momento quiser conversar sobre como escalar o seu negócio com tráfego e automação, pode me chamar — tô sempre por aqui.
>
> Abraço! 👋"

> Após enviar: marcar lead como **"frio"** no CRM e agendar novo contato em 30 dias.

---

## REENGAJAMENTO DE 30 DIAS (lead frio)

**Gatilho:** lead ficou sem resposta por 30 dias  
**Tom:** como se retomasse uma conversa antiga de forma natural  
**Objetivo:** verificar se o contexto mudou

---

**Mensagem:**
> "Oi [nome]! Faz um tempo que não conversamos.
>
> Tava aqui e lembrei de você. Como tá o [negócio dele]? Ainda com os mesmos desafios de antes ou mudou algo?"

> Se responder → volta pro fluxo SPIN do zero.  
> Se não responder → arquivar contato definitivamente.

---

## COMO IMPLEMENTAR NO N8N

### Variáveis necessárias por contato:
```json
{
  "lead_id": "uuid",
  "ultimo_contato": "timestamp",
  "ultimo_remetente": "lead | agente",
  "status_followup": "aguardando | f1_enviado | f2_enviado | f3_enviado | reengajamento | frio | arquivado",
  "leu_mensagem": true,
  "conversa_ativa": true
}
```

### Fluxo N8n (resumo dos nós):

```
[Webhook WhatsApp] 
    → Atualiza "ultimo_contato" e "ultimo_remetente"
    → Se remetente = LEAD: cancela timers, status = "aguardando"
    → Se remetente = AGENTE: inicia timer de 5 min

[Timer 5min] → Se último_remetente ainda = AGENTE → envia F1

[Timer 1h]  → Se último_remetente ainda = AGENTE → envia F2

[Timer 24h] → Se último_remetente ainda = AGENTE → envia F3

[Webhook read receipt] 
    → Se leu_mensagem = true E último_remetente = AGENTE
    → Pausa timers, agenda reengajamento em 24h

[Timer reengajamento 24h] → Envia msg de reengajamento

[Timer último toque 24h]  → Envia último toque, marca como frio

[Timer 30 dias]           → Envia mensagem de reengajamento longo
```

### Plataformas compatíveis:
- **N8n** (recomendado) — controle total dos timers
- **ManyChat** — usar sequências com delay
- **Typebot** — fluxo com wait nodes
- **Z-API + N8n** — para WhatsApp direto
- **Evolution API** — open source, mais controle

---

## REGRAS DE OURO

1. **Nunca mande mais de 3 mensagens sem resposta** antes de parar completamente
2. **Personalize sempre** — use o nome da pessoa e o problema que ela citou
3. **Nunca cite concorrência** — fale só de resultado
4. **Tom muda com o tempo** — 5min é levíssimo, 1 dia é mais reflexivo
5. **Deixe saída digna** — o último toque nunca pode ser agressivo
6. **Leu mas não respondeu ≠ não está interessado** — pode estar ocupado
7. **Horário importa** — nunca dispare follow-up entre 22h e 8h
