'use client';
import {useCallback,useEffect,useState} from 'react';
import MapaWeb,{coordenadaValida,normalizarPontos} from './MapaWeb';
const cfg={turmaId:'',nome:'',cidade:'',categoria:'UNIVERSITARIA',modo:'FIXA',origemNome:'',origemLatitude:null,origemLongitude:null,destinoNome:'',destinoLatitude:null,destinoLongitude:null,descricao:'',regiao:'',campus:'',dias:['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'],horarioIda:'07:00',horarioVolta:'18:00'};
const days=[['MONDAY','Seg'],['TUESDAY','Ter'],['WEDNESDAY','Qua'],['THURSDAY','Qui'],['FRIDAY','Sex'],['SATURDAY','Sáb'],['SUNDAY','Dom']];
const validId=x=>{if(!/^[1-9][0-9]*$/.test(String(x))||!Number.isSafeInteger(Number(x)))throw Error('Identificador inválido.');return Number(x);};
const json=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
export default function RotasEditorWeb({api,profile}){
 const [turmas,setTurmas]=useState([]),[rotas,setRotas]=useState([]),[form,setForm]=useState(cfg),[selected,setSelected]=useState(''),[editing,setEditing]=useState(false),[pontos,setPontos]=useState([]),[pointForm,setPointForm]=useState({nome:'',latitude:null,longitude:null,horario:''}),[pointIndex,setPointIndex]=useState(null),[picking,setPicking]=useState('ORIGEM'),[preview,setPreview]=useState([]),[sentido,setSentido]=useState('IDA'),[erro,setErro]=useState(''),[info,setInfo]=useState(''),[busy,setBusy]=useState(false);
 const refresh=useCallback(async()=>{try{
  const [a,b]=await Promise.all([api('/turmas/motorista/'+validId(profile.id)),api('/rotas-publicas/minhas')]);
  if(!Array.isArray(a)||!Array.isArray(b))throw Error('Listagem inválida.');
  setTurmas(a);setRotas(b);
 }catch(e){setErro(e.message);}},[api,profile.id]);
 useEffect(()=>{Promise.resolve().then(()=>refresh());},[refresh]);
 function open(r){setSelected(String(r.id));setEditing(true);setForm({...cfg,...r,turmaId:String(r.turmaId),dias:r.dias||cfg.dias});setPontos(Array.isArray(r.paradas)?r.paradas:[]);setPreview([]);setPointIndex(null);}
 function reset(){setSelected('');setForm(cfg);setPontos([]);setPreview([]);setEditing(true);setPicking('ORIGEM');setPointIndex(null);}
 async function write(task,notice){
  if(busy)return;setBusy(true);setErro('');setInfo('');
  try{const r=await task();setInfo(notice);await refresh();if(r?.id){open(r);}}
  catch(e){setErro(e?.message||'Falha na operação.');}finally{setBusy(false);}
 }
 async function save(e){
  e.preventDefault();
  if(!form.nome.trim()||!form.cidade.trim()||!form.origemNome.trim()||!form.destinoNome.trim()||!form.turmaId||!form.dias?.length||!coordenadaValida({latitude:form.origemLatitude,longitude:form.origemLongitude})||!coordenadaValida({latitude:form.destinoLatitude,longitude:form.destinoLongitude}))return setErro('Preencha os dados e confirme origem/destino no mapa.');
  const body={...form,turmaId:validId(form.turmaId),nome:form.nome.trim(),cidade:form.cidade.trim(),origemNome:form.origemNome.trim(),destinoNome:form.destinoNome.trim(),horarioIda:form.horarioIda||null,horarioVolta:form.horarioVolta||null};
  delete body.paradas;delete body.vagas;delete body.id;delete body.publicada;delete body.ativa;delete body.favorita;delete body.permitePontoExcepcional;
  await write(()=>api(selected?'/rotas-publicas/'+validId(selected):'/rotas-publicas',json(selected?'PUT':'POST',body)),'Rota salva. Paradas são gravadas separadamente.');
 }
 async function saveStops(){
  if(!selected)return setErro('Salve a rota antes das paradas.');
  if(pontos.some(p=>!p.nome?.trim()||!coordenadaValida(p)))return setErro('Confirme todas as paradas.');
  await write(()=>api('/rotas-publicas/'+validId(selected)+'/paradas',json('PUT',pontos.map(p=>({id:p.id??null,nome:p.nome,latitude:p.latitude,longitude:p.longitude,horario:p.horario||null})))),'Paradas atualizadas.');
 }
 function addPoint(){
  if(!pointForm.nome.trim()||!coordenadaValida(pointForm))return setErro('Informe o nome e confirme o pin da parada no mapa.');
  setPontos(ps=>{const n=[...ps],p={id:pointIndex==null?null:ps[pointIndex]?.id||null,...pointForm};if(pointIndex==null)n.push(p);else n[pointIndex]=p;return n;});
  setPointForm({nome:'',latitude:null,longitude:null,horario:''});setPointIndex(null);
 }
 function choosePin(v){if(picking==='PARADA')setPointForm(prev=>({...prev,...v}));else{const key=picking==='ORIGEM'?'origem':'destino';setForm(prev=>({...prev,[key+'Latitude']:v.latitude,[key+'Longitude']:v.longitude}));}}
 const mapPoints=normalizarPontos([
  {nome:'Origem',latitude:form.origemLatitude,longitude:form.origemLongitude,tipo:'ORIGEM'},
  ...pontos,
  {nome:'Destino',latitude:form.destinoLatitude,longitude:form.destinoLongitude,tipo:'DESTINO'},
  ...(coordenadaValida(pointForm)?[{...pointForm,nome:pointForm.nome||'Nova parada'}]:[])
 ]);
 return <section className="be-section">
  <div className="be-row"><h2>Editor de rotas públicas</h2><div className="be-actions"><button type="button" className="be-btn" onClick={refresh}>Atualizar</button><button type="button" className="be-btn primary" onClick={reset}>Nova rota</button></div></div>
  {erro&&<p className="be-error" role="alert">{erro}</p>}{info&&<p className="be-alert" role="status">{info}</p>}
  <div className="be-grid">{rotas.map(r=><section key={r.id} className="be-card"><h3>{r.nome}</h3><p>{r.cidade} · {r.modo}</p><p className="be-muted">{r.publicada?'Publicada':'Não publicada'} · {r.ativa?'Ativa':'Indisponível'}</p><button className="be-btn" onClick={()=>open(r)}>Editar e planejar</button></section>)}</div>
  {editing&&<section className="be-card be-section"><h2>{selected?'Rota #'+selected:'Nova rota'}</h2>
   <form className="be-form" onSubmit={save}>
    <label>Turma<select required disabled={Boolean(selected)} value={form.turmaId} onChange={e=>setForm(p=>({...p,turmaId:e.target.value}))}><option value="">Selecione</option>{turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></label>
    {['nome','cidade','origemNome','destinoNome','regiao','campus','descricao'].map(field=><label key={field}>{({nome:'Nome',cidade:'Cidade',origemNome:'Nome da origem pública',destinoNome:'Destino',regiao:'Região',campus:'Campus',descricao:'Descrição'})[field]}<input required={['nome','cidade','origemNome','destinoNome'].includes(field)} value={form[field]||''} onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}/></label>)}
    <div className="be-fieldset"><label>Modo<select value={form.modo} onChange={e=>setForm(p=>({...p,modo:e.target.value}))}><option value="FIXA">Fixa</option><option value="FLEXIVEL">Flexível</option></select></label><label>Categoria<select value={form.categoria} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))}><option value="ESCOLAR">Escolar</option><option value="UNIVERSITARIA">Universitária</option><option value="OUTROS">Outros</option></select></label></div>
    <div className="be-fieldset"><label>Hora da ida<input type="time" value={form.horarioIda||''} onChange={e=>setForm(p=>({...p,horarioIda:e.target.value}))}/></label><label>Hora da volta<input type="time" value={form.horarioVolta||''} onChange={e=>setForm(p=>({...p,horarioVolta:e.target.value}))}/></label></div>
    <fieldset><legend>Dias de circulação</legend><div className="be-actions">{days.map(([day,label])=><label key={day} style={{display:'flex',gap:6,alignItems:'center'}}><input type="checkbox" checked={form.dias.includes(day)} onChange={e=>setForm(p=>({...p,dias:e.target.checked?[...p.dias,day]:p.dias.filter(x=>x!==day)}))}/>{label}</label>)}</div></fieldset>
    <div className="be-fieldset"><label>Selecionar coordenada de<select value={picking} onChange={e=>setPicking(e.target.value)}><option value="ORIGEM">Origem</option><option value="DESTINO">Destino</option><option value="PARADA">Nova parada</option></select></label></div>
    <MapaWeb pontos={mapPoints} onSelecionar={choosePin} altura={430}/>
    <button className="be-btn primary" disabled={busy} type="submit">Salvar configuração</button>
   </form>
   {selected&&<>
    <h3>Paradas do itinerário</h3><p className="be-muted">A ordem nesta lista define a ordem manual da rota FIXA. A alteração remove logicamente paradas omitidas pelo backend.</p>
    <div className="be-list">{pontos.map((p,i)=><div className="be-item be-row" key={p.id||i}><strong>{i+1}. {p.nome}</strong><div className="be-actions">
     <button className="be-btn" type="button" disabled={i===0} onClick={()=>setPontos(ps=>{const a=[...ps];[a[i-1],a[i]]=[a[i],a[i-1]];return a;})}>↑</button>
     <button className="be-btn" type="button" disabled={i===pontos.length-1} onClick={()=>setPontos(ps=>{const a=[...ps];[a[i+1],a[i]]=[a[i],a[i+1]];return a;})}>↓</button>
     <button className="be-btn" type="button" onClick={()=>{setPicking('PARADA');setPointIndex(i);setPointForm({...p});}}>Editar</button>
     <button className="be-btn danger" type="button" onClick={()=>{if(window.confirm('Remover esta parada da configuração?'))setPontos(ps=>ps.filter((_,j)=>i!==j));}}>Remover</button>
    </div></div>)}</div>
    <div className="be-form"><label>Nome da parada<input value={pointForm.nome} onChange={e=>setPointForm(p=>({...p,nome:e.target.value}))}/></label><label>Horário indicativo<input type="time" value={pointForm.horario||''} onChange={e=>setPointForm(p=>({...p,horario:e.target.value}))}/></label></div>
    <p className="be-muted">Selecione “Nova parada” acima e clique no mapa para marcar o pin.</p>
    <div className="be-actions"><button className="be-btn" type="button" onClick={addPoint}>{pointIndex===null?'Adicionar parada':'Atualizar parada'}</button><button className="be-btn primary" disabled={busy} onClick={saveStops}>Salvar ordem e paradas</button></div>
    <h3>Publicação e planejamento</h3><div className="be-actions"><button className="be-btn" disabled={busy} onClick={()=>{if(window.confirm('Alterar visibilidade da rota?'))write(()=>api('/rotas-publicas/'+validId(selected)+'/publicacao',json('PUT',{valor:!rotas.find(r=>String(r.id)===selected)?.publicada})),'Publicação atualizada.');}}>Publicar / despublicar</button>
    <label>Sentido<select value={sentido} onChange={e=>setSentido(e.target.value)}><option value="IDA">Ida</option><option value="VOLTA">Volta</option></select></label><button className="be-btn" disabled={busy} onClick={()=>write(async()=>{const r=await api('/rotas-publicas/'+validId(selected)+'/planejamento?sentido='+sentido+'&otimizar=false',{method:'POST'});if(!Array.isArray(r)||!r.every(coordenadaValida))throw Error('Planejamento inválido.');setPreview(normalizarPontos(r));return null;},'Prévia consultada.')}>Prévia da rota</button></div>
    {preview.length>0&&<MapaWeb pontos={preview} altura={320}/>}
   </>}
  </section>}
 </section>;
}
