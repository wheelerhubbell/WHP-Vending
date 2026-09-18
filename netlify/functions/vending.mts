import crypto from "node:crypto";
import Stripe from "stripe";
import { getDatabase } from "@netlify/database";
import { Mppx, stripe as mppStripe } from "mppx/server";
import { getProduct, PRODUCTS, PUBLIC_RIGHTS } from "../../src/catalog.mjs";
import { Fault, hashBytes } from "../../src/canonical.mjs";
import { purchaseId, entitlementToken, verifyEntitlement, packageBytes } from "../../src/purchase.mjs";
import type { Config, Context } from "@netlify/functions";

const env=(name:string)=>{
  const netlify=(globalThis as any).Netlify;
  const value=netlify?.env?.get?.(name);
  return typeof value==="string"?value:"";
};

const json=(status:number,body:unknown,headers:Record<string,string>={})=>
  new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store",...headers}});

const exactBody=(body:any)=>{
  if(!body||typeof body!=="object"||Array.isArray(body))throw new Fault("OBJECT_REQUIRED",400);
  const keys=Object.keys(body).sort();
  if(keys.join(",")!=="client_reference,product_id")throw new Fault("FIELDS_INVALID",400);
  if(typeof body.product_id!=="string")throw new Fault("PRODUCT_ID_REQUIRED",400);
  if(typeof body.client_reference!=="string"||!/^[0-9a-f]{64}$/.test(body.client_reference))throw new Fault("CLIENT_REFERENCE_INVALID",400);
  return body as {product_id:string;client_reference:string};
};

const decodeReceipt=(header:string)=>{
  const value=JSON.parse(Buffer.from(header,"base64url").toString("utf8"));
  if(!value||value.method!=="stripe"||value.status!=="success"||typeof value.reference!=="string"||!value.reference.startsWith("pi_"))throw new Fault("PAYMENT_RECEIPT_INVALID",502);
  return value;
};

async function upsertPending(db:any,p:any,pid:string,clientReference:string,challenge:Response){
  const headers=Object.fromEntries(challenge.headers.entries());
  const body=await challenge.clone().text();
  await db.sql`
    INSERT INTO vending_purchases
      (purchase_id,product_id,product_version,client_reference,amount_usd,state,challenge_status,challenge_headers,challenge_body)
    VALUES
      (${pid},${p.product_id},${p.version},${clientReference},${p.price_usd},'PENDING',${challenge.status},${JSON.stringify(headers)}::jsonb,${body})
    ON CONFLICT (purchase_id) DO UPDATE SET
      challenge_status=EXCLUDED.challenge_status,
      challenge_headers=EXCLUDED.challenge_headers,
      challenge_body=EXCLUDED.challenge_body
    WHERE vending_purchases.state='PENDING'
  `;
}

async function markPaid(db:any,p:any,pid:string,clientReference:string,receipt:any,deliverySha:string){
  await db.sql`
    INSERT INTO vending_purchases
      (purchase_id,product_id,product_version,client_reference,amount_usd,state,stripe_payment_intent,payment_receipt,delivery_sha256,paid_at)
    VALUES
      (${pid},${p.product_id},${p.version},${clientReference},${p.price_usd},'PAID',${receipt.reference},${JSON.stringify(receipt)}::jsonb,${deliverySha},NOW())
    ON CONFLICT (purchase_id) DO UPDATE SET
      state='PAID',
      stripe_payment_intent=EXCLUDED.stripe_payment_intent,
      payment_receipt=EXCLUDED.payment_receipt,
      delivery_sha256=EXCLUDED.delivery_sha256,
      paid_at=COALESCE(vending_purchases.paid_at,NOW())
    WHERE vending_purchases.state IN ('PENDING','PAID')
  `;
}

function paidPackageResponse(p:any,pid:string,clientReference:string,receiptHeader?:string){
  const secret=env("ENTITLEMENT_SECRET");
  if(Buffer.byteLength(secret)<32)throw new Fault("ENTITLEMENT_SECRET_REQUIRED",503);
  const bytes=packageBytes(p,env(p.package_env));
  const token=entitlementToken(secret,pid,clientReference);
  const headers:Record<string,string>={
    "content-type":"application/zip",
    "content-disposition":`attachment; filename="${p.sku}.zip"`,
    "cache-control":"private, no-store",
    "x-whp-purchase-id":pid,
    "x-whp-entitlement":token,
    "x-whp-delivery-sha256":hashBytes(bytes),
    "x-whp-product-id":p.product_id,
    "x-whp-product-version":p.version
  };
  if(receiptHeader)headers["Payment-Receipt"]=receiptHeader;
  return new Response(bytes,{status:200,headers});
}

