-- Backfill / migrate from legacy `users.name` to `users.first_name` + `users.last_name`.
-- This is safe to run multiple times.

ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'name'
  ) THEN
    UPDATE users
    SET first_name = COALESCE(first_name, name),
        last_name = COALESCE(last_name, '')
    WHERE first_name IS NULL OR last_name IS NULL;

    ALTER TABLE users DROP COLUMN IF EXISTS name;
  END IF;

  IF EXISTS (SELECT 1 FROM users WHERE first_name IS NULL OR last_name IS NULL) THEN
    RAISE EXCEPTION 'cannot enforce NOT NULL: users has NULL first_name/last_name';
  END IF;
END $$;

ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;
