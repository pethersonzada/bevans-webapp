import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {URL_ASSISTENTE,URL_ASSISTENTE_EMBUTIDO} from '../lib/assistente.mjs';
import './assistente.css';

export const metadata={
 title:'Assistente virtual',
 description:'Consulte o Assistente BeVans, uma demonstração acadêmica de suporte baseada no FAQ do projeto.',
 alternates:{canonical:'/assistente'},
};

export default function PaginaAssistente(){
 return <>
  <Navbar/>
  <main id="conteudo" className="be-assistente-page">
   <section className="be-assistente-intro" aria-labelledby="be-assistente-titulo">
    <div className="container be-assistente-intro-inner">
     <div className="be-assistente-copy">
      <p className="be-assistente-eyebrow"><span aria-hidden="true" className="be-assistente-ponto"/> SUPORTE E ORIENTAÇÕES</p>
      <h1 id="be-assistente-titulo">Seu espaço para tirar dúvidas sobre o BeVans.</h1>
      <p>Converse com o assistente virtual e consulte orientações baseadas no FAQ do projeto. Você não precisa entrar na sua conta para acessar esta demonstração.</p>
      <div className="be-assistente-actions">
       <a className="be-assistente-acao" href={URL_ASSISTENTE} target="_blank" rel="noopener noreferrer">Abrir assistente em nova aba <span aria-hidden="true">↗</span></a>
       <Link className="be-assistente-link" href="/#faq">Ver perguntas frequentes <span aria-hidden="true">→</span></Link>
      </div>
     </div>
     <div className="be-assistente-info" aria-label="Sobre este atendimento">
      <span className="be-assistente-info-label">ATENDIMENTO DIGITAL</span>
      <strong>Orientações para sua jornada</strong>
      <p>Pergunte sobre o funcionamento do BeVans. As respostas são automáticas e podem ter limitações.</p>
      <div className="be-assistente-info-footer"><span aria-hidden="true"/> Demonstração acadêmica</div>
     </div>
    </div>
   </section>
   <section className="be-assistente-workspace container" aria-labelledby="be-assistente-conversa">
    <div className="be-assistente-workspace-heading">
     <div><p className="be-assistente-eyebrow">CONVERSA</p><h2 id="be-assistente-conversa">Assistente BeVans</h2><p>A conversa é fornecida pelo Streamlit, um serviço externo ao site.</p></div>
     <a className="be-assistente-external" href={URL_ASSISTENTE} target="_blank" rel="noopener noreferrer">Abrir em nova aba <span aria-hidden="true">↗</span></a>
    </div>
    <div className="be-assistente-frame-shell">
     <iframe title="Conversa com o Assistente BeVans" src={URL_ASSISTENTE_EMBUTIDO}
      className="be-assistente-iframe" loading="eager"
      referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
     />
    </div>
    <div className="be-assistente-fallback" role="note">
     <div><strong>O chat não apareceu?</strong><p>Alguns navegadores ou bloqueadores podem impedir a incorporação. Você pode continuar diretamente no serviço original.</p></div>
     <a href={URL_ASSISTENTE} target="_blank" rel="noopener noreferrer">Abrir assistente diretamente <span aria-hidden="true">↗</span></a>
    </div>
    <p className="be-assistente-aviso">Não compartilhe senhas, tokens, localização em tempo real ou dados pessoais de passageiros e menores. As mensagens são processadas pelo serviço de IA do assistente. Confirme informações importantes pelos canais oficiais.</p>
   </section>
  </main>
  <Footer/>
 </>;
}
