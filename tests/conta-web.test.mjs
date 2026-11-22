import test from 'node:test';
import assert from 'node:assert/strict';
import {ApiError,apiRequest} from '../app/lib/bevans-api.mjs';
import {
 conferirPerfilProprio,consultarMinhaConta,emailNormalizado,solicitarVerificacaoEmail,
 confirmarEmailVerificado,solicitarExclusaoConta,EmailSyncPendingError,
} from '../app/lib/conta-web.mjs';

const session={uid:'uid-pessoa-a',idToken:'token-session'};
const profile={id:8,nome:'Pessoa fictícia',tipo:'PASSAGEIRO',email:'antigo@example.test',firebaseUid:session.uid,telefone:'555'};
const signed={uid:session.uid,idToken:'token-reauth',refreshToken:'test-only',expiresAt:9999999999};
const signIn=async()=>signed;
const own=async(token,path)=>{
 assert.equal(token,signed.idToken);
 assert.equal(path,'/usuarios/por-uid/'+session.uid);
 return profile;
};

test('aceita somente perfil próprio com UID Firebase e ID íntegros',async()=>{
 assert.equal(conferirPerfilProprio(profile,session).id,8);
 for(const broken of [{...profile,id:0},{...profile,id:9,firebaseUid:'outro'},{...profile,firebaseUid:null},{...profile,email:''}])
  assert.throws(()=>conferirPerfilProprio(broken,session),/não corresponde/);
 assert.equal(emailNormalizado(' NOVO@Example.Test '),'novo@example.test');
 assert.throws(()=>emailNormalizado('invalido'),/válido/);
 await assert.rejects(()=>consultarMinhaConta(session,{request:async()=>({...profile,firebaseUid:'uid-outro'})}),/não corresponde/);
});

test('solicitação de e-mail exige reautenticação e espera confirmação do link sem tocar no backend',async()=>{
 const calls=[];
 const result=await solicitarVerificacaoEmail({
  session,profile,password:'senha de teste',newEmail:' NOVO@example.test ',
  signIn:async(email,password)=>{assert.equal(email,profile.email);assert.equal(password,'senha de teste');return signed;},
  request:async(token,path)=>{calls.push('read');return own(token,path);},
  requestChange:async(token,email)=>{assert.equal(token,signed.idToken);assert.equal(email,'novo@example.test');calls.push('verify');},
 });
 assert.deepEqual(result,{email:'novo@example.test',status:'verificacao-enviada'});
 assert.deepEqual(calls,['read','verify']);
});

test('reatenticado com outro UID nunca solicita verificação de e-mail',async()=>{
 let called=false;
 await assert.rejects(()=>solicitarVerificacaoEmail({session,profile,password:'senha',newEmail:'novo@example.test',
  signIn:async()=>({...signed,uid:'intruso'}),
  requestChange:async()=>{called=true;}
 }),/outra conta/);
 assert.equal(called,false);
});

test('conclui e-mail somente com novo endereço verificado e sincronizado no backend',async()=>{
 const calls=[];
 const fresh={...profile,email:'novo@example.test'};
 const result=await confirmarEmailVerificado({
  session,profile,password:'senha',newEmail:'novo@example.test',signIn,
  lookup:async()=>({uid:session.uid,email:'novo@example.test',emailVerified:true}),
  request:async(token,path,options)=>{
   calls.push({path,method:options?.method,body:options?.body});
   if(path.endsWith('/email'))return fresh;
   if(calls.filter(x=>x.method==='PUT').length>0)return fresh;
   return profile;
  },
 });
 assert.equal(result.session.idToken,signed.idToken);
 assert.equal(result.profile.email,'novo@example.test');
 const put=calls.filter(x=>x.method==='PUT');
 assert.equal(put.length,1);
 assert.equal(put[0].path,'/usuarios/8/email');
 assert.deepEqual(JSON.parse(put[0].body),{email:'novo@example.test'});
});

