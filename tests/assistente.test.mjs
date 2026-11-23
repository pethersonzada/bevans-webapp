import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ler=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('página do assistente abre a conversa integrada e não direciona para Streamlit',()=>{
 const pagina=ler('app/assistente/page.js');
 const botao=ler('app/assistente/BotaoAbrirAssistente.jsx');
 assert.match(pagina,/BotaoAbrirAssistente/);
 assert.match(pagina,/id="conteudo"/);
 assert.match(pagina,/canonical:'\/assistente'/);
 assert.match(botao,/bevans:abrir-assistente/);
 assert.doesNotMatch(pagina,/iframe|streamlit\.app|URL_ASSISTENTE_EMBUTIDO/);
});

test('API interna do BeVans responde sem solicitar segredo ao navegador',()=>{
 const api=ler('app/api/assistente/route.js');
 const cliente=ler('app/components/AssistenteFlutuante.jsx');
 assert.match(api,/export async function POST/);
 assert.match(api,/validarConversa/);
 assert.match(api,/responderPeloFaq/);
 assert.match(api,/BEVANS_ASSISTENTE_IA/);
 assert.match(api,/OPENAI_API_KEY/);
 assert.match(cliente,/fetch\('\/api\/assistente'/);
 assert.doesNotMatch(cliente,/OPENAI_API_KEY|Authorization:|Bearer\s|iframe|streamlit\.app/);
});

test('links do assistente continuam acessíveis no menu público e no rodapé',()=>{
 const menu=ler('app/components/Navbar.js');
 const rodape=ler('app/components/Footer.js');
 assert.match(menu,/label: 'Assistente', href: '\/assistente'/);
 assert.match(rodape,/<Link href="\/assistente">Assistente<\/Link>/);
});
