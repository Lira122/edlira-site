-- ════════════════════════════════════════════════════════════════
--  Agendamento do disparo automático (pg_cron)
--  Rode UMA VEZ no Supabase: Dashboard > SQL Editor > cole e Run.
--
--  A cada 20 min a função "disparo" é chamada. Ela mesma decide:
--   - só age em horário comercial (seg-sáb, 8h-19h)
--   - para ao atingir a cota diária (DISPARO_CAP, padrão 20)
--   - respeita o liga/desliga do agente no painel
-- ════════════════════════════════════════════════════════════════

-- Remove agendamento anterior, se existir (seguro rodar de novo)
SELECT cron.unschedule('edlira-disparo')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'edlira-disparo');

SELECT cron.schedule(
  'edlira-disparo',
  '*/20 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/disparo',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsenBibHBlZ29xanhhYWNqdmhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE4MzY0NSwiZXhwIjoyMDkzNzU5NjQ1fQ.7Faqa-D_TfflCgZ3Yq7yicZKYAfZ3WHBdSBKvLSDRY8"}'::jsonb,
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Para PAUSAR o disparo a qualquer momento:
--   SELECT cron.unschedule('edlira-disparo');
-- (ou desative o agente no painel do CRM — a função respeita isso)
