-- ═══════════════════════════════════════════════════════════════════════
--  Agenda o descarte automatico de leads em status='novo' parados > 7d
--  Rodar 1x no SQL Editor apos deployar a edge function descartar-parados
--
--  Cron: 07 UTC diariamente = 04h BRT (janela de baixo trafego)
-- ═══════════════════════════════════════════════════════════════════════

-- Remove agendamento anterior (idempotente)
SELECT cron.unschedule('eleva-descartar-parados')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'eleva-descartar-parados');

-- Cria o agendamento
SELECT cron.schedule(
  'eleva-descartar-parados',
  '0 7 * * *',
  E'SELECT net.http_post(
      url := ''https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/descartar-parados'',
      headers := ''{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsenBibHBlZ29xanhhYWNqdmhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE4MzY0NSwiZXhwIjoyMDkzNzU5NjQ1fQ.7Faqa-D_TfflCgZ3Yq7yicZKYAfZ3WHBdSBKvLSDRY8"}''::jsonb,
      body := ''{}''::jsonb
    );'
);

-- Confere que foi criado
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'eleva-descartar-parados';
