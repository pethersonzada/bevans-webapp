import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {URL_ASSISTENTE,URL_ASSISTENTE_EMBUTIDO} from '../app/lib/assistente.mjs';

const ler=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('assistente utiliza exclusivamente a origem pública do Streamlit com embed',()=>{
 const direto=new URL(URL_ASSISTENTE),embed=new URL(URL_ASSISTENTE_EMBUTIDO);
 assert.equal(direto.protocol,'https:');
 assert.equal(direto.hostname,'bevans-suporte.streamlit.app');
 assert.equal(embed.origin,direto.origin);
 assert.equal(embed.pathname,'/');
 assert.equal(embed.searchParams.get('embed'),'true');
 assert.equal([...embed.searchParams.keys()].length,1);
});

test('página incorpora o serviço externo sem expor autenticação nem criar API de chat',()=>{
 const pagina=ler('app/assistente/page.js');
 assert.match(pagina,/URL_ASSISTENTE_EMBUTIDO/);
 assert.match(pagina,/title="Conversa com o Assistente BeVans"/);
 assert.match(pagina,/referrerPolicy="no-referrer"/);
 assert.match(pagina,/sandbox="allow-scripts allow-same-origin allow-forms/);
 assert.match(pagina,/rel="noopener noreferrer"/);
 assert.match(pagina,/id="conteudo"/);
 assert.doesNotMatch(pagina,/OPENAI_API_KEY|NEXT_PUBLIC_BEVANS_FIREBASE|Authorization:|Bearer\s/);
});

test('links públicos ficam disponíveis na navegação e no rodapé',()=>{
 const menu=ler('app/components/Navbar.js');
 const rodape=ler('app/components/Footer.js');
 assert.match(menu,/label: 'Assistente', href: '\/assistente'/);
 assert.match(rodape,/<Link href="\/assistente">Assistente<\/Link>/);
 assert.match(ler('app/assistente/page.js'),/canonical:'\/assistente'/);
});
