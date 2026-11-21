export function coordenadaValida(p){
 return Boolean(p && typeof p.latitude==='number' && Number.isFinite(p.latitude) && Math.abs(p.latitude)<=90 &&
 typeof p.longitude==='number' && Number.isFinite(p.longitude) && Math.abs(p.longitude)<=180 &&
 !(p.latitude===0&&p.longitude===0));
}
export function normalizarPontos(lista){
 return Array.isArray(lista)?lista.filter(coordenadaValida).map(p=>({
  latitude:p.latitude,longitude:p.longitude,nome:String(p.nome||p.tipo||'Ponto'),tipo:p.tipo||'PARADA'
 })):[];
}
export function gpsRecente(p,now=Date.now()){
 if(!p||p.estado!=='ATUALIZADA'||!coordenadaValida(p))return null;
 const idade=now-Date.parse(p.observadoEm||'');
 return Number.isFinite(idade)&&idade>=-5000&&idade<30000?{latitude:p.latitude,longitude:p.longitude}:null;
}
export function caminhoPosicao(tipo,ref){
 if(!['VIAGEM','EXCURSAO'].includes(tipo))throw Error('Tipo de operação inválido.');
 if(!/^[1-9][0-9]*$/.test(String(ref))||!Number.isSafeInteger(Number(ref)))throw Error('Identificador inválido.');
 return '/'+(tipo==='VIAGEM'?'viagens':'execucoes-excursao')+'/'+Number(ref)+'/localizacao';
}
export function validarRotaDirecoes(response,quantidade){
 const r=response?.routes?.[0];
 return response?.code==='Ok' && Array.isArray(r?.geometry?.coordinates) && r.geometry.coordinates.length>=2 &&
 r.geometry.coordinates.every(c=>Array.isArray(c)&&c.length===2&&Number.isFinite(c[0])&&Math.abs(c[0])<=180&&Number.isFinite(c[1])&&Math.abs(c[1])<=90) &&
 Array.isArray(r.legs)&&r.legs.length===quantidade-1&&
 Array.isArray(response.waypoints)&&response.waypoints.length===quantidade;
}
