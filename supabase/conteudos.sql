-- Kanban de pauta/conteúdo do Lira (ideias → publicado)
create table if not exists public.conteudos (
  id               uuid primary key default gen_random_uuid(),
  titulo           text not null,
  descricao        text,                 -- roteiro / observações
  tipo             text default 'reel',  -- 'reel' | 'post' | 'story' | 'yt' | 'tiktok' | 'blog' | 'outro'
  canais           text[] default array[]::text[], -- ['instagram','youtube','tiktok','site']
  data_publicacao  timestamptz,          -- prevista/agendada
  status           text default 'ideia', -- 'ideia' | 'roteiro' | 'gravado' | 'editando' | 'agendado' | 'publicado'
  ordem            int default 0,        -- pra reorder dentro da coluna
  cliente_id       uuid,                 -- opcional
  link_arquivo     text,                 -- opcional URL do drive
  criado_em        timestamptz default now(),
  atualizado_em    timestamptz default now()
);

create index if not exists idx_conteudos_status_ordem on public.conteudos(status, ordem);
create index if not exists idx_conteudos_data on public.conteudos(data_publicacao);

alter table public.conteudos disable row level security;
