'use client';

import {useEffect,useState} from 'react';
import MapaOperacional,{pontoValido} from './MapaOperacional';

export default function ColetaPrivadaWeb({api,turmaId,driver}) {
  const [sentido,setSentido]=useState('IDA'),[config,setConfig]=useState(null),[modo,setModo]=useState('PORTA_A_PORTA');
  const [paradas,setParadas]=useState([]),[novaParada,setNovaParada]=useState(''),[selecionada,setSelecionada]=useState('');
  const [erro,setErro]=useState(''),[aviso,setAviso]=useState(''),[busy,setBusy]=useState(false),[carregando,setCarregando]=useState(true);
  const [aberto,setAberto]=useState(false);
  useEffect(()=>{
    if(!aberto)return;
    let ativo=true;
    Promise.resolve().then(async()=>{
      setCarregando(true);setErro('');setConfig(null);
      try{
        const r=await api(`/turmas/${turmaId}/coleta/${sentido}`);
        if(!r||!Number.isSafeInteger(r.versao)||!Array.isArray(r.paradas))throw Error('Configuração da coleta inválida.');
        if(ativo){setConfig(r);setModo(r.modo);setParadas(r.paradas);setSelecionada(String(r.escolhidaId||''));}
      }catch(e){if(ativo)setErro(e.message);}finally{if(ativo)setCarregando(false);}
    });return()=>{ativo=false;};
  },[aberto,api,turmaId,sentido]);
  function pin(p){
    if(!novaParada.trim()){setErro('Dê um nome à parada antes de selecionar um ponto.');return;}
    if(paradas.length>=50){setErro('Limite de 50 paradas.');return;}
    setParadas(list=>[...list,{nome:novaParada.trim(),latitude:p.latitude,longitude:p.longitude,horario:null}]);
    setNovaParada('');setErro('');
  }
  function move(i,j){setParadas(l=>{if(j<0||j>=l.length)return l;const a=[...l];[a[i],a[j]]=[a[j],a[i]];return a;});}
  async function salvar(){
    if(busy||!config||!driver)return;
    if(modo==='PARADAS_DEFINIDAS'&&(paradas.length<1||paradas.length>50)){setErro('Configure entre 1 e 50 paradas.');return;}
    if(modo==='PORTA_A_PORTA'&&paradas.length){setErro('Porta a porta não pode ter paradas definidas.');return;}
    if(paradas.some(p=>!p.nome?.trim()||!pontoValido(p.latitude,p.longitude))){setErro('Revise as paradas e os pins.');return;}
    if(!window.confirm('Salvar a coleta desta turma e sentido? O servidor impedirá mudanças incompatíveis com viagens e presenças.'))return;
    setBusy(true);setErro('');setAviso('');
    try{
      const r=await api(`/turmas/${turmaId}/coleta/${sentido}`,{method:'PUT',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({modo,versao:config.versao,paradas:modo==='PORTA_A_PORTA'?[]:paradas.map(p=>({...(p.id?{id:p.id}:{}),nome:p.nome.trim(),latitude:p.latitude,longitude:p.longitude,horario:p.horario||null,pontoConfirmado:true}))})});
      if(r?.turmaId!==turmaId||r.sentido!==sentido||!Number.isSafeInteger(r.versao)||r.versao===config.versao)throw Error('Coleta não confirmada. Consulte a configuração antes de repetir.');
      setConfig(r);setModo(r.modo);setParadas(r.paradas);setAviso('Coleta atualizada.');
    }catch(e){setErro(e.message);}finally{setBusy(false);}
  }
  async function escolher(){
    if(busy||!config||driver)return;
    if(!selecionada){setErro('Escolha uma parada antes de continuar.');return;}
    setBusy(true);setErro('');setAviso('');
    try{
      await api(`/turmas/${turmaId}/coleta/${sentido}/minha-parada`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({paradaId:Number(selecionada),versao:config.versao})});
      const r=await api(`/turmas/${turmaId}/coleta/${sentido}`);
      if(r?.escolhidaId!==Number(selecionada))throw Error('A escolha não foi confirmada. Verifique com o motorista.');
      setConfig(r);setAviso('Parada de embarque registrada.');
    }catch(e){setErro(e.message);}finally{setBusy(false);}
  }
  async function removerEscolha(){
    if(busy||!config||driver||!window.confirm('Remover minha parada escolhida?'))return;
    setBusy(true);setErro('');setAviso('');
    try{
      await api(`/turmas/${turmaId}/coleta/${sentido}/minha-parada`,{method:'DELETE'});
      const r=await api(`/turmas/${turmaId}/coleta/${sentido}`);
      setConfig(r);setSelecionada('');setAviso('Escolha removida.');
    }catch(e){setErro(e.message);}finally{setBusy(false);}
  }
  const pontos=paradas.filter(p=>pontoValido(p.latitude,p.longitude)).map(p=>({...p,tipo:'parada'}));
  return <section className="be-section">
    <div className="be-actions"><button type="button" className="be-btn" onClick={()=>setAberto(a=>!a)}>{aberto?'Fechar coleta':driver?'Gerenciar pontos de embarque':'Escolher ponto de embarque'}</button></div>
    {aberto&&<div className="be-card">
      <h3>Coleta da turma #{turmaId}</h3>
      <label>Sentido<select value={sentido} onChange={e=>setSentido(e.target.value)}><option value="IDA">Ida</option><option value="VOLTA">Volta</option></select></label>
      {erro&&<p role="alert" className="be-error">{erro}</p>}{aviso&&<p role="status">{aviso}</p>}
      {carregando?<p>Consultando a configuração…</p>:config&&<>
        {driver?<><div className="be-fieldset"><label>Modo<select value={modo} onChange={e=>{setModo(e.target.value);if(e.target.value==='PORTA_A_PORTA')setParadas([]);}}><option value="PORTA_A_PORTA">Porta a porta</option><option value="PARADAS_DEFINIDAS">Paradas definidas</option></select></label></div>
        {modo==='PARADAS_DEFINIDAS'&&<><label>Nova parada<input value={novaParada} onChange={e=>setNovaParada(e.target.value)} placeholder="Nome da parada"/></label>
          <MapaOperacional titulo="Marcar pontos da coleta privada" pontos={pontos} onPick={pin} privado/>
          {paradas.length>0&&<div className="be-list">{paradas.map((p,i)=><div key={p.id||'new'+i} className="be-item">
            <strong>{i+1}. {p.nome}</strong><div className="be-actions"><button type="button" className="be-btn" onClick={()=>move(i,i-1)} disabled={i===0}>Subir</button><button type="button" className="be-btn" onClick={()=>move(i,i+1)} disabled={i===paradas.length-1}>Descer</button><button type="button" className="be-btn danger" onClick={()=>setParadas(a=>a.filter((_,j)=>i!==j))}>Remover</button></div>
          </div>)}</div>}</>}
        <button type="button" className="be-btn primary" disabled={busy} onClick={salvar}>Salvar coleta de {sentido==='IDA'?'ida':'volta'}</button></>:
        config.modo==='PORTA_A_PORTA'?<p>Esta turma usa embarque no endereço residencial escolhido na presença.</p>:
        <><p>Escolha sua parada. O passageiro só pode alterar a própria seleção; a versão do roteiro é validada no servidor.</p>
          <label>Minha parada<select value={selecionada} onChange={e=>setSelecionada(e.target.value)}><option value="">Selecione</option>{config.paradas.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
          {config.sugestao?.parada&&<p className="be-muted">Sugestão por distância aproximada: {config.sugestao.parada.nome}. Ela não foi selecionada automaticamente.</p>}
          <div className="be-actions"><button type="button" className="be-btn primary" disabled={busy||!selecionada} onClick={escolher}>Salvar minha parada</button><button type="button" className="be-btn" disabled={busy||!config.escolhidaId} onClick={removerEscolha}>Remover escolha</button></div>
          <MapaOperacional titulo="Paradas autorizadas da turma" pontos={pontos} privado/>
        </>}
      </>}
    </div>}
  </section>;
}
