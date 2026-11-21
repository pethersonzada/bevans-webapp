'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import MapaWeb,{coordenadaValida,normalizarPontos} from './MapaWeb';

const err=e=>e instanceof Error?e.message:'Não foi possível concluir a operação.';
const id=v=>{if(!/^[1-9][0-9]*$/.test(String(v))||!Number.isSafeInteger(Number(v)))throw Error('Identificador inválido.');return Number(v);};
const json=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
export function gpsRecente(p,now=Date.now()){
 if(!p||p.estado!=='ATUALIZADA'||!coordenadaValida(p))return null;
 const age=now-Date.parse(p.observadoEm||'');
 return Number.isFinite(age)&&age>=-5000&&age<30000?{latitude:p.latitude,longitude:p.longitude}:null;
}
export function caminhoPosicao(tipo,ref){
 if(!['VIAGEM','EXCURSAO'].includes(tipo))throw Error('Tipo de operação inválido.');
 return '/'+(tipo==='VIAGEM'?'viagens':'execucoes-excursao')+'/'+id(ref)+'/localizacao';
}
function Painel({titulo,children}){return <section className="be-card be-live-card"><h2>{titulo}</h2>{children}</section>;}
function Aviso({error}){return error?<p role="alert" className="be-error">{error}</p>:null;}
function Ponto({value}){return value?.latitude?.toFixed(5)+', '+value?.longitude?.toFixed(5);}
export default function ViagensWeb({api,profile,driver}){
 const [turmas,setTurmas]=useState([]),[turmaId,setTurmaId]=useState('');
 const [tipo,setTipo]=useState('VIAGEM'),[excursaoId,setExcursaoId]=useState(''),[excursoes,setExcursoes]=useState([]),[execucaoId,setExecucaoId]=useState('');
 const [estado,setEstado]=useState(null),[pontos,setPontos]=useState([]),[posicao,setPosicao]=useState(null),[trace,setTrace]=useState(null);
 const [passageiros,setPassageiros]=useState([]),[enderecos,setEnderecos]=useState([]),[confirmacao,setConfirmacao]=useState(null);
 const [sentido,setSentido]=useState('IDA'),[presenca,setPresenca]=useState(''),[ida,setIda]=useState(''),[volta,setVolta]=useState('');
 const [erro,setErro]=useState(''),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false),[sharing,setSharing]=useState(false);
 const [load,setLoad]=useState(false);
 const watch=useRef(null),lastSend=useRef(0),working=useRef(false),current=useRef({api:null,active:null,sharing:false}),sequence=useRef(0);
 const mounted=useRef(true);
 const chosenTurma=turmas.find(t=>String(t.id)===turmaId);
 const active=tipo==='VIAGEM'?(estado?.status==='ATIVA'?estado.viagemId:null):execucaoId;
 const activeType=tipo;
 const clearLocation=()=>{setPosicao(null);setTrace(null);};
 const refresh=useCallback(async()=>{
  if(!turmaId&&tipo==='VIAGEM')return;
  setLoad(true);setErro('');
  try{
   if(tipo==='VIAGEM'){
    const turma=id(turmaId),status=await api('/rota/status-atual?turmaId='+turma);
    if(!status||!['ATIVA','INATIVA'].includes(status.status))throw Error('O servidor não confirmou a situação da turma.');
    setEstado(status);
    if(driver){
     const list=await api('/turmas/'+turma+'/passageiros');
     if(!Array.isArray(list))throw Error('Lista de passageiros inválida.');
     setPassageiros(list);
     if(status.status==='ATIVA'&&id(status.viagemId)){
      const route=await api('/operacoes/VIAGEM/'+id(status.viagemId)+'/roteiro');
      if(!Array.isArray(route)||route.length<2||route.some(p=>!coordenadaValida(p)))throw Error('Roteiro operacional incompleto. Atualize antes de navegar.');
      setPontos(normalizarPontos(route));
     }else setPontos(normalizarPontos([
      {nome:chosenTurma?.origemNome||'Origem',latitude:chosenTurma?.origemLatitude,longitude:chosenTurma?.origemLongitude},
      {nome:chosenTurma?.destinoNome||'Destino',latitude:chosenTurma?.destinoLatitude,longitude:chosenTurma?.destinoLongitude}
     ]));
    }else{
     const [mine,addresses]=await Promise.all([
      api('/rota/minha-confirmacao?usuarioId='+id(profile.id)+'&turmaId='+turma),
      api('/enderecos/usuario/'+id(profile.id))
     ]);
     setConfirmacao(mine);setPresenca(mine?.status||'');setIda(String(mine?.enderecoIda?.id||''));setVolta(String(mine?.enderecoVolta?.id||''));
     setEnderecos(Array.isArray(addresses)?addresses:[]);
     // Passageiros não recebem o roteiro completo nem os endereços de terceiros.
     setPontos([]);
    }
   }else if(excursaoId){
    const data=await api('/excursoes/'+id(excursaoId)+'/execucoes');
    if(!Array.isArray(data))throw Error('Lista de execuções inválida.');
    const running=data.find(x=>x.estado==='EM_ANDAMENTO');
    const selected=data.find(x=>String(x.id)===execucaoId);
    const current=selected||running||null;
    setExecucaoId(current?String(current.id):'');
    setEstado(current?{status:'ATIVA',sentido:current.sentido,viagemId:current.id}:null);
    setPontos(current?normalizarPontos(current.pontos):[]);
   }
  }catch(e){setErro(err(e));}finally{setLoad(false);}
 },[api,driver,profile.id,turmaId,tipo,excursaoId,execucaoId,chosenTurma?.origemNome,chosenTurma?.origemLatitude,chosenTurma?.origemLongitude,chosenTurma?.destinoNome,chosenTurma?.destinoLatitude,chosenTurma?.destinoLongitude]);
 useEffect(()=>{mounted.current=true;const controller=new AbortController();
  Promise.all([
   api(driver?'/turmas/motorista/'+id(profile.id):'/turmas/usuario/'+id(profile.id)+'/todas',{signal:controller.signal}),
   driver?api('/excursoes?pagina=0&tamanho=50',{signal:controller.signal}):Promise.resolve(null)
  ]).then(([a,b])=>{if(!mounted.current||controller.signal.aborted)return;
   setTurmas(Array.isArray(a)?a:[]);setExcursoes(Array.isArray(b?.itens)?b.itens:[]);
  }).catch(e=>{if(!controller.signal.aborted)setErro(err(e));});
  return()=>{mounted.current=false;controller.abort();};
 },[api,driver,profile.id]);
 useEffect(()=>{setEstado(null);setPontos([]);clearLocation();setErro('');},[turmaId,tipo,excursaoId]);
 useEffect(()=>{if(turmaId||tipo==='EXCURSAO'&&excursaoId)refresh();},[turmaId,tipo,excursaoId]); // consulta inicial, atualização manual posterior
 useEffect(()=>{
  if(!active)return;
  let live=true;let task;
  const read=async()=>{
   if(!live||document.visibilityState!=='visible')return;
   try{
    const p=await api(caminhoPosicao(activeType,active));
    if(live){setPosicao(gpsRecente(p));if(p?.estado==='FINALIZADA')setFeedback('Execução finalizada. Compartilhamento encerrado.');}
   }catch(e){if(live){setPosicao(null);setErro(err(e));}}
  };
  read();task=setInterval(read,10000);
  return()=>{live=false;clearInterval(task);setPosicao(null);};
 },[api,active,activeType]);
 current.current={api,active:sharing?active:null,sharing};
 useEffect(()=>{
  if(!sharing||!driver||!active||!navigator.geolocation){return;}
  let live=true;lastSend.current=0;working.current=false;
  const successful=async position=>{
   if(!live||!current.current.sharing||document.visibilityState!=='visible'||working.current)return;
   const {latitude,longitude,accuracy,speed}=position.coords;
   if(!coordenadaValida({latitude,longitude})||!Number.isFinite(accuracy)||accuracy>5000)return;
   const now=Date.now();
   if(now-lastSend.current<5500||now-position.timestamp>29000)return;
   working.current=true;lastSend.current=now;
   const path=caminhoPosicao(activeType,active);
   try{
    const payload={amostraId:crypto.randomUUID(),latitude,longitude,observadoEm:new Date(position.timestamp).toISOString(),precisao:accuracy};
    if(Number.isFinite(speed)&&speed>=0&&speed<=100)payload.velocidade=speed;
    await api(path,json('PUT',payload));
    if(live)setPosicao({latitude,longitude});
   }catch(e){if(live){setErro('Envio GPS: '+err(e));if(e?.status===401||e?.status===403||e?.status===409)setSharing(false);}}
   finally{working.current=false;}
  };
  watch.current=navigator.geolocation.watchPosition(successful,e=>{
   if(live){setErro('Localização indisponível: '+e.message);setSharing(false);}
  },{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  const visibility=()=>{if(document.visibilityState!=='visible'){setSharing(false);setFeedback('Compartilhamento pausado ao sair desta aba.');}};
  document.addEventListener('visibilitychange',visibility);
  return()=>{live=false;document.removeEventListener('visibilitychange',visibility);if(watch.current!==null){navigator.geolocation.clearWatch(watch.current);watch.current=null;}};
 },[sharing,driver,active,activeType,api]);
 useEffect(()=>{if(!active||estado?.status!=='ATIVA')setSharing(false);},[active,estado?.status]);
 async function write(work,success){
  if(busy)return;setBusy(true);setErro('');setFeedback('');
  try{await work();setFeedback(success);await refresh();}
  catch(e){setErro(err(e));}finally{setBusy(false);}
 }
 async function start(){
  if(!chosenTurma)return;
  if(!window.confirm('Iniciar a viagem '+sentido+'? Os passageiros vinculados poderão acompanhar a localização quando você compartilhar o GPS.'))return;
  await write(async()=>{
   const r=await api('/rota/iniciar',json('POST',{turmaId:id(turmaId),sentido,modalidade:'PRIVADA'}));
   const check=await api('/rota/status-atual?turmaId='+id(turmaId));
   if(check?.status!=='ATIVA'||check.sentido!==sentido)throw Error('O servidor não confirmou o início. Consulte o estado antes de tentar novamente.');
  },'Viagem iniciada.');
 }
 async function finish(){
  if(!window.confirm('Encerrar a viagem ativa? Confira antes os embarques e desembarques pendentes.'))return;
  setSharing(false);
  await write(async()=>{
   await api('/rota/encerrar?turmaId='+id(turmaId),{method:'POST'});
   const check=await api('/rota/status-atual?turmaId='+id(turmaId));
   if(check?.status!=='INATIVA')throw Error('O encerramento não foi confirmado.');
  },'Viagem encerrada.');
 }
 async function confirmPresence(){
  if(presenca!=='NAO_VOU'&&presenca!=='LIMPAR'){
   if(['IDA','AMBOS'].includes(presenca)&&!ida)throw setErro('Selecione o endereço da ida.');
   if(['VOLTA','AMBOS'].includes(presenca)&&!volta)throw setErro('Selecione o endereço da volta.');
  }
  const params=new URLSearchParams({usuarioId:String(id(profile.id)),turmaId:String(id(turmaId)),status:presenca});
  if(['IDA','AMBOS'].includes(presenca)&&ida)params.set('enderecoIda',String(id(ida)));
  if(['VOLTA','AMBOS'].includes(presenca)&&volta)params.set('enderecoVolta',String(id(volta)));
  await write(()=>api('/rota/confirmar?'+params,{method:'POST'}),'Confirmação atualizada.');
 }
 async function directions(){
  setErro('');
  const token=process.env.NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN;
  if(!token)return setErro('Configure o token público Mapbox.');
  if(pontos.length<2)return setErro('Roteiro com menos de dois pontos.');
  if(pontos.length>25)return setErro('Roteiro excede o limite de 25 coordenadas da API Directions. Nenhuma parada será omitida.');
  try{
   const coordinates=pontos.map(p=>p.longitude+','+p.latitude).join(';');
   const url='https://api.mapbox.com/directions/v5/mapbox/driving/'+coordinates+'?geometries=geojson&overview=full&steps=true&access_token='+encodeURIComponent(token);
   const response=await fetch(url,{cache:'no-store'});
   const result=await response.json();
   const route=result?.routes?.[0];
   if(!response.ok||result?.code!=='Ok'||!Array.isArray(route?.geometry?.coordinates)||!Array.isArray(route?.legs)||route.legs.length!==pontos.length-1)throw Error('O Mapbox não confirmou todas as paradas desta rota.');
   setTrace(route.geometry.coordinates);
   setFeedback('Trajeto rodoviário calculado. Distância estimada: '+(route.distance/1000).toFixed(1)+' km.');
  }catch(e){setTrace(null);setErro(err(e));}
 }
 return <section className="be-section be-live">
  <div className="be-row"><h2>Mapa e viagens</h2><button type="button" className="be-btn" disabled={busy||load} onClick={refresh}>Atualizar estado</button></div>
  <p className="be-muted">Viagens, presença, embarques e GPS autorizados pelo backend. Localização no navegador exige HTTPS e permissão explícita.</p>
  <Aviso error={erro}/>{feedback&&<p className="be-alert" role="status">{feedback}</p>}
  <div className="be-fieldset">
   {driver&&<label>Modalidade<select value={tipo} onChange={e=>{setTipo(e.target.value);setSharing(false);}}><option value="VIAGEM">Turma fixa / viagem</option><option value="EXCURSAO">Excursão</option></select></label>}
   {tipo==='VIAGEM'?<label>Turma<select value={turmaId} onChange={e=>{setSharing(false);setTurmaId(e.target.value);}}><option value="">Selecione uma turma</option>{turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></label>:
   <label>Excursão<select value={excursaoId} onChange={e=>{setSharing(false);setExcursaoId(e.target.value);}}><option value="">Selecione uma excursão</option>{excursoes.map(e=><option value={e.id} key={e.id}>{e.titulo}</option>)}</select></label>}
   {driver&&tipo==='VIAGEM'&&<label>Sentido<select value={sentido} onChange={e=>setSentido(e.target.value)}><option value="IDA">Ida</option><option value="VOLTA">Volta</option></select></label>}
  </div>
  {tipo==='VIAGEM'&&turmaId||tipo==='EXCURSAO'&&excursaoId?<div className="be-live-stack">
   <Painel titulo="Execução atual">
    <p><strong>{estado?.status==='ATIVA'?'Viagem ativa':'Sem viagem ativa'}</strong>{estado?.sentido?' · '+estado.sentido:''}{active?' · #'+active:''}</p>
    <div className="be-actions">
     {driver&&tipo==='VIAGEM'&&estado?.status!=='ATIVA'&&<button className="be-btn primary" disabled={busy} onClick={start}>Iniciar {sentido==='IDA'?'ida':'volta'}</button>}
     {driver&&tipo==='VIAGEM'&&estado?.status==='ATIVA'&&<button className="be-btn danger" disabled={busy} onClick={finish}>Encerrar viagem</button>}
     {driver&&active&&<button className={'be-btn '+(sharing?'danger':'primary')} onClick={()=>{setErro('');setSharing(x=>!x);}}>{sharing?'Parar compartilhamento GPS':'Compartilhar GPS nesta aba'}</button>}
     {driver&&pontos.length>=2&&<button type="button" className="be-btn" onClick={directions}>Traçar percurso rodoviário</button>}
    </div>
    <p className="be-muted">GPS: {posicao?'posição recente ('+<Ponto value={posicao}/>+')':'sem localização atual (aguardando ou expirada)'}. Consulta a cada 10 segundos com a aba visível.</p>
    {driver&&sharing&&<p className="be-alert">Seu GPS está sendo enviado durante esta viagem. A transmissão para ao fechar, ocultar a aba ou clicar em parar. O navegador não fornece rastreamento confiável em segundo plano.</p>}
   </Painel>
   <Painel titulo="Mapa da operação">
    <MapaWeb pontos={pontos} posicao={posicao} rota={trace}/>
    {driver&&pontos.length>0&&<ol className="be-map-stops">{pontos.map((p,i)=><li key={i}><strong>{p.nome}</strong> ({p.tipo})</li>)}</ol>}
   </Painel>
   {!driver&&tipo==='VIAGEM'&&<Painel titulo="Minha presença de hoje">
    <p className="be-muted">Status atual: <strong>{confirmacao?.status||'Sem resposta'}</strong>. Confirme seus endereços cadastrados. A API valida se a turma utiliza coleta por paradas.</p>
    <div className="be-fieldset">
     <label>Resposta<select value={presenca} onChange={e=>setPresenca(e.target.value)}><option value="">Selecione</option><option value="AMBOS">Vou e volto</option><option value="IDA">Só ida</option><option value="VOLTA">Só volta</option><option value="NAO_VOU">Não vou</option><option value="LIMPAR">Limpar resposta</option></select></label>
     {['IDA','AMBOS'].includes(presenca)&&<label>Endereço da ida<select value={ida} onChange={e=>setIda(e.target.value)}><option value="">Selecione</option>{enderecos.map(e=><option key={e.id} value={e.id}>{e.apelido||e.rua}</option>)}</select></label>}
     {['VOLTA','AMBOS'].includes(presenca)&&<label>Endereço da volta<select value={volta} onChange={e=>setVolta(e.target.value)}><option value="">Selecione</option>{enderecos.map(e=><option key={e.id} value={e.id}>{e.apelido||e.rua}</option>)}</select></label>}
    </div>
    <button type="button" className="be-btn primary" disabled={busy||!presenca} onClick={confirmPresence}>Salvar presença</button>
   </Painel>}
   {driver&&tipo==='VIAGEM'&&<Painel titulo="Passageiros e confirmação"><p>{passageiros.length} passageiro(s) vinculados</p><div className="be-list">{passageiros.map(p=><div className="be-item" key={p.id}><strong>{p.nome}</strong> · {p.status||'Sem resposta'}</div>)}</div></Painel>}
  </div>:<p className="be-muted">Selecione uma turma ou excursão para consultar a operação.</p>}
 </section>;
}
