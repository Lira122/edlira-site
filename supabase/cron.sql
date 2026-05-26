SELECT cron.schedule(
  'sofia-followup',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/followup',
    -- Substitua SERVICE_ROLE_KEY pela chave service_role do Supabase antes de rodar.
    headers := '{"Content-Type":"application/json","Authorization":"Bearer SERVICE_ROLE_KEY"}'::jsonb,
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);
