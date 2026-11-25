import Link from 'next/link';

export default function Hero() {
 return <section className="bev-hero" id="inicio">
  <div className="bev-hero-orbit bev-hero-orbit-a" aria-hidden="true"/>
  <div className="bev-hero-orbit bev-hero-orbit-b" aria-hidden="true"/>
  <div className="container bev-hero-inner">
   <div className="bev-hero-copy">
    <h1>Sua turma, sua van<br/>e <span>sua viagem.</span></h1>
    <p>Passageiros confirmam a ida e a volta. Motoristas consultam quem vai embarcar e iniciam a viagem pelo painel.</p>
    <div className="bev-hero-actions">
     <Link href="/login" className="bev-button-primary" aria-label="Acessar minha conta BeVans">Entrar no BeVans</Link>
     <Link href="/#experiencia" className="bev-button-ghost">Como funciona <span aria-hidden="true">↓</span></Link>
    </div>
    <p className="bev-hero-access-note">Use a mesma conta autorizada do aplicativo. Vai de excursão? <Link href="/excursoes">Veja como participar pelo convite.</Link></p>
   </div>
  </div>
 </section>;
}
