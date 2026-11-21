import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('editor usa os contratos oficiais de rotas públicas e valida pontos',()=>{
  const c=source('app/painel/EditorRotaWeb.jsx');
  assert.match(c,/\/rotas-publicas\/\$\{salvoId\}\/paradas/);
  assert.match(c,/pontoValido\(form\.origemLatitude,form\.origemLongitude\)/);
  assert.match(c,/pontoValido\(form\.destinoLatitude,form\.destinoLongitude\)/);
  assert.match(c,/paradas\.some/);
  assert.match(c,/if\(paradas\.length>=50\)/);
  assert.match(c,/rota\?'PUT':'POST'/);
});

test('panel mostra editor e início de viagem pública sem endpoints legados',()=>{
  const c=source('app/painel/AuthEntry.jsx');
  assert.match(c,/<EditorRotaWeb /);
  assert.match(c,/\/rotas-publicas\/\$\{idSeguro\(route\.id\)\}\/iniciar/);
  assert.doesNotMatch(c,/\/rota\/localizacao-van/);
});

test('mapas de informações privadas exigem opt-in para tiles de terceiros',()=>{
  const m=source('app/painel/MapaOperacional.jsx');
  const addresses=source('app/painel/EnderecosWeb.jsx');
  const tracker=source('app/painel/AcompanhamentoViagem.jsx');
  assert.match(m,/setPermitido\(true\)/);
  assert.match(m,/if\(!permitido\)return/);
  assert.match(addresses,/onPick=\{pick\} privado/);
  assert.match(tracker,/autorizarRoteamento=\{driver&&roteiro\.length>1\} privado/);
});
