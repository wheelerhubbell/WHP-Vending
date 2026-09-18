import fs from "node:fs";
import {PRODUCTS} from "../src/catalog.mjs";

const staticCatalog=JSON.parse(fs.readFileSync(new URL("../public/catalog/v1/static-index.json",import.meta.url),"utf8"));
if(!Array.isArray(staticCatalog.products))throw new Error("PUBLIC_CATALOG_PRODUCTS_REQUIRED");
const byId=new Map(staticCatalog.products.map(p=>[p.product_id,p]));
for(const product of PRODUCTS){
  const pub=byId.get(product.product_id);
  if(!pub)throw new Error("PUBLIC_PRODUCT_MISSING:"+product.product_id);
  if(pub.price_usd!==product.price_usd)throw new Error("PUBLIC_PRICE_MISMATCH:"+product.product_id);
  if(pub.sku!==product.sku)throw new Error("PUBLIC_SKU_MISMATCH:"+product.product_id);
}
console.log("public catalog consistent:",PRODUCTS.length,"products");
