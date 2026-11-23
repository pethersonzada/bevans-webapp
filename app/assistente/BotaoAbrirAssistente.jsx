'use client';

export default function BotaoAbrirAssistente(){
 return <button type="button" className="be-assistente-acao" onClick={()=>window.dispatchEvent(new Event('bevans:abrir-assistente'))}>
  Iniciar conversa no BeVans <span aria-hidden="true">↗</span>
 </button>;
}
