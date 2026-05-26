-- ════════════════════════════════════════════════════════════════
--  Colunas de prospecção na tabela `clientes`
--  Rode UMA VEZ no Supabase: Dashboard > SQL Editor > cole e Run.
--  É seguro rodar de novo (tudo é "if not exists").
-- ════════════════════════════════════════════════════════════════

alter table clientes add column if not exists site          text;
alter table clientes add column if not exists cidade        text;
alter table clientes add column if not exists endereco      text;
alter table clientes add column if not exists score         int;
alter table clientes add column if not exists score_detalhe text;
alter table clientes add column if not exists origem        text;
alter table clientes add column if not exists cnpj          text;
alter table clientes add column if not exists instagram     text;

-- Opt-out: marca empresas que pediram para não receber contato.
-- O esquema de disparo (próxima etapa) NUNCA envia para opt_out = true.
alter table clientes add column if not exists opt_out       boolean default false;

-- Evita cadastrar a mesma empresa duas vezes pelo CNPJ.
create unique index if not exists clientes_cnpj_uidx
  on clientes (cnpj) where cnpj is not null;
