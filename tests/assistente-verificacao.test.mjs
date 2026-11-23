import test from 'node:test';
import assert from 'node:assert/strict';
import {validarPaginaAssistente,validarRespostaChat} from '../app/lib/assistente-verificacao.mjs';

test('página pública deve expor entrada do chat nativo, sem iframe do Streamlit',()=>{
 const html='<main><h1>Seu espaço para tirar dúvidas sobre o BeVans</h1><button>Iniciar conversa no BeVans</button></main>';
 assert.equal(validarPaginaAssistente({status:200,html}),true);
 assert.throws(()=>validarPaginaAssistente({status:404,html}),/HTTP 200/);
 assert.throws(()=>validarPaginaAssistente({status:200,html:'Não disponível'}),/acesso/);
 assert.throws(()=>validarPaginaAssistente({status:200,html:html+'bevans-suporte.streamlit.app/?embed=true'}),/embute/);
});

test('endpoint público responde em JSON pelo próprio domínio',()=>{
 const base={status:200,tipo:'application/json; charset=utf-8',dados:{resposta:'Veja o FAQ do BeVans.',modo:'faq'}};
 assert.equal(validarRespostaChat(base),true);
 assert.throws(()=>validarRespostaChat({...base,status:502}),/HTTP 200/);
 assert.throws(()=>validarRespostaChat({...base,tipo:'text/html'}),/JSON/);
 assert.throws(()=>validarRespostaChat({...base,dados:{resposta:'',modo:'faq'}}),/contrato/);
});
