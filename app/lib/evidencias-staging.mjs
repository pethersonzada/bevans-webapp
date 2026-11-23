// Registro sem credenciais, dados pessoais, coordenadas ou tokens.
const SHA=/^[0-9a-f]{40}$/i;
export const HOST_PREVIEW='bevans-webapp-git-staging-pethersonzadas-projects.vercel.app';
const MARCADOR_API=/(?:staging|homolog|preview|(?:^|[.-])qa(?:[.-]|$)|-git-)/i;
const CENARIOS=[
 'staging_sha_e_seguranca',
 'api_anonima_recusada',
 'login_motorista_real',
 'menu_e_logout_motorista',
 'login_passageiro_real_mobile',
 'isolamento_e_logout_passageiro',
 'negacao_cruzada_perfis_e_turmas',
];

export function validarStagingReal({webUrl,apiUrl,expectedSha}){
 if(typeof expectedSha!=='string'||!SHA.test(expectedSha))throw Error('SHA de homologação inválido.');
 const verificar=raw=>{
  if(typeof raw!=='string')throw Error('Origem de homologação não configurada.');
  const url=new URL(raw);
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||url.pathname!=='/'||
    raw!==url.origin&&raw!==url.origin+'/')
   throw Error('Use somente origens HTTPS sem parâmetros ou credenciais.');
  return url;
 };
 const web=verificar(webUrl),api=verificar(apiUrl);
 if(web.hostname!==HOST_PREVIEW)throw Error('Somente a branch staging autorizada pode ser testada.');
 if(web.origin===api.origin||!MARCADOR_API.test(api.hostname)||api.hostname==='bevans-webapp.vercel.app')
  throw Error('A API deve ser um serviço isolado de homologação.');
 return {webOrigin:web.origin,apiOrigin:api.origin,expectedSha:expectedSha.toLowerCase()};
}

export function criarRegistroHomologacao({webUrl,apiUrl,expectedSha,runId,dataIso}){
 const c=validarStagingReal({webUrl,apiUrl,expectedSha});
 if(!/^[1-9][0-9]*$/.test(String(runId)))throw Error('Execução GitHub inválida.');
 const data=new Date(dataIso);
 if(!Number.isFinite(data.getTime()))throw Error('Data do teste inválida.');
 return {
  versao:1,ambiente:'staging-isolado',tipo:'navegador-autenticado-leitura',
  status:'aprovado',data:data.toISOString(),sha:c.expectedSha,
  origemWeb:c.webOrigin,execucaoGitHub:Number(runId),cenarios:CENARIOS,
  limites:[
   'Aprova somente identidade real, navegação por perfil, logout e verificações HTTP sem mutações.',
   'Não homologa embarques, vagas concorrentes, GPS, mapas, excursões ou dados de menores.',
  ],
 };
}
