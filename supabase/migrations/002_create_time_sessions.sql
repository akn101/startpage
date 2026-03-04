CREATE TABLE IF NOT EXISTS time_sessions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label      TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at   TIMESTAMPTZ,
  duration_s INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE time_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON time_sessions;
CREATE POLICY "allow_all" ON time_sessions FOR ALL USING (true) WITH CHECK (true);
