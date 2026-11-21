import test from 'node:test';
import assert from 'node:assert/strict';
import {coordenadaValida,normalizarPontos,gpsRecente,caminhoPosicao,validarRotaDirecoes} from '../app/lib/mapa-web.mjs';

test('coordenadas válidas incluem latitude negativa e rejeitam zero-zero',()=>{
 assert.equal(coordenadaValida({latitude:-8.07,longitude:-34.9}),true);
 assert.equal(coordenadaValida({latitude:0,longitude:0}),false);
 assert.equal(coordenadaValida({latitude:91,longitude:0}),false);
 assert.equal(coordenadaValida({latitude:NaN,longitude:12}),false);
 assert.equal(coordenadaValida({latitude:'-8',longitude:-35}),false);
});
test('normalização omite pontos inválidos, preserva a ordem e rótulos',()=>{
 assert.deepEqual(normalizarPontos([{latitude:0,longitude:0},{nome:'A',latitude:-8,longitude:-35},{tipo:'DESTINO',latitude:-8.2,longitude:-35.1}]),[
 {latitude:-8,longitude:-35,nome:'A',tipo:'PARADA'},
 {latitude:-8.2,longitude:-35.1,nome:'DESTINO',tipo:'DESTINO'}
 ]);
});
test('GPS mostra apenas posição ATUALIZADA, recente e com relógio válido',()=>{
 const now=Date.parse('2026-11-21T12:00:00Z');
 const base={estado:'ATUALIZADA',latitude:-8,longitude:-35};
 assert.deepEqual(gpsRecente({...base,observadoEm:new Date(now-10000).toISOString()},now),{latitude:-8,longitude:-35});
 assert.equal(gpsRecente({...base,observadoEm:new Date(now-30000).toISOString()},now),null);
 assert.equal(gpsRecente({...base,observadoEm:new Date(now+6000).toISOString()},now),null);
 assert.equal(gpsRecente({...base,estado:'DESATUALIZADA',observadoEm:new Date(now).toISOString()},now),null);
});
test('caminho de GPS não aceita tipos ou IDs arbitrários',()=>{
 assert.equal(caminhoPosicao('VIAGEM',14),'/viagens/14/localizacao');
 assert.equal(caminhoPosicao('EXCURSAO','22'),'/execucoes-excursao/22/localizacao');
 assert.throws(()=>caminhoPosicao('OUTRO','1'));
 assert.throws(()=>caminhoPosicao('VIAGEM','../../auth'));
});
test('rota Mapbox precisa conter todas as pernas, waypoints e geometria válida',()=>{
 const r={code:'Ok',routes:[{legs:[{},{}],geometry:{coordinates:[[-35,-8],[-35.1,-8.1]]}}],waypoints:[{},{},{}]};
 assert.equal(validarRotaDirecoes(r,3),true);
 assert.equal(validarRotaDirecoes({...r,waypoints:[{},{}]},3),false);
 assert.equal(validarRotaDirecoes({...r,routes:[{legs:[{}],geometry:{coordinates:[[-35,-8],[-35.1,-8.1]]}}]},3),false);
 assert.equal(validarRotaDirecoes({...r,routes:[{legs:[{},{}],geometry:{coordinates:[[900,-8],[-35,-8]]}}]},3),false);
});
