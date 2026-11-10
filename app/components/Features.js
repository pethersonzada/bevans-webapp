import Link from 'next/link';

const capabilities = [
  {number:'01',icon:'⌖',name:'Radar da van',detail:'A posição do veículo no mapa, para você acompanhar a viagem sem depender de mensagens.'},
  {number:'02',icon:'↗',name:'Rotas otimizadas',detail:'Ordem de paradas planejada com navegação para tornar o percurso mais organizado.'},
  {number:'03',icon:'✓',name:'Presença confirmada',detail:'Passageiros informam se vão na ida, na volta ou se não poderão embarcar.'},
  {number:'04',icon:'⇢',name:'Próxima manobra',detail:'Orientações de direção e informações relevantes durante o percurso.'},
  {number:'05',icon:'◷',name:'Previsão de chegada',detail:'Visão da distância restante e da estimativa de chegada ao destino.'},
  {number:'06',icon:'▦',name:'Gestão de turmas',detail:'Motoristas organizam turmas, passageiros, pontos e solicitações de entrada.'},
];

const people=[
  {tag:'01 / MOTORISTA',title:'Tudo em uma rota.',description:'Menos decisões no improviso. Mais visibilidade do trajeto, das paradas e dos passageiros.',symbol:'↗',tone:'driver',items:['Navegação orientada no mapa','Turmas e passageiros organizados','Ações rápidas para iniciar a viagem']},
  {tag:'02 / PASSAGEIRO',title:'A rota mais perto.',description:'Presença informada, endereço escolhido e acompanhamento do caminho em um só aplicativo.',symbol:'⌖',tone:'manager',items:['Confirmação de presença','Acompanhamento da van','Informações de ida e volta']},
  {tag:'03 / OPERAÇÃO',title:'Informação faz a diferença.',description:'Uma experiência feita para conectar quem dirige e quem precisa chegar ao destino.',symbol:'◎',tone:'parent',items:['Mais clareza sobre o percurso','Rotas planejadas','Menos informação desencontrada']},
];

export default function Features(){
 return <>
  <section id="funcionalidades" className="features-section section-pad">
    <div className="container">
      <div className="section-intro"><div><span className="section-label"><span/> CONECTADO AO QUE IMPORTA</span><h2>Mais do que um mapa.<br/><span>Uma rota inteligente.</span></h2></div><p>Recursos baseados na experiência do aplicativo mobile BeVans: presença, trajetos, navegação e acompanhamento da van.</p></div>
      <div className="feature-grid">
        {capabilities.map(item=><article key={item.number} className="feature-card">
          <div className="feature-card-top"><span className="feature-icon" aria-hidden="true">{item.icon}</span><span className="feature-number">{item.number} / 06</span></div>
          <h3>{item.name}</h3><p>{item.detail}</p><span className="feature-arrow" aria-hidden="true">↗</span>
        </article>)}
      </div>
    </div>
  </section>
  <section className="journey-section" aria-labelledby="journey-heading">
    <div className="container journey-inner">
      <div className="journey-visual" aria-hidden="true">
        <div className="journey-path">
          <div className="journey-station"><span>01</span><b>PLANEJE</b><small>Turma e paradas</small></div>
          <div className="journey-connector"/>
          <div className="journey-station"><span>02</span><b>ACOMPANHE</b><small>Trajeto e presença</small></div>
          <div className="journey-connector"/>
          <div className="journey-station"><span>03</span><b>CHEGUE</b><small>Destino da rota</small></div>
        </div>
      </div>
      <div className="journey-copy">
        <span className="section-label"><span/> A EXPERIÊNCIA BEVANS</span>
        <h2 id="journey-heading">Do primeiro ponto ao destino.<br/><em>Sem perder o rumo.</em></h2>
        <p>O aplicativo conecta etapas que normalmente ficam espalhadas entre mapas, listas e mensagens. Veja como motorista e passageiro utilizam o BeVans na seção de experiência.</p>
        <Link href="/#experiencia" className="journey-link">Explorar a demonstração <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  </section>
  <section id="beneficios" className="audience-section section-pad">
    <div className="container">
      <div className="audience-intro"><span className="section-label"><span/> A ROTA TEM MUITOS LADOS</span><h2>Uma experiência.<br/><span>Várias formas de chegar.</span></h2><p>O BeVans considera diferentes pessoas na mesma jornada.</p></div>
      <div className="audience-grid">{people.map(person=><article key={person.tag} className={'audience-card audience-'+person.tone}>
        <div className="audience-top"><span>{person.tag}</span><span className="audience-index">BEVANS</span></div>
        <div className="audience-decoration" aria-hidden="true">{person.symbol}</div>
        <div className="audience-content"><h3>{person.title}</h3><p>{person.description}</p><ul>{person.items.map(item=><li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul></div>
      </article>)}</div>
    </div>
  </section>
 </>;
}