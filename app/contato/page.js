import { Suspense } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';

export const metadata={title:'Contato',description:'Converse sobre o BeVans, suas rotas e a futura modalidade de excursões.'};

const topics=[['01','Rotas e turmas','Transporte escolar e universitário, presença e navegação.'],['02','Excursões','Convites, vagas e embarques previstos para a próxima modalidade.'],['03','Parcerias','Discussões sobre necessidades operacionais e evolução do produto.']];
export default function ContatoPage(){
 return <><Navbar/><main id="conteudo" className="reach-page"><div className="container reach-layout"><div className="reach-copy"><span className="reach-kicker">FALE COM O BEVANS</span><h1>Vamos entender<br/><em>a sua rota?</em></h1><p>O BeVans nasce das necessidades de quem dirige e de quem precisa chegar. Conte o que você procura para discutirmos o estágio atual do aplicativo e as próximas funcionalidades.</p><div className="reach-topics">{topics.map(([n,title,description])=><article key={n}><span>{n}</span><div><strong>{title}</strong><small>{description}</small></div></article>)}</div><p className="reach-help">Para explorar a experiência do produto, <Link href="/#experiencia">veja a demonstração das rotas →</Link></p></div><div className="reach-form"><div className="reach-form-head"><span>CONTATO COMERCIAL</span><strong>BEVANS / 01</strong></div><Suspense fallback={<p>Carregando formulário…</p>}><ContactForm/></Suspense></div></div></main><Footer/></>;
}