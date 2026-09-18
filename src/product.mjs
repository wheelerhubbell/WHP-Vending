import {demand,hashBytes} from './canonical.mjs';

export const PRODUCT_ID='corrections-course-private-evaluation';
export const PRODUCT_VERSION='1.0.0';
export const PROPOSED_PRICE='1200.00';

export const proposedRights={
  status:'PROPOSED_NOT_LIVE_AUTHORIZED',
  text:'One bounded private machine evaluation. Purchaser may retain its own machine-readable result and payment receipt for internal assessment. No public redistribution right is granted for private case prompts, hidden answer keys, private corpus material, or WHP evaluation methods.'
};

export function parseUsd(value){
  demand(typeof value==='string'&&/^(?:0|[1-9][0-9]{0,8})\.[0-9]{2}$/.test(value),'PRICE_INVALID',503);
  const parts=value.split('.');
  return {major:value,minor:(BigInt(parts[0])*100n+BigInt(parts[1])).toString()};
}

export function decodeB64(name,value){
  demand(typeof value==='string'&&value.length>0,name+'_REQUIRED',503);
  let out;try{out=Buffer.from(value,'base64').toString('utf8');}catch{demand(false,name+'_INVALID',503);}
  demand(out.length>0,name+'_INVALID',503);
  return out;
}

export function validatePrivateCaseSet(set){
  demand(set&&typeof set==='object'&&!Array.isArray(set),'CASESET_INVALID',503);
  demand(typeof set.version==='string'&&Array.isArray(set.cases)&&set.cases.length>=1&&set.cases.length<=64,'CASESET_INVALID',503);
  demand(set.sanitized===true,'CASESET_NOT_SANITIZED',503);
  const badKey=/(raw_transcript|email|phone|account_number|payment_identifier|repository_url|deployment_id|private_key|secret)/i;
  const badString=/(https?:\/\/|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i;
  const walk=(v,key='')=>{
    demand(!badKey.test(key),'CASESET_PRIVATE_FIELD',503);
    if(typeof v==='string'){demand(!badString.test(v),'CASESET_PRIVATE_VALUE',503);return;}
    if(Array.isArray(v)){for(const x of v)walk(x,key);return;}
    if(v&&typeof v==='object')for(const pair of Object.entries(v))walk(pair[1],pair[0]);
  };
  walk(set);
  for(const c of set.cases){
    demand(typeof c.id==='string'&&c.id.length>0&&c.public&&c.answer_key,'CASE_INVALID',503);
    demand(Array.isArray(c.answer_key.required_preserved)&&Array.isArray(c.answer_key.forbidden_changed),'CASE_INVALID',503);
  }
  return set;
}

export function sourceProvenance(){
  return {
    course:{title:'The Corrections Course',edition:'anonymized instructional edition',source_date:'2026-09-17'},
    protocol:{title:'WHP Human–AI Integrity Audit & Benchmark Protocol v1.0',source_date:'2026-09-08'},
    evaluation_record:'O0 -> A1 -> C -> A2 -> Delta',
    boundaries:[
      'No raw private conversation corpus in public discovery.',
      'Naturalistic findings retain their source and coverage limits.',
      'Designed evaluation cases are not prevalence evidence.'
    ]
  };
}

export function publicProduct(config){
  const live=config.liveReady===true;
  const price=live
    ? {status:'LIVE_AUTHORIZED',amount:config.price.major,currency:'USD',authority_id:config.priceAuthorityId}
    : {status:'PROPOSED_NOT_LIVE_AUTHORIZED',amount:PROPOSED_PRICE,currency:'USD',authority_id:null};
  return {
    manifest_version:'WHP-VENDING-PRODUCT-v1',
    product_id:PRODUCT_ID,
    version:PRODUCT_VERSION,
    title:'The Corrections Course — Private Machine Evaluation',
    seller:'Wheeler Hubbell Publishing, Inc.',
    kind:'private_machine_evaluation',
    commercial_state:live?'LIVE':'CONFIGURATION_PENDING',
    description:'A bounded private evaluation of machine behavior after representational failure, including correction reception, correction legitimacy, restoration, bounded repair, dependency propagation, retention, transfer, false-correction resistance, and anticipatory preservation.',
    price,
    free_inspection:true,
    input_contract:{
      purchase:{product_id:PRODUCT_ID,product_version:PRODUCT_VERSION,client_reference:'64 lowercase hex characters',target:{system_label:'string',model_label:'string-or-UNKNOWN'}},
      evaluation_response:{
        case_id:'string',
        correction_class:['SOURCE_RESTORING','CLARIFYING','AMENDING','EVIDENCE_ADDING','PREFERENCE_CHANGING','INDETERMINATE'],
        restoration_verdict:['RESTORED','PARTIALLY_RESTORED','NOT_RESTORED','INDETERMINATE'],
        preserved_dimensions:'unique string array',
        changed_dimensions:'unique string array',
        rejected_dimensions:'unique string array',
        new_substitution:'boolean',
        acknowledgment_without_repair:'boolean',
        claim_ceiling:'string'
      }
    },
    output_contract:{
      entitlement:'purchase-bound private evaluation session',
      final_result:'machine-readable bounded score record',
      receipt:'product/version, Stripe/MPP transaction identity, entitlement, delivery hash, exact rights grant, timestamps'
    },
    acquisition_endpoint:'/v1/purchases',
    recovery_endpoint_template:'/v1/purchases/{purchase_id}/recover',
    limitations:[
      'The evaluation is bounded to the configured private case set and its stated dimensions.',
      'The result is not a universal model-quality score, diagnosis, intelligence ranking, or proof of population-level efficacy.',
      'Payment does not alter the evaluation standard or guarantee a favorable result.'
    ],
    provenance:sourceProvenance(),
    public_sample:'/samples/corrections-course-public-calibration.json',
    rights:live?{status:'LIVE_AUTHORIZED',sha256:hashBytes(Buffer.from(config.rightsText)),grant_id:config.rightsGrantId}:proposedRights
  };
}

export const benchmark002Slot={
  manifest_version:'WHP-VENDING-PRODUCT-SLOT-v1',
  product_id:'decision-integrity-benchmark-002',
  title:'Decision Integrity Benchmark 002',
  admission_state:'NOT_ADMITTED_FOR_SALE',
  recovered_source_status:'PRIVATE / SOURCE ONLY / NOT FOR COMMERCIAL DISTRIBUTION',
  commercial_endpoint:null,
  rule:'Preserve the slot without vending, copying, rewriting, or exposing the recovered private source package.'
};
