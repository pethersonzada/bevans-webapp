import Link from 'next/link';
import Image from 'next/image';

const logo='/images/bevans-logo-clean.png';

const phases=[
 ['Identidade','Autenticação e recuperação de acesso'],
 ['Perfil','Passageiro e motorista com permissões distintas'],
 ['Operação','Acesso aos dados autorizados de cada turma'],
];

export default function AuthShell({mode='login'}){
 const signup=mode==='signup';
 return <main id="conteudo" className="access-page">
  <section className="access-story"><div className="access-story-top"><Link href="/" className="access-mark">BeVans</Link><span>IDENTIDADE / ACESSO</span></div><div className="access-story-content"><span className="access-kicker">UMA PLATAFORMA, VÁRIOS CAMINHOS</span><h1>O seu trajeto<br/>começa com<br/><em>segurança.</em></h1><p>O app mobile já possui perfis de passageiro e motorista. A versão web seguirá a mesma lógica de autenticação e autorização.</p><div className="access-story-tags"><span>Motorista</span><span>Passageiro</span><span>Turmas</span></div></div><p className="access-story-foot">BEVANS / CONEXÕES QUE MOVEM</p></section>
  <section className="access-main"><div className="access-top"><Link href="/" className="access-back">← Voltar ao site</Link><span>INTERFACE CONCEITUAL</span></div><div className="access-content"><Image src={logo} alt="Logo do BeVans" width={72} height={72}/><span className="access-kicker">{signup?'CRIAÇÃO DE CONTA':'ACESSO À CONTA'}</span><h2>{signup?'A próxima etapa começa aqui.':'Bem-vindo ao seu espaço.'}</h2><p>{signup?'O cadastro web está sendo preparado para respeitar os perfis e as regras de acesso do aplicativo.':'O futuro acesso web permitirá visualizar apenas as informações permitidas ao seu perfil.'}</p><div className="access-notice"><strong>Integração ainda não ativada</strong><span>Para sua segurança, esta página não coleta nome, e-mail ou senha. O login e o cadastro serão conectados quando validarmos o ambiente e os contratos da API.</span></div><div className="access-roadmap"><span>COMO O ACESSO SERÁ ESTRUTURADO</span>{phases.map(([title,description],i)=><div key={title}><span>0{i+1}</span><div><strong>{title}</strong><small>{description}</small></div></div>)}</div><div className="access-actions"><Link href={signup?'/login':'/cadastro'}>{signup?'Visualizar a entrada':'Visualizar o cadastro'} ↗</Link><Link href="/excursoes">Conhecer excursões</Link></div><p className="access-privacy">Nenhuma credencial é solicitada nesta versão. <Link href="/privacidade">Saiba mais sobre privacidade.</Link></p></div></section>
 </main>;
}