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
export async function firebaseRefresh(session) {
  if(Date.now()<session.expiresAt-60000) return session;
  const response=await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(firebaseApiKey())}`,{
    method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:session.refreshToken}),cache:'no-store',
  });
  const body=await response.json().catch(()=>({}));
  if(!response.ok||!body.id_token)throw new Error('Sua sessão expirou. Entre novamente.');
  return {...session,idToken:body.id_token,refreshToken:body.refresh_token||session.refreshToken,expiresAt:Date.now()+(Number(body.expires_in)||3600)*1000};
}

export async function firebasePasswordReset(email){
 if(!firebaseApiKey())throw new Error('Configure NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY.');
 if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email.trim()))throw new Error('Informe um e-mail válido para recuperar o acesso.');
 const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(firebaseApiKey())}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestType:'PASSWORD_RESET',email:email.trim()}),cache:'no-store'});
 if(!response.ok)throw new Error('Não foi possível solicitar a recuperação. Confira a configuração do Firebase e tente novamente.');
 return true;
}
