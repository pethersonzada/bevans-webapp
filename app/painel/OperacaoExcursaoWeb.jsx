'use client';

import {useEffect,useRef,useState} from 'react';
import MapaOperacional,{pontoValido} from './MapaOperacional';

const nomeEstado={AGUARDANDO:'Aguardando',EMBARCADO:'Embarcado',DESEMBARCADO:'Desembarcado',NAO_EMBARCOU:'Não embarcou'};
export default function OperacaoExcursaoWeb({api,execucao}){
  const id=execucao.id;
  const [operacao,setOperacao]=useState(null),[posicao,setPosicao]=useState(null),[erro,setErro]=useState(''),[gpsAtivo,setGpsAtivo]=useState(false),[busy,setBusy]=useState(false);
  const ultimoEnvio=useRef(0),enviando=useRef(false);
  const ativo=execucao.estado==='EM_ANDAMENTO';

  useEffect(()=>{
    let live=true;
    Promise.resolve().then(async()=>{
      try{
        const r=await api(`/operacoes/EXCURSAO/${id}`);
        if(!Array.isArray(r?.registros)||r.referenciaId!==id)throw Error('Operação de excursão indisponível.');
        if(live)setOperacao(r);
      }catch(e){if(live)setErro(e.message);}
    });
    return()=>{live=false;};
  },[api,id]);
  useEffect(()=>{
    let live=true;
    async function check(){
      if(document.visibilityState!=='visible')return;
      try{const r=await api(`/execucoes-excursao/${id}/localizacao`);
        if(live)setPosicao(r?.estado==='ATUALIZADA'&&pontoValido(r.latitude,r.longitude)?r:{estado:r?.estado||'SEM_LOCALIZACAO'});
      }catch(e){if(live){setPosicao({estado:'INDETERMINADO'});setErro(e.message);}}
    }
    Promise.resolve().then(check);
    const timer=setInterval(check,10000);
    return()=>{live=false;clearInterval(timer);};
  },[api,id]);
  useEffect(()=>{
    if(!ativo||!gpsAtivo||!navigator.geolocation)return;
    let live=true;ultimoEnvio.current=0;
    const watch=navigator.geolocation.watchPosition(async p=>{
      if(!live||enviando.current||document.visibilityState!=='visible'||Date.now()-ultimoEnvio.current<6500)return;
      const {latitude,longitude,accuracy,speed}=p.coords;
      if(!pontoValido(latitude,longitude)||!Number.isFinite(accuracy)||accuracy>5000||Date.now()-p.timestamp>25000)return;
      ultimoEnvio.current=Date.now();enviando.current=true;
      try{
        const body={amostraId:crypto.randomUUID(),latitude,longitude,observadoEm:new Date(p.timestamp).toISOString(),precisao:accuracy};
        if(Number.isFinite(speed)&&speed>=0&&speed<=100)body.velocidade=speed;
        await api(`/execucoes-excursao/${id}/localizacao`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
        if(live)setErro('');
      }catch(e){if(live){setErro('GPS não enviado: '+e.message);setGpsAtivo(false);}}
      finally{enviando.current=false;}
    },e=>{if(live){setErro(e.message);setGpsAtivo(false);}},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
    const hide=()=>{if(document.visibilityState!=='visible')setGpsAtivo(false);};
    document.addEventListener('visibilitychange',hide);
    return()=>{live=false;navigator.geolocation.clearWatch(watch);document.removeEventListener('visibilitychange',hide);};
  },[api,id,gpsAtivo,ativo]);
  async function atualizar(){
    try{const r=await api(`/operacoes/EXCURSAO/${id}`);if(!Array.isArray(r?.registros))throw Error('Painel indisponível.');setOperacao(r);}
    catch(e){setErro(e.message);}
  }
  async function mudar(p,estado){
    if(busy||!window.confirm(`Registrar ${nomeEstado[estado].toLowerCase()} para ${p.nome}?`))return;
    setBusy(true);setErro('');
    try{
      const r=await api(`/operacoes/EXCURSAO/${id}/passageiros/${p.id}/estado`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({estado,versao:p.versao,correcao:false})});
      if(r?.id!==p.id||r.estado!==estado)throw Error('Atualização não confirmada.');
      await atualizar();
    }catch(e){setErro(e.message);await atualizar();}finally{setBusy(false);}
  }
  const pontos=Array.isArray(execucao.pontos)?execucao.pontos.filter(p=>pontoValido(p.latitude,p.longitude)):[];
  return <section className="be-card">
    <div className="be-row"><h3>Operação da excursão #{id}</h3><button type="button" className="be-btn" onClick={atualizar}>Atualizar operação</button></div>
    {erro&&<p className="be-error" role="alert">{erro}</p>}
    {operacao?.contadores&&<p className="be-muted">Esperados: {operacao.contadores.esperados} · Na van: {operacao.contadores.naVan} · Aguardando: {operacao.contadores.aguardando}</p>}
    {ativo&&<button type="button" className="be-btn" onClick={()=>{
      if(!gpsAtivo&&(!window.isSecureContext||!navigator.geolocation)){setErro('GPS exige HTTPS e permissão de localização.');return;}
      setGpsAtivo(v=>!v);
    }}>{gpsAtivo?'Parar GPS da excursão':'Transmitir GPS da excursão'}</button>}
    <p className="be-footnote">GPS opcional. Permissão explícita, intervalo mínimo de envio e interrupção ao ocultar a aba. Não equivale ao rastreamento nativo em segundo plano.</p>
    {(pontos.length>0||posicao?.estado==='ATUALIZADA')&&<MapaOperacional pontos={pontos} posicao={posicao} titulo="Roteiro e GPS da excursão" autorizarRoteamento={pontos.length>1} privado/>}
    {operacao?.registros&&<div className="be-list">{operacao.registros.map(p=><div className="be-item" key={p.id}>
      <strong>{p.nome}</strong><p>{nomeEstado[p.estado]||p.estado}</p>
      {ativo&&<div className="be-actions">{p.estado==='AGUARDANDO'&&<><button type="button" className="be-btn primary" disabled={busy} onClick={()=>mudar(p,'EMBARCADO')}>Confirmar embarque</button><button type="button" className="be-btn" disabled={busy} onClick={()=>mudar(p,'NAO_EMBARCOU')}>Registrar ausência</button></>}
      {p.estado==='EMBARCADO'&&<button type="button" className="be-btn" disabled={busy} onClick={()=>mudar(p,'DESEMBARCADO')}>Confirmar desembarque</button>}</div>}
    </div>)}</div>}
  </section>;
}
