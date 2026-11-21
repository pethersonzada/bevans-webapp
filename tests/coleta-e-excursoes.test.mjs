import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const text=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('coleta privada usa versionamento de serviço e escolhe parada própria',()=>{
 const c=text('app/painel/ColetaPrivadaWeb.jsx');
 assert.match(c,/\/turmas\/\$\{turmaId\}\/coleta\/\$\{sentido\}/);
 assert.match(c,/modo==='PARADAS_DEFINIDAS'/);
 assert.match(c,/pontoConfirmado:true/);
 assert.match(c,/versao:config\.versao/);
 assert.match(c,/\/minha-parada/);
 assert.match(c,/escolhidaId/);
});

test('presença diária valida parada escolhida para turmas que usam paradas definidas',()=>{
 const c=text('app/painel/PresencaWeb.jsx');
 assert.match(c,/coletas\.IDA\.escolhidaId/);
 assert.match(c,/coletas\.VOLTA\.escolhidaId/);
 assert.match(c,/coletas\.IDA\?\.modo!=='PARADAS_DEFINIDAS'/);
 assert.match(c,/coletas\.VOLTA\?\.modo!=='PARADAS_DEFINIDAS'/);
});

test('excursões têm estado/versão e confirmação explícita de publicação',()=>{
 const c=text('app/painel/GestaoExcursaoWeb.jsx');
 assert.match(c,/versao:item\.versao/);
 assert.match(c,/window\.confirm/);
 assert.match(c,/\/excursoes\/\$\{item\.id\}\/publicacao/);
 assert.match(c,/\/excursoes\/\$\{item\.id\}\/coleta/);
 assert.match(c,/\/excursoes\/\$\{item\.id\}\/inscricoes/);
 assert.match(c,/\/operacoes\/EXCURSAO/);
});

test('gestão de turmas exige confirmação e usa endpoints próprios',()=>{
 const c=text('app/painel/GestaoTurmaWeb.jsx');
 assert.match(c,/\/turmas\/\$\{id\}\/regenerar-codigo/);
 assert.match(c,/\/turmas\/\$\{id\}\/passageiros/);
 assert.match(c,/\/turmas\/\$\{id\}\/alunos\/\$\{p\.id\}/);
 assert.match(c,/window\.confirm/);
});
