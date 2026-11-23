import {coordenadaValida,validarRotaDirecoes} from './mapa-web.mjs';

export const LIMITE_PONTOS_POR_TRECHO=25;
export const LIMITE_PONTOS_PERCURSO=250;

/** Divide o roteiro mantendo a última parada como primeira do trecho seguinte. */
export function dividirPercurso(pontos){
 if(!Array.isArray(pontos)||pontos.length<2||pontos.length>LIMITE_PONTOS_PERCURSO
   ||pontos.some(p=>!coordenadaValida(p)))
  throw Error('O roteiro contém pontos inválidos ou excede o limite seguro de 250 pontos.');
 const trechos=[];
 for(let inicio=0;inicio<pontos.length-1;inicio+=LIMITE_PONTOS_POR_TRECHO-1)
  trechos.push(pontos.slice(inicio,Math.min(inicio+LIMITE_PONTOS_POR_TRECHO,pontos.length)));
 if(trechos.some(t=>t.length<2||t.length>LIMITE_PONTOS_POR_TRECHO)
  ||trechos.reduce((s,t)=>s+t.length-1,0)!==pontos.length-1)
  throw Error('Não foi possível preservar todos os pontos do roteiro.');
 return trechos;
}

/** Só publica geometria e manobras quando TODOS os trechos foram confirmados. */
export async function calcularPercursoCompleto(pontos,{token,fetcher=fetch,signal}={}){
 if(typeof token!=='string'||!token.trim())throw Error('Configure o token público Mapbox.');
 const trechos=dividirPercurso(pontos),geometria=[],instrucoes=[];
 let distancia=0,segmentos=0;
 for(const trecho of trechos){
  if(signal?.aborted)throw Error('Consulta de percurso cancelada.');
  const coords=trecho.map(p=>p.longitude+','+p.latitude).join(';');
  const url='https://api.mapbox.com/directions/v5/mapbox/driving/'+coords+
   '?geometries=geojson&overview=full&steps=true&access_token='+encodeURIComponent(token);
  const response=await fetcher(url,{cache:'no-store',signal});
  if(!response?.ok)throw Error('Não foi possível consultar todos os trechos do percurso.');
  const result=await response.json();
  if(!validarRotaDirecoes(result,trecho.length))
   throw Error('O Mapbox não confirmou todas as paradas do percurso.');
  const rota=result.routes[0];
  if(!Number.isFinite(rota.distance)||rota.distance<0)
   throw Error('O Mapbox retornou distância inválida.');
  if(!rota.legs.every(leg=>Array.isArray(leg.steps)))
   throw Error('O Mapbox não confirmou as manobras de todas as etapas.');
  const coordsTrecho=rota.geometry.coordinates;
  geometria.push(...(segmentos===0?coordsTrecho:coordsTrecho.slice(1)));
  distancia+=rota.distance;
  instrucoes.push(...rota.legs.flatMap(leg=>leg.steps)
   .filter(step=>typeof step?.maneuver?.instruction==='string')
   .map(step=>({
    instruction:step.maneuver.instruction,
    distance:Number.isFinite(step.distance)?step.distance:0,
    duration:Number.isFinite(step.duration)?step.duration:0
   })));
  segmentos++;
 }
 if(signal?.aborted)throw Error('Consulta de percurso cancelada.');
 if(geometria.length<2||segmentos!==trechos.length||!Number.isFinite(distancia))
  throw Error('O percurso calculado está incompleto.');
 return {geometria,instrucoes,distancia,trechos:segmentos,pontos:pontos.length};
}
