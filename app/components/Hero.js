import Link from 'next/link';

function Check({ children }) {
  return <span className="hero-check"><span aria-hidden="true">✓</span> {children}</span>;
}

function DashboardPreview() {
  return (
    <div className="dashboard-shell" aria-label="Prévia ilustrativa do painel de gestão VanBora">
      <div className="dashboard-caption"><span className="pulse-dot" /> VISUALIZAÇÃO ILUSTRATIVA DA PLATAFORMA <span className="caption-line" /></div>
      <div className="dashboard-window">
        <div className="dashboard-sidebar">
          <div className="sidebar-brand"><span className="sidebar-mark">v<span>.</span></span> vanbora</div>
          <div className="sidebar-label">MENU PRINCIPAL</div>
          <div className="sidebar-link selected"><span>▦</span> Visão geral</div>
          <div className="sidebar-link"><span>⌁</span> Minhas rotas</div>
          <div className="sidebar-link"><span>♧</span> Passageiros</div>
          <div className="sidebar-link"><span>▤</span> Relatórios</div>
          <div className="sidebar-bottom"><span className="avatar">VB</span><div><strong>Minha operação</strong><small>Painel demonstrativo</small></div></div>
        </div>
        <div className="dashboard-content">
          <div className="dashboard-top"><div><small>PAINEL DE CONTROLE</small><h3>Bom dia! <span aria-hidden="true">☀</span></h3><p>Uma visão mais clara de cada trajeto.</p></div><span className="dashboard-date">Hoje <span aria-hidden="true">⌄</span></span></div>
          <div className="dashboard-stats">
            <div className="mini-stat"><span>Rotas planejadas</span><strong>04 <small>rotas</small></strong><em>Visão centralizada</em></div>
            <div className="mini-stat"><span>Passageiros</span><strong>128 <small>alunos</small></strong><em>Gestão simplificada</em></div>
            <div className="mini-stat"><span>Veículos</span><strong>08 <small>vans</small></strong><em>Tudo em um lugar</em></div>
          </div>
          <div className="dashboard-lower">
            <div className="preview-map">
              <div className="preview-heading"><strong>Visão da rota</strong><span className="preview-pill">Exemplo</span></div>
              <div className="map-area">
                <svg viewBox="0 0 500 245" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustração de rota conectando pontos de parada">
                  <defs><pattern id="grid" width="27" height="27" patternUnits="userSpaceOnUse"><path d="M 27 0 L 0 0 0 27" fill="none" stroke="#e6eaf0" strokeWidth="1"/></pattern></defs>
                  <rect width="500" height="245" fill="#f7f9fb"/><rect width="500" height="245" fill="url(#grid)"/>
                  <path d="M0 170 L500 20 M0 50 L500 220 M130 0 L235 245 M380 0 L300 245" stroke="#e5eaf0" strokeWidth="14" fill="none"/>
                  <path d="M48 189 C105 204 115 102 202 133 S307 192 370 101 S445 79 468 44" stroke="#f7b731" strokeWidth="6" strokeLinecap="round" fill="none" strokeDasharray="1 13"/>
                  <circle cx="48" cy="189" r="10" fill="#fff" stroke="#15233b" strokeWidth="4"/>
                  <circle cx="202" cy="133" r="11" fill="#f7b731" stroke="#fff" strokeWidth="4"/>
                  <circle cx="370" cy="101" r="10" fill="#fff" stroke="#15233b" strokeWidth="4"/>
                  <circle cx="468" cy="44" r="10" fill="#15233b" stroke="#fff" strokeWidth="4"/>
                  <g transform="translate(173 94)"><rect width="59" height="28" rx="14" fill="#15233b"/><text x="29" y="18" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">VAN 01</text></g>
                </svg>
                <div className="map-overlay"><span className="status-circle" /> Rota em destaque</div>
              </div>
            </div>
            <div className="preview-activity"><strong>Atividades da rota</strong><p>Exemplos de eventos que podem ser acompanhados</p>
              <div className="activity-line"><span className="activity-icon green">✓</span><div><b>Embarque registrado</b><small>Parada 01 • 07:15</small></div></div>
              <div className="activity-line"><span className="activity-icon yellow">↗</span><div><b>Trajeto iniciado</b><small>Rota da manhã • 07:20</small></div></div>
              <div className="activity-line"><span className="activity-icon blue">⌁</span><div><b>Próxima parada</b><small>Previsão • 07:35</small></div></div>
            </div>
          </div>
        </div>
      </div>
      <div className="floating-notice"><span className="floating-notice-icon">✓</span><div><strong>Mais controle da operação</strong><small>Do embarque à chegada</small></div></div>
    </div>
  );
}

export default function Hero() {
  return <section className="hero-section" id="inicio">
    <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
    <div className="container hero-container">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot"/> A NOVA FORMA DE GERENCIAR TRANSPORTE</div>
        <h1>Menos preocupação.<br /><span className="hero-highlight">Mais caminho</span><br />pela frente<span className="title-dot">.</span></h1>
        <p className="hero-description">Rotas organizadas, embarques acompanhados e famílias bem informadas. Tudo que você precisa para uma operação mais tranquila, em um só lugar.</p>
        <div className="hero-buttons"><Link href="/contato" className="button button-yellow button-large">Conhecer o VanBora <span aria-hidden="true">↗</span></Link><Link href="/#funcionalidades" className="button button-outline button-large">Ver como funciona <span aria-hidden="true">↓</span></Link></div>
        <div className="hero-points"><Check>Feito para quem está na estrada</Check><Check>Simples de usar</Check></div>
      </div>
      <DashboardPreview />
    </div>
    <div className="trusted-strip"><div className="container trusted-inner"><span>PENSADO PARA DIFERENTES OPERAÇÕES</span><div>Vans escolares <i/> Transporte universitário <i/> Frotas e cooperativas <i/> Transporte corporativo</div></div></div>
  </section>;
}