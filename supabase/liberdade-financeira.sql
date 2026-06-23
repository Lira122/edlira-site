-- ═════════════════════════════════════════════════════════════════════
-- LIBERDADE FINANCEIRA — schema das tabelas usadas pela view liberdade.js
-- Rodar UMA vez no SQL editor do Supabase.
-- ═════════════════════════════════════════════════════════════════════

create table if not exists config_fin (
  id                     text primary key default 'main',
  meta_brl               numeric not null default 100000,
  meta_titulo            text    not null default 'Liberdade financeira',
  saldo_atual_brl        numeric not null default 0,
  selic_aa               numeric not null default 14.25,
  aporte_pct_faturamento numeric not null default 20,
  inicio                 date    not null default current_date,
  atualizado_em          timestamptz default now()
);

-- Garante a linha singleton existir
insert into config_fin (id) values ('main')
on conflict (id) do nothing;

create table if not exists aportes_fin (
  id          uuid primary key default gen_random_uuid(),
  data        date not null default current_date,
  valor       numeric not null,
  fonte       text default 'manual',     -- manual | faturamento | bonus | outro
  observacao  text,
  criado_em   timestamptz default now()
);

create index if not exists idx_aportes_fin_data on aportes_fin (data desc);
