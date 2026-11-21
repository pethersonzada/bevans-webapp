import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {credencialValida,apiPublicaBase,conviteRequest} from '../app/lib/excursao-publica.mjs';

const ler=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('credencial de convite exige token estruturado e não aceita caracteres de URL',()=>{
  assert.equal(credencialValida('A'.repeat(45)),true);
  for(const value of ['','abc','x?senha=segredo','../../token','<script>','x'.repeat(200)]) assert.equal(credencialValida(value),false);
});

test('cliente de convite só aceita caminhos conhecidos e não aceita credenciais na URL',async()=>{
  await assert.rejects(conviteRequest('/publico/excursoes/convite?token=abc',{convite:'A'.repeat(45)}),/não permitido/);
  await assert.rejects(conviteRequest('//example.org',{convite:'A'.repeat(45)}),/não permitido/);
  assert.match(ler('app/lib/excursao-publica.mjs'),/\['X-Convite'\]=convite/);
  assert.match(ler('app/lib/excursao-publica.mjs'),/\['X-Inscricao'\]=inscricao/);
  assert.match(ler('app/lib/excursao-publica.mjs'),/referrerPolicy:'no-referrer'/);
  assert.match(ler('app/lib/excursao-publica.mjs'),/cache:'no-store'/);
});

test('convites usam fragmento local, com limpeza após leitura',()=>{
  const form=ler('app/convite/InscricaoConvite.jsx');
  const organ=ler('app/painel/GestaoExcursaoWeb.jsx');
  assert.match(form,/window\.location\.hash/);
  assert.match(form,/history\.replaceState/);
  assert.match(organ,/\/convite#token=/);
  assert.match(organ,/\/excursoes\/\$\{item\.id\}\/convites/);
  assert.match(form,/aceitePrivacidade:true/);
  assert.match(form,/pontoValido\(form\.latitude,form\.longitude\)/);
});

test('inscrição de parada não compartilha endereço privado',()=>{
  const form=ler('app/convite/InscricaoConvite.jsx');
  assert.match(form,/modo==='MULTIPLAS_PARADAS'/);
  assert.match(form,/body\.paradaId=Number\(form\.paradaId\)/);
  assert.match(form,/modo==='PORTA_A_PORTA'/);
});
