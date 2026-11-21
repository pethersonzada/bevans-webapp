'use client';

import {useCallback,useEffect,useState} from 'react';
import MapaOperacional,{pontoValido} from './MapaOperacional';

const vazia={apelido:'',rua:'',numero:'',bairro:'',complemento:'',latitude:null,longitude:null};
export default function EnderecosWeb({api,usuarioId}) {
  const [lista,setLista]=useState([]),[form,setForm]=useState(vazia),[editando,setEditando]=useState(null);
  const [erro,setErro]=useState(''),[info,setInfo]=useState(''),[carregando,setCarregando]=useState(true),[salvando,setSalvando]=useState(false);
  const carregar=useCallback(async()=>{
    setCarregando(true);setErro('');
    try{const r=await api(`/enderecos/usuario/${usuarioId}`);if(!Array.isArray(r))throw Error('Lista de endereços inválida.');setLista(r);}
    catch(e){setErro(e.message);}
    finally{setCarregando(false);}
  },[api,usuarioId]);
  useEffect(()=>{Promise.resolve().then(carregar);},[carregar]);
  function novo(){setForm({...vazia});setEditando(null);setInfo('');}
  function editar(item){setEditando(item.id);setForm({apelido:item.apelido||'',rua:item.rua||'',numero:item.numero||'',bairro:item.bairro||'',complemento:item.complemento||'',latitude:item.latitude,longitude:item.longitude});setInfo('');}
  function pick(p){setForm(f=>({...f,latitude:p.latitude,longitude:p.longitude}));setInfo('Ponto selecionado. Confira se corresponde ao endereço correto.');}
  function usarMinhaPosicao(){
    if(!window.isSecureContext||!navigator.geolocation){setErro('É necessário usar HTTPS e permitir localização no navegador.');return;}
    navigator.geolocation.getCurrentPosition(p=>pick({latitude:p.coords.latitude,longitude:p.coords.longitude}),e=>setErro(e.message),{enableHighAccuracy:true,timeout:12000,maximumAge:0});
  }
  async function salvar(e){
    e.preventDefault();if(salvando)return;setErro('');setInfo('');
    if(!pontoValido(form.latitude,form.longitude)){setErro('Selecione um ponto válido no mapa.');return;}
    if(!form.apelido.trim()||!form.rua.trim()||!form.bairro.trim()){setErro('Informe apelido, rua e bairro.');return;}
    setSalvando(true);
    try{
      const id=editando;
      const path=id?`/enderecos/${id}`:`/enderecos/usuario/${usuarioId}`;
      const body={...form,apelido:form.apelido.trim(),rua:form.rua.trim(),bairro:form.bairro.trim()};
      const saved=await api(path,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!saved?.id||id&&saved.id!==id)throw Error('O servidor não confirmou o endereço. Atualize antes de repetir.');
      novo();setInfo('Endereço salvo.');await carregar();
    }catch(ex){setErro(ex.message);}finally{setSalvando(false);}
  }
  async function apagar(item){
    if(salvando||!window.confirm(`Excluir o endereço "${item.apelido||item.rua}"? Confirme que ele não está sendo usado em uma viagem.`))return;
    setSalvando(true);setErro('');setInfo('');
    try{await api(`/enderecos/${item.id}`,{method:'DELETE'});if(editando===item.id)novo();setInfo('Exclusão processada.');await carregar();}
    catch(e){setErro(e.message);}finally{setSalvando(false);}
  }
  const ponto=pontoValido(form.latitude,form.longitude)?[{nome:form.apelido||'Ponto escolhido',latitude:form.latitude,longitude:form.longitude,tipo:'parada'}]:[];
  return <section className="be-section" aria-label="Endereços salvos">
    <div className="be-row"><h2>Meus endereços</h2><button type="button" className="be-btn" onClick={carregar}>Atualizar lista</button></div>
    {erro&&<p className="be-error" role="alert">{erro}</p>}
    {info&&<p role="status">{info}</p>}
    {carregando?<p className="be-muted">Carregando…</p>:lista.length?<div className="be-list">{lista.map(p=><div className="be-item" key={p.id}>
      <strong>{p.apelido||'Endereço'}</strong><p>{[p.rua,p.numero,p.bairro].filter(Boolean).join(', ')}</p>
      <div className="be-actions"><button type="button" className="be-btn" onClick={()=>editar(p)} disabled={salvando}>Editar</button><button type="button" className="be-btn danger" onClick={()=>apagar(p)} disabled={salvando}>Excluir</button></div>
    </div>)}</div>:<p className="be-muted">Nenhum endereço cadastrado.</p>}
    <div className="be-card"><h3>{editando?'Editar endereço':'Cadastrar endereço'}</h3><form className="be-form" onSubmit={salvar}>
      <div className="be-fieldset">
        <label>Apelido<input required maxLength={80} value={form.apelido} onChange={e=>setForm(f=>({...f,apelido:e.target.value}))} placeholder="Casa"/></label>
        <label>Rua<input required value={form.rua} onChange={e=>setForm(f=>({...f,rua:e.target.value}))}/></label>
        <label>Número<input value={form.numero} onChange={e=>setForm(f=>({...f,numero:e.target.value}))}/></label>
        <label>Bairro<input required value={form.bairro} onChange={e=>setForm(f=>({...f,bairro:e.target.value}))}/></label>
        <label>Complemento<input value={form.complemento} onChange={e=>setForm(f=>({...f,complemento:e.target.value}))}/></label>
      </div>
      <div className="be-actions"><button type="button" className="be-btn" onClick={usarMinhaPosicao}>Usar minha localização agora</button>
        <span className="be-muted">{ponto.length?`${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}`:'Ponto ainda não confirmado'}</span></div>
      <MapaOperacional titulo="Selecione o local de embarque no mapa" pontos={ponto} onPick={pick}/>
      <p className="be-footnote">O pin precisa corresponder ao endereço real. A geolocalização do aparelho pode ser imprecisa; revise o ponto antes de salvar.</p>
      <div className="be-actions"><button className="be-btn primary" disabled={salvando||!ponto.length}>{salvando?'Salvando…':editando?'Salvar alterações':'Adicionar endereço'}</button>
        {editando&&<button type="button" className="be-btn" onClick={novo}>Cancelar edição</button>}</div>
    </form></div>
  </section>;
}
