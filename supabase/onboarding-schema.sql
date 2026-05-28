-- ════════════════════════════════════════════════════════════════
--  Onboarding de clientes — Eleva Digital
--  Rode UMA VEZ no SQL Editor do Supabase.
-- ════════════════════════════════════════════════════════════════

-- 1. Tokens (controle de acesso ao formulário) ────────────────
create table if not exists onboarding_tokens (
  token         text primary key,
  cliente_id    uuid references clientes(id) on delete cascade,
  cliente_nome  text,                                  -- snapshot pra histórico
  criado_em     timestamptz default now(),
  expira_em     timestamptz not null,
  usado_em      timestamptz,
  ip_uso        inet,
  user_agent    text
);
create index if not exists onboarding_tokens_cliente_idx on onboarding_tokens(cliente_id);
create index if not exists onboarding_tokens_expira_idx  on onboarding_tokens(expira_em);

-- View com status calculado em tempo de leitura (now() não funciona em coluna generated)
create or replace view onboarding_tokens_status as
select
  token, cliente_id, cliente_nome, criado_em, expira_em, usado_em, ip_uso, user_agent,
  case
    when usado_em is not null then 'preenchido'
    when expira_em < now()    then 'expirado'
    else 'pendente'
  end as status
from onboarding_tokens;

-- 2. Dados comuns (etapas 1 e 3) — NÃO SENSÍVEIS ─────────────
create table if not exists onboarding_dados (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid unique references clientes(id) on delete cascade,
  token           text references onboarding_tokens(token),
  ramo            text,
  ticket_medio    numeric,
  objetivo_90d    text,
  site            text,
  produtos        text,
  faqs            text,
  horario_atend   text,
  tom_de_voz      text,
  submitted_at    timestamptz default now()
);
create index if not exists onboarding_dados_cliente_idx on onboarding_dados(cliente_id);

-- 3. Credenciais — SENSÍVEL (tudo cifrado em AES-256-GCM) ────
create table if not exists onboarding_credenciais (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid unique references clientes(id) on delete cascade,
  token           text references onboarding_tokens(token),
  -- Identificadores (não-sensíveis, mas ficam separados pra consistência)
  insta_handle    text,
  meta_bm_id      text,
  google_ads_id   text,
  whatsapp_com    text,
  -- Senhas e tokens: tudo aqui, cada valor cifrado individualmente
  -- Formato de cada valor: "base64(iv):base64(ct):base64(authTag)"
  cred_jsonb      jsonb,
  submitted_at    timestamptz default now()
);
create index if not exists onboarding_credenciais_cliente_idx on onboarding_credenciais(cliente_id);

-- 4. Auditoria de descriptografia (quem viu o quê e quando) ──
create table if not exists onboarding_cred_audit (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid references clientes(id),
  campo           text,
  acessado_em     timestamptz default now(),
  ip              inet,
  user_agent      text,
  origem          text
);

-- 5. RLS — bloqueia anon e authenticated; só service_role passa
alter table onboarding_tokens       enable row level security;
alter table onboarding_dados        enable row level security;
alter table onboarding_credenciais  enable row level security;
alter table onboarding_cred_audit   enable row level security;
-- (sem POLICIES = nada passa exceto service_role, que ignora RLS)
