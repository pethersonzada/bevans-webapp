'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {firebaseSignIn,firebaseRefresh,firebasePasswordReset} from '../lib/bevans-auth.mjs';
import {apiRequest,array,pagina,ep,diaLocal,idSeguro} from '../lib/bevans-api.mjs';
import './painel.css';

const statuses={PENDENTE:'Pendente',APROVADO:'Aprovado',REJEITADO:'Recusado',EMBARCADO:'Embarcado',AGUARDANDO:'Aguardando',DESEMBARCADO:'Desembarcado',NAO_EMBARCOU:'Não embarcou'};
const display=v=>v==null?'Não informado':statuses[v]||String(v);
const dir=v=>v==='VOLTA'?'Volta':'Ida';
const stamp=v=>v?new Date(v).toLocaleString('pt-BR'):'Data não informada';
const date=v=>/^\d{4}-\d\d-\d\d$/.test(v)?v.split('-').reverse().join('/'):v;
function Alert({error}){return error?<div role="alert" className="be-error">{error}</div>:null;}
function Empty({children='Nenhum registro encontrado.'}){return <p className="be-muted">{children}</p>;}
function Button({children,onClick,primary=false,danger=false,disabled=false}){return <button type="button" disabled={disabled} onClick={onClick} className={`be-btn ${primary?'primary':''} ${danger?'danger':''}`}>{children}</button>;}
function Panel({title,children}){return <section className="be-card"><h2>{title}</h2>{children}</section>;}
function useAsync(load, deps=[]){
 const [state,setState]=useState({data:null,error:'',loading:true});
 const [version,setVersion]=useState(0);
 useEffect(()=>{let live=true;const controller=new AbortController();setState(s=>({...s,error:'',loading:true}));Promise.resolve().then(()=>load(controller.signal)).then(data=>{if(live)setState({data,error:'',loading:false});}).catch(e=>{if(live)setState({data:null,error:e.message,loading:false});});return()=>{live=false;controller.abort();};},[...deps,version]);
 return {...state,reload:()=>setVersion(v=>v+1)};
}

