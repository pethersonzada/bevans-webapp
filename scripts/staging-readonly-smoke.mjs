import {checkExpectedRelease} from '../app/lib/release-info.mjs';
import {stagingBaseUrl} from '../app/lib/staging-url.mjs';

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
 const expected=process.env.BEVANS_STAGING_EXPECTED_SHA;
 if(typeof expected!=='string'||expected.length!==40||!/^[a-f0-9]{40}$/i.test(expected))throw Error('Defina BEVANS_STAGING_EXPECTED_SHA com os 40 caracteres do commit de homologação.');
 const web=readStagingURL('BEVANS_STAGING_WEB_URL');
 const api=readStagingURL('BEVANS_STAGING_API_URL');
 if(web.origin===api.origin)throw Error('Use origens web e API separadas para testar CORS corretamente.');
 const webBase=stagingBaseUrl(web),apiBase=stagingBaseUrl(api);
 const page=await check(webBase+'/painel');
 expectStatus(page,[200],'Página de login');
 const policy=page.headers.get('permissions-policy')||'';
 if(!policy.includes('geolocation=(self)')||!policy.includes('camera=()')||!policy.includes('microphone=()'))
  throw Error('Permissions-Policy não protege câmera/microfone ou impede GPS da própria origem.');
 if(page.headers.get('x-content-type-options')!=='nosniff')throw Error('Cabeçalho nosniff ausente.');
 console.log('OK: página da web de homologação e cabeçalhos de proteção.');

 const release=await fetch(webBase+'/api/build-info',{
  method:'GET',cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(12000),
 });
 expectStatus(release,[200],'Identidade do build');
 if(!/no-store/i.test(release.headers.get('cache-control')||''))throw Error('Endpoint de build não desabilitou o cache.');
 const build=await release.json().catch(()=>{throw Error('Endpoint de build não retornou JSON válido.');});
 checkExpectedRelease(build,expected);
 if(build.environment!=='preview')throw Error('Homologação exige build marcado como preview; confira o ambiente de implantação.');
 console.log('OK: ambiente preview executa o SHA esperado ('+expected.slice(0,9)+').');

 for(const path of ['/notificacoes','/notificacoes/preferencias','/motorista/contato','/rotas-publicas/minhas']){
  const r=await check(apiBase+path);
  expectStatus(r,[401,403],path+' sem autenticação');
  console.log('OK: '+path+' recusou acesso anônimo ('+r.status+').');
 }

 const preflight=await check(apiBase+'/notificacoes',{
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
