CREATE TABLE IF NOT EXISTS criativos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url          TEXT NOT NULL,
  tipo         TEXT,
  ratio        TEXT,
  headline     TEXT,
  prompt       TEXT,
  cliente_id   UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  criado_em    TIMESTAMPTZ DEFAULT NOW()
);
