'use client';
import {useCallback,useEffect,useState} from 'react';
import MapaWeb,{coordenadaValida,normalizarPontos} from './MapaWeb';

const basePoint=()=>({id:null,nome:'',latitude:null,longitude:null,horario:'',pontoConfirmado:true});
const id=value=>{if(!/^[1-9]\d*$/.test(String(value))||!Number.isSafeInteger(Number(value)))throw Error('Identificador inválido.');return Number(value);};
const opts=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const note=e=>e instanceof Error?e.message:'Não foi possível concluir a operação.';
const order=ps=>ps.map((p,index)=>({...p,ordem:index}));
export const coletarParadas=paradas=>paradas.map(p=>({
 ...(p.id==null?{}:{id:id(p.id)}),nome:String(p.nome||'').trim(),latitude:p.latitude,longitude:p.longitude,
 horario:p.horario||null,pontoConfirmado:true
}));
export default function ColetaPrivadaWeb({api,profile,driver}){
 const [turmas,setTurmas]=useState([]),[turmaId,setTurmaId]=useState(''),[sentido,setSentido]=useState('IDA'),[config,setConfig]=useState(null);
 const [modo,setModo]=useState('PORTA_A_PORTA'),[paradas,setParadas]=useState([]),[novo,setNovo]=useState(basePoint),[editing,setEditing]=useState(null);
 const [enderecos,setEnderecos]=useState([]),[enderecoId,setEnderecoId]=useState(''),[paradaId,setParadaId]=useState('');
 const [preview,setPreview]=useState([]),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[optimize,setOptimize]=useState(false);
 const refreshTurmas=useCallback(async()=>{
  try{const [groups,addresses]=await Promise.all([
   api(driver?'/turmas/motorista/'+id(profile.id):'/turmas/usuario/'+id(profile.id)+'/todas'),
   driver?Promise.resolve([]):api('/enderecos/usuario/'+id(profile.id))
  ]);
   if(!Array.isArray(groups)||!Array.isArray(addresses))throw Error('Dados de turmas ou endereços inválidos.');
   setTurmas(groups);setEnderecos(addresses);
  }catch(e){setError(note(e));}
 },[api,profile.id,driver]);
 useEffect(()=>{Promise.resolve().then(()=>refreshTurmas());},[refreshTurmas]);
 const load=useCallback(async(turma=turmaId,direction=sentido,add=enderecoId)=>{
  if(!turma){setConfig(null);return;}
  setError('');setLoading(true);setPreview([]);
  try{
   const q=!driver&&add?'?enderecoId='+id(add):'';
   const result=await api('/turmas/'+id(turma)+'/coleta/'+direction+q);
   if(!result||result.turmaId!==id(turma)||result.sentido!==direction||!['PORTA_A_PORTA','PARADAS_DEFINIDAS'].includes(result.modo)||!Number.isSafeInteger(result.versao)||!Array.isArray(result.paradas))throw Error('Configuração de coleta inválida.');
   setConfig(result);setModo(result.modo);setParadas(order(result.paradas));setParadaId(String(result.escolhidaId||''));
  }catch(e){setConfig(null);setError(note(e));}
  finally{setLoading(false);}
 },[api,driver,turmaId,sentido,enderecoId]);
 useEffect(()=>{if(turmaId)Promise.resolve().then(()=>load());},[turmaId,sentido,load]);
 async function mutate(task,success){
  if(busy)return;setBusy(true);setError('');setMessage('');
  try{await task();setMessage(success);await load();}
  catch(e){setError(note(e));}finally{setBusy(false);}
 }
 function editPoint(p,index){setEditing(index);setNovo({...basePoint(),...p,horario:p.horario||''});}
 function placePoint(){
  if(!novo.nome.trim()||!coordenadaValida(novo))return setError('Dê um nome e confirme o ponto no mapa.');
  const p={...novo,nome:novo.nome.trim()};
  setParadas(xs=>editing===null?[...xs,p]:xs.map((x,i)=>i===editing?p:x));
  setNovo(basePoint());setEditing(null);setError('');
 }
 async function save(){
  if(!driver||!config)return;
  if(modo==='PARADAS_DEFINIDAS'&&(!paradas.length||paradas.length>50||paradas.some(p=>!coordenadaValida(p)||!p.nome.trim())))return setError('É necessário cadastrar de 1 a 50 paradas confirmadas.');
  const payload={modo,versao:config.versao,paradas:modo==='PORTA_A_PORTA'?[]:coletarParadas(paradas)};
  if(!window.confirm('Salvar nova configuração da coleta? Presenças e escolhas ativas podem bloquear alterações.'))return;
  await mutate(async()=>{
   const result=await api('/turmas/'+id(turmaId)+'/coleta/'+sentido,opts('PUT',payload));
   if(!result||result.versao<=config.versao||result.modo!==modo)throw Error('O backend não confirmou a nova versão. Atualize antes de repetir.');
  },'Coleta configurada.');
 }
 async function choose(){
  if(!config||!paradaId)return;
  await mutate(()=>api('/turmas/'+id(turmaId)+'/coleta/'+sentido+'/minha-parada',opts('PUT',{paradaId:id(paradaId),versao:config.versao})),'Parada escolhida.');
 }
 async function clear(){if(!window.confirm('Remover sua escolha de parada?'))return;
  await mutate(()=>api('/turmas/'+id(turmaId)+'/coleta/'+sentido+'/minha-parada',{method:'DELETE'}),'Escolha removida.');
 }
 async function plan(){
  if(!driver)return;
  await mutate(async()=>{
   const p=await api('/turmas/'+id(turmaId)+'/coleta/'+sentido+'/planejamento?otimizar='+optimize,{method:'POST'});
   if(!Array.isArray(p)||p.some(x=>!coordenadaValida(x)))throw Error('O planejamento não retornou pontos válidos.');
   setPreview(normalizarPontos(p));
  },'Planejamento consultado.');
 }
 const mapPoints=normalizarPontos([...paradas,...(coordenadaValida(novo)?[{...novo,nome:novo.nome||'Novo ponto'}]:[])]);
 return <section className="be-section">
  <div className="be-row"><h2>Coleta privada</h2><button className="be-btn" type="button" onClick={()=>load()} disabled={!turmaId||loading}>Atualizar</button></div>
  <p className="be-muted">Coleta definida separadamente para ida e volta. Apenas o motorista autorizado configura paradas; passageiros aprovados escolhem a própria parada.</p>
  {error&&<p className="be-error" role="alert">{error}</p>}{message&&<p className="be-alert" role="status">{message}</p>}
  <div className="be-fieldset">
   <label>Turma<select value={turmaId} onChange={e=>{setTurmaId(e.target.value);setConfig(null);setPreview([]);}}><option value="">Selecione</option>{turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></label>
   <label>Sentido<select value={sentido} onChange={e=>{setSentido(e.target.value);setConfig(null);}}><option value="IDA">Ida</option><option value="VOLTA">Volta</option></select></label>
   {!driver&&<label>Meu endereço (para sugestão)<select value={enderecoId} onChange={e=>{setEnderecoId(e.target.value);if(turmaId)load(turmaId,sentido,e.target.value);}}><option value="">Sem sugestão</option>{enderecos.map(a=><option value={a.id} key={a.id}>{a.apelido||a.rua}</option>)}</select></label>}
  </div>
  {loading&&<p className="be-muted">Buscando configuração…</p>}
  {config&&<div className="be-live-stack">
   <section className="be-card"><h3>Coleta de {sentido==='IDA'?'ida':'volta'}</h3><p>Modo atual: <strong>{config.modo}</strong> · Versão {config.versao}</p>
    {driver&&<><div className="be-fieldset"><label>Modo<select value={modo} onChange={e=>{setModo(e.target.value);setPreview([]);}}><option value="PORTA_A_PORTA">Porta a porta</option><option value="PARADAS_DEFINIDAS">Paradas definidas</option></select></label></div>
     {modo==='PARADAS_DEFINIDAS'&&<><h3>Paradas e ordem</h3><div className="be-list">{paradas.map((p,i)=><div className="be-item be-row" key={p.id||i}><div><strong>{i+1}. {p.nome}</strong><p className="be-muted">{p.horario||'Sem horário'}</p></div><div className="be-actions">
      <button className="be-btn" disabled={i===0} onClick={()=>setParadas(xs=>{const a=[...xs];[a[i-1],a[i]]=[a[i],a[i-1]];return a;})}>↑</button>
      <button className="be-btn" disabled={i===paradas.length-1} onClick={()=>setParadas(xs=>{const a=[...xs];[a[i+1],a[i]]=[a[i],a[i+1]];return a;})}>↓</button>
      <button className="be-btn" onClick={()=>editPoint(p,i)}>Editar</button>
      <button className="be-btn danger" onClick={()=>setParadas(xs=>xs.filter((_,j)=>j!==i))}>Remover</button>
     </div></div>)}</div>
     <div className="be-form"><label>Nome da parada<input value={novo.nome} onChange={e=>setNovo(p=>({...p,nome:e.target.value}))}/></label><label>Horário local (opcional)<input type="time" value={novo.horario||''} onChange={e=>setNovo(p=>({...p,horario:e.target.value}))}/></label></div>
     <div className="be-actions"><button className="be-btn" onClick={placePoint}>{editing===null?'Adicionar parada':'Salvar edição da parada'}</button>{editing!==null&&<button className="be-btn" onClick={()=>{setEditing(null);setNovo(basePoint());}}>Cancelar edição</button>}</div></>}
     <button className="be-btn primary" disabled={busy} onClick={save}>Salvar configuração da turma</button>
    </>}
    {!driver&&config.modo==='PARADAS_DEFINIDAS'&&<><p>Sua parada: {config.paradas.find(p=>p.id===config.escolhidaId)?.nome||'Nenhuma selecionada'}</p>
     <label>Escolha a parada<select className="be-control" value={paradaId} onChange={e=>setParadaId(e.target.value)}><option value="">Selecione</option>{config.paradas.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
     {config.sugestao&&<p className="be-muted">Sugestão aproximada: {config.sugestao.parada?.nome} ({Math.round(config.sugestao.distanciaMetros)} m em linha reta; não é percurso caminhável).</p>}
     <div className="be-actions"><button className="be-btn primary" disabled={busy||!paradaId} onClick={choose}>Confirmar minha parada</button><button className="be-btn" disabled={busy||!config.escolhidaId} onClick={clear}>Remover escolha</button></div>
    </>}
    {!driver&&config.modo==='PORTA_A_PORTA'&&<p className="be-muted">Nesta turma, a presença usa os endereços cadastrados. Nenhuma parada adicional precisa ser escolhida.</p>}
   </section>
   <section className="be-card"><h3>Mapa da coleta</h3><MapaWeb pontos={mapPoints} onSelecionar={driver&&modo==='PARADAS_DEFINIDAS'?p=>setNovo(x=>({...x,...p})):undefined} altura={400}/>
    {driver&&<div className="be-actions"><label>Otimizar prévia<input type="checkbox" checked={optimize} onChange={e=>setOptimize(e.target.checked)}/></label><button className="be-btn" disabled={busy} onClick={plan}>Consultar planejamento</button></div>}
    {preview.length>0&&<><h3>Prévia oficial</h3><MapaWeb pontos={preview} altura={330}/></>}
   </section>
  </div>}
 </section>;
}
