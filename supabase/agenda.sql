-- ════════════════════════════════════════════════════════════════
--  Agenda pessoal do Lira (reuniões, conversas, tarefas).
--  Rode UMA vez no SQL Editor do Supabase.
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agenda (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        TEXT NOT NULL,
  descricao     TEXT,
  data          DATE NOT NULL,
  hora_inicio   TIME,
  hora_fim      TIME,
  cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome  TEXT,             -- snapshot do nome no momento do agendamento
  local         TEXT,             -- presencial, google_meet, whatsapp, telefone, outro
  status        TEXT DEFAULT 'agendado',  -- agendado, realizado, cancelado
  notas         TEXT,
  criado_em     TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agenda_data    ON agenda(data, hora_inicio);
CREATE INDEX IF NOT EXISTS idx_agenda_cliente ON agenda(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agenda_status  ON agenda(status);
