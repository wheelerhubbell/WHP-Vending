import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';

export class Fault extends Error {
  constructor(code,status=400,path='$'){super(code);this.code=code;this.status=status;this.path=path;}
}
export const demand=(ok,code,status=400,path='$')=>{if(!ok)throw new Fault(code,status,path);};
export const clone=x=>JSON.parse(JSON.stringify(x));

export function canonical(x,depth=0){
  demand(depth<=64,'JSON_DEPTH');
  if(x===null)return 'null';
  if(typeof x==='boolean')return x?'true':'false';
  if(typeof x==='number'){demand(Number.isSafeInteger(x)&&!Object.is(x,-0),'INTEGER_REQUIRED');return String(x);}
  if(typeof x==='string'){demand(x.isWellFormed(),'INVALID_UNICODE');return JSON.stringify(x);}
  if(Array.isArray(x))return '['+x.map(v=>canonical(v,depth+1)).join(',')+']';
  demand(x&&typeof x==='object'&&!Array.isArray(x),'JSON_OBJECT_REQUIRED');
  return '{'+Object.keys(x).sort().map(k=>canonical(k,depth+1)+':'+canonical(x[k],depth+1)).join(',')+'}';
}

export const hashBytes=x=>createHash('sha256').update(x).digest('hex');
export const hash=x=>hashBytes(Buffer.from(canonical(x)));
export const randomHex=(bytes=32)=>randomBytes(bytes).toString('hex');
export const hmac=(secret,value)=>createHmac('sha256',secret).update(value).digest('hex');

export function safeEqualHex(a,b){
  if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length||!/^[0-9a-f]+$/i.test(a)||!/^[0-9a-f]+$/i.test(b))return false;
  return timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'));
}
export function exact(o,fields,path='$'){
  demand(o&&typeof o==='object'&&!Array.isArray(o),'OBJECT_REQUIRED',400,path);
  demand(Object.keys(o).length===fields.length&&fields.every(k=>Object.hasOwn(o,k)),'FIELDS_INVALID',400,path);
}
export function text(v,path='$',max=8192){
  demand(typeof v==='string'&&v.length>0&&v.length<=max&&v.isWellFormed(),'TEXT_REQUIRED',400,path);
}
export function json(status,obj,headers={}){
  return new Response(canonical(obj),{status,headers:{'content-type':'application/json','cache-control':'no-store',...headers}});
}
export async function strictJson(request,max=262144){
  const raw=await request.text();
  demand(Buffer.byteLength(raw)<=max,'BODY_TOO_LARGE',413);
  let value;try{value=JSON.parse(raw);}catch{throw new Fault('INVALID_JSON',400);}
  canonical(value);
  return {raw,value};
}
