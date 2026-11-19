import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('login visível no cabeçalho e no destaque inicial',()=>{assert.match(read('app/components/Navbar.js'),/href="\/login" className="button button-dark nav-login-cta"/);assert.match(read('app/components/Hero.js'),/href="\/login"/);});
test('cadastro público não tem formulário nem link de criar conta',()=>{assert.doesNotMatch(read('app/cadastro/page.js'),/<form|firebaseSignUp/);for(const file of ['app/components/Navbar.js','app/components/Footer.js','app/components/Hero.js'])assert.doesNotMatch(read(file),/href="\/cadastro"/);});
test('login oferece mostrar senha e recuperação explícita',()=>{const s=read('app/painel/AuthEntry.jsx');assert.match(s,/firebasePasswordReset/);assert.match(s,/Mostrar senha/);assert.match(s,/Esqueci minha senha/);});
