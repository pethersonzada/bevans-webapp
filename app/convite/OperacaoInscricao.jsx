'use client';
import {useEffect,useRef,useState} from 'react';

const rotulos={AGUARDANDO:'Aguardando',EMBARCADO:'Embarcado',DESEMBARCADO:'Desembarcado',NAO_EMBARCOU:'Não embarcou',
 EM_ANDAMENTO:'Em andamento',FINALIZADA:'Finalizada',CANCELADA:'Cancelada'};
const idValido=v=>Number.isSafeInteger(v)&&v>0;
const erro=e=>e instanceof Error?e.message:'Não foi possível consultar a operação.';
const data=v=>v&&!Number.isNaN(Date.parse(v))?new Date(v).toLocaleString('pt-BR'):'Data indisponível';
const estadosPermitidos=new Set(['AGUARDANDO','EMBARCADO','DESEMBARCADO','NAO_EMBARCOU']);
function validarRegistro(r){
 if(!r||!idValido(r.id)||!estadosPermitidos.has(r.estado)||!Number.isSafeInteger(r.versao)||r.versao<0)
  throw Error('O servidor retornou um estado operacional inválido.');
 return r;
}

/** Apenas dados da inscrição autenticada pelo header individual; nunca solicita passageiros ou GPS. */
export default function OperacaoInscricao({request}){
 const [execucoes,setExecucoes]=useState(null),[selecionada,setSelecionada]=useState(null);
 const [registro,setRegistro]=useState(null),[historico,setHistorico]=useState(null);
 const [busy,setBusy]=useState(false),[falha,setFalha]=useState(''),[aviso,setAviso]=useState('');
 const trava=useRef(false),geracao=useRef(0);
 useEffect(()=>()=>{geracao.current++;},[]);
 async function executar(tarefa){
  if(trava.current)return;
  trava.current=true;setBusy(true);setFalha('');setAviso('');
  const atual=++geracao.current;
  try{await tarefa(()=>geracao.current===atual);}
  catch(e){if(geracao.current===atual)setFalha(erro(e));}
  finally{trava.current=false;if(geracao.current===atual)setBusy(false);}
 }
 function carregar(){
  executar(async vigente=>{
   setExecucoes(null);setSelecionada(null);setRegistro(null);setHistorico(null);
   const lista=await request('/publico/excursoes/inscricao/execucoes');
   if(!Array.isArray(lista)||lista.some(x=>!idValido(x?.id)||!['IDA','VOLTA'].includes(x.sentido)
        ||!['EM_ANDAMENTO','FINALIZADA','CANCELADA'].includes(x.estado)))
    throw Error('O servidor retornou uma lista de execuções inválida.');
   if(vigente())setExecucoes(lista);
  });
 }
 function consultar(execucao){
  executar(async vigente=>{
   setSelecionada(null);setRegistro(null);setHistorico(null);
   const item=validarRegistro(await request('/publico/excursoes/operacao/'+execucao.id+'/minha'));
   if(vigente()){setSelecionada(execucao);setRegistro(item);}
  });
 }
 function verHistorico(){
  if(!selecionada||!registro)return;
  executar(async vigente=>{
   setHistorico(null);
   const r=await request('/publico/excursoes/operacao/'+selecionada.id+'/minha/historico');
   if(!Array.isArray(r)||r.some(x=>!idValido(x?.id)||!estadosPermitidos.has(x.novo)))
    throw Error('O servidor retornou um histórico inválido.');
   if(vigente())setHistorico(r);
  });
 }
 function mudar(estado){
  if(!selecionada||!registro||selecionada.estado!=='EM_ANDAMENTO')return;
  if(!window.confirm('Confirmar a alteração do seu estado para '+rotulos[estado]+'?'))return;
  executar(async vigente=>{
   const r=validarRegistro(await request('/publico/excursoes/operacao/'+selecionada.id+'/minha/estado','PUT',
     {estado,versao:registro.versao,correcao:false}));
   if(r.id!==registro.id||r.estado!==estado||r.versao<=registro.versao)
    throw Error('O servidor não confirmou a alteração. Consulte novamente antes de repetir.');
   if(vigente()){setRegistro(r);setHistorico(null);setAviso('Estado confirmado pelo servidor.');}
  });
 }
 return <section className="be-card be-section" aria-label="Minha operação na excursão">
  <h2>Meu embarque e histórico</h2>
  <p className="be-muted">Consulte apenas o seu próprio estado operacional. Não são exibidos localização da van, nomes ou dados de outros participantes.</p>
  {falha&&<p role="alert" className="be-error">{falha}</p>}
  {aviso&&<p role="status" className="be-alert">{aviso}</p>}
  <button type="button" className="be-btn" disabled={busy} onClick={carregar}>{busy?'Consultando…':execucoes===null?'Consultar meu embarque':'Atualizar minhas execuções'}</button>
  {execucoes!==null&&(!execucoes.length?<p className="be-muted" role="status">Ainda não existe execução operacional disponível para esta inscrição.</p>:
   <div className="be-list" style={{marginTop:16}}>{execucoes.map(x=><div className="be-item" key={x.id}>
    <strong>{x.sentido==='IDA'?'Ida':'Volta'} · {rotulos[x.estado]}</strong>
    <p className="be-muted">Início: {data(x.iniciadaEm)}</p>
    <button type="button" className="be-btn" disabled={busy} onClick={()=>consultar(x)}>Consultar meu estado</button>
   </div>)}</div>)}
  {registro&&selecionada&&<div className="be-item" style={{marginTop:16}}>
   <h3>Meu estado: {rotulos[registro.estado]}</h3>
   <p className="be-muted">Versão {registro.versao}. As mudanças só são consideradas após confirmação do servidor.</p>
   {selecionada.estado==='EM_ANDAMENTO'&&<div className="be-actions">
    {registro.estado==='AGUARDANDO'&&<>
     <button type="button" className="be-btn primary" disabled={busy} onClick={()=>mudar('EMBARCADO')}>Confirmar embarque</button>
     <button type="button" className="be-btn" disabled={busy} onClick={()=>mudar('NAO_EMBARCOU')}>Informar que não embarquei</button>
    </>}
    {registro.estado==='EMBARCADO'&&<button type="button" className="be-btn primary" disabled={busy} onClick={()=>mudar('DESEMBARCADO')}>Confirmar desembarque</button>}
   </div>}
   <div className="be-actions">
    <button type="button" className="be-btn" disabled={busy} onClick={()=>consultar(selecionada)}>Atualizar estado</button>
    <button type="button" className="be-btn" disabled={busy} onClick={verHistorico}>Consultar meu histórico</button>
   </div>
   {historico&&(!historico.length?<p className="be-muted">Nenhum evento registrado.</p>:
    <ol>{historico.map(h=><li key={h.id}>{rotulos[h.anterior]||'Início'} → {rotulos[h.novo]} · {data(h.criadoEm)}</li>)}</ol>)}
  </div>}
 </section>;
}
