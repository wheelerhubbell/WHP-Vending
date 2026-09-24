import { getConnectionString } from "@netlify/database";
import { createVendingService } from "../../runtime/src/app.mjs";
import { createArtifactVault } from "../../runtime/src/artifacts.mjs";
import { runtimeConfiguration } from "../../runtime/src/config.mjs";
import { PaymentRail } from "../../runtime/src/payment.mjs";
import { createPostgresStore } from "../../runtime/src/store.mjs";

declare const Netlify: { env: { get(name: string): string | undefined } };

const ARTIFACT_KEYS = [
  "WHP_ARTIFACT_CLAIM_CLASSIFIER_B64",
  "WHP_ARTIFACT_RETURN_THE_BURDEN_B64",
  "WHP_ARTIFACT_AUDIT_THE_MOVE_B64",
  "WHP_ARTIFACT_LIMITED_VERDICT_B64",
  "WHP_ARTIFACT_RESPONSE_AUDITOR_B64",
];

let initialized: Promise<ReturnType<typeof createVendingService>> | undefined;

async function initialize() {
  const names = ["WHP_VENDING_ORIGIN", "WHP_FACILITATOR_URL", "WHP_RPC_URL", "WHP_VENDING_PAY_TO", ...ARTIFACT_KEYS];
  const env = Object.fromEntries(names.map((name) => [name, Netlify.env.get(name)]));
  const config = runtimeConfiguration({ ...env, DATABASE_URL: getConnectionString() });
  const vault = createArtifactVault(config.products, config.artifacts);
  vault.verifyAll();
  const store = await createPostgresStore(config.databaseUrl);
  try {
    const current = Object.values(config.products).map((product) => ({
      sha256: product.artifact_sha256,
      size: product.size,
      filename: product.filename,
      bytes_base64: vault.getByHash(product.artifact_sha256).toString("base64"),
    }));
    await store.retainArtifacts(current);
    for (const artifact of await store.listArtifacts()) vault.retain(artifact);
    const rail = new PaymentRail({ facilitatorUrl: config.facilitatorUrl, rpcUrl: config.rpcUrl });
    return createVendingService({ origin: config.origin, products: config.products, store, rail, vault });
  } catch (error) {
    await store.close();
    throw error;
  }
}

export default async function vending(request: Request): Promise<Response> {
  try {
    initialized ??= initialize().catch((error) => { initialized = undefined; throw error; });
    return await (await initialized).handle(request);
  } catch {
    return new Response('{"error":{"code":"SERVICE_UNAVAILABLE","retryable":true}}\n', {
      status: 503,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  }
}

export const config = {
  path: [
    "/", "/catalog.json", "/catalog/v1/index.json", "/openapi.json", "/v1/openapi.json",
    "/v1/*", "/.well-known/*", "/server.json", "/llms.txt", "/mcp", "/a2a",
    "/healthz", "/readyz", "/robots.txt", "/sitemap.xml",
  ],
  preferStatic: false,
};
