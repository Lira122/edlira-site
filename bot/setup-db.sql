-- Tabela de mensagens (histórico de conversas por lead)
create table if not exists mensagens (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references clientes(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  criado_em  timestamptz default now()
);

create index if not exists mensagens_lead_id_idx on mensagens(lead_id, criado_em);

-- Colunas adicionais na tabela clientes (caso não existam)
alter table clientes add column if not exists temperatura text check (temperatura in ('quente','morno','frio','gelado'));
alter table clientes add column if not exists pausado_ate timestamptz;
alter table clientes add column if not exists observacoes text;
alter table clientes add column if not exists atualizado_em timestamptz default now();
