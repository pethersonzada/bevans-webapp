import Link from 'next/link';
import Image from 'next/image';

const logo = 'https://raw.githubusercontent.com/pethersonzada/bevans-frontend/main/assets/images/logo-app-sem-fundo-sem-titulo.png';

export default function AuthShell({mode='login'}){
 const signup=mode==='signup';
 return <main id="conteudo" className="auth-page">
  <div className="auth-brand-panel"><div className="auth-brand-top"><Link href="/" className="auth-wordmark">be<span>vans</span><b>.</b></Link><span>BEVANS / ACCOUNT</span></div><div className="auth-brand-center"><div className="auth-brand-symbol">↗</div><span>SEU CAMINHO, MAIS CONECTADO</span><h1>Um lugar para<br/>todas as suas<br/><em>jornadas.</em></h1><p>Transporte escolar, universitário e excursões: uma experiência planejada para evoluir junto com você.</p></div><div className="auth-brand-bottom">BEVANS © 2026 <span>PLATAFORMA EM DESENVOLVIMENTO</span></div></div>
  <div className="auth-form-panel"><div className="auth-form-top"><Link href="/" className="auth-home">← Início</Link><span>ÁREA DE CONTA · PRÉVIA</span></div>
   <div className="auth-form-inner"><div className="auth-form-logo"><Image src={logo} width={64} height={64} alt="Logo BeVans"/></div><span className="auth-overline">{signup?'NOVA CONTA':'BEM-VINDO DE VOLTA'}</span><h2>{signup?'Comece sua jornada.':'Entre no seu espaço.'}</h2><p>{signup?'Explore como será o cadastro web do BeVans.':'Conheça o visual da futura área de acesso à plataforma.'}</p>
    <div className="auth-demo-warning" role="status"><strong>Prévia de interface</strong><span>O cadastro e o login ainda não estão conectados. Nenhuma senha ou dado pessoal será solicitado nesta demonstração.</span></div>
    <div className="auth-skeleton-fields" aria-hidden="true"><div className="auth-fake-label">{signup?'NOME COMPLETO':'E-MAIL'}</div><div className="auth-fake-input">{signup?'Seu nome completo':'seu@email.com'}</div><div className="auth-fake-label">{signup?'E-MAIL':'SENHA'}</div><div className="auth-fake-input">{signup?'seu@email.com':'••••••••'}</div>{signup&&<><div className="auth-fake-label">PERFIL</div><div className="auth-fake-input">Passageiro ou motorista</div></>}</div>
    <div className="auth-locked-button"> {signup?'Criar conta · Em breve':'Acessar conta · Em breve'} <span>↗</span></div>
    <p className="auth-switch">{signup?'Já conhece o BeVans?':'Novo por aqui?'} <Link href={signup?'/login':'/cadastro'}>{signup?'Visualizar login':'Visualizar cadastro'}</Link></p>
    <div className="auth-links"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos de uso</Link><Link href="/gestor">Painel do gestor</Link></div>
   </div>
  </div>
 </main>;
}