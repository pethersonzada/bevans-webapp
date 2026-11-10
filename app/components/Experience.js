import Link from 'next/link';

const driverItems = [
  {index:'01',title:'Organize sua turma',description:'Reúna passageiros e pontos de embarque.'},
  {index:'02',title:'Confira quem vai',description:'Considere as confirmações de ida e volta.'},
  {index:'03',title:'Siga o trajeto',description:'Acompanhe as paradas e a navegação pelo mapa.'},
];

const passengerItems = [
  {index:'01',title:'Escolha sua turma',description:'Acesse as turmas das quais você participa.'},
  {index:'02',title:'Informe sua presença',description:'Confirme ida, volta ou ausência.'},
  {index:'03',title:'Acompanhe a van',description:'Consulte o percurso e as informações da viagem.'},
];

function JourneyCard({role,number,description,items,tone}){
  return <article className={'experience-card experience-card-'+tone}>
    <div className="experience-card-head">
      <span className="experience-card-index">{number} / EXPERIÊNCIA</span>
      <span className="experience-role">{role}</span>
    </div>
    <h3>{role==='Motorista'?'Mais organização para dirigir.':'Mais clareza para embarcar.'}</h3>
    <p className="experience-card-description">{description}</p>
    <div className="experience-steps">
      {items.map(item=><div className="experience-step" key={item.index}>
        <span className="experience-step-num">{item.index}</span>
        <div><strong>{item.title}</strong><p>{item.description}</p></div>
      </div>)}
    </div>
    <div className="experience-card-foot"><span className="experience-dot" aria-hidden="true"/> FLUXO DO APLICATIVO MOBILE</div>
  </article>;
}

export default function Experience(){
  return <section id="experiencia" className="experience-section" aria-labelledby="experience-title">
    <div className="container">
      <div className="experience-intro">
        <span className="experience-kicker">COMO O BEVANS FUNCIONA</span>
        <h2 id="experience-title">Uma viagem melhor<br/><em>para os dois lados.</em></h2>
        <p>Quem dirige organiza a viagem. Quem embarca sabe o que esperar. O BeVans conecta as duas experiências em um aplicativo.</p>
      </div>
      <div className="experience-grid">
        <JourneyCard number="01" tone="driver" role="Motorista" description="Turmas, presença e navegação no mesmo fluxo." items={driverItems}/>
        <JourneyCard number="02" tone="passenger" role="Passageiro" description="Informações da viagem e confirmação de presença." items={passengerItems}/>
      </div>
      <div className="experience-outro">
        <p>Essa seção apresenta recursos do app mobile. <strong>Excursões e gestão de frotas</strong> estão em desenvolvimento ou planejamento.</p>
        <Link href="/#funcionalidades">Ver todas as funcionalidades <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  </section>;
}
