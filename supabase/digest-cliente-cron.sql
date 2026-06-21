-- ════════════════════════════════════════════════════════════════
--  Agenda o digest do cliente pra rodar todo dia útil às 18h BRT
--  (= 21h UTC). Seg-Sex (1-5) — sábado e domingo não dispara.
--  Roda 1 vez no SQL Editor.
-- ════════════════════════════════════════════════════════════════

-- Remove se já existir (idempotente)
SELECT cron.unschedule('edlira-digest-cliente')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'edlira-digest-cliente');

SELECT cron.schedule(
  'edlira-digest-cliente',
  '0 21 * * 1-5',
  $$
  SELECT net.http_post(
    url     := 'https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/digest-cliente',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsenBibHBlZ29xanhhYWNqdmhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE4MzY0NSwiZXhwIjoyMDkzNzU5NjQ1fQ.7Faqa-D_TfflCgZ3Yq7yicZKYAfZ3WHBdSBKvLSDRY8"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);

-- Confere
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'edlira-digest-cliente';
