import test from 'node:test';
import assert from 'node:assert/strict';
import {validarAlvoDeploy,validarMetadadosDeploy,validarWebPublica} from '../app/lib/deploy-readonly-web.mjs';
const sha='a'.repeat(40);
const prod='https://bevans-webapp.vercel.app/';
const preview='https://bevans-webapp-git-staging-pethersonzadas-projects.vercel.app/';
const header={
 'x-content-type-options':'nosniff',
 'x-frame-options':'DENY',
 'permissions-policy':'camera=(), microphone=(), geolocation=(self)',
 'x-robots-tag':'noindex, nofollow, noarchive',
 'referrer-policy':'no-referrer',
};
const fakeFetch=(target,opts={})=>{
 const calls=[],seen={release:0};
 const fetchImpl=async(url,config)=>{
  calls.push({url,config});
  assert.equal(config.method,'GET');
  assert.equal(config.redirect,'manual');
  assert.equal(config.headers.Authorization,undefined);
  const path=new URL(url).pathname;
  if(path==='/api/build-info'){
   seen.release++;
   if(opts.forbidden)return new Response('',{status:401});
   const build=opts.stale&&seen.release===1?'b'.repeat(40):sha;
   return Response.json({commit:build,environment:target},{headers:{'cache-control':'no-store'}});
  }
  if(path==='/login'||path==='/painel'||path==='/convite')
   return new Response('Página protegida',{status:200,headers:opts.badHeaders&&path==='/login'?{...header,'x-robots-tag':'index'}:header});
  if(path==='/opengraph-image'){
   const bytes=new Uint8Array(24);bytes.set([137,80,78,71,13,10,26,10]);
   const view=new DataView(bytes.buffer);view.setUint32(16,opts.badImage?100:1200);view.setUint32(20,630);
   return new Response(bytes,{status:200,headers:{'content-type':opts.badMime?'text/html':'image/png'}});
  }
  if(path==='/robots.txt')return new Response(target==='preview'?'User-agent: *\nDisallow: /':'User-agent: *\nDisallow: /login\nDisallow: /painel\nDisallow: /convite\nDisallow: /api/',{status:200});
  throw new Error('Unexpected URL '+path);
 };
 return {fetchImpl,calls,seen};
};
test('domínio de produção e Preview exigem origem exata, sem segredos ou URL de main',()=>{
 assert.equal(validarAlvoDeploy(prod,'production'),prod.slice(0,-1));
 assert.equal(validarAlvoDeploy(preview,'preview'),preview.slice(0,-1));
 for(const raw of [
  'http://bevans-webapp.vercel.app/','https://bevans-webapp.vercel.app/?token=x',
  'https://user:pass@bevans-webapp.vercel.app/','https://bevans-webapp.vercel.app/convite',
  'https://evil.example/','https://bevans-webapp.vercel.app.evil.net/'
 ])assert.throws(()=>validarAlvoDeploy(raw,'production'));
 assert.throws(()=>validarAlvoDeploy(prod,'preview'));
 assert.throws(()=>validarAlvoDeploy('https://bevans-webapp-git-main-pethersonzadas-projects.vercel.app/','preview'));
 assert.throws(()=>validarAlvoDeploy(preview,'production'));
});
test('metadados precisam corresponder ao SHA/ambiente sem campos extras',()=>{
 assert.equal(validarMetadadosDeploy({commit:sha,environment:'production'},sha,'production'),true);
 assert.throws(()=>validarMetadadosDeploy({commit:sha,environment:'preview'},sha,'production'),/ambiente implantado/);
 assert.throws(()=>validarMetadadosDeploy({commit:'b'.repeat(40),environment:'production'},sha,'production'),/não executa/);
 assert.throws(()=>validarMetadadosDeploy({commit:sha,environment:'production',secret:'oops'},sha,'production'),/campos inesperados/);
});
test('smoke de produção consulta apenas rotas públicas GET e confere cabeçalhos',async()=>{
 const {fetchImpl,calls}=fakeFetch('production');
 const result=await validarWebPublica({baseUrl:prod,target:'production',expectedSha:sha,fetchImpl,attempts:1});
 assert.deepEqual(result.verifiedPaths,['/api/build-info','/login','/painel','/convite','/opengraph-image','/robots.txt']);
 assert.equal(calls.length,6);
 assert.equal(calls.every(x=>x.config.method==='GET'&&!x.config.body),true);
});
test('staging Preview exige ambiente preview e robots bloqueando tudo',async()=>{
 const {fetchImpl}=fakeFetch('preview');
 const result=await validarWebPublica({baseUrl:preview,target:'preview',expectedSha:sha,fetchImpl,attempts:1});
 assert.equal(result.target,'preview');
});
test('smoke suporta propagação de deploy novo sem afirmar READY antes da versão',async()=>{
 const {fetchImpl,seen}=fakeFetch('production',{stale:true});
 const result=await validarWebPublica({baseUrl:prod,target:'production',expectedSha:sha,fetchImpl,attempts:2,intervalMs:0,sleep:async()=>{}});
 assert.equal(seen.release,2);
 assert.equal(result.sha,sha);
});
test('ambiente protegido, SHA obsoleto e SHA inválido bloqueiam liberação',async()=>{
 const f=fakeFetch('preview',{forbidden:true});
 await assert.rejects(()=>validarWebPublica({baseUrl:preview,target:'preview',expectedSha:sha,fetchImpl:f.fetchImpl,attempts:1}),/Deploy protegido/);
 const stale=async url=>Response.json({commit:'b'.repeat(40),environment:'production'},{headers:{'cache-control':'no-store'}});
 await assert.rejects(()=>validarWebPublica({baseUrl:prod,target:'production',expectedSha:sha,fetchImpl:stale,attempts:1}),/não foi publicado/);
 await assert.rejects(()=>validarWebPublica({baseUrl:prod,target:'production',expectedSha:'main',fetchImpl:stale}),/40 caracteres/);
});


test('verificação HTTP falha com imagem de dimensão incorreta, MIME inválido ou login indexável',async()=>{
 for(const opts of [{badImage:true},{badMime:true},{badHeaders:true}]){
  const {fetchImpl}=fakeFetch('production',opts);
  await assert.rejects(
   validarWebPublica({baseUrl:prod,target:'production',expectedSha:sha,fetchImpl,attempts:1}),
   /Imagem social|indexável/,
  );
 }
});
