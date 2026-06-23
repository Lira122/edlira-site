-- ═════════════════════════════════════════════════════════════════════
-- LIBERDADE FINANCEIRA — V2: múltiplas metas (caixinhas)
-- Rodar UMA vez no SQL editor (idempotente — pode reaplicar).
-- ═════════════════════════════════════════════════════════════════════

-- Nova tabela: cada meta é uma "caixinha" independente
create table if not exists metas_fin (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  valor_alvo      numeric not null,
  valor_inicial   numeric not null default 0,   -- saldo já tinha antes de começar
  prazo_meses     integer,                       -- opcional: deadline
  cor             text default '#C5F82A',
  icone           text default '🎯',             -- emoji
  ordem           integer default 0,
  principal       boolean default false,         -- a "north star" — só uma
  status          text default 'ativa',          -- ativa | pausada | atingida
  criado_em       timestamptz default now(),
  atualizado_em   timestamptz default now()
);

-- Aportes ganham vínculo opcional com uma meta
alter table aportes_fin
  add column if not exists meta_id uuid references metas_fin(id) on delete set null;

create index if not exists idx_aportes_fin_meta on aportes_fin (meta_id);

-- Garante constraint de unicidade no principal — só uma meta pode ser principal
create unique index if not exists ux_metas_fin_principal
  on metas_fin ((principal)) where principal = true;

-- ── SEED da meta principal ─────────────────────────────────────────
-- Se não tem nenhuma meta ainda, cria "Liberdade Financeira" usando os
-- valores da config_fin existente (já tem meta R$100k, saldo, etc.)
do $$
declare
  cfg config_fin%rowtype;
  v_meta_id uuid;
begin
  select * into cfg from config_fin where id = 'main';
  if cfg.id is null then return; end if;

  if not exists (select 1 from metas_fin where principal = true) then
    insert into metas_fin (nome, valor_alvo, valor_inicial, cor, icone, principal, ordem)
    values (
      coalesce(cfg.meta_titulo, 'Liberdade Financeira'),
      coalesce(cfg.meta_brl, 100000),
      coalesce(cfg.saldo_atual_brl, 0),
      '#C5F82A',
      '🚀',
      true,
      0
    )
    returning id into v_meta_id;

    -- Aportes antigos (sem meta_id) ficam vinculados à meta principal
    update aportes_fin set meta_id = v_meta_id where meta_id is null;
  end if;
end$$;
