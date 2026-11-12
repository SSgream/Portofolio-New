-- Jalankan sekali di Neon SQL Editor
CREATE TABLE IF NOT EXISTS profile (
  id int PRIMARY KEY DEFAULT 1,
  name text NOT NULL DEFAULT 'Nama Kamu',
  headline text NOT NULL DEFAULT 'Web Developer',
  bio text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  github text NOT NULL DEFAULT '',
  linkedin text NOT NULL DEFAULT ''
);
INSERT INTO profile (id) VALUES (1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS skills (
  id serial PRIMARY KEY, name text NOT NULL, category text NOT NULL DEFAULT 'Umum', created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS projects (
  id serial PRIMARY KEY, title text NOT NULL, description text NOT NULL DEFAULT '', tech text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '', repo text NOT NULL DEFAULT '', created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS experiences (
  id serial PRIMARY KEY, role text NOT NULL, company text NOT NULL, start_date text NOT NULL DEFAULT '',
  end_date text NOT NULL DEFAULT 'Sekarang', description text NOT NULL DEFAULT '', created_at timestamptz DEFAULT now()
);
