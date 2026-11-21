'use client';

import {useEffect,useRef,useState} from 'react';
import MapaOperacional,{pontosRoteiroOperacional,pontoValido} from './MapaOperacional';

const validoId=v=>Number.isSafeInteger(Number(v))&&Number(v)>0;
const statusLabel={ATUALIZADA:'Atualizada',SEM_LOCALIZACAO:'Sem posição disponível',DESATUALIZADA:'Posição expirada',FINALIZADA:'Viagem finalizada'};
export default function AcompanhamentoViagem({api,turmaId,viagem,driver,onRefresh}) {
  const id=viagem?.status==='ATIVA'&&validoId(viagem.viagemId)?Number(viagem.viagemId):null;
  const [sentido,setSentido]=useState('IDA'),[posicao,setPosicao]=useState(null),[roteiro,setRoteiro]=useState([]);
  const [erro,setErro]=useState(''),[gpsErro,setGpsErro]=useState(''),[ocupado,setOcupado]=useState(false),[gpsAtivo,setGpsAtivo]=useState(false);
  const ultimoEnvio=useRef(0),enviando=useRef(false);

  useEffect(()=>{
    if(!id)return;
    let vivo=true;
    async function carregar() {
      if(document.visibilityState!=='visible')return;
      try {
        const r=await api(`/viagens/${id}/localizacao`);
        if(vivo)setPosicao(r?.estado==='ATUALIZADA'&&pontoValido(r.latitude,r.longitude)?r:{estado:r?.estado||'SEM_LOCALIZACAO'});
      } catch(e){if(vivo){setPosicao({estado:'INDETERMINADO'});setErro(e.message);}}
    }
    async function buscarRoteiro(){
      if(!driver)return;
      try{
        const r=await api(`/operacoes/VIAGEM/${id}/roteiro`);
        if(vivo)setRoteiro(pontosRoteiroOperacional(r));
      }catch(e){if(vivo)setErro(`Roteiro indisponível: ${e.message}`);}
    }
    Promise.resolve().then(()=>{if(vivo){setPosicao(null);setRoteiro([]);setErro('');carregar();buscarRoteiro();}});
    const timer=setInterval(carregar,10000);
    const visible=()=>{if(document.visibilityState==='visible')carregar();};
    document.addEventListener('visibilitychange',visible);
    return()=>{vivo=false;clearInterval(timer);document.removeEventListener('visibilitychange',visible);};
  },[id,driver,api]);

  useEffect(()=>{
    if(!gpsAtivo||!driver||!id||!navigator.geolocation)return;
    let ativo=true;
    ultimoEnvio.current=0;
    const watch=navigator.geolocation.watchPosition(async p=>{
      if(!ativo||document.visibilityState!=='visible'||enviando.current||Date.now()-ultimoEnvio.current<6500)return;
      const {latitude,longitude,accuracy,speed}=p.coords;
      if(!pontoValido(latitude,longitude)||!Number.isFinite(accuracy)||accuracy>5000||Date.now()-p.timestamp>25000)return;
      ultimoEnvio.current=Date.now();
      enviando.current=true;
      try{
        const body={amostraId:crypto.randomUUID(),latitude,longitude,observadoEm:new Date(p.timestamp).toISOString(),precisao:accuracy};
        if(speed!==null&&Number.isFinite(speed)&&speed>=0&&speed<=100)body.velocidade=speed;
        await api(`/viagens/${id}/localizacao`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),timeoutMs:10000});
        if(ativo)setGpsErro('');
      }catch(e){if(ativo)setGpsErro(`Falha ao transmitir GPS: ${e.message}`);}
      finally{enviando.current=false;}
    },e=>{if(ativo){setGpsErro(e.message||'Sem acesso à localização.');setGpsAtivo(false);}},{enableHighAccuracy:true,maximumAge:0,timeout:15000});
    const hidden=()=>{if(document.visibilityState!=='visible')setGpsAtivo(false);};
    document.addEventListener('visibilitychange',hidden);
    return()=>{ativo=false;navigator.geolocation.clearWatch(watch);document.removeEventListener('visibilitychange',hidden);};
  },[gpsAtivo,driver,id,api]);

  async function start() {
    if(ocupado||!validoId(turmaId)||!driver)return;
    if(!window.confirm(`Iniciar viagem privada de ${sentido==='IDA'?'ida':'volta'} para a turma selecionada?`))return;
    setOcupado(true);setErro('');
    try{
      await api('/rota/iniciar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({turmaId:Number(turmaId),sentido,modalidade:'PRIVADA'})});
      await onRefresh();
    }catch(e){setErro(`Falha ao iniciar: ${e.message}. Consulte o estado antes de repetir.`);}
    finally{setOcupado(false);}
  }
  async function finish(){
    if(ocupado||!id||!driver)return;
    if(!window.confirm('Encerrar a viagem ativa? A localização deixará de ser compartilhada.'))return;
    setOcupado(true);setErro('');
    try{
      const op=await api(`/operacoes/VIAGEM/${id}`);
      if(!op?.contadores||!Number.isSafeInteger(op.contadores.naVan))throw Error('Não foi possível verificar os passageiros embarcados.');
      if(op.contadores.naVan>0)throw Error('Ainda há passageiros embarcados. Registre o desembarque real antes de encerrar.');
      const atual=await api(`/rota/status-atual?turmaId=${Number(turmaId)}`);
      if(atual?.status!=='ATIVA'||atual?.viagemId!==id)throw Error('A viagem mudou. Atualize o estado antes de encerrar.');
      await api(`/rota/encerrar?turmaId=${Number(turmaId)}`,{method:'POST'});
      setGpsAtivo(false);
      await onRefresh();
    }catch(e){setErro(`Não foi possível encerrar: ${e.message}`);}
    finally{setOcupado(false);}
  }

  if(!validoId(turmaId)||!viagem)return null;
  return <section className="be-section" aria-label="Mapa e GPS da viagem">
    <div className="be-row"><h2>Mapa e GPS</h2>{id&&<span className="be-chip">Viagem #{id}</span>}</div>
    {erro&&<p role="alert" className="be-error">{erro}</p>}
    {!id?driver?<div className="be-card"><p>Não há viagem ativa. Inicie a operação privada quando a turma estiver pronta, com presenças e pontos válidos.</p>
      <div className="be-fieldset"><label>Sentido<select value={sentido} onChange={e=>setSentido(e.target.value)}><option value="IDA">Ida</option><option value="VOLTA">Volta</option></select></label>
      <button type="button" className="be-btn primary" disabled={ocupado} onClick={start}>{ocupado?'Iniciando…':'Iniciar viagem privada'}</button></div></div>:<p className="be-muted">O mapa ao vivo aparece depois que o motorista iniciar a viagem.</p>:
    <>
      <div className="be-card"><p><strong>GPS:</strong> {statusLabel[posicao?.estado]||'Aguardando consulta autenticada'}. Atualização a cada 10 segundos enquanto a aba está visível.</p>
      {posicao?.estado==='ATUALIZADA'&&<p className="be-muted">Última posição: {new Date(posicao.observadoEm).toLocaleString('pt-BR')} · Precisão: {Math.round(posicao.precisao||0)} m</p>}
      {driver&&<div className="be-actions">
        <button type="button" className="be-btn" disabled={ocupado} onClick={()=>{if(!gpsAtivo && (!window.isSecureContext||!navigator.geolocation)){setGpsErro('A transmissão exige HTTPS e permissão de localização.');return;}setGpsErro('');setGpsAtivo(p=>!p);}}>{gpsAtivo?'Parar transmissão deste dispositivo':'Transmitir GPS deste dispositivo'}</button>
        <button type="button" className="be-btn danger" disabled={ocupado} onClick={finish}>{ocupado?'Processando…':'Encerrar viagem'}</button>
      </div>}
      {driver&&<p className="be-footnote">Ao ativar, a posição deste navegador será enviada à API da viagem. Use somente no dispositivo do motorista durante o trajeto. Ao ocultar a aba, a transmissão é interrompida. O navegador não garante GPS em segundo plano.</p>}
      {gpsErro&&<p role="alert" className="be-error">{gpsErro}</p>}</div>
      {(roteiro.length>0||posicao?.estado==='ATUALIZADA')?<MapaOperacional pontos={driver?roteiro:[]} posicao={posicao} titulo={driver?'Roteiro oficial e posição da van':'Posição atual da van'}/>:<p className="be-muted">{driver?'Sem roteiro acessível ou GPS recente.':'A localização só aparece enquanto há GPS recente e autorizado.'}</p>}
      {driver&&roteiro.length>0&&<p className="be-footnote">O roteiro é o snapshot da viagem. Confira a ordem oficial e use navegação apropriada para dirigir; as linhas no mapa não seguem as ruas.</p>}
    </>}
  </section>;
}
