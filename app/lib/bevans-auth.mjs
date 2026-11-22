// Firebase Identity Toolkit. Tokens ficam exclusivamente em memória desta aba.
export const firebaseApiKey = () => process.env.NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY || '';
export async function firebaseSignIn(email,password) {
  if (!firebaseApiKey()) throw new Error('Configure NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY.');
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(firebaseApiKey())}`, {
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true}),cache:'no-store',
  });
  const result=await response.json().catch(()=>({}));
  if (!response.ok || !result.idToken || !result.localId) throw new Error('Falha na autenticação. Confira e-mail, senha e configuração Firebase.');
  return {idToken:result.idToken,refreshToken:result.refreshToken,uid:result.localId,expiresAt:Date.now()+(Number(result.expiresIn)||3600)*1000};
}
export class FirebaseSessionExpiredError extends Error{
 constructor(){super('Sua sessão expirou ou foi revogada. Entre novamente.');this.name='FirebaseSessionExpiredError';}
}
export class FirebaseUnavailableError extends Error{
 constructor(){super('Não foi possível renovar a sessão agora. Confira a conexão e tente novamente.');this.name='FirebaseUnavailableError';}
}
const refreshInvalidCodes=new Set([
 'INVALID_REFRESH_TOKEN','TOKEN_EXPIRED','USER_DISABLED','USER_NOT_FOUND',
 'INVALID_GRANT','MISSING_REFRESH_TOKEN','CREDENTIAL_TOO_OLD_LOGIN_AGAIN',
]);

export async function firebaseRefresh(session) {
 if(!session?.uid||!session.idToken)throw new FirebaseSessionExpiredError();
 if(Date.now()<session.expiresAt-60000)return session;
 if(!session.refreshToken)throw new FirebaseSessionExpiredError();
 const key=firebaseApiKey();
 if(!key)throw new FirebaseUnavailableError();
 let response;
 try{
  response=await fetch('https://securetoken.googleapis.com/v1/token?key='+encodeURIComponent(key),{
   method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:new URLSearchParams({grant_type:'refresh_token',refresh_token:session.refreshToken}),
   cache:'no-store',signal:AbortSignal.timeout(12000),
  });
 }catch{throw new FirebaseUnavailableError();}
 const data=await response.json().catch(()=>null);
 if(!response.ok){
  const code=typeof data?.error?.message==='string'?data.error.message.toUpperCase():'';
  if(refreshInvalidCodes.has(code))throw new FirebaseSessionExpiredError();
  throw new FirebaseUnavailableError();
 }
 if(!data?.id_token||!Number.isFinite(Number(data.expires_in))||Number(data.expires_in)<=0)
  throw new FirebaseUnavailableError();
 if(data.user_id&&data.user_id!==session.uid)throw new FirebaseSessionExpiredError();
 return {...session,idToken:data.id_token,refreshToken:data.refresh_token||session.refreshToken,
  expiresAt:Date.now()+Number(data.expires_in)*1000};
}

// Uma única renovação por sessão. Logout, login e troca de credencial invalidam
// todas as respostas assíncronas anteriores, mesmo quando o UID é o mesmo.
export function criarCoordenadorSessao(refresh=firebaseRefresh){
 let currentSession=null,version=0,pending=null;
 return {
  set(value){
   if(!value?.uid||!value?.idToken)throw new FirebaseSessionExpiredError();
   currentSession=value;version++;pending=null;
  },
  clear(){currentSession=null;version++;pending=null;},
  current(){return currentSession;},
  async token(){
   if(!currentSession)throw new FirebaseSessionExpiredError();
   const generation=version;
   if(!pending||pending.generation!==generation){
    pending={generation,promise:Promise.resolve().then(()=>refresh(currentSession))};
   }
   const job=pending;
   try{
    const updated=await job.promise;
    if(version!==generation)throw Error('A sessão mudou. Entre novamente.');
    if(!updated?.idToken||updated.uid!==currentSession?.uid)throw new FirebaseSessionExpiredError();
    if(pending===job){currentSession=updated;pending=null;}
    return currentSession.idToken;
   }catch(e){
    if(pending===job)pending=null;
    if(version!==generation)throw Error('A sessão mudou. Entre novamente.');
    throw e;
   }
  },
 };
}

export async function firebasePasswordReset(email){
 if(!firebaseApiKey())throw new Error('Configure NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY.');
 if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email.trim()))throw new Error('Informe um e-mail válido para recuperar o acesso.');
 const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(firebaseApiKey())}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestType:'PASSWORD_RESET',email:email.trim()}),cache:'no-store'});
 if(!response.ok)throw new Error('Não foi possível solicitar a recuperação. Confira a configuração do Firebase e tente novamente.');
 return true;
}


// A alteração de e-mail é solicitada ao Firebase antes de qualquer escrita no backend.
// O link deve ser confirmado pelo titular. Não usar accounts:update para trocar
// o e-mail sem confirmação de posse; não carregar tokens em URL ou storage.
export async function firebaseRequestEmailChange(idToken,newEmail){
 if(!firebaseApiKey())throw Error('Firebase não configurado.');
 if(typeof idToken!=='string'||!idToken)throw Error('Sessão inválida. Entre novamente.');
 if(typeof newEmail!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim()))throw Error('Informe um e-mail válido.');
 const response=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key='+encodeURIComponent(firebaseApiKey()),{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({requestType:'VERIFY_AND_CHANGE_EMAIL',idToken,newEmail:newEmail.trim().toLowerCase()}),cache:'no-store',
 });
 if(!response.ok)throw Error('O Firebase não aceitou a solicitação. Verifique o endereço ou tente novamente.');
 return true;
}

export async function firebaseVerifiedAccount(idToken){
 if(!firebaseApiKey())throw Error('Firebase não configurado.');
 if(typeof idToken!=='string'||!idToken)throw Error('Sessão inválida.');
 const response=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+encodeURIComponent(firebaseApiKey()),{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken}),cache:'no-store',
 });
 const data=await response.json().catch(()=>({}));
 const account=Array.isArray(data.users)&&data.users.length===1?data.users[0]:null;
 if(!response.ok||!account||typeof account.localId!=='string'||!account.localId)throw Error('Não foi possível conferir a identidade Firebase.');
 return {uid:account.localId,email:account.email||'',emailVerified:account.emailVerified===true};
}
