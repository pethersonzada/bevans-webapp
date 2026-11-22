import {apiRequest,ep,idSeguro} from './bevans-api.mjs';
import {firebaseSignIn,firebaseVerifiedAccount,firebaseRequestEmailChange} from './bevans-auth.mjs';

export function emailNormalizado(email){
 if(typeof email!=='string')throw Error('Informe um e-mail válido.');
 const value=email.trim().toLowerCase();
 if(value.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw Error('Informe um e-mail válido.');
 return value;
}

export function conferirPerfilProprio(perfil,sessao){
 if(!sessao||typeof sessao.uid!=='string'||!sessao.uid||
  !perfil||!Number.isSafeInteger(perfil.id)||perfil.id<=0||
  perfil.firebaseUid!==sessao.uid||typeof perfil.email!=='string'||!perfil.email||
  typeof perfil.nome!=='string'||!perfil.nome)throw Error('O perfil retornado não corresponde à identidade autenticada.');
 return perfil;
}

const json=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const current=(session,uid)=>{if(!session||session.uid!==uid)throw Error('A sessão mudou. Entre novamente.');};
function conferirReautenticacao(signed,original){
 if(!signed||!signed.idToken||signed.uid!==original.uid)throw Error('As credenciais pertencem a outra conta. Nenhuma alteração foi realizada.');
 return signed;
}

export async function consultarMinhaConta(session,{request=apiRequest}={}){
 if(!session?.idToken||!session.uid)throw Error('Entre novamente.');
 const data=await request(session.idToken,ep.perfil(session.uid));
 return conferirPerfilProprio(data,session);
}

export async function solicitarVerificacaoEmail({session,profile,password,newEmail,signIn=firebaseSignIn,requestChange=firebaseRequestEmailChange,request=apiRequest,isCurrent=()=>true}){
 const own=conferirPerfilProprio(profile,session);
 const next=emailNormalizado(newEmail);
 if(next===emailNormalizado(own.email))throw Error('O novo e-mail é igual ao atual.');
 if(typeof password!=='string'||!password)throw Error('Informe sua senha atual para confirmar a identidade.');
 const recent=conferirReautenticacao(await signIn(own.email,password),session);
 current(session,own.firebaseUid);
 if(!isCurrent())throw Error('A sessão mudou. Entre novamente.');
 const official=await consultarMinhaConta(recent,{request});
 if(official.id!==own.id)throw Error('Conta diferente da que foi autenticada.');
 if(!isCurrent())throw Error('A sessão mudou. Entre novamente.');
 await requestChange(recent.idToken,next);
 if(!isCurrent())throw Error('A sessão mudou. Confira seu e-mail antes de entrar novamente.');
 return {email:next,status:'verificacao-enviada'};
}

export class EmailSyncPendingError extends Error{
 constructor(){super('O Firebase confirmou o novo e-mail, mas a sincronização com o BeVans não pôde ser comprovada. Entre com o e-mail novo e tente confirmar novamente.');this.name='EmailSyncPendingError';}
}

export async function confirmarEmailVerificado({session,profile,password,newEmail,signIn=firebaseSignIn,lookup=firebaseVerifiedAccount,request=apiRequest,isCurrent=()=>true}){
 const own=conferirPerfilProprio(profile,session);
 const next=emailNormalizado(newEmail);
 if(typeof password!=='string'||!password)throw Error('Informe sua senha para entrar com o e-mail verificado.');
 const recent=conferirReautenticacao(await signIn(next,password),session);
 if(!isCurrent())throw Error('A sessão mudou. Entre novamente.');
 const provider=await lookup(recent.idToken);
 if(provider.uid!==session.uid||!provider.emailVerified||emailNormalizado(provider.email)!==next)throw Error('O novo endereço ainda não está verificado no Firebase.');
 const before=await consultarMinhaConta(recent,{request});
 if(before.id!==own.id||!isCurrent())throw Error('O perfil autenticado mudou. Entre novamente.');
 if(emailNormalizado(before.email)===next)return {session:recent,profile:before};
 try{
  const response=await request(recent.idToken,'/usuarios/'+idSeguro(own.id)+'/email',json('PUT',{email:next}));
  conferirPerfilProprio(response,recent);
  if(response.id!==own.id||emailNormalizado(response.email)!==next)throw new EmailSyncPendingError();
 }catch(e){
  // O servidor pode ter gravado antes de um timeout. Reconsultar, sem rollback cego.
  try{
   const latest=await consultarMinhaConta(recent,{request});
   if(latest.id===own.id&&emailNormalizado(latest.email)===next&&isCurrent())return {session:recent,profile:latest};
  }catch{ /* resposta final não comprovada */ }
  if(e?.status===409)throw Error('O novo e-mail está em conflito com outra conta. Procure o suporte para sincronizar o perfil.');
  if(e?.status===403)throw Error('O Firebase ainda não confirmou o novo endereço para o servidor. Verifique o link e entre novamente.');
  throw new EmailSyncPendingError();
 }
 const confirmed=await consultarMinhaConta(recent,{request}).catch(()=>{throw new EmailSyncPendingError();});
 if(confirmed.id!==own.id||emailNormalizado(confirmed.email)!==next||!isCurrent())throw new EmailSyncPendingError();
 return {session:recent,profile:confirmed};
}

export async function solicitarExclusaoConta({session,profile,password,signIn=firebaseSignIn,request=apiRequest,isCurrent=()=>true}){
 const own=conferirPerfilProprio(profile,session);
 if(typeof password!=='string'||!password)throw Error('Informe sua senha atual.');
 const signed=conferirReautenticacao(await signIn(own.email,password),session);
 if(!isCurrent())throw Error('A sessão mudou. Entre novamente.');
 const official=await consultarMinhaConta(signed,{request});
 if(official.id!==own.id||!isCurrent())throw Error('O perfil autenticado mudou. Entre novamente.');
 try{
  await request(signed.idToken,'/usuarios/'+idSeguro(own.id),{method:'DELETE',expectedStatus:202});
 }catch(e){
  if(e?.status===409)throw Error('A conta possui vínculos ou histórico protegidos. Nenhum dado foi apagado; solicite atendimento pelo canal de contato.');
  if(e?.status===403)throw Error('A exclusão foi recusada para esta identidade. Entre novamente.');
  if(e?.kind==='timeout'||e?.kind==='network')throw Error('Não foi possível confirmar a solicitação. Entre novamente e consulte o suporte antes de repetir.');
  throw e;
 }
 if(!isCurrent())throw Error('A sessão mudou durante a exclusão. Entre novamente.');
 return 'pendente';
}
