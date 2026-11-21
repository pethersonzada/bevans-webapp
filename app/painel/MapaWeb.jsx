'use client';
import {useEffect,useRef,useState} from 'react';
export {coordenadaValida,normalizarPontos} from '../lib/mapa-web.mjs';
import {coordenadaValida,normalizarPontos} from '../lib/mapa-web.mjs';

// Mapbox GL JS roda somente no navegador. Token público separado do projeto mobile.
const JS='https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.js';
const CSS='https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.css';
let loading;
function loadMapbox(){
 if(typeof window==='undefined')return Promise.reject(Error('Mapa disponível apenas no navegador.'));
 if(window.mapboxgl)return Promise.resolve(window.mapboxgl);
 if(!loading)loading=new Promise((resolve,reject)=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href=CSS;document.head.appendChild(css);
  const script=document.createElement('script');script.src=JS;script.async=true;
  script.onload=()=>window.mapboxgl?resolve(window.mapboxgl):reject(Error('Mapbox não inicializou.'));
  script.onerror=()=>reject(Error('Não foi possível carregar o Mapbox. Confira sua conexão e as políticas de rede.'));
  document.head.appendChild(script);
 }).catch(err=>{loading=null;throw err;});
 return loading;
}
function montarRotaGeojson(coordinates){
 if(!Array.isArray(coordinates)||coordinates.length<2)return null;
 return {type:'Feature',properties:{},geometry:{type:'LineString',coordinates}};
}
export default function MapaWeb({pontos=[],posicao=null,rota=null,onSelecionar=null,altura=420}){
 const host=useRef(null),map=useRef(null),markers=useRef([]),onPick=useRef(onSelecionar);
 const token=process.env.NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN || '';
 const [error,setError]=useState(token?'':'Configure NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN para carregar o mapa.');
 const [ready,setReady]=useState(false);
 useEffect(()=>{onPick.current=onSelecionar;},[onSelecionar]);
 useEffect(()=>{
  let cancelled=false;
  if(!token)return;
  loadMapbox().then(gl=>{
   if(cancelled||!host.current)return;
   gl.accessToken=token;
   const instance=new gl.Map({container:host.current,style:'mapbox://styles/mapbox/streets-v12',center:[-35.1,-8.1],zoom:11});
   map.current=instance;
   setReady(true);
   instance.addControl(new gl.NavigationControl(),'top-right');
   instance.on('click',e=>{
    if(onPick.current)onPick.current({latitude:e.lngLat.lat,longitude:e.lngLat.lng});
   });
   instance.on('error',e=>{if(!cancelled&&e?.error?.message)setError('Falha ao carregar o mapa: '+e.error.message);});
  }).catch(e=>{if(!cancelled)setError(e.message);});
  return()=>{cancelled=true;markers.current.forEach(m=>m.remove());markers.current=[];map.current?.remove();map.current=null;};
 },[token]);
 useEffect(()=>{
  const instance=map.current;
  if(!instance)return;
  let active=true;
  const draw=()=>{
   if(!active||!map.current)return;
   markers.current.forEach(m=>m.remove());markers.current=[];
   const gl=window.mapboxgl;
   const pts=normalizarPontos(pontos);
   if(coordenadaValida(posicao))pts.push({...posicao,nome:'Van (GPS recente)',tipo:'VAN'});
   const bounds=new gl.LngLatBounds();
   pts.forEach((p,i)=>{
    const el=document.createElement('div');
    el.className='be-map-marker '+(p.tipo==='VAN'?'be-map-marker-van':'');
    el.textContent=p.tipo==='VAN'?'V':String(i+1);
    el.title=p.nome;
    const marker=new gl.Marker({element:el}).setLngLat([p.longitude,p.latitude]).setPopup(new gl.Popup({offset:18}).setText(p.nome)).addTo(instance);
    markers.current.push(marker);bounds.extend([p.longitude,p.latitude]);
   });
   if(instance.getLayer('bevans-route'))instance.removeLayer('bevans-route');
   if(instance.getSource('bevans-route'))instance.removeSource('bevans-route');
   const geometry=montarRotaGeojson(rota);
   if(geometry){
    instance.addSource('bevans-route',{type:'geojson',data:geometry});
    instance.addLayer({id:'bevans-route',type:'line',source:'bevans-route',paint:{'line-color':'#007bff','line-width':5,'line-opacity':0.88}});
    geometry.geometry.coordinates.forEach(c=>bounds.extend(c));
   }
   if(!bounds.isEmpty())instance.fitBounds(bounds,{padding:58,maxZoom:15,duration:0});
  };
  if(instance.isStyleLoaded())draw();
  else instance.once('load',draw);
  return()=>{active=false;instance.off('load',draw);};
 },[ready,pontos,posicao,rota]);
 return <div className="be-map-section">
  {error&&<p role="alert" className="be-error">{error}</p>}
  <div ref={host} className="be-map-canvas" style={{height:altura}} aria-label="Mapa interativo da operação" role="region"/>
  {onSelecionar&&<p className="be-muted">Clique no mapa para selecionar coordenadas. Verifique o ponto antes de salvar.</p>}
  <p className="be-footnote">Mapa Mapbox. Coordenadas e pontos só são exibidos após autorização do backend. GPS expirado não aparece no mapa.</p>
 </div>;
}
