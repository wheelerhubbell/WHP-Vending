import {demand,hashBytes} from './canonical.mjs';
import {decodeB64,parseUsd,validatePrivateCaseSet} from './product.mjs';

const required=(env,name)=>{
  const v=env[name];
  demand(typeof v==='string'&&v.length>0,name+'_REQUIRED',503);
  return v;
};

export function loadConfig(env=process.env){
  const mode=env.WHP_VENDING_MODE??'FREE';
  demand(['FREE','TEST','LIVE'].includes(mode),'MODE_INVALID',503);
  const base={mode,liveReady:false,missing:[]};
  if(mode!=='LIVE')return base;

  const names=['BASE_URL','DATABASE_URL','STRIPE_RESTRICTED_KEY','STRIPE_PROFILE_ID','MPP_SECRET_KEY','ENTITLEMENT_SECRET','CORRECTIONS_LIVE_PRICE_USD','CORRECTIONS_PRICE_AUTHORITY_ID','CORRECTIONS_RIGHTS_GRANT_ID','CORRECTIONS_RIGHTS_GRANT_B64','CORRECTIONS_PRIVATE_CASESET_B64'];
  const missing=names.filter(n=>!env[n]);
  if(missing.length)return {...base,missing};

  const baseUrl=required(env,'BASE_URL');
  demand(/^https:\/\//.test(baseUrl)&&!baseUrl.endsWith('/'),'BASE_URL_INVALID',503);
  const databaseUrl=required(env,'DATABASE_URL');
  demand(/^postgres(?:ql)?:\/\//.test(databaseUrl),'DATABASE_URL_INVALID',503);
  const stripeKey=required(env,'STRIPE_RESTRICTED_KEY');
  demand(/^rk_live_/.test(stripeKey),'STRIPE_LIVE_RESTRICTED_KEY_REQUIRED',503);
  const stripeProfileId=required(env,'STRIPE_PROFILE_ID');
  demand(/^profile_/.test(stripeProfileId),'STRIPE_PROFILE_ID_INVALID',503);
  const mppSecret=required(env,'MPP_SECRET_KEY');
  const entitlementSecret=required(env,'ENTITLEMENT_SECRET');
  demand(Buffer.byteLength(mppSecret)>=32,'MPP_SECRET_KEY_TOO_SHORT',503);
  demand(Buffer.byteLength(entitlementSecret)>=32,'ENTITLEMENT_SECRET_TOO_SHORT',503);
  const price=parseUsd(required(env,'CORRECTIONS_LIVE_PRICE_USD'));
  const priceAuthorityId=required(env,'CORRECTIONS_PRICE_AUTHORITY_ID');
  const rightsGrantId=required(env,'CORRECTIONS_RIGHTS_GRANT_ID');
  const rightsText=decodeB64('CORRECTIONS_RIGHTS_GRANT_B64',env.CORRECTIONS_RIGHTS_GRANT_B64);
  let caseSet;
  try{caseSet=JSON.parse(decodeB64('CORRECTIONS_PRIVATE_CASESET_B64',env.CORRECTIONS_PRIVATE_CASESET_B64));}
  catch{demand(false,'CASESET_JSON_INVALID',503);}
  validatePrivateCaseSet(caseSet);
  return {
    mode,liveReady:true,missing:[],baseUrl,databaseUrl,stripeKey,stripeProfileId,mppSecret,entitlementSecret,
    price,priceAuthorityId,rightsGrantId,rightsText,rightsHash:hashBytes(Buffer.from(rightsText)),
    caseSet,caseSetHash:hashBytes(Buffer.from(JSON.stringify(caseSet)))
  };
}
