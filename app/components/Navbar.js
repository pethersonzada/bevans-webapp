'use client';

import Image from 'next/image';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const navigation = [
  { label: 'Funcionalidades', href: '/#funcionalidades' },
  { label: 'Para quem é', href: '/#beneficios' },
  { label: 'Modalidades', href: '/#precos' },
  { label: 'Excursões', href: '/excursoes' },
  { label: 'Dúvidas', href: '/#faq' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={'site-header ' + (scrolled || open ? 'site-header--scrolled' : '')}>
      <nav className="site-nav container" aria-label="Navegação principal">
        <Link href="/" className="brand" aria-label="BeVans, ir para o início" onClick={() => setOpen(false)}>
          <span className="brand-icon"><Image src="/images/bevans-original.png" alt="" width="43" height="43" priority /></span>
          <span className="brand-name">BeVans</span>
        </Link>

        <div className="nav-links">
          {navigation.map((item) => item.href === '/excursoes' ? <a key={item.href} href={item.href}>{item.label}</a> : <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </div>

        <div className="nav-actions">
          <a className="button button-dark nav-cta" href="/contato">Entrar em contato <span aria-hidden="true">↗</span></a>
          <button type="button" className="menu-toggle" onClick={() => setOpen(!open)}
            aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Fechar menu' : 'Abrir menu'}>
            <span className={open ? 'menu-bars is-open' : 'menu-bars'}><i></i><i></i><i></i></span>
          </button>
        </div>
      </nav>

      <div className="mobile-nav" id="mobile-navigation" hidden={!open} aria-label="Navegação para dispositivos móveis">
        {navigation.map((item) => item.href === '/excursoes' ? <a key={item.href} href={item.href}>{item.label}</a> : <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
        <a href="/contato" className="button button-yellow">Entrar em contato ↗</a>
      </div>
    </header>
  );
}