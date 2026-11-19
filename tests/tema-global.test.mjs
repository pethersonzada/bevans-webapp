import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('tema global tem preferência persistente e suporta configuração do sistema',()=>{
 const component=read('app/components/ThemeToggle.jsx');
 const layout=read('app/layout.js');
 assert.match(component,/localStorage\.setItem\('bevans-theme'/);
 assert.match(component,/aria-pressed=\{dark\}/);
 assert.match(component,/Ativar modo escuro/);
 assert.match(component,/Ativar modo claro/);
 assert.match(layout,/ThemeToggle/);
 assert.match(layout,/prefers-color-scheme: dark/);
 assert.match(layout,/suppressHydrationWarning/);
});
test('tema escuro cobre página pública, login e painel',()=>{
 const css=read('app/theme.css');
 assert.match(css,/html\[data-theme="dark"\] \.be-auth-story/);
 assert.match(css,/html\[data-theme="dark"\] :is\(\.be-sidebar/);
 assert.match(css,/html\[data-theme="dark"\] :is\(\.site-header/);
 assert.match(css,/:focus-visible/);
});

test('tema se sincroniza sem estado React atualizado diretamente no efeito',()=>{
 const component=read('app/components/ThemeToggle.jsx');
 assert.match(component,/useSyncExternalStore/);
 assert.match(component,/bevans-theme-change/);
 assert.equal(component.includes('setTheme('),false);
});
