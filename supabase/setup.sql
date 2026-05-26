-- ── Colunas adicionais em chatbot_conversations ──────────────────────────────
ALTER TABLE chatbot_conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;

-- ── Colunas adicionais em clientes ────────────────────────────────────────────
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS temperatura  TEXT CHECK (temperatura IN ('quente','morno','frio','gelado'));
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS pausado_ate  TIMESTAMPTZ;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW();

-- ── Atualiza status "reuniao_agendada" para STATS válidos (usa proposta) ──────
UPDATE clientes SET status = 'proposta' WHERE status = 'reuniao_agendada';

-- ── pg_cron: follow-up a cada 5 minutos ──────────────────────────────────────
-- Habilite a extensão pg_cron no painel Supabase (Database > Extensions > pg_cron)
-- Depois rode:

SELECT cron.schedule(
  'sofia-followup',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/followup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Se não tiver a config, use assim (substitua YOUR_SERVICE_ROLE_KEY):
-- SELECT cron.schedule(
--   'sofia-followup',
--   '*/5 * * * *',
--   $$
--   SELECT net.http_post(
--     url     := 'https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/followup',
--     headers := '{"Content-Type":"application/json","Authorization":"Bearer SERVICE_ROLE_KEY"}'::jsonb,
--     body    := '{}'::jsonb
--   ) AS request_id;
--   $$
-- );
