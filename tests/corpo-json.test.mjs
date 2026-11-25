import test from 'node:test';
import assert from 'node:assert/strict';
import {lerJsonLimitado} from '../app/lib/corpo-json.mjs';

test('conta bytes entre blocos e cancela a leitura acima do limite', async () => {
 const bytes = new TextEncoder().encode('"ação"');
 let cancelado = false;
 const body = new ReadableStream({
  start(controller) {
   controller.enqueue(bytes.slice(0, 3));
   controller.enqueue(bytes.slice(3));
  },
  cancel() { cancelado = true; },
 });
 await assert.rejects(lerJsonLimitado({headers:new Headers(),body}, bytes.length-1), RangeError);
 assert.equal(cancelado, true);
 const pedido = new Request('https://example.invalid', {method:'POST',body:bytes});
 assert.equal(await lerJsonLimitado(pedido, bytes.length), 'ação');
});
