import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import nextConfig from '../next.config.mjs';
import {ambientePrivado,metadadosRobots} from '../app/lib/seo-visibility.mjs';
import {robotsPolicy} from '../app/robots.js';
import {sitemapPolicy} from '../app/sitemap.js';

test('preview e desenvolvimento não podem ser indexados por metadados nem sitemap',()=>{
 for(const envName of ['preview','development']){
  const env={VERCEL_ENV:envName,NEXT_PUBLIC_SITE_URL:'https://bevans-webapp-git-staging.example.invalid'};
  assert.equal(ambientePrivado(env),true);
  assert.deepEqual(metadadosRobots(env),{
   index:false,follow:false,noarchive:true,
   googleBot:{index:false,follow:false,noimageindex:true},
  });
  assert.deepEqual(robotsPolicy(env),{rules:[{userAgent:'*',disallow:'/'}]});
  assert.deepEqual(sitemapPolicy(env),[]);
 }
 const layout=readFileSync(new URL('../app/layout.js',import.meta.url),'utf8');
 assert.match(layout,/robots:\s*metadadosRobots\(process\.env\)/);
});

test('produção preserva indexação institucional e bloqueia páginas privadas',()=>{
 const env={VERCEL_ENV:'production'};
 assert.equal(ambientePrivado(env),false);
 assert.deepEqual(metadadosRobots(env),{index:true,follow:true});
 assert.ok(sitemapPolicy(env).some(x=>new URL(x.url).pathname==='/contato'));
 for(const path of ['/painel','/convite','/api/'])
  assert.ok(robotsPolicy(env).rules[0].disallow.includes(path));
});

test('headers HTTP impedem indexação no Preview e mantêm produção pública',async()=>{
 const old=process.env.VERCEL_ENV;
 try{
  process.env.VERCEL_ENV='preview';
  const preview=await nextConfig.headers();
  const generic=preview.find(x=>x.source==='/:path*');
  const header=Object.fromEntries(generic.headers.map(x=>[x.key.toLowerCase(),x.value]));
  assert.equal(header['x-robots-tag'],'noindex, nofollow, noarchive');
  process.env.VERCEL_ENV='production';
  const prod=await nextConfig.headers();
  const root=Object.fromEntries(prod.find(x=>x.source==='/:path*').headers.map(x=>[x.key.toLowerCase(),x.value]));
  assert.equal(root['x-robots-tag'],undefined);
  const invite=Object.fromEntries(prod.find(x=>x.source==='/convite').headers.map(x=>[x.key.toLowerCase(),x.value]));
  assert.match(invite['x-robots-tag'],/noindex/);
 }finally{
  if(old===undefined)delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV=old;
 }
});
