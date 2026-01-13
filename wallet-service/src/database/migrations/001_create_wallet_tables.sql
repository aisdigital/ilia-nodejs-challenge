CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id),
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL
);
