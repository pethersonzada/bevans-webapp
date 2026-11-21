'use client';
import {useCallback,useEffect,useState} from 'react';
import MapaWeb,{coordenadaValida} from './MapaWeb';

const vazio={apelido:'',rua:'',numero:'',bairro:'',complemento:'',latitude:null,longitude:null};
const positive=v=>{if(!/^[1-9][0-9]*$/.test(String(v))||!Number.isSafeInteger(Number(v)))throw Error('ID inválido.');return Number(v);};
const error=e=>e instanceof Error?e.message:'Erro ao consultar os endereços.';
const request=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
function EnderecoEditor({api,profile,onConcluir}){
 const [enderecos,setEnderecos]=useState([]),[editId,setEditId]=useState(null),[form,setForm]=useState(vazio),[erro,setErro]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const reload=useCallback(async()=>{setErro('');setLoading(true);try{
  const r=await api('/enderecos/usuario/'+positive(profile.id));
  if(!Array.isArray(r))throw Error('A API retornou uma lista inválida.');
  setEnderecos(r);
 }catch(e){setErro(error(e));}finally{setLoading(false);}
 },[api,profile.id]);
 useEffect(()=>{Promise.resolve().then(()=>reload());},[reload]);
 const patch=(key,value)=>setForm(p=>({...p,[key]:value}));
 const cancel=()=>{setEditId(null);setForm(vazio);};
 async function save(e){
  e.preventDefault();
  if(busy)return;
  if(!form.apelido.trim()||!form.rua.trim()||!form.numero.trim()||!form.bairro.trim()||!coordenadaValida(form))return setErro('Preencha os campos e confirme o endereço no mapa.');
  setBusy(true);setErro('');
  try{
   const body={...form,apelido:form.apelido.trim(),rua:form.rua.trim(),numero:form.numero.trim(),bairro:form.bairro.trim(),complemento:form.complemento.trim()};
   const r=await api(editId?'/enderecos/'+positive(editId):'/enderecos/usuario/'+positive(profile.id),request(editId?'PUT':'POST',body));
   if(!r||!Number.isSafeInteger(r.id)||!coordenadaValida(r))throw Error('Servidor não confirmou o endereço salvo. Atualize antes de tentar novamente.');
   cancel();await reload();onConcluir?.();
  }catch(e){setErro(error(e));}finally{setBusy(false);}
 }
 async function remove(a){
  if(busy||!window.confirm('Excluir o endereço '+a.apelido+'? Confirme que não está sendo usado numa presença.'))return;
  setBusy(true);setErro('');
  try{await api('/enderecos/'+positive(a.id),{method:'DELETE'});await reload();onConcluir?.();}
  catch(e){setErro(error(e));}finally{setBusy(false);}
 }
 const selecionado=coordenadaValida(form)?[{latitude:form.latitude,longitude:form.longitude,nome:form.apelido||'Ponto selecionado'}]:[];
 return <div className="be-live-stack">
  <section className="be-card"><div className="be-row"><h2>Meus endereços</h2><button type="button" className="be-btn" onClick={reload}>Atualizar</button></div>
   {erro&&<p role="alert" className="be-error">{erro}</p>}
   {loading?<p>Carregando…</p>:<div className="be-grid">{enderecos.map(a=><div className="be-item" key={a.id}><strong>{a.apelido}</strong><p>{a.rua}, {a.numero} · {a.bairro}</p><div className="be-actions"><button type="button" className="be-btn" onClick={()=>{setEditId(a.id);setForm({...vazio,...a});}}>Editar</button><button type="button" className="be-btn danger" disabled={busy} onClick={()=>remove(a)}>Excluir</button></div></div>)}</div>}
   {!enderecos.length&&!loading&&<p className="be-muted">Nenhum endereço cadastrado.</p>}
  </section>
  <section className="be-card"><h2>{editId?'Editar endereço':'Novo endereço'}</h2>
   <form className="be-form" onSubmit={save}>
    {['apelido','rua','numero','bairro','complemento'].map(key=><label key={key}>{({apelido:'Apelido',rua:'Rua',numero:'Número',bairro:'Bairro',complemento:'Complemento'})[key]}<input required={key!=='complemento'} value={form[key]||''} onChange={e=>patch(key,e.target.value)} /></label>)}
    <label>Latitude<input type="number" step="any" min="-90" max="90" value={form.latitude??''} onChange={e=>patch('latitude',e.target.value===''?null:Number(e.target.value))}/></label>
    <label>Longitude<input type="number" step="any" min="-180" max="180" value={form.longitude??''} onChange={e=>patch('longitude',e.target.value===''?null:Number(e.target.value))}/></label>
    <p className="be-muted">Defina o ponto exato no mapa. A busca aproximada por rua não substitui a confirmação do número.</p>
    <MapaWeb pontos={selecionado} onSelecionar={p=>setForm(prev=>({...prev,...p}))} altura={320}/>
    <div className="be-actions"><button className="be-btn primary" disabled={busy||!coordenadaValida(form)}>{busy?'Salvando…':'Salvar endereço'}</button>{editId&&<button type="button" className="be-btn" onClick={cancel}>Cancelar edição</button>}</div>
   </form>
  </section>
 </div>;
}
function OrigemDestino({api,profile}){
 const [turmas,setTurmas]=useState([]),[selected,setSelected]=useState(''),[tipo,setTipo]=useState('ORIGEM'),[nome,setNome]=useState(''),[coord,setCoord]=useState(null),[erro,setErro]=useState(''),[busy,setBusy]=useState(false);
 const reload=useCallback(async()=>{
  try{const r=await api('/turmas/motorista/'+positive(profile.id));if(!Array.isArray(r))throw Error('Lista de turmas inválida.');setTurmas(r);}
  catch(e){setErro(error(e));}
 },[api,profile.id]);
 useEffect(()=>{Promise.resolve().then(()=>reload());},[reload]);
 function escolherPonto(turma,tipoAtual){const prefix=tipoAtual==='ORIGEM'?'origem':'destino';setNome(turma?.[prefix+'Nome']||'');const p={latitude:turma?.[prefix+'Latitude'],longitude:turma?.[prefix+'Longitude']};setCoord(coordenadaValida(p)?p:null);}
 async function save(){
  if(!selected||!nome.trim()||!coordenadaValida(coord)||busy)return;
  setBusy(true);setErro('');
  try{
   const prefix=tipo==='ORIGEM'?'origem':'destino';
   const body={[prefix+'Nome']:nome.trim(),[prefix+'Latitude']:coord.latitude,[prefix+'Longitude']:coord.longitude};
   const r=await api('/turmas/'+positive(selected),request('PUT',body));
   if(!r||r.id!==Number(selected)||Math.abs(r[prefix+'Latitude']-coord.latitude)>1e-7||Math.abs(r[prefix+'Longitude']-coord.longitude)>1e-7)throw Error('Origem/destino não confirmados no servidor.');
   await reload();
  }catch(e){setErro(error(e));}finally{setBusy(false);}
 }
 return <section className="be-card"><h2>Pontos das turmas (motorista)</h2>
  {erro&&<p className="be-error" role="alert">{erro}</p>}
  <div className="be-fieldset"><label>Turma<select value={selected} onChange={e=>{setSelected(e.target.value);escolherPonto(turmas.find(t=>String(t.id)===e.target.value),tipo);}}><option value="">Selecione</option>{turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></label>
  <label>Ponto<select value={tipo} onChange={e=>{setTipo(e.target.value);escolherPonto(turmas.find(t=>String(t.id)===selected),e.target.value);}}><option value="ORIGEM">Origem / garagem</option><option value="DESTINO">Destino</option></select></label></div>
  {selected&&<><div className="be-form"><label>Nome do ponto<input value={nome} onChange={e=>setNome(e.target.value)} required/></label></div>
  <MapaWeb pontos={coord?[{...coord,nome:nome||tipo}]:[]} onSelecionar={setCoord} altura={320}/>
  <button type="button" className="be-btn primary" disabled={busy||!nome.trim()||!coordenadaValida(coord)} onClick={save}>Salvar {tipo==='ORIGEM'?'origem':'destino'}</button></>}
 </section>;
}
export default function EnderecosWeb({api,profile,driver}){
 return <section className="be-section"><div className="be-row"><h2>Endereços e pontos</h2></div><p className="be-muted">Cadastro protegido por sua conta. O backend valida a propriedade de cada endereço e turma.</p>
 {driver&&<OrigemDestino api={api} profile={profile}/>}
 <EnderecoEditor api={api} profile={profile}/>
 </section>;
}
