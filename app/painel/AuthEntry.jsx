'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {firebaseSignIn,firebaseRefresh,firebasePasswordReset} from '../lib/bevans-auth.mjs';
import {apiRequest,array,pagina,ep,diaLocal,idSeguro} from '../lib/bevans-api.mjs';
import './painel.css';
import MapaOperacional,{pontosRotaPublica} from './MapaOperacional';
import AcompanhamentoViagem from './AcompanhamentoViagem';
import EnderecosWeb from './EnderecosWeb';
import PresencaWeb from './PresencaWeb';
import EditorRotaWeb from './EditorRotaWeb';
import GestaoTurmaWeb from './GestaoTurmaWeb';
import GestaoExcursaoWeb from './GestaoExcursaoWeb';
import ColetaPrivadaWeb from './ColetaPrivadaWeb';

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
 const tabs=[['inicio','Início'],['turmas','Turmas'],['rotas',driver?'Rotas públicas':'Explorar rotas'],['enderecos','Endereços'],['solicitacoes','Solicitações'],['excursoes','Excursões'],['notificacoes','Notificações'],['operacao','Operações']];
 const selected=tabs.find(item=>item[0]===tab);
 const firstName=(profile.nome||'').trim().split(/\s+/)[0]||'Usuário';
 return <main className="be-app" id="conteudo">
  <aside className="be-sidebar" aria-label="Navegação da plataforma">
   <Link href="/" className="be-sidebar-brand" aria-label="BeVans, voltar ao site"><Image src="/images/vetor-com-nome-tema-claro.png" alt="BeVans" width={154} height={56} className="be-official-mark be-brand-light"/><Image src="/images/bevans-logo-oficial-branco.png" alt="" width={154} height={56} className="be-official-mark be-brand-dark"/></Link>
   <div className="be-sidebar-group"><p className="be-nav-label">Navegação</p><nav className="be-sidebar-nav" aria-label="Áreas do painel">{tabs.map(([key,label])=><button type="button" key={key} onClick={()=>setTab(key)} aria-current={tab===key?'page':undefined}>{label}</button>)}</nav></div>
   <div className="be-sidebar-footer"><div className="be-account"><span className="be-avatar" aria-hidden="true">{firstName[0].toUpperCase()}</span><div><strong>{profile.nome||'Minha conta'}</strong><small>{driver?'Motorista':'Passageiro'}</small></div></div><button type="button" className="be-signout" onClick={signOut}>Sair da conta</button><Link href="/" className="be-site-link">Voltar ao site</Link></div>
  </aside>
  <div className="be-main-column">
   <header className="be-app-top"><div className="be-app-top-left"><Image src="/images/bevans-simbolo-oficial.png" alt="" width={30} height={30} className="be-top-mark be-brand-light"/><Image src="/images/vetor-tema-escuro.png" alt="" width={30} height={30} className="be-top-mark be-brand-dark"/><span>{driver?'Área do motorista':'Área do passageiro'}</span></div><div className="be-app-user"><span className="be-user-name">{profile.nome||'Minha conta'}</span><span className="be-top-avatar" aria-hidden="true">{firstName[0].toUpperCase()}</span><button type="button" className="be-mobile-signout" onClick={signOut}>Sair</button></div></header>
   <nav className="be-mobile-tabs" aria-label="Navegação do painel">{tabs.map(([key,label])=><button type="button" key={key} onClick={()=>setTab(key)} aria-current={tab===key?'page':undefined}>{label}</button>)}</nav>
   <div className="be-main-content"><header className="be-page-heading"><div><p className="be-page-location">{driver?'Motorista':'Passageiro'} / {selected?.[1]||'Início'}</p><h1>{tab==='inicio'?`Olá, ${firstName}.`:selected?.[1]}</h1><p>{tab==='inicio'?'Aqui estão as informações da sua conta.':'Dados e ações disponíveis para o seu perfil.'}</p></div>{tab==='inicio'&&<div className="be-heading-date">{new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</div>}</header>
    {tab==='inicio'&&<Overview api={api} profile={profile} driver={driver} onGo={setTab}/>}
    {tab==='turmas'&&<Turmas api={api} profile={profile} driver={driver}/>}
    {tab==='rotas'&&<Rotas api={api} profile={profile} driver={driver}/>}
    {tab==='enderecos'&&<EnderecosWeb api={api} usuarioId={profile.id}/>}
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
    <section className="be-overview-section"><div className="be-section-title"><div><h2>Acessar</h2><p>Escolha o que deseja consultar.</p></div></div><div className="be-shortcuts">
     {[["solicitacoes","Solicitações","Pedidos de vínculo e embarque"],["rotas",driver?'Rotas públicas':'Explorar rotas',"Itinerários e horários"],["excursoes","Excursões","Viagens e participantes"],["operacao","Operações","Estado das viagens"]].map(([key,title,desc])=><button key={key} type="button" onClick={()=>onGo(key)}><span><strong>{title}</strong><small>{desc}</small></span><span aria-hidden="true">→</span></button>)}
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
 const [creating,setCreating]=useState(false),[nome,setNome]=useState(''),[turno,setTurno]=useState(''),[capacidade,setCapacidade]=useState(10),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false);
  const [codigo,setCodigo]=useState(''),[entrando,setEntrando]=useState(false);
  async function entrar(e){e.preventDefault();if(entrando||driver)return;const valor=codigo.trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(valor)){setFeedback('Informe o código de seis caracteres enviado pelo motorista.');return;}setEntrando(true);setFeedback('');try{const resposta=await api(`/turmas/entrar/${idSeguro(profile.id)}?codigo=${encodeURIComponent(valor)}`,{method:'POST'});if(typeof resposta!=='string'||!resposta.includes('Solicitação'))throw Error('Não foi possível confirmar o pedido. Consulte o motorista.');setCodigo('');setFeedback('Solicitação enviada. Aguarde aprovação do motorista.');data.reload();}catch(e){setFeedback(e.message);}finally{setEntrando(false);}}
 async function create(e){e.preventDefault();if(busy)return;setBusy(true);setFeedback('');try{if(!nome.trim()||!turno.trim()||!Number.isSafeInteger(Number(capacidade))||Number(capacidade)<=0)throw Error('Informe nome, turno e capacidade válida.');const r=await api('/turmas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:nome.trim(),turno:turno.trim(),motorista:{id:idSeguro(profile.id)},capacidade:Number(capacidade)})});if(!r?.id)throw Error('Criação não confirmada. Confira a lista antes de repetir.');setCreating(false);setNome('');setTurno('');data.reload();}catch(error){setFeedback(error.message)}finally{setBusy(false);}}
 return <section className="be-section"><div className="be-row"><h2>Turmas {driver?'gerenciadas':'vinculadas'}</h2><div className="be-actions"><Button onClick={data.reload}>Atualizar</Button>{driver&&<Button primary onClick={()=>setCreating(v=>!v)}>Nova turma</Button>}</div></div><Alert error={data.error||feedback}/>
 {!driver&&<form className="be-fieldset" onSubmit={entrar}><label>Código da turma<input value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} maxLength={6} placeholder="ABC123" required/></label><button className="be-btn primary" disabled={entrando}>{entrando?'Enviando…':'Solicitar entrada por código'}</button></form>}
  {creating&&driver&&<Panel title="Cadastrar turma"><p className="be-muted">Cadastro básico. Planejamento de pontos privados e presença seguem no aplicativo Android até a validação do módulo web.</p><form className="be-form" onSubmit={create}><label>Nome<input required value={nome} onChange={e=>setNome(e.target.value)}/></label><label>Turno<input required value={turno} onChange={e=>setTurno(e.target.value)}/></label><label>Assentos<input type="number" min="1" required value={capacidade} onChange={e=>setCapacidade(e.target.value)}/></label><button className="be-btn primary" disabled={busy}>Criar turma</button></form></Panel>}
 {data.loading?<Empty>Carregando…</Empty>:!data.data?.length?<Empty>Nenhuma turma disponível para esta conta.</Empty>:<div className="be-grid">{data.data.map(t=><Panel key={t.id} title={t.nome||`Turma ${t.id}`}><p>{t.turno}</p><p className="be-muted">Turma #{t.id} · Capacidade: {t.capacidade??'não configurada'}</p><p className="be-muted">Origem: {t.origemNome||'Não cadastrada'}</p><p className="be-muted">Destino: {t.destinoNome||'Não cadastrado'}</p>{driver&&t.codigoConvite&&<p>Código de convite: <strong>{t.codigoConvite}</strong></p>}{driver?<GestaoTurmaWeb api={api} turma={t} onAtualizar={data.reload}/>:<ColetaPrivadaWeb api={api} turmaId={t.id} driver={false}/>}</Panel>)}</div>}</section>;
}
function Rotas({api,driver,profile}){
 const [filters,setFilters]=useState({cidade:'',destino:''}),[selected,setSelected]=useState(null),[route,setRoute]=useState(null),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false);
 const list=useAsync(s=>api(driver?ep.rotas:ep.catalogo(filters),{signal:s}).then(r=>driver?array(r):pagina(r)),[driver,filters.cidade,filters.destino]);
 const [preview,setPreview]=useState([]),[editor,setEditor]=useState(undefined),[sentidoPartida,setSentidoPartida]=useState('IDA');
 async function open(id){setFeedback('');setRoute(null);setPreview([]);setSelected(id);try{const r=await api(ep.rota(id));if(r?.id!==id)throw Error('O servidor retornou outra rota.');setRoute(r);}catch(e){setFeedback(e.message);}}
 async function write(task){if(busy)return;setBusy(true);setFeedback('');try{await task();list.reload();if(selected)await open(selected);}catch(e){setFeedback(e.message);}finally{setBusy(false);}}
 return <section className="be-section"><div className="be-row"><h2>{driver?'Gerenciamento de rotas públicas':'Catálogo de rotas públicas'}</h2><div className="be-actions"><Button onClick={list.reload}>Atualizar</Button>{driver&&<Button primary onClick={()=>setEditor(null)}>Nova rota pública</Button>}</div></div><Alert error={list.error||feedback}/>
 {driver&&editor!==undefined&&<EditorRotaWeb key={editor?.id||'nova'} api={api} motoristaId={profile.id} rota={editor} onCancel={()=>setEditor(undefined)} onSaved={id=>{setEditor(undefined);list.reload();open(id);}}/>}
  {!driver&&<div className="be-fieldset"><label>Cidade<input value={filters.cidade} onChange={e=>setFilters(p=>({...p,cidade:e.target.value}))}/></label><label>Destino<input value={filters.destino} onChange={e=>setFilters(p=>({...p,destino:e.target.value}))}/></label></div>}
 {list.loading?<Empty>Consultando rotas…</Empty>:!list.data?.length?<Empty>Nenhuma rota disponível.</Empty>:<div className="be-grid">{list.data.map(r=><Panel key={r.id} title={r.nome}><p>{r.cidade} {r.modo?`· ${r.modo}`:''}</p><p className="be-muted">{r.destinoNome||r.destino||''}</p><p className="be-muted">{driver?(r.publicada?'Publicada':'Não publicada'):`Vagas: ${r.vagas?.disponiveis??'indisponível'}`}</p><div className="be-actions"><Button onClick={()=>open(r.id)}>Detalhes oficiais</Button>{!driver&&<Button disabled={busy} onClick={()=>write(async()=>{const response=await api(ep.favoritas(r.id),{method:r.favorita?'DELETE':'PUT'});return response;})}>{r.favorita?'Remover favorito':'Favoritar'}</Button>}</div></Panel>)}</div>}
 {selected&&!route&&<Empty>Carregando a rota selecionada…</Empty>}
 {route&&<Panel title={`Rota: ${route.nome}`}><p>{route.origemNome} → {route.destinoNome}</p><p>{route.modo} · {route.categoria} · IDA {route.horarioIda||'não configurada'} · VOLTA {route.horarioVolta||'não configurada'}</p><p className="be-muted">Dias: {route.dias?.join(', ')}</p><h3>Paradas</h3>{route.paradas?.length?<div className="be-list">{route.paradas.map((p,i)=><div key={p.id||i} className="be-item">{i+1}. {p.nome}</div>)}</div>:<Empty>Sem paradas cadastradas.</Empty>}
 <MapaOperacional key={route.id} titulo="Mapa da rota pública" pontos={preview.length?preview:pontosRotaPublica(route)} autorizarRoteamento={driver}/>
  {driver&&<div className="be-actions"><Button disabled={busy} onClick={async()=>{setFeedback('');try{const p=await api(`/rotas-publicas/${idSeguro(route.id)}/planejamento?sentido=IDA&otimizar=true`,{method:'POST'});if(!Array.isArray(p))throw Error('Prévia inválida.');setPreview(p);}catch(e){setFeedback(e.message);}}}>Prévia otimizada (ida)</Button><Button disabled={busy} onClick={()=>setPreview([])}>Ver ordem cadastrada</Button></div>}
  {driver?<><div className="be-actions"><Button onClick={()=>setEditor(route)}>Editar configuração e paradas</Button></div><div className="be-fieldset"><label>Sentido da partida pública<select value={sentidoPartida} onChange={e=>setSentidoPartida(e.target.value)}><option value="IDA">Ida</option><option value="VOLTA">Volta</option></select></label><Button disabled={busy||!route.publicada||!route.ativa} primary onClick={()=>write(async()=>{if(!window.confirm(`Iniciar a rota pública ${route.nome} (${sentidoPartida})?`))return;const r=await api(`/rotas-publicas/${idSeguro(route.id)}/iniciar`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sentido:sentidoPartida})});if(!r?.mensagem)throw Error('A API não confirmou a partida. Confira o estado da viagem.');})}>Iniciar rota pública</Button></div><p className="be-alert">A publicação altera o catálogo. Confira os dados e confirme conscientemente.</p><div className="be-actions"><Button disabled={busy} onClick={()=>write(async()=>{if(!window.confirm(`${route.publicada?'Despublicar':'Publicar'} a rota ${route.nome}?`))return;const r=await api(`/rotas-publicas/${idSeguro(route.id)}/publicacao`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:!route.publicada})});if(!r||r.publicada===route.publicada)throw Error('O servidor não confirmou a publicação.');})}>{route.publicada?'Despublicar rota':'Publicar rota'}</Button></div></>:<PassengerRequest api={api} route={route} busy={busy} write={write}/>}
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
 const [id,setId]=useState(null),[exec,setExec]=useState(null),[error,setError]=useState(''),[editing,setEditing]=useState(undefined);
 async function load(id){setId(id);setExec(null);setError('');try{const x=array(await api(ep.execucoes(id)));setExec(x);}catch(e){setError(e.message);}}
 if(!driver)return <Panel title="Excursões"><p>Inscrições de passageiros são feitas com convites individuais. O webapp não acessa recursos privados do motorista em nome do passageiro.</p><Empty>O fluxo de inscrição com convite será integrado separadamente.</Empty></Panel>;
 return <section className="be-section"><div className="be-row"><h2>Excursões</h2><div className="be-actions"><Button onClick={state.reload}>Atualizar</Button><Button primary onClick={()=>setEditing(null)}>Nova excursão</Button></div></div><Alert error={state.error||error}/>{editing!==undefined&&<GestaoExcursaoWeb key={editing?.id||'nova'} api={api} excursao={editing} onClose={()=>setEditing(undefined)} onSaved={()=>{state.reload();}}/>}
  {state.loading?<Empty>Carregando…</Empty>:!state.data?.length?<Empty>Nenhuma excursão encontrada.</Empty>:<div className="be-grid">{state.data.map(e=><Panel key={e.id} title={e.titulo}><p>{e.origemNome||'Origem'} → {e.destinoNome}</p><p>Partida: {stamp(e.partidaEm)}</p><p>Volta: {stamp(e.retornoEm)}</p><p className="be-muted">{display(e.estado)} · {e.capacidade} assentos</p><div className="be-actions"><Button onClick={()=>load(e.id)}>Consultar execuções</Button><Button onClick={()=>setEditing(e)}>Gerenciar excursão</Button></div></Panel>)}</div>}
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
 {viagem&&<AcompanhamentoViagem key={`${turma}-${viagem.viagemId||'inativa'}`} api={api} turmaId={turma} viagem={viagem} driver={driver} onRefresh={refresh}/>}
  {viagem&&!driver&&<PresencaWeb key={turma} api={api} turmaId={turma} usuarioId={profile.id} viagem={viagem}/>}
  {viagem&&<Panel title="Estado atual"><p><strong>{display(viagem.status)}</strong> {viagem.sentido&&`· ${dir(viagem.sentido)}`} {viagem.modalidade&&`· ${viagem.modalidade}`}</p>{viagem.status==='INATIVA'?<Empty>Nenhuma viagem ativa nesta turma.</Empty>:!painel?<Empty>Aguardando painel operacional…</Empty>:driver?<><div className="be-kpis"><div className="be-kpi"><b>{painel.contadores?.esperados??'?'}</b>Esperados</div><div className="be-kpi"><b>{painel.contadores?.naVan??'?'}</b>Na van</div><div className="be-kpi"><b>{painel.contadores?.aguardando??'?'}</b>Aguardando</div></div><div className="be-list">{painel.registros.map(p=><div className="be-item" key={p.id}><strong>{p.nome}</strong><p>{display(p.estado)}</p><div className="be-actions">{p.estado==='AGUARDANDO'&&<><Button disabled={busy} primary onClick={()=>change(p,'EMBARCADO')}>Confirmar embarque</Button><Button disabled={busy} onClick={()=>change(p,'NAO_EMBARCOU')}>Registrar ausência</Button></>}{p.estado==='EMBARCADO'&&<Button disabled={busy} onClick={()=>change(p,'DESEMBARCADO')}>Confirmar desembarque</Button>}</div></div>)}</div></>:<><p><strong>Meu estado:</strong> {display(painel.estado)}</p>{painel.estado==='AGUARDANDO'&&<Button disabled={busy} primary onClick={()=>change(painel,'EMBARCADO')}>Confirmar que embarquei</Button>}</>}</Panel>}
 <p className="be-footnote">O mapa web exibe pontos e GPS autorizado. Para navegação no trânsito, use uma solução de roteamento própria. O GPS deste navegador requer HTTPS, permissão explícita e aba visível.</p></section>;
}
