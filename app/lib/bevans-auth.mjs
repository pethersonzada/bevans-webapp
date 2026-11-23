// Reautenticação isolada para operações de conta. O SDK gerencia o login persistente.
export const firebaseApiKey = () => process.env.NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY || '';
export async function firebaseSignIn(email,password) {
  if (!firebaseApiKey()) throw new Error('Configure NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY.');
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(firebaseApiKey())}`, {
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true}),cache:'no-store',
  });
  const result=await response.json().catch(()=>({}));
  if (!response.ok || !result.idToken || !result.localId) throw new Error('Falha na autenticação. Confira e-mail, senha e configuração Firebase.');
  return {idToken:result.idToken,uid:result.localId};
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
