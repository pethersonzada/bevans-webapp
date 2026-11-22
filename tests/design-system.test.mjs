import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const jsx=readFileSync(new URL('../app/painel/AuthEntry.jsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../app/painel/painel.css',import.meta.url),'utf8');
test('login com estrutura própria e sem cadastro público',()=>{
 assert.match(jsx,/be-auth-story/);
 assert.match(jsx,/be-auth-area/);
 assert.match(jsx,/firebaseSignIn/);
 assert.match(jsx,/firebasePasswordReset/);
 assert.doesNotMatch(jsx,/firebaseSignUp|href="\/cadastro"/);
});
test('painel possui navegação lateral e responsiva e mantém os módulos funcionais',()=>{
 assert.match(jsx,/be-sidebar-nav/);
 assert.match(jsx,/be-mobile-tabs/);
 for(const part of ['Overview','Turmas','Rotas','Solicitacoes','Excursoes','Notificacoes','OperacoesWeb'])assert.match(jsx,new RegExp('<'+part+' '));
});
test('design respeita telas pequenas e acessibilidade',()=>{
 assert.match(css,/@media\(max-width:800px\)/);
 assert.match(css,/@media\(max-width:540px\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(jsx,/aria-current/);
});

test('configurações usam layout próprio sem grid duplo e navegação tem foco visível',()=>{
 const settings=readFileSync(new URL('../app/painel/ConfiguracoesWeb.jsx',import.meta.url),'utf8');
 assert.match(settings,/be-settings-layout/);
 assert.doesNotMatch(settings,/<div className="be-live-stack">/);
 assert.match(css,/\.be-settings-layout>\.be-live-stack\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/\.be-settings-layout>\.be-live-stack>\.be-card:nth-child\(2\)\{grid-row:auto\}/);
 assert.match(css,/\.be-sidebar-nav button:focus-visible/);
 assert.match(css,/\.be-mobile-tabs button:focus-visible/);
 assert.match(css,/scroll-snap-type:x proximity/);
});
