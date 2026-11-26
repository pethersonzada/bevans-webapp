import Link from 'next/link';

function RouteIllustration(){
 return <figure className="bev-product-figure" aria-labelledby="bev-preview-caption">
  <div className="bev-preview-top"><span className="bev-preview-brand"><i aria-hidden="true"/> BeVans</span><span className="bev-preview-tag">Visão da rota</span></div>
  <div className="bev-preview-main">
   <div className="bev-preview-map">
    <svg viewBox="0 0 520 320" role="img" aria-label="Ilustração de um trajeto conectando pontos de embarque e destino">
     <defs><pattern id="bev-map-grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" fill="none" stroke="#537a9d" strokeOpacity=".16" strokeWidth="1"/></pattern></defs>
     <rect width="520" height="320" fill="#eaf1f8"/><rect width="520" height="320" fill="url(#bev-map-grid)"/>
     <g fill="#dbe7f2" opacity=".85"><path d="M30 38h98v66H30zM162 24h120v58H162zM332 35h136v72H332zM24 145h104v65H24zM164 124h126v83H164zM336 145h150v63H336zM58 248h132v46H58zM236 248h110v46H236zM390 244h96v48H390z"/></g>
     <g stroke="#fff" strokeWidth="12" fill="none" strokeLinejoin="round"><path d="M-10 122H534M-10 228H534M145-10V330M314-10V330M372-10V330M-10 302L530 2"/></g>
     <path d="M92 250V229H145V122H314V76H438" stroke="#b4d3f4" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
     <path d="M92 250V229H145V122H314V76H438" stroke="#1264c5" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
     <g fill="#fff" stroke="#1264c5" strokeWidth="4"><circle cx="92" cy="250" r="11"/><circle cx="145" cy="174" r="9"/><circle cx="314" cy="122" r="9"/></g>
     <circle cx="438" cy="76" r="17" fill="#1264c5" stroke="#fff" strokeWidth="5"/><path d="m431 76 5 5 9-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
     <g transform="translate(219 122)"><circle r="22" fill="#14253a" stroke="white" strokeWidth="4"/><rect x="-11" y="-7" width="22" height="12" rx="3" fill="white"/><path d="M-7-4H7" stroke="#14253a" strokeWidth="3"/><circle cx="-6" cy="7" r="3" fill="white"/><circle cx="6" cy="7" r="3" fill="white"/></g>
    </svg>
    <span className="bev-map-label">Trajeto ilustrativo</span>
   </div>
   <div className="bev-preview-details"><div><small>Planejamento</small><strong>Rota organizada</strong></div><span className="bev-preview-chip">Ida e volta</span></div>
   <div className="bev-preview-steps"><div><span className="bev-step-indicator"/>Pontos de embarque</div><div><span className="bev-step-indicator"/>Presença da turma</div><div><span className="bev-step-indicator"/>Destino da viagem</div></div>
  </div>
  <figcaption id="bev-preview-caption">Representação ilustrativa das funcionalidades do BeVans.</figcaption>
 </figure>;
}

export default function Hero() {
 return <section className="bev-hero" id="inicio">
  <div className="bev-hero-orbit bev-hero-orbit-a" aria-hidden="true"/>
  <div className="bev-hero-orbit bev-hero-orbit-b" aria-hidden="true"/>
  <div className="container bev-hero-inner">
   <div className="bev-hero-copy">
    <span className="bev-home-kicker"><i aria-hidden="true"/> Transporte conectado</span>
    <h1>Organize sua rota.<br/> <span>Conecte sua viagem.</span></h1>
    <p>Turmas, embarques, rotas e excursões em uma plataforma que aproxima motoristas e passageiros.</p>
    <div className="bev-hero-actions">
     <Link href="/login" className="bev-button-primary" aria-label="Acessar minha conta BeVans">Entrar no BeVans <span aria-hidden="true">→</span></Link>
     <Link href="/#experiencia" className="bev-button-ghost">Como funciona <span aria-hidden="true">↓</span></Link>
    </div>
    <p className="bev-hero-access-note">Já tem uma conta autorizada? Use o mesmo acesso do aplicativo. <Link href="/convite">Recebeu um convite de excursão?</Link></p>
   </div>
   <RouteIllustration/>
  </div>
 </section>;
}
