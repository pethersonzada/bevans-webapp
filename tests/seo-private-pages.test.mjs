import test from 'node:test';
import assert from 'node:assert/strict';
import robots from '../app/robots.js';
import sitemap from '../app/sitemap.js';
import config from '../next.config.mjs';

test('robots não permite indexação das rotas com dados operacionais/convites',()=>{
 const data=robots();
 const rule=data.rules.find(x=>x.userAgent==='*');
 assert.ok(rule);
 for(const path of ['/painel','/convite','/login','/cadastro','/api/'])assert.ok(rule.disallow.includes(path),path);
 assert.equal(rule.allow,'/');
});

test('sitemap expõe somente páginas institucionais públicas',()=>{
 const paths=sitemap().map(x=>new URL(x.url).pathname);
 assert.ok(paths.includes('/'));
 for(const path of ['/convite','/painel','/login','/cadastro','/api/build-info'])assert.equal(paths.includes(path),false);
});

test('convite tem headers noindex e no-referrer independentes de metadados HTML',async()=>{
 const headers=await config.headers();
 const route=headers.find(x=>x.source==='/convite');
 assert.ok(route);
 const values=Object.fromEntries(route.headers.map(x=>[x.key.toLowerCase(),x.value]));
 assert.equal(values['referrer-policy'],'no-referrer');
 assert.match(values['x-robots-tag'],/noindex/);
 assert.match(values['x-robots-tag'],/noarchive/);
});
