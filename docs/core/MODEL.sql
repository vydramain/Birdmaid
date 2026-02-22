-- Data model skeleton (DDL)
-- Purpose: Placeholder for future DB-backed features. NOT used by current Birdmaid:
--   - FP1–FP3 use S3/MinIO for storage (no SQL).
-- Referenced by: agents (plan, design), fp-bootstrap, ux-map-sync skills.

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
