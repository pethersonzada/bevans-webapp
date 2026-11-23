import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ler=caminho=>readFileSync(new URL('../'+caminho,import.meta.url),'utf8');

test('assistente nativo é montado no layout raiz e responde pelo próprio site',()=>{
 const layout=ler('app/layout.js');
 const componente=ler('app/components/AssistenteFlutuante.jsx');
 assert.match(layout,/import AssistenteFlutuante/);
 assert.match(layout,/<AssistenteFlutuante\s*\/>/);
 assert.match(componente,/fetch\('\/api\/assistente'/);
 assert.doesNotMatch(componente,/iframe|Streamlit|OPENAI_API_KEY|firebase_uid|Bearer\s|localStorage|sessionStorage/);
});

test('janela abre por botão e página /assistente, com histórico até nova conversa',()=>{
 const componente=ler('app/components/AssistenteFlutuante.jsx');
 assert.match(componente,/setIniciado\(true\)/);
 assert.match(componente,/\{iniciado&&<section/);
 assert.match(componente,/hidden=\{!aberto\}/);
 assert.match(componente,/bevans:abrir-assistente/);
 assert.match(componente,/aria-label=\{aberto\?'Fechar assistente BeVans':'Abrir assistente BeVans'\}/);
 assert.match(componente,/key==='Escape'/);
 assert.match(componente,/document\.body\.style\.overflow/);
 assert.match(componente,/role="dialog"/);
 assert.match(componente,/Nova conversa/);
 assert.match(componente,/onSubmit=\{aoEnviar\}/);
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

test('nova conversa invalida resposta pendente e erro recupera a mensagem não enviada',()=>{
 const componente=ler('app/components/AssistenteFlutuante.jsx');
 assert.match(componente,/if\(envioRef\.current!==controller\)return/);
 assert.match(componente,/envioRef\.current===controller/);
 assert.match(componente,/setMensagens\(atual=>atual\.filter\(m=>m\.id!==id\)\)/);
 assert.match(componente,/setPergunta\(valor\)/);
});
