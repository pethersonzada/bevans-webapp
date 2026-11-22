'use client';
import {useRef,useState} from 'react';
import MapaWeb from './MapaWeb';
import {idSeguro} from '../lib/bevans-api.mjs';
import {podeEscolherPontoPrivado,coordenadaEmbarqueValida,montarPedidoEmbarque,validarRespostaEmbarque,mensagemErroEmbarque} from '../lib/embarque-web.mjs';

const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const plus30=()=>{const d=new Date();d.setDate(d.getDate()+30);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
export default function EmbarquePublicoWeb({api,rota,onChanged}){
 const [data,setData]=useState(today),[sentido,setSentido]=useState('IDA'),[modo,setModo]=useState('PARADA'),[paradaId,setParadaId]=useState('');
 const [nomePonto,setNomePonto]=useState(''),[ponto,setPonto]=useState(null),[confirmado,setConfirmado]=useState(false),[observacao,setObservacao]=useState('');
 const [status,setStatus]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const writing=useRef(false);
 const excecao=podeEscolherPontoPrivado(rota),stops=Array.isArray(rota.paradas)?rota.paradas.filter(p=>p.ativa!==false):[];
 const pontos=[{nome:rota.origemNome||'Origem',latitude:rota.origemLatitude,longitude:rota.origemLongitude},...stops,{nome:rota.destinoNome||'Destino',latitude:rota.destinoLatitude,longitude:rota.destinoLongitude},...(coordenadaEmbarqueValida(ponto)?[{...ponto,nome:'Ponto solicitado (privado)'}]:[])];
 const pick=pos=>{setPonto(pos);setConfirmado(false);setStatus('');setError('');};
 async function solicitar(){
  if(writing.current)return;
  let body;
  try{body=montarPedidoEmbarque(rota,{dataOperacao:data,sentido,modo,paradaId,nomePonto,ponto,confirmado,observacao});}
  catch(e){setError(e.message);return;}
  if(!window.confirm('Solicitar embarque para '+data+' ('+sentido+')? A solicitação depende de análise do motorista.'))return;
  writing.current=true;setBusy(true);setError('');setStatus('');
  try{
   const result=await api('/rotas-publicas/'+idSeguro(rota.id)+'/embarques',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
   const accepted=validarRespostaEmbarque(result,rota.id);
   setStatus('Pedido registrado: '+accepted.status+'. A aprovação depende do motorista.');
   onChanged?.();
  }catch(e){setError(mensagemErroEmbarque(e));}
  finally{writing.current=false;setBusy(false);}
 }
 return <section className="be-section" aria-label="Solicitar embarque em rota pública">
  <h3>Solicitar embarque</h3><p className="be-muted">Uma solicitação corresponde a uma data e um sentido. O servidor valida horário, vínculo, vagas e duplicidade. A confirmação do motorista é necessária para embarcar.</p>
  {error&&<p role="alert" className="be-error">{error}</p>}{status&&<p role="status" className="be-alert">{status}</p>}
  <div className="be-fieldset">
   <label>Data<input type="date" min={today()} max={plus30()} value={data} disabled={busy} onChange={e=>setData(e.target.value)}/></label>
   <label>Sentido<select value={sentido} disabled={busy} onChange={e=>setSentido(e.target.value)}><option value="IDA">Ida</option><option value="VOLTA">Volta</option></select></label>
   <label>Tipo de ponto<select value={modo} disabled={busy} onChange={e=>{setModo(e.target.value);setError('');setStatus('');}}><option value="PARADA">Parada cadastrada</option>{excecao&&<option value="PONTO">Ponto particular confirmado</option>}</select></label>
  </div>
  {modo==='PARADA'?<label>Parada cadastrada<select value={paradaId} disabled={busy} onChange={e=>setParadaId(e.target.value)}><option value="">Selecione uma parada</option>{stops.map(p=><option value={p.id} key={p.id}>{p.nome}</option>)}</select></label>
   :<div className="be-form"><label>Nome do ponto particular<input maxLength={120} value={nomePonto} disabled={busy} onChange={e=>setNomePonto(e.target.value)} placeholder="Referência para o motorista"/></label>
    <p className="be-muted">Clique no mapa para marcar o local onde deseja embarcar. Esse ponto pertence apenas à solicitação e não será publicado no catálogo.</p>
    <MapaWeb pontos={pontos} onSelecionar={busy?null:pick} altura={340}/>
    {coordenadaEmbarqueValida(ponto)&&<p className="be-muted">Ponto selecionado: {ponto.latitude.toFixed(5)}, {ponto.longitude.toFixed(5)}</p>}
    <label className="be-inline-check"><input type="checkbox" disabled={busy||!coordenadaEmbarqueValida(ponto)} checked={confirmado} onChange={e=>setConfirmado(e.target.checked)}/>Confirmo que revisei o ponto escolhido no mapa</label>
   </div>}
  <label>Observação (opcional)<textarea maxLength={500} rows={2} value={observacao} disabled={busy} onChange={e=>setObservacao(e.target.value)}/></label>
  <div className="be-actions"><button type="button" className="be-btn primary" onClick={solicitar} disabled={busy||!data||(modo==='PARADA'?!paradaId:!confirmado||!nomePonto.trim())}>{busy?'Enviando…':'Solicitar embarque'}</button></div>
  <p className="be-footnote">A decisão, o cancelamento pendente e o histórico ficam em Solicitações. Um pedido aprovado não pode ser cancelado por esta tela; desistências exigem fluxo autorizado no servidor.</p>
 </section>;
}
