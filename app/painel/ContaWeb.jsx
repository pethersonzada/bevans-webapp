'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ep} from '../lib/bevans-api.mjs';
import {
 conferirPerfilProprio,solicitarVerificacaoEmail,confirmarEmailVerificado,solicitarExclusaoConta,
} from '../lib/conta-web.mjs';

const message=e=>e instanceof Error?e.message:'Não foi possível concluir a operação.';
export default function ContaWeb({api,session,profile,isCurrent,onSessionRotated,onDeletionPending}){
 const [official,setOfficial]=useState(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const [newEmail,setNewEmail]=useState(''),[verifyPassword,setVerifyPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState('');
 const [deletePassword,setDeletePassword]=useState(''),[deleteText,setDeleteText]=useState('');
 const writing=useRef(false);
 const uid=session.uid;
 const load=useCallback(async()=>{
  const data=conferirPerfilProprio(await api(ep.perfil(uid)),session);
  return data;
 },[api,uid,session]);
 useEffect(()=>{
  let live=true;
  Promise.resolve().then(()=>load()).then(data=>{if(live){setOfficial(data);setError('');}})
   .catch(e=>{if(live){setOfficial(null);setError(message(e));}})
   .finally(()=>{if(live)setLoading(false);});
  return()=>{live=false;};
 },[load]);

 async function execute(action){
  if(writing.current||!official)return;
  writing.current=true;setBusy(true);setError('');setNotice('');
  try{await action();}
  catch(e){setError(message(e));}
  finally{
   setVerifyPassword('');setConfirmPassword('');setDeletePassword('');
   writing.current=false;setBusy(false);
  }
 }
 async function requestEmail(e){
  e.preventDefault();
  await execute(async()=>{
   const result=await solicitarVerificacaoEmail({session,profile:official,password:verifyPassword,newEmail,isCurrent});
   setNewEmail(result.email);
   setNotice('Solicitação enviada. Abra a mensagem recebida no novo e-mail e confirme o link. Depois use o formulário de conclusão abaixo.');
  });
 }
 async function finishEmail(e){
  e.preventDefault();
  await execute(async()=>{
   const result=await confirmarEmailVerificado({session,profile:official,password:confirmPassword,newEmail,isCurrent});
   if(!isCurrent())throw Error('A sessão mudou. Entre novamente.');
   onSessionRotated(result.session,result.profile);
   setOfficial(result.profile);
   setNewEmail('');
   setNotice('Novo e-mail confirmado no Firebase e sincronizado com o servidor.');
  });
 }
 async function removeAccount(e){
  e.preventDefault();
  if(deleteText!=='EXCLUIR')return setError('Digite EXCLUIR para confirmar sua intenção.');
  if(!window.confirm('Deseja solicitar a exclusão da própria conta? O pedido pode ser irreversível e vínculos ativos podem impedir a operação.'))return;
  await execute(async()=>{
   await solicitarExclusaoConta({session,profile:official,password:deletePassword,isCurrent});
   onDeletionPending();
  });
 }
 return <div className="be-live-stack" aria-label="Minha conta e segurança">
  <section className="be-card">
   <h3>Meu perfil</h3>
   <p className="be-muted">Informações consultadas diretamente da sua conta no BeVans.</p>
   {loading?<p role="status">Consultando seu perfil…</p>:official?<dl className="be-account-details">
    <div><dt>Nome</dt><dd>{official.nome}</dd></div>
    <div><dt>E-mail</dt><dd>{official.email}</dd></div>
    <div><dt>Telefone</dt><dd>{official.telefone||'Não informado'}</dd></div>
    <div><dt>Tipo de conta</dt><dd>{official.tipo==='MOTORISTA'?'Motorista':'Passageiro'}</dd></div>
   </dl>:<p className="be-muted">Seu perfil não está disponível. Confira a sessão antes de alterar qualquer dado.</p>}
   {error&&<p role="alert" className="be-error">{error}</p>}
   {notice&&<p role="status" className="be-alert">{notice}</p>}
   <button type="button" className="be-btn" disabled={busy||loading} onClick={async()=>{setLoading(true);setError('');setOfficial(null);try{setOfficial(await load());}catch(e){setError(message(e));}finally{setLoading(false);}}}>Atualizar meu perfil</button>
  </section>
  {official&&<section className="be-card">
   <h3>Alterar e-mail de acesso</h3>
   <p className="be-muted">Primeiro confirme o endereço novo pelo link enviado pelo Firebase. O servidor só aceita o e-mail que já estiver verificado para sua identidade.</p>
   <form className="be-form" onSubmit={requestEmail}>
    <label>Novo e-mail<input type="email" autoComplete="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required maxLength={254} disabled={busy}/></label>
    <label>Senha atual para solicitar a verificação<input type="password" autoComplete="current-password" value={verifyPassword} onChange={e=>setVerifyPassword(e.target.value)} required disabled={busy}/></label>
    <button type="submit" className="be-btn primary" disabled={busy||!newEmail.trim()||!verifyPassword}>Enviar verificação ao novo e-mail</button>
   </form>
   <div className="be-account-divider"/>
   <h4>Já confirmou o link no novo e-mail?</h4>
   <p className="be-muted">Entre com o e-mail novo e sua senha para conferir o status no Firebase e sincronizar o perfil. Se a conexão falhar, repita apenas a confirmação, sem pedir outra mudança de endereço.</p>
   <form className="be-form" onSubmit={finishEmail}>
    <label>E-mail verificado<input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required maxLength={254} disabled={busy}/></label>
    <label>Senha do e-mail verificado<input type="password" autoComplete="current-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required disabled={busy}/></label>
    <button type="submit" className="be-btn" disabled={busy||!newEmail.trim()||!confirmPassword}>Conferir e sincronizar e-mail</button>
   </form>
  </section>}
  {official&&<section className="be-card be-account-danger">
   <h3>Exclusão da conta</h3>
   <p>A exclusão depende de verificação do servidor. Contas com viagens, vínculos ou histórico protegido recebem conflito HTTP 409 e permanecem preservadas.</p>
   <p className="be-muted">Para contas elegíveis, HTTP 202 significa pedido registrado e processamento remoto pendente. O Firebase pode continuar ativo durante essa etapa. Para consultar retenção e atendimento, visite <Link href="/contato">Contato</Link>.</p>
   <form className="be-form" onSubmit={removeAccount}>
    <label>Digite EXCLUIR<input type="text" autoComplete="off" value={deleteText} onChange={e=>setDeleteText(e.target.value)} required disabled={busy}/></label>
    <label>Senha atual para solicitar a exclusão<input type="password" autoComplete="current-password" value={deletePassword} onChange={e=>setDeletePassword(e.target.value)} required disabled={busy}/></label>
    <button className="be-btn danger" type="submit" disabled={busy||deleteText!=='EXCLUIR'||!deletePassword}>Solicitar exclusão da minha conta</button>
   </form>
  </section>}
 </div>;
}
