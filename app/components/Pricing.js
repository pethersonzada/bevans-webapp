import Link from 'next/link';

const plans = [
  { name: 'Autônomo', eyebrow: 'PARA QUEM COMEÇA', price: '79', suffix: '/mês', detail: '1 van', description: 'Tudo que você precisa para organizar sua rota com mais praticidade.', features: ['Rastreamento da rota','Registro de embarque','Comunicação com responsáveis','Suporte por e-mail'] },
  { name: 'Frota', eyebrow: 'MAIS ESCOLHIDO', price: '249', suffix: '/mês', detail: 'Até 8 vans', description: 'Um painel central para acompanhar diferentes veículos e rotas.', features: ['Tudo do plano Autônomo','Visão centralizada da frota','Relatórios de pontualidade','Suporte prioritário'], featured: true },
  { name: 'Rede', eyebrow: 'SOLUÇÃO SOB MEDIDA', price: null, suffix: '', detail: 'Frotas maiores', description: 'Para operações com necessidades específicas de gestão e integração.', features: ['Gestão com múltiplos usuários','Integrações sob avaliação','Atendimento especializado','Proposta personalizada'] },
];

export default function Pricing() {
  return <section id="precos" className="pricing-section section-pad"><div className="container">
    <div className="pricing-heading"><span className="section-label"><span/> PLANOS E VALORES</span><h2>Um plano para cada<br /><span>tamanho de jornada.</span></h2><p>Escolha o ponto de partida ideal para a sua operação. Converse com a equipe antes de contratar.</p></div>
    <div className="pricing-grid">{plans.map(plan=><article className={'pricing-card '+(plan.featured?'pricing-card-featured':'')} key={plan.name}>
      {plan.featured && <div className="pricing-recommended">✦ MAIS POPULAR</div>}
      <div className="pricing-eyebrow">{plan.eyebrow}</div><h3>{plan.name}</h3><p className="pricing-description">{plan.description}</p>
      <div className="pricing-amount">{plan.price ? <><span className="currency">R$</span><strong>{plan.price}</strong><span className="period">{plan.suffix}</span></> : <strong className="custom-price">Sob consulta</strong>}</div>
      <p className="pricing-detail">{plan.detail}</p>
      <Link className={'button pricing-button '+(plan.featured?'button-yellow':'button-outline')} href={'/contato?plano='+encodeURIComponent(plan.name)}>{plan.price?'Quero conhecer o plano':'Solicitar uma proposta'} <span aria-hidden="true">↗</span></Link>
      <div className="pricing-divider"/><p className="pricing-includes">O QUE ESTÁ INCLUÍDO</p><ul>{plan.features.map(feature=><li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
    </article>)}</div>
    <p className="pricing-footnote">Valores apresentados como referência comercial. Condições e disponibilidade dos recursos devem ser confirmadas com a equipe.</p>
  </div></section>;
}