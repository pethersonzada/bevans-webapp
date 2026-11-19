import Link from 'next/link';

const plans = [
  {
    tag: 'DISPONÍVEL NO APP', name: 'Motorista autônomo', code: 'ROTAS E TURMAS',
    lead: 'Organize turmas, passageiros, rotas públicas e viagens no dia a dia.',
    features: ['Cadastro e organização de turmas', 'Presença e embarques por sentido', 'Mapa, paradas e navegação', 'Solicitações de vínculo e embarque'],
    action: 'Conhecer o BeVans', highlight: true,
  },
  {
    tag: 'FLUXO OPERACIONAL DISPONÍVEL', name: 'Excursões', code: 'VIAGENS OCASIONAIS',
    lead: 'Criação de excursões, convites de inscrição, paradas e controle dos embarques.',
    features: ['Criação e publicação pelo organizador', 'Link de convite para inscrição no navegador', 'Gestão de inscritos e vagas', 'Execução de ida e volta e check-in'],
    action: 'Conhecer as excursões', href: '/excursoes',
  },
  {
    tag: 'EVOLUÇÃO FUTURA', name: 'Gestão de frotas', code: 'ORGANIZAÇÕES',
    lead: 'Uma operação compartilhada entre gestores, motoristas e veículos.',
    features: ['Organizações e motoristas vinculados', 'Atribuição de turmas a motoristas', 'Gestão de veículos e disponibilidade', 'Painel próprio para o gestor'],
    action: 'Conversar sobre frotas',
  },
];

export default function Pricing() {
  return <section id="precos" className="new-pricing-section" aria-labelledby="pricing-heading">
    <div className="container">
      <div className="new-pricing-head">
        <div><span className="section-label"><span/> MODALIDADES DO BEVANS</span><h2 id="pricing-heading">Modalidades do BeVans</h2></div>
        <p>Rotas e excursões já contam com fluxos operacionais no BeVans. A gestão de frotas é a próxima linha de evolução. O acesso depende de conta autorizada.</p>
      </div>
      <div className="new-pricing-grid">
        {plans.map(plan=><article className={'new-price-card '+(plan.highlight?'new-price-featured':'')} key={plan.name}>
          <div className="new-price-top"><span>{plan.tag}</span><span className="new-price-code">{plan.code}</span></div>
          <h3>{plan.name}</h3><p className="new-price-lead">{plan.lead}</p>
          <Link href={plan.href || '/contato?assunto='+encodeURIComponent(plan.name)} className={'new-price-action '+(plan.highlight?'is-highlighted':'')}>{plan.action}<span aria-hidden="true"></span></Link>
          <div className="new-price-divider"/><span className="new-price-includes">O QUE ESTA MODALIDADE ENVOLVE</span>
          <ul>{plan.features.map(f=><li key={f}><span aria-hidden="true">✓</span>{f}</li>)}</ul>
        </article>)}
      </div>
      <div className="new-pricing-note"><span aria-hidden="true">ⓘ</span><p><strong>Disponibilidade por canal.</strong> O aplicativo Android reúne os fluxos operacionais completos de rotas e excursões. O painel web está recebendo essas funcionalidades gradualmente. A gestão de frotas permanece EM DESENVOLVIMENTO. Este site não vende planos automaticamente nem abre cadastro público.</p></div>
    </div>
  </section>;
}
