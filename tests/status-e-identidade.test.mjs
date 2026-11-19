import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
test('usa o logo oficial no login e na barra lateral',()=>{
 const auth=read('app/painel/AuthEntry.jsx');
 assert.doesNotMatch(auth,/be-brand-symbol[^>]*>B</);
 assert.match(auth,/bevans-logo-oficial-branco\.png/);
 assert.match(auth,/bevans-simbolo-oficial\.png/);
 assert.ok(existsSync(new URL('public/images/bevans-logo-oficial-branco.png',root)));
 assert.ok(existsSync(new URL('public/images/bevans-simbolo-oficial.png',root)));
});
test('excursões não aparecem como modalidade em desenvolvimento',()=>{
 const plans=read('app/components/Pricing.js');
 const excursions=read('app/excursoes/page.js');
 assert.match(plans,/FLUXO OPERACIONAL DISPONÍVEL/);
 assert.match(excursions,/FLUXO OPERACIONAL DISPONÍVEL/);
 assert.doesNotMatch(excursions,/PRÉVIA DO PRODUTO|CONSTRUINDO A PRÓXIMA MODALIDADE|SEM INSCRIÇÕES REAIS/);
});
test('cadastro público não é anunciado no rodapé e FAQ distingue canais',()=>{
 assert.doesNotMatch(read('app/components/Footer.js'),/href="\/cadastro"/);
 assert.match(read('app/components/Faq.js'),/cadastro público permanece fechado/);
});

test('modalidades usam rótulos sem faixas de status duplicadas',()=>{
 const pricing=read('app/components/Pricing.js');
 assert.match(pricing,/DISPONÍVEL NO APP/);
 assert.match(pricing,/FLUXO OPERACIONAL DISPONÍVEL/);
 assert.match(pricing,/EVOLUÇÃO FUTURA/);
 assert.doesNotMatch(pricing,/new-price-availability|new-price-status-dot/);
});