test('token Firebase não verificado ou de UID diferente nunca chama PUT',async()=>{
 for(const account of [
  {uid:session.uid,email:'novo@example.test',emailVerified:false},
  {uid:'intruso',email:'novo@example.test',emailVerified:true},
  {uid:session.uid,email:'antigo@example.test',emailVerified:true},
 ]){
  let calls=0;
  await assert.rejects(()=>confirmarEmailVerificado({session,profile,password:'senha',newEmail:'novo@example.test',
   signIn,lookup:async()=>account,request:async()=>{calls++;return profile;}
  }),/não está verificado/);
  assert.equal(calls,0);
 }
});

test('timeout após PUT de e-mail consulta estado oficial sem repetir alteração',async()=>{
 let writes=0;
 const fresh={...profile,email:'novo@example.test'};
 const result=await confirmarEmailVerificado({session,profile,password:'senha',newEmail:'novo@example.test',
  signIn,lookup:async()=>({uid:session.uid,email:'novo@example.test',emailVerified:true}),
  request:async(t,path,opts)=>{
   if(path.endsWith('/email')){writes++;throw new ApiError('tempo',0,'timeout');}
   return writes?fresh:profile;
  }
 });
 assert.equal(result.profile.email,'novo@example.test');
 assert.equal(writes,1);
});

test('falha de sincronização conserva novo e-mail no Firebase para recuperação manual',async()=>{
 const result=confirmarEmailVerificado({session,profile,password:'senha',newEmail:'novo@example.test',
  signIn,lookup:async()=>({uid:session.uid,email:'novo@example.test',emailVerified:true}),
  request:async(t,path,opts)=>{
   if(path.endsWith('/email'))throw new ApiError('tempo',0,'timeout');
   return profile;
  }
 });
 await assert.rejects(result,e=>e instanceof EmailSyncPendingError);
});

test('exclusão só chama a própria rota após reautenticação e exige HTTP 202',async()=>{
 const calls=[];
 const result=await solicitarExclusaoConta({session,profile,password:'senha',signIn,
  request:async(t,path,options)=>{
   calls.push({token:t,path,options});
   return path==='/usuarios/8'?{mensagem:'pendente'}:profile;
  },
 });
 assert.equal(result,'pendente');
 assert.equal(calls[1].path,'/usuarios/8');
 assert.equal(calls[1].options.method,'DELETE');
 assert.equal(calls[1].options.expectedStatus,202);
 assert.equal(calls[1].token,signed.idToken);
 assert.equal('body' in calls[1].options,false);
});

test('exclusão 409 preserva perfil e informa suporte',async()=>{
 await assert.rejects(()=>solicitarExclusaoConta({session,profile,password:'senha',signIn,
  request:async(t,path)=>{if(path==='/usuarios/8')throw new ApiError('conflito',409);return profile;}
 }),/Nenhum dado foi apagado/);
});

test('troca de conta durante reautenticação impede mutações de e-mail e exclusão',async()=>{
 let called=false;
 for(const op of [solicitarExclusaoConta,solicitarVerificacaoEmail]){
  await assert.rejects(()=>op({session,profile,password:'senha',newEmail:'novo@example.test',
   signIn,request:async()=>{called=true;return profile;},requestChange:async()=>{called=true;},isCurrent:()=>false
  }),/sessão mudou/);
 }
 assert.equal(called,false);
});

test('apiRequest não aceita 200 onde 202 é requisito de exclusão',async()=>{
 const oldUrl=process.env.NEXT_PUBLIC_BEVANS_API_URL;
 const oldFetch=globalThis.fetch;
 process.env.NEXT_PUBLIC_BEVANS_API_URL='https://api.bevans.invalid';
 let calls=0;
 try{
  globalThis.fetch=async(url,options)=>{calls++;
   assert.equal(options.expectedStatus,undefined);
   assert.equal(options.method,'DELETE');
   return Response.json({message:'sucesso aparente'},{status:200});
  };
  await assert.rejects(()=>apiRequest('token-sintetico','/usuarios/8',{method:'DELETE',expectedStatus:202}),
   e=>e instanceof ApiError&&e.status===200&&e.kind==='contract');
  assert.equal(calls,1);
 }finally{
  globalThis.fetch=oldFetch;
  if(oldUrl===undefined)delete process.env.NEXT_PUBLIC_BEVANS_API_URL;
  else process.env.NEXT_PUBLIC_BEVANS_API_URL=oldUrl;
 }
});
