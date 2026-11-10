import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const hero = readFileSync(new URL('../app/components/Hero.js', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../app/components/Pricing.js', import.meta.url), 'utf8');
const manager = readFileSync(new URL('../app/gestor/page.js', import.meta.url), 'utf8');

test('hero and interactive route have their layout styles', () => {
  for (const selector of ['.bev-hero{', '.bev-hero-inner{', '.bev-hero-actions{', '.route-demo{', '.route-demo-layout{', '.route-map-canvas{', '.route-control-panel{']) {
    assert.ok(css.includes(selector), `Missing stylesheet rule: ${selector}`);
  }
  assert.match(hero, /className="bev-hero"/);
  assert.match(hero, /<RouteDemo\s*\/>/);
});

test('main marketing and manager sections have defined styles', () => {
  assert.match(pricing, /new-pricing-section/);
  assert.match(manager, /manager-shell/);
  for (const selector of ['.new-pricing-section{', '.new-price-card{', '.manager-page{', '.manager-shell{', '.auth-page{', '.excursions-page{']) {
    assert.ok(css.includes(selector), `Missing stylesheet rule: ${selector}`);
  }
});
