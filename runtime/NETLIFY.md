# Netlify deployment of the autonomous runtime

The repository's Netlify function is an adapter around the existing `runtime/src` service. It uses Netlify Database for the same Postgres purchase and immutable artifact tables. Netlify provisions the database connection on deployment; the adapter does not use the historical Stripe storefront or its payment links.

Configure these **Functions** environment variables on the existing `whp-vending` project:

- `WHP_VENDING_ORIGIN` — exact HTTPS origin of the deployment, with no path or trailing slash.
- `WHP_FACILITATOR_URL` — HTTPS x402 v2 facilitator base URL.
- `WHP_RPC_URL` — HTTPS Base mainnet RPC URL supporting finalized block queries and receipts.
- `WHP_ARTIFACT_CLAIM_CLASSIFIER_B64`
- `WHP_ARTIFACT_RETURN_THE_BURDEN_B64`
- `WHP_ARTIFACT_AUDIT_THE_MOVE_B64`
- `WHP_ARTIFACT_LIMITED_VERDICT_B64`
- `WHP_ARTIFACT_RESPONSE_AUDITOR_B64`

The last five values contain private complete ZIP bytes in canonical base64. Startup verifies their exact pinned lengths and SHA-256 digests; do not put them in Git or replace them with substitute files. `DATABASE_URL` comes from Netlify Database and is not configured by hand. The recipient remains pinned in source to `0x1050eddd8282623b0c263ed6bdbd42370bbc28d3`.

Deploy a preview with its own origin and variables to check `GET /readyz`, free discovery, and an unpaid `POST /v1/products/claim-classifier/artifact` returning a standard 402. Netlify Database preview branches are isolated from production. A production deployment must set `WHP_VENDING_ORIGIN=https://whp-vending.netlify.app` and verify the exact public discovery, quote, finalized settlement, artifact digest, and recovery behavior before describing the service as live for autonomous purchases. No test may sign or settle a payment without the owner's bounded approval.
