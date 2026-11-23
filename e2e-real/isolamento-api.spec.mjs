import {test,expect} from '@playwright/test';
import {validarStagingReal} from '../app/lib/evidencias-staging.mjs';

// Este teste é exclusivamente manual, com Firebase e API de homologação.
// Todas as chamadas ao backend são GET; credenciais e tokens ficam só em memória.
const {apiOrigin}=validarStagingReal({
 webUrl:process.env.BEVANS_STAGING_WEB_URL,
 apiUrl:process.env.BEVANS_STAGING_API_URL,
 expectedSha:process.env.BEVANS_STAGING_EXPECTED_SHA,
});
if(process.env.BEVANS_FIXTURES_DESCARTAVEIS!=='confirmado')
 throw Error('Contas e banco descartáveis não confirmados.');

function credenciais(perfil){
 const email=process.env['BEVANS_STAGING_'+perfil+'_EMAIL'];
 const senha=process.env['BEVANS_STAGING_'+perfil+'_PASSWORD'];
 if(!email||!email.includes('@')||!senha)
  throw Error('Conta descartável de '+perfil+' não configurada.');
 return {email,senha};
}

async function autenticar(request,perfil){
 const apiKey=process.env.BEVANS_STAGING_FIREBASE_API_KEY;
 if(!apiKey||apiKey.length<10)
  throw Error('API key pública do Firebase de homologação não configurada.');
 const {email,senha}=credenciais(perfil);
 const resposta=await request.post(
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+encodeURIComponent(apiKey),
  {data:{email,password:senha,returnSecureToken:true},failOnStatusCode:false});
 if(resposta.status()!==200)
  throw Error('Autenticação de fixture de '+perfil+' recusada pelo Firebase de teste.');
 const autenticado=await resposta.json();
 if(typeof autenticado.idToken!=='string'||typeof autenticado.localId!=='string'||
  !autenticado.idToken||!autenticado.localId)
  throw Error('Token de teste não foi recebido.');
 return {token:autenticado.idToken,uid:autenticado.localId};
}

function caminhoPerfil(uid){return '/usuarios/por-uid/'+encodeURIComponent(uid);}
async function buscar(request,caminho,token){
 return request.get(apiOrigin+caminho,{failOnStatusCode:false,headers:{
  Authorization:'Bearer '+token,Accept:'application/json'
 }});
}
async function obterPerfil(request,autenticado,esperado){
 const resposta=await buscar(request,caminhoPerfil(autenticado.uid),autenticado.token);
 if(resposta.status()!==200)throw Error('Consulta do perfil próprio falhou.');
 const perfil=await resposta.json();
 if(perfil?.tipo!==esperado||!Number.isSafeInteger(perfil?.id)||perfil.id<=0)
  throw Error('Fixture Firebase não corresponde ao perfil esperado no backend.');
 return perfil;
}

test('Firebase e backend reais isolam os perfis e as turmas por identidade',async({request})=>{
 const motoristaAuth=await autenticar(request,'MOTORISTA');
 const passageiroAuth=await autenticar(request,'PASSAGEIRO');
 if(motoristaAuth.uid===passageiroAuth.uid)
  throw Error('Os dois perfis não podem compartilhar UID.');

 const motorista=await obterPerfil(request,motoristaAuth,'MOTORISTA');
 const passageiro=await obterPerfil(request,passageiroAuth,'PASSAGEIRO');
 if(motorista.id===passageiro.id)
  throw Error('Os dois perfis não podem compartilhar ID.');

 const cruzados=[
  [motoristaAuth.token,caminhoPerfil(passageiroAuth.uid)],
  [passageiroAuth.token,caminhoPerfil(motoristaAuth.uid)],
  [motoristaAuth.token,'/turmas/usuario/'+passageiro.id+'/todas'],
  [passageiroAuth.token,'/turmas/motorista/'+motorista.id],
 ];
 for(const [token,path] of cruzados){
  const resposta=await buscar(request,path,token);
  expect([403,404], 'O backend deve negar consulta cruzada entre fixtures.').toContain(resposta.status());
 }
});
