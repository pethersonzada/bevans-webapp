import Link from 'next/link';

export const metadata = {title:'Painel do gestor · Prévia',description:'Conheça os módulos planejados do painel de gestão BeVans.',robots:{index:false,follow:false}};

const menu=[
 {icon:'▦',title:'Visão geral',caption:'Central operacional',active:true},
 {icon:'⌁',title:'Rotas',caption:'Trajetos e paradas'},
 {icon:'◫',title:'Excursões',caption:'Viagens ocasionais'},
 {icon:'◎',title:'Turmas',caption:'Escolar e universitário'},
 {icon:'♧',title:'Passageiros',caption:'Inscrições e presença'},
 {icon:'▤',title:'Relatórios',caption:'Indicadores futuros'},
];
const modules=[
 {k:'01',label:'ROTAS',title:'Organize cada trajeto',detail:'Percursos de ida e volta, pontos de parada e informações da viagem.',icon:'⌁',className:'routes'},
 {k:'02',label:'EXCURSÕES',title:'Uma nova forma de viajar',detail:'Criação de excursões, compartilhamento de convite e vagas planejadas.',icon:'↗',className:'trips'},
 {k:'03',label:'TURMAS',title:'Turmas em um só lugar',detail:'Grupos escolares e universitários, publicação e solicitações de ingresso.',icon:'▦',className:'groups'},
 {k:'04',label:'EMBARQUES',title:'Acompanhe a jornada',detail:'Listas de passageiros, confirmações e check-in manual.',icon:'✓',className:'checkin'},
];

export default function GestorPage(){
 return <main id="conteudo" className="manager-page">
  <div className="manager-shell">
   <aside className="manager-sidebar">
    <Link href="/" className="manager-brand">be<span>vans</span><b>.</b></Link>
    <div className="manager-sidebar-heading">WORKSPACE / VISUALIZAÇÃO</div>
    <nav aria-label="Módulos previstos no painel">{menu.map(item=><div key={item.title} className={'manager-menu-entry '+(item.active?'is-active':'')}><span aria-hidden="true">{item.icon}</span><div><strong>{item.title}</strong><small>{item.caption}</small></div></div>)}</nav>
    <div className="manager-sidebar-bottom"><span className="manager-avatar">B</span><div><strong>Ambiente de prévia</strong><small>Sem dados reais</small></div></div>
   </aside>
   <div className="manager-workspace">
    <div className="manager-topbar"><div className="manager-breadcrumb">BEVANS <span>/</span> PAINEL DO GESTOR <span>/</span> PRÉVIA</div><Link href="/" className="manager-back">← Voltar ao site</Link></div>
    <div className="manager-content">
     <div className="manager-intro"><div><span className="manager-kicker"><i/> PRÉVIA DO PRODUTO</span><h1>Seu centro de<br/><em>comando.</em></h1><p>Uma visão do futuro ambiente de gerenciamento de rotas, turmas e excursões. Construído para colocar as informações importantes no mesmo lugar.</p></div><div className="manager-intro-number" aria-hidden="true">B<span>.</span></div></div>
     <div className="manager-alert"><span aria-hidden="true">ⓘ</span><p><strong>Interface demonstrativa.</strong> Esta área apresenta a estrutura planejada. Não há sessão autenticada, dados operacionais, criação de excursões nem ações conectadas ao backend.</p></div>
     <div className="manager-stats"><div><span>MÓDULOS PLANEJADOS</span><strong>04</strong><small>Rotas, excursões, turmas e embarques</small></div><div><span>MODALIDADES</span><strong>03</strong><small>Escolar, universitário e excursões</small></div><div><span>INTEGRAÇÕES ATIVAS</span><strong>00</strong><small>Conexão reservada para a próxima fase</small></div></div>
     <div className="manager-section-head"><div><span>VISÃO DOS MÓDULOS</span><h2>Gestão que acompanha sua operação.</h2></div><span className="manager-planned">CONCEITO DE INTERFACE</span></div>
     <div className="manager-module-grid">{modules.map(item=><article className={'manager-module '+item.className} key={item.k}><div className="manager-module-top"><span>{item.label}</span><span>{item.k}/04</span></div><div className="manager-module-icon" aria-hidden="true">{item.icon}</div><h3>{item.title}</h3><p>{item.detail}</p><span className="manager-module-foot">EM PLANEJAMENTO <span aria-hidden="true">↗</span></span></article>)}</div>
     <div className="manager-next"><div><span className="manager-next-label">ACESSO À PLATAFORMA</span><h2>Seu espaço começa aqui.</h2><p>Conheça as futuras telas de entrada e criação de conta, preparadas para uma integração segura.</p></div><div><Link className="manager-primary-action" href="/login">Ver tela de entrada ↗</Link><Link className="manager-secondary-action" href="/cadastro">Ver cadastro</Link></div></div>
    </div>
   </div>
  </div>
 </main>;
}