-- ════════════════════════════════════════════════════════════════
--  Documentos — biblioteca de arquivos (identidade visual,
--  roteiros, briefings, contratos, propostas, criativos, etc).
--
--  Como aplicar:
--   1. Supabase Dashboard → SQL Editor → cole isto → Run
--   2. Supabase Dashboard → Storage → New Bucket → nome: "documentos"
--      → Public bucket: OFF → Create
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS documentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN (
                  'identidade','roteiro','briefing','contrato',
                  'proposta','criativo','outro'
                )),
  cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
  descricao     TEXT,
  storage_path  TEXT NOT NULL UNIQUE,
  mime_type     TEXT,
  tamanho       BIGINT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documentos_cliente_idx ON documentos (cliente_id);
CREATE INDEX IF NOT EXISTS documentos_tipo_idx    ON documentos (tipo);
CREATE INDEX IF NOT EXISTS documentos_criado_idx  ON documentos (criado_em DESC);
