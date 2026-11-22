import {idSeguro} from './bevans-api.mjs';

const TIPOS=new Set(['VIAGEM','EXCURSAO']);
const ESTADOS=new Set(['AGUARDANDO','EMBARCADO','DESEMBARCADO','NAO_EMBARCOU']);

const inteiro=value=>Number.isSafeInteger(value)&&value>=0;
const falha=()=>new Error('Dados operacionais inválidos. Consulte novamente a operação.');
function tipoValido(tipo,driver){
 if(!TIPOS.has(tipo))throw new Error('Tipo de operação inválido.');
 if(!driver&&tipo!=='VIAGEM')throw new Error('Participantes de excursão usam a credencial individual, não a conta Firebase.');
 return tipo;
}
export function caminhoOperacao(tipo,referenciaId,driver=true){
 return '/operacoes/'+tipoValido(tipo,driver)+'/'+idSeguro(referenciaId);
}
export function validarRegistroOperacional(registro){
 if(!registro||!Number.isSafeInteger(registro.id)||registro.id<=0||
    !ESTADOS.has(registro.estado)||!inteiro(registro.versao))throw falha();
 return registro;
}
export function validarPainelOperacional(painel,tipo,referenciaId){
 const referencia=idSeguro(referenciaId);
 tipoValido(tipo,true);
 if(!painel||painel.referenciaId!==referencia||painel.tipo!==tipo||
    !Array.isArray(painel.registros)||!painel.contadores)throw falha();
 const vistos=new Set();
 for(const registro of painel.registros){
  validarRegistroOperacional(registro);
  if(vistos.has(registro.id))throw falha();
  vistos.add(registro.id);
 }
 const c=painel.contadores;
 const nomes=['esperados','aguardando','naVan','naoEmbarcaram','desembarcados'];
 if(nomes.some(k=>!inteiro(c[k]))||c.esperados!==painel.registros.length||
    c.esperados!==c.aguardando+c.naVan+c.naoEmbarcaram+c.desembarcados)throw falha();
 return painel;
}
export function validarHistoricoOperacional(historia){
 if(!Array.isArray(historia))throw new Error('O histórico operacional retornado está inválido.');
 const seen=new Set();
 for(const evento of historia){
  if(!evento||!Number.isSafeInteger(evento.id)||evento.id<=0||seen.has(evento.id)||
    !ESTADOS.has(evento.novo)||(evento.anterior!==null&&!ESTADOS.has(evento.anterior))||
    !inteiro(evento.versaoRegistro)||typeof evento.correcao!=='boolean'||
    typeof evento.criadoEm!=='string')throw new Error('O histórico operacional retornado está inválido.');
  seen.add(evento.id);
 }
 return historia;
}
export function mensagemErroOperacional(e){
 if(e?.status===401||e?.kind==='session')return 'Sua sessão expirou. Entre novamente para continuar.';
 if(e?.status===403)return 'Você não possui permissão para operar ou consultar este registro.';
 if(e?.status===404)return 'Não há registro operacional disponível para este acesso ou a operação ainda não foi preparada.';
 if(e?.status===409)return 'O estado da operação mudou ou há um conflito. Atualize o painel antes de tentar novamente.';
 if(e?.kind==='timeout')return 'A requisição pode ter sido processada. Confira o estado oficial antes de repetir a ação.';
 if(e?.kind==='network')return 'Falha de conexão. Nenhuma alteração foi presumida; consulte novamente ao reconectar.';
 return e instanceof Error?e.message:'Não foi possível consultar a operação.';
}
export async function consultarOperacaoWeb(api,tipo,referenciaId,driver,signal){
 const path=caminhoOperacao(tipo,referenciaId,driver)+(driver?'':'/minha');
 const data=await api(path,{signal});
 return driver?validarPainelOperacional(data,tipo,referenciaId):validarRegistroOperacional(data);
}
export async function consultarHistoricoWeb(api,tipo,referenciaId,registroId,driver,signal){
 const base=caminhoOperacao(tipo,referenciaId,driver);
 const path=driver?base+'/passageiros/'+idSeguro(registroId)+'/historico':base+'/minha/historico';
 return validarHistoricoOperacional(await api(path,{signal}));
}
export async function alterarEstadoWeb(api,{tipo,referenciaId,registro,driver,estado,correcao=false,motivo=''}){
 const base=caminhoOperacao(tipo,referenciaId,driver);
 validarRegistroOperacional(registro);
 if(!ESTADOS.has(estado))throw new Error('Estado operacional inválido.');
 if(correcao&&!driver)throw new Error('Somente o motorista pode realizar correções auditadas.');
 const justificativa=typeof motivo==='string'?motivo.trim():'';
 if(correcao&&(!justificativa||justificativa.length>500))throw new Error('Informe um motivo de correção com até 500 caracteres.');
 if(!correcao&&justificativa)throw new Error('Motivo só deve ser enviado em uma correção auditada.');
 const path=driver?base+'/passageiros/'+idSeguro(registro.id)+'/estado':base+'/minha/estado';
 const body={estado,versao:registro.versao,correcao,...(correcao?{motivo:justificativa}:{})};
 const response=await api(path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 validarRegistroOperacional(response);
 if(response.id!==registro.id||response.estado!==estado||
    (estado!==registro.estado&&response.versao<=registro.versao)){
  throw new Error('O servidor não confirmou a mudança. Atualize o painel antes de repetir.');
 }
 return response;
}
export function destinosRegulares(estado){
 if(estado==='AGUARDANDO')return ['EMBARCADO','NAO_EMBARCOU'];
 if(estado==='EMBARCADO')return ['DESEMBARCADO'];
 return [];
}
export function permiteCorrecaoParaAguardando(estado){
 return ['EMBARCADO','DESEMBARCADO','NAO_EMBARCOU'].includes(estado);
}
