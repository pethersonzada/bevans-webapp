import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('página pública apresenta produto e repositórios, sem inventar dados operacionais',()=>{
 const page=read('app/page.js'),hero=read('app/components/Hero.js'),project=read('app/components/ProjectSection.js');
 assert.match(page,/<ProjectSection\s*\/>/);
 assert.match(page,/home-product\.css/);
 assert.match(hero,/Trajeto ilustrativo/);
 assert.match(hero,/href="\/login"/);
 assert.match(project,/id="projeto"/);
 for(const repo of ['bevans-frontend','bevans-backend','bevans-webapp','bevans-agente'])assert.ok(project.includes(repo));
 assert.match(project,/Miguel Petherson/);
 assert.match(project,/avatars\.githubusercontent\.com\/u\/147556184/);
 assert.match(read('next.config.mjs'),/avatars\.githubusercontent\.com/);
});
test('página pública possui estilos responsivos e tema escuro isolados',()=>{
 const css=read('app/home-product.css');
 assert.match(css,/\.bev-home \.bev-hero-inner/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/html\[data-theme="dark"\] \.bev-home/);
 assert.match(css,/\.bev-project-grid/);
});
