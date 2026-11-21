import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizarColeta,validarEscolha} from '../app/lib/coleta-web.mjs';
const ponto=(id=null)=>({id,nome:' Praça Central ',latitude:-8.1,longitude:-35.1,horario:'07:00'});
test('porta a porta limpa pontos e preserva a versão',{concurrency:false},()=>{
 assert.deepEqual(normalizarColeta('PORTA_A_PORTA',2,[ponto()]),{modo:'PORTA_A_PORTA',versao:2,paradas:[]});
});
test('paradas definidas validam ordem, pontos confirmados e horário',()=>{
 const r=normalizarColeta('PARADAS_DEFINIDAS',4,[ponto(12),{...ponto(),nome:'Estação',latitude:-8.2}]);
 assert.equal(r.paradas[0].nome,'Praça Central');
 assert.equal(r.paradas[0].pontoConfirmado,true);
 assert.equal(r.paradas[1].nome,'Estação');
 assert.equal(r.paradas.length,2);
 assert.equal(r.versao,4);
});
test('rejeita modo, coordenadas, nomes, horários e IDs duplicados',()=>{
 assert.throws(()=>normalizarColeta('OUTRO',0,[]),/Modo/);
 assert.throws(()=>normalizarColeta('PARADAS_DEFINIDAS',0,[]),/entre 1 e 50/);
 assert.throws(()=>normalizarColeta('PARADAS_DEFINIDAS',0,[{...ponto(),latitude:91}]),/coordenadas/);
 assert.throws(()=>normalizarColeta('PARADAS_DEFINIDAS',0,[{...ponto(),horario:'28:00'}]),/Horário/);
 assert.throws(()=>normalizarColeta('PARADAS_DEFINIDAS',0,[ponto(5),ponto(5)]),/repetido/);
 assert.throws(()=>normalizarColeta('PARADAS_DEFINIDAS',-1,[ponto()]),/Versão/);
});
test('escolha da parada só aceita ID pertencente à configuração',()=>{
 const c={modo:'PARADAS_DEFINIDAS',versao:3,paradas:[ponto(4),ponto(8)]};
 assert.deepEqual(validarEscolha(c,8),{paradaId:8,versao:3});
 assert.throws(()=>validarEscolha(c,9),/parada disponível/);
 assert.throws(()=>validarEscolha({...c,modo:'PORTA_A_PORTA'},8),/Configuração/);
});
