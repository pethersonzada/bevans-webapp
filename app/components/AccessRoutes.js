import Link from 'next/link';

const acessos=[
 {numero:'01',tipo:'Motorista',titulo:'Organize sua próxima viagem',texto:'Acesse suas turmas, solicitações, rotas e a operação pelo painel autorizado.',pontos:['Turmas e solicitações','Planejamento e viagens'],href:'/login',acao:'Entrar como motorista'},
 {numero:'02',tipo:'Passageiro',titulo:'Encontre as informações da sua rota',texto:'Consulte rotas públicas, seus pedidos e os dados disponíveis para sua conta.',pontos:['Rotas e embarques','Acompanhamento autorizado'],href:'/login',acao:'Entrar como passageiro'},
 {numero:'03',tipo:'Excursões',titulo:'Recebeu um convite?',texto:'Utilize o link fornecido pelo organizador ou sua credencial individual para consultar a inscrição.',pontos:['Consulta por convite','Embarque e histórico individual'],href:'/convite',acao:'Consultar uma excursão'}
];

export default function AccessRoutes(){
 return <section id="acessos" className="site-access-section section-pad" aria-labelledby="site-access-heading">
  <div className="container">
   <div className="site-access-heading"><span className="section-label"><span/> CADA JORNADA TEM SEU ACESSO</span><h2 id="site-access-heading">Encontre seu caminho no BeVans.</h2><p>O painel usa uma conta já autorizada. Os participantes de excursões também podem consultar suas informações por convite individual.</p></div>
   <div className="site-access-grid">
    {acessos.map(item=><article className="site-access-card" key={item.numero}>
     <div className="site-access-card-top"><span>{item.numero} / {item.tipo.toUpperCase()}</span><span aria-hidden="true">↗</span></div>
     <h3>{item.titulo}</h3><p>{item.texto}</p>
     <ul>{item.pontos.map(p=><li key={p}><span aria-hidden="true">✓</span>{p}</li>)}</ul>
     <Link href={item.href} className="site-access-link">{item.acao}<span aria-hidden="true">→</span></Link>
    </article>)}
   </div>
   <p className="site-access-note">O BeVans não oferece cadastro público nesta página. O acesso às funcionalidades depende das permissões da conta ou da inscrição.</p>
  </div>
 </section>;
}
