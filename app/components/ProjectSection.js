import Image from 'next/image';

const repositories=[
 {title:'Aplicativo mobile',stack:'React Native · Expo · TypeScript',description:'Experiência Android para motoristas e passageiros, com turmas, rotas e viagens.',repo:'bevans-frontend',symbol:'01'},
 {title:'Backend e API',stack:'Java · Spring Boot · PostgreSQL',description:'Regras de negócio, persistência, autorização e integração entre os serviços.',repo:'bevans-backend',symbol:'02'},
 {title:'Plataforma web',stack:'Next.js · React · Firebase',description:'Site institucional, autenticação e painel operacional adaptável a diferentes telas.',repo:'bevans-webapp',symbol:'03'},
 {title:'Assistente de suporte',stack:'Python · RAG',description:'Projeto de suporte com recuperação de informações da base de conhecimento.',repo:'bevans-agente',symbol:'04'},
];

export default function ProjectSection(){
 return <section id="projeto" className="bev-project-section" aria-labelledby="bev-project-title">
  <div className="container">
   <div className="bev-project-intro"><div><span className="bev-project-kicker">Por trás do BeVans</span><h2 id="bev-project-title">Uma plataforma.<br/> Quatro frentes de desenvolvimento.</h2></div><p>O BeVans nasceu como projeto acadêmico de Análise e Desenvolvimento de Sistemas na UNINASSAU e segue em evolução. Conheça as partes que compõem seu ecossistema.</p></div>
   <div className="bev-project-grid">{repositories.map(item=><article className="bev-project-repo" key={item.repo}><div className="bev-project-repo-top"><span>{item.symbol}</span><span aria-hidden="true">↗</span></div><h3>{item.title}</h3><p className="bev-project-stack">{item.stack}</p><p>{item.description}</p><a href={'https://github.com/pethersonzada/'+item.repo} target="_blank" rel="noopener noreferrer">Ver repositório no GitHub <span aria-hidden="true">↗</span></a></article>)}</div>
   <div className="bev-author-card">
    <div className="bev-author-identity"><Image src="https://avatars.githubusercontent.com/u/147556184?v=4" width={112} height={112} alt="Miguel Petherson" className="bev-author-photo"/><div><span className="bev-project-kicker">Desenvolvimento técnico</span><h3>Miguel Petherson</h3><p>@pethersonzada · Estudante de ADS</p></div></div>
    <div className="bev-author-content"><p>Responsável pelo desenvolvimento do aplicativo, backend, plataforma web, agente de suporte e infraestrutura do BeVans.</p><div className="bev-author-links"><a href="https://github.com/pethersonzada" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a><a href="https://www.linkedin.com/in/pethersonzada/" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></div><small>Projeto acadêmico apresentado em novembro de 2026, com Rafaela Albuquerque, Arthur Cavalcantii e Yalle Rívika.</small></div>
   </div>
  </div>
 </section>;
}