export default function AuthEntry(){
 const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const sessionRef=useRef(null),profileRef=useRef(null);
 const [tab,setTab]=useState('inicio');
 const [showPassword,setShowPassword]=useState(false),[recovering,setRecovering]=useState(false),[notice,setNotice]=useState('');
 const signOut=useCallback(()=>{sessionRef.current=null;profileRef.current=null;setSession(null);setProfile(null);setError('');setTab('inicio');},[]);
 const getToken=useCallback(async()=>{
  if(!sessionRef.current)throw Error('Entre novamente.');
  try{const updated=await firebaseRefresh(sessionRef.current);if(sessionRef.current?.uid===updated.uid){sessionRef.current=updated;return updated.idToken;}throw Error('A conta mudou.');}
  catch(e){signOut();throw e;}
 },[signOut]);
 const api=useCallback(async(path,options)=>apiRequest(await getToken(),path,options),[getToken]);
 async function onSubmit(e){e.preventDefault();if(busy)return;setBusy(true);setError('');setNotice('');try{
  const signed=await firebaseSignIn(email.trim(),password);const person=await apiRequest(signed.idToken,ep.perfil(signed.uid));
  if(!person||!Number.isSafeInteger(person.id)||person.id<=0||!['MOTORISTA','PASSAGEIRO','ALUNO'].includes(person.tipo))throw Error('Esta conta não tem um perfil operacional válido no backend.');
  sessionRef.current=signed;profileRef.current=person;setSession(signed);setProfile(person);setPassword('');
 }catch(err){setError(err.message);}finally{setBusy(false);}}
 async function resetPassword(){if(busy)return;setBusy(true);setError('');setNotice('');try{await firebasePasswordReset(email);setNotice('Se este e-mail estiver cadastrado e o serviço permitir, você receberá instruções para redefinir a senha. Confira também a pasta de spam.');}catch(e){setError(e.message);}finally{setBusy(false);}}
 if(!profile||!session)return <main id="conteudo" className="be-auth-screen">
  <section className="be-auth-story" aria-label="Apresentação BeVans">
   <div className="be-story-top"><Link href="/" className="be-story-brand"><Image src="/images/bevans-logo-oficial-branco.png" alt="BeVans" width={195} height={82} className="be-official-wordmark" priority /></Link><span className="be-story-label">PLATAFORMA DE TRANSPORTE</span></div>
   <div className="be-story-main"><span className="be-eyebrow"><span className="be-status-dot"/> ÁREA EXCLUSIVA</span><h1>Seu caminho.<br/><em>Sua operação.</em><br/>Tudo conectado.</h1><p>Turmas, rotas e viagens em um só lugar. Entre para acompanhar sua rotina de transporte com informações oficiais.</p>
    <div className="be-story-features"><div><span>01</span><strong>Rotas e turmas</strong><small>Organização do seu dia</small></div><div><span>02</span><strong>Solicitações</strong><small>Pedidos em um só lugar</small></div><div><span>03</span><strong>Viagens</strong><small>Acompanhamento operacional</small></div></div>
   </div><div className="be-story-bottom"><span>BEVANS / CONEXÕES QUE MOVEM</span><span>© {new Date().getFullYear()}</span></div>
  </section>
  <section className="be-auth-area"><div className="be-auth-top"><Link href="/" className="be-auth-back">← Voltar ao site</Link><span>Acesso seguro</span></div>
   <div className="be-auth-content"><div className="be-mobile-wordmark"><Image src="/images/bevans-simbolo-oficial.png" alt="" width={44} height={42}/><span>BeVans</span></div><span className="be-overline">ACESSAR MINHA CONTA</span><h2>Bem-vindo de volta.</h2><p className="be-auth-description">Use o mesmo e-mail e senha do aplicativo BeVans.</p>
    <Alert error={error}/>{notice&&<p role="status" aria-live="polite" className="be-auth-feedback">{notice}</p>}
    <form className="be-form be-login-form" onSubmit={onSubmit}>
     <label htmlFor="bev-email">E-mail<input id="bev-email" type="email" placeholder="seuemail@exemplo.com" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></label>
     <label htmlFor="bev-password">Senha</label><div className="be-password-wrap"><input id="bev-password" type={showPassword?'text':'password'} placeholder="Digite sua senha" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'} aria-pressed={showPassword} disabled={busy}>{showPassword?'Ocultar':'Mostrar'}</button></div>
     <div className="be-auth-support"><button type="button" className="be-link-button" disabled={busy||recovering} onClick={()=>{setRecovering(true);setError('');setNotice('');}}>Esqueci minha senha</button></div>
     {recovering&&<div className="be-recovery"><p>Informe o e-mail acima para receber orientações de recuperação.</p><div className="be-actions"><Button onClick={resetPassword} disabled={busy||!email.trim()} primary>{busy?'Enviando…':'Enviar recuperação'}</Button><Button onClick={()=>setRecovering(false)} disabled={busy}>Cancelar</Button></div></div>}
     <button type="submit" className="be-btn primary be-login-submit" disabled={busy}>{busy?'Autenticando…':'Entrar na plataforma'} <span aria-hidden="true">→</span></button>
    </form><div className="be-auth-rule"/><p className="be-auth-help">Acesso exclusivo para contas existentes. O cadastro público está fechado.</p>
   </div><div className="be-auth-bottom"><span>Ambiente operacional BeVans</span><Link href="/privacidade">Privacidade e segurança</Link></div>
  </section>
 </main>;
 const driver=profile.tipo==='MOTORISTA';
 const tabs=[['inicio','Visão geral','▦'],['turmas','Minhas turmas','▤'],['rotas',driver?'Rotas públicas':'Catálogo de rotas','⌁'],['solicitacoes','Solicitações','◷'],['excursoes','Excursões','◇'],['notificacoes','Notificações','♧'],['operacao','Operações','◉']];
 const selected=tabs.find(item=>item[0]===tab);
 return <main className="be-app" id="conteudo">
  <aside className="be-sidebar" aria-label="Navegação da plataforma"><div className="be-sidebar-head"><Link href="/" className="be-sidebar-brand"><Image src="/images/bevans-simbolo-oficial.png" alt="" width={44} height={42} className="be-official-mark"/><span>BeVans<small>PLATAFORMA</small></span></Link></div>
   <div className="be-sidebar-group"><p className="be-nav-label">ESPAÇO DE TRABALHO</p><nav className="be-sidebar-nav" aria-label="Áreas do painel">{tabs.map(([key,label,symbol])=><button type="button" key={key} onClick={()=>setTab(key)} aria-current={tab===key?'page':undefined}><span aria-hidden="true" className="be-nav-icon">{symbol}</span><span>{label}</span>{key==='notificacoes'&&<span className="be-nav-indicator" aria-label="Ver notificações"/>}</button>)}</nav></div>
   <div className="be-sidebar-footer"><div className="be-account"><span className="be-avatar" aria-hidden="true">{(profile.nome||'U').trim()[0]?.toUpperCase()}</span><div><strong>{profile.nome||profile.email||'Minha conta'}</strong><small>{driver?'Motorista':'Passageiro'}</small></div></div><Button onClick={signOut}>Sair da conta</Button><Link href="/" className="be-site-link">Voltar ao site </Link></div>
  </aside>
  <div className="be-main-column"><header className="be-app-top"><div className="be-breadcrumb"><span>Área do {driver?'motorista':'passageiro'}</span><span aria-hidden="true">/</span><strong>{selected?.[1]||'Painel'}</strong></div><div className="be-app-user"><span className="be-status-dot"/> Conectado <span className="be-top-avatar" aria-hidden="true">{(profile.nome||'U').trim()[0]?.toUpperCase()}</span></div></header>
   <div className="be-mobile-tabs" role="navigation" aria-label="Navegação rápida">{tabs.map(([key,label])=><button type="button" key={key} onClick={()=>setTab(key)} aria-current={tab===key?'page':undefined}>{label}</button>)}</div>
   <div className="be-main-content"><header className="be-page-heading"><div><span className="be-overline">{driver?'CENTRAL DO MOTORISTA':'CENTRAL DO PASSAGEIRO'}</span><h1>{tab==='inicio'?`Olá, ${(profile.nome||'visitante').split(' ')[0]}.`:selected?.[1]}</h1><p>{tab==='inicio'?'Acompanhe suas atividades e escolha o próximo passo.':'Consulte os dados oficiais e gerencie as ações disponíveis para sua conta.'}</p></div><div className="be-heading-date">{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</div></header>
    {tab==='inicio'&&<Overview api={api} profile={profile} driver={driver} onGo={setTab}/>}
    {tab==='turmas'&&<Turmas api={api} profile={profile} driver={driver}/>}
    {tab==='rotas'&&<Rotas api={api} profile={profile} driver={driver}/>}
    {tab==='solicitacoes'&&<Solicitacoes api={api} profile={profile} driver={driver}/>}
    {tab==='excursoes'&&<Excursoes api={api} driver={driver}/>}
    {tab==='notificacoes'&&<Notificacoes api={api} onGo={setTab}/>}
    {tab==='operacao'&&<Operacoes api={api} profile={profile} driver={driver}/>}
   </div>
  </div>
 </main>;
}
function Overview({api,profile,driver,onGo}){
 const state=useAsync(async signal=>{
  const turmas=await api(driver?ep.turmasMotorista(profile.id):ep.turmasPassageiro(profile.id),{signal});
  const [notificacoes,naoLidas]=await Promise.all([api(ep.notificacoes,{signal}),api(ep.notificacoesNaoLidas,{signal})]);
  return {turmas:array(turmas),notificacoes:notificacoes?.content||notificacoes?.itens||[],naoLidas};
 },[profile.id,driver]);
 return <section className="be-overview">
  <div className="be-overview-stats" aria-label="Resumo da conta">
   <div className="be-stat"><span className="be-stat-icon">▤</span><span>Turmas vinculadas</span><strong>{state.loading?'…':state.data?.turmas.length??'—'}</strong><small>Dados da sua conta</small></div>
   <div className="be-stat"><span className="be-stat-icon">◷</span><span>Notificações não lidas</span><strong>{state.loading?'…':state.data?.naoLidas??'—'}</strong><small>Histórico oficial</small></div>
   <div className="be-stat"><span className="be-stat-icon">◇</span><span>Avisos recentes</span><strong>{state.loading?'…':state.data?.notificacoes.length??'—'}</strong><small>Na central de avisos</small></div>
  </div>
  {state.error&&<Alert error={state.error}/>}
  <div className="be-overview-columns"><section className="be-welcome-card"><span className="be-overline">ACESSO RÁPIDO</span><h2>O que vamos fazer hoje?</h2><p>Escolha uma área para consultar as informações da sua rotina.</p><div className="be-quick-grid">
    <button type="button" onClick={()=>onGo('solicitacoes')}><span className="be-quick-icon">◷</span><strong>Solicitações</strong><small>Vínculos e embarques</small><span className="be-quick-arrow"></span></button>
    <button type="button" onClick={()=>onGo('rotas')}><span className="be-quick-icon">⌁</span><strong>{driver?'Rotas públicas':'Explorar rotas'}</strong><small>Itinerários e horários</small><span className="be-quick-arrow"></span></button>
    <button type="button" onClick={()=>onGo('operacao')}><span className="be-quick-icon">◉</span><strong>Operações</strong><small>Viagens em andamento</small><span className="be-quick-arrow"></span></button>
    <button type="button" onClick={()=>onGo('turmas')}><span className="be-quick-icon">▤</span><strong>Minhas turmas</strong><small>Grupos e participantes</small><span className="be-quick-arrow"></span></button>
   </div></section><section className="be-activity-card"><span className="be-overline">SUA CONTA</span><h2>Visão operacional</h2><p>{state.loading?'Carregando dados oficiais…':state.error?'Não foi possível consultar o resumo. Confira sua conexão.':'Dados atualizados conforme as respostas do servidor.'}</p><div className="be-activity-detail"><span className="be-activity-indicator"/> <span>{driver?'Perfil de motorista':'Perfil de passageiro'} ativo</span></div><div className="be-activity-actions"><Button onClick={state.reload}>Atualizar informações ↻</Button><Button onClick={()=>onGo('notificacoes')}>Ver notificações</Button></div></section></div>
 </section>;
}
function Turmas({api,profile,driver}){
 const data=useAsync(s=>api(driver?ep.turmasMotorista(profile.id):ep.turmasPassageiro(profile.id),{signal:s}).then(array),[driver,profile.id]);
 const [creating,setCreating]=useState(false),[nome,setNome]=useState(''),[turno,setTurno]=useState(''),[capacidade,setCapacidade]=useState(10),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false);
 async function create(e){e.preventDefault();if(busy)return;setBusy(true);setFeedback('');try{if(!nome.trim()||!turno.trim()||!Number.isSafeInteger(Number(capacidade))||Number(capacidade)<=0)throw Error('Informe nome, turno e capacidade válida.');const r=await api('/turmas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:nome.trim(),turno:turno.trim(),motorista:{id:idSeguro(profile.id)},capacidade:Number(capacidade)})});if(!r?.id)throw Error('Criação não confirmada. Confira a lista antes de repetir.');setCreating(false);setNome('');setTurno('');data.reload();}catch(error){setFeedback(error.message)}finally{setBusy(false);}}
 return <section className="be-section"><div className="be-row"><h2>Turmas {driver?'gerenciadas':'vinculadas'}</h2><div className="be-actions"><Button onClick={data.reload}>Atualizar</Button>{driver&&<Button primary onClick={()=>setCreating(v=>!v)}>Nova turma</Button>}</div></div><Alert error={data.error||feedback}/>
 {creating&&driver&&<Panel title="Cadastrar turma"><p className="be-muted">Cadastro básico. Planejamento de pontos privados e presença seguem no aplicativo Android até a validação do módulo web.</p><form className="be-form" onSubmit={create}><label>Nome<input required value={nome} onChange={e=>setNome(e.target.value)}/></label><label>Turno<input required value={turno} onChange={e=>setTurno(e.target.value)}/></label><label>Assentos<input type="number" min="1" required value={capacidade} onChange={e=>setCapacidade(e.target.value)}/></label><button className="be-btn primary" disabled={busy}>Criar turma</button></form></Panel>}
 {data.loading?<Empty>Carregando…</Empty>:!data.data?.length?<Empty>Nenhuma turma disponível para esta conta.</Empty>:<div className="be-grid">{data.data.map(t=><Panel key={t.id} title={t.nome||`Turma ${t.id}`}><p>{t.turno}</p><p className="be-muted">Turma #{t.id} · Capacidade: {t.capacidade??'não configurada'}</p><p className="be-muted">Origem: {t.origemNome||'Não cadastrada'}</p><p className="be-muted">Destino: {t.destinoNome||'Não cadastrado'}</p>{driver&&t.codigoConvite&&<p>Código de convite: <strong>{t.codigoConvite}</strong></p>}</Panel>)}</div>}</section>;
}
function Rotas({api,driver}){
 const [filters,setFilters]=useState({cidade:'',destino:''}),[selected,setSelected]=useState(null),[route,setRoute]=useState(null),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false);
 const list=useAsync(s=>api(driver?ep.rotas:ep.catalogo(filters),{signal:s}).then(r=>driver?array(r):pagina(r)),[driver,filters.cidade,filters.destino]);
 const [details,setDetails]=useState(null);
 async function open(id){setFeedback('');setRoute(null);setSelected(id);try{const r=await api(ep.rota(id));if(r?.id!==id)throw Error('O servidor retornou outra rota.');setRoute(r);}catch(e){setFeedback(e.message);}}
 async function write(task){if(busy)return;setBusy(true);setFeedback('');try{await task();list.reload();if(selected)await open(selected);}catch(e){setFeedback(e.message);}finally{setBusy(false);}}
 return <section className="be-section"><div className="be-row"><h2>{driver?'Gerenciamento de rotas públicas':'Catálogo de rotas públicas'}</h2><Button onClick={list.reload}>Atualizar</Button></div><Alert error={list.error||feedback}/>
 {!driver&&<div className="be-fieldset"><label>Cidade<input value={filters.cidade} onChange={e=>setFilters(p=>({...p,cidade:e.target.value}))}/></label><label>Destino<input value={filters.destino} onChange={e=>setFilters(p=>({...p,destino:e.target.value}))}/></label></div>}
 {list.loading?<Empty>Consultando rotas…</Empty>:!list.data?.length?<Empty>Nenhuma rota disponível.</Empty>:<div className="be-grid">{list.data.map(r=><Panel key={r.id} title={r.nome}><p>{r.cidade} {r.modo?`· ${r.modo}`:''}</p><p className="be-muted">{r.destinoNome||r.destino||''}</p><p className="be-muted">{driver?(r.publicada?'Publicada':'Não publicada'):`Vagas: ${r.vagas?.disponiveis??'indisponível'}`}</p><div className="be-actions"><Button onClick={()=>open(r.id)}>Detalhes oficiais</Button>{!driver&&<Button disabled={busy} onClick={()=>write(async()=>{const response=await api(ep.favoritas(r.id),{method:r.favorita?'DELETE':'PUT'});return response;})}>{r.favorita?'Remover favorito':'Favoritar'}</Button>}</div></Panel>)}</div>}
 {selected&&!route&&<Empty>Carregando a rota selecionada…</Empty>}
 {route&&<Panel title={`Rota: ${route.nome}`}><p>{route.origemNome} → {route.destinoNome}</p><p>{route.modo} · {route.categoria} · IDA {route.horarioIda||'não configurada'} · VOLTA {route.horarioVolta||'não configurada'}</p><p className="be-muted">Dias: {route.dias?.join(', ')}</p><h3>Paradas</h3>{route.paradas?.length?<div className="be-list">{route.paradas.map((p,i)=><div key={p.id||i} className="be-item">{i+1}. {p.nome}</div>)}</div>:<Empty>Sem paradas cadastradas.</Empty>}
 {driver?<><p className="be-alert">A publicação altera o catálogo. Confira os dados e confirme conscientemente.</p><div className="be-actions"><Button disabled={busy} onClick={()=>write(async()=>{if(!window.confirm(`${route.publicada?'Despublicar':'Publicar'} a rota ${route.nome}?`))return;const r=await api(`/rotas-publicas/${idSeguro(route.id)}/publicacao`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:!route.publicada})});if(!r||r.publicada===route.publicada)throw Error('O servidor não confirmou a publicação.');})}>{route.publicada?'Despublicar rota':'Publicar rota'}</Button></div></>:<PassengerRequest api={api} route={route} busy={busy} write={write}/>}
 </Panel>}</section>;
}
function PassengerRequest({api,route,busy,write}){
 const [data,setData]=useState(diaLocal),[sentido,setSentido]=useState('IDA'),[parada,setParada]=useState(''),[pending,setPending]=useState(false);
 return <section><h3>Solicitações para esta rota</h3><div className="be-actions"><Button disabled={busy} onClick={()=>write(async()=>{if(!window.confirm(`Solicitar vínculo com ${route.nome}?`))return;const r=await api(ep.solicitacaoVaga(route.id),{method:'POST'});if(!r?.id)throw Error('Vínculo não confirmado. Consulte as solicitações antes de repetir.');})}>Solicitar vínculo</Button></div><div className="be-fieldset"><label>Data<input type="date" min={diaLocal()} value={data} onChange={e=>setData(e.target.value)}/></label><label>Sentido<select value={sentido} onChange={e=>setSentido(e.target.value)}><option>IDA</option><option>VOLTA</option></select></label><label>Parada<select value={parada} onChange={e=>setParada(e.target.value)}><option value="">Escolha uma parada</option>{route.paradas.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}</select></label></div><Button primary disabled={busy||pending||!parada||!data} onClick={()=>write(async()=>{if(!window.confirm(`Solicitar embarque em ${date(data)}, ${dir(sentido)}, na parada selecionada?`))return;setPending(true);try{const r=await api(ep.solicitarEmbarque(route.id),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dataOperacao:data,sentido,paradaId:idSeguro(parada)})});if(!r?.id)throw Error('Pedido não confirmado. Consulte seu histórico.');}finally{setPending(false);}})}>Solicitar embarque</Button><p className="be-footnote">O servidor valida vínculo, data e disponibilidade. Pontos flexíveis no mapa ainda dependem do seletor web.</p></section>;
}
function Solicitacoes({api,profile,driver}){
 const state=useAsync(async signal=>{
  if(!driver)return {pessoais:array(await api(ep.embarques,{signal})),turmas:array(await api(ep.turmasPassageiro(profile.id),{signal}))};
  const turmas=array(await api(ep.turmasMotorista(profile.id),{signal}));
  const [rotas,pedidos]=await Promise.all([api(ep.rotas,{signal}).then(array),Promise.all(turmas.map(async turma=>array(await api(ep.turmasPendentes(turma.id),{signal})).map(p=>({...p,turma}))))]);
  return {turmas,rotas,vinculos:pedidos.flat()};
 },[driver,profile.id]);
 const [rotaId,setRotaId]=useState(''),[data,setData]=useState(diaLocal),[sentido,setSentido]=useState('IDA');
 const pedidos=useAsync(s=>driver&&rotaId?api(ep.embarquesRota(rotaId,data,sentido),{signal:s}).then(array):Promise.resolve([]),[driver,rotaId,data,sentido]);
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function approve(path,method,body,label){if(busy||!window.confirm(`Confirmar: ${label}?`))return;setBusy(true);setError('');try{await api(path,{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});state.reload();pedidos.reload();}catch(e){setError(e.message)}finally{setBusy(false);}}
 return <section className="be-section"><div className="be-row"><h2>Solicitações oficiais</h2><Button onClick={()=>{state.reload();pedidos.reload();}}>Atualizar</Button></div><Alert error={state.error||pedidos.error||error}/>{state.loading?<Empty>Carregando solicitações…</Empty>:driver?<><Panel title="Vínculos pendentes">{!state.data?.vinculos?.length?<Empty>Nenhum vínculo pendente.</Empty>:<div className="be-list">{state.data.vinculos.map(p=><div key={p.id} className="be-item"><strong>{p.aluno?.nome||'Passageiro'}</strong><p>Turma: {p.turma.nome}</p><div className="be-actions"><Button disabled={busy} primary onClick={()=>approve(ep.analisarVinculo(p.id,'APROVADO'),'PUT',null,'aprovar vínculo')}>Aprovar</Button><Button disabled={busy} onClick={()=>approve(ep.analisarVinculo(p.id,'REJEITADO'),'PUT',null,'recusar vínculo')}>Recusar</Button></div></div>)}</div>}</Panel><section className="be-section"><Panel title="Pedidos de embarque"><div className="be-fieldset"><label>Rota<select value={rotaId} onChange={e=>setRotaId(e.target.value)}><option value="">Selecione uma rota</option>{state.data?.rotas?.map(r=><option key={r.id} value={r.id}>{r.nome}</option>)}</select></label><label>Data<input type="date" value={data} onChange={e=>setData(e.target.value)}/></label><label>Sentido<select value={sentido} onChange={e=>setSentido(e.target.value)}><option>IDA</option><option>VOLTA</option></select></label></div>{pedidos.loading&&rotaId?<Empty>Consultando…</Empty>:!pedidos.data?.length?<Empty>Sem pedidos nessa data e sentido.</Empty>:<div className="be-list">{pedidos.data.map(p=><div key={p.id} className="be-item"><strong>{p.nomePonto||`Parada ${p.paradaId}`}</strong><p>{date(p.dataOperacao)} · {dir(p.sentido)} · {display(p.status)}</p>{p.status==='PENDENTE'&&<div className="be-actions"><Button disabled={busy} primary onClick={()=>approve(ep.analisarEmbarque(p.id),'PUT',{status:'APROVADO'},'aprovar embarque')}>Aprovar</Button><Button disabled={busy} onClick={()=>approve(ep.analisarEmbarque(p.id),'PUT',{status:'REJEITADO'},'recusar embarque')}>Recusar</Button></div>}</div>)}</div>}</Panel></section></>:<div className="be-grid"><Panel title="Vínculos aprovados">{state.data?.turmas?.length?state.data.turmas.map(t=><div className="be-item" key={t.id}>{t.nome}</div>):<Empty>Nenhuma turma vinculada.</Empty>}</Panel><Panel title="Meus pedidos de embarque">{state.data?.pessoais?.length?state.data.pessoais.map(p=><div className="be-item" key={p.id}><strong>{display(p.status)}</strong><p>{date(p.dataOperacao)} · {dir(p.sentido)} · {p.nomePonto||`Parada ${p.paradaId}`}</p></div>):<Empty>Nenhum pedido registrado.</Empty>}</Panel></div>}</section>;
}
function Excursoes({api,driver}){
 const state=useAsync(s=>driver?api(ep.excursoes,{signal:s}).then(pagina):Promise.resolve([]),[driver]);
 const [id,setId]=useState(null),[exec,setExec]=useState(null),[error,setError]=useState('');
 async function load(id){setId(id);setExec(null);setError('');try{const x=array(await api(ep.execucoes(id)));setExec(x);}catch(e){setError(e.message);}}
 if(!driver)return <Panel title="Excursões"><p>Inscrições de passageiros são feitas com convites individuais. O webapp não acessa recursos privados do motorista em nome do passageiro.</p><Empty>O fluxo de inscrição com convite será integrado separadamente.</Empty></Panel>;
 return <section className="be-section"><div className="be-row"><h2>Excursões</h2><Button onClick={state.reload}>Atualizar</Button></div><Alert error={state.error||error}/>{state.loading?<Empty>Carregando…</Empty>:!state.data?.length?<Empty>Nenhuma excursão encontrada.</Empty>:<div className="be-grid">{state.data.map(e=><Panel key={e.id} title={e.titulo}><p>{e.origemNome||'Origem'} → {e.destinoNome}</p><p>Partida: {stamp(e.partidaEm)}</p><p>Volta: {stamp(e.retornoEm)}</p><p className="be-muted">{display(e.estado)} · {e.capacidade} assentos</p><Button onClick={()=>load(e.id)}>Consultar execuções</Button></Panel>)}</div>}
 {id&&<section className="be-section"><Panel title={`Execuções da excursão #${id}`}><Button onClick={()=>load(id)}>Atualizar execuções</Button>{!exec?<Empty>Carregando execuções…</Empty>:!exec.length?<Empty>Não existe execução registrada. O início exige prévia, versão salva e validação dos participantes no aplicativo.</Empty>:<div className="be-list">{exec.map(v=><div className="be-item" key={v.id}><strong>Execução #{v.id} · {dir(v.sentido)} · {display(v.estado)}</strong><p>{v.pontos?.length||0} pontos no roteiro oficial</p></div>)}</div>}</Panel></section>}</section>;
}
function Notificacoes({api,onGo}){
 const state=useAsync(s=>api(ep.notificacoes,{signal:s}).then(v=>v?.content?array(v.content):pagina(v)),[]);
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function read(id){if(busy)return;setBusy(true);setError('');try{await api(ep.notificacaoLida(id),{method:'PUT'});state.reload();}catch(e){setError(e.message)}finally{setBusy(false);}}
 return <section className="be-section"><div className="be-row"><h2>Central de notificações</h2><Button onClick={state.reload}>Atualizar</Button></div><Alert error={state.error||error}/><Panel title="Histórico recebido pelo servidor">{state.loading?<Empty>Consultando…</Empty>:!state.data?.length?<><Empty>Nenhuma notificação registrada para esta conta.</Empty><Button primary onClick={()=>onGo('solicitacoes')}>Ver solicitações diretamente</Button></>:<div className="be-list">{state.data.map(n=><div key={n.id} className="be-item"><div className="be-row"><strong>{n.titulo}</strong><span className="be-chip">{n.contextoTipo}</span></div><p>{n.mensagem}</p><p className="be-muted">{stamp(n.criadaEm)} · {n.lidaEm?'Lida':'Não lida'}</p><div className="be-actions"><Button onClick={()=>onGo('solicitacoes')}>Consultar solicitações</Button>{!n.lidaEm&&<Button disabled={busy} onClick={()=>read(n.id)}>Marcar como lida</Button>}</div></div>)}</div>}</Panel><p className="be-footnote">Avisos dependem do pipeline de eventos do backend. O navegador ainda não registra tokens FCM para push.</p></section>;
}
function Operacoes({api,profile,driver}){
 const turmas=useAsync(s=>api(driver?ep.turmasMotorista(profile.id):ep.turmasPassageiro(profile.id),{signal:s}).then(array),[driver,profile.id]);
 const [turma,setTurma]=useState(''),[viagem,setViagem]=useState(null),[painel,setPainel]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function refresh(){if(!turma)return;setError('');setPainel(null);try{const r=await api(ep.estadoTurma(turma));if(!r||!['ATIVA','INATIVA'].includes(r.status))throw Error('Estado da viagem inválido.');setViagem(r);if(r.status==='ATIVA'&&r.viagemId){const p=await api(ep.operacao('VIAGEM',r.viagemId,driver));if(driver&&(!Array.isArray(p?.registros)||p.referenciaId!==r.viagemId))throw Error('Operação divergente.');setPainel(p);}}catch(e){setError(e.message);}}
 async function change(registro,novo){if(busy||!window.confirm(`Confirmar ${display(novo).toLowerCase()} para ${registro.nome||'o passageiro'}?`))return;setBusy(true);setError('');try{
  const path=ep.estadoOperacional('VIAGEM',viagem.viagemId,registro.id,driver);
  const r=await api(path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({estado:novo,versao:registro.versao,correcao:false})});
  if(r?.estado!==novo||r?.id!==registro.id)throw Error('A operação não foi confirmada.');await refresh();
 }catch(e){setError(e.message);await refresh();}finally{setBusy(false);}}
 return <section className="be-section"><h2>Controle operacional</h2><p className="be-muted">Exibe o estado oficial da viagem privada ou pública associada à turma. Nenhum início é inferido localmente.</p><Alert error={turmas.error||error}/><div className="be-fieldset"><label>Turma<select value={turma} onChange={e=>{setTurma(e.target.value);setViagem(null);setPainel(null);}}><option value="">Selecione uma turma</option>{turmas.data?.map(t=><option key={t.id} value={t.id}>{t.nome||`Turma ${t.id}`}</option>)}</select></label><Button disabled={!turma||busy} primary onClick={refresh}>Consultar estado oficial</Button></div>
 {viagem&&<Panel title="Estado atual"><p><strong>{display(viagem.status)}</strong> {viagem.sentido&&`· ${dir(viagem.sentido)}`} {viagem.modalidade&&`· ${viagem.modalidade}`}</p>{viagem.status==='INATIVA'?<Empty>Nenhuma viagem ativa nesta turma.</Empty>:!painel?<Empty>Aguardando painel operacional…</Empty>:driver?<><div className="be-kpis"><div className="be-kpi"><b>{painel.contadores?.esperados??'?'}</b>Esperados</div><div className="be-kpi"><b>{painel.contadores?.naVan??'?'}</b>Na van</div><div className="be-kpi"><b>{painel.contadores?.aguardando??'?'}</b>Aguardando</div></div><div className="be-list">{painel.registros.map(p=><div className="be-item" key={p.id}><strong>{p.nome}</strong><p>{display(p.estado)}</p><div className="be-actions">{p.estado==='AGUARDANDO'&&<><Button disabled={busy} primary onClick={()=>change(p,'EMBARCADO')}>Confirmar embarque</Button><Button disabled={busy} onClick={()=>change(p,'NAO_EMBARCOU')}>Registrar ausência</Button></>}{p.estado==='EMBARCADO'&&<Button disabled={busy} onClick={()=>change(p,'DESEMBARCADO')}>Confirmar desembarque</Button>}</div></div>)}</div></>:<><p><strong>Meu estado:</strong> {display(painel.estado)}</p>{painel.estado==='AGUARDANDO'&&<Button disabled={busy} primary onClick={()=>change(painel,'EMBARCADO')}>Confirmar que embarquei</Button>}</>}</Panel>}
 <p className="be-footnote">Iniciar/finalizar viagens e navegação GPS permanecem restritos ao Android nesta entrega. Não foram criadas ações sem os bloqueios de snapshot e roteiro.</p></section>;
}
