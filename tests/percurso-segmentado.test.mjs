import test from 'node:test';
import assert from 'node:assert/strict';
import {dividirPercurso,calcularPercursoCompleto} from '../app/lib/percurso-segmentado.mjs';

const pontos=(total)=>Array.from({length:total},(_,i)=>({
 nome:'Parada '+i,latitude:-8-i/1000,longitude:-35-i/1000,
}));

const mockMapbox=(chamadas,{falharNo=0}={})=>async url=>{
 const parte=new URL(url).pathname.split('/driving/')[1];
 const coords=parte.split(';').map(item=>item.split(',').map(Number));
 chamadas.push(coords);
 if(chamadas.length===falharNo)return {ok:false};
 return {ok:true,json:async()=>({
  code:'Ok',waypoints:coords.map(()=>({})),routes:[{
   geometry:{coordinates:coords},
   distance:(coords.length-1)*1000,
   legs:coords.slice(1).map((_,i)=>({steps:[{maneuver:{instruction:'Continuar até a parada '+(i+1)},distance:1000,duration:120}]}))
  }]
 })};
};

test('até 25 pontos utiliza apenas um trecho',()=>{
 assert.deepEqual(dividirPercurso(pontos(2)).map(x=>x.length),[2]);
 assert.deepEqual(dividirPercurso(pontos(25)).map(x=>x.length),[25]);
});

test('mais de 25 pontos preserva a fronteira e todas as paradas na ordem',()=>{
 for(const total of [26,28,49,50,75,250]){
  const original=pontos(total),grupos=dividirPercurso(original);
  assert.ok(grupos.every(g=>g.length>=2&&g.length<=25));
  for(let i=1;i<grupos.length;i++)assert.deepEqual(grupos[i][0],grupos[i-1].at(-1));
  const unido=grupos.flatMap((g,i)=>i?g.slice(1):g);
  assert.deepEqual(unido,original);
 }
});

test('agrega distância, manobras e geometria somente após confirmar todos os trechos',async()=>{
 const chamadas=[],original=pontos(28);
 const rota=await calcularPercursoCompleto(original,{token:'pk.mock',fetcher:mockMapbox(chamadas)});
 assert.deepEqual(chamadas.map(x=>x.length),[25,4]);
 assert.equal(rota.trechos,2);
 assert.equal(rota.pontos,28);
 assert.equal(rota.distancia,27000);
 assert.equal(rota.instrucoes.length,27);
 assert.deepEqual(rota.geometria,original.map(p=>[p.longitude,p.latitude]));
});

test('uma resposta Mapbox falha não entrega geometria parcial como percurso',async()=>{
 const chamadas=[];
 await assert.rejects(calcularPercursoCompleto(pontos(28),{
  token:'pk.mock',fetcher:mockMapbox(chamadas,{falharNo:2})
 }),/todos os trechos/);
 assert.deepEqual(chamadas.map(x=>x.length),[25,4]);
});

test('recusa respostas com menos pernas, manobras ausentes ou waypoints inconsistentes',async()=>{
 const original=pontos(26);
 const fake=async()=>({ok:true,json:async()=>({
  code:'Ok',waypoints:[{}],routes:[{geometry:{coordinates:[[-35,-8],[-35.1,-8.1]]},distance:500,legs:[{}]}]
 })});
 await assert.rejects(calcularPercursoCompleto(original,{token:'pk.mock',fetcher:fake}),/não confirmou todas as paradas/);
});

test('rejeita rota inválida, token ausente e consulta cancelada',async()=>{
 assert.throws(()=>dividirPercurso(pontos(251)),/limite seguro/);
 assert.throws(()=>dividirPercurso([{latitude:NaN,longitude:-35},pontos(2)[1]]),/inválidos/);
 await assert.rejects(calcularPercursoCompleto(pontos(2),{token:''}),/token/);
 const controller=new AbortController();controller.abort();
 await assert.rejects(calcularPercursoCompleto(pontos(2),{
  token:'pk.mock',signal:controller.signal,fetcher:async()=>{throw Error('não deveria chamar');}
 }),/cancelada/);
});