async function purchase(request:Request){
  if(request.method!=="POST")return json(405,{error:"METHOD_NOT_ALLOWED"},{allow:"POST"});
  const mode=env("WHP_VENDING_MODE");
  if(mode!=="LIVE")return json(503,{error:"LIVE_COMMERCE_NOT_ENABLED",mode:mode||"UNSET"});
  const stripeKey=env("STRIPE_RESTRICTED_KEY")||env("STRIPE_SECRET_KEY");
  const profileId=env("STRIPE_PROFILE_ID");
  const entitlementSecret=env("ENTITLEMENT_SECRET");
  if(!stripeKey||!profileId||Buffer.byteLength(entitlementSecret)<32)return json(503,{error:"LIVE_COMMERCE_CONFIGURATION_INCOMPLETE"});

  let input:any;
  try{input=exactBody(await request.json());}catch(error){if(error instanceof Fault)throw error;throw new Fault("INVALID_JSON",400);}
  const p=getProduct(input.product_id);
  if(!p)return json(404,{error:"PRODUCT_NOT_FOUND"});
  const pid=purchaseId(p,input.client_reference);

  const db=getDatabase();
  const existing=await db.sql`SELECT * FROM vending_purchases WHERE purchase_id=${pid} LIMIT 1`;
  if(existing[0]?.state==="PAID"){
    if(existing[0].client_reference!==input.client_reference)throw new Fault("PURCHASE_IDENTITY_MISMATCH",409);
    const stored=existing[0].payment_receipt;
    const header=Buffer.from(JSON.stringify(stored)).toString("base64url");
    return paidPackageResponse(p,pid,input.client_reference,header);
  }

  const client=new Stripe(stripeKey,{appInfo:{name:"WHP Vending",version:"1.0.0"}});
  const stripeMachinePayments=mppStripe.create({
    client,
    networkId:profileId,
    livemode:true
  });
  const secretKey=crypto.createHmac("sha256",stripeKey).update("mpp-challenge-signing").digest("base64");
  const mppx=Mppx.create({methods:[stripeMachinePayments.spt.charge()],secretKey});
  const gate=mppx.compose(["stripe/charge",{
    amount:p.price_usd,
    currency:"usd",
    decimals:2,
    description:p.title,
    externalId:pid,
    metadata:{product_id:p.product_id,product_version:p.version,sku:p.sku}
  }]);

  const result=await gate(request);
  if(result.status===402){
    await upsertPending(db,p,pid,input.client_reference,result.challenge);
    return result.challenge;
  }

  const response=paidPackageResponse(p,pid,input.client_reference);
  const wrapped=result.withReceipt(response);
  const receiptHeader=wrapped.headers.get("Payment-Receipt");
  if(!receiptHeader)throw new Fault("PAYMENT_RECEIPT_MISSING",502);
  const receipt=decodeReceipt(receiptHeader);
  if(receipt.externalId!==pid)throw new Fault("PAYMENT_BINDING_MISMATCH",502);
  await markPaid(db,p,pid,input.client_reference,receipt,p.sha256);
  return wrapped;
}

async function recover(request:Request,pid:string){
  if(!["GET","POST"].includes(request.method))return json(405,{error:"METHOD_NOT_ALLOWED"},{allow:"GET, POST"});
  const auth=request.headers.get("authorization")||"";
  const token=auth.startsWith("Bearer ")?auth.slice(7):"";
  const db=getDatabase();
  const rows=await db.sql`SELECT * FROM vending_purchases WHERE purchase_id=${pid} LIMIT 1`;
  const row=rows[0];
  if(!row)return json(404,{error:"PURCHASE_NOT_FOUND"});
  if(row.state!=="PAID")return json(409,{error:"PURCHASE_NOT_PAID"});
  const p=getProduct(row.product_id);
  if(!p)return json(503,{error:"PRODUCT_CONFIGURATION_MISSING"});
  if(!verifyEntitlement(env("ENTITLEMENT_SECRET"),pid,row.client_reference,token))return json(401,{error:"ENTITLEMENT_INVALID"});
  const header=Buffer.from(JSON.stringify(row.payment_receipt)).toString("base64url");
  return paidPackageResponse(p,pid,row.client_reference,header);
}

async function handler(request:Request,context:Context){
  const url=new URL(request.url);
  try{
    if(url.pathname==="/healthz")return json(200,{
      service:"WHP Vending",
      mode:env("WHP_VENDING_MODE")||"UNSET",
      live_payment_configured:Boolean((env("STRIPE_RESTRICTED_KEY")||env("STRIPE_SECRET_KEY"))&&env("STRIPE_PROFILE_ID")&&env("ENTITLEMENT_SECRET")),
      products:PRODUCTS.length
    });
    if(url.pathname==="/v1/purchases")return await purchase(request);
    const match=url.pathname.match(/^\/v1\/purchases\/(pur_[0-9a-f]{64})\/recover$/);
    if(match)return await recover(request,match[1]);
    if(url.pathname==="/v1/rights")return json(200,PUBLIC_RIGHTS);
    return json(404,{error:"NOT_FOUND"});
  }catch(error:any){
    if(error instanceof Fault)return json(error.status||400,{error:error.code,path:error.path});
    console.error("WHP_VENDING_FAILURE",error);
    return json(500,{error:"INTERNAL_ERROR"});
  }
}

export default handler;

export const config:Config={
  path:["/v1/purchases","/v1/purchases/*","/v1/rights","/healthz"]
};
