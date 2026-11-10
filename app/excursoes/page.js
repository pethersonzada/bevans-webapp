import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata={title:'Excursões · Próximo módulo',description:'Conheça a experiência de excursões planejada para o BeVans.'};
const phases=[
 {n:'01',title:'Crie sua excursão',body:'O organizador define destino, dia, horário e capacidade da viagem.'},
 {n:'02',title:'Compartilhe o convite',body:'Um link privado leva o passageiro à página de inscrição pelo navegador.'},
 {n:'03',title:'Receba inscrições',body:'O passageiro informa apenas seus próprios dados e ponto de embarque.'},
 {n:'04',title:'Organize e embarque',body:'O motorista visualiza as paradas e confirma os embarques manualmente.'},
];
export default function ExcursionsPage(){
 return <><Navbar/><main id="conteudo" className="excursions-page">
 <section className="excursions-hero"><div className="container excursions-hero-inner"><div><span className="bev-eyebrow"><i/> PRÓXIMO MÓDULO · EM DESENVOLVIMENTO</span><h1>Mais que uma viagem.<br/><em>Uma experiência<br/>bem planejada.</em></h1><p>O BeVans Excursões está sendo pensado para viagens ocasionais, grupos e eventos. Inscrição pelo navegador, sem precisar instalar o aplicativo.</p><div className="bev-hero-actions"><Link href="/contato" className="bev-button-primary">Conversar sobre excursões ↗</Link><Link href="/gestor" className="bev-button-ghost">Ver painel do gestor ↓</Link></div></div><div className="excursions-card"><div className="excursions-card-top"><span>BEVANS / EXCURSÕES</span><span>CONCEITO</span></div><div className="excursions-card-visual"><span className="excursion-pin pin-one">⌖</span><span className="excursion-pin pin-two">⌖</span><span className="excursion-pin pin-three">↗</span><svg viewBox="0 0 360 210" role="img" aria-label="Trajeto ilustrativo de excursão"><path d="M45 165 C100 177 110 50 170 91 S270 170 317 43" stroke="#00D2FF" strokeWidth="5" strokeDasharray="7 12" fill="none" strokeLinecap="round"/></svg></div><div className="excursions-card-details"><span>PRÓXIMA PARADA</span><strong>Uma nova forma de viajar juntos.</strong><p>Visual demonstrativo, sem eventos ou vagas reais.</p></div></div></div></section>
 <section className="excursions-steps section-pad"><div className="container"><span className="section-label"><span/> EXPERIÊNCIA PLANEJADA</span><h2>Da ideia ao embarque.<br/><em>Etapas conectadas.</em></h2><div className="excursions-step-grid">{phases.map(p=><article key={p.n}><span>{p.n}</span><h3>{p.title}</h3><p>{p.body}</p></article>)}</div><p className="excursions-note">Esta página apresenta o conceito do MVP. Convites, reservas, vagas, cadastro de passageiros e check-in ainda dependem das implementações previstas nos repositórios.</p></div></section>
 </main><Footer/></>;
}