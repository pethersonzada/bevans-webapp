'use client';
import {useCallback,useEffect,useState} from 'react';
import ContaWeb from './ContaWeb';

const json=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const id=x=>{if(!/^[1-9][0-9]*$/.test(String(x))||!Number.isSafeInteger(Number(x)))throw Error('Identificador inválido.');return Number(x);};
const message=e=>e instanceof Error?e.message:'Falha ao consultar configurações.';
export default function ConfiguracoesWeb({api,profile,driver,session,isCurrent,onSessionRotated,onDeletionPending}){
 const [preferencias,setPreferencias]=useState(null),[contato,setContato]=useState(null),[telefone,setTelefone]=useState(''),[habilitado,setHabilitado]=useState(false),[aceite,setAceite]=useState(false);
 const [turmas,setTurmas]=useState([]),[turmaId,setTurmaId]=useState(''),[motorista,setMotorista]=useState(null);
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=useCallback(async()=>{
  setError('');setLoading(true);
  try{
   const [prefs,ct,groups]=await Promise.all([
    api('/notificacoes/preferencias'),
    driver?api('/motorista/contato'):Promise.resolve(null),
    driver?Promise.resolve([]):api('/turmas/usuario/'+id(profile.id)+'/todas')
   ]);
   if(typeof prefs?.pushOperacional!=='boolean'||typeof prefs?.pushInformativo!=='boolean')throw Error('Preferências inválidas.');
   setPreferencias(prefs);
   if(driver){
    if(!ct||!Number.isSafeInteger(ct.versao))throw Error('Configuração de contato inválida.');
    setContato(ct);setTelefone(ct.telefone||'');setHabilitado(ct.habilitado);setAceite(Boolean(ct.consentimentoEm));
   }else{
    if(!Array.isArray(groups))throw Error('Turmas inválidas.');
    setTurmas(groups);
   }
  }catch(e){setError(message(e));}
  finally{setLoading(false);}
 },[api,driver,profile.id]);
 useEffect(()=>{Promise.resolve().then(()=>load());},[load]);
 async function update(task,success){
  if(busy)return;setBusy(true);setError('');setNotice('');
  try{await task();setNotice(success);await load();}catch(e){setError(message(e));}finally{setBusy(false);}
 }
 async function savePrefs(){
  if(!preferencias)return;
  await update(async()=>{
   const r=await api('/notificacoes/preferencias',json('PUT',{pushOperacional:preferencias.pushOperacional,pushInformativo:preferencias.pushInformativo}));
   if(r?.pushOperacional!==preferencias.pushOperacional||r?.pushInformativo!==preferencias.pushInformativo)throw Error('Servidor não confirmou as preferências.');
  },'Preferências atualizadas. Os avisos continuam disponíveis na central.');
 }
 async function saveContact(){
  if(!driver||!contato)return;
  if(habilitado&&!aceite)return setError('Confirme o consentimento explícito para divulgar o número comercial.');
  if(habilitado&&!telefone.trim())return setError('Informe o telefone comercial brasileiro.');
  await update(async()=>{
   const r=await api('/motorista/contato',json('PUT',{telefone:habilitado?telefone:contato.telefone||null,habilitado,aceiteDivulgacao:habilitado&&aceite,versao:contato.versao}));
   if(!r||!Number.isSafeInteger(r.versao)||r.habilitado!==habilitado)throw Error('O servidor não confirmou a alteração do contato.');
  },'Preferência de divulgação atualizada.');
 }
 async function readContact(){
  if(!turmaId)return;
  setError('');setMotorista(null);setBusy(true);
  try{
   const r=await api('/turmas/'+id(turmaId)+'/contato-motorista');
   if(!r?.motoristaId||!r?.waMe||!/^https:\/\/wa\.me\/[0-9]+$/.test(r.waMe))throw Error('Contato comercial indisponível ou inválido.');
   setMotorista(r);
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 return <section className="be-section">
  <div className="be-row"><h2>Configurações da conta</h2><button className="be-btn" type="button" disabled={busy||loading} onClick={load}>Atualizar</button></div>
  <p className="be-muted">Preferências associadas à sua conta autenticada. O recebimento de notificações push no navegador depende de implementação específica e de autorização do navegador.</p>
  {error&&<p className="be-error" role="alert">{error}</p>}{notice&&<p role="status" className="be-alert">{notice}</p>}
  <div className="be-settings-layout">
   <ContaWeb key={profile.id} api={api} session={session} profile={profile} isCurrent={isCurrent} onSessionRotated={onSessionRotated} onDeletionPending={onDeletionPending}/>
   <section className="be-card"><h3>Preferências de notificações</h3>
    {preferencias?<><div className="be-form"><label style={{display:'flex',flexDirection:'row',alignItems:'center',gap:10}}><input type="checkbox" checked={preferencias.pushOperacional} onChange={e=>setPreferencias(p=>({...p,pushOperacional:e.target.checked}))} style={{width:18}}/>Avisos operacionais</label>
     <label style={{display:'flex',flexDirection:'row',alignItems:'center',gap:10}}><input type="checkbox" checked={preferencias.pushInformativo} onChange={e=>setPreferencias(p=>({...p,pushInformativo:e.target.checked}))} style={{width:18}}/>Avisos informativos</label>
    </div><button className="be-btn primary" type="button" disabled={busy} onClick={savePrefs}>Salvar preferências</button>
    <p className="be-muted">Estas opções controlam as preferências no servidor e não registram automaticamente este navegador para push.</p></>:loading?<p role="status">Carregando preferências…</p>:<p className="be-muted">Preferências indisponíveis. Tente atualizar novamente.</p>}
   </section>
   {driver?<section className="be-card"><h3>Contato comercial do motorista</h3><p className="be-muted">O número só aparece para passageiros aprovados quando a divulgação estiver habilitada.</p>
    {!contato&&(loading?<p role="status">Carregando contato…</p>:<p className="be-muted">Contato comercial indisponível. Tente atualizar novamente.</p>)}
    {contato&&<div className="be-form"><label>Telefone comercial<input value={telefone} inputMode="tel" autoComplete="tel" placeholder="+55 (81) 99999-8888" onChange={e=>setTelefone(e.target.value)}/></label>
     <label style={{display:'flex',flexDirection:'row',gap:10,alignItems:'center'}}><input style={{width:18}} type="checkbox" checked={habilitado} onChange={e=>setHabilitado(e.target.checked)}/>Habilitar contato comercial</label>
     <label style={{display:'flex',flexDirection:'row',gap:10,alignItems:'center'}}><input style={{width:18}} type="checkbox" checked={aceite} onChange={e=>setAceite(e.target.checked)}/>Autorizo divulgar este telefone comercial a passageiros aprovados.</label>
     <p className="be-muted">Versão {contato.versao}. Alterações concorrentes são rejeitadas pelo servidor.</p>
     <button type="button" className="be-btn primary" disabled={busy} onClick={saveContact}>Salvar contato</button>
    </div>}
   </section>:<section className="be-card"><h3>Falar com motorista autorizado</h3><p className="be-muted">Somente vínculos aprovados podem consultar o contato comercial habilitado pelo motorista.</p>
    <div className="be-fieldset"><label>Turma<select value={turmaId} onChange={e=>{setTurmaId(e.target.value);setMotorista(null);}}><option value="">Selecione</option>{turmas.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></label>
     <button type="button" className="be-btn" disabled={!turmaId||busy} onClick={readContact}>Consultar contato</button></div>
    {motorista&&<div className="be-item"><strong>{motorista.nome}</strong><p>{motorista.telefoneComercial}</p><a href={motorista.waMe} target="_blank" rel="noopener noreferrer" className="be-btn primary">Abrir WhatsApp</a></div>}
   </section>}
  </div>
 </section>;
}
