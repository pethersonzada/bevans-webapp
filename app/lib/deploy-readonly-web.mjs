import {checkExpectedRelease} from './release-info.mjs';

const PREVIEW_HOST=/^bevans-webapp-(?:git-(?!main(?:-|$))[a-z0-9-]+|[a-z0-9]{8,})-pethersonzadas-projects\.vercel\.app$/;
const PROD_HOST='bevans-webapp.vercel.app';
const SHA=/^[0-9a-f]{40}$/i;

export function validarAlvoDeploy(raw,target){
 if(!['production','preview'].includes(target))throw Error('Alvo de deploy não permitido.');
 const base=new URL(raw);
 if(base.protocol!=='https:'||base.username||base.password||base.port||base.search||base.hash||
    base.pathname!=='/'||base.href!==base.origin+'/')throw Error('Informe apenas a origem HTTPS, sem caminho, segredo ou parâmetros.');
 if(target==='production'&&base.hostname!==PROD_HOST)throw Error('Produção só pode consultar o domínio oficial do WebApp.');
 if(target==='preview'&&!PREVIEW_HOST.test(base.hostname))throw Error('Preview deve ser uma implantação específica protegida da Vercel, nunca o domínio de produção.');
 return base.origin;
}

export function validarMetadadosDeploy(info,expected,target){
 checkExpectedRelease(info,expected);
 if(info.environment!==target)throw Error('O ambiente implantado não corresponde ao alvo declarado.');
 if(Object.keys(info).sort().join(',')!=='commit,environment')throw Error('Metadados de deploy expõem campos inesperados.');
 return true;
}

function exigir(cond,mensagem){if(!cond)throw Error(mensagem);}

export async function validarWebPublica({baseUrl,expectedSha,target,fetchImpl=fetch,sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms)),attempts=12,intervalMs=15000}){
 const origin=validarAlvoDeploy(baseUrl,target);
 exigir(typeof expectedSha==='string'&&expectedSha.length===40&&SHA.test(expectedSha),'O SHA esperado deve ter 40 caracteres hexadecimais.');
 const call=async(path)=>{
  const res=await fetchImpl(origin+path,{
   method:'GET',redirect:'manual',cache:'no-store',
   headers:{Accept:path==='/api/build-info'?'application/json':path==='/opengraph-image'?'image/png':'text/html, */*'},
   signal:AbortSignal.timeout(12000),
  });
  return res;
 };
 let versionOk=false;
 for(let i=0;i<attempts;i++){
  let res,info;
  try{
   res=await call('/api/build-info');
   if(res.status===200)info=await res.json();
   if(res.status===200&&info?.commit?.toLowerCase()===expectedSha.toLowerCase()){
    validarMetadadosDeploy(info,expectedSha,target);
    exigir(/no-store/i.test(res.headers.get('cache-control')||''),'Identificação de versão sem no-store.');
    versionOk=true;break;
   }
   if(res.status===401||res.status===403)throw Error('Deploy protegido: configure acesso de teste autorizado, sem desativar SSO.');
   if(res.status>=300&&res.status<400)throw Error('Deploy redirecionou em vez de responder diretamente.');
  }catch(e){
   if(/protegido|redirecionou|ambiente implantado|campos inesperados/.test(e?.message||''))throw e;
   if(i===attempts-1)throw Error('Falha de leitura de versão da implantação: '+e.message);
  }
  if(i<attempts-1)await sleep(intervalMs);
 }
 exigir(versionOk,'O SHA esperado não foi publicado neste ambiente. Não aprovar o release.');
 const pages=['/login','/painel','/convite'];
 for(const page of pages){
  const r=await call(page);
  exigir(r.status===200,page+' não retornou HTTP 200.');
  exigir(r.headers.get('x-content-type-options')==='nosniff',page+' sem nosniff.');
  exigir(r.headers.get('x-frame-options')==='DENY',page+' permite enquadramento.');
  const policy=r.headers.get('permissions-policy')||'';
  exigir(policy.includes('geolocation=(self)')&&policy.includes('camera=()')&&policy.includes('microphone=()'),page+' não possui Permissions-Policy esperada.');
  exigir(r.headers.get('referrer-policy')==='no-referrer',page+' sem referrer-policy estrito.');
  exigir(/noindex/i.test(r.headers.get('x-robots-tag')||''),page+' indexável por ausência de noindex.');
 }
 // Confirma o recurso realmente servido em produção, além dos metadados HTML.
 const social=await call('/opengraph-image');
 exigir(social.status===200,'Imagem social não retornou HTTP 200.');
 exigir(/^image\/png(?:;|$)/i.test(social.headers.get('content-type')||''),'Imagem social sem Content-Type PNG.');
 const raw=await social.arrayBuffer();
 exigir(raw.byteLength>=24,'Imagem social está vazia ou incompleta.');
 const png=new DataView(raw);
 const signature=[137,80,78,71,13,10,26,10];
 exigir(signature.every((value,index)=>png.getUint8(index)===value),'Imagem social sem assinatura PNG.');
 exigir(png.getUint32(16)===1200&&png.getUint32(20)===630,'Imagem social com dimensões incompatíveis.');
 const robots=await call('/robots.txt');
 exigir(robots.status===200,'robots.txt não retornou HTTP 200.');
 const data=await robots.text();
 if(target==='preview')exigir(/Disallow:\s*\//i.test(data),'Preview deve bloquear indexação integral.');
 else {
  for(const path of ['/login','/painel','/convite','/api/'])exigir(data.includes('Disallow: '+path),'robots.txt não protege '+path);
 }
 return {sha:expectedSha.toLowerCase(),target,verifiedPaths:['/api/build-info',...pages,'/opengraph-image','/robots.txt']};
}
