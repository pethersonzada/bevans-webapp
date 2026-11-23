'use client';

import {useEffect,useRef,useState} from 'react';
import {URL_ASSISTENTE,URL_ASSISTENTE_EMBUTIDO} from '../lib/assistente.mjs';
import './assistente-flutuante.css';

function IconeConversa({fechar=false}){
 if(fechar)return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>;
 return <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3v-6a7.5 7.5 0 1 1 17-4.5Z"/><path d="M8 11.5h8M8 15h5"/></svg>;
}

export default function AssistenteFlutuante(){
 const [aberto,setAberto]=useState(false);
 const [iniciado,setIniciado]=useState(false);
 const botaoRef=useRef(null),janelaRef=useRef(null),fecharRef=useRef(null);

 function abrir(){
  setIniciado(true);
  setAberto(true);
 }
 function fechar(){setAberto(false);}

 useEffect(()=>{
  if(!aberto)return;
  const anterior=document.activeElement;
  const overflowAnterior=document.body.style.overflow;
  document.body.style.overflow='hidden';
  fecharRef.current?.focus();
  const aoTeclar=(evento)=>{
   if(evento.key==='Escape'){evento.preventDefault();fechar();return;}
   if(evento.key!=='Tab'||!janelaRef.current)return;
   const controles=[...janelaRef.current.querySelectorAll('button:not(:disabled),a[href],iframe,[tabindex]:not([tabindex="-1"])')]
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
   if(anterior?.isConnected)anterior.focus();
   else botaoRef.current?.focus();
  };
 },[aberto]);

 return <div className="bev-chat-root">
  <button ref={botaoRef} type="button" className="bev-chat-launcher"
   onClick={aberto?fechar:abrir} aria-label={aberto?'Fechar assistente BeVans':'Abrir assistente BeVans'}
   aria-expanded={aberto} aria-controls="bev-chat-panel" title="Assistente BeVans">
   <IconeConversa fechar={aberto}/><span>{aberto?'Fechar':'Assistente'}</span>
  </button>
  {aberto&&<button className="bev-chat-backdrop" aria-label="Fechar janela do assistente" type="button" onClick={fechar}/>}
  {iniciado&&<section id="bev-chat-panel" ref={janelaRef} role="dialog" aria-modal={aberto?'true':undefined}
   aria-labelledby="bev-chat-title" className="bev-chat-panel" hidden={!aberto}>
   <header className="bev-chat-header">
    <div className="bev-chat-header-copy">
     <span className="bev-chat-status"><span aria-hidden="true"/> ASSISTENTE VIRTUAL</span>
     <h2 id="bev-chat-title">Assistente BeVans</h2>
    </div>
    <button type="button" ref={fecharRef} className="bev-chat-close" aria-label="Fechar assistente" onClick={fechar}>
     <IconeConversa fechar/>
    </button>
   </header>
   <div className="bev-chat-iframe-wrap">
    <iframe title="Chat com o Assistente BeVans" src={URL_ASSISTENTE_EMBUTIDO}
     className="bev-chat-iframe" loading="lazy"
     referrerPolicy="no-referrer"
     sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"/>
   </div>
   <footer className="bev-chat-footer">
    <p>Evite enviar senhas, dados de passageiros ou localização em tempo real. O atendimento usa um serviço externo.</p>
    <a href={URL_ASSISTENTE} target="_blank" rel="noopener noreferrer">Abrir no Streamlit <span aria-hidden="true">↗</span></a>
   </footer>
  </section>}
 </div>;
}
