import Link from 'next/link';

const plans = [
  {
    tag: 'APP MOBILE', name: 'Motorista autônomo', code: 'ROTAS E TURMAS',
    lead: 'A operação de uma van, com foco no dia a dia do motorista.',
    features: ['Cadastro e organização de turmas', 'Confirmação de presença por viagem', 'Mapa, paradas e navegação', 'Gestão de passageiros vinculados'],
    action: 'Conversar sobre o aplicativo', status: 'Recursos do aplicativo', highlight: true,
  },
  {
    tag: 'EM DESENVOLVIMENTO', name: 'Excursões', code: 'VIAGENS OCASIONAIS',
    lead: 'Inscrições por convite, mesmo para passageiros sem o aplicativo.',
    features: ['Criação de excursões pelo organizador', 'Link de convite para inscrição web', 'Controle de vagas e embarques', 'Check-in manual pelo motorista'],
    action: 'Conhecer as excursões', status: 'Fluxo planejado', href: '/excursoes',
  },
  {
    tag: 'EVOLUÇÃO FUTURA', name: 'Gestão de frotas', code: 'ORGANIZAÇÕES',
    lead: 'Uma operação compartilhada entre gestores, motoristas e veículos.',
    features: ['Organizações e motoristas vinculados', 'Atribuição de turmas a motoristas', 'Gestão de veículos e disponibilidade', 'Painel próprio para o gestor'],
    action: 'Conversar sobre frotas', status: 'Escopo em planejamento',
  },
];

export default function Pricing() {
  return <section id="precos" className="new-pricing-section" aria-labelledby="pricing-heading">
    <div className="container">
      <div className="new-pricing-head">
        <div>
          <span className="section-label"><span/> MODALIDADES DO BEVANS</span>
          <h2 id="pricing-heading">Uma plataforma.<br/><em>Três caminhos.</em></h2>
        </div>
        <p>Conheça os fluxos do aplicativo e o que está sendo desenvolvido. As condições comerciais serão definidas antes da contratação.</p>
      </div>
      <div className="new-pricing-grid">
        {plans.map((plan) => <article className={'new-price-card ' + (plan.highlight ? 'new-price-featured' : '')} key={plan.name}>
          <div className="new-price-top"><span>{plan.tag}</span><span className="new-price-code">{plan.code}</span></div>
          <h3>{plan.name}</h3><p className="new-price-lead">{plan.lead}</p>
          <div className="new-price-availability"><span aria-hidden="true">◎</span><strong>{plan.status}</strong></div>
          <Link href={plan.href || '/contato?assunto=' + encodeURIComponent(plan.name)} className={'new-price-action ' + (plan.highlight ? 'is-highlighted' : '')}>
            {plan.action} <span aria-hidden="true">↗</span>
          </Link>
          <div className="new-price-divider"/><span className="new-price-includes">O QUE ESTA MODALIDADE ENVOLVE</span>
          <ul>{plan.features.map(f => <li key={f}><span aria-hidden="true">✓</span>{f}</li>)}</ul>
        </article>)}
      </div>
      <div className="new-pricing-note"><span aria-hidden="true">ⓘ</span>
        <p><strong>Transparência sobre o estágio do produto.</strong> O aplicativo mobile já possui fluxos de motoristas e passageiros. Excursões e gestão de frotas ainda dependem de implementação e validação. Não há preços ou planos contratáveis diretamente neste site.</p>
      </div>
    </div>
  </section>;
}
