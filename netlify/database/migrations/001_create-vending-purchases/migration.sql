CREATE TABLE IF NOT EXISTS vending_purchases (
  purchase_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_version TEXT NOT NULL,
  client_reference TEXT NOT NULL,
  amount_usd TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('PENDING','PAID')),
  challenge_status INTEGER,
  challenge_headers JSONB,
  challenge_body TEXT,
  stripe_payment_intent TEXT,
  payment_receipt JSONB,
  delivery_sha256 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  UNIQUE(product_id, product_version, client_reference)
);

CREATE INDEX IF NOT EXISTS vending_purchases_product_idx
ON vending_purchases(product_id, product_version);
