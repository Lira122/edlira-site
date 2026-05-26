-- ════════════════════════════════════════════════════════════════
--  Identidade da empresa (perfil singleton + documentos)
--  Rode no SQL Editor do Supabase uma vez.
-- ════════════════════════════════════════════════════════════════

-- ── Perfil (uma linha só, com id fixo 'main') ───────────────────
CREATE TABLE IF NOT EXISTS empresa_perfil (
  id              TEXT PRIMARY KEY DEFAULT 'main',
  nome_fantasia   TEXT,
  razao_social    TEXT,
  cnpj            TEXT,
  slogan          TEXT,
  descricao       TEXT,
  missao          TEXT,
  valores         TEXT,
  tipografia      TEXT,
  cor_primaria    TEXT,
  cor_secundaria  TEXT,
  cor_terciaria   TEXT,
  logo_url        TEXT,
  site_url        TEXT,
  email           TEXT,
  whatsapp        TEXT,
  endereco        TEXT,
  atualizado_em   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT empresa_perfil_singleton CHECK (id = 'main')
);

-- Garante a linha inicial
INSERT INTO empresa_perfil (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- ── Documentos (vários) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresa_documentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  descricao     TEXT,
  categoria     TEXT,
  arquivo_url   TEXT NOT NULL,
  arquivo_path  TEXT,
  tamanho_bytes BIGINT,
  mime_type     TEXT,
  criado_em     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empresa_docs_categoria ON empresa_documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_empresa_docs_criado   ON empresa_documentos(criado_em DESC);

-- ── Bucket de assets (logo, documentos) — público pra leitura ───
INSERT INTO storage.buckets (id, name, public)
VALUES ('empresa-assets', 'empresa-assets', true)
ON CONFLICT (id) DO NOTHING;
