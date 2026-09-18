export const PRODUCTS = [
  {
    product_id: "claim-classifier",
    sku: "WHP-DI-CC-001",
    version: "1.0.0",
    title: "Decision Integrity Claim Classifier",
    price_usd: "2.99",
    package_env: "PKG_WHP_DI_CC_001_B64",
    sha256: "8ee104d72534adb4e668a0f38da9d0715b05342746573a502abe6e9d934931d6",
    description: "Classifies merged statements into distinct claim types and states what each claim can and cannot establish on arrival."
  },
  {
    product_id: "return-the-burden",
    sku: "WHP-DI-RB-001",
    version: "1.0.0",
    title: "Decision Integrity Return the Burden",
    price_usd: "4.99",
    package_env: "PKG_WHP_DI_RB_001_B64",
    sha256: "e9f6ad6eb1db06cdc49da833a7f967b40b197dc579f1a4612339853afc7818de",
    description: "Identifies who made each claim, what it must show to stand, what has actually been produced, and whether the burden has shifted."
  },
  {
    product_id: "audit-the-move",
    sku: "WHP-DI-ATM-001",
    version: "1.0.0",
    title: "Decision Integrity — Audit the Move",
    price_usd: "7.99",
    package_env: "PKG_WHP_DI_ATM_001_B64",
    sha256: "2c22285ead2f0580955c89b5a583acd49956cde7b8f86561e00bb96026088c22",
    description: "Runs the eleven-question inspection panel to identify the structural move that changed a record."
  },
  {
    product_id: "limited-verdict",
    sku: "WHP-DI-LV-001",
    version: "1.0.0",
    title: "Decision Integrity Limited Verdict",
    price_usd: "9.99",
    package_env: "PKG_WHP_DI_LV_001_B64",
    sha256: "9fbbce08b121bc6c4a71d8e5520ee6474b490838edcf837679983dcc0496a3dd",
    description: "Produces the smallest bounded finding the current record can support while preserving unresolved material."
  },
  {
    product_id: "response-auditor",
    sku: "WHP-DI-RA-001",
    version: "1.0.0",
    title: "Decision Integrity Response Auditor",
    price_usd: "19.99",
    package_env: "PKG_WHP_DI_RA_001_B64",
    sha256: "0ecb6fa2afe3079712e21a13a953954384399d2a570f6153dda6ea0be51aa201",
    description: "A whole-response audit contract for task fidelity, source and qualifier preservation, authority, burden, downstream dependency effects, and bounded repair."
  }
];

export const getProduct=(id)=>PRODUCTS.find(p=>p.product_id===id) ?? null;

export const PUBLIC_RIGHTS={
  grant:"Single purchaser, nonexclusive, nontransferable internal/reference use of the delivered copy.",
  excluded:["resale","sublicensing","public redistribution","institutional endorsement","source-authority expansion"],
  retained:"Ownership, copyright, derivatives not expressly granted, future work, canon/amendment authority, trademarks and all unscheduled rights."
};
