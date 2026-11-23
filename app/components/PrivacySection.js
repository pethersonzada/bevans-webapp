import Link from 'next/link';

const pontos=[
 {titulo:'Acesso conforme o perfil',texto:'Motoristas e passageiros têm áreas diferentes. As informações operacionais dependem da autorização feita pelo serviço.'},
 {titulo:'Localização com contexto',texto:'O compartilhamento do GPS do motorista no navegador exige uma ação explícita e é interrompido quando a aba deixa de estar visível.'},
 {titulo:'Convites individuais',texto:'Participantes de excursões consultam sua própria inscrição usando uma credencial específica, sem navegar pela lista de outros participantes.'}
];

export default function PrivacySection(){
 return <section id="privacidade-e-acesso" className="site-privacy-section" aria-labelledby="site-privacy-heading">
  <div className="container site-privacy-layout">
   <div className="site-privacy-intro">
    <span className="section-label"><span/> PERMISSÕES E RESPONSABILIDADE</span>
    <h2 id="site-privacy-heading">Informação certa, para a pessoa certa.</h2>
    <p>Dados de transporte e localização exigem cuidado. O BeVans separa as experiências conforme a autorização e explica quando um recurso depende de confirmação.</p>
    <div className="site-privacy-links"><Link href="/privacidade">Política de privacidade <span aria-hidden="true">→</span></Link><Link href="/termos">Termos de uso <span aria-hidden="true">→</span></Link></div>
   </div>
   <div className="site-privacy-points">
    {pontos.map((p,i)=><div className="site-privacy-point" key={p.titulo}><span className="site-privacy-index">0{i+1}</span><div><h3>{p.titulo}</h3><p>{p.texto}</p></div></div>)}
   </div>
  </div>
 </section>;
}
