'use client';

import {useEffect,useState} from 'react';
import MapaOperacional,{pontosRotaPublica,pontoValido} from './MapaOperacional';

const weekdays=[['MONDAY','Seg'],['TUESDAY','Ter'],['WEDNESDAY','Qua'],['THURSDAY','Qui'],['FRIDAY','Sex'],['SATURDAY','Sáb'],['SUNDAY','Dom']];
const blank=()=>({turmaId:'',nome:'',cidade:'',categoria:'UNIVERSITARIA',modo:'FIXA',origemNome:'',origemLatitude:null,origemLongitude:null,destinoNome:'',destinoLatitude:null,destinoLongitude:null,descricao:'',regiao:'',campus:'',dias:weekdays.slice(0,5).map(x=>x[0]),horarioIda:'',horarioVolta:''});
export default function EditorRotaWeb({api,motoristaId,rota,onSaved,onCancel}) {
  const [form,setForm]=useState(()=>rota?{...blank(),...rota,turmaId:String(rota.turmaId),horarioIda:rota.horarioIda||'',horarioVolta:rota.horarioVolta||''}:blank());
  const [paradas,setParadas]=useState(()=>rota?.paradas?.map(p=>({...p}))||[]);
  const [turmas,setTurmas]=useState([]),[alvo,setAlvo]=useState('origem'),[nomeParada,setNomeParada]=useState(''),[erro,setErro]=useState(''),[salvando,setSalvando]=useState(false);
  useEffect(()=>{
    let ativo=true;
    Promise.resolve().then(async()=>{
      try{const result=await api(`/turmas/motorista/${motoristaId}`);if(!Array.isArray(result))throw Error('Turmas indisponíveis.');if(ativo)setTurmas(result);}
      catch(e){if(ativo)setErro(e.message);}
    });
    return()=>{ativo=false;};
  },[api,motoristaId]);
  function edit(field,value){setForm(s=>({...s,[field]:value}));}
  function escolherPonto(p){
    if(!pontoValido(p.latitude,p.longitude))return;
    if(alvo==='origem'||alvo==='destino'){
      setForm(f=>({...f,[alvo+'Latitude']:p.latitude,[alvo+'Longitude']:p.longitude}));
      return;
    }
    if(!nomeParada.trim()){setErro('Informe o nome da parada antes de marcar no mapa.');return;}
    if(paradas.length>=50){setErro('Limite de 50 paradas.');return;}
    setParadas(list=>[...list,{nome:nomeParada.trim(),latitude:p.latitude,longitude:p.longitude,horario:null}]);
    setNomeParada('');setErro('');
  }
  function updateStop(index,field,value){setParadas(list=>list.map((p,i)=>i===index?{...p,[field]:value}:p));}
  function move(index,offset){setParadas(list=>{const next=[...list],j=index+offset;if(j<0||j>=next.length)return list;[next[j],next[index]]=[next[index],next[j]];return next;});}
  function remove(index){setParadas(list=>list.filter((_,i)=>i!==index));}
  function alterarDia(dia){setForm(f=>({...f,dias:f.dias.includes(dia)?f.dias.filter(d=>d!==dia):[...f.dias,dia]}));}
  async function salvar(e){
    e.preventDefault();if(salvando)return;setErro('');
    const turma=Number(form.turmaId);
    if(!Number.isSafeInteger(turma)||turma<=0||!turmas.some(t=>t.id===turma)){setErro('Escolha uma turma de sua titularidade.');return;}
    if(!form.nome.trim()||!form.cidade.trim()||!form.origemNome.trim()||!form.destinoNome.trim()||!form.dias.length){setErro('Preencha nome, cidade, extremos e ao menos um dia de operação.');return;}
    if(!pontoValido(form.origemLatitude,form.origemLongitude)||!pontoValido(form.destinoLatitude,form.destinoLongitude)){setErro('Selecione origem e destino no mapa.');return;}
    if(paradas.some(p=>!p.nome?.trim()||!pontoValido(p.latitude,p.longitude))){setErro('Revise os nomes e os pins das paradas.');return;}
    setSalvando(true);
    let salvoId=null;
    try{
      const body={...form,turmaId:turma,nome:form.nome.trim(),cidade:form.cidade.trim(),origemNome:form.origemNome.trim(),destinoNome:form.destinoNome.trim(),horarioIda:form.horarioIda||null,horarioVolta:form.horarioVolta||null};
      const result=await api(rota?`/rotas-publicas/${rota.id}`:'/rotas-publicas',{method:rota?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!result?.id||result.id!== (rota?.id||result.id))throw Error('O servidor não confirmou a configuração. Atualize antes de repetir.');
      salvoId=result.id;
      const persisted=await api(`/rotas-publicas/${salvoId}/paradas`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(paradas.map(p=>({...(p.id?{id:p.id}:{}),nome:p.nome.trim(),latitude:p.latitude,longitude:p.longitude,horario:p.horario||null})))});
      if(persisted?.id!==salvoId||persisted.paradas?.length!==paradas.length)throw Error('A API não confirmou a lista de paradas. Confira a rota antes de repetir.');
      onSaved(salvoId);
    }catch(e){setErro(`${e.message}${salvoId?' A configuração da rota #'+salvoId+' pode ter sido salva; confira antes de repetir o cadastro.':''}`);}
    finally{setSalvando(false);}
  }
  const points=pontosRotaPublica({...form,paradas});
  return <section className="be-card" aria-label={rota?'Editar rota pública':'Nova rota pública'}>
    <div className="be-row"><h2>{rota?'Editar rota pública':'Nova rota pública'}</h2><button type="button" className="be-btn" disabled={salvando} onClick={onCancel}>Fechar editor</button></div>
    <p className="be-muted">A rota é criada como não publicada. As configurações e paradas são salvas em duas chamadas oficiais. Evite edições durante uma viagem ativa.</p>
    {erro&&<p className="be-error" role="alert">{erro}</p>}
    <form className="be-form" onSubmit={salvar}>
      <div className="be-fieldset">
      <label>Turma responsável<select value={form.turmaId} disabled={Boolean(rota)} onChange={e=>edit('turmaId',e.target.value)} required><option value="">Selecione</option>{turmas.map(t=><option value={t.id} key={t.id}>{t.nome} (#{t.id})</option>)}</select></label>
      <label>Nome da rota<input value={form.nome} onChange={e=>edit('nome',e.target.value)} required/></label>
      <label>Cidade<input value={form.cidade} onChange={e=>edit('cidade',e.target.value)} required/></label>
      <label>Categoria<select value={form.categoria} onChange={e=>edit('categoria',e.target.value)}><option value="ESCOLAR">Escolar</option><option value="UNIVERSITARIA">Universitária</option><option value="OUTROS">Outros</option></select></label>
      <label>Modo<select value={form.modo} onChange={e=>edit('modo',e.target.value)}><option value="FIXA">Fixa</option><option value="FLEXIVEL">Flexível</option></select></label>
      <label>Horário de ida<input type="time" value={form.horarioIda} onChange={e=>edit('horarioIda',e.target.value)}/></label>
      <label>Horário de volta<input type="time" value={form.horarioVolta} onChange={e=>edit('horarioVolta',e.target.value)}/></label>
      <label>Origem<input value={form.origemNome} onChange={e=>edit('origemNome',e.target.value)} required/></label>
      <label>Destino<input value={form.destinoNome} onChange={e=>edit('destinoNome',e.target.value)} required/></label>
      <label>Região<input value={form.regiao||''} onChange={e=>edit('regiao',e.target.value)}/></label>
      <label>Campus<input value={form.campus||''} onChange={e=>edit('campus',e.target.value)}/></label>
      <label>Descrição<textarea value={form.descricao||''} onChange={e=>edit('descricao',e.target.value)} rows={2}/></label>
      </div>
      <fieldset className="be-fieldset"><legend>Dias de operação</legend>{weekdays.map(([dia,nome])=><label key={dia}><input type="checkbox" checked={form.dias.includes(dia)} onChange={()=>alterarDia(dia)}/> {nome}</label>)}</fieldset>
      <div className="be-actions"><label>Escolha no mapa<select value={alvo} onChange={e=>setAlvo(e.target.value)}><option value="origem">Origem</option><option value="destino">Destino</option><option value="parada">Nova parada</option></select></label>
      {alvo==='parada'&&<label>Nome da parada<input value={nomeParada} onChange={e=>setNomeParada(e.target.value)} placeholder="Ex.: Praça Central"/></label>}</div>
      <MapaOperacional titulo="Definir origem, destino e paradas" pontos={points} onPick={escolherPonto}/>
      {paradas.length>0&&<section><h3>Paradas e ordem ({paradas.length})</h3><div className="be-list">{paradas.map((p,i)=><div key={p.id||'new-'+i} className="be-item"><div className="be-fieldset"><label>Parada {i+1}<input value={p.nome} onChange={e=>updateStop(i,'nome',e.target.value)}/></label><label>Horário opcional<input type="time" value={p.horario||''} onChange={e=>updateStop(i,'horario',e.target.value)}/></label></div><p className="be-muted">{p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}</p><div className="be-actions"><button type="button" className="be-btn" onClick={()=>move(i,-1)} disabled={i===0}>Subir</button><button type="button" className="be-btn" onClick={()=>move(i,1)} disabled={i===paradas.length-1}>Descer</button><button type="button" className="be-btn danger" onClick={()=>remove(i)}>Remover</button></div></div>)}</div></section>}
      <button className="be-btn primary" disabled={salvando}>{salvando?'Salvando…':rota?'Salvar rota e paradas':'Criar rota e salvar paradas'}</button>
    </form>
  </section>;
}
