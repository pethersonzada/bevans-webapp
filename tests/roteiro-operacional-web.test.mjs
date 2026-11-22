import test from 'node:test';
import assert from 'node:assert/strict';
import {validarRoteiroOperacional,conferirSnapshotRoteiro,assinaturaRoteiroWeb,conferirContextoRoteiro} from '../app/lib/roteiro-operacional-web.mjs';
const origem={tipo:'ORIGEM',paradaId:null,nome:'Ponto inicial',latitude:-8.1,longitude:-35.1,passageiros:[]};
const p={tipo:'PARADA',paradaId:30,nome:'Parada 30',latitude:-8.11,longitude:-35.11,passageiros:[{id:15,nome:'Pessoa fictícia',latitude:-8.11,longitude:-35.11}]};
const fim={tipo:'DESTINO',paradaId:null,nome:'Destino',latitude:-8.2,longitude:-35.2,passageiros:[]};
const operacao={tipo:'VIAGEM',referenciaId:77,sentido:'IDA',contadores:{esperados:1},registros:[{alunoId:15,paradaId:30,ordem:1}]};
const ctx={usuarioId:7,turmaId:41,viagemId:77,sentido:'IDA'};
test('roteiro completo de origem a destino preserva paradas e passageiros',()=>{
 const pts=validarRoteiroOperacional([origem,p,fim]);
 assert.equal(pts.length,3);assert.equal(pts[1].chave,'1:PARADA:30');
 assert.equal(conferirSnapshotRoteiro(pts,operacao,77,'IDA'),true);
 const sig=assinaturaRoteiroWeb(ctx,pts);
 assert.equal(conferirContextoRoteiro(sig,ctx,pts),true);
 assert.equal(conferirContextoRoteiro(sig,{...ctx,usuarioId:8},pts),false);
 assert.equal(conferirContextoRoteiro(sig,{...ctx,viagemId:78},pts),false);
 assert.equal(conferirContextoRoteiro(sig,ctx,[...pts].reverse()),false);
});
test('falha se servidor omitir ponto ou ponto estiver fora da sequência',()=>{
 assert.throws(()=>validarRoteiroOperacional([origem]),/incompleto/);
 assert.throws(()=>validarRoteiroOperacional([p,fim]),/incompleto/);
 assert.throws(()=>validarRoteiroOperacional([origem,fim,p]),/incompleto/);
 assert.throws(()=>validarRoteiroOperacional([origem,{...p,paradaId:null},fim]),/incompleto/);
 assert.throws(()=>validarRoteiroOperacional([origem,{...p,longitude:200},fim]),/incompleto/);
 assert.throws(()=>validarRoteiroOperacional([origem,{...p,passageiros:[p.passageiros[0],p.passageiros[0]]},fim]),/incompleto/);
});
test('não libera itinerário incompatível com operação persistida',()=>{
 const pts=validarRoteiroOperacional([origem,p,fim]);
 for(const alt of [{...operacao,referenciaId:99},{...operacao,tipo:'EXCURSAO'},{...operacao,sentido:'VOLTA'},{...operacao,contadores:{esperados:2}},{
  ...operacao,registros:[{alunoId:15,paradaId:30,ordem:2}]
 },{...operacao,registros:[{alunoId:99,paradaId:30,ordem:1}]}]){
  assert.throws(()=>conferirSnapshotRoteiro(pts,alt,77,'IDA'),/não corresponde/);
 }
});
test('roteiro com muitos pontos mantém todos: limite Mapbox deve ser tratado separadamente',()=>{
 const stops=Array.from({length:26},(_,i)=>({...p,paradaId:i+1,passageiros:[],nome:'Parada '+(i+1)}));
 const pts=validarRoteiroOperacional([origem,...stops,fim]);
 assert.equal(pts.length,28);
 assert.equal(conferirSnapshotRoteiro(pts,{...operacao,contadores:{esperados:0},registros:[]},77,'IDA'),true);
});
