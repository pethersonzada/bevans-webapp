import test from 'node:test';
import assert from 'node:assert/strict';
import {criarAcesso} from '../app/lib/acesso-autenticado.mjs';
import {ApiError} from '../app/lib/bevans-api.mjs';

function ambiente(getIdToken, request=async token=>token) {
 const user={uid:'sintetico',getIdToken};
 let atual=user;
 const sair=async candidato=>{if(candidato===atual)atual=null;};
 return {user,sair,ativo:()=>atual===user,...criarAcesso({contaAtual:u=>u===atual,sair,request})};
}
test('20 consultas simultâneas compartilham o token obtido pelo SDK',async()=>{
 let chamadas=0;
 const auth=ambiente(async()=>{chamadas++;return 'valido';});
 const respostas=await Promise.all(Array.from({length:20},()=>auth.consultar(auth.user,'/perfil')));
 assert.deepEqual([...new Set(respostas)],['valido']);
 assert.equal(chamadas,1);
});
test('resposta pendente de outra conta é descartada após logout',async()=>{
 const resposta=Promise.withResolvers(),iniciada=Promise.withResolvers();
 const auth=ambiente(async()=>'antigo',async()=>{iniciada.resolve();return resposta.promise;});
 const leitura=auth.consultar(auth.user,'/perfil');
 await iniciada.promise;
 await auth.sair(auth.user);
 resposta.resolve({nome:'Pessoa anterior'});
 await assert.rejects(leitura,/conta mudou/);
});
test('revogação pede novo login e falha de rede permite tentar de novo',async()=>{
 for(const [code,permanece] of [['auth/user-token-expired',false],['auth/invalid-refresh-token',false],['auth/network-request-failed',true]]){
  const auth=ambiente(async()=>{throw Object.assign(Error(),{code});});
  await assert.rejects(auth.obterToken(auth.user));
  assert.equal(auth.ativo(),permanece);
 }
});
test('401 força renovação antes de repetir uma consulta',async()=>{
 const tokens=[];
 const auth=ambiente(async forcar=>forcar?'novo':'antigo',async token=>{
  tokens.push(token);
  if(token==='antigo')throw new ApiError('Expirado',401);
  return 'perfil';
 });
 assert.equal(await auth.consultar(auth.user,'/perfil'),'perfil');
 assert.deepEqual(tokens,['antigo','novo']);
});
test('escrita rejeitada não é repetida automaticamente',async()=>{
 let chamadas=0;
 const auth=ambiente(async()=> 'valido',async()=>{chamadas++;throw new ApiError('Recusado',401);});
 await assert.rejects(auth.consultar(auth.user,'/turmas',{method:'POST'}),e=>e.status===401);
 assert.equal(chamadas,1);
});
test('403 preserva a identidade e não dispara renovação',async()=>{
 const renovacoes=[];
 const auth=ambiente(async forcar=>{renovacoes.push(forcar);return 'valido';},async()=>{throw new ApiError('Acesso restrito',403);});
 await assert.rejects(auth.consultar(auth.user,'/restrito'),e=>e.status===403);
 assert.deepEqual(renovacoes,[false]);
 assert.equal(auth.ativo(),true);
});
