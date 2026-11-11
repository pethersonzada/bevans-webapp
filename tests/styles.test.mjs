import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const css = read('app/globals.css');

test('homepage hero and driver/passenger experience have layout styles', () => {
  const hero = read('app/components/Hero.js');
  const experience = read('app/components/Experience.js');
  const page = read('app/page.js');
  for (const selector of ['.bev-hero{', '.bev-hero-inner{', '.bev-hero-actions{', '.experience-section{', '.experience-grid{', '.experience-card{', '.experience-step{']) {
    assert.ok(css.includes(selector), 'Missing stylesheet rule: ' + selector);
  }
  assert.match(hero, /className="bev-hero"/);
  assert.match(hero, /href="\/#experiencia"/);
  assert.match(page, /<Experience\s*\/>/);
  assert.match(experience, /id="experiencia"/);
  assert.match(experience, /Motorista/);
  assert.match(experience, /Passageiro/);
  assert.doesNotMatch(hero, /RouteDemo/);
  assert.equal(existsSync(new URL('../app/components/RouteDemo.js', import.meta.url)), false);
});

test('marketing and public pages retain their styles', () => {
  const pricing = read('app/components/Pricing.js');
  const excursions = read('app/excursoes/page.js');
  const access = read('app/components/AuthShell.js');
  const contact = read('app/contato/page.js');
  for (const selector of ['.new-pricing-section{', '.new-price-card{', '.access-page{', '.exp-grid{', '.exp-step-grid{', '.reach-layout{', '.reach-form{']) {
    assert.ok(css.includes(selector), `Missing stylesheet rule: ${selector}`);
  }
  assert.match(pricing, /new-pricing-section/);
  assert.match(excursions, /exp-grid/);
  assert.match(access, /access-page/);
  assert.match(contact, /reach-layout/);
});

test('removed administrator preview has no live references', () => {
  assert.equal(existsSync(new URL('../app/gestor/page.js', import.meta.url)), false);
  assert.equal(existsSync(new URL('../app/components/ManagerPreview.js', import.meta.url)), false);
  for (const path of ['app/components/Navbar.js', 'app/components/Footer.js', 'app/components/Pricing.js', 'app/components/AuthShell.js', 'app/contato/page.js', 'app/components/Faq.js']) {
    assert.doesNotMatch(read(path), /\/gestor(?:["'?/]|$)/);
  }
});

test('original blue palette is retained with petroleum brand surfaces', () => {
  assert.match(css, /--brand-petrol:#14253A/);
  assert.match(css, /\.site-footer,\.button-dark,\.nav-cta,\.experience-card-driver,\.exp-hero,\.exp-ending\{background-color:#14253A\}/);
  assert.match(css, /#007[Bb][Ff][Ff]/);
  assert.match(css, /#00[Dd]2[Ff][Ff]/);
  assert.doesNotMatch(css,/official BeVans visual identity: Oceano/);
});

test('blue accents replace mint while petroleum remains the base', () => {
  assert.match(css, /--identity-petroleum:#14253A/);
  assert.match(css, /--identity-blue:#73B9FF/);
  assert.match(css, /--identity-blue-strong:#007BFF/);
  assert.match(css, /\.button-yellow,\.bev-button-primary,\.new-price-action\.is-highlighted[^\n]*\{background:#007BFF;color:#fff/);
  assert.doesNotMatch(css, /#6FD6BD|#6fd6bd/i);
});
