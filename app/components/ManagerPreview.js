'use client';

import { useState } from 'react';
import Link from 'next/link';

const views = [
  {
    id: 'motorista', nav: 'Motorista', kicker: 'OPERAÇÃO DE ROTAS', title: 'Sua viagem, em perspectiva.',
    subtitle: 'A experiência mobile reúne turmas, presença, percurso e controles de viagem.',
    main: 'Rota de ida', sub: 'Exemplo ilustrativo · manhã',
    rows: [
      ['01','Selecione a turma','Organize origem, destino e passageiros'],
      ['02','Confira a presença','Visualize confirmações de ida e volta'],
      ['03','Inicie a viagem','Navegação com paradas e manobras'],
    ],
    badges: ['Turmas','Mapa','Embarques'], status:'Recursos presentes no app mobile',
  },
  {
    id: 'passageiro', nav:'Passageiro', kicker:'ACOMPANHAMENTO',title:'Informação ao longo do caminho.',
    subtitle:'O passageiro pode gerenciar sua presença e escolher endereços por turma.',
    main:'Sua próxima viagem',sub:'Exemplo ilustrativo · ida',
    rows:[
      ['01','Escolha a turma','Se houver mais de uma turma aprovada'],
      ['02','Confirme sua presença','Ida, volta ou ausência'],
      ['03','Acompanhe o percurso','Acesso às informações permitidas da viagem'],
    ],
    badges:['Presença','Endereços','Turmas'],status:'Recursos presentes no app mobile',
  },
  {
    id:'excursoes',nav:'Excursões',kicker:'PRÓXIMO MÓDULO',title:'Viagens fora da rotina.',
    subtitle:'Planejamento de excursões com convite web, vagas e check-in manual. Ainda em desenvolvimento.',
    main:'Excursão por convite',sub:'Fluxo planejado · sem dados reais',
    rows:[
      ['01','Configure a viagem','Destino, horário e capacidade'],
      ['02','Compartilhe o convite','Inscrição pelo navegador'],
      ['03','Organize os embarques','Paradas e check-in pelo organizador'],
    ],
    badges:['Convites','Inscrições','Check-in'],status:'Em desenvolvimento · backend pendente',
  },
];

export default function ManagerPreview(){
  const [selected,setSelected]=useState('motorista');
  const current=views.find(item=>item.id===selected) ?? views[0];
  return <div className="ops-shell">
    <aside className="ops-side">
      <Link className="ops-brand" href="/">BeVans<span>.</span></Link>
      <p className="ops-overline">EXPLORAR A PLATAFORMA</p>
      <div role="group" aria-label="Selecionar módulo demonstrativo" className="ops-tabs">
        {views.map(v=><button type="button" key={v.id} aria-pressed={selected===v.id} onClick={()=>setSelected(v.id)} className={selected===v.id?'ops-tab active':'ops-tab'}>
          <span aria-hidden="true">{v.id==='motorista'?'↗':v.id==='passageiro'?'⌖':'✦'}</span>{v.nav}
          {v.id==='excursoes'&&<small>EM BREVE</small>}
        </button>)}
      </div>
      <div className="ops-side-note"><span className="ops-status-indicator"/> Prévia de interface<br/><small>Nenhum dado operacional conectado</small></div>
      <Link href="/" className="ops-back">← Voltar ao site</Link>
    </aside>
    <section className="ops-main">
      <div className="ops-top"><span>BEVANS / EXPERIÊNCIA</span><span>DEMONSTRAÇÃO INTERATIVA</span></div>
      <div className="ops-content">
        <div className="ops-intro"><span className="ops-kicker">{current.kicker}</span><h1>{current.title}</h1><p>{current.subtitle}</p></div>
        <div className="ops-demo-notice" role="status"><strong>Prévia sem login</strong><span>Esta tela explica como os fluxos funcionam. Não existem contas, viagens, localização ou passageiros reais neste ambiente.</span></div>
        <div className="ops-layout">
          <div className="ops-primary-card">
            <div className="ops-card-top"><span>PAINEL DE EXPERIÊNCIA</span><span className={selected==='excursoes'?'ops-chip future':'ops-chip'}>{selected==='excursoes'?'PLANEJADO':'APP MOBILE'}</span></div>
            <div className="ops-card-hero"><span className="ops-signal" aria-hidden="true">⌁</span><div><h2>{current.main}</h2><p>{current.sub}</p></div></div>
            <div className="ops-steps">{current.rows.map(([num,title,detail])=><div key={num} className="ops-step"><span>{num}</span><div><strong>{title}</strong><small>{detail}</small></div><span aria-hidden="true">↗</span></div>)}</div>
          </div>
          <div className="ops-secondary">
            <div className="ops-map-card"><span>VISÃO DO CAMINHO</span><svg viewBox="0 0 340 190" role="img" aria-label="Trajeto esquemático ilustrativo"><defs><pattern id="ops-map-grid" width="27" height="27" patternUnits="userSpaceOnUse"><path d="M27 0H0V27" fill="none" stroke="#28435c" strokeWidth="1"/></pattern></defs><rect width="340" height="190" fill="#122639"/><rect width="340" height="190" fill="url(#ops-map-grid)"/><path d="M25 156C85 161 85 55 159 94S239 130 309 36" fill="none" stroke="#00d2ff" strokeWidth="5" strokeLinecap="round"/><circle cx="25" cy="156" r="7" fill="#00d2ff"/><circle cx="159" cy="94" r="9" fill="#122639" stroke="#00d2ff" strokeWidth="4"/><circle cx="309" cy="36" r="8" fill="#fff" stroke="#00d2ff" strokeWidth="3"/></svg><p>Ilustração de rota · sem GPS em tempo real</p></div>
            <div className="ops-secondary-card"><span>ÁREAS RELACIONADAS</span><div>{current.badges.map(tag=><span key={tag}>{tag}</span>)}</div><p>{current.status}</p></div>
          </div>
        </div>
        <div className="ops-actions"><div><h2>Conheça a próxima etapa do BeVans.</h2><p>O acesso web será conectado em conjunto com a autenticação e as regras de segurança.</p></div><div><Link href="/login">Prévia de acesso ↗</Link><Link href="/excursoes">Ver excursões</Link></div></div>
      </div>
    </section>
  </div>;
}