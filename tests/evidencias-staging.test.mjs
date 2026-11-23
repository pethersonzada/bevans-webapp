import test from 'node:test';
import assert from 'node:assert/strict';
import {validarStagingReal,criarRegistroHomologacao,HOST_PREVIEW} from '../app/lib/evidencias-staging.mjs';
const env={webUrl:'https://'+HOST_PREVIEW+'/',apiUrl:'https://api-staging.bevans.invalid/',expectedSha:'a'.repeat(40)};

test('homologação aceita somente web preview e API distinta explicitamente de teste',()=>{
 const v=validarStagingReal(env);
 assert.equal(v.webOrigin,'https://'+HOST_PREVIEW);
 assert.equal(v.apiOrigin,'https://api-staging.bevans.invalid');
 for(const raw of [
  {...env,webUrl:'https://bevans-webapp.vercel.app/'},
  {...env,apiUrl:'https://api.bevans.com.br/'},
  {...env,apiUrl:env.webUrl},
  {...env,expectedSha:'main'},
  {...env,webUrl:'http://'+HOST_PREVIEW+'/'},
  {...env,webUrl:'https://'+HOST_PREVIEW+'/?token=segredo'},
  {...env,apiUrl:'https://usuario:senha@api-staging.bevans.invalid/'},
 ])assert.throws(()=>validarStagingReal(raw));
});

test('registro guarda somente evidências técnicas e nenhum dado de conta',()=>{
 const registro=criarRegistroHomologacao({...env,runId:'123456',dataIso:'2026-11-23T17:00:00Z'});
 assert.equal(registro.status,'aprovado');
 assert.equal(registro.cenarios.length,7);
 assert.equal(registro.execucaoGitHub,123456);
 const json=JSON.stringify(registro);
 assert.doesNotMatch(json,/senha|password|uid|idToken|Bearer|longitude|latitude|@/i);
 assert.equal(registro.sha,env.expectedSha);
});
