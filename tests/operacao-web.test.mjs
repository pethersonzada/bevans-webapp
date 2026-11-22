import test from 'node:test';
import assert from 'node:assert/strict';
import {
 alterarEstadoWeb,caminhoOperacao,consultarHistoricoWeb,consultarOperacaoWeb,
 destinosRegulares,mensagemErroOperacional,permiteCorrecaoParaAguardando,
 validarHistoricoOperacional,validarPainelOperacional,validarRegistroOperacional,
} from '../app/lib/operacao-web.mjs';

const registro=(estado='AGUARDANDO',versao=0)=>({id:15,alunoId:9,nome:'Pessoa fictícia',estado,versao});
const painel=(tipo='VIAGEM')=>({referenciaId:77,tipo,sentido:'IDA',
 contadores:{esperados:1,aguardando:1,naVan:0,naoEmbarcaram:0,desembarcados:0},
 registros:[registro()]});
const evento={id:11,anterior:'AGUARDANDO',novo:'EMBARCADO',criadoEm:'2026-11-22T12:00:00Z',correcao:false,versaoRegistro:1};

test('só monta caminhos de referências válidas, sem acesso Firebase público de excursão',()=>{
 assert.equal(caminhoOperacao('VIAGEM',77,true),'/operacoes/VIAGEM/77');
 assert.equal(caminhoOperacao('EXCURSAO',77,true),'/operacoes/EXCURSAO/77');
 assert.throws(()=>caminhoOperacao('EXCURSAO',77,false),/credencial individual/);
 assert.throws(()=>caminhoOperacao('ADMIN',77,true),/Tipo de operação/);
 assert.throws(()=>caminhoOperacao('VIAGEM','../79',true),/Identificador/);
});

test('painel oficial exige referência, tipo, contadores e registros exclusivos coerentes',()=>{
 assert.equal(validarPainelOperacional(painel(),'VIAGEM',77).referenciaId,77);
 assert.throws(()=>validarPainelOperacional(painel(),'VIAGEM',78),/inválidos/);
 assert.throws(()=>validarPainelOperacional(painel(),'EXCURSAO',77),/inválidos/);
 assert.throws(()=>validarPainelOperacional({...painel(),registros:[registro(),registro()]},'VIAGEM',77),/inválidos/);
 assert.throws(()=>validarPainelOperacional({...painel(),contadores:{...painel().contadores,naVan:1}},'VIAGEM',77),/inválidos/);
 assert.throws(()=>validarRegistroOperacional({...registro(),versao:-1}),/inválidos/);
});

test('consulta de motorista lê lista; consulta de passageiro lê somente seu registro',async()=>{
 const calls=[];
 const api=async(path,opts)=>{calls.push({path,opts});return path.endsWith('/minha')?registro():painel();};
 await consultarOperacaoWeb(api,'VIAGEM',77,true);
 await consultarOperacaoWeb(api,'VIAGEM',77,false);
 assert.deepEqual(calls.map(c=>c.path),['/operacoes/VIAGEM/77','/operacoes/VIAGEM/77/minha']);
 assert.throws(()=>validarRegistroOperacional({registros:[registro()]}),/inválidos/);
});

test('histórico respeita permissão e rejeita histórico malformado',async()=>{
 const calls=[];
 const api=async path=>{calls.push(path);return [evento];};
 assert.equal((await consultarHistoricoWeb(api,'VIAGEM',77,15,true)).length,1);
 assert.equal((await consultarHistoricoWeb(api,'VIAGEM',77,null,false)).length,1);
 assert.deepEqual(calls,['/operacoes/VIAGEM/77/passageiros/15/historico','/operacoes/VIAGEM/77/minha/historico']);
 await assert.rejects(()=>consultarHistoricoWeb(api,'EXCURSAO',77,null,false),/credencial individual/);
 assert.throws(()=>validarHistoricoOperacional([{...evento,id:0}]),/inválido/);
 assert.throws(()=>validarHistoricoOperacional([evento,evento]),/inválido/);
});

test('transição regular envia versão do snapshot e só confirma a resposta oficial',async()=>{
 const calls=[];
 const api=async(path,options)=>{
  calls.push({path,...options});
  return {...registro('EMBARCADO',1)};
 };
 const r=await alterarEstadoWeb(api,{tipo:'VIAGEM',referenciaId:77,registro:registro(),driver:true,estado:'EMBARCADO'});
 assert.equal(r.estado,'EMBARCADO');
 assert.equal(calls[0].path,'/operacoes/VIAGEM/77/passageiros/15/estado');
 assert.deepEqual(JSON.parse(calls[0].body),{estado:'EMBARCADO',versao:0,correcao:false});
 const passenger=await alterarEstadoWeb(async()=>registro('EMBARCADO',1),{tipo:'VIAGEM',referenciaId:77,registro:registro(),driver:false,estado:'EMBARCADO'});
 assert.equal(passenger.versao,1);
 await assert.rejects(()=>alterarEstadoWeb(async()=>registro('EMBARCADO',0),{tipo:'VIAGEM',referenciaId:77,registro:registro(),driver:true,estado:'EMBARCADO'}),/não confirmou/);
 await assert.rejects(()=>alterarEstadoWeb(async()=>registro('AGUARDANDO',1),{tipo:'VIAGEM',referenciaId:77,registro:registro(),driver:true,estado:'EMBARCADO'}),/não confirmou/);
});

test('correção auditada exige motorista, justificativa e confirmação de versão',async()=>{
 const calls=[];
 const existing=registro('NAO_EMBARCOU',5);
 const api=async(path,options)=>{calls.push({path,payload:JSON.parse(options.body)});return registro('AGUARDANDO',6);};
 await alterarEstadoWeb(api,{tipo:'VIAGEM',referenciaId:77,registro:existing,driver:true,estado:'AGUARDANDO',correcao:true,motivo:' Erro no lançamento. '});
 assert.deepEqual(calls[0].payload,{estado:'AGUARDANDO',versao:5,correcao:true,motivo:'Erro no lançamento.'});
 const originalCount=calls.length;
 for(const options of [
  {driver:false,correcao:true,motivo:'Teste'},
  {driver:true,correcao:true,motivo:' '},
  {driver:true,correcao:true,motivo:'a'.repeat(501)},
  {driver:true,correcao:false,motivo:'Não permitido'},
 ]){
  await assert.rejects(()=>alterarEstadoWeb(api,{tipo:'VIAGEM',referenciaId:77,registro:existing,estado:'AGUARDANDO',...options}));
 }
 assert.equal(calls.length,originalCount);
});

test('erros HTTP e timeouts produzem instruções para reconsultar, sem simular sucesso',()=>{
 assert.match(mensagemErroOperacional({status:401}),/sessão expirou/);
 assert.match(mensagemErroOperacional({status:403}),/permissão/);
 assert.match(mensagemErroOperacional({status:404}),/não há registro/i);
 assert.match(mensagemErroOperacional({status:409}),/Atualize/);
 assert.match(mensagemErroOperacional({kind:'timeout'}),/pode ter sido processada/);
 assert.match(mensagemErroOperacional({kind:'network'}),/Nenhuma alteração foi presumida/);
 assert.deepEqual(destinosRegulares('AGUARDANDO'),['EMBARCADO','NAO_EMBARCOU']);
 assert.deepEqual(destinosRegulares('EMBARCADO'),['DESEMBARCADO']);
 assert.deepEqual(destinosRegulares('DESEMBARCADO'),[]);
 assert.equal(permiteCorrecaoParaAguardando('DESEMBARCADO'),true);
});
