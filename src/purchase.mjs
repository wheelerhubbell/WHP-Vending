import {hashBytes,hmac,safeEqualHex,demand} from "./canonical.mjs";

export function purchaseId(product,clientReference){
  demand(product&&typeof product.product_id==="string"&&typeof product.version==="string","PRODUCT_REQUIRED",500);
  demand(typeof clientReference==="string"&&/^[0-9a-f]{64}$/.test(clientReference),"CLIENT_REFERENCE_INVALID",400);
  return "pur_"+hashBytes(Buffer.from([product.product_id,product.version,clientReference].join("\n")));
}

export function entitlementToken(secret,purchaseIdValue,clientReference){
  demand(typeof secret==="string"&&Buffer.byteLength(secret)>=32,"ENTITLEMENT_SECRET_INVALID",503);
  return hmac(secret,[purchaseIdValue,clientReference].join("\n"));
}

export function verifyEntitlement(secret,purchaseIdValue,clientReference,token){
  if(typeof token!=="string"||!/^[0-9a-f]{64}$/i.test(token))return false;
  return safeEqualHex(entitlementToken(secret,purchaseIdValue,clientReference),token);
}

export function packageBytes(product,encoded){
  demand(typeof encoded==="string"&&encoded.length>0,"PACKAGE_UNAVAILABLE",503);
  let bytes;
  try{bytes=Buffer.from(encoded,"base64");}catch{demand(false,"PACKAGE_INVALID",503);}
  demand(bytes.length>0,"PACKAGE_INVALID",503);
  demand(hashBytes(bytes)===product.sha256,"PACKAGE_HASH_MISMATCH",503);
  return bytes;
}
