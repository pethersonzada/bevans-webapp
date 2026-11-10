import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bev-hero" id="inicio">
      <div className="bev-hero-orbit bev-hero-orbit-a" aria-hidden="true"/>
      <div className="bev-hero-orbit bev-hero-orbit-b" aria-hidden="true"/>
      <div className="container bev-hero-inner">
        <div className="bev-hero-copy">
          <span className="bev-eyebrow"><i/> TECNOLOGIA PARA QUEM MOVE PESSOAS</span>
          <h1>O futuro da rota<br/>está <span>no seu controle.</span></h1>
          <p>Da primeira parada ao último desembarque. Uma experiência de transporte mais conectada, inteligente e preparada para o mundo real.</p>
          <div className="bev-hero-actions">
            <a href="/contato" className="bev-button-primary">Conhecer o BeVans <span aria-hidden="true">↗</span></a>
            <Link href="/#experiencia" className="bev-button-ghost">Como funciona <span aria-hidden="true">↓</span></Link>
          </div>
          <div className="bev-hero-trust"><span className="bev-small-line"/><span>ROTAS MAIS CLARAS</span><span>·</span><span>MENOS IMPROVISO</span><span>·</span><span>MAIS CONEXÃO</span></div>
        </div>
      </div>
      <div className="bev-hero-bottom"><div className="container"><span>CRIADO PARA O DIA A DIA DAS ROTAS</span><div><span>TRANSPORTE ESCOLAR</span><span>UNIVERSITÁRIO</span><span>FROTAS</span><span>COOPERATIVAS</span></div></div></div>
    </section>
  );
}