export const PRODUCTS = [
  {
    product_id: "claim-classifier",
    sku: "WHP-DI-CC-001",
    version: "1.0.0",
    title: "Decision Integrity Claim Classifier",
    price_usd: "2.99",
    package_env: "PKG_WHP_DI_CC_001_B64",
    sha256: "e451f4c046e0d593504af4a4ec2140006dc01067ccdace1195c3e404dbbc756f",
    description: "Classifies merged statements into distinct claim types and states what each claim can and cannot establish on arrival."
  },
  {
    product_id: "return-the-burden",
    sku: "WHP-DI-RB-001",
    version: "1.0.0",
    title: "Decision Integrity Return the Burden",
    price_usd: "4.99",
    package_env: "PKG_WHP_DI_RB_001_B64",
    sha256: "7a607b3eb2594e3a24349c13342d42cd964d86fedc42204abbf5738188907ee2",
    description: "Identifies who made each claim, what it must show to stand, what has actually been produced, and whether the burden has shifted."
  },
  {
    product_id: "audit-the-move",
    sku: "WHP-DI-ATM-001",
    version: "1.0.0",
    title: "Decision Integrity — Audit the Move",
    price_usd: "7.99",
    package_env: "PKG_WHP_DI_ATM_001_B64",
    sha256: "153ab4b70a94d180b9cabece92eba67f184db86af08ae8c9b3d8942190e6c4d9",
    description: "Runs the eleven-question inspection panel to identify the structural move that changed a record."
  },
  {
    product_id: "limited-verdict",
    sku: "WHP-DI-LV-001",
    version: "1.0.0",
    title: "Decision Integrity Limited Verdict",
    price_usd: "9.99",
    package_env: "PKG_WHP_DI_LV_001_B64",
    sha256: "4d118b9b298cd213a75f6797c4f4d62992b6ddd425ebdf7e1d0bc1c6ed489ed8",
    description: "Produces the smallest bounded finding the current record can support while preserving unresolved material."
  },
  {
    product_id: "response-auditor",
    sku: "WHP-DI-RA-001",
    version: "1.0.0",
    title: "Decision Integrity Response Auditor",
    price_usd: "19.99",
    package_env: "PKG_WHP_DI_RA_001_B64",
    sha256: "941e7cc754544cc6cb1886b981047e21dc0b00fec5267f0b3f0ee91c2003fbdf",
    description: "A whole-response audit contract for task fidelity, source and qualifier preservation, authority, burden, downstream dependency effects, and bounded repair."
  }
];

export const getProduct=(id)=>PRODUCTS.find(p=>p.product_id===id) ?? null;

export const PUBLIC_RIGHTS={
  grant:"Single purchaser, nonexclusive, nontransferable internal/reference use of the delivered copy.",
  excluded:["resale","sublicensing","public redistribution","institutional endorsement","source-authority expansion"],
  retained:"Ownership, copyright, derivatives not expressly granted, future work, canon/amendment authority, trademarks and all unscheduled rights."
};
