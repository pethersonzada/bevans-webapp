import test from 'node:test';
import assert from 'node:assert/strict';
import { buildContactMailto, normalizeContactEmail, normalizePlan } from '../app/lib/contact.mjs';

const valid = {
  recipient: 'contato@example.com',
  name: 'Ana Silva',
  email: 'ana@example.com',
  plan: 'Frota',
  message: 'Tenho quatro vans e gostaria de conversar.',
};

test('seleciona apenas planos conhecidos', () => {
  assert.equal(normalizePlan('Frota'), 'Frota');
  assert.equal(normalizePlan('Admin'), '');
  assert.equal(normalizePlan(null), '');
});

test('rejeita emails de destino inválidos', () => {
  assert.equal(normalizeContactEmail('sem-arroba'), '');
  assert.equal(normalizeContactEmail(''), '');
  assert.equal(normalizeContactEmail(' contato@example.com '), 'contato@example.com');
  assert.throws(() => buildContactMailto({ ...valid, recipient: 'invalido' }));
});

test('codifica assunto e corpo sem quebrar a URL', () => {
  const result = buildContactMailto(valid);
  const url = new URL(result);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, valid.recipient);
  assert.match(url.searchParams.get('subject'), /Frota/);
  assert.match(url.searchParams.get('body'), /Ana Silva/);
  assert.match(url.searchParams.get('body'), /quatro vans/);
});

test('rejeita campos vazios ou textos excessivos', () => {
  assert.throws(() => buildContactMailto({ ...valid, name: 'A' }));
  assert.throws(() => buildContactMailto({ ...valid, email: 'invalido' }));
  assert.throws(() => buildContactMailto({ ...valid, message: 'oi' }));
  assert.throws(() => buildContactMailto({ ...valid, message: 'a'.repeat(1201) }));
});

test('ignora nomes de planos manipulados', () => {
  const url = new URL(buildContactMailto({ ...valid, plan: 'Premium Fake' }));
  assert.match(url.searchParams.get('body'), /Ainda não sei/);
});
