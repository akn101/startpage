CREATE TABLE IF NOT EXISTS photos (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url        TEXT NOT NULL,
  caption    TEXT,
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON photos;
CREATE POLICY "allow_all" ON photos FOR ALL USING (true) WITH CHECK (true);
