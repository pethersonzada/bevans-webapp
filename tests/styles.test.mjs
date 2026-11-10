import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const css = read('app/globals.css');

test('hero and interactive route have their layout styles', () => {
  const hero = read('app/components/Hero.js');
  for (const selector of ['.bev-hero{', '.bev-hero-inner{', '.bev-hero-actions{', '.route-demo{', '.route-demo-layout{', '.route-map-canvas{', '.route-control-panel{']) {
    assert.ok(css.includes(selector), `Missing stylesheet rule: ${selector}`);
  }
  assert.match(hero, /className="bev-hero"/);
  assert.match(hero, /<RouteDemo\s*\/>/);
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
