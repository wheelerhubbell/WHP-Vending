import test from "node:test";
import assert from "node:assert/strict";
import {purchaseId,entitlementToken,verifyEntitlement,packageBytes} from "../src/purchase.mjs";
import {hashBytes} from "../src/canonical.mjs";

const p={product_id:"x",version:"1.0.0",sha256:hashBytes(Buffer.from("hello"))};

test("purchase identity is deterministic and scoped",()=>{
  const ref="a".repeat(64);
  assert.equal(purchaseId(p,ref),purchaseId(p,ref));
  assert.notEqual(purchaseId(p,ref),purchaseId({...p,product_id:"y"},ref));
});

test("entitlement is purchase-bound",()=>{
  const secret="s".repeat(32);
  const ref="b".repeat(64);
  const pid=purchaseId(p,ref);
  const token=entitlementToken(secret,pid,ref);
  assert.equal(verifyEntitlement(secret,pid,ref,token),true);
  assert.equal(verifyEntitlement(secret,pid,"c".repeat(64),token),false);
});

test("package hash mismatch fails closed",()=>{
  assert.throws(()=>packageBytes(p,Buffer.from("wrong").toString("base64")),/PACKAGE_HASH_MISMATCH/);
  assert.equal(packageBytes(p,Buffer.from("hello").toString("base64")).toString(),"hello");
});
