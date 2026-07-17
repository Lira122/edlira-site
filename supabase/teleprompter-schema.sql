CREATE TABLE IF NOT EXISTS teleprompter_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  conteudo text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  velocidade_wpm integer NOT NULL DEFAULT 150,
  tamanho_fonte integer NOT NULL DEFAULT 48,
  tags text[] DEFAULT ARRAY[]::text[],
  vezes_usado integer NOT NULL DEFAULT 0,
  ultimo_uso timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS teleprompter_criado_idx
  ON teleprompter_scripts (criado_em DESC);
CREATE INDEX IF NOT EXISTS teleprompter_cliente_idx
  ON teleprompter_scripts (cliente_id)
  WHERE cliente_id IS NOT NULL;
