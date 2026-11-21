'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {conviteRequest,credencialValida} from '../lib/excursao-publica.mjs';
import MapaOperacional,{pontoValido} from '../painel/MapaOperacional';

const vazia={nome:'',contato:'',paradaId:'',nomePonto:'',latitude:null,longitude:null,aceitePrivacidade:false};

export default function InscricaoConvite(){
  const [convite,setConvite]=useState(''),[detalhes,setDetalhes]=useState(null);
  const [inscricaoToken,setInscricaoToken]=useState(''),[inscricao,setInscricao]=useState(null);
  const [form,setForm]=useState(vazia),[carregando,setCarregando]=useState(false),[busy,setBusy]=useState(false),[erro,setErro]=useState(''),[aviso,setAviso]=useState('');
  useEffect(()=>{
    // Retira o fragmento local imediatamente, antes de consultar o serviço.
    const raw=new URLSearchParams(window.location.hash.replace(/^#/,''));const token=raw.get('token')||'';
    if(window.location.hash)window.history.replaceState(null,'',window.location.pathname+window.location.search);
    let ativo=true;
    Promise.resolve().then(async()=>{
      if(!ativo)return;
      if(!credencialValida(token)){setErro('Convite inválido ou ausente. Peça um link novo ao organizador.');return;}
      setConvite(token);
      setCarregando(true);
      try{
        const data=await conviteRequest('/publico/excursoes/convite',{convite:token});
        if(ativo){setDetalhes(data);setErro('');}
      }catch(e){if(ativo)setErro(e.message);}
      finally{if(ativo)setCarregando(false);}
    });
    return()=>{ativo=false;};
  },[]);

  async function obterCredencial(){
    if(busy||!convite)return;setBusy(true);setErro('');setAviso('');
    try{
      const r=await conviteRequest('/publico/excursoes/credenciais',{convite,method:'POST'});
      if(!credencialValida(r?.token))throw Error('O servidor não retornou credencial individual válida.');
      setInscricaoToken(r.token);setAviso('Credencial individual emitida. Copie e guarde em local privado antes de solicitar sua inscrição.');
    }catch(e){setErro(e.message);}finally{setBusy(false);}
  }

  async function enviar(e){
    e.preventDefault();if(busy||!convite||!inscricaoToken)return;
    if(!form.aceitePrivacidade){setErro('É necessário ler e aceitar a política de privacidade.');return;}
    if(!form.nome.trim()||!form.contato.trim()){setErro('Informe nome e contato.');return;}
    const modo=detalhes?.modoColeta;
    if(modo==='PORTA_A_PORTA'&&(!form.nomePonto.trim()||!pontoValido(form.latitude,form.longitude))){setErro('Selecione seu ponto de embarque real no mapa e dê um nome ao local.');return;}
    if(modo==='MULTIPLAS_PARADAS'&&!form.paradaId){setErro('Selecione uma parada.');return;}
    if(!window.confirm('Enviar inscrição? O organizador terá acesso aos dados necessários para gerir esta excursão.'))return;
    setBusy(true);setErro('');setAviso('');
    try{
      const body={nome:form.nome.trim(),contato:form.contato.trim(),aceitePrivacidade:true};
      if(modo==='PORTA_A_PORTA')Object.assign(body,{paradaId:null,nomePonto:form.nomePonto.trim(),latitude:form.latitude,longitude:form.longitude,pontoConfirmado:true});
      else if(modo==='MULTIPLAS_PARADAS')body.paradaId=Number(form.paradaId);
      // PARADA_UNICA: o backend associa a única parada automaticamente.
      const r=await conviteRequest('/publico/excursoes/inscricoes',{convite,inscricao:inscricaoToken,method:'POST',body});
      if(!r?.id)throw Error('A inscrição não foi confirmada. Consulte sua credencial antes de repetir.');
      setInscricao(r);setAviso('Solicitação registrada. Aguarde a confirmação de vaga pelo organizador.');
    }catch(e){setErro(e.message);}finally{setBusy(false);}
  }

  async function consultar(){
    if(busy||!inscricaoToken)return;setBusy(true);setErro('');setAviso('');
    try{
      const r=await conviteRequest('/publico/excursoes/inscricao',{inscricao:inscricaoToken});
      setInscricao(r);
      setAviso('Estado da inscrição consultado.');
    }catch(e){setErro(e.message);}finally{setBusy(false);}
  }

  async function cancelar(){
    if(busy||!inscricaoToken||!window.confirm('Cancelar sua inscrição? Esta ação não pode ser desfeita.'))return;
    setBusy(true);setErro('');setAviso('');
    try{
      const r=await conviteRequest('/publico/excursoes/inscricao',{inscricao:inscricaoToken,method:'DELETE'});
      setInscricao(r);setAviso('Inscrição cancelada.');
    }catch(e){setErro(e.message);}finally{setBusy(false);}
  }

  function copiar(){
    if(!inscricaoToken||!navigator.clipboard){setErro('Cópia indisponível. Tente um navegador com HTTPS.');return;}
    navigator.clipboard.writeText(inscricaoToken).then(()=>setAviso('Credencial copiada. Guarde-a em local privado e nunca a envie a outras pessoas.')).catch(()=>setErro('Não foi possível copiar a credencial.'));
  }

  const pontos=detalhes?.modoColeta==='PORTA_A_PORTA'&&pontoValido(form.latitude,form.longitude)?[{nome:form.nomePonto||'Meu embarque',latitude:form.latitude,longitude:form.longitude,tipo:'parada'}]:[];
  const modo=detalhes?.modoColeta;
  return <main id="conteudo" className="be-shell" style={{maxWidth:820,margin:'0 auto',padding:'2rem 1rem'}}>
    <div className="be-row"><Link href="/">BeVans</Link><Link href="/privacidade">Privacidade</Link></div>
    <section className="be-card"><h1>Inscrição em excursão</h1><p className="be-muted">O acesso depende de um convite individual válido. A inscrição não equivale à confirmação da vaga.</p>
      {erro&&<p role="alert" className="be-error">{erro}</p>}
      {aviso&&<p role="status">{aviso}</p>}
      {carregando?<p>Consultando convite…</p>:detalhes?<><h2>{detalhes.titulo}</h2>
        <p><strong>Destino:</strong> {detalhes.destinoNome}</p>
        <p><strong>Partida:</strong> {new Date(detalhes.partidaEm).toLocaleString('pt-BR')}</p>
        <p><strong>Vagas informadas:</strong> {detalhes.vagasDisponiveis} (sujeitas a alteração)</p>
        <p><strong>Coleta:</strong> {modo==='PORTA_A_PORTA'?'Porta a porta':modo==='PARADA_UNICA'?'Parada única':'Múltiplas paradas'}</p>
        {!inscricaoToken?<div className="be-section"><p>Para participar, gere uma credencial pessoal. Ela permite consultar e cancelar sua inscrição depois.</p>
          <button type="button" className="be-btn primary" disabled={busy} onClick={obterCredencial}>Gerar credencial individual</button></div>:
          <div className="be-section">
            <h3>Sua credencial individual</h3><p className="be-muted">Este código não será recuperável pelo suporte apenas com seu nome. Ele fica em memória nesta aba e será perdido ao recarregar. Guarde-o em um gerenciador privado antes de continuar.</p>
            <div className="be-actions"><button type="button" className="be-btn" onClick={copiar}>Copiar credencial privada</button></div>
          </div>}
        {inscricaoToken&&!inscricao?<form className="be-form" onSubmit={enviar}><h3>Dados para inscrição</h3>
          <div className="be-fieldset"><label>Nome completo<input value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} required/></label>
          <label>E-mail ou telefone<input value={form.contato} onChange={e=>setForm(f=>({...f,contato:e.target.value}))} required/></label>
          {modo==='MULTIPLAS_PARADAS'&&<label>Parada de embarque<select value={form.paradaId} required onChange={e=>setForm(f=>({...f,paradaId:e.target.value}))}><option value="">Selecione</option>{detalhes.paradas?.map(p=><option value={p.id} key={p.id}>{p.nome}</option>)}</select></label>}
          {modo==='PORTA_A_PORTA'&&<label>Nome do meu local<input required value={form.nomePonto} onChange={e=>setForm(f=>({...f,nomePonto:e.target.value}))} placeholder="Local de embarque"/></label>}</div>
          {modo==='PORTA_A_PORTA'&&<MapaOperacional titulo="Confirme seu ponto de embarque" pontos={pontos} onPick={p=>setForm(f=>({...f,latitude:p.latitude,longitude:p.longitude}))} privado/>}
          {modo==='PARADA_UNICA'&&<p>Embarque previsto: {detalhes.paradas?.[0]?.nome||'Parada definida pelo organizador'}.</p>}
          <label><input type="checkbox" checked={form.aceitePrivacidade} onChange={e=>setForm(f=>({...f,aceitePrivacidade:e.target.checked}))} required/> Li e aceito a <Link href="/privacidade" target="_blank" rel="noopener noreferrer">política de privacidade</Link> para esta inscrição.</label>
          <button type="submit" className="be-btn primary" disabled={busy}>{busy?'Enviando…':'Solicitar inscrição'}</button>
        </form>:null}
        {inscricao&&<div className="be-section"><h3>Sua inscrição #{inscricao.id}</h3>
          <p>Estado: <strong>{inscricao.estado}</strong></p>
          <p className="be-muted">A confirmação da vaga depende do organizador. Sua credencial é necessária para futuras consultas.</p>
          <div className="be-actions"><button type="button" className="be-btn" onClick={consultar} disabled={busy}>Atualizar estado</button>
          {['SOLICITADA','CONFIRMADA'].includes(inscricao.estado)&&<button type="button" className="be-btn danger" disabled={busy} onClick={cancelar}>Cancelar minha inscrição</button>}</div>
        </div>}</>:<p>Use o link enviado pelo organizador da excursão.</p>}
    </section>
  </main>;
}
