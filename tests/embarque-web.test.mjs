import test from 'node:test';
import assert from 'node:assert/strict';
import {montarPedidoEmbarque,podeEscolherPontoPrivado,validarRespostaEmbarque,validarCancelamentoEmbarque,mensagemErroEmbarque} from '../app/lib/embarque-web.mjs';
const fixa={id:41,modo:'FIXA',permitePontoExcepcional:false,paradas:[{id:7,nome:'Ponto',ativa:true}]};
const flex={...fixa,modo:'FLEXIVEL'};
const dados={dataOperacao:'2026-11-24',sentido:'IDA',modo:'PARADA',paradaId:'7'};
test('rota fixa somente aceita parada registrada ativa',()=>{
 assert.deepEqual(montarPedidoEmbarque(fixa,dados),{dataOperacao:'2026-11-24',sentido:'IDA',paradaId:7});
 assert.throws(()=>montarPedidoEmbarque(fixa,{...dados,paradaId:'8'}),/parada ativa/);
 assert.throws(()=>montarPedidoEmbarque({...fixa,paradas:[{id:7,ativa:false}]},dados),/parada ativa/);
 assert.equal(podeEscolherPontoPrivado(fixa),false);
 assert.throws(()=>montarPedidoEmbarque(fixa,{...dados,modo:'PONTO',ponto:{latitude:-8,longitude:-35},confirmado:true,nomePonto:'Casa'}),/não permite/);
});
test('flexível e fixa autorizada podem solicitar pin confirmado e privado',()=>{
 for(const rota of [flex,{...fixa,permitePontoExcepcional:true}]){
  const data=montarPedidoEmbarque(rota,{...dados,modo:'PONTO',nomePonto:' Ponto privado ',ponto:{latitude:-8.09,longitude:-35.13},confirmado:true,observacao:' Chegar cedo '});
  assert.deepEqual(data,{dataOperacao:'2026-11-24',sentido:'IDA',observacao:'Chegar cedo',nomePonto:'Ponto privado',latitude:-8.09,longitude:-35.13,pontoConfirmado:true});
  assert.equal('alunoId'in data,false);
  assert.equal('paradaId'in data,false);
 }
});
test('pin sem confirmação ou inválido não gera pedido',()=>{
 const p={...dados,modo:'PONTO',nomePonto:'Parada',ponto:{latitude:0,longitude:0},confirmado:true};
 assert.throws(()=>montarPedidoEmbarque(flex,p),/confirme a localização/);
 assert.throws(()=>montarPedidoEmbarque(flex,{...p,ponto:{latitude:-8,longitude:-35},confirmado:false}),/confirme/);
 assert.throws(()=>montarPedidoEmbarque(flex,{...p,ponto:{latitude:95,longitude:-35}}),/confirme/);
 assert.throws(()=>montarPedidoEmbarque(flex,{...p,ponto:{latitude:-8,longitude:-35},nomePonto:' '.repeat(4)}),/confirme/);
 assert.throws(()=>montarPedidoEmbarque(flex,{...p,ponto:{latitude:-8,longitude:-35},nomePonto:'X'.repeat(121)}),/confirme/);
});
test('não admite IDs manipulados e estados fictícios do servidor',()=>{
 assert.throws(()=>montarPedidoEmbarque({...fixa,id:'../42'},dados),/Identificador/);
 assert.throws(()=>montarPedidoEmbarque(fixa,{...dados,sentido:'AMBOS'}),/sentido/);
 assert.throws(()=>montarPedidoEmbarque(fixa,{...dados,dataOperacao:'ontem'}),/data/);
 assert.throws(()=>montarPedidoEmbarque(fixa,{...dados,observacao:'X'.repeat(501)}),/500/);
 const r={id:77,rotaId:41,status:'PENDENTE'};
 assert.equal(validarRespostaEmbarque(r,41).id,77);
 assert.throws(()=>validarRespostaEmbarque({...r,rotaId:42},41),/não confirmou/);
 assert.throws(()=>validarRespostaEmbarque({...r,status:'CONFIRMADA'},41),/não confirmou/);
 assert.deepEqual(validarCancelamentoEmbarque({id:77,status:'CANCELADO'},77),{id:77,status:'CANCELADO'});
 assert.throws(()=>validarCancelamentoEmbarque({id:77,status:'APROVADO'},77),/não foi confirmado/);
});
test('em conflito e timeout não assume sucesso nem sugere repetição cega',()=>{
 assert.match(mensagemErroEmbarque({status:409}),/histórico/);
 assert.match(mensagemErroEmbarque({kind:'timeout'}),/pode ter sido registrada/);
 assert.match(mensagemErroEmbarque({status:403}),/autorização/);
});
