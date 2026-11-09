const faqs = [
  {q:'O BeVans é indicado para quem trabalha sozinho?', a:'Sim. O plano Autônomo foi pensado para quem gerencia uma van e precisa organizar rotas, passageiros e informações da operação.'},
  {q:'Posso utilizar o BeVans com mais de uma van?', a:'Sim. Existem opções para diferentes tamanhos de frota. O plano Frota contempla até 8 vans; operações maiores podem solicitar uma proposta personalizada.'},
  {q:'Como funciona a contratação?', a:'O primeiro passo é entrar em contato para entender as necessidades da sua operação, confirmar recursos disponíveis e conhecer as condições de contratação.'},
  {q:'O site já oferece acesso ao painel de gestão?', a:'A área do gestor está em desenvolvimento. Entre em contato para conhecer o estágio atual da plataforma e as possibilidades de demonstração.'},
];

export default function Faq() {
  return <section id="faq" className="faq-section section-pad"><div className="container faq-layout"><div><span className="section-label"><span/> DÚVIDAS FREQUENTES</span><h2>Ficou alguma<br /><span>dúvida?</span></h2><p>As perguntas que costumam aparecer antes de começar.</p></div><div className="faq-list">{faqs.map(({q,a},i)=><details className="faq-item" key={q}><summary><span className="faq-count">0{i+1}</span><span>{q}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></div></section>;
}