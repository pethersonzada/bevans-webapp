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
  assert.match(css, /--brand-petrol:#143B49/);
  assert.match(css, /\.site-footer,\.button-dark,\.nav-cta,\.experience-card-driver,\.exp-hero,\.exp-ending\{background-color:#143B49\}/);
  assert.match(css, /#007[Bb][Ff][Ff]/);
  assert.match(css, /#00[Dd]2[Ff][Ff]/);
  assert.doesNotMatch(css,/official BeVans visual identity: Oceano/);
});

test('design trial uses the official logo palette for primary surfaces and accents', () => {
  for (const token of ['--identity-ocean:#0B2530','--identity-petroleum:#143B49','--identity-mint:#6FD6BD','--identity-ice:#F6F7F5']) {
    assert.ok(css.includes(token), 'Missing identity token: ' + token);
  }
  assert.match(css, /\.bev-hero \{background:linear-gradient/);
  assert.match(css, /\.bev-button-primary \{background:var\(--identity-mint\)/);
  assert.match(css, /\.feature-icon \{background:#e5f5ee/);
  assert.match(css, /\.experience-card-driver \{background:var\(--identity-petroleum\)/);
});
