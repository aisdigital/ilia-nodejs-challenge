ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS transactions_user_id_idempotency_key_type_idx
  ON transactions (user_id, idempotency_key, type)
  WHERE idempotency_key IS NOT NULL;
