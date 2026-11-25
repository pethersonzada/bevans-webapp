// O comprimento declarado é opcional. Conte os bytes recebidos antes de decodificar.
export async function lerJsonLimitado(request, limite) {
 if (Number(request.headers.get('content-length')) > limite) {
  throw new RangeError('Mensagem muito extensa.');
 }
 const leitor = request.body?.getReader();
 if (!leitor) throw new SyntaxError('Corpo vazio.');
 const partes = [];
 let total = 0;
 try {
  while (true) {
   const {done, value} = await leitor.read();
   if (done) break;
   total += value.byteLength;
   if (total > limite) {
    await leitor.cancel();
    throw new RangeError('Mensagem muito extensa.');
   }
   partes.push(value);
  }
 } finally {
  leitor.releaseLock();
 }
 return JSON.parse(Buffer.concat(partes, total).toString('utf8'));
}
