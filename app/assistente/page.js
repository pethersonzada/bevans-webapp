import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BotaoAbrirAssistente from './BotaoAbrirAssistente';
import './assistente.css';

export const metadata={
 title:'Assistente virtual',
 description:'Converse com o Assistente BeVans no próprio site, com orientações baseadas no FAQ do projeto.',
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
      <p>Pergunte sobre turmas, rotas, excursões ou acesso à plataforma. A conversa acontece aqui no BeVans e continua disponível durante sua navegação.</p>
      <div className="be-assistente-actions">
       <BotaoAbrirAssistente/>
       <Link className="be-assistente-link" href="/#faq">Ver perguntas frequentes <span aria-hidden="true">→</span></Link>
      </div>
     </div>
     <div className="be-assistente-info" aria-label="Sobre este atendimento">
      <span className="be-assistente-info-label">ATENDIMENTO DIGITAL</span>
      <strong>Seu chat, dentro do BeVans</strong>
      <p>Abra o assistente pelo botão desta página ou pelo atalho flutuante de qualquer tela. O FAQ pode orientar suas próximas ações.</p>
      <div className="be-assistente-info-footer"><span aria-hidden="true"/> Conversa integrada ao site</div>
     </div>
    </div>
   </section>
   <section className="be-assistente-workspace container" aria-labelledby="be-assistente-conversa">
    <div className="be-assistente-workspace-heading">
     <div><p className="be-assistente-eyebrow">CONVERSA</p><h2 id="be-assistente-conversa">Como podemos ajudar?</h2><p>Você pode iniciar uma conversa sem sair desta página.</p></div>
    </div>
    <div className="be-assistente-native-card">
     <p>Abra o chat, escolha uma sugestão ou escreva sua dúvida. A conversa acompanha sua navegação pelo site enquanto a página permanecer aberta.</p>
     <BotaoAbrirAssistente/>
    </div>
    <p className="be-assistente-aviso">Não compartilhe senhas, tokens, CPF, localização em tempo real ou dados pessoais de passageiros e menores. As orientações automáticas podem ter limitações. Confirme informações importantes pelos canais oficiais.</p>
   </section>
  </main>
  <Footer/>
 </>;
}
