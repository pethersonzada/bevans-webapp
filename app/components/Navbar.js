'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { label: 'Funcionalidades', href: '/#funcionalidades' },
  { label: 'Para quem é', href: '/#beneficios' },
  { label: 'Planos', href: '/#precos' },
  { label: 'Dúvidas', href: '/#faq' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={'site-header ' + (scrolled || open ? 'site-header--scrolled' : '')}>
      <nav className="site-nav container" aria-label="Navegação principal">
        <Link href="/" className="brand" aria-label="VanBora, ir para o início" onClick={() => setOpen(false)}>
          <span className="brand-icon"><Image src="/images/logo-app-icon.png" alt="" width={36} height={36} priority /></span>
          <span className="brand-name">van<span>bora</span><span className="brand-dot">.</span></span>
        </Link>

        <div className="nav-links">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </div>

        <div className="nav-actions">
          <Link className="nav-login" href="/gestor">Área do gestor</Link>
          <Link className="button button-dark nav-cta" href="/contato">Agendar uma conversa <span aria-hidden="true">↗</span></Link>
          <button type="button" className="menu-toggle" onClick={() => setOpen(!open)}
            aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Fechar menu' : 'Abrir menu'}>
            <span className={open ? 'menu-bars is-open' : 'menu-bars'}><i></i><i></i><i></i></span>
          </button>
        </div>
      </nav>

      {open && <div className="mobile-nav" id="mobile-navigation">
        {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
        <Link href="/gestor" onClick={() => setOpen(false)}>Área do gestor</Link>
        <Link href="/contato" onClick={() => setOpen(false)} className="button button-yellow">Agendar uma conversa ↗</Link>
      </div>}
    </header>
  );
}