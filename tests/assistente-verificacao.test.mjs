import test from 'node:test';
import assert from 'node:assert/strict';
import {validarRespostaStreamlit,validarPaginaPublica} from '../app/lib/assistente-verificacao.mjs';

const base={status:200,url:'https://bevans-suporte.streamlit.app/?embed=true',tipo:'text/html; charset=utf-8',html:'<!doctype html><html><div id="root">streamlit</div></html>'};

test('aceita a origem pública do Streamlit sem bloqueio de framing',()=>{
 assert.equal(validarRespostaStreamlit(base).permiteIncorporacaoPorCabecalhos,true);
 assert.equal(validarRespostaStreamlit({...base,csp:"default-src 'self'; frame-ancestors https://bevans-webapp.vercel.app"}).status,200);
});
test('recusa X-Frame-Options e frame-ancestors restritos',()=>{
 for(const frameOptions of ['DENY','SAMEORIGIN'])
  assert.throws(()=>validarRespostaStreamlit({...base,frameOptions}),/X-Frame-Options/);
 for(const csp of ["frame-ancestors 'self'","frame-ancestors 'none'","frame-ancestors https://site-externo.invalid"])
  assert.throws(()=>validarRespostaStreamlit({...base,csp}),/frame-ancestors/);
});
test('recusa origem inesperada, página suspensa ou tipo de resposta inválido',()=>{
 assert.throws(()=>validarRespostaStreamlit({...base,url:'https://outro-site.invalid/'}),/origem/);
 assert.throws(()=>validarRespostaStreamlit({...base,status:502}),/HTTP 200/);
 assert.throws(()=>validarRespostaStreamlit({...base,tipo:'application/json'}),/HTML/);
 assert.throws(()=>validarRespostaStreamlit({...base,html:'This app has gone to sleep. Wake this app up.'}),/suspensão/);
 assert.throws(()=>validarRespostaStreamlit({...base,html:'<html>Indisponível</html>'}),/reconhecer/);
});
test('página externa precisa expor iframe e alternativa acessível',()=>{
 const html='<iframe title="Conversa com o Assistente BeVans" src="https://bevans-suporte.streamlit.app/?embed=true"></iframe><a>Abrir assistente em nova aba</a>';
 assert.equal(validarPaginaPublica({status:200,html}),true);
 assert.throws(()=>validarPaginaPublica({status:404,html}),/HTTP 200/);
 assert.throws(()=>validarPaginaPublica({status:200,html:'Página vazia'}),/alternativa/);
});
