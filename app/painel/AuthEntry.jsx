'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {filtrosCatalogoIniciais,normalizarFiltrosCatalogo,lerPaginaCatalogo} from '../lib/catalogo-rotas.mjs';
import Link from 'next/link';
import Image from 'next/image';
import {firebaseSignIn,firebasePasswordReset,FirebaseSessionExpiredError,criarCoordenadorSessao} from '../lib/bevans-auth.mjs';
import {apiRequest,ApiError,array,pagina,ep,diaLocal,idSeguro} from '../lib/bevans-api.mjs';
import './painel.css';
import ViagensWeb from './ViagensWeb';
import EnderecosWeb from './EnderecosWeb';
import GestaoExcursaoWeb from './GestaoExcursaoWeb';
import RotasEditorWeb from './RotasEditorWeb';
import ColetaPrivadaWeb from './ColetaPrivadaWeb';
import ConfiguracoesWeb from './ConfiguracoesWeb';
import OperacoesWeb from './OperacoesWeb';
import EmbarquePublicoWeb from './EmbarquePublicoWeb';
import PlanejamentoEmbarquesWeb from './PlanejamentoEmbarquesWeb';
import {validarCancelamentoEmbarque,mensagemErroEmbarque} from '../lib/embarque-web.mjs';

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
 const latestLoad=useRef(load);
 const dependencyKey=JSON.stringify(deps);
 useEffect(()=>{latestLoad.current=load;});
 useEffect(()=>{
  let live=true;
  const controller=new AbortController();
  Promise.resolve().then(()=>{
   if(!live)return;
   setState(s=>({...s,error:'',loading:true}));
   return latestLoad.current(controller.signal);
  }).then(data=>{
   if(live)setState({data,error:'',loading:false});
  }).catch(error=>{
   if(live)setState({data:null,error:error instanceof Error?error.message:String(error),loading:false});
  });
  return()=>{live=false;controller.abort();};
 },[dependencyKey,version]);
 return {...state,reload:()=>setVersion(v=>v+1)};
}

