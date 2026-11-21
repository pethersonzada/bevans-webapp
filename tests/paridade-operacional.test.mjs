import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pontoValido,pontosRotaPublica,pontosRoteiroOperacional} from '../app/painel/mapa-utils.mjs';

const ler=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('valida coordenadas geográficas sem aceitar NaN, zero-zero ou valores fora do intervalo',()=>{
  assert.equal(pontoValido(-8.05,-34.9),true);
  assert.equal(pontoValido(0,0),false);
  assert.equal(pontoValido(91,-34.9),false);
  assert.equal(pontoValido(-8,Infinity),false);
  assert.equal(pontoValido('-8',-34.9),false);
});

test('projeta somente pontos válidos do catálogo público e preserva a ordem',()=>{
  const pontos=pontosRotaPublica({origemNome:'Origem',origemLatitude:-8,origemLongitude:-35,
    paradas:[{nome:'P1',latitude:-8.1,longitude:-35.1},{nome:'Inválida',latitude:300,longitude:-35}],
    destinoNome:'Destino',destinoLatitude:-8.2,destinoLongitude:-35.2});
  assert.deepEqual(pontos.map(p=>p.nome),['Origem','P1','Destino']);
});

test('roteiro operacional filtra coordenadas inválidas sem inventar posição para terceiros',()=>{
  const pontos=pontosRoteiroOperacional([{tipo:'ORIGEM',nome:'Garagem',latitude:-8,longitude:-35},
    {tipo:'INDIVIDUAL',nome:'Sem GPS',latitude:null,longitude:null}]);
  assert.deepEqual(pontos.map(p=>p.nome),['Garagem']);
});

test('acompanhamento GPS exige viagem ativa e não expõe transmissão anônima',()=>{
  const fonte=ler('app/painel/AcompanhamentoViagem.jsx');
  assert.match(fonte,/viagem\?\.status==='ATIVA'/);
  assert.match(fonte,/gpsViagem!==id/);
  assert.match(fonte,/document\.visibilityState!=='visible'/);
  assert.match(fonte,/\/viagens\/\$\{id\}\/localizacao/);
  assert.match(fonte,/window\.confirm/);
});

test('painel inclui mapas, confirmação de presença e endereços autorizados',()=>{
  const app=ler('app/painel/AuthEntry.jsx');
  assert.match(app,/<EnderecosWeb /);
  assert.match(app,/<PresencaWeb /);
  assert.match(app,/<AcompanhamentoViagem /);
  assert.match(app,/pontosRotaPublica\(route\)/);
});

test('roteamento externo exige opção explícita, limite e token público',()=>{
  const map=ler('app/painel/MapaOperacional.jsx');
  assert.match(map,/NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN/);
  assert.match(map,/window\.confirm/);
  assert.match(map,/pins\.length>25/);
  assert.match(map,/OpenStreetMap contributors/);
});
