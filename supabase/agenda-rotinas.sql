-- Rotinas pessoais do Lira na Agenda (academia, leitura, estudo, etc).
-- Aparece misturado com eventos da agenda. Marca "feito hoje" e calcula streak.

create table if not exists public.agenda_rotinas (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  categoria   text,            -- 'academia' | 'leitura' | 'estudo' | 'meditacao' | 'outra'
  icone       text,            -- emoji (ex: '💪', '📚', '🧘')
  cor         text default '#C5F82A',
  dias_semana text[] not null, -- ['seg','ter','qua','qui','sex','sab','dom']
  horario     time,             -- opcional, ex: '06:30:00'
  observacoes text,
  ativa       boolean default true,
  criado_em   timestamptz default now()
);

create table if not exists public.agenda_rotinas_check (
  id         uuid primary key default gen_random_uuid(),
  rotina_id  uuid references public.agenda_rotinas(id) on delete cascade,
  data       date not null,
  criado_em  timestamptz default now(),
  unique (rotina_id, data)
);

create index if not exists idx_agenda_rotinas_check_data
  on public.agenda_rotinas_check(data desc);

create index if not exists idx_agenda_rotinas_check_rotina_data
  on public.agenda_rotinas_check(rotina_id, data desc);

-- RLS off (CRM acessa via service_role pelo server.js — sem usuário público)
alter table public.agenda_rotinas         disable row level security;
alter table public.agenda_rotinas_check   disable row level security;
