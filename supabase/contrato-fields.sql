-- ════════════════════════════════════════════════════════════════
--  Campos do contrato no cadastro de clientes
--  Rode UMA vez no SQL Editor do Supabase.
-- ════════════════════════════════════════════════════════════════

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS razao_social    TEXT,
  ADD COLUMN IF NOT EXISTS cnpj            TEXT,
  ADD COLUMN IF NOT EXISTS endereco        TEXT,
  ADD COLUMN IF NOT EXISTS representante   TEXT,
  ADD COLUMN IF NOT EXISTS valor_midia     NUMERIC,
  ADD COLUMN IF NOT EXISTS dia_vencimento  INTEGER;
