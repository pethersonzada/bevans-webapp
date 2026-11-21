'use client';
import {useState} from 'react';
import MapaWeb,{coordenadaValida,normalizarPontos} from './MapaWeb';

const initial=()=>({id:null,nome:'',latitude:null,longitude:null,horario:'',instrucoes:''});
function bodyParadas(points){
 return points.map(p=>({id:p.id??null,nome:String(p.nome||'').trim(),latitude:p.latitude,longitude:p.longitude,horario:p.horario||null,instrucoes:p.instrucoes||null,pontoConfirmado:true}));
}
export default function ColetaExcursaoWeb({api,excursao,onSaved}){
 const [modo,setModo]=useState(excursao.modoColeta||'PORTA_A_PORTA');
 const [pontos,setPontos]=useState(Array.isArray(excursao.paradas)?excursao.paradas:[]);
 const [draft,setDraft]=useState(initial),[editing,setEditing]=useState(null);
 const [erro,setErro]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 function add(){
  if(!draft.nome.trim()||!coordenadaValida(draft))return setErro('Nome e coordenadas confirmadas são obrigatórios.');
  const point={...draft,nome:draft.nome.trim()};
  setPontos(xs=>editing===null?[...xs,point]:xs.map((p,i)=>i===editing?point:p));
  setDraft(initial());setEditing(null);setErro('');
 }
 async function save(){
  if(busy)return;
  const quantidade=modo==='PORTA_A_PORTA'?0:modo==='PARADA_UNICA'?1:2;
  if(modo==='PARADA_UNICA'&&pontos.length!==1)return setErro('O modo parada única exige exatamente um ponto.');
  if(modo==='MULTIPLAS_PARADAS'&&(pontos.length<2||pontos.length>50))return setErro('Informe entre 2 e 50 paradas.');
  if(modo!=='PORTA_A_PORTA'&&pontos.some(p=>!p.nome?.trim()||!coordenadaValida(p)))return setErro('Existem pontos sem nome ou coordenadas confirmadas.');
  if(!window.confirm('Salvar a coleta da excursão? Com reservas ativas, o backend pode bloquear a alteração.'))return;
  setBusy(true);setErro('');setNotice('');
  try{
   const r=await api('/excursoes/'+excursao.id+'/coleta',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    modo,versao:excursao.versao,paradas:quantidade===0?[]:bodyParadas(pontos)
   })});
   if(!r||r.id!==excursao.id||r.modoColeta!==modo||!Number.isSafeInteger(r.versao)||r.versao<=excursao.versao)throw Error('Servidor não confirmou a atualização. Consulte a excursão antes de repetir.');
   setNotice('Coleta atualizada.');await onSaved();
  }catch(e){setErro(e?.message||'Falha ao salvar.');}
  finally{setBusy(false);}
 }
 const mapPins=normalizarPontos([...pontos,...(coordenadaValida(draft)?[{...draft,nome:draft.nome||'Nova parada'}]:[])]);
 return <section className="be-card be-section">
  <h2>Planejamento da coleta</h2>
  <p className="be-muted">Edição com controle de versão. A ordem das paradas determina o roteiro manual e a API valida inscrições existentes.</p>
  {erro&&<p role="alert" className="be-error">{erro}</p>}{notice&&<p role="status" className="be-alert">{notice}</p>}
  <div className="be-fieldset"><label>Modo<select value={modo} onChange={e=>setModo(e.target.value)}><option value="PORTA_A_PORTA">Porta a porta</option><option value="PARADA_UNICA">Parada única</option><option value="MULTIPLAS_PARADAS">Múltiplas paradas</option></select></label></div>
  {modo!=='PORTA_A_PORTA'&&<>
   <div className="be-list">{pontos.map((p,i)=><div key={p.id||i} className="be-item be-row"><div><strong>{i+1}. {p.nome}</strong><p className="be-muted">{p.horario||'Sem horário'}</p></div>
    <div className="be-actions">
     <button className="be-btn" type="button" disabled={i===0} onClick={()=>setPontos(xs=>{const a=[...xs];[a[i-1],a[i]]=[a[i],a[i-1]];return a;})}>↑</button>
     <button className="be-btn" type="button" disabled={i===pontos.length-1} onClick={()=>setPontos(xs=>{const a=[...xs];[a[i+1],a[i]]=[a[i],a[i+1]];return a;})}>↓</button>
     <button className="be-btn" type="button" onClick={()=>{setEditing(i);setDraft({...p,horario:p.horario||'',instrucoes:p.instrucoes||''});}}>Editar</button>
     <button className="be-btn danger" type="button" onClick={()=>setPontos(xs=>xs.filter((_,j)=>i!==j))}>Remover</button>
    </div>
   </div>)}</div>
   <div className="be-form">
    <label>Nome do ponto<input value={draft.nome} onChange={e=>setDraft(p=>({...p,nome:e.target.value}))}/></label>
    <label>Horário (opcional)<input type="time" value={draft.horario||''} onChange={e=>setDraft(p=>({...p,horario:e.target.value}))}/></label>
    <label>Orientações (opcional)<input maxLength={500} value={draft.instrucoes||''} onChange={e=>setDraft(p=>({...p,instrucoes:e.target.value}))}/></label>
   </div>
   <MapaWeb pontos={mapPins} onSelecionar={p=>setDraft(x=>({...x,...p}))} altura={360}/>
   <div className="be-actions"><button className="be-btn" type="button" onClick={add}>{editing===null?'Adicionar parada':'Atualizar parada'}</button>{editing!==null&&<button className="be-btn" type="button" onClick={()=>{setEditing(null);setDraft(initial());}}>Cancelar edição</button>}</div>
  </>}
  {modo==='PORTA_A_PORTA'&&<p className="be-muted">Os participantes informarão pontos individuais no momento da inscrição. Nenhuma parada coletiva será configurada.</p>}
  <button className="be-btn primary" type="button" onClick={save} disabled={busy}>Salvar coleta</button>
 </section>;
}
