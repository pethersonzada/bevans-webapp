// Verificações não destrutivas para um ambiente explicitamente de homologação.
// Não usa identidades, tokens, GPS nem acessa dados privados de contas reais.
const STAGING_MARKER=/(?:staging|homolog|preview|(?:^|[.-])qa(?:[.-]|$)|-git-)/i;

function readStagingURL(name){
 const raw=process.env[name];
 if(!raw)throw Error(name+' não configurada. Não use URLs de produção.');
 const url=new URL(raw);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)
  throw Error(name+' precisa ser URL HTTPS simples, sem credenciais ou parâmetros.');
 if(!STAGING_MARKER.test(url.hostname)||url.hostname==='bevans-webapp.vercel.app')
  throw Error(name+' não identifica explicitamente um ambiente de homologação.');
 url.pathname=url.pathname.replace(/\/$/,'');
 return url;
}

async function check(url,options={}){
 const response=await fetch(url,{...options,cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(12000)});
 return {status:response.status,headers:response.headers};
}

function expectStatus(result,accepted,label){
 if(!accepted.includes(result.status))
  throw Error(label+' retornou HTTP '+result.status+' (esperado '+accepted.join('/')+').');
}

async function run(){
 const web=readStagingURL('BEVANS_STAGING_WEB_URL');
 const api=readStagingURL('BEVANS_STAGING_API_URL');
 if(web.origin===api.origin)throw Error('Use origens web e API separadas para testar CORS corretamente.');
 const page=await check(web.origin+web.pathname+'/painel');
 expectStatus(page,[200],'Página de login');
 const policy=page.headers.get('permissions-policy')||'';
 if(!policy.includes('geolocation=(self)')||!policy.includes('camera=()')||!policy.includes('microphone=()'))
  throw Error('Permissions-Policy não protege câmera/microfone ou impede GPS da própria origem.');
 if(page.headers.get('x-content-type-options')!=='nosniff')throw Error('Cabeçalho nosniff ausente.');
 console.log('OK: página da web de homologação e cabeçalhos de proteção.');

 for(const path of ['/notificacoes','/notificacoes/preferencias','/motorista/contato','/rotas-publicas/minhas']){
  const r=await check(api.origin+api.pathname+path);
  expectStatus(r,[401,403],path+' sem autenticação');
  console.log('OK: '+path+' recusou acesso anônimo ('+r.status+').');
 }

 const preflight=await check(api.origin+api.pathname+'/notificacoes',{
  method:'OPTIONS',
  headers:{'Origin':web.origin,'Access-Control-Request-Method':'GET','Access-Control-Request-Headers':'authorization'},
 });
 expectStatus(preflight,[200,204],'CORS preflight');
 const origin=preflight.headers.get('access-control-allow-origin');
 if(origin!==web.origin)throw Error('CORS deve permitir exatamente a origem de staging, sem wildcard.');
 const methods=(preflight.headers.get('access-control-allow-methods')||'').toUpperCase();
 if(!methods.includes('GET'))throw Error('Preflight não permite GET.');
 const headers=(preflight.headers.get('access-control-allow-headers')||'').toLowerCase();
 if(!headers.includes('authorization'))throw Error('Preflight não permite o cabeçalho Authorization.');
 console.log('OK: CORS da API permite a origem de homologação e Authorization.');
 console.log('Checks não destrutivos concluídos; nenhum login ou operação foi executado.');
}
run().catch(error=>{console.error('Staging smoke falhou: '+error.message);process.exitCode=1;});
