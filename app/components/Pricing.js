const plans=[
 {tag:'ESSENCIAL',name:'Autônomo',price:'79',detail:'1 veículo',lead:'Para quem cuida da própria rota.',features:['Organização das rotas','Lista de embarque digital','Informações de trajeto','Suporte por e-mail'],code:'AUTÔNOMO'},
 {tag:'PARA EQUIPES',name:'Frota',price:'249',detail:'Até 8 veículos',lead:'Mais visibilidade para diferentes veículos.',features:['Recursos do plano Autônomo','Visão de múltiplas rotas','Indicadores operacionais','Suporte prioritário'],code:'FROTA',highlight:true},
 {tag:'SOB MEDIDA',name:'Rede',price:null,detail:'Operações maiores',lead:'Uma proposta para necessidades específicas.',features:['Estrutura personalizada','Integrações sob avaliação','Atendimento especializado','Proposta adaptada à operação'],code:'REDE'},
];

export default function Pricing(){
 return <section id="precos" className="new-pricing-section">
  <div className="container">
   <div className="new-pricing-head"><div><span className="section-label"><span/> PLANOS COMERCIAIS</span><h2>Escolha a rota.<br/><em>O resto a gente constrói.</em></h2></div><p>Opções comerciais de referência para diferentes tamanhos de operação. Recursos e valores dependem de validação com a equipe.</p></div>
   <div className="new-pricing-grid">{plans.map(plan=><article className={'new-price-card '+(plan.highlight?'new-price-featured':'')} key={plan.name}>
    <div className="new-price-top"><span>{plan.tag}</span><span className="new-price-code">{plan.code}</span></div><h3>{plan.name}</h3><p className="new-price-lead">{plan.lead}</p>
    <div className="new-price-value">{plan.price?<><span>R$</span><strong>{plan.price}</strong><small>/mês</small></>:<strong className="new-price-custom">Sob consulta</strong>}</div>
    <p className="new-price-capacity">{plan.detail}</p>
    <Link href={'/contato?plano='+encodeURIComponent(plan.name)} className={'new-price-action '+(plan.highlight?'is-highlighted':'')}>{plan.price?'Conversar sobre o plano':'Solicitar proposta'} <span aria-hidden="true">↗</span></Link>
    <div className="new-price-divider"/><span className="new-price-includes">O QUE ESTÁ PREVISTO</span><ul>{plan.features.map(f=><li key={f}><span aria-hidden="true">✓</span>{f}</li>)}</ul>
   </article>)}</div>
   <div className="new-pricing-note"><span aria-hidden="true">ⓘ</span><p><strong>Excursões é uma modalidade futura do produto, não um plano independente.</strong> A disponibilidade desses recursos será definida conforme a evolução do frontend e backend. Preços e condições acima são apenas referências a confirmar.</p></div>
   <div className="new-pricing-links"><Link href="/excursoes">Conhecer o módulo de excursões <span aria-hidden="true">↗</span></Link></div>
  </div>
 </section>;
}