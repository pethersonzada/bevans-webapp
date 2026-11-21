'use client';
import {useEffect,useRef,useState} from 'react';
import MapaWeb from '../painel/MapaWeb';
import Link from 'next/link';
const text=e=>e instanceof Error?e.message:'Não foi possível concluir a solicitação.';
const valid=p=>p&&typeof p.latitude==='number'&&Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90&&typeof p.longitude==='number'&&Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180&&!(p.latitude===0&&p.longitude===0);
function baseApi(){
 const raw=(process.env.NEXT_PUBLIC_BEVANS_API_URL||'').trim().replace(/\/+$/,'');
 if(!raw)throw Error('A API pública ainda não está configurada.');
 const url=new URL(raw);
 if(url.protocol!=='https:'&&!(process.env.NODE_ENV==='development'&&url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error('O cadastro exige uma API HTTPS.');
 if(url.username||url.password||url.search||url.hash)throw Error('URL da API inválida.');
 return raw;
}
async function publico(path,headers,method='GET',body=undefined){
 const r=await fetch(baseApi()+path,{method,headers:{...headers,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store',referrerPolicy:'no-referrer'});
 if(!r.ok){if(r.status===404)throw Error('Convite inválido, expirado ou indisponível.');if(r.status===429)throw Error('Muitas tentativas. Tente novamente mais tarde.');if(r.status===409)throw Error('Inscrição não aceita. Confira vagas e estado da excursão.');throw Error('Solicitação recusada (HTTP '+r.status+').');}
 return r.json();
}
export default function ConviteClient(){
 const [convite,setConvite]=useState(''),[dados,setDados]=useState(null),[nome,setNome]=useState(''),[contato,setContato]=useState(''),[paradaId,setParadaId]=useState(''),[pontoNome,setPontoNome]=useState(''),[ponto,setPonto]=useState(null),[aceite,setAceite]=useState(false);
 const [credencial,setCredencial]=useState(''),[credencialDigitada,setCredencialDigitada]=useState(''),[inscricao,setInscricao]=useState(null),[notificacoes,setNotificacoes]=useState([]),[contatoMotorista,setContatoMotorista]=useState(null),[busy,setBusy]=useState(false),[erro,setErro]=useState(''),[loading,setLoading]=useState(true);
 const iniciado=useRef(false);
 useEffect(()=>{
  if(iniciado.current)return;iniciado.current=true;
  Promise.resolve().then(()=>{
   let raw='';try{raw=decodeURIComponent(window.location.hash.slice(1));}catch{setErro('Token de convite inválido.');setLoading(false);return;}
   window.history.replaceState(null,'',window.location.pathname);
   if(!raw||raw.length>500||/\s/.test(raw)){setErro('Link sem convite válido. Solicite um novo convite ao organizador.');setLoading(false);return;}
   setConvite(raw);
   publico('/publico/excursoes/convite',{'X-Convite':raw}).then(setDados).catch(e=>setErro(text(e))).finally(()=>setLoading(false));
  });
 },[]);
 const modo=dados?.modoColeta||'PORTA_A_PORTA';
 const safePins=(dados?.paradas||[]).filter(valid).map(p=>({...p,nome:p.nome||'Parada'}));
 async function cadastrar(e){
  e.preventDefault();if(busy||!dados)return;
  if(modo==='PORTA_A_PORTA'&&(!pontoNome.trim()||!valid(ponto)))return setErro('Informe nome do ponto e confirme suas coordenadas no mapa.');
  if(modo==='MULTIPLAS_PARADAS'&&!paradaId)return setErro('Selecione um ponto de embarque.');
  if(!aceite)return setErro('É necessário aceitar a política de privacidade.');
  setBusy(true);setErro('');
  try{
   let individual=credencial;
   if(!individual){
    const issued=await publico('/publico/excursoes/credenciais',{'X-Convite':convite},'POST');
    if(!issued?.token)throw Error('Credencial individual não confirmada.');
    individual=issued.token;setCredencial(individual);
   }
   const body={nome:nome.trim(),contato:contato.trim(),aceitePrivacidade:true};
   if(modo==='PORTA_A_PORTA')Object.assign(body,{nomePonto:pontoNome.trim(),latitude:ponto.latitude,longitude:ponto.longitude,pontoConfirmado:true,paradaId:null});
   else if(modo==='MULTIPLAS_PARADAS')body.paradaId=Number(paradaId);
   const result=await publico('/publico/excursoes/inscricoes',{'X-Convite':convite,'X-Inscricao':individual},'POST',body);
   if(!result?.id)throw Error('O servidor não confirmou o cadastro. Não gere uma nova credencial; tente novamente.');
   setInscricao(result);
  }catch(e){setErro(text(e));}finally{setBusy(false);}
 }
 async function consultarInscricao(){
  const value=(credencialDigitada||credencial).trim();
  if(!value||value.length>500||/\\s/.test(value))return setErro('Informe uma credencial individual válida.');
  setBusy(true);setErro('');
  try{
   const r=await publico('/publico/excursoes/inscricao',{'X-Inscricao':value});
   if(!r?.id||!r?.estado)throw Error('O servidor não confirmou esta inscrição.');
   setCredencial(value);setInscricao(r);setCredencialDigitada('');
  }catch(e){setErro(text(e));}finally{setBusy(false);}
 }
 async function avisos(){
  if(!credencial)return;
  setBusy(true);setErro('');
  try{const r=await publico('/publico/excursoes/inscricao/notificacoes?pagina=0&tamanho=20',{'X-Inscricao':credencial});if(!Array.isArray(r?.content))throw Error('Histórico de avisos inválido.');setNotificacoes(r.content);}catch(e){setErro(text(e));}finally{setBusy(false);}
 }
 async function mostrarContato(){
  if(!credencial||inscricao?.estado!=='CONFIRMADA')return;
  setBusy(true);setErro('');
  try{const r=await publico('/publico/excursoes/inscricao/contato-motorista',{'X-Inscricao':credencial});if(!r?.waMe||!/^https:\\/\\/wa\\.me\\/[0-9]+$/.test(r.waMe))throw Error('Contato não autorizado.');setContatoMotorista(r);}catch(e){setErro(text(e));}finally{setBusy(false);}
 }
 async function cancelar(){
  if(!credencial||!window.confirm('Cancelar esta inscrição? A vaga será liberada.'))return;
  setBusy(true);setErro('');
  try{const r=await publico('/publico/excursoes/inscricao',{'X-Inscricao':credencial},'DELETE');setInscricao(r);}
  catch(e){setErro(text(e));}finally{setBusy(false);}
 }
 return <main id="conteudo" className="be-shell" style={{padding:'clamp(18px,4vw,48px)',minHeight:'100dvh'}}>
  <div style={{maxWidth:850,margin:'0 auto'}}>
   <Link href="/" className="be-brand">BeVans</Link>
   <section className="be-card be-section"><h1>Convite para excursão</h1>
    <p className="be-muted">Inscrição individual. O convite dá acesso apenas a informações públicas autorizadas, sem dados de outros participantes.</p>
    {loading&&<p>Validando convite…</p>}{erro&&<p className="be-error" role="alert">{erro}</p>}
    {dados&&<><h2>{dados.titulo}</h2><p>Destino: <strong>{dados.destinoNome}</strong></p><p>Partida: {new Date(dados.partidaEm).toLocaleString('pt-BR')}</p>
    <p>Vagas disponíveis nesta consulta: <strong>{dados.vagasDisponiveis}</strong>. A reserva só é feita após a inscrição ser confirmada pelo servidor.</p>
    <MapaWeb pontos={[...safePins,{nome:'Destino',latitude:dados.destinoLatitude,longitude:dados.destinoLongitude}]} altura={300}/>
    </>}
   </section>
   {!inscricao&&<section className="be-card be-section"><h2>Já tenho uma credencial</h2><p className="be-muted">Cole a credencial individual que você salvou anteriormente. Ela não será colocada na URL nem armazenada no navegador.</p><div className="be-form"><label>Credencial individual<input autoComplete="off" type="password" value={credencialDigitada} onChange={e=>setCredencialDigitada(e.target.value)} /></label><button className="be-btn" disabled={busy||!credencialDigitada.trim()} onClick={consultarInscricao} type="button">Consultar minha inscrição</button></div></section>}
   {dados&&!inscricao&&<section className="be-card be-section"><h2>Solicitar inscrição</h2>
    <form className="be-form" onSubmit={cadastrar}>
     <label>Nome completo<input required autoComplete="name" maxLength={160} value={nome} onChange={e=>setNome(e.target.value)}/></label>
     <label>E-mail ou telefone<input required autoComplete="email" maxLength={160} value={contato} onChange={e=>setContato(e.target.value)}/></label>
     {modo==='MULTIPLAS_PARADAS'&&<label>Parada<select required value={paradaId} onChange={e=>setParadaId(e.target.value)}><option value="">Selecione</option>{safePins.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>}
     {modo==='PARADA_UNICA'&&<p className="be-muted">Embarque no ponto definido pelo organizador. Confira a posição no mapa.</p>}
     {modo==='PORTA_A_PORTA'&&<><label>Identificação do ponto<input required value={pontoNome} onChange={e=>setPontoNome(e.target.value)} placeholder="Meu endereço de embarque"/></label>
      <MapaWeb pontos={ponto?[{...ponto,nome:pontoNome||'Embarque'}]:[]} onSelecionar={setPonto} altura={300}/>
      <p className="be-muted">Confirme manualmente o pin. Sua localização será enviada apenas na solicitação de inscrição.</p>
     </>}
     <label style={{display:'flex',flexDirection:'row',gap:10,alignItems:'center'}}><input style={{width:18}} type="checkbox" checked={aceite} onChange={e=>setAceite(e.target.checked)}/>Li e aceito o tratamento de dados descrito na <Link href="/privacidade">política de privacidade</Link>.</label>
     <button className="be-btn primary" disabled={busy||!aceite}>{busy?'Enviando…':'Solicitar minha vaga'}</button>
    </form><p className="be-muted">Sua solicitação poderá ficar pendente até aprovação do organizador. Não é confirmação de pagamento.</p>
   </section>}
   {inscricao&&<section className="be-card be-section"><h2>Minha inscrição</h2><p><strong>{inscricao.nome||nome}</strong> · Estado: {inscricao.estado}</p>
    <p className="be-alert">Salve sua credencial em um local privado. Ela identifica sua inscrição e permite consultar ou cancelar depois. Este navegador não a armazena automaticamente.</p>
    <div className="be-actions"><button type="button" className="be-btn" disabled={!credencial} onClick={()=>navigator.clipboard.writeText(credencial)}>Copiar credencial individual</button><button type="button" className="be-btn" disabled={busy} onClick={avisos}>Consultar notificações</button>{inscricao.estado==='CONFIRMADA'&&<button type="button" className="be-btn" disabled={busy} onClick={mostrarContato}>Contato do organizador</button>}</div>
    {contatoMotorista&&<p><a className="be-btn primary" href={contatoMotorista.waMe} target="_blank" rel="noopener noreferrer">Abrir WhatsApp comercial autorizado</a></p>}
    {!!notificacoes.length&&<div className="be-list">{notificacoes.map(n=><div className="be-item" key={n.id}><strong>{n.titulo}</strong><p>{n.mensagem}</p></div>)}</div>}
    {inscricao.estado!=='CANCELADA'&&<button className="be-btn danger" disabled={busy} onClick={cancelar}>Cancelar minha inscrição</button>}
   </section>}
  </div>
 </main>;
}
