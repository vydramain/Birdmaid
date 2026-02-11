-- Data model skeleton (DDL)
-- Purpose: Canonical schema for the project. Referenced by agents (design, build)
-- and ux-map-sync. Add your tables and migrations here.

-- Example placeholder table (replace or remove)
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Example placeholder table
CREATE TABLE IF NOT EXISTS items (
  id         TEXT PRIMARY KEY,
  user_id    TEXT REFERENCES users(id),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes, constraints, and further tables as needed.
