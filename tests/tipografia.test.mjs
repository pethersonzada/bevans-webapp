import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('layout carrega tipografia depois dos estilos de tema',()=>{
 const layout=read('app/layout.js');
 assert.match(layout,/import '\.\/typography\.css'/);
 assert.ok(layout.indexOf("import './typography.css'")>layout.indexOf("import './theme.css'"));
});
test('hierarquia tipografica preserva Geist e padroniza paginas e painel',()=>{
 const css=read('app/typography.css');
 assert.match(css,/font-family:var\(--font-geist\)/);
 assert.match(css,/\.bev-hero h1/);
 assert.match(css,/\.experience-intro h2/);
 assert.match(css,/\.be-app \.be-page-heading h1/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(css,/text-wrap:balance/);
});
