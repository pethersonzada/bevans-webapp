import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const css=read('app/theme.css');
const luminance=hex=>{
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  return rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
    .reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
};
const contrast=(a,b)=>{
  const [light,dark]=[luminance(a),luminance(b)].sort((x,y)=>y-x);
  return (light+.05)/(dark+.05);
};
test('novas cores têm contraste WCAG AA com seus fundos',()=>{
  for(const [ink,bg] of [
    ['#a7d5ff','#101e2e'],['#86c6ff','#101e2e'],
    ['#c3d3e5','#17283c'],['#c5d7eb','#16283b'],
    ['#edf5ff','#101e2e'],['#c0d1e2','#16283b'],
    ['#9ed0ff','#29445f'],
  ]) assert.ok(contrast(ink,bg)>=4.5,`${ink} não atende AA sobre ${bg}`);
});
test('dark corrige títulos destacados, rótulos, FAQ e modalidades',()=>{
  for(const selector of ['.new-pricing-head h2 em','.faq-layout h2 span','.audience-intro h2 span','.section-label','.experience-intro h2 em','.new-price-card .new-price-lead','.faq-item p','.new-price-card .new-price-action']) {
    assert.ok(css.includes(selector),`Seletor ausente: ${selector}`);
  }
  assert.match(css,/html\[data-theme="dark"\] \.faq-item\[open\]/);
  assert.match(css,/html\[data-theme="dark"\] \.new-price-featured/);
});
test('logo oficial com arquivos corretos para claro e escuro',()=>{
  const navbar=read('app/components/Navbar.js');
  const auth=read('app/painel/AuthEntry.jsx');
  for(const path of ['public/images/vetor-tema-claro.png','public/images/vetor-tema-escuro.png','public/images/bevans-logo-oficial-branco.png'])assert.ok(existsSync(new URL(path,root)));
  for(const content of [navbar,auth]){
    assert.match(content,/be-brand-light/);
    assert.match(content,/be-brand-dark/);
  }
  assert.match(auth,/be-sidebar-brand/);
  assert.match(auth,/bevans-logo-oficial-branco\.png/);
  assert.match(css,/html\[data-theme="dark"\] \.be-brand-dark/);
  assert.doesNotMatch(css,/filter:brightness\(0\) invert\(1\)/);
});
test('modalidades apresentam o estágio uma única vez, sem faixa decorativa',()=>{
  const pricing=read('app/components/Pricing.js');
  assert.match(pricing,/new-price-top/);
  assert.match(pricing,/DISPONÍVEL NO APP/);
  assert.match(pricing,/FLUXO OPERACIONAL DISPONÍVEL/);
  assert.match(pricing,/EVOLUÇÃO FUTURA/);
  assert.doesNotMatch(pricing,/new-price-status-dot|new-price-availability/);
  assert.match(pricing,/Modalidades do BeVans/);
});
