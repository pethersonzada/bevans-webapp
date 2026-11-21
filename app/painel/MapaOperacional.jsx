'use client';

import {useEffect,useRef,useState} from 'react';
import './mapa-operacional.css';

let leafletPromise;
function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Mapa disponível somente no navegador.'));
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve,reject)=>{
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Biblioteca do mapa indisponível.'));
    script.onerror = () => reject(new Error('Não foi possível carregar o mapa. Verifique a conexão.'));
    document.head.appendChild(script);
  }).catch(e=>{leafletPromise=null;throw e;});
  return leafletPromise;
}

import {pontoValido,pontosRotaPublica,pontosRoteiroOperacional} from './mapa-utils.mjs';
export {pontoValido,pontosRotaPublica,pontosRoteiroOperacional};

/** Mapa de referência; linhas ligam pontos diretamente, sem sugerir caminhos pelas ruas. */
export default function MapaOperacional({pontos=[],posicao=null,titulo='Mapa da rota',onPick=null,autorizarRoteamento=false}) {
  const containerRef=useRef(null),mapRef=useRef(null),layerRef=useRef(null),leafletRef=useRef(null);
  const latestRef=useRef({pontos,posicao,caminho:null});
  const onPickRef=useRef(onPick);
  const [erro,setErro]=useState('');
  const [caminho,setCaminho]=useState(null),[passos,setPassos]=useState([]),[roteando,setRoteando]=useState(false),[erroRota,setErroRota]=useState('');
  latestRef.current={pontos,posicao,caminho};
  onPickRef.current=onPick;

  const redrawRef=useRef(null);
  useEffect(()=>{
    let cancelled=false;
    loadLeaflet().then(L=>{
      if(cancelled || !containerRef.current) return;
      leafletRef.current=L;
      const map=L.map(containerRef.current,{scrollWheelZoom:false});
      mapRef.current=map;
      map.on('click',e=>{onPickRef.current?.({latitude:e.latlng.lat,longitude:e.latlng.lng});});
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19,attribution:'&copy; OpenStreetMap contributors',
      }).addTo(map);
      layerRef.current=L.layerGroup().addTo(map);
      const redraw=()=>{
        if(!mapRef.current || !layerRef.current) return;
        layerRef.current.clearLayers();
        const input=latestRef.current;
        const pins=Array.isArray(input.pontos)?input.pontos.filter(p=>pontoValido(p.latitude,p.longitude)):[];
        const coords=[];
        for(const p of pins) {
          const ll=[p.latitude,p.longitude]; coords.push(ll);
          const marker=L.circleMarker(ll,{radius:p.tipo==='origem'||p.tipo==='ORIGEM'?9:7,weight:2,color:'#14253a',fillColor:p.tipo==='destino'||p.tipo==='DESTINO'?'#15a6c7':'#007bff',fillOpacity:0.9});
          const tooltip=document.createElement('span');
          tooltip.textContent=p.nome || 'Ponto de parada';
          marker.bindTooltip(tooltip).addTo(layerRef.current);
        }
        const trajeto=Array.isArray(input.caminho)?input.caminho.filter(p=>Array.isArray(p)&&p.length===2&&pontoValido(p[0],p[1])):[];
        if(trajeto.length>1){L.polyline(trajeto,{color:'#138161',weight:5,opacity:0.85}).addTo(layerRef.current);coords.push(...trajeto);} 
        else if(coords.length>1) L.polyline(coords,{color:'#007bff',opacity:0.7,weight:3,dashArray:'7 7'}).addTo(layerRef.current);
        const v=input.posicao;
        if(v && v.estado==='ATUALIZADA' && pontoValido(v.latitude,v.longitude)){
          const ll=[v.latitude,v.longitude];
          const marker=L.circleMarker(ll,{radius:11,weight:3,color:'#0c533d',fillColor:'#16a779',fillOpacity:0.95});
          const tooltip=document.createElement('span');tooltip.textContent='Posição recente da van';
          marker.bindTooltip(tooltip).addTo(layerRef.current);
          if(!coords.length) coords.push(ll);
        }
        if(coords.length) {
          const bounds=L.latLngBounds(coords);
          map.fitBounds(bounds.pad(0.2),{maxZoom:15,animate:false});
        } else map.setView([-8.05,-34.9],8);
        map.invalidateSize();
      };
      redrawRef.current=redraw;
      redraw();
    }).catch(e=>{if(!cancelled)setErro(e.message);});
    return ()=>{cancelled=true;redrawRef.current=null;mapRef.current?.remove();mapRef.current=null;layerRef.current=null;};
  },[]);

  useEffect(()=>{redrawRef.current?.();},[pontos,posicao,caminho]);

  async function tracarRota(){
    if(roteando)return;
    setErroRota('');setPassos([]);setCaminho(null);
    const token=process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if(!token){setErroRota('Configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN para consultar trajetos por vias.');return;}
    const pins=pontos.filter(p=>pontoValido(p.latitude,p.longitude));
    if(pins.length<2||pins.length>25){setErroRota('O roteiro precisa ter entre 2 e 25 pontos válidos para o Mapbox Directions.');return;}
    if(!window.confirm('Consultar a rota viária no Mapbox? Os pontos deste roteiro serão enviados ao provedor de mapas para traçar o percurso.'))return;
    setRoteando(true);
    try{
      const coords=pins.map(p=>encodeURIComponent(p.longitude+','+p.latitude)).join(';');
      const url='https://api.mapbox.com/directions/v5/mapbox/driving/'+coords+'?geometries=geojson&overview=full&steps=true&language=pt&access_token='+encodeURIComponent(token);
      const response=await fetch(url,{cache:'no-store'});
      if(!response.ok)throw Error('Consulta de roteamento indisponível (HTTP '+response.status+').');
      const payload=await response.json();const route=payload.routes?.[0];
      if(!route||!Array.isArray(route.geometry?.coordinates))throw Error('Nenhum percurso encontrado para os pontos selecionados.');
      setCaminho(route.geometry.coordinates.map(p=>[p[1],p[0]]));
      setPassos((route.legs||[]).flatMap(leg=>(leg.steps||[]).map(s=>s.maneuver?.instruction).filter(Boolean)));
    }catch(e){setErroRota(e.message);}finally{setRoteando(false);}
  }

  return <section className="be-map-shell" aria-label={titulo}>
    <div className="be-map-heading"><strong>{titulo}</strong><small>{caminho?'Percurso viário calculado pelo Mapbox.':'Linhas pontilhadas não representam vias ou navegação.'}</small></div>
    {erro?<p role="alert" className="be-map-error">{erro}</p>:null}
    {autorizarRoteamento&&<div className="be-map-route"><button type="button" className="be-btn" disabled={roteando} onClick={tracarRota}>{roteando?'Calculando percurso…':'Traçar percurso pelas ruas (Mapbox)'}</button><small>Consulta opcional. Compartilha os pontos selecionados com o Mapbox.</small></div>}
    {erroRota&&<p role="alert" className="be-map-error">{erroRota}</p>}
    {onPick&&<p className="be-map-pick">Clique ou toque no mapa para escolher o ponto exato.</p>}
    <div ref={containerRef} className={'be-map-canvas '+(onPick?'be-map-selectable':'')} aria-label={titulo}/>
    {passos.length>0&&<details className="be-map-list"><summary>Instruções do percurso ({passos.length})</summary><ol>{passos.map((passo,i)=><li key={i}>{passo}</li>)}</ol></details>}
    {pontos.length>0&&<details className="be-map-list"><summary>Pontos no mapa ({pontos.length})</summary><ol>{pontos.map((p,i)=><li key={i}>{p.nome || 'Ponto'}</li>)}</ol></details>}
    <p className="be-map-credit">Mapa: OpenStreetMap. Geolocalização disponível apenas para usuários autorizados durante uma viagem ativa.</p>
  </section>;
}
