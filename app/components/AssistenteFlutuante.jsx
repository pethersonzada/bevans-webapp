'use client';

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useIdentidade} from '../lib/sessao-web.mjs';
import './assistente-flutuante.css';

const SUGESTOES=['Como entrar em uma turma?','Como funcionam as excursões?','Posso entrar pelo navegador?'];
const atalhos=new Map([
 ['excursao',['/excursoes','Ver como participar de excursões']],
 ['login',['/login','Acessar minha conta']],
 ['cadastro',['/cadastro','Consultar acesso ao cadastro']],
 ['contato',['/contato','Falar com a equipe']],
 ['painel',['/painel','Abrir meu painel']],
]);
const BOAS_VINDAS='Oi! Sou o assistente do BeVans. Pergunte sobre turmas, viagens, rotas, excursões ou acesso. Não envie dados pessoais.';

function IconeConversa({fechar=false}){
 if(fechar)return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>;
 return <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3v-6a7.5 7.5 0 1 1 17-4.5Z"/><path d="M8 11.5h8M8 15h5"/></svg>;
}

export default function AssistenteFlutuante(){
 const user=useIdentidade();
 return <Conversa key={user?.uid||'visitante'}/>;
}
function Conversa(){
 const [aberto,setAberto]=useState(false);
 const [iniciado,setIniciado]=useState(false);
 const [pergunta,setPergunta]=useState('');
 const [mensagens,setMensagens]=useState([]);
 const [ocupado,setOcupado]=useState(false);
 const [erro,setErro]=useState('');
 const botaoRef=useRef(null),janelaRef=useRef(null),fecharRef=useRef(null),fimRef=useRef(null);
 const envioRef=useRef(null),sequencia=useRef(0);

 useEffect(()=>()=>envioRef.current?.abort(),[]);
 function abrir(){setIniciado(true);setAberto(true);}
 function fechar(){setAberto(false);}
 function novaConversa(){
  envioRef.current?.abort();
  envioRef.current=null;
  setOcupado(false);setMensagens([]);setPergunta('');setErro('');
 }
 async function enviar(texto){
  const valor=texto.trim();
  if(!valor||valor.length>800||ocupado)return;
  const historico=mensagens.slice(-10).map(m=>({role:m.role,content:m.content.slice(0,1200)}));
  const id=++sequencia.current;
  setMensagens(atual=>[...atual,{id,role:'user',content:valor}]);
  setPergunta('');setErro('');setOcupado(true);
  const controller=new AbortController();
  envioRef.current=controller;
  try{
   const response=await fetch('/api/assistente',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({pergunta:valor,historico}),
    signal:controller.signal,cache:'no-store',
   });
   const dados=await response.json().catch(()=>({}));
   if(!response.ok||typeof dados.resposta!=='string')
    throw Error(dados.erro||'Não foi possível consultar o assistente.');
   // Uma resposta antiga não pode reaparecer depois de "Nova conversa".
   if(envioRef.current!==controller)return;
   const resposta={id:++sequencia.current,role:'assistant',content:dados.resposta,modo:dados.modo,atalho:atalhos.get(dados.destino)};
   setMensagens(atual=>[...atual,resposta]);
   if(dados.aviso)setErro(dados.aviso);
  }catch(e){
   if(e.name!=='AbortError'&&envioRef.current===controller){
    // Falha não é resposta: devolve a pergunta ao campo para facilitar a tentativa.
    setMensagens(atual=>atual.filter(m=>m.id!==id));
    setPergunta(valor);
    setErro(e instanceof TypeError?'Falha de conexão. Tente novamente.':e.message||'Não foi possível consultar o assistente.');
   }
  }finally{
   if(envioRef.current===controller){envioRef.current=null;setOcupado(false);}
  }
 }
 function aoEnviar(evento){evento.preventDefault();enviar(pergunta);}
 function aoTeclarCampo(evento){
  if(evento.key==='Enter'&&!evento.shiftKey&&!evento.nativeEvent?.isComposing){
   evento.preventDefault();enviar(pergunta);
  }
 }

 useEffect(()=>{
  const aoAbrir=()=>abrir();
  window.addEventListener('bevans:abrir-assistente',aoAbrir);
  return()=>window.removeEventListener('bevans:abrir-assistente',aoAbrir);
 },[]);

 useEffect(()=>{
  if(!aberto)return;
  const anterior=document.activeElement;
  const lancador=botaoRef.current;
  const overflowAnterior=document.body.style.overflow;
  document.body.style.overflow='hidden';
  fecharRef.current?.focus();
  const aoTeclar=(evento)=>{
   if(evento.key==='Escape'){evento.preventDefault();fechar();return;}
   if(evento.key!=='Tab'||!janelaRef.current)return;
   const controles=[...janelaRef.current.querySelectorAll('button:not(:disabled),a[href],textarea:not(:disabled),input:not(:disabled),[tabindex]:not([tabindex="-1"])')]
    .filter(element=>element.getClientRects().length);
   if(!controles.length)return;
   const primeiro=controles[0],ultimo=controles.at(-1);
   if(evento.shiftKey&&document.activeElement===primeiro){evento.preventDefault();ultimo.focus();}
   else if(!evento.shiftKey&&document.activeElement===ultimo){evento.preventDefault();primeiro.focus();}
  };
  document.addEventListener('keydown',aoTeclar);
  return()=>{
   document.removeEventListener('keydown',aoTeclar);
   document.body.style.overflow=overflowAnterior;
   if(anterior?.isConnected && anterior.getClientRects().length)anterior.focus();
   else lancador?.focus();
  };
 },[aberto]);

 useEffect(()=>{
  if(aberto)fimRef.current?.scrollIntoView({block:'end',behavior:'instant'});
 },[aberto,mensagens,ocupado,erro]);

 return <div className="bev-chat-root">
  <button ref={botaoRef} type="button" className="bev-chat-launcher"
   onClick={aberto?fechar:abrir} aria-label={aberto?'Fechar assistente BeVans':'Abrir assistente BeVans'}
   aria-expanded={aberto} aria-controls={iniciado?'bev-chat-panel':undefined} title="Assistente BeVans">
   <IconeConversa fechar={aberto}/><span>Assistente</span>
  </button>
  {aberto&&<button className="bev-chat-backdrop" aria-label="Fechar janela do assistente" type="button" onClick={fechar}/>}
  {iniciado&&<section id="bev-chat-panel" ref={janelaRef} role="dialog" aria-modal={aberto?'true':undefined}
   aria-labelledby="bev-chat-title" className="bev-chat-panel" hidden={!aberto}>
   <header className="bev-chat-header">
    <div className="bev-chat-header-copy">
     <span className="bev-chat-status"><span aria-hidden="true"/> SUPORTE BEVANS</span>
     <h2 id="bev-chat-title">Assistente BeVans</h2>
    </div>
    <div className="bev-chat-header-actions">
     <button className="bev-chat-new" type="button" onClick={novaConversa} aria-label="Nova conversa" title="Nova conversa">Nova conversa</button>
     <button type="button" ref={fecharRef} className="bev-chat-close" aria-label="Fechar assistente" onClick={fechar}><IconeConversa fechar/></button>
    </div>
   </header>
   <div className="bev-chat-conversation" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions text">
    <div className="bev-chat-message bev-chat-message-assistant"><span className="bev-chat-sender">BeVans</span><p>{BOAS_VINDAS}</p></div>
    {mensagens.map(m=><div key={m.id} className={'bev-chat-message bev-chat-message-'+m.role}>
     <span className="bev-chat-sender">{m.role==='user'?'Você':'BeVans'}</span>
     <p>{m.content}</p>
     {m.atalho&&<p><Link href={m.atalho[0]} onClick={fechar}>{m.atalho[1]}</Link></p>}
     {m.modo==='faq'&&<small>Orientação do FAQ</small>}
    </div>)}
    {!mensagens.length&&<div className="bev-chat-suggestions" aria-label="Sugestões de perguntas">
     {SUGESTOES.map(s=><button key={s} type="button" onClick={()=>enviar(s)}>{s}</button>)}
    </div>}
    {ocupado&&<p className="bev-chat-loading" role="status">Buscando orientação…</p>}
    {erro&&<p className="bev-chat-error" role="alert">{erro}</p>}
    <div ref={fimRef}/>
   </div>
   <form className="bev-chat-form" onSubmit={aoEnviar}>
    <label htmlFor="bev-chat-input">Sua mensagem</label>
    <div className="bev-chat-send-row">
     <textarea id="bev-chat-input" value={pergunta} onChange={event=>setPergunta(event.target.value)}
      onKeyDown={aoTeclarCampo} placeholder="Escreva sua dúvida sobre o BeVans…" maxLength={800}
      rows={2} disabled={ocupado}/>
     <button type="submit" disabled={ocupado||!pergunta.trim()} aria-label="Enviar mensagem">Enviar</button>
    </div>
    <p>Não envie senhas, CPFs, localização ou informações de passageiros. As respostas podem ter limitações.</p>
   </form>
  </section>}
 </div>;
}
