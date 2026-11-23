import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {URL_ASSISTENTE,URL_ASSISTENTE_EMBUTIDO} from '../app/lib/assistente.mjs';

const ler=caminho=>readFileSync(new URL('../'+caminho,import.meta.url),'utf8');

test('assistente global é montado no layout raiz e usa o Streamlit oficial',()=>{
 const layout=ler('app/layout.js');
 const componente=ler('app/components/AssistenteFlutuante.jsx');
 assert.match(layout,/import AssistenteFlutuante/);
 assert.match(layout,/<AssistenteFlutuante\s*\/>/);
 assert.match(componente,/URL_ASSISTENTE_EMBUTIDO/);
 assert.equal(new URL(URL_ASSISTENTE_EMBUTIDO).origin,new URL(URL_ASSISTENTE).origin);
 assert.match(componente,/referrerPolicy="no-referrer"/);
 assert.match(componente,/sandbox="allow-scripts allow-same-origin allow-forms/);
 assert.doesNotMatch(componente,/OPENAI_API_KEY|firebase_uid|Bearer\s|localStorage|sessionStorage/);
});

test('iframe somente nasce após abertura e permanece entre fechamentos',()=>{
 const componente=ler('app/components/AssistenteFlutuante.jsx');
 assert.match(componente,/setIniciado\(true\)/);
 assert.match(componente,/\{iniciado&&<section/);
 assert.match(componente,/hidden=\{!aberto\}/);
 assert.match(componente,/aria-label=\{aberto\?'Fechar assistente BeVans':'Abrir assistente BeVans'\}/);
 assert.match(componente,/key==='Escape'/);
 assert.match(componente,/document\.body\.style\.overflow/);
 assert.match(componente,/role="dialog"/);
 assert.match(componente,/Abrir no Streamlit/);
});

test('tema claro e escuro, acessibilidade e versão móvel possuem estilos independentes',()=>{
 const css=ler('app/components/assistente-flutuante.css');
 assert.match(css,/\.bev-chat-launcher/);
 assert.match(css,/\.bev-chat-panel\[hidden\]/);
 assert.match(css,/@media\(max-width:800px\)/);
 assert.match(css,/body:has\(\.be-app\) \.bev-chat-launcher/);
 assert.match(css,/env\(safe-area-inset-bottom/);
 assert.match(css,/html\[data-theme="dark"\]/);
 assert.match(css,/:focus-visible/);
});
