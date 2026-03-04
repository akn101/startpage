-- Startpage todos table
CREATE TABLE IF NOT EXISTS todos (
  id          UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  text        TEXT                     NOT NULL,
  done        BOOLEAN                  DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Keep updated_at current on every update
CREATE OR REPLACE FUNCTION set_todos_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS todos_updated_at ON todos;
CREATE TRIGGER todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION set_todos_updated_at();

-- RLS: personal tool, Cloudflare Access protects the app at the edge
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON todos;
CREATE POLICY "allow_all" ON todos FOR ALL USING (true) WITH CHECK (true);
