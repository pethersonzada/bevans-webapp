import {NextResponse} from 'next/server';
import {responderComModelo,responderPeloFaq,validarConversa} from '../../lib/assistente-nativo.mjs';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const LIMITE_REQUISICOES=12;
const JANELA_MS=5*60*1000;
const visitantes=new Map();
const CABECALHOS={'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, noarchive','Referrer-Policy':'no-referrer'};

function responder(dados,status=200){
 return NextResponse.json(dados,{status,headers:CABECALHOS});
}
function podeConsultar(request){
 const agora=Date.now();
 if(visitantes.size>2500){
  for(const [ip,info] of visitantes)if(info.ate<=agora)visitantes.delete(ip);
  if(visitantes.size>2500)visitantes.clear();
 }
 const ip=request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'anônimo';
 const info=visitantes.get(ip);
 if(!info||info.ate<=agora){visitantes.set(ip,{ate:agora+JANELA_MS,total:1});return true;}
 info.total++;
 return info.total<=LIMITE_REQUISICOES;
}

export async function POST(request){
 const origem=request.headers.get('origin');
 if(origem){
  let autorizado=false;
  try{
   const recebido=new URL(origem);
   const host=request.headers.get('host')||new URL(request.url).host;
   const destino=new URL(recebido.protocol+'//'+host);
   const locais=['localhost','127.0.0.1'];
   const mesmoLoopback=locais.includes(recebido.hostname)&&locais.includes(destino.hostname)&&recebido.port===destino.port;
   autorizado=(recebido.host===host||recebido.origin===new URL(request.url).origin||mesmoLoopback)&&
    (recebido.protocol==='https:'||locais.includes(recebido.hostname));
  }catch{}
  if(!autorizado)return responder({erro:'Origem da solicitação não autorizada.'},403);
 }
 const tipo=request.headers.get('content-type')||'';
 if(!tipo.toLowerCase().startsWith('application/json'))
  return responder({erro:'Envie uma pergunta em JSON.'},415);
 if(Number(request.headers.get('content-length')||0)>16000)
  return responder({erro:'Mensagem muito extensa.'},413);
 if(!podeConsultar(request))
  return responder({erro:'Muitas mensagens em sequência. Aguarde alguns minutos.'},429);
 let conversa;
 try{
  const bruto=await request.text();
  if(bruto.length>16000)return responder({erro:'Mensagem muito extensa.'},413);
  conversa=validarConversa(JSON.parse(bruto));
 }catch(e){
  return responder({erro:e instanceof SyntaxError?'Formato de mensagem inválido.':e.message},400);
 }

 const habilitada=process.env.BEVANS_ASSISTENTE_IA==='true'&&!!process.env.OPENAI_API_KEY;
 if(habilitada){
  try{
   const result=await responderComModelo(conversa.pergunta,conversa.historico,{
    apiKey:process.env.OPENAI_API_KEY,
    model:process.env.OPENAI_CHAT_MODEL||'gpt-4o-mini',
   });
   return responder(result);
  }catch{
   const result=responderPeloFaq(conversa.pergunta,conversa.historico);
   return responder({...result,aviso:'A geração por IA está indisponível. Mostrando orientação do FAQ.'});
  }
 }
 return responder(responderPeloFaq(conversa.pergunta,conversa.historico));
}
