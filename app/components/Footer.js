import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return <footer className="site-footer">
    <div className="container">
      <div className="footer-cta"><div><span className="section-label"><span/> SEU PRÓXIMO PASSO</span><h2>O futuro da sua rota<br />começa <em>por aqui.</em></h2><p>Vamos conversar sobre como organizar melhor sua operação?</p><Link href="/contato" className="button button-yellow button-large">Vamos conversar <span aria-hidden="true">↗</span></Link></div><div className="footer-cta-art" aria-hidden="true"><div className="art-loop art-loop-one"/><div className="art-loop art-loop-two"/><div className="art-dot dot-a"/><div className="art-dot dot-b"/><span className="art-arrow">↗</span></div></div>
      <div className="footer-main"><div><Link href="/" className="footer-logo-wrap footer-logo" aria-label="BeVans, voltar ao início"><Image src="https://raw.githubusercontent.com/pethersonzada/bevans-frontend/main/assets/images/logo-app-sem-fundo-sem-titulo.png" alt="" width="52" height="52" className="footer-logo-image" /><span>BeVans<b>.</b></span></Link><p>Mais tranquilidade em cada caminho.</p></div><div className="footer-columns"><div><strong>Explore</strong><Link href="/#funcionalidades">Funcionalidades</Link><Link href="/#beneficios">Para quem é</Link><Link href="/#precos">Planos</Link><Link href="/excursoes">Excursões</Link></div><div><strong>BeVans</strong><Link href="/contato">Contato</Link><Link href="/login">Entrar</Link><Link href="/cadastro">Criar conta</Link><Link href="/termos">Termos de uso</Link><Link href="/privacidade">Privacidade</Link></div></div></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} BeVans. Todos os direitos reservados.</span><span>Feito por Miguel Petherson, Maria Rafaela, Arthur Almeida e Yalle Rívika.</span></div>
    </div>
  </footer>;
}