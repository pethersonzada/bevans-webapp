const features = [
  { number: '01', icon: '⌖', title: 'Rastreamento de rotas', text: 'Acompanhe o trajeto e tenha uma visão mais clara de onde cada veículo está.' },
  { number: '02', icon: '✓', title: 'Embarque e desembarque', text: 'Organize o registro de passageiros em cada parada e reduza a dependência de listas em papel.' },
  { number: '03', icon: '♧', title: 'Comunicação inteligente', text: 'Centralize informações importantes sobre atrasos, mudanças e andamento das viagens.' },
  { number: '04', icon: '↗', title: 'Rotas mais organizadas', text: 'Planeje paradas, visualize percursos e torne a rotina de cada motorista mais previsível.' },
  { number: '05', icon: '▥', title: 'Visão da operação', text: 'Reúna em um só painel informações úteis para acompanhar o dia a dia da frota.' },
  { number: '06', icon: '◷', title: 'Histórico e registros', text: 'Consulte registros de viagens e embarques para entender melhor o funcionamento da operação.' },
];

const audience = [
  { index:'01', title:'Para quem dirige', label:'MOTORISTAS', text:'Menos papelada no painel, mais atenção no percurso.', items:['Rotas e paradas organizadas','Lista de passageiros acessível','Registros simples de embarque'], theme:'driver' },
  { index:'02', title:'Para quem gerencia', label:'GESTORES', text:'Uma visão completa para tomar decisões com mais clareza.', items:['Acompanhamento da operação','Histórico e organização de rotas','Informações em um só lugar'], theme:'manager' },
  { index:'03', title:'Para quem espera', label:'RESPONSÁVEIS', text:'Mais informação e tranquilidade durante o trajeto.', items:['Atualizações sobre a viagem','Visibilidade do andamento da rota','Comunicação mais organizada'], theme:'parent' },
];

export default function Features() {
  return <>
    <section id="funcionalidades" className="features-section section-pad">
      <div className="container">
        <div className="section-intro"><div><span className="section-label"><span/> O QUE O BEVANS OFERECE</span><h2>O controle que sua<br />operação <span>merece.</span></h2></div><p>Chega de improvisar com planilhas, mensagens perdidas e informações espalhadas. Conheça as possibilidades de uma rotina conectada.</p></div>
        <div className="feature-grid">
          {features.map((feature) => <article className="feature-card" key={feature.number}><div className="feature-card-top"><span className="feature-icon" aria-hidden="true">{feature.icon}</span><span className="feature-number">{feature.number} / 06</span></div><h3>{feature.title}</h3><p>{feature.text}</p><span className="feature-arrow" aria-hidden="true">↗</span></article>)}
        </div>
      </div>
    </section>
    <section id="beneficios" className="audience-section section-pad">
      <div className="container">
        <div className="audience-intro"><span className="section-label"><span/> FEITO PARA PESSOAS REAIS</span><h2>Cada pessoa tem seu papel.<br /><span>O BeVans conecta todos.</span></h2><p>Uma experiência pensada para cada ponta do trajeto.</p></div>
        <div className="audience-grid">{audience.map((person) => <article key={person.index} className={'audience-card audience-'+person.theme}><div className="audience-top"><span>{person.label}</span><span className="audience-index">{person.index} / 03</span></div><div className="audience-decoration" aria-hidden="true">{person.theme==='driver'?'↗':person.theme==='manager'?'▦':'♡'}</div><div className="audience-content"><h3>{person.title}</h3><p>{person.text}</p><ul>{person.items.map((item)=><li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul></div></article>)}</div>
      </div>
    </section>
  </>;
}