import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path,root),'utf8');

test('menu links lead to existing public pages',()=>{
  const navbar=read('app/components/Navbar.js');
  assert.ok(existsSync(new URL('app/excursoes/page.js',root)));
  assert.ok(existsSync(new URL('app/contato/page.js',root)));
  assert.match(navbar, /label: 'Excursões', href: '\/excursoes'/);
  assert.match(navbar, /href="\/contato"/);
  assert.match(navbar, /href=\{item.href\}/);
  assert.match(navbar, /<a key=\{item.href\} href=\{item.href\}/);
});

test('excursion contact CTA routes to contact with prefilled subject',()=>{
  const excursions=read('app/excursoes/page.js');
  const form=read('app/components/ContactForm.js');
  assert.match(excursions,/href="\/contato\?assunto=excursoes"/);
  assert.match(form,/subject === 'excursoes'/);
});

test('direct navigation works without hydration for public actions',()=>{
  const navbar=read('app/components/Navbar.js');
  assert.match(navbar,/<a className="button button-dark nav-cta" href="\/contato">/);
  assert.match(navbar,/<a href="\/contato" className="button button-yellow">/);
  assert.match(navbar,/item\.href === '\/excursoes' \? <a/);
});


test('mobile navigation stays hidden until opened', () => {
  const navbar=read('app/components/Navbar.js');
  const css=read('app/globals.css');
  assert.match(navbar, /hidden=\{!open\}/);
  assert.match(css, /\.mobile-nav\[hidden\]\{display:none!important\}/);
});

test('product modalities and contact match planned status', () => {
  const pricing=read('app/components/Pricing.js');
  const form=read('app/components/ContactForm.js');
  assert.match(pricing, /Gestão de frotas/);
  assert.match(pricing, /EM DESENVOLVIMENTO/);
  assert.match(pricing, /EVOLUÇÃO FUTURA/);
  assert.doesNotMatch(pricing, /R\$\s*79|R\$\s*249/);
  assert.match(form, /subject === 'Gestão de frotas'/);
});

test('sitemap and robots always list the public routes', () => {
  const sitemap=read('app/sitemap.js');
  const robots=read('app/robots.js');
  assert.match(sitemap, /https:\/\/bevans-webapp\.vercel\.app/);
  assert.match(robots, /\/sitemap\.xml/);
});


test('brand wordmark has no trailing colored dot and logos suit each background', () => {
  const navbar=read('app/components/Navbar.js');
  const footer=read('app/components/Footer.js');
  const auth=read('app/components/AuthShell.js');
  const layout=read('app/layout.js');
  assert.ok(existsSync(new URL('public/images/bevans-symbol.svg',root)));
  assert.ok(existsSync(new URL('public/images/bevans-symbol-footer.svg',root)));
  assert.match(navbar, /\/images\/bevans-symbol\.svg/);
  assert.match(footer, /\/images\/bevans-symbol-footer\.svg/);
  assert.match(auth, /\/images\/bevans-symbol\.svg/);
  assert.match(layout, /\/images\/bevans-symbol\.svg/);
  assert.match(navbar, /className="brand-name">BeVans<\/span>/);
  assert.match(footer, /<span>BeVans<\/span>/);
  assert.doesNotMatch(navbar, /brand-dot/);
  assert.doesNotMatch(footer, /BeVans<b>/);
  assert.doesNotMatch(auth, /BeVans<span>\.<\/span>/);
});
