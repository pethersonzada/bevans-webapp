'use client';

export function IconePainel({nome,className=''}) {
 const desenhos={
  inicio:<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/></>,
  turmas:<><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></>,
  viagens:<><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  rotas:<><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a4 4 0 0 0 0-8h-6a4 4 0 0 1 0-8h7"/></>,
  pedidos:<><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM9 11h6M9 15h4"/></>,
  operacao:<><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
  notificacoes:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4"/></>,
  pontos:<><path d="M3 6 9 3l6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/></>,
  configuracoes:<><circle cx="12" cy="12" r="3"/><path d="m19 13 2 1-2 4-2-1-2 1v2H9v-2l-2-1-2 1-2-4 2-1v-2l-2-1 2-4 2 1 2-1V4h6v2l2 1 2-1 2 4-2 1z"/></>,
  mais:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
 };
 return <svg className={className} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{desenhos[nome]||desenhos.mais}</svg>;
}

export function NavegacaoPrincipal({itens,ativa,aoSelecionar,compacta=false}){
 return <nav className={compacta?'be-mobile-tabs be-bottom-navigation':'be-sidebar-nav be-primary-navigation'} aria-label={compacta?'Navegação do painel':'Áreas do painel'}>
  {itens.map(item=><button type="button" key={item.id} onClick={()=>aoSelecionar(item.id)} aria-current={ativa===item.id?'page':undefined} aria-label={item.rotulo}>
   <IconePainel nome={item.icone} className="be-navigation-icon"/>
   <span>{item.rotulo}</span>
  </button>)}
 </nav>;
}

export function MaisFerramentas({grupos,aoSelecionar,motorista}){
 return <div className="be-tools">
  <div className="be-tools-intro"><p className="be-tools-eyebrow">{motorista?'ESPAÇO DO MOTORISTA':'ESPAÇO DO PASSAGEIRO'}</p><h2>Encontre o que precisa</h2><p>As ferramentas estão organizadas por assunto para deixar o dia a dia mais simples.</p></div>
  {grupos.map(grupo=><section className="be-tool-group" key={grupo.titulo} aria-label={grupo.titulo}>
   <div className="be-tool-group-heading"><h3>{grupo.titulo}</h3><p>{grupo.descricao}</p></div>
   <div className="be-tool-grid">{grupo.itens.map(item=><button type="button" className="be-tool-link" key={item.id} onClick={()=>aoSelecionar(item.id)} aria-label={item.rotulo}>
    <span className="be-tool-icon"><IconePainel nome={item.icone}/></span>
    <span className="be-tool-copy"><strong>{item.rotulo}</strong><small>{item.descricao}</small></span>
    <span className="be-tool-arrow" aria-hidden="true">→</span>
   </button>)}</div>
  </section>)}
 </div>;
}
