'use client';

import {useState} from 'react';
import MapaOperacional,{pontoValido} from './MapaOperacional';

const localDate=s=>{
  if(!s)return '';
  const d=new Date(s);if(!Number.isFinite(d.getTime()))return '';
  return [d.getFullYear(),'-',String(d.getMonth()+1).padStart(2,'0'),'-',String(d.getDate()).padStart(2,'0'),'T',String(d.getHours()).padStart(2,'0'),':',String(d.getMinutes()).padStart(2,'0')].join('');
};
const init=()=>({titulo:'',destinoNome:'',destinoLatitude:null,destinoLongitude:null,origemNome:'',origemLatitude:null,origemLongitude:null,partidaEm:'',retornoEm:'',capacidade:10});
export default function GestaoExcursaoWeb({api,excursao,onSaved,onClose}) {
  const [item,setItem]=useState(excursao||null),[form,setForm]=useState(()=>excursao?{...excursao,partidaEm:localDate(excursao.partidaEm),retornoEm:localDate(excursao.retornoEm)}:init());
  const [modo,setModo]=useState(excursao?.modoColeta||'PORTA_A_PORTA'),[paradas,setParadas]=useState(excursao?.paradas?.map(p=>({...p}))||[]);
  const [alvo,setAlvo]=useState('destino'),[nomeParada,setNomeParada]=useState(''),[erro,setErro]=useState(''),[aviso,setAviso]=useState(''),[busy,setBusy]=useState(false);
  const [inscricoes,setInscricoes]=useState(null),[execucoes,setExecucoes]=useState(null),[vagas,setVagas]=useState(null);
  const [convites,setConvites]=useState(null),[linkNovo,setLinkNovo]=useState(''),[expiraEm,setExpiraEm]=useState('');
  function campo(k,v){setForm(s=>({...s,[k]:v}));}
  function pin(p){
    if(!pontoValido(p.latitude,p.longitude))return;
    if(alvo==='origem'||alvo==='destino'){setForm(f=>({...f,[alvo+'Latitude']:p.latitude,[alvo+'Longitude']:p.longitude}));return;}
    if(!nomeParada.trim()){setErro('Informe o nome da parada.');return;}
    setParadas(s=>[...s,{nome:nomeParada.trim(),latitude:p.latitude,longitude:p.longitude,horario:null,instrucoes:null,pontoConfirmado:true}]);setNomeParada('');setErro('');
  }
  async function executar(acao,descricao){if(busy)return;setErro('');setAviso('');setBusy(true);try{await acao();setAviso(descricao);}catch(e){setErro(e.message);}finally{setBusy(false);}}
  async function salvar(e){
    e.preventDefault();
    if(!form.titulo.trim()||!form.destinoNome.trim()||!pontoValido(form.destinoLatitude,form.destinoLongitude)){setErro('Informe título e destino, confirmando o destino no mapa.');return;}
    if(form.origemNome.trim()&&!pontoValido(form.origemLatitude,form.origemLongitude)){setErro('Confirme a origem no mapa ou deixe-a vazia.');return;}
    if(!Number.isSafeInteger(Number(form.capacidade))||Number(form.capacidade)<=0){setErro('Capacidade deve ser inteira e positiva.');return;}
    if(!form.partidaEm||!Number.isFinite(new Date(form.partidaEm).getTime())){setErro('Informe a partida.');return;}
    await executar(async()=>{
      const payload={
        titulo:form.titulo.trim(),destinoNome:form.destinoNome.trim(),destinoLatitude:form.destinoLatitude,destinoLongitude:form.destinoLongitude,
        origemNome:form.origemNome.trim()||null,origemLatitude:form.origemNome.trim()?form.origemLatitude:null,origemLongitude:form.origemNome.trim()?form.origemLongitude:null,
        partidaEm:new Date(form.partidaEm).toISOString(),retornoEm:form.retornoEm?new Date(form.retornoEm).toISOString():null,
        capacidade:Number(form.capacidade),versao:item?.versao||0,
      };
      const response=await api(item?`/excursoes/${item.id}`:'/excursoes',{method:item?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!response?.id||!Number.isSafeInteger(response.versao))throw Error('A API não confirmou a excursão. Consulte os dados antes de repetir.');
      setItem(response);setForm({...response,partidaEm:localDate(response.partidaEm),retornoEm:localDate(response.retornoEm)});
      onSaved(response.id);
    },'Dados da excursão salvos no servidor.');
  }
  async function salvarColeta(){
    if(!item)return;
    if(modo==='PARADA_UNICA'&&paradas.length!==1||modo==='MULTIPLAS_PARADAS'&&(paradas.length<2||paradas.length>50)||modo==='PORTA_A_PORTA'&&paradas.length!==0){setErro('Revise o número de paradas requerido pelo modo de coleta.');return;}
    if(paradas.some(p=>!p.nome?.trim()||!pontoValido(p.latitude,p.longitude))){setErro('Confira nomes e pins das paradas.');return;}
    await executar(async()=>{
      const response=await api(`/excursoes/${item.id}/coleta`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        modo,versao:item.versao,paradas:paradas.map(p=>({...(p.id?{id:p.id}:{}),nome:p.nome.trim(),latitude:p.latitude,longitude:p.longitude,horario:p.horario||null,instrucoes:p.instrucoes||null,pontoConfirmado:true}))
      })});
      if(response?.id!==item.id||!Number.isSafeInteger(response.versao))throw Error('Coleta não confirmada. Atualize antes de repetir.');
      setItem(response);setParadas(response.paradas||[]);setModo(response.modoColeta);onSaved(response.id);
    },'Coleta atualizada.');
  }
  async function publicar(){
    if(!item||!window.confirm('Publicar esta excursão? Confirme horário, destino e coleta antes de liberar inscrições.'))return;
    await executar(async()=>{
      const response=await api(`/excursoes/${item.id}/publicacao`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({versao:item.versao})});
      if(response?.id!==item.id||response.estado!=='PUBLICADA')throw Error('Publicação não confirmada.');
      setItem(response);onSaved(item.id);
    },'Excursão publicada.');
  }
  async function cancelar(){
    if(!item||!window.confirm('Cancelar a excursão? A operação e inscrições podem ser canceladas de forma definitiva.'))return;
    await executar(async()=>{
      const response=await api(`/excursoes/${item.id}/cancelamento`,{method:'PUT'});
      if(response?.id!==item.id||response.estado!=='CANCELADA')throw Error('Cancelamento não confirmado.');
      setItem(response);onSaved(item.id);
    },'Excursão cancelada.');
  }
  async function consultar(){
    if(!item)return;
    await executar(async()=>{
      const [a,b,c,d]=await Promise.all([
        api(`/excursoes/${item.id}`),api(`/excursoes/${item.id}/inscricoes?pagina=0&tamanho=20`),
        api(`/excursoes/${item.id}/inscricoes/vagas`),api(`/excursoes/${item.id}/execucoes`),
      ]);
      if(a?.id!==item.id||!Array.isArray(b?.itens)||!Array.isArray(d))throw Error('Listagens incompletas.');
      setItem(a);setInscricoes(b.itens);setVagas(c);setExecucoes(d);
    },'Informações atualizadas.');
  }
  async function confirma(insc,aceitar){
    if(!item||!window.confirm(`${aceitar?'Confirmar':'Cancelar'} a inscrição #${insc.id}?`))return;
    await executar(async()=>{
      const path=`/excursoes/${item.id}/inscricoes/${insc.id}`+(aceitar?'/confirmacao':'');
      const response=await api(path,{method:aceitar?'PUT':'DELETE'});
      if(response?.id!==insc.id)throw Error('O servidor não confirmou a inscrição.');
      const list=await api(`/excursoes/${item.id}/inscricoes?pagina=0&tamanho=20`);
      if(!Array.isArray(list?.itens))throw Error('Atualize a lista para verificar a alteração.');
      setInscricoes(list.itens);
    },'Inscrição processada.');
  }
  async function listarConvites(){if(!item)return;await executar(async()=>{const r=await api(`/excursoes/${item.id}/convites`);if(!Array.isArray(r))throw Error('A API não retornou convites.');setConvites(r);},'Convites consultados.');}
  async function criarConvite(){
    if(!item||busy||!expiraEm||!window.confirm('Criar um novo convite para inscrição em excursão? O link poderá ser visualizado apenas agora.'))return;
    const data=new Date(expiraEm);
    if(!Number.isFinite(data.getTime())||data.getTime()<=Date.now()||data.getTime()>Date.now()+30*86400000){setErro('Informe validade futura de até 30 dias.');return;}
    await executar(async()=>{
      const r=await api(`/excursoes/${item.id}/convites`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expiraEm:data.toISOString()})});
      if(!r?.convite?.id||typeof r.token!=='string'||!r.token){throw Error('Não foi possível confirmar o convite. Verifique a lista antes de repetir.');}
      setLinkNovo(window.location.origin+'/convite#token='+encodeURIComponent(r.token));
      const list=await api(`/excursoes/${item.id}/convites`);
      if(Array.isArray(list))setConvites(list);
    },'Convite emitido. Copie o link antes de fechar este painel; o token não é recuperável.');
  }
  async function revogarConvite(conviteId){
    if(!item||busy||!window.confirm('Revogar o convite? Ele deixará de permitir novos acessos.'))return;
    await executar(async()=>{await api(`/excursoes/${item.id}/convites/${conviteId}`,{method:'DELETE'});setLinkNovo('');const list=await api(`/excursoes/${item.id}/convites`);if(Array.isArray(list))setConvites(list);},'Convite revogado.');
  }
  async function copiarLink(){
    if(!linkNovo)return;
    try{await navigator.clipboard.writeText(linkNovo);setAviso('Link copiado. Compartilhe apenas com participantes autorizados.');}
    catch{setErro('Não foi possível copiar o link. Use um navegador com HTTPS.');}
  }
  async function iniciar(sentido){
    if(!item||!window.confirm(`Iniciar a execução de ${sentido} da excursão?`))return;
    await executar(async()=>{
      const response=await api(`/excursoes/${item.id}/execucoes?sentido=${sentido}&otimizar=false`,{method:'POST'});
      if(!response?.id||response.sentido!==sentido)throw Error('A API não confirmou o início. Consulte as execuções antes de repetir.');
      const list=await api(`/excursoes/${item.id}/execucoes`);setExecucoes(list);
      onSaved(item.id);
    },'Execução iniciada.');
  }
  async function finalizar(ex){
    if(!window.confirm(`Finalizar a execução #${ex.id}? Confirme que os desembarques reais foram registrados.`))return;
    await executar(async()=>{
      const op=await api(`/operacoes/EXCURSAO/${ex.id}`);
      if(!Number.isSafeInteger(op?.contadores?.naVan)||op.contadores.naVan!==0)throw Error('Há passageiros embarcados ou o painel não foi confirmado. Registre os desembarques.');
      const result=await api(`/excursoes/${item.id}/execucoes/${ex.id}/finalizacao`,{method:'PUT'});
      if(result?.id!==ex.id||result.estado!=='FINALIZADA')throw Error('Finalização não confirmada.');
      setExecucoes(await api(`/excursoes/${item.id}/execucoes`));onSaved(item.id);
    },'Execução finalizada.');
  }
  const pontos=[];
  if(pontoValido(form.origemLatitude,form.origemLongitude))pontos.push({nome:form.origemNome||'Origem',latitude:form.origemLatitude,longitude:form.origemLongitude,tipo:'origem'});
  for(const p of paradas)if(pontoValido(p.latitude,p.longitude))pontos.push({nome:p.nome,latitude:p.latitude,longitude:p.longitude,tipo:'parada'});
  if(pontoValido(form.destinoLatitude,form.destinoLongitude))pontos.push({nome:form.destinoNome||'Destino',latitude:form.destinoLatitude,longitude:form.destinoLongitude,tipo:'destino'});
  return <section className="be-card">
    <div className="be-row"><h2>{item?`Excursão #${item.id}`:'Nova excursão'}</h2><button type="button" className="be-btn" onClick={onClose}>Fechar</button></div>
    {item&&<p className="be-muted">Estado: {item.estado} · versão {item.versao}</p>}
    {erro&&<p className="be-error" role="alert">{erro}</p>}{aviso&&<p role="status">{aviso}</p>}
    <form className="be-form" onSubmit={salvar}>
      <div className="be-fieldset"><label>Título<input required value={form.titulo} onChange={e=>campo('titulo',e.target.value)}/></label>
      <label>Capacidade<input required type="number" min="1" value={form.capacidade} onChange={e=>campo('capacidade',e.target.value)}/></label>
      <label>Partida<input required type="datetime-local" value={form.partidaEm} onChange={e=>campo('partidaEm',e.target.value)}/></label>
      <label>Retorno (opcional)<input type="datetime-local" value={form.retornoEm||''} onChange={e=>campo('retornoEm',e.target.value)}/></label>
      <label>Origem (opcional)<input value={form.origemNome||''} onChange={e=>campo('origemNome',e.target.value)}/></label>
      <label>Destino<input required value={form.destinoNome} onChange={e=>campo('destinoNome',e.target.value)}/></label></div>
      <div className="be-actions"><label>Marcar no mapa<select value={alvo} onChange={e=>setAlvo(e.target.value)}><option value="origem">Origem</option><option value="destino">Destino</option>{modo!=='PORTA_A_PORTA'&&<option value="parada">Nova parada</option>}</select></label>
      {alvo==='parada'&&<label>Nome da nova parada<input value={nomeParada} onChange={e=>setNomeParada(e.target.value)}/></label>}</div>
      <MapaOperacional titulo="Origem, paradas e destino da excursão" pontos={pontos} onPick={pin} privado/>
      <button className="be-btn primary" disabled={busy}>{busy?'Salvando…':item?'Salvar dados':'Criar rascunho'}</button>
    </form>
    {item&&<div className="be-section"><h3>Coleta e participantes</h3>
      <div className="be-fieldset"><label>Modo de coleta<select value={modo} onChange={e=>{setModo(e.target.value);setParadas([]);setAlvo('destino');}}><option value="PORTA_A_PORTA">Porta a porta</option><option value="PARADA_UNICA">Parada única</option><option value="MULTIPLAS_PARADAS">Múltiplas paradas</option></select></label></div>
      {paradas.length>0&&<div className="be-list">{paradas.map((p,i)=><div key={p.id||'new'+i} className="be-item"><strong>{p.nome} · {i+1}ª parada</strong><div className="be-actions"><button type="button" className="be-btn" onClick={()=>setParadas(a=>a.filter((_,j)=>i!==j))}>Remover</button></div></div>)}</div>}
      <div className="be-actions"><button className="be-btn" type="button" disabled={busy} onClick={salvarColeta}>Salvar modo e paradas</button><button className="be-btn" type="button" onClick={consultar} disabled={busy}>Consultar inscrições e execuções</button></div>
      <div className="be-actions">{item.estado==='RASCUNHO'&&<button type="button" className="be-btn primary" disabled={busy} onClick={publicar}>Publicar excursão</button>}
      {['RASCUNHO','PUBLICADA'].includes(item.estado)&&<button type="button" className="be-btn danger" disabled={busy} onClick={cancelar}>Cancelar excursão</button>}</div>
      {vagas&&<p className="be-muted">Vagas: {JSON.stringify(vagas)}</p>}
      {inscricoes!==null&&<div className="be-list"><h3>Inscrições</h3>{inscricoes.length?inscricoes.map(p=><div key={p.id} className="be-item"><strong>{p.nome||`Inscrição #${p.id}`}</strong><p>{p.estado}</p>{p.estado==='SOLICITADA'&&<div className="be-actions"><button type="button" className="be-btn primary" disabled={busy} onClick={()=>confirma(p,true)}>Confirmar vaga</button><button type="button" className="be-btn" disabled={busy} onClick={()=>confirma(p,false)}>Recusar</button></div>}</div>):<p>Nenhuma inscrição.</p>}</div>}
      {item.estado==='PUBLICADA'&&<section className="be-section"><h3>Convites para inscrição</h3><div className="be-fieldset"><label>Convite válido até<input type="datetime-local" value={expiraEm} onChange={e=>setExpiraEm(e.target.value)}/></label></div><div className="be-actions"><button type="button" className="be-btn primary" onClick={criarConvite} disabled={busy||!expiraEm}>Gerar convite seguro</button><button type="button" className="be-btn" onClick={listarConvites} disabled={busy}>Listar convites</button></div>{linkNovo&&<div className="be-card"><p>Link gerado. O token só é revelado nesta emissão. Copie antes de sair desta tela.</p><button type="button" className="be-btn" onClick={copiarLink}>Copiar link do convite</button></div>}{convites!==null&&<div className="be-list">{convites.map(c=><div className="be-item" key={c.id}><strong>Convite #{c.id}</strong><p>Expira em: {new Date(c.expiraEm).toLocaleString('pt-BR')} · {c.revogadoEm?'Revogado':'Ativo ou expirado'}</p>{!c.revogadoEm&&<button type="button" className="be-btn danger" disabled={busy} onClick={()=>revogarConvite(c.id)}>Revogar</button>}</div>)}</div>}</section>}
      {item.estado==='PUBLICADA'&&<div className="be-actions"><button className="be-btn primary" disabled={busy} onClick={()=>iniciar('IDA')}>Iniciar ida</button>{item.retornoEm&&<button className="be-btn" disabled={busy} onClick={()=>iniciar('VOLTA')}>Iniciar volta</button>}</div>}
      {execucoes!==null&&<div className="be-list"><h3>Execuções</h3>{execucoes.map(ex=><div key={ex.id} className="be-item"><strong>#{ex.id} · {ex.sentido} · {ex.estado}</strong>{ex.estado==='EM_ANDAMENTO'&&<button type="button" className="be-btn" disabled={busy} onClick={()=>finalizar(ex)}>Finalizar execução</button>}</div>)}</div>}
    </div>}
  </section>;
}
