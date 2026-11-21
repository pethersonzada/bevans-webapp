'use client';
import {useCallback,useEffect,useState} from 'react';
import MapaWeb,{coordenadaValida,normalizarPontos} from './MapaWeb';
const json=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const positive=x=>{if(!/^[1-9][0-9]*$/.test(String(x))||!Number.isSafeInteger(Number(x)))throw Error('Identificador inválido.');return Number(x);};
const message=e=>e instanceof Error?e.message:'Ocorreu uma falha.';
const empty={titulo:'',destinoNome:'',destinoLatitude:null,destinoLongitude:null,origemNome:'',origemLatitude:null,origemLongitude:null,partidaEm:'',retornoEm:'',capacidade:12};
function inputISO(text){if(!text)return null;const d=new Date(text);if(!Number.isFinite(d.getTime()))throw Error('Data inválida.');return d.toISOString();}
function fromISO(text){if(!text)return '';const d=new Date(text);if(!Number.isFinite(d.getTime()))return '';return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
export default function GestaoExcursaoWeb({api}){
 const [list,setList]=useState([]),[selected,setSelected]=useState(''),[editing,setEditing]=useState(false),[form,setForm]=useState(empty),[detail,setDetail]=useState(null),[pontos,setPontos]=useState([]),[inscritos,setInscritos]=useState([]),[convites,setConvites]=useState([]),[execucoes,setExecucoes]=useState([]),[sentido,setSentido]=useState('IDA'),[preview,setPreview]=useState([]),[validade,setValidade]=useState(''),[conviteToken,setConviteToken]=useState(''),[error,setError]=useState(''),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false);
 const refresh=useCallback(async()=>{setError('');try{const p=await api('/excursoes?pagina=0&tamanho=50');if(!Array.isArray(p?.itens))throw Error('Lista inválida.');setList(p.itens);}catch(e){setError(message(e));}},[api]);
 useEffect(()=>{refresh();},[refresh]);
 async function open(key){
  setSelected(String(key));setPreview([]);setConviteToken('');setError('');setEditing(false);
  try{
   const n=positive(key);
   const [d,p,i,c,x]=await Promise.all([
    api('/excursoes/'+n),
    api('/excursoes/'+n+'/inscricoes?pagina=0&tamanho=50'),
    api('/excursoes/'+n+'/inscricoes/vagas'),
    api('/excursoes/'+n+'/convites'),
    api('/excursoes/'+n+'/execucoes')
   ]);
   if(!d||d.id!==n||!Array.isArray(p?.itens)||!Array.isArray(c)||!Array.isArray(x))throw Error('Dados da excursão incompletos.');
   setDetail({...d,vagas:i});setInscritos(p.itens);setConvites(c);setExecucoes(x);setPontos(normalizarPontos(d.paradas));
   setForm({...empty,...d,partidaEm:fromISO(d.partidaEm),retornoEm:fromISO(d.retornoEm)});
  }catch(e){setError(message(e));setDetail(null);}
 }
 async function perform(task,label,reload=true){
  if(busy)return;
  setBusy(true);setError('');setFeedback('');
  try{await task();setFeedback(label);await refresh();if(reload&&selected)await open(selected);}
  catch(e){setError(message(e));}finally{setBusy(false);}
 }
 async function save(e){
  e.preventDefault();
  const newDoc=!detail;
  if(!coordenadaValida({latitude:form.destinoLatitude,longitude:form.destinoLongitude}))return setError('Confirme o destino no mapa.');
  if((form.origemNome||form.origemLatitude!=null||form.origemLongitude!=null)&&!coordenadaValida({latitude:form.origemLatitude,longitude:form.origemLongitude}))return setError('Confirme também a origem.');
  const body={titulo:form.titulo.trim(),destinoNome:form.destinoNome.trim(),destinoLatitude:form.destinoLatitude,destinoLongitude:form.destinoLongitude,
   origemNome:form.origemNome.trim()||null,origemLatitude:form.origemNome.trim()?form.origemLatitude:null,origemLongitude:form.origemNome.trim()?form.origemLongitude:null,
   partidaEm:inputISO(form.partidaEm),retornoEm:inputISO(form.retornoEm),capacidade:Number(form.capacidade)};
  if(detail)body.versao=detail.versao;
  await perform(async()=>{
   const r=await api(detail?'/excursoes/'+positive(detail.id):'/excursoes',json(detail?'PUT':'POST',body));
   if(!r||!Number.isSafeInteger(r.id))throw Error('Servidor não confirmou a edição. Consulte antes de repetir.');
   setSelected(String(r.id));setDetail(r);setEditing(false);
  },newDoc?'Excursão cadastrada.':'Excursão atualizada.',false);
  if(!newDoc&&selected)await open(selected);
  else await refresh();
 }
 function updateField(key,value){setForm(p=>({...p,[key]:value}));}
 const chosen=selected?list.find(x=>String(x.id)===selected):null;
 const stops=normalizarPontos([
  {nome:'Origem',latitude:form.origemLatitude,longitude:form.origemLongitude},
  ...pontos,
  {nome:'Destino',latitude:form.destinoLatitude,longitude:form.destinoLongitude}
 ]);
 async function plan(){
  await perform(async()=>{const p=await api('/excursoes/'+positive(selected)+'/planejamento?sentido='+sentido+'&otimizar=false',{method:'POST'});if(!Array.isArray(p)||!p.every(coordenadaValida))throw Error('Planejamento incompleto.');setPreview(normalizarPontos(p));},'Prévia carregada.',false);
 }
 async function createInvite(){
  if(!validade)throw setError('Informe o prazo de expiração do convite.');
  await perform(async()=>{
   const r=await api('/excursoes/'+positive(selected)+'/convites',json('POST',{expiraEm:inputISO(validade)}));
   if(!r?.token||!r?.convite?.id)throw Error('Convite não confirmado. Confira antes de gerar outro.');
   setConviteToken(r.token);
  },'Convite emitido. Copie o link agora: o token não poderá ser recuperado.',false);
 }
 const inviteLink=conviteToken&&typeof window!=='undefined'?window.location.origin+'/convite#'+encodeURIComponent(conviteToken):'';
 return <section className="be-section">
  <div className="be-row"><h2>Gerenciar excursões</h2><div className="be-actions"><button type="button" className="be-btn" onClick={refresh}>Atualizar</button><button type="button" className="be-btn primary" onClick={()=>{setDetail(null);setSelected('');setEditing(true);setForm(empty);setPreview([]);}}>Criar excursão</button></div></div>
  {error&&<p className="be-error" role="alert">{error}</p>}{feedback&&<p className="be-alert" role="status">{feedback}</p>}
  <div className="be-grid">{list.map(x=><div className="be-card" key={x.id}><h3>{x.titulo}</h3><p>{x.estado} · {x.capacidade} lugares</p><p className="be-muted">{x.destinoNome} · {new Date(x.partidaEm).toLocaleString('pt-BR')}</p><button type="button" className="be-btn" onClick={()=>open(x.id)}>Gerenciar</button></div>)}</div>
  {(editing||detail)&&<section className="be-card be-section">
   <div className="be-row"><h2>{detail?'Excursão #'+detail.id:'Criar excursão'}</h2>{detail&&!editing&&<button type="button" className="be-btn" onClick={()=>setEditing(true)}>Editar</button>}</div>
   {editing&&<form className="be-form" onSubmit={save}>
    <label>Título<input required value={form.titulo} onChange={e=>updateField('titulo',e.target.value)}/></label>
    <label>Destino<input required value={form.destinoNome} onChange={e=>updateField('destinoNome',e.target.value)}/></label>
    <label>Origem operacional (opcional na ida)<input value={form.origemNome||''} onChange={e=>updateField('origemNome',e.target.value)}/></label>
    <label>Partida<input required type="datetime-local" value={form.partidaEm} onChange={e=>updateField('partidaEm',e.target.value)}/></label>
    <label>Retorno (opcional)<input type="datetime-local" value={form.retornoEm||''} onChange={e=>updateField('retornoEm',e.target.value)}/></label>
    <label>Capacidade<input type="number" min="1" required value={form.capacidade} onChange={e=>updateField('capacidade',e.target.value)}/></label>
    <p className="be-muted">Selecione destino ou origem e clique no mapa para definir as coordenadas oficiais.</p>
    <MapaWeb pontos={stops} onSelecionar={p=>setForm(f=>({...f,destinoLatitude:p.latitude,destinoLongitude:p.longitude}))} altura={320}/>
    <p className="be-muted">Clique no mapa para definir o destino. Para origem, use o botão abaixo e clique novamente.</p>
    <button type="button" className="be-btn" onClick={()=>{if(coordenadaValida({latitude:form.destinoLatitude,longitude:form.destinoLongitude})){setForm(f=>({...f,origemLatitude:f.destinoLatitude,origemLongitude:f.destinoLongitude}));setFeedback('Origem ajustada para coordenadas do destino. Se forem diferentes, confirme a origem depois.');}}}>Usar destino como referência da origem</button>
    <button className="be-btn primary" disabled={busy||!form.titulo.trim()||!form.destinoNome.trim()}>Salvar excursão</button>
   </form>}
   {detail&&!editing&&<>
    <p><strong>{detail.estado}</strong> · {detail.modoColeta} · versão {detail.versao}</p>
    <p className="be-muted">Vagas: {detail.vagas?.disponiveis??'não informadas'}. Cada alteração é validada pelo backend.</p>
    <div className="be-actions">
     {detail.estado==='RASCUNHO'&&<button className="be-btn primary" disabled={busy} onClick={()=>{if(window.confirm('Publicar a excursão?'))perform(()=>api('/excursoes/'+positive(selected)+'/publicacao',json('PUT',{versao:detail.versao})),'Excursão publicada.');}}>Publicar</button>}
     {['RASCUNHO','PUBLICADA'].includes(detail.estado)&&<button className="be-btn danger" disabled={busy} onClick={()=>{if(window.confirm('Cancelar a excursão? Inscrições e execuções podem ser afetadas.'))perform(()=>api('/excursoes/'+positive(selected)+'/cancelamento',json('PUT',{versao:detail.versao})),'Excursão cancelada.');}}>Cancelar excursão</button>}
    </div>
    <h3>Planejamento e execução</h3>
    <div className="be-fieldset"><label>Sentido<select value={sentido} onChange={e=>setSentido(e.target.value)}><option value="IDA">Ida</option><option value="VOLTA">Volta</option></select></label><button type="button" className="be-btn" disabled={busy} onClick={plan}>Prévia do roteiro oficial</button>
    {detail.estado==='PUBLICADA'&&<button className="be-btn primary" disabled={busy} onClick={()=>{if(window.confirm('Iniciar execução '+sentido+'?'))perform(()=>api('/excursoes/'+positive(selected)+'/execucoes?sentido='+sentido+'&otimizar=false',{method:'POST'}),'Execução iniciada.');}}>Iniciar execução</button>}</div>
    {preview.length>0&&<MapaWeb pontos={preview} altura={340}/>}
    {execucoes.map(x=><div className="be-item" key={x.id}><strong>#{x.id} · {x.sentido} · {x.estado}</strong><div className="be-actions">
     <button className="be-btn" type="button" onClick={()=>setPreview(normalizarPontos(x.pontos))}>Ver pontos</button>
     {x.estado==='EM_ANDAMENTO'&&<button className="be-btn danger" disabled={busy} onClick={()=>{if(window.confirm('Finalizar execução? Confirme todos os desembarques.'))perform(()=>api('/excursoes/'+positive(selected)+'/execucoes/'+positive(x.id)+'/finalizacao',{method:'PUT'}),'Execução finalizada.');}}>Finalizar</button>}
    </div></div>)}
    <h3>Inscrições</h3>
    <div className="be-list">{inscritos.map(p=><div className="be-item" key={p.id}><strong>{p.nome}</strong> · {p.estado}
     {p.estado==='SOLICITADA'&&<button className="be-btn" disabled={busy} onClick={()=>{if(window.confirm('Confirmar a inscrição?'))perform(()=>api('/excursoes/'+positive(selected)+'/inscricoes/'+positive(p.id)+'/confirmacao',{method:'PUT'}),'Inscrição confirmada.');}}>Confirmar inscrição</button>}
    </div>)}</div>
    <h3>Convites</h3><p className="be-muted">Somente o destinatário deve receber o link. O token é entregue apenas no momento da emissão.</p>
    <div className="be-fieldset"><label>Expira em<input type="datetime-local" value={validade} onChange={e=>setValidade(e.target.value)}/></label><button type="button" className="be-btn" disabled={busy} onClick={createInvite}>Emitir convite</button></div>
    {inviteLink&&<div className="be-item"><label>Link individual de convite<input className="be-control" readOnly value={inviteLink}/></label><button type="button" className="be-btn" onClick={()=>navigator.clipboard.writeText(inviteLink)}>Copiar link</button></div>}
    {convites.map(c=><div key={c.id} className="be-item">Convite #{c.id} · {c.revogadoEm?'Revogado':'Válido até '+new Date(c.expiraEm).toLocaleString('pt-BR')}
     {!c.revogadoEm&&<button type="button" className="be-btn danger" disabled={busy} onClick={()=>{if(window.confirm('Revogar convite?'))perform(()=>api('/excursoes/'+positive(selected)+'/convites/'+positive(c.id),{method:'DELETE'}),'Convite revogado.');}}>Revogar</button>}
    </div>)}
   </>}
  </section>}
 </section>;
}
