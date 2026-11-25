import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ler=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('página pública de convite carrega seu CSS de forma independente do painel',()=>{
 const pagina=ler('app/convite/page.js');
 const cliente=ler('app/convite/ConviteClient.jsx');
 const css=ler('app/convite/convite.css');
 assert.match(pagina,/import '\.\/convite\.css'/);
 assert.match(cliente,/className="be-shell convite-page"/);
 assert.match(cliente,/className="convite-container"/);
 assert.match(css,/\.convite-page \.be-card/);
 assert.match(css,/\.convite-page \.be-form/);
 assert.match(css,/\.convite-page \.be-btn/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/html\[data-theme="dark"\] \.convite-page/);
});
