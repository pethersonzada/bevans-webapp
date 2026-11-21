'use client';

import {useState} from 'react';
import MapaOperacional,{pontoValido} from './MapaOperacional';
import ColetaPrivadaWeb from './ColetaPrivadaWeb';

export default function GestaoTurmaWeb({api,turma,onAtualizar}){
  const [aberto,setAberto]=useState(false),[carregando,setCarregando]=useState(false),[busy,setBusy]=useState(false),[erro,setErro]=useState(''),[aviso,setAviso]=useState('');
  const [passageiros,setPassageiros]=useState(null),[alvo,setAlvo]=useState('origem');
  const [form,setForm]=useState(()=>({
    nome:turma.nome||'',turno:turma.turno||'',capacidade:turma.capacidade||'',
    origemNome:turma.origemNome||'',origemLatitude:turma.origemLatitude??null,origemLongitude:turma.origemLongitude??null,
    destinoNome:turma.destinoNome||'',destinoLatitude:turma.destinoLatitude??null,destinoLongitude:turma.destinoLongitude??null,
  }));
  const id=turma.id;
  async function carregar(){
    setCarregando(true);setErro('');
    try{const r=await api(`/turmas/${id}/passageiros`);if(!Array.isArray(r))throw Error('Lista de passageiros indisponível.');setPassageiros(r);}
    catch(e){setErro(e.message);}finally{setCarregando(false);}
  }
  function editar(campo,valor){setForm(f=>({...f,[campo]:valor}));}
  function pin(p){setForm(f=>({...f,[alvo+'Latitude']:p.latitude,[alvo+'Longitude']:p.longitude}));}
  async function salvar(e){
    e.preventDefault();if(busy)return;setErro('');setAviso('');
    if(!form.nome.trim()||!form.turno.trim()||!Number.isSafeInteger(Number(form.capacidade))||Number(form.capacidade)<=0){setErro('Informe nome, turno e capacidade válida.');return;}
    const orig=form.origemNome.trim(),dest=form.destinoNome.trim();
    if((orig||form.origemLatitude!==null||form.origemLongitude!==null)&&(!orig||!pontoValido(form.origemLatitude,form.origemLongitude))){setErro('Confirme a origem completa no mapa.');return;}
    if((dest||form.destinoLatitude!==null||form.destinoLongitude!==null)&&(!dest||!pontoValido(form.destinoLatitude,form.destinoLongitude))){setErro('Confirme o destino completo no mapa.');return;}
    setBusy(true);
    try{
      const body={nome:form.nome.trim(),turno:form.turno.trim(),capacidade:Number(form.capacidade)};
      if(orig)Object.assign(body,{origemNome:orig,origemLatitude:form.origemLatitude,origemLongitude:form.origemLongitude});
      if(dest)Object.assign(body,{destinoNome:dest,destinoLatitude:form.destinoLatitude,destinoLongitude:form.destinoLongitude});
      const r=await api(`/turmas/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(r?.id!==id)throw Error('A API não confirmou a turma atualizada.');
      setAviso('Dados da turma atualizados.');onAtualizar();
    }catch(e){setErro(e.message);}finally{setBusy(false);}
  }
  async function regen(){
    if(busy||!window.confirm('Gerar novo código? O código antigo deixará de funcionar para novas solicitações.'))return;
    setBusy(true);setErro('');setAviso('');
    try{const r=await api(`/turmas/${id}/regenerar-codigo`,{method:'PUT'});if(r?.id!==id||!r.codigoConvite)throw Error('Código não confirmado.');setAviso(`Novo código: ${r.codigoConvite}`);onAtualizar();}
    catch(e){setErro(e.message);}finally{setBusy(false);}
  }
  async function remover(p){
    if(busy||!window.confirm(`Remover ${p.nome||'este passageiro'} da turma? Isso revoga o vínculo aprovado.`))return;
    setBusy(true);setErro('');setAviso('');
    try{await api(`/turmas/${id}/alunos/${p.id}`,{method:'DELETE'});await carregar();setAviso('Vínculo removido.');onAtualizar();}
    catch(e){setErro(e.message);}finally{setBusy(false);}
  }
  async function excluir(){
    if(busy||!window.confirm(`Excluir a turma "${turma.nome}"? O servidor pode bloquear a exclusão por vínculos ou viagem ativa.`))return;
    setBusy(true);setErro('');setAviso('');
    try{await api(`/turmas/${id}`,{method:'DELETE'});onAtualizar();setAberto(false);}
    catch(e){setErro(e.message);}finally{setBusy(false);}
  }
  const points=[];
  if(pontoValido(form.origemLatitude,form.origemLongitude))points.push({nome:form.origemNome||'Origem',latitude:form.origemLatitude,longitude:form.origemLongitude,tipo:'origem'});
  if(pontoValido(form.destinoLatitude,form.destinoLongitude))points.push({nome:form.destinoNome||'Destino',latitude:form.destinoLatitude,longitude:form.destinoLongitude,tipo:'destino'});
  return <div className="be-section">
    <button type="button" className="be-btn" onClick={()=>{setAberto(a=>!a);setErro('');}}> {aberto?'Fechar gestão':'Gerenciar turma'}</button>
    {aberto&&<section className="be-card">
      <h3>Gestão da turma #{id}</h3><p className="be-muted">Altere o percurso apenas quando não houver viagem ativa. O backend aplica capacidade e permissão do motorista.</p>
      {erro&&<p role="alert" className="be-error">{erro}</p>}{aviso&&<p role="status">{aviso}</p>}
      <form className="be-form" onSubmit={salvar}>
        <div className="be-fieldset"><label>Nome<input required value={form.nome} onChange={e=>editar('nome',e.target.value)}/></label>
        <label>Turno<input required value={form.turno} onChange={e=>editar('turno',e.target.value)}/></label>
        <label>Capacidade<input required min="1" type="number" value={form.capacidade} onChange={e=>editar('capacidade',e.target.value)}/></label>
        <label>Origem<input value={form.origemNome} onChange={e=>editar('origemNome',e.target.value)}/></label>
        <label>Destino<input value={form.destinoNome} onChange={e=>editar('destinoNome',e.target.value)}/></label></div>
        <div className="be-actions"><label>Selecionar no mapa<select value={alvo} onChange={e=>setAlvo(e.target.value)}><option value="origem">Origem</option><option value="destino">Destino</option></select></label></div>
        <MapaOperacional titulo="Confirmar origem e destino da turma" pontos={points} onPick={pin} privado/>
        <div className="be-actions"><button className="be-btn primary" disabled={busy}>Salvar turma</button><button type="button" className="be-btn" onClick={regen} disabled={busy}>Regenerar código de convite</button></div>
      </form>
      <ColetaPrivadaWeb api={api} turmaId={id} driver/>
      <div className="be-actions"><button type="button" className="be-btn" onClick={carregar} disabled={carregando||busy}>{carregando?'Carregando…':'Consultar passageiros'}</button></div>
      {passageiros!==null&&(passageiros.length?<div className="be-list">{passageiros.map(p=><div className="be-item" key={p.id}><strong>{p.nome||`Passageiro #${p.id}`}</strong><div className="be-actions"><button type="button" className="be-btn danger" disabled={busy} onClick={()=>remover(p)}>Remover vínculo</button></div></div>)}</div>:<p>Nenhum passageiro aprovado.</p>)}
      <div className="be-actions"><button type="button" className="be-btn danger" onClick={excluir} disabled={busy}>Excluir turma</button></div>
    </section>}
  </div>;
}
