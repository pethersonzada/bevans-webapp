import { Suspense } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';

export const metadata = { title:'Contato e demonstração', description:'Fale com a equipe do VanBora sobre sua operação e conheça os planos disponíveis.' };

export default function ContatoPage() {
  return <><Navbar /><main id="conteudo" className="contact-page"><div className="container contact-wrap"><div className="contact-intro"><span className="section-label"><span/> VAMOS CONVERSAR</span><h1>Todo grande caminho<br />começa com uma <span>conversa.</span></h1><p>Conte sobre a sua rotina de transporte e conheça as possibilidades do VanBora para a sua operação.</p><div className="contact-benefits"><p><span>✓</span> Atendimento para diferentes perfis de operação</p><p><span>✓</span> Planos para vans e frotas</p><p><span>✓</span> Uma conversa para entender suas necessidades</p></div></div><Suspense fallback={<div className="contact-card">Carregando formulário…</div>}><ContactForm /></Suspense></div></main><Footer /></>;
}