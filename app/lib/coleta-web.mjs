import {coordenadaValida} from './mapa-web.mjs';
const id=x=>Number.isSafeInteger(x)&&x>0;
export function normalizarColeta(modo,versao,paradas=[]){
 if(!Number.isSafeInteger(versao)||versao<0)throw Error('Versão de coleta inválida.');
 if(!['PORTA_A_PORTA','PARADAS_DEFINIDAS'].includes(modo))throw Error('Modo de coleta inválido.');
 if(modo==='PORTA_A_PORTA')return {modo,versao,paradas:[]};
 if(!Array.isArray(paradas)||paradas.length<1||paradas.length>50)throw Error('A coleta exige entre 1 e 50 paradas.');
 const usados=new Set();
 return {modo,versao,paradas:paradas.map(p=>{
  if(!p||typeof p.nome!=='string'||!p.nome.trim()||!coordenadaValida(p))throw Error('Parada sem nome ou coordenadas confirmadas.');
  if(p.id!=null&&(!id(p.id)||usados.has(p.id)))throw Error('Identificador de parada inválido ou repetido.');
  if(p.id!=null)usados.add(p.id);
  if(p.horario!=null&&p.horario!==''&&!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(p.horario))throw Error('Horário da parada inválido.');
  return {...(p.id==null?{}:{id:p.id}),nome:p.nome.trim(),latitude:p.latitude,longitude:p.longitude,horario:p.horario||null,pontoConfirmado:true};
 })};
}
export function validarEscolha(config,paradaId){
 if(config?.modo!=='PARADAS_DEFINIDAS'||!Number.isSafeInteger(config.versao)||config.versao<0)throw Error('Configuração inválida para seleção.');
 if(!id(paradaId)||!Array.isArray(config.paradas)||!config.paradas.some(p=>p.id===paradaId))throw Error('Selecione uma parada disponível nesta turma.');
 return {paradaId,versao:config.versao};
}
