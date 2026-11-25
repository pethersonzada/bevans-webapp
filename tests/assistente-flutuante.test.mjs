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

test('atalho do assistente fica compacto e separado do tema no celular',()=>{
 const css=ler('app/components/assistente-flutuante.css');
 const mobile=css.slice(css.indexOf('/* No celular, o atalho não deve encobrir'));
 assert.match(mobile,/@media\(max-width:800px\)/);
 assert.match(mobile,/left:12px;right:auto/);
 assert.match(mobile,/width:52px;height:52px/);
 assert.match(mobile,/border-radius:16px/);
 assert.match(mobile,/\.bev-chat-launcher span\{display:none\}/);
 const tema=ler('app/theme.css');
 assert.match(tema,/\.experience-intro h2\{[\s\S]*?white-space:normal;overflow-wrap:break-word;text-wrap:wrap/);
 assert.match(tema,/\.bev-theme-toggle\{[\s\S]*?width:52px;height:52px/);
 assert.match(tema,/bottom:calc\(16px \+ env\(safe-area-inset-bottom,0px\)\)/);
 const espaco=ler('app/globals-access.css');
 assert.match(espaco,/\.bev-hero-inner\{[\s\S]*?padding-bottom:48px/);
 assert.match(espaco,/\.experience-section\{[\s\S]*?padding-top:60px/);
});
