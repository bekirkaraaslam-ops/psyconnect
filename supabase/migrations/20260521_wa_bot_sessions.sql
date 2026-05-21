CREATE TABLE IF NOT EXISTS wa_bot_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  psychologist_id uuid NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  step text NOT NULL DEFAULT 'idle',
  context jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS wa_bot_sessions_phone_psych
  ON wa_bot_sessions(phone_number, psychologist_id);
