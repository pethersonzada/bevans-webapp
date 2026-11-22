import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
 firebaseRefresh,criarCoordenadorSessao,FirebaseSessionExpiredError,FirebaseUnavailableError,
} from '../app/lib/bevans-auth.mjs';

const valid={uid:'uid-ficticio',idToken:'token-antigo',refreshToken:'refresh-ficticio',expiresAt:0};
const rotated={...valid,idToken:'token-novo',refreshToken:'refresh-novo',expiresAt:Date.now()+3_600_000};
function deferred(){
 let resolve,reject;
 const promise=new Promise((a,b)=>{resolve=a;reject=b;});
 return {promise,resolve,reject};
}

test('20 chamadas simultâneas usam exatamente uma renovação e recebem o token novo',async()=>{
 const gate=deferred();let count=0;
 const coordinator=criarCoordenadorSessao(async()=>{count++;return gate.promise;});
 coordinator.set({...valid});
 const waiting=Array.from({length:20},()=>coordinator.token());
 await Promise.resolve();
 assert.equal(count,1);
 gate.resolve({...rotated});
 const result=await Promise.all(waiting);
 assert.deepEqual([...new Set(result)],['token-novo']);
 assert.equal(coordinator.current().refreshToken,'refresh-novo');
 assert.equal(await coordinator.token(),'token-novo');
 assert.equal(count,2); // chamada ao coordinator, sem rede quando firebaseRefresh detecta validade
});

test('logout invalida renovação pendente e nunca publica o token antigo',async()=>{
 const gate=deferred(),coordinator=criarCoordenadorSessao(()=>gate.promise);
 coordinator.set({...valid});
 const pending=coordinator.token();
 await Promise.resolve();
 coordinator.clear();
 gate.resolve({...rotated});
 await assert.rejects(pending,/sessão mudou/);
 assert.equal(coordinator.current(),null);
 await assert.rejects(()=>coordinator.token(),FirebaseSessionExpiredError);
});

test('nova autenticação do mesmo UID invalida respostas da sessão anterior',async()=>{
 const gate=deferred(),coordinator=criarCoordenadorSessao(()=>gate.promise);
 coordinator.set({...valid});
 const pending=coordinator.token();
 await Promise.resolve();
 coordinator.set({...rotated,idToken:'outro-login'});
 gate.resolve({...rotated});
 await assert.rejects(pending,/sessão mudou/);
 assert.equal(coordinator.current().idToken,'outro-login');
});

test('Firebase 503 e falhas de rede não significam revogação, e não retornam token vencido',async()=>{
 const oldFetch=globalThis.fetch,oldKey=process.env.NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY;
 process.env.NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY='key-sintetica';
 let count=0;
 try{
  globalThis.fetch=async()=>{count++;if(count===1)throw new TypeError('sem rede');
   if(count===2)return Response.json({error:{message:'SERVICE_UNAVAILABLE'}},{status:503});
   return Response.json({id_token:'id-token-renovado',refresh_token:'refresh-rotacionado',expires_in:'3600',user_id:valid.uid});
  };
  const coordinator=criarCoordenadorSessao(firebaseRefresh);
  coordinator.set({...valid});
  await assert.rejects(()=>coordinator.token(),FirebaseUnavailableError);
  assert.equal(coordinator.current().idToken,'token-antigo');
  await assert.rejects(()=>coordinator.token(),FirebaseUnavailableError);
  assert.equal(coordinator.current().uid,valid.uid);
  const newToken=await coordinator.token();
  assert.equal(newToken,'id-token-renovado');
  assert.equal(coordinator.current().refreshToken,'refresh-rotacionado');
  assert.equal(count,3);
 }finally{
  globalThis.fetch=oldFetch;
  if(oldKey===undefined)delete process.env.NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY;
  else process.env.NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY=oldKey;
 }
});

test('Firebase 400 com INVALID_REFRESH_TOKEN é expiração real; 429 é temporário',async()=>{
 const oldFetch=globalThis.fetch,oldKey=process.env.NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY;
 process.env.NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY='key-sintetica';
 try{
  globalThis.fetch=async()=>Response.json({error:{message:'INVALID_REFRESH_TOKEN'}},{status:400});
  await assert.rejects(()=>firebaseRefresh({...valid}),FirebaseSessionExpiredError);
  globalThis.fetch=async()=>Response.json({error:{message:'TOO_MANY_ATTEMPTS_TRY_LATER'}},{status:429});
  await assert.rejects(()=>firebaseRefresh({...valid}),FirebaseUnavailableError);
  globalThis.fetch=async()=>Response.json({id_token:'token-outro',expires_in:'3600',user_id:'uid-intruso'});
  await assert.rejects(()=>firebaseRefresh({...valid}),FirebaseSessionExpiredError);
 }finally{
  globalThis.fetch=oldFetch;
  if(oldKey===undefined)delete process.env.NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY;
  else process.env.NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY=oldKey;
 }
});

test('token ainda válido não chama Firebase; token de identidade vazia não é aceito',async()=>{
 const current={...valid,expiresAt:Date.now()+120_000};
 const resolved=await firebaseRefresh(current);
 assert.equal(resolved,current);
 await assert.rejects(()=>firebaseRefresh({...valid,uid:''}),FirebaseSessionExpiredError);
 await assert.rejects(()=>firebaseRefresh({...valid,refreshToken:''}),FirebaseSessionExpiredError);
});
