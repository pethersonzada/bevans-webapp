const faqs=[
 {q:'O que já existe no app BeVans?',a:'O aplicativo mobile possui fluxos de motorista e passageiro, turmas, confirmação de presença, endereços, mapas e navegação. Disponibilidade e estabilidade de cada recurso dependem do ambiente e da integração com o backend.'},
 {q:'Como funcionam as rotas de ida e volta?',a:'O motorista organiza suas turmas e a viagem. O passageiro pode registrar presença para ida e volta, com endereços específicos. O percurso é exibido no mapa do app mobile.'},
 {q:'Já posso criar uma excursão pelo site?',a:'Ainda não. Excursões está em desenvolvimento. O objetivo é permitir criação pelo organizador e inscrição por convite no navegador, com vagas controladas pelo servidor.'},
 {q:'Existe um painel administrativo no site?',a:'Não há painel administrativo web. A operação de motorista e passageiro está concentrada no aplicativo mobile. O site apresenta o produto e a modalidade futura de excursões.'},
 {q:'Os planos já podem ser contratados?',a:'Os valores exibidos são referências comerciais, não uma contratação automática. Consulte a equipe para confirmar recursos, condições e disponibilidade.'},
 {q:'O site recebe minhas credenciais?',a:'Não. As páginas de login e cadastro são apenas prévias e não solicitam senhas. O formulário de contato, quando habilitado, prepara uma mensagem no aplicativo de e-mail do visitante.'},
];

export default function Faq(){
 return <section id="faq" className="faq-section section-pad"><div className="container faq-layout"><div><span className="section-label"><span/> DIRETO AO PONTO</span><h2>O que você<br/><span>precisa saber.</span></h2><p>O que o aplicativo já faz, o que está em construção e como conhecer o projeto.</p></div><div className="faq-list">{faqs.map(({q,a},i)=><details className="faq-item" key={q}><summary><span className="faq-count">0{i+1}</span><span>{q}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></div></section>;
}