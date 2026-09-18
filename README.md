# WHP Vending

Machine-facing commercial interface for Wheeler Hubbell Publishing, Inc.

## Governing object

WHP Vending is independent of WHP Standing. It exists to let a cold machine discover bounded WHP products for free, inspect exact terms, cross a genuine HTTP 402 boundary only when acquiring a paid object, complete an owner-authorized machine payment, and receive the purchased entitlement with durable recovery.

A successful payment is not completion. Delivery is completion.

## Production payment rail

The intended LIVE rail is Stripe Machine Payments Protocol (MPP) using Shared Payment Tokens (SPTs).

- HTTP 402 payment challenge
- owner-authorized one-use SPT credential
- server-side Stripe PaymentIntent verification
- Stripe settlement to Wheeler Hubbell Publishing, Inc.
- durable entitlement and recovery without a second charge

Stripe x402 stablecoin settlement is not the production rail for this repository.

## Products

### The Corrections Course — Private Machine Evaluation

First premium candidate. Current price state is **PROPOSED / NOT LIVE AUTHORIZED** at USD 1,200.00 per bounded private evaluation. The service MUST NOT emit a LIVE payment challenge until exact commercial authority, Stripe production credentials/profile, private sanitized case estate, durable database, and rights grant are configured.

The evaluator implements the adopted O₀ → A₁ → C → A₂ → Δ correction record, correction-legitimacy classification, restoration verdicts, qualifier/source/terminal-condition preservation, false-correction resistance, retention, transfer, and bounded claim ceilings. Raw private conversation corpus and hidden answer keys are never public catalog material.

### Benchmark 002

Reserved manifest slot only. Current recovered source status is PRIVATE / SOURCE ONLY / NOT FOR COMMERCIAL DISTRIBUTION. WHP Vending does not vend the recovered source package.

## Fail-closed LIVE prerequisites

Production requires all of:

- `WHP_VENDING_MODE=LIVE`
- `BASE_URL`
- `DATABASE_URL` (durable PostgreSQL / Neon)
- `STRIPE_RESTRICTED_KEY`
- `STRIPE_PROFILE_ID`
- `MPP_SECRET_KEY` (32+ bytes)
- `ENTITLEMENT_SECRET` (32+ bytes)
- `CORRECTIONS_LIVE_PRICE_USD`
- `CORRECTIONS_PRICE_AUTHORITY_ID`
- `CORRECTIONS_RIGHTS_GRANT_B64`
- `CORRECTIONS_PRIVATE_CASESET_B64`

Missing production authority returns 503. TEST/FREE evidence never promotes itself to LIVE.

## Routes

- `GET /.well-known/whp-vending.json` — machine discovery
- `GET /.well-known/api-catalog` — API catalog linkset
- `GET /catalog/v1/index.json` — free product catalog
- `GET /products/corrections-course-private-evaluation.v1.json` — free product manifest
- `GET /samples/corrections-course-public-calibration.json` — free synthetic calibration sample
- `POST /v1/purchases` — paid acquisition boundary
- `POST /v1/purchases/{purchase_id}/recover` — idempotent recovery
- `GET /v1/sessions/{session_id}/next` — next private case under entitlement
- `POST /v1/sessions/{session_id}/responses` — submit candidate machine response
- `GET /v1/sessions/{session_id}/result` — durable final result
- `GET /healthz` — environment-aware service status

## Source discipline

Transaction durability and recovery patterns are adapted from the proven WHP Standing production machinery. Payment protocol behavior follows Stripe's current MPP guidance and the current mppx Stripe charge implementation. WHP Standing is not modified and is not a runtime dependency.
