-- ═════════════════════════════════════════════════════════════════════
-- PLANOS — snapshot persistente de uma estratégia de aporte por meta
-- Cada meta pode ter UM plano ativo. Salva fases + taxa + alvo da época.
-- Idempotente.
-- ═════════════════════════════════════════════════════════════════════

create table if not exists planos_fin (
  id              uuid primary key default gen_random_uuid(),
  meta_id         uuid not null references metas_fin(id) on delete cascade,
  nome            text not null,
  fases           jsonb not null,                -- [{inicio: 0, aporte: 2500}, ...]
  taxa_aa         numeric not null,
  meses_total     integer not null,
  pv_inicial      numeric not null default 0,   -- saldo da meta na hora de criar
  valor_alvo      numeric not null,              -- alvo da meta na hora de criar
  proj_final      numeric,                       -- projeção esperada no final dos meses
  ativo           boolean default true,
  criado_em       timestamptz default now(),
  atualizado_em   timestamptz default now()
);

-- Só um plano ativo por meta — se salvar novo, desativa o antigo
create unique index if not exists ux_planos_fin_ativo on planos_fin (meta_id) where ativo = true;
create index        if not exists ix_planos_fin_meta  on planos_fin (meta_id);
