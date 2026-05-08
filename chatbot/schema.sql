-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/flzpblpegoqjxaacjvhf/sql/new

CREATE TABLE IF NOT EXISTS chatbot_conversations (
  phone       TEXT PRIMARY KEY,
  stage       TEXT NOT NULL DEFAULT 'inicio',
  messages    JSONB NOT NULL DEFAULT '[]',
  lead_data   JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chatbot_stage ON chatbot_conversations(stage);
CREATE INDEX IF NOT EXISTS idx_chatbot_updated ON chatbot_conversations(updated_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chatbot_conversations_updated_at ON chatbot_conversations;
CREATE TRIGGER chatbot_conversations_updated_at
  BEFORE UPDATE ON chatbot_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Adiciona campo 'whatsapp' na tabela clientes se ainda não existir
-- (caso a constraint onConflict precise do campo único)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clientes_whatsapp_key'
  ) THEN
    ALTER TABLE clientes ADD CONSTRAINT clientes_whatsapp_key UNIQUE (whatsapp);
  END IF;
END $$;

-- View para ver leads qualificados no painel
CREATE OR REPLACE VIEW chatbot_leads AS
SELECT
  phone,
  stage,
  lead_data->>'nome'          AS nome,
  lead_data->>'empresa'       AS empresa,
  lead_data->>'segmento'      AS segmento,
  lead_data->>'interesse'     AS interesse,
  lead_data->>'investe_ads'   AS investe_ads,
  lead_data->'dores'          AS dores,
  updated_at
FROM chatbot_conversations
ORDER BY updated_at DESC;