export default function AuthEntry(){
 const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const sessionRef=useRef(null),profileRef=useRef(null);
 const [tokenCoordinator]=useState(()=>criarCoordenadorSessao());
 const [tab,setTab]=useState('inicio');
 const [showPassword,setShowPassword]=useState(false),[recovering,setRecovering]=useState(false),[notice,setNotice]=useState('');
 const signOut=useCallback(()=>{
  tokenCoordinator.clear();sessionRef.current=null;profileRef.current=null;
  setSession(null);setProfile(null);setEmail('');setPassword('');setError('');setNotice('');setTab('inicio');
 },[tokenCoordinator]);
 const getToken=useCallback(async()=>{
  try{
   const token=await tokenCoordinator.token();
   const current=tokenCoordinator.current();
   if(!current||!sessionRef.current||sessionRef.current.uid!==current.uid)
    throw Error('A conta mudou. Entre novamente.');
   if(current!==sessionRef.current){sessionRef.current=current;setSession(current);}
   return token;
  }catch(e){
   // Apenas refresh realmente revogado/inválido encerra a sessão.
   // Rede indisponível, HTTP 429 e Firebase 5xx preservam a identidade local.
   if(e instanceof FirebaseSessionExpiredError)signOut();
   throw e;
  }
 },[signOut,tokenCoordinator]);
 const api=useCallback(async(path,options)=>{
  const generation=tokenCoordinator.version();
  let sentToken=null;
  try{
   sentToken=await getToken();
   return await apiRequest(sentToken,path,options);
  }catch(e){
   // Uma resposta antiga 401 não pode encerrar uma sessão que já renovou o token.
   if(e instanceof ApiError&&e.status===401&&tokenCoordinator.version()===generation&&
      sentToken===tokenCoordinator.current()?.idToken)signOut();
   throw e;
  }
 },[getToken,signOut,tokenCoordinator]);
 const isOwnSession=useCallback((uid,id)=>sessionRef.current?.uid===uid&&profileRef.current?.id===id,[]);
 async function onSubmit(e){e.preventDefault();if(busy)return;setBusy(true);setError('');setNotice('');try{
  const signed=await firebaseSignIn(email.trim(),password);const person=await apiRequest(signed.idToken,ep.perfil(signed.uid));
  if(!person||!Number.isSafeInteger(person.id)||person.id<=0||!['MOTORISTA','PASSAGEIRO','ALUNO'].includes(person.tipo))throw Error('Esta conta não tem um perfil operacional válido no backend.');
  tokenCoordinator.set(signed);sessionRef.current=signed;profileRef.current=person;setSession(signed);setProfile(person);setPassword('');
 }catch(err){setError(err.message);}finally{setBusy(false);}}
 async function resetPassword(){if(busy)return;setBusy(true);setError('');setNotice('');try{await firebasePasswordReset(email);setNotice('Se este e-mail estiver cadastrado e o serviço permitir, você receberá instruções para redefinir a senha. Confira também a pasta de spam.');}catch(e){setError(e.message);}finally{setBusy(false);}}
 if(!profile||!session)return <main id="conteudo" className="be-auth-screen">
  <section className="be-auth-story" aria-label="BeVans">
   <Link href="/" className="be-story-brand" aria-label="BeVans, página inicial"><Image src="/images/bevans-logo-oficial-branco.png" alt="BeVans" width={180} height={75} priority className="be-official-wordmark" /></Link>
   <div className="be-story-main"><p className="be-story-kicker">BEVANS</p><h1>O transporte do dia a dia, em um só lugar.</h1><p>Turmas, rotas e viagens com as informações que você precisa.</p>

   </div>
   <span className="be-story-bottom">BeVans · Plataforma de transporte</span>
  </section>
  <section className="be-auth-area">
   <div className="be-auth-top"><Link href="/" className="be-auth-back">← Voltar para o site</Link></div>
   <div className="be-auth-content">
    <div className="be-mobile-wordmark"><Image src="/images/vetor-com-nome-tema-claro.png" alt="BeVans" width={164} height={55} className="be-brand-light"/><Image src="/images/bevans-logo-oficial-branco.png" alt="" width={164} height={55} className="be-brand-dark"/></div>
    <h2>Acessar minha conta</h2><p className="be-auth-description">Entre com seu e-mail e senha do BeVans.</p>
    <Alert error={error}/>{notice&&<p role="status" aria-live="polite" className="be-auth-feedback">{notice}</p>}
    <form className="be-form be-login-form" onSubmit={onSubmit}>
     <label htmlFor="bev-email">E-mail<input id="bev-email" type="email" placeholder="nome@exemplo.com" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></label>
     <label htmlFor="bev-password">Senha</label><div className="be-password-wrap"><input id="bev-password" type={showPassword?'text':'password'} placeholder="Digite sua senha" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'} aria-pressed={showPassword} disabled={busy}>{showPassword?'Ocultar':'Mostrar'}</button></div>
     <div className="be-auth-support"><button type="button" className="be-link-button" disabled={busy||recovering} onClick={()=>{setRecovering(true);setError('');setNotice('');}}>Esqueci minha senha</button></div>
     {recovering&&<div className="be-recovery"><p>Enviaremos instruções para o e-mail informado acima, se ele estiver cadastrado.</p><div className="be-actions"><Button onClick={resetPassword} disabled={busy||!email.trim()} primary>{busy?'Enviando…':'Enviar instruções'}</Button><Button onClick={()=>setRecovering(false)} disabled={busy}>Cancelar</Button></div></div>}
     <button type="submit" className="be-btn primary be-login-submit" disabled={busy}>{busy?'Verificando acesso…':'Entrar'}</button>
    </form><p className="be-auth-help"><Link href="/contato">Precisa de ajuda para acessar?</Link></p>
   </div><div className="be-auth-bottom"><Link href="/privacidade">Política de privacidade</Link><span>© {new Date().getFullYear()} BeVans</span></div>
  </section>
 </main>;
 const driver=profile.tipo==='MOTORISTA';
 const tabs=[['inicio','Início'],['turmas','Turmas'],['rotas',driver?'Rotas públicas':'Explorar rotas'],['solicitacoes','Solicitações'],['excursoes','Excursões'],['notificacoes','Notificações'],['operacao','Operações'],['viagens','Mapa e viagens'],['enderecos','Endereços e pontos'],['coleta','Coleta privada'],['configuracoes','Configurações'],...(driver?[['gestao-excursoes','Gestão de excursões'],['editor-rotas','Editor de rotas']]:[])];
 const selected=tabs.find(item=>item[0]===tab);
 const firstName=(profile.nome||'').trim().split(/\s+/)[0]||'Usuário';
 return <main className="be-app" id="conteudo">
  <aside className="be-sidebar" aria-label="Navegação da plataforma">
   <Link href="/" className="be-sidebar-brand" aria-label="BeVans, voltar ao site"><Image src="/images/vetor-com-nome-tema-claro.png" alt="BeVans" width={154} height={56} className="be-official-mark be-brand-light"/><Image src="/images/bevans-logo-oficial-branco.png" alt="" width={154} height={56} className="be-official-mark be-brand-dark"/></Link>
   <div className="be-sidebar-group"><p className="be-nav-label">{driver?'Painel do motorista':'Painel do passageiro'}</p><nav className="be-sidebar-nav" aria-label="Áreas do painel">{tabs.map(([key,label])=><button type="button" key={key} onClick={()=>setTab(key)} aria-current={tab===key?'page':undefined}>{label}</button>)}</nav></div>
   <div className="be-sidebar-footer"><div className="be-account"><span className="be-avatar" aria-hidden="true">{firstName[0].toUpperCase()}</span><div><strong>{profile.nome||'Minha conta'}</strong><small>{driver?'Motorista':'Passageiro'}</small></div></div><button type="button" className="be-signout" onClick={signOut}>Sair da conta</button><Link href="/" className="be-site-link">Voltar ao site</Link></div>
  </aside>
  <div className="be-main-column">
   <header className="be-app-top"><div className="be-app-top-left"><Image src="/images/bevans-simbolo-oficial.png" alt="" width={30} height={30} className="be-top-mark be-brand-light"/><Image src="/images/vetor-tema-escuro.png" alt="" width={30} height={30} className="be-top-mark be-brand-dark"/><span>{driver?'Área do motorista':'Área do passageiro'}</span></div><div className="be-app-user"><span className="be-user-name">{profile.nome||'Minha conta'}</span><span className="be-top-avatar" aria-hidden="true">{firstName[0].toUpperCase()}</span><button type="button" className="be-mobile-signout" onClick={signOut}>Sair</button></div></header>
   <nav className="be-mobile-tabs" aria-label="Navegação do painel">{tabs.map(([key,label])=><button type="button" key={key} onClick={()=>setTab(key)} aria-current={tab===key?'page':undefined}>{label}</button>)}</nav>
   <div className="be-main-content"><header className="be-page-heading"><div><p className="be-page-location">{driver?'Motorista':'Passageiro'} / {selected?.[1]||'Início'}</p><h1>{tab==='inicio'?`Olá, ${firstName}.`:selected?.[1]}</h1><p>{tab==='inicio'?(driver?'Gerencie suas turmas, solicitações e viagens a partir deste painel.':'Acompanhe seus vínculos, pedidos e informações de viagem em um só lugar.'):(driver?'Consulte e gerencie as informações da sua operação.':'Consulte suas informações e solicitações com segurança.')}</p></div>{tab==='inicio'&&<div className="be-heading-date">{new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</div>}</header>
    {tab==='inicio'&&<Overview api={api} profile={profile} driver={driver} onGo={setTab}/>}
    {tab==='turmas'&&<Turmas api={api} profile={profile} driver={driver}/>}
    {tab==='rotas'&&<Rotas api={api} profile={profile} driver={driver}/>}
    {tab==='solicitacoes'&&<Solicitacoes api={api} profile={profile} driver={driver}/>}
    {tab==='excursoes'&&<Excursoes api={api} driver={driver}/>}
    {tab==='notificacoes'&&<Notificacoes api={api} onGo={setTab}/>}
    {tab==='operacao'&&<OperacoesWeb api={api} profile={profile} driver={driver}/>}
    {tab==='viagens'&&<ViagensWeb api={api} profile={profile} driver={driver}/>}
    {tab==='enderecos'&&<EnderecosWeb api={api} profile={profile} driver={driver}/>}
    {tab==='gestao-excursoes'&&driver&&<GestaoExcursaoWeb api={api}/>}
    {tab==='editor-rotas'&&driver&&<RotasEditorWeb api={api} profile={profile}/>}
    {tab==='coleta'&&<ColetaPrivadaWeb api={api} profile={profile} driver={driver}/>}
    {tab==='configuracoes'&&<ConfiguracoesWeb api={api} profile={profile} driver={driver} session={session}
     isCurrent={()=>isOwnSession(session.uid,profile.id)}
     onSessionRotated={(signed,own)=>{if(!isOwnSession(session.uid,profile.id)||signed.uid!==session.uid||own.id!==profile.id)return;tokenCoordinator.set(signed);sessionRef.current=signed;profileRef.current=own;setSession(signed);setProfile(own);setEmail(own.email);}}
     onDeletionPending={()=>{if(!isOwnSession(session.uid,profile.id))return;signOut();setPassword('');setEmail('');setNotice('Solicitação de exclusão recebida pelo servidor (HTTP 202). Sua sessão local foi encerrada. A exclusão no Firebase continua pendente de processamento autorizado.');}}
    />}
   </div>
  </div>
 </main>;
}
function Overview({api,profile,driver,onGo}){
 const state=useAsync(async signal=>{
  const [turmas,notificacoes,naoLidas]=await Promise.allSettled([
   api(driver?ep.turmasMotorista(profile.id):ep.turmasPassageiro(profile.id),{signal}),
   api(ep.notificacoes,{signal}),api(ep.notificacoesNaoLidas,{signal})
  ]);
  return {
   turmas:turmas.status==='fulfilled'?array(turmas.value):null,
   turmasError:turmas.status==='rejected'?turmas.reason.message:'',
   notices:notificacoes.status==='fulfilled'?(notificacoes.value?.content||notificacoes.value?.itens||[]):null,
   unread:naoLidas.status==='fulfilled'?naoLidas.value:null,
  };
 },[profile.id,driver]);
 const latest=state.data?.turmas?.slice(0,4);
 return <div className="be-overview">
   <div className="be-overview-primary">
    <section className="be-overview-section"><div className="be-section-title"><div><h2>Suas turmas</h2><p>{driver?'Grupos que você administra.':'Turmas vinculadas à sua conta.'}</p></div><button type="button" className="be-text-action" onClick={()=>onGo('turmas')}>Ver todas →</button></div>
     {state.loading?<Empty>Carregando turmas…</Empty>:state.data?.turmasError?<Alert error={state.data.turmasError}/>:!latest?.length?<div className="be-empty-line"><p>Nenhuma turma encontrada.</p><button type="button" className="be-text-action" onClick={()=>onGo('turmas')}>Abrir turmas →</button></div>:<div className="be-overview-list">{latest.map(t=><div className="be-overview-row" key={t.id}><div className="be-list-monogram" aria-hidden="true">{(t.nome||'T').trim()[0].toUpperCase()}</div><div><strong>{t.nome||`Turma ${t.id}`}</strong><small>{[t.turno,t.destinoNome].filter(Boolean).join(' · ')||'Informações da turma'}</small></div><span className="be-row-id">#{t.id}</span></div>)}</div>}
    </section>
    <section className="be-overview-section be-overview-actions"><div className="be-section-title"><div><h2>{driver?'Gerenciar operação':'Sua jornada'}</h2><p>{driver?'Atalhos para as tarefas do motorista.':'Atalhos para acompanhar suas viagens.'}</p></div></div><div className="be-shortcuts">
     {(driver?[["solicitacoes","Analisar solicitações","Vínculos e pedidos de embarque"],["viagens","Mapa e viagens","Operação e acompanhamento"],["editor-rotas","Editar rotas","Configurar itinerários"],["gestao-excursoes","Gerir excursões","Organizar saídas e participantes"]]:[["rotas","Encontrar rotas","Itinerários e horários disponíveis"],["solicitacoes","Minhas solicitações","Acompanhar pedidos e aprovações"],["viagens","Acompanhar viagens","Mapa e informações autorizadas"],["notificacoes","Ver notificações","Atualizações da sua conta"]]).map(([key,title,desc])=><button key={key} type="button" onClick={()=>onGo(key)}><span><strong>{title}</strong><small>{desc}</small></span><span aria-hidden="true">→</span></button>)}
    </div></section>
   </div>
   <aside className="be-overview-aside"><div className="be-section-title"><div><h2>Notificações</h2><p>Atualizações da sua conta</p></div></div>
    {state.loading?<Empty>Consultando…</Empty>:state.data?.notices===null?<p className="be-muted">Não foi possível consultar o histórico agora.</p>:<><div className="be-notice-total"><strong>{state.data?.unread??'—'}</strong><span>não lidas</span></div>{state.data?.notices?.length?<div className="be-notice-preview">{state.data.notices.slice(0,3).map(n=><div key={n.id}><strong>{n.titulo}</strong><small>{n.mensagem}</small></div>)}</div>:<p className="be-muted">Nenhum aviso registrado no histórico.</p>}</>}
    <button type="button" className="be-text-action" onClick={()=>onGo('notificacoes')}>Abrir central de notificações →</button><hr className="be-divider"/><button type="button" className="be-text-action" onClick={state.reload}>Atualizar informações</button>
   </aside>
  </div>;
}
function Turmas({api,profile,driver}){
 const data=useAsync(s=>api(driver?ep.turmasMotorista(profile.id):ep.turmasPassageiro(profile.id),{signal:s}).then(array),[driver,profile.id]);
 const [codigo,setCodigo]=useState(''),[joining,setJoining]=useState(false),[creating,setCreating]=useState(false),[nome,setNome]=useState(''),[turno,setTurno]=useState(''),[capacidade,setCapacidade]=useState(10),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false);
 async function join(e){e.preventDefault();if(busy)return;const invite=codigo.trim();if(!invite||invite.length>128||/\s/.test(invite))return setFeedback('Informe um código de turma válido.');setBusy(true);setFeedback('');try{await api('/turmas/entrar/'+idSeguro(profile.id)+'?codigo='+encodeURIComponent(invite),{method:'POST'});setJoining(false);setCodigo('');setFeedback('Solicitação enviada. Aguarde a aprovação do motorista.');data.reload();}catch(error){setFeedback(error.message);}finally{setBusy(false);}}
 async function create(e){e.preventDefault();if(busy)return;setBusy(true);setFeedback('');try{if(!nome.trim()||!turno.trim()||!Number.isSafeInteger(Number(capacidade))||Number(capacidade)<=0)throw Error('Informe nome, turno e capacidade válida.');const r=await api('/turmas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:nome.trim(),turno:turno.trim(),motorista:{id:idSeguro(profile.id)},capacidade:Number(capacidade)})});if(!r?.id)throw Error('Criação não confirmada. Confira a lista antes de repetir.');setCreating(false);setNome('');setTurno('');data.reload();}catch(error){setFeedback(error.message)}finally{setBusy(false);}}
 return <section className="be-section"><div className="be-row"><h2>Turmas {driver?'gerenciadas':'vinculadas'}</h2><div className="be-actions"><Button onClick={data.reload}>Atualizar</Button>{driver?<Button primary onClick={()=>setCreating(v=>!v)}>Nova turma</Button>:<Button primary onClick={()=>setJoining(v=>!v)}>Entrar com convite</Button>}</div></div><Alert error={data.error||feedback}/>
 {joining&&!driver&&<Panel title="Solicitar entrada em turma"><p className="be-muted">Peça o código ao motorista. Sua entrada dependerá da aprovação dele.</p><form onSubmit={join} className="be-form"><label>Código da turma<input required autoComplete="off" maxLength={128} value={codigo} onChange={e=>setCodigo(e.target.value)}/></label><button className="be-btn primary" disabled={busy}>Enviar solicitação</button></form></Panel>}
 {creating&&driver&&<Panel title="Cadastrar turma"><p className="be-muted">Cadastro de turma. Para configurar paradas e pontos de coleta, use as áreas Coleta privada e Endereços e pontos.</p><form className="be-form" onSubmit={create}><label>Nome<input required value={nome} onChange={e=>setNome(e.target.value)}/></label><label>Turno<input required value={turno} onChange={e=>setTurno(e.target.value)}/></label><label>Assentos<input type="number" min="1" required value={capacidade} onChange={e=>setCapacidade(e.target.value)}/></label><button className="be-btn primary" disabled={busy}>Criar turma</button></form></Panel>}
 {data.loading?<Empty>Carregando…</Empty>:!data.data?.length?<Empty>Nenhuma turma disponível para esta conta.</Empty>:<div className="be-grid">{data.data.map(t=><Panel key={t.id} title={t.nome||`Turma ${t.id}`}><p>{t.turno}</p><p className="be-muted">Turma #{t.id} · Capacidade: {t.capacidade??'não configurada'}</p><p className="be-muted">Origem: {t.origemNome||'Não cadastrada'}</p><p className="be-muted">Destino: {t.destinoNome||'Não cadastrado'}</p>{driver&&t.codigoConvite&&<p>Código de convite: <strong>{t.codigoConvite}</strong></p>}</Panel>)}</div>}</section>;
}
function Rotas({api,driver}){
 const [filtros,setFiltros]=useState(()=>({...filtrosCatalogoIniciais}));
 const [aplicados,setAplicados]=useState(()=>({}));
 const [paginaAtual,setPaginaAtual]=useState(0);
 const [selected,setSelected]=useState(null),[route,setRoute]=useState(null),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false);
 const list=useAsync(async s=>{
  const resposta=await api(driver?ep.rotas:ep.catalogo({...aplicados,pagina:String(paginaAtual)}),{signal:s});
  const page=driver?{itens:array(resposta),total:resposta.length,pagina:0,totalPaginas:1}:lerPaginaCatalogo(resposta);
  if(!driver&&page.pagina!==paginaAtual)throw Error('A API retornou outra página de resultados.');
  return page;
 },[driver,aplicados,paginaAtual]);
 const resultados=list.data?.itens;
 const [loadingDetails,setLoadingDetails]=useState(false);
 const routeRequest=useRef(0);
 function limparDetalhes(){
  routeRequest.current++;
  setSelected(null);setRoute(null);setLoadingDetails(false);setFeedback('');
 }
 function pesquisar(e){
  e.preventDefault();
  try{
   const novos=normalizarFiltrosCatalogo(filtros);
   limparDetalhes();
   setPaginaAtual(0);
   setAplicados(novos);
   if(JSON.stringify(novos)===JSON.stringify(aplicados)&&paginaAtual===0)list.reload();
  }catch(error){setFeedback(error instanceof Error?error.message:'Filtros inválidos.');}
 }
 function limparFiltros(){
  limparDetalhes();
  setFiltros({...filtrosCatalogoIniciais});
  setAplicados({});
  setPaginaAtual(0);
  if(!Object.keys(aplicados).length&&paginaAtual===0)list.reload();
 }
 function mudarPagina(nova){
  if(!Number.isSafeInteger(nova)||nova<0||nova>=(list.data?.totalPaginas??0))return;
  limparDetalhes();
  setPaginaAtual(nova);
 }
 async function open(id){
  const request=++routeRequest.current;
  setFeedback('');setRoute(null);setSelected(id);setLoadingDetails(true);
  try{
   const r=await api(ep.rota(id));
   if(r?.id!==id)throw Error('O servidor retornou outra rota.');
   if(request===routeRequest.current)setRoute(r);
  }catch(e){if(request===routeRequest.current)setFeedback(e instanceof Error?e.message:'Não foi possível consultar a rota.');}
  finally{if(request===routeRequest.current)setLoadingDetails(false);}
 }
 async function write(task){if(busy)return;setBusy(true);setFeedback('');try{await task();list.reload();if(selected)await open(selected);}catch(e){setFeedback(e.message);}finally{setBusy(false);}}
 return <section className="be-section"><div className="be-row"><h2>{driver?'Gerenciamento de rotas públicas':'Catálogo de rotas públicas'}</h2><Button onClick={list.reload}>Atualizar</Button></div><Alert error={list.error||feedback}/>
 {!driver&&<form className="be-catalogo-form" onSubmit={pesquisar} aria-label="Filtros de rotas">
  <div className="be-catalogo-fields">
   <label>Buscar rotas<input maxLength={160} placeholder="Nome, destino, campus ou região" value={filtros.q} onChange={e=>setFiltros(p=>({...p,q:e.target.value}))}/></label>
   <label>Cidade de operação<input maxLength={160} placeholder="Ex.: Recife" value={filtros.cidade} onChange={e=>setFiltros(p=>({...p,cidade:e.target.value}))}/></label>
   <label>Destino<input maxLength={160} placeholder="Destino da rota" value={filtros.destino} onChange={e=>setFiltros(p=>({...p,destino:e.target.value}))}/></label>
   <label>Turno<input maxLength={160} placeholder="Ex.: Manhã" value={filtros.turno} onChange={e=>setFiltros(p=>({...p,turno:e.target.value}))}/></label>
   <label>Categoria<select value={filtros.categoria} onChange={e=>setFiltros(p=>({...p,categoria:e.target.value}))}>
    <option value="">Todas as categorias</option><option value="UNIVERSITARIA">Universitária</option><option value="ESCOLAR">Escolar</option><option value="OUTROS">Outras</option>
   </select></label>
   <label>Dia de operação<select value={filtros.dia} onChange={e=>setFiltros(p=>({...p,dia:e.target.value}))}>
    <option value="">Todos os dias</option>
    {[['MONDAY','Segunda-feira'],['TUESDAY','Terça-feira'],['WEDNESDAY','Quarta-feira'],['THURSDAY','Quinta-feira'],['FRIDAY','Sexta-feira'],['SATURDAY','Sábado'],['SUNDAY','Domingo']].map(([v,n])=><option key={v} value={v}>{n}</option>)}
   </select></label>
  </div>
  <div className="be-catalogo-actions">
   <label className="be-catalogo-check"><input type="checkbox" checked={filtros.somenteComVagas} onChange={e=>setFiltros(p=>({...p,somenteComVagas:e.target.checked}))}/>Somente com vagas</label>
   <label className="be-catalogo-check"><input type="checkbox" checked={filtros.somenteFavoritas} onChange={e=>setFiltros(p=>({...p,somenteFavoritas:e.target.checked}))}/>Somente favoritas</label>
   <button type="submit" className="be-btn primary" disabled={busy||list.loading}>Buscar rotas</button>
   <button type="button" className="be-btn" onClick={limparFiltros} disabled={busy}>Limpar filtros</button>
  </div>
  <p className="be-muted">Os filtros são aplicados ao selecionar “Buscar rotas”. Os resultados exibem apenas informações públicas autorizadas.</p>
 </form>}
 {list.loading?<Empty>Consultando rotas…</Empty>:!resultados?.length?<Empty>{list.error?'Não foi possível carregar as rotas. Tente atualizar.':'Nenhuma rota encontrada para os filtros informados.'}</Empty>:<div className="be-grid">{resultados.map(r=><Panel key={r.id} title={r.nome}><p>{r.cidade} {r.modo?`· ${r.modo}`:''}</p><p className="be-muted">{r.destinoNome||r.destino||''}</p><p className="be-muted">{driver?(r.publicada?'Publicada':'Não publicada'):`Vagas: ${r.vagas?.disponiveis??'indisponível'}`}</p><div className="be-actions"><Button onClick={()=>open(r.id)}>Detalhes oficiais</Button>{!driver&&<Button disabled={busy} onClick={()=>write(async()=>{const response=await api(ep.favoritas(r.id),{method:r.favorita?'DELETE':'PUT'});return response;})}>{r.favorita?'Remover favorito':'Favoritar'}</Button>}</div></Panel>)}</div>}
 {!driver&&!list.loading&&!list.error&&list.data&&<nav className="be-catalogo-pagination" aria-label="Paginação do catálogo">
   <p role="status" className="be-muted">{list.data.total} {list.data.total===1?'rota encontrada':'rotas encontradas'}{list.data.totalPaginas>0?` · Página ${list.data.pagina+1} de ${list.data.totalPaginas}`:''}</p>
   {list.data.totalPaginas>1&&<div className="be-actions">
    <button className="be-btn" type="button" disabled={busy||paginaAtual===0} onClick={()=>mudarPagina(paginaAtual-1)}>Anterior</button>
    <button className="be-btn" type="button" disabled={busy||paginaAtual>=list.data.totalPaginas-1} onClick={()=>mudarPagina(paginaAtual+1)}>Próxima</button>
   </div>}
  </nav>}
 {selected&&loadingDetails&&<p role="status" className="be-muted">Carregando a rota selecionada…</p>}
 {selected&&!loadingDetails&&!route&&!feedback&&<Empty>Não foi possível apresentar os detalhes da rota.</Empty>}
 {route&&<Panel title={`Rota: ${route.nome}`}><p>{route.origemNome} → {route.destinoNome}</p><p>{route.modo} · {route.categoria} · IDA {route.horarioIda||'não configurada'} · VOLTA {route.horarioVolta||'não configurada'}</p><p className="be-muted">Dias: {route.dias?.join(', ')}</p><h3>Paradas</h3>{route.paradas?.length?<div className="be-list">{route.paradas.map((p,i)=><div key={p.id||i} className="be-item">{i+1}. {p.nome}</div>)}</div>:<Empty>Sem paradas cadastradas.</Empty>}
 {driver?<><p className="be-alert">A publicação altera o catálogo. Confira os dados e confirme conscientemente.</p><div className="be-actions"><Button disabled={busy} onClick={()=>write(async()=>{if(!window.confirm(`${route.publicada?'Despublicar':'Publicar'} a rota ${route.nome}?`))return;const r=await api(`/rotas-publicas/${idSeguro(route.id)}/publicacao`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:!route.publicada})});if(!r||r.publicada===route.publicada)throw Error('O servidor não confirmou a publicação.');})}>{route.publicada?'Despublicar rota':'Publicar rota'}</Button></div></>:<EmbarquePublicoWeb key={route.id} api={api} rota={route} onChanged={list.reload}/>}
 </Panel>}</section>;
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
 async function approve(path,method,body,label,verificar){if(busy||!window.confirm(`Confirmar: ${label}?`))return;setBusy(true);setError('');try{const r=await api(path,{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});if(verificar&&!verificar(r))throw Error('O servidor não confirmou a análise. Atualize antes de repetir.');state.reload();pedidos.reload();}catch(e){setError(mensagemErroEmbarque(e));state.reload();pedidos.reload();}finally{setBusy(false);}}
 async function cancel(id){if(busy||!window.confirm('Cancelar este pedido PENDENTE? A operação será registrada no servidor.'))return;setBusy(true);setError('');try{const r=await api('/embarques/'+idSeguro(id),{method:'DELETE'});validarCancelamentoEmbarque(r,id);state.reload();}catch(e){setError(mensagemErroEmbarque(e));state.reload();}finally{setBusy(false);}}
 return <section className="be-section"><div className="be-row"><h2>Solicitações oficiais</h2><Button onClick={()=>{state.reload();pedidos.reload();}}>Atualizar</Button></div><Alert error={state.error||pedidos.error||error}/>{state.loading?<Empty>Carregando solicitações…</Empty>:driver?<><Panel title="Vínculos pendentes">{!state.data?.vinculos?.length?<Empty>Nenhum vínculo pendente.</Empty>:<div className="be-list">{state.data.vinculos.map(p=><div key={p.id} className="be-item"><strong>{p.aluno?.nome||'Passageiro'}</strong><p>Turma: {p.turma.nome}</p><div className="be-actions"><Button disabled={busy} primary onClick={()=>approve(ep.analisarVinculo(p.id,'APROVADO'),'PUT',null,'aprovar vínculo')}>Aprovar</Button><Button disabled={busy} onClick={()=>approve(ep.analisarVinculo(p.id,'REJEITADO'),'PUT',null,'recusar vínculo')}>Recusar</Button></div></div>)}</div>}</Panel><section className="be-section"><Panel title="Pedidos de embarque"><div className="be-fieldset"><label>Rota<select value={rotaId} onChange={e=>setRotaId(e.target.value)}><option value="">Selecione uma rota</option>{state.data?.rotas?.map(r=><option key={r.id} value={r.id}>{r.nome}</option>)}</select></label><label>Data<input type="date" value={data} onChange={e=>setData(e.target.value)}/></label><label>Sentido<select value={sentido} onChange={e=>setSentido(e.target.value)}><option>IDA</option><option>VOLTA</option></select></label></div>{pedidos.loading&&rotaId?<Empty>Consultando…</Empty>:!pedidos.data?.length?<Empty>Sem pedidos nessa data e sentido.</Empty>:<div className="be-list">{pedidos.data.map(p=><div key={p.id} className="be-item"><strong>{p.nomePonto||`Parada ${p.paradaId}`}</strong><p>{date(p.dataOperacao)} · {dir(p.sentido)} · {display(p.status)}</p>{p.status==='PENDENTE'&&<div className="be-actions"><Button disabled={busy} primary onClick={()=>approve(ep.analisarEmbarque(p.id),'PUT',{status:'APROVADO'},'aprovar embarque',r=>r?.id===p.id&&r.status==='APROVADO')}>Aprovar</Button><Button disabled={busy} onClick={()=>approve(ep.analisarEmbarque(p.id),'PUT',{status:'REJEITADO'},'recusar embarque',r=>r?.id===p.id&&r.status==='REJEITADO')}>Recusar</Button></div>}</div>)}</div>}{rotaId&&<PlanejamentoEmbarquesWeb key={rotaId+'-'+data+'-'+sentido} api={api} rotaId={rotaId} data={data} sentido={sentido}/>}</Panel></section></>:<div className="be-grid"><Panel title="Vínculos aprovados">{state.data?.turmas?.length?state.data.turmas.map(t=><div className="be-item" key={t.id}>{t.nome}</div>):<Empty>Nenhuma turma vinculada.</Empty>}</Panel><Panel title="Meus pedidos de embarque">{state.data?.pessoais?.length?state.data.pessoais.map(p=><div className="be-item" key={p.id}><strong>{display(p.status)}</strong><p>{date(p.dataOperacao)} · {dir(p.sentido)} · {p.nomePonto||`Parada ${p.paradaId}`}</p>{p.status==='PENDENTE'&&<Button disabled={busy} onClick={()=>cancel(p.id)}>Cancelar pedido pendente</Button>}</div>):<Empty>Nenhum pedido registrado.</Empty>}</Panel></div>}</section>;
}
function Excursoes({api,driver}){
 const state=useAsync(s=>driver?api(ep.excursoes,{signal:s}).then(pagina):Promise.resolve([]),[driver]);
 const [id,setId]=useState(null),[exec,setExec]=useState(null),[error,setError]=useState(''),[loadingExec,setLoadingExec]=useState(false);
 const execRequest=useRef(0);
 async function load(id){
  const request=++execRequest.current;
  setId(id);setExec(null);setError('');setLoadingExec(true);
  try{const x=array(await api(ep.execucoes(id)));if(request===execRequest.current)setExec(x);}
  catch(e){if(request===execRequest.current)setError(e instanceof Error?e.message:'Não foi possível consultar as execuções.');}
  finally{if(request===execRequest.current)setLoadingExec(false);}
 }
 if(!driver)return <Panel title="Excursões"><p>Inscrições de passageiros são feitas com convites individuais. O webapp não acessa recursos privados do motorista em nome do passageiro.</p><p className="be-muted">Para se inscrever, use o link de convite individual fornecido pelo organizador. A consulta aqui não disponibiliza execuções privadas do motorista.</p></Panel>;
 return <section className="be-section"><div className="be-row"><h2>Excursões</h2><Button onClick={state.reload}>Atualizar</Button></div><Alert error={state.error||error}/>{state.loading?<Empty>Carregando…</Empty>:!state.data?.length?<Empty>Nenhuma excursão encontrada.</Empty>:<div className="be-grid">{state.data.map(e=><Panel key={e.id} title={e.titulo}><p>{e.origemNome||'Origem'} → {e.destinoNome}</p><p>Partida: {stamp(e.partidaEm)}</p><p>Volta: {stamp(e.retornoEm)}</p><p className="be-muted">{display(e.estado)} · {e.capacidade} assentos</p><Button onClick={()=>load(e.id)}>Consultar execuções</Button></Panel>)}</div>}
 {id&&<section className="be-section"><Panel title={`Execuções da excursão #${id}`}><Button onClick={()=>load(id)}>Atualizar execuções</Button>{loadingExec?<p role="status" className="be-muted">Carregando execuções…</p>:error?<Empty>Não foi possível apresentar as execuções. Tente atualizar.</Empty>:!exec?.length?<Empty>Não existe execução registrada. O início exige prévia, versão salva e validação dos participantes no aplicativo.</Empty>:<div className="be-list">{exec.map(v=><div className="be-item" key={v.id}><strong>Execução #{v.id} · {dir(v.sentido)} · {display(v.estado)}</strong><p>{v.pontos?.length||0} pontos no roteiro oficial</p></div>)}</div>}</Panel></section>}</section>;
}
function Notificacoes({api,onGo}){
 const state=useAsync(s=>api(ep.notificacoes,{signal:s}).then(v=>v?.content?array(v.content):pagina(v)),[]);
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function read(id){if(busy)return;setBusy(true);setError('');try{await api(ep.notificacaoLida(id),{method:'PUT'});state.reload();}catch(e){setError(e.message)}finally{setBusy(false);}}
 return <section className="be-section"><div className="be-row"><h2>Central de notificações</h2><Button onClick={state.reload}>Atualizar</Button></div><Alert error={state.error||error}/><Panel title="Histórico recebido pelo servidor">{state.loading?<Empty>Consultando…</Empty>:!state.data?.length?<><Empty>Nenhuma notificação registrada para esta conta.</Empty><Button primary onClick={()=>onGo('solicitacoes')}>Ver solicitações diretamente</Button></>:<div className="be-list">{state.data.map(n=><div key={n.id} className="be-item"><div className="be-row"><strong>{n.titulo}</strong><span className="be-chip">{n.contextoTipo}</span></div><p>{n.mensagem}</p><p className="be-muted">{stamp(n.criadaEm)} · {n.lidaEm?'Lida':'Não lida'}</p><div className="be-actions"><Button onClick={()=>onGo('solicitacoes')}>Consultar solicitações</Button>{!n.lidaEm&&<Button disabled={busy} onClick={()=>read(n.id)}>Marcar como lida</Button>}</div></div>)}</div>}</Panel><p className="be-footnote">Avisos dependem do pipeline de eventos do backend. O navegador ainda não registra tokens FCM para push.</p></section>;
}
