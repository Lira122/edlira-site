-- ═════════════════════════════════════════════════════════════════════
-- CAIXINHAS — envelope budgeting mensal
-- - tipo='gasto'   → reseta todo mês (gasolina, mercado, lazer)
-- - tipo='reserva' → acumula para sempre (emergência, viagem do ano)
-- Idempotente — pode rodar várias vezes.
-- ═════════════════════════════════════════════════════════════════════

create table if not exists caixinhas (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  valor_mensal    numeric not null default 0,    -- aloca todo mês 1
  tipo            text not null default 'gasto', -- gasto | reserva
  cor             text default '#4A9EFF',
  icone           text default '💰',
  ordem           integer default 0,
  ativa           boolean default true,
  criado_em       timestamptz default now(),
  atualizado_em   timestamptz default now()
);

-- Movimentações: cada uso (gasto) ou ajuste manual da caixinha
create table if not exists caixinhas_mov (
  id            uuid primary key default gen_random_uuid(),
  caixinha_id   uuid references caixinhas(id) on delete cascade,
  data          date not null default current_date,
  valor         numeric not null,                 -- + = saída (gasto), - = devolução/ajuste
  descricao     text,
  criado_em     timestamptz default now()
);

create index if not exists idx_caixinhas_mov_data     on caixinhas_mov (data desc);
create index if not exists idx_caixinhas_mov_caixinha on caixinhas_mov (caixinha_id);
