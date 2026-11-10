const faqs = [
  {q:'O que já existe no aplicativo BeVans?',a:'O aplicativo mobile possui fluxos de motorista e passageiro, organização de turmas, confirmação de presença para ida e volta, endereços, mapas e navegação. Algumas melhorias de segurança e consistência ainda estão no backlog.'},
  {q:'O BeVans já oferece gestão de frotas?',a:'Ainda não. O papel GESTOR, vínculos de motoristas, veículos e atribuições de turmas são melhorias planejadas. O aplicativo atual é voltado principalmente a motoristas e passageiros.'},
  {q:'Como funcionará a inscrição em excursões?',a:'A proposta é que um motorista crie a excursão e compartilhe um convite. O passageiro poderá solicitar vaga pelo navegador, sem instalar o app. O backend deverá validar os convites e as vagas. Essa modalidade ainda não está liberada.'},
  {q:'O site já permite login e criação de conta?',a:'Não. As páginas de entrada e cadastro são prévias de interface. A autenticação funcional permanece no aplicativo mobile; a versão web será integrada futuramente com regras de autorização.'},
  {q:'Como consigo contratar um plano?',a:'Ainda não há contratação automática nem tabela de preços confirmada neste site. A página apresenta modalidades e possibilidades do produto; qualquer oferta comercial depende de validação da equipe.'},
  {q:'Como posso falar com a equipe?',a:'A página de contato prepara um e-mail no seu dispositivo quando houver um endereço comercial configurado. Ela não envia mensagens diretamente ao servidor. Sem esse endereço, o formulário fica indisponível.'},
];

export default function Faq() {
  return <section id="faq" className="faq-section section-pad"><div className="container faq-layout">
    <div><span className="section-label"><span/> DÚVIDAS FREQUENTES</span><h2>O que já existe.<br/><span>O que vem depois.</span></h2><p>Respostas sobre as funcionalidades atuais e o desenvolvimento do BeVans.</p></div>
    <div className="faq-list">{faqs.map(({q,a},i)=><details className="faq-item" key={q}><summary><span className="faq-count">0{i+1}</span><span>{q}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div>
  </div></section>;
}
