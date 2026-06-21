-- ════════════════════════════════════════════════════════════════
--  Notificação de cliente quando tarefa é concluída.
--  Roda 1 vez no SQL Editor.
--
--  - notificar_cliente: se a tarefa deve entrar no digest do cliente
--  - apelido_cliente:   versão "humana" do título pra mostrar no WhatsApp
--                       (se vazio, usa o próprio título)
--  - notificado_cliente_em: trava idempotência — evita duplicar no digest
--                       quando a tarefa é reaberta + concluída de novo
-- ════════════════════════════════════════════════════════════════

ALTER TABLE tarefas
  ADD COLUMN IF NOT EXISTS notificar_cliente     boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS apelido_cliente       text,
  ADD COLUMN IF NOT EXISTS notificado_cliente_em timestamptz;

-- Índice usado pelo digest-cliente: pega tarefas concluídas hoje ainda
-- não notificadas
CREATE INDEX IF NOT EXISTS tarefas_notif_cliente_idx
  ON tarefas (atualizado_em)
  WHERE status = 'done'
    AND notificado_cliente_em IS NULL
    AND notificar_cliente = true;

-- Confere
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tarefas'
  AND column_name IN ('notificar_cliente', 'apelido_cliente', 'notificado_cliente_em')
ORDER BY column_name;
