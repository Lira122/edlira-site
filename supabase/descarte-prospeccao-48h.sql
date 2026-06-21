-- ════════════════════════════════════════════════════════════════
--  Limpeza retroativa: leads de prospecção que nunca responderam
--  em 48h vão pra status='perdido'. Roda 1 vez no SQL Editor.
--
--  Critério (mesmo que a edge function followup aplica daqui em diante):
--   - lead_data->>origem = 'disparo_prospeccao'
--   - nenhuma mensagem com role='user' no histórico
--   - última atualização há mais de 48h
--   - stage ainda não está em 'encerrado' nem 'em_pausa'
-- ════════════════════════════════════════════════════════════════

-- 1) Confere antes (dry-run): quantos vão ser descartados?
SELECT count(*) AS vai_descartar
FROM chatbot_conversations
WHERE lead_data->>'origem' = 'disparo_prospeccao'
  AND stage NOT IN ('encerrado', 'em_pausa', '__debug__')
  AND updated_at < now() - interval '48 hours'
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(messages) AS m
    WHERE m->>'role' = 'user'
  );

-- 2) Marca clientes correspondentes como perdidos
UPDATE clientes c
SET status = 'perdido',
    atualizado_em = now()
FROM chatbot_conversations cc
WHERE cc.phone = c.whatsapp
  AND cc.lead_data->>'origem' = 'disparo_prospeccao'
  AND cc.stage NOT IN ('encerrado', 'em_pausa', '__debug__')
  AND cc.updated_at < now() - interval '48 hours'
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(cc.messages) AS m
    WHERE m->>'role' = 'user'
  )
  AND c.status IN ('novo', 'qualificado', 'proposta');

-- 3) Encerra a conversa do bot pra esses telefones
UPDATE chatbot_conversations
SET stage = 'encerrado',
    lead_data = lead_data
      || jsonb_build_object(
        'descartado_em', now(),
        'motivo_descarte', 'sem_resposta_48h_backfill'
      ),
    updated_at = now()
WHERE lead_data->>'origem' = 'disparo_prospeccao'
  AND stage NOT IN ('encerrado', 'em_pausa', '__debug__')
  AND updated_at < now() - interval '48 hours'
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(messages) AS m
    WHERE m->>'role' = 'user'
  );

-- 4) Confere depois: quantos sobraram em negociação?
SELECT status, count(*)
FROM clientes
WHERE status IN ('novo', 'qualificado', 'proposta')
GROUP BY status
ORDER BY status;
