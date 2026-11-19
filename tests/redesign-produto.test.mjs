import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const jsx=read('app/painel/AuthEntry.jsx');
const css=read('app/painel/painel.css');
test('login usa marca oficial e linguagem objetiva',()=>{
 assert.match(jsx,/bevans-logo-oficial-branco\.png/);
 assert.match(jsx,/Acessar minha conta/);
 assert.doesNotMatch(jsx,/Seu caminho\.|Tudo conectado\.|O que vamos fazer hoje\?/);
 assert.doesNotMatch(jsx,/firebaseSignUp/);
});
test('painel utiliza navegação simples, sem ícones arbitrários ou métricas decorativas',()=>{
 assert.match(jsx,/be-sidebar-nav/);
 assert.match(jsx,/be-overview-list/);
 assert.match(jsx,/be-shortcuts/);
 assert.doesNotMatch(jsx,/be-stat-icon|be-quick-icon|be-nav-icon|be-activity-card/);
 assert.match(jsx,/Promise\.allSettled/);
});
test('navegação e layout móvel têm acesso a sair e identidade visual oficial',()=>{
 assert.match(jsx,/be-mobile-signout/);
 assert.match(jsx,/bevans-simbolo-oficial\.png/);
 assert.match(css,/@media\(max-width:800px\)/);
 assert.match(css,/@media\(max-width:540px\)/);
 assert.match(css,/prefers-reduced-motion/);
});
