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
    -- Substitua SERVICE_ROLE_KEY pela chave service_role do Supabase antes de rodar.
    headers := '{"Content-Type":"application/json","Authorization":"Bearer SERVICE_ROLE_KEY"}'::jsonb,
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Para PAUSAR o disparo a qualquer momento:
--   SELECT cron.unschedule('edlira-disparo');
-- (ou desative o agente no painel do CRM — a função respeita isso)
