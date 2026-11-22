'use client';
import {useEffect,useRef,useState} from 'react';
import {array,ep,idSeguro,pagina} from '../lib/bevans-api.mjs';
import {
 alterarEstadoWeb,consultarHistoricoWeb,consultarOperacaoWeb,destinosRegulares,
 mensagemErroOperacional,permiteCorrecaoParaAguardando,
} from '../lib/operacao-web.mjs';

const LABELS={AGUARDANDO:'Aguardando',EMBARCADO:'Embarcado',DESEMBARCADO:'Desembarcado',NAO_EMBARCOU:'Não embarcou'};
const erro=e=>mensagemErroOperacional(e);
const nomeEstado=v=>LABELS[v]||v||'Não informado';
const dataHora=v=>{if(!v)return 'Data indisponível';const d=new Date(v);return Number.isNaN(d.getTime())?'Data indisponível':d.toLocaleString('pt-BR');};

export default function OperacoesWeb({api,profile,driver}){
 const [turmas,setTurmas]=useState([]),[excursoes,setExcursoes]=useState([]),[execucoes,setExecucoes]=useState([]);
 const [tipo,setTipo]=useState('VIAGEM'),[turmaId,setTurmaId]=useState(''),[excursaoId,setExcursaoId]=useState(''),[execucaoId,setExecucaoId]=useState('');
 const [estado,setEstado]=useState(null),[painel,setPainel]=useState(null),[historia,setHistoria]=useState(null);
 const [correcao,setCorrecao]=useState(null),[loading,setLoading]=useState(false),[histLoading,setHistLoading]=useState(false),[busy,setBusy]=useState(false);
 const [error,setError]=useState(''),[message,setMessage]=useState('');
 const sequence=useRef(0),writing=useRef(false),live=useRef(true);
 const selection=tipo+'|'+turmaId+'|'+excursaoId+'|'+execucaoId+'|'+profile.id;
 const activeKey=useRef(selection);activeKey.current=selection;

 useEffect(()=>{
  live.current=true;
  const controller=new AbortController();
  Promise.all([
   api(driver?ep.turmasMotorista(profile.id):ep.turmasPassageiro(profile.id),{signal:controller.signal}),
   driver?api('/excursoes?pagina=0&tamanho=50',{signal:controller.signal}):Promise.resolve(null),
  ]).then(([groups,trips])=>{
   if(controller.signal.aborted)return;
   setTurmas(array(groups,'turmas'));
   if(driver)setExcursoes(pagina(trips));
  }).catch(e=>{if(!controller.signal.aborted)setError(erro(e));});
  return()=>{live.current=false;controller.abort();sequence.current++;};
 },[api,driver,profile.id]);

 function invalidate(){
  sequence.current++;
  setEstado(null);setPainel(null);setHistoria(null);setCorrecao(null);
  setError('');setMessage('');
 }

 useEffect(()=>{
  if(tipo!=='EXCURSAO'||!driver||!excursaoId)return;
  const controller=new AbortController();
  api('/excursoes/'+idSeguro(excursaoId)+'/execucoes',{signal:controller.signal})
   .then(result=>{if(!controller.signal.aborted)setExecucoes(array(result,'execuções'));})
   .catch(e=>{if(!controller.signal.aborted){setExecucoes([]);setError(erro(e));}});
  return()=>controller.abort();
 },[api,tipo,driver,excursaoId]);

 async function consultar(keepError=false){
  if(tipo==='VIAGEM'&&!turmaId||tipo==='EXCURSAO'&&(!driver||!execucaoId))return false;
  const call=++sequence.current,key=activeKey.current;
  setLoading(true);setPainel(null);setEstado(null);setHistoria(null);setCorrecao(null);
  if(!keepError)setError('');
  try{
   let reference,activity;
   if(tipo==='VIAGEM'){
    const status=await api(ep.estadoTurma(idSeguro(turmaId)));
    if(!status||!['ATIVA','INATIVA'].includes(status.status))throw Error('Estado da viagem inválido.');
    reference=status.status==='ATIVA'?status.viagemId:status.ultimaViagemId;
    activity={ativo:status.status==='ATIVA',descricao:status.status==='ATIVA'?'Viagem em andamento':'Nenhuma viagem ativa',sentido:status.sentido||null,referencia:reference||null};
   }else{
    const run=execucoes.find(x=>String(x.id)===execucaoId);
    if(!run)throw Error('Execução não encontrada na excursão autorizada. Atualize a lista.');
    reference=run.id;
    activity={ativo:run.estado==='EM_ANDAMENTO',descricao:'Execução '+run.estado,referencia:reference,sentido:run.sentido||null};
   }
   let data=null;
   if(reference)data=await consultarOperacaoWeb(api,tipo,reference,driver);
   if(!live.current||sequence.current!==call||activeKey.current!==key)return false;
   setEstado(activity);setPainel(data);
   return true;
  }catch(e){
   if(live.current&&sequence.current===call&&activeKey.current===key){
    setEstado(null);setPainel(null);setError(erro(e));
   }
   return false;
  }finally{
   if(live.current&&sequence.current===call)setLoading(false);
  }
 }

 async function historico(registro){
  if(!estado?.referencia||histLoading)return;
  const key=activeKey.current,request=sequence.current;
  setHistoria(null);setHistLoading(true);setError('');
  try{
   const events=await consultarHistoricoWeb(api,tipo,estado.referencia,driver?registro.id:null,driver);
   if(live.current&&activeKey.current===key&&sequence.current===request)setHistoria({registroId:registro.id,events});
  }catch(e){
   if(live.current&&activeKey.current===key&&sequence.current===request)setError(erro(e));
  }finally{if(live.current&&activeKey.current===key&&sequence.current===request)setHistLoading(false);}
 }

 async function change(registro,target,withCorrection=false,motivo=''){
  if(writing.current)return;
  if(!estado?.ativo)return setError('A operação não está ativa. Alterações são bloqueadas pelo backend.');
  if(!driver&&withCorrection)return setError('A correção de registros é exclusiva do motorista.');
  if(withCorrection&&(!motivo.trim()||motivo.trim().length>500))return setError('Informe um motivo de correção com até 500 caracteres.');
  const action=withCorrection?'Corrigir registro para '+nomeEstado(target):'Confirmar '+nomeEstado(target);
  if(!window.confirm(action+'? O servidor registrará a autoria e o histórico.'))return;
  const key=activeKey.current;
  writing.current=true;setBusy(true);setError('');setMessage('');
  try{
   await alterarEstadoWeb(api,{tipo,referenciaId:estado.referencia,registro,driver,estado:target,correcao:withCorrection,motivo});
   if(live.current&&activeKey.current===key){
    const ok=await consultar();
    if(ok)setMessage('Alteração confirmada pelo servidor. Estado e contadores atualizados.');
    else setError('A alteração foi confirmada, mas a reconsulta falhou. Atualize antes de outra ação.');
   }
  }catch(e){
   if(live.current&&activeKey.current===key){
    const detail=erro(e);
    // Uma falha ou timeout pode ter ocorrido após o commit. Nunca repetir automaticamente.
    await consultar(true);
    setError(detail);
   }
  }finally{writing.current=false;if(live.current)setBusy(false);}
 }

 const current=driver?null:painel;
 const registros=driver&&painel?.registros?painel.registros:[];
 const disabled=busy||loading;
 const operacaoDisponivel=Boolean(painel&&estado?.referencia);
 return <section className="be-section">
  <div className="be-row"><h2>Controle operacional</h2><button type="button" className="be-btn" onClick={()=>consultar()} disabled={disabled||tipo==='VIAGEM'&&!turmaId||tipo==='EXCURSAO'&&!execucaoId}>Consultar estado oficial</button></div>
  <p className="be-muted">Embarques e desembarques usam o snapshot oficial. Alterações exigem versão atual. O motorista pode corrigir registros com motivo auditado; o passageiro acessa apenas seu próprio registro.</p>
  {error&&<p role="alert" className="be-error">{error}</p>}
  {message&&<p role="status" className="be-alert">{message}</p>}
  {driver&&<div className="be-fieldset"><label>Tipo de operação<select value={tipo} disabled={disabled} onChange={e=>{invalidate();setTipo(e.target.value);setExecucaoId('');}}><option value="VIAGEM">Viagem privada ou pública</option><option value="EXCURSAO">Execução de excursão</option></select></label></div>}
  {tipo==='VIAGEM'?<div className="be-fieldset"><label>Turma<select value={turmaId} disabled={disabled} onChange={e=>{invalidate();setTurmaId(e.target.value);}}><option value="">Selecione uma turma</option>{turmas.map(t=><option key={t.id} value={t.id}>{t.nome||'Turma '+t.id}</option>)}</select></label></div>
   :<div className="be-fieldset">
    <label>Excursão<select value={excursaoId} disabled={disabled} onChange={e=>{invalidate();setExcursaoId(e.target.value);setExecucaoId('');setExecucoes([]);}}><option value="">Selecione</option>{excursoes.map(x=><option key={x.id} value={x.id}>{x.titulo||'Excursão '+x.id}</option>)}</select></label>
    <label>Execução<select disabled={disabled||!excursaoId} value={execucaoId} onChange={e=>{invalidate();setExecucaoId(e.target.value);}}><option value="">Selecione</option>{execucoes.map(x=><option key={x.id} value={x.id}>{x.sentido||'Sentido'} · {x.estado||'Estado não informado'} · #{x.id}</option>)}</select></label>
   </div>}
  {loading&&<p role="status" className="be-muted">Consultando estado e registros...</p>}
  {estado&&<section className="be-card">
   <h3>{estado.descricao}</h3>
   <p className="be-muted">Tipo: {tipo} · Sentido: {estado.sentido||'Não informado'} · Referência: {estado.referencia||'indisponível'}</p>
   {!estado.ativo&&<p className="be-muted">Esta execução não está ativa. O histórico continua disponível quando o backend autorizar, mas novas alterações são bloqueadas.</p>}
   {!operacaoDisponivel&&<p className="be-muted">Nenhum snapshot operacional disponível para a seleção.</p>}
   {driver&&painel&&<><div className="be-kpis" aria-label="Contadores oficiais da operação">
    <div className="be-kpi"><b>{painel.contadores.esperados}</b>Esperados</div>
    <div className="be-kpi"><b>{painel.contadores.aguardando}</b>Aguardando</div>
    <div className="be-kpi"><b>{painel.contadores.naVan}</b>Na van</div>
    <div className="be-kpi"><b>{painel.contadores.naoEmbarcaram}</b>Não embarcaram</div>
    <div className="be-kpi"><b>{painel.contadores.desembarcados}</b>Desembarcados</div>
   </div>
   {painel.contadores.naVan>0&&<p className="be-alert">Existem passageiros embarcados. O backend bloqueia encerramento e cancelamento até o desembarque real ou correção autorizada.</p>}
   <div className="be-list">{registros.map(registro=><div className="be-item" key={registro.id}>
    <strong>{registro.nome||'Registro '+registro.id}</strong>
    <p>Estado: {nomeEstado(registro.estado)} · Versão: {registro.versao}</p>
    <div className="be-actions">
     {estado.ativo&&destinosRegulares(registro.estado).map(target=><button type="button" key={target} className="be-btn" disabled={disabled} onClick={()=>change(registro,target)}>{target==='EMBARCADO'?'Confirmar embarque':target==='DESEMBARCADO'?'Confirmar desembarque':'Registrar ausência'}</button>)}
     <button type="button" className="be-btn" disabled={disabled||histLoading} onClick={()=>historico(registro)}>Histórico do registro</button>
     {estado.ativo&&permiteCorrecaoParaAguardando(registro.estado)&&<button type="button" className="be-btn" disabled={disabled} onClick={()=>setCorrecao(c=>c?.registroId===registro.id?null:{registroId:registro.id,motivo:''})}>Corrigir para aguardando</button>}
    </div>
    {correcao?.registroId===registro.id&&<div className="be-form">
     <p className="be-muted">A correção reabre o registro para aguardar nova confirmação. Exige motivo e fica auditada no servidor.</p>
     <label>Motivo da correção<textarea rows={2} maxLength={500} value={correcao.motivo} onChange={e=>setCorrecao(c=>({...c,motivo:e.target.value}))} disabled={disabled}/></label>
     <div className="be-actions"><button type="button" className="be-btn primary" disabled={disabled||!correcao.motivo.trim()} onClick={()=>change(registro,'AGUARDANDO',true,correcao.motivo)}>Confirmar correção</button><button type="button" className="be-btn" disabled={disabled} onClick={()=>setCorrecao(null)}>Cancelar</button></div>
    </div>}
   </div>)}</div></>}
   {!driver&&current&&<div className="be-item">
    <p><strong>Meu estado:</strong> {nomeEstado(current.estado)} · Versão: {current.versao}</p>
    <div className="be-actions">
     {estado.ativo&&destinosRegulares(current.estado).map(target=><button type="button" className="be-btn primary" disabled={disabled} key={target} onClick={()=>change(current,target)}>{target==='EMBARCADO'?'Confirmar que embarquei':target==='DESEMBARCADO'?'Confirmar meu desembarque':'Informar que não embarquei'}</button>)}
     <button type="button" className="be-btn" disabled={disabled||histLoading} onClick={()=>historico(current)}>Meu histórico</button>
    </div>
   </div>}
  </section>}
  {histLoading&&<p role="status" className="be-muted">Buscando histórico autorizado...</p>}
  {historia&&<section className="be-card" aria-label="Histórico operacional">
   <h3>{driver?'Histórico do registro':'Meu histórico'}</h3>
   {historia.events.length===0?<p className="be-muted">Nenhum evento registrado.</p>:<ol className="be-list">
    {historia.events.map(item=><li className="be-item" key={item.id}>
     <strong>{nomeEstado(item.anterior)} → {nomeEstado(item.novo)}</strong>
     <p>{dataHora(item.criadoEm)} · Versão {item.versaoRegistro}{item.correcao?' · Correção auditada':''}</p>
     {item.correcao&&item.motivo&&<p>Motivo: {item.motivo}</p>}
    </li>)}
   </ol>}
   <button type="button" className="be-btn" onClick={()=>setHistoria(null)}>Fechar histórico</button>
  </section>}
  <p className="be-footnote">Início e fim de viagens ficam na área Mapa e viagens; excursões em Gestão de excursões. O servidor determina quem pode operar. Participantes de excursões sem Firebase consultam seu estado pela credencial individual.</p>
 </section>;
}
