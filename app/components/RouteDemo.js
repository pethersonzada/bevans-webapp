'use client';

import { useState } from 'react';

const routes = {
  ida: {
    label: 'IDA • MANHÃ',
    destination: 'Destino · Campus',
    instruction: 'Siga em frente por 450 m',
    stops: [
      {name:'Garagem',time:'06:45',x:78,y:284},
      {name:'Parada A',time:'07:05',x:210,y:198},
      {name:'Parada B',time:'07:20',x:356,y:238},
      {name:'Campus',time:'07:40',x:520,y:90},
    ],
  },
  volta: {
    label: 'VOLTA • TARDE',
    destination: 'Destino · Garagem',
    instruction: 'Continue até a próxima parada',
    stops: [
      {name:'Campus',time:'17:10',x:520,y:90},
      {name:'Parada B',time:'17:25',x:356,y:238},
      {name:'Parada A',time:'17:40',x:210,y:198},
      {name:'Garagem',time:'18:00',x:78,y:284},
    ],
  },
};

export default function RouteDemo() {
  const [direction, setDirection] = useState('ida');
  const [step, setStep] = useState(1);
  const route = routes[direction];
  const position = route.stops[step];
  const finished = step === route.stops.length - 1;

  function changeDirection(value) {
    setDirection(value);
    setStep(1);
  }

  return (
    <div className="route-demo" aria-label="Demonstração interativa da experiência de rotas do aplicativo">
      <div className="route-demo-head">
        <div className="route-window-controls" aria-hidden="true"><span/><span/><span/></div>
        <span>BEVANS / NAVEGAÇÃO</span>
        <span className="route-demo-tag"><i/> MODO DEMONSTRAÇÃO</span>
      </div>
      <div className="route-demo-layout">
        <aside className="route-control-panel">
          <div className="route-control-kicker">CENTRAL DE ROTAS <span className="route-control-index">01 / 02</span></div>
          <h3>Seu caminho.<br/><em>Sob controle.</em></h3>
          <p className="route-control-desc">Uma prévia da navegação que acompanha cada viagem.</p>
          <div className="route-tabs" role="group" aria-label="Escolher sentido da rota">
            <button type="button" aria-pressed={direction==='ida'} className={direction==='ida'?'active':''} onClick={()=>changeDirection('ida')}>↗ Ida</button>
            <button type="button" aria-pressed={direction==='volta'} className={direction==='volta'?'active':''} onClick={()=>changeDirection('volta')}>↙ Volta</button>
          </div>
          <div className="route-timeline">
            {route.stops.map((stop,index)=><div className={'route-stop '+(index===step?'current ': '')+(index<step?'passed':'')} key={stop.name}>
              <span className="route-stop-track"><span className="route-stop-node">{index<step?'✓':index+1}</span></span>
              <span className="route-stop-info"><strong>{stop.name}</strong><small>{index<step?'Etapa simulada concluída':index===step?'Parada selecionada':'Próxima etapa'}</small></span>
              <span className="route-stop-time">{stop.time}</span>
            </div>)}
          </div>
          <button type="button" className="route-next-button" onClick={()=>setStep(finished?0:step+1)}>
            {finished?'↻ Reiniciar simulação':'Avançar próxima parada →'}
          </button>
          <p className="route-simulation-note">Simulação visual. Sem localização ou passageiros reais.</p>
        </aside>
        <div className="route-map-panel">
          <div className="route-map-top"><span><span className="route-live-dot"/> {route.label}</span><span>VISUALIZAÇÃO DE ROTA</span></div>
          <div className="route-map-canvas">
            <svg viewBox="0 0 600 360" role="img" aria-label={'Mapa esquemático de '+direction+' com veículo na parada '+position.name}>
              <defs>
                <pattern id="bevans-map-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#253448" strokeWidth=".9"/></pattern>
                <linearGradient id="bevans-route-stroke" x1="0" x2="1"><stop offset="0" stopColor="#007BFF"/><stop offset="1" stopColor="#00D2FF"/></linearGradient>
              </defs>
              <rect width="600" height="360" fill="#111f30"/>
              <rect width="600" height="360" fill="url(#bevans-map-grid)" opacity=".7"/>
              <g stroke="#253a4e" fill="none" strokeWidth="19" strokeLinecap="round">
                <path d="M-20 95L620 325"/><path d="M70 -30L250 380"/><path d="M450 -25L275 385"/><path d="M-20 270L620 48"/><path d="M575 -20L550 390"/>
              </g>
              <g stroke="#385068" fill="none" strokeWidth="1.5" strokeDasharray="10 13" opacity=".7">
                <path d="M-20 95L620 325"/><path d="M70 -30L250 380"/><path d="M450 -25L275 385"/><path d="M-20 270L620 48"/>
              </g>
              <path d="M78 284 C112 275 155 198 210 198 S300 280 356 238 S445 126 520 90" fill="none" stroke="#071522" strokeWidth="16" strokeLinecap="round"/>
              <path d="M78 284 C112 275 155 198 210 198 S300 280 356 238 S445 126 520 90" fill="none" stroke="url(#bevans-route-stroke)" strokeWidth="6" strokeLinecap="round"/>
              {route.stops.map((stop,index)=><g key={stop.name}>
                <circle cx={stop.x} cy={stop.y} r={index===step?15:10} fill={index===step?'#00D2FF':'#162638'} stroke={index===step?'#fff':'#74b5f1'} strokeWidth="3"/>
                {index===step?<circle cx={stop.x} cy={stop.y} r="5" fill="#0b1b2a"/>:<circle cx={stop.x} cy={stop.y} r="3" fill="#d8edff"/>}
              </g>)}
              <g transform={'translate('+(position.x-31)+' '+(position.y-59)+')'}>
                <rect width="62" height="31" rx="10" fill="#00D2FF"/>
                <text x="31" y="20" fill="#081a2b" fontSize="12" fontWeight="800" textAnchor="middle">VAN 01</text>
                <path d="M26 31L31 37L36 31" fill="#00D2FF"/>
              </g>
              <g opacity=".55" fontSize="10" fill="#9bb1c8" letterSpacing="1"><text x="43" y="48">SETOR NORTE</text><text x="365" y="322">REGIÃO CENTRAL</text><text x="425" y="53">CAMPUS</text></g>
            </svg>
            <div className="route-turn-card">
              <span className="route-turn-icon" aria-hidden="true">↱</span><div><small>PRÓXIMA MANOBRA</small><strong>{finished?'Destino alcançado':route.instruction}</strong></div><span className="route-turn-speed">32<small>KM/H*</small></span>
            </div>
            <div className="route-map-location"><span>⌖</span> {position.name}</div>
          </div>
          <div className="route-bottom"><div><small>ETAPAS CONCLUÍDAS</small><strong>{step} <span>/ {route.stops.length-1}</span></strong></div><div><small>SENTIDO</small><strong>{direction==='ida'?'IDA':'VOLTA'}</strong></div><div className="route-bottom-state"><span className="route-state-dot"/><strong>{finished?'Concluída':'Em simulação'}</strong></div></div>
          <div className="route-disclaimer">*Todos os valores, horários e trajetos são ilustrativos.</div>
        </div>
      </div>
    </div>
  );
}