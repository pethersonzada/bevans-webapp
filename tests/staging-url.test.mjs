import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stagingBaseUrl} from '../app/lib/staging-url.mjs';

test('staging na raiz não cria barras duplicadas na URL do painel',()=>{
  assert.equal(stagingBaseUrl(new URL('https://qa.example.invalid/'))+'/painel','https://qa.example.invalid/painel');
  assert.equal(stagingBaseUrl(new URL('https://preview.example.invalid'))+'/api/build-info','https://preview.example.invalid/api/build-info');
});

test('prefixo de backend é preservado sem barra extra',()=>{
  assert.equal(stagingBaseUrl(new URL('https://api.qa.example.invalid/api/'))+'/notificacoes','https://api.qa.example.invalid/api/notificacoes');
  assert.equal(stagingBaseUrl(new URL('https://api.qa.example.invalid/api/v1/'))+'/notificacoes','https://api.qa.example.invalid/api/v1/notificacoes');
});

test('base para staging exige objeto URL HTTPS',()=>{
  assert.throws(()=>stagingBaseUrl(new URL('http://qa.example.invalid/')),/HTTPS/);
  assert.throws(()=>stagingBaseUrl('https://qa.example.invalid/'),/HTTPS/);
});
