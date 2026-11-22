'use client';
import {useState,useRef} from 'react';
import MapaWeb,{coordenadaValida} from './MapaWeb';
import {idSeguro} from '../lib/bevans-api.mjs';
import {mensagemErroEmbarque} from '../lib/embarque-web.mjs';

export default function PlanejamentoEmbarquesWeb({api,rotaId,data,sentido}){
 const [pontos,setPontos]=useState(null),[otimizar,setOtimizar]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const writing=useRef(false);
 async function planejar(){
  if(writing.current)return;
  writing.current=true;setBusy(true);setError('');setPontos(null);
  try{
   const query=new URLSearchParams({data,sentido,otimizar:String(otimizar)});
   const result=await api('/rotas-publicas/'+idSeguro(rotaId)+'/embarques/planejamento?'+query,{method:'POST'});
   if(!Array.isArray(result)||result.length<2||result.some(p=>!coordenadaValida(p)))
     throw Error('O servidor não retornou um planejamento completo e válido.');
   setPontos(result);
  }catch(e){setError(mensagemErroEmbarque(e));}
  finally{writing.current=false;setBusy(false);}
 }
 return <div className="be-section">
  <h3>Planejamento privado de embarques</h3>
  <p className="be-muted">Prévia exclusiva do motorista. Inclui somente pedidos aprovados, preserva pontos cadastrados e considera exceções sem publicá-las no catálogo.</p>
  {error&&<p role="alert" className="be-error">{error}</p>}
  <label><input type="checkbox" checked={otimizar} disabled={busy} onChange={e=>{setOtimizar(e.target.checked);setPontos(null);}}/> Otimizar prévia quando a rota permitir</label>
  <div className="be-actions"><button type="button" className="be-btn" disabled={busy||!rotaId||!data} onClick={planejar}>{busy?'Planejando…':'Consultar planejamento oficial'}</button></div>
  {pontos&&<><p role="status" className="be-muted">{pontos.length} pontos retornados pelo servidor. Esta prévia não inicia nem altera uma viagem.</p><MapaWeb pontos={pontos} altura={350}/><ol className="be-map-stops">{pontos.map((p,i)=><li key={i}>{p.nome||'Ponto '+(i+1)}</li>)}</ol></>}
 </div>;
}
