import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const hero = readFileSync(new URL('../app/components/Hero.js', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../app/components/Pricing.js', import.meta.url), 'utf8');
const manager = readFileSync(new URL('../app/components/ManagerPreview.js', import.meta.url), 'utf8');

test('hero and interactive route have their layout styles', () => {
  for (const selector of ['.bev-hero{', '.bev-hero-inner{', '.bev-hero-actions{', '.route-demo{', '.route-demo-layout{', '.route-map-canvas{', '.route-control-panel{']) {
    assert.ok(css.includes(selector), `Missing stylesheet rule: ${selector}`);
  }
  assert.match(hero, /className="bev-hero"/);
  assert.match(hero, /<RouteDemo\s*\/>/);
});

test('main marketing and manager sections have defined styles', () => {
  assert.match(pricing, /new-pricing-section/);
  assert.match(manager, /ops-shell/);
  for (const selector of ['.new-pricing-section{', '.new-price-card{', '.ops-page{', '.ops-shell{', '.auth-page{', '.excursions-page{']) {
    assert.ok(css.includes(selector), `Missing stylesheet rule: ${selector}`);
  }
});

test('product-aligned pages include their stylesheet rules', () => {
  const manager = readFileSync(new URL('../app/components/ManagerPreview.js', import.meta.url), 'utf8');
  const excursions = readFileSync(new URL('../app/excursoes/page.js', import.meta.url), 'utf8');
  const access = readFileSync(new URL('../app/components/AuthShell.js', import.meta.url), 'utf8');
  const contact = readFileSync(new URL('../app/contato/page.js', import.meta.url), 'utf8');
  for (const selector of ['.ops-shell{', '.ops-layout{', '.access-page{', '.exp-grid{', '.exp-step-grid{', '.reach-layout{', '.reach-form{']) {
    assert.ok(css.includes(selector), `Missing product stylesheet rule: ${selector}`);
  }
  assert.match(manager, /ops-shell/);
  assert.match(excursions, /exp-grid/);
  assert.match(access, /access-page/);
  assert.match(contact, /reach-layout/);
});
