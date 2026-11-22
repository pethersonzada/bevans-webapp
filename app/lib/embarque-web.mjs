import {idSeguro} from './bevans-api.mjs';

const DIRECOES=new Set(['IDA','VOLTA']);
const STATUS=new Set(['PENDENTE','APROVADO','REJEITADO','CANCELADO']);
const ISO_DATE=/^\d{4}-\d{2}-\d{2}$/;

export function podeEscolherPontoPrivado(rota){
 return rota?.modo==='FLEXIVEL'||rota?.modo==='FIXA'&&rota?.permitePontoExcepcional===true;
}
export function coordenadaEmbarqueValida(p){
 return p&&typeof p.latitude==='number'&&Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90&&
 typeof p.longitude==='number'&&Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180&&
 !(p.latitude===0&&p.longitude===0);
}
export function montarPedidoEmbarque(rota,{dataOperacao,sentido,modo,paradaId,nomePonto,ponto,confirmado,observacao=''}) {
 idSeguro(rota?.id);
 if(!ISO_DATE.test(dataOperacao||'')||Number.isNaN(new Date(dataOperacao+'T00:00:00Z').getTime())||
    !DIRECOES.has(sentido))throw Error('Selecione uma data e um sentido válidos.');
 const note=observacao.trim();
 if(note.length>500)throw Error('A observação deve ter até 500 caracteres.');
 const base={dataOperacao,sentido,...(note?{observacao:note}:{})};
 if(modo==='PARADA'){
  const stop=idSeguro(paradaId);
  if(!Array.isArray(rota.paradas)||!rota.paradas.some(p=>p.id===stop&&p.ativa!==false))throw Error('Escolha uma parada ativa desta rota.');
  return {...base,paradaId:stop};
 }
 if(modo==='PONTO'){
  if(!podeEscolherPontoPrivado(rota))throw Error('Esta rota não permite pedido de ponto particular.');
  if(!confirmado||!coordenadaEmbarqueValida(ponto)||typeof nomePonto!=='string'||!nomePonto.trim()||nomePonto.trim().length>120)
   throw Error('Informe o nome, escolha um ponto no mapa e confirme a localização.');
  return {...base,nomePonto:nomePonto.trim(),latitude:ponto.latitude,longitude:ponto.longitude,pontoConfirmado:true};
 }
 throw Error('Tipo de embarque inválido.');
}
export function validarRespostaEmbarque(resposta,rotaId,status=null) {
 if(!resposta||!Number.isSafeInteger(resposta.id)||resposta.id<=0||
   resposta.rotaId!==idSeguro(rotaId)||!STATUS.has(resposta.status)||(status&&resposta.status!==status))
  throw Error('O servidor não confirmou o pedido. Consulte a situação oficial antes de repetir.');
 return resposta;
}
export function validarCancelamentoEmbarque(resposta,id) {
 if(!resposta||resposta.id!==idSeguro(id)||resposta.status!=='CANCELADO')throw Error('O cancelamento não foi confirmado. Atualize antes de tentar novamente.');
 return resposta;
}
export function mensagemErroEmbarque(e) {
 if(e?.status===401||e?.kind==='session')return 'Sua sessão expirou. Entre novamente.';
 if(e?.status===403)return 'Você não tem autorização para este pedido.';
 if(e?.status===404)return 'Rota ou pedido indisponível para sua conta.';
 if(e?.status===409)return 'O pedido, a vaga ou a viagem mudou. Consulte o histórico antes de repetir.';
 if(e?.kind==='timeout')return 'A resposta demorou; a solicitação pode ter sido registrada. Consulte o histórico antes de tentar novamente.';
 if(e?.kind==='network')return 'Sem conexão. Nenhuma aprovação foi presumida. Consulte novamente ao reconectar.';
 return e instanceof Error?e.message:'Não foi possível realizar a solicitação.';
}
