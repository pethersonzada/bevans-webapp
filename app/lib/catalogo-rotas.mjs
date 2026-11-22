// Contrato paginado do catálogo público autenticado. Não inclua dados de turmas privadas.
const camposTexto=['q','cidade','destino','turno'];

export const filtrosCatalogoIniciais=Object.freeze({
 q:'',cidade:'',destino:'',turno:'',categoria:'',dia:'',somenteComVagas:false,somenteFavoritas:false,
});

export function normalizarFiltrosCatalogo(filtros={}){
 const result={};
 for(const campo of camposTexto){
  const value=String(filtros[campo]??'').trim();
  if(value.length>160)throw new Error('Os filtros de texto aceitam até 160 caracteres.');
  if(value)result[campo]=value;
 }
 if(filtros.categoria){
  if(!['ESCOLAR','UNIVERSITARIA','OUTROS'].includes(filtros.categoria))throw new Error('Categoria inválida.');
  result.categoria=filtros.categoria;
 }
 if(filtros.dia){
  if(!['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].includes(filtros.dia))
   throw new Error('Dia de operação inválido.');
  result.dia=filtros.dia;
 }
 if(filtros.somenteComVagas)result.somenteComVagas='true';
 if(filtros.somenteFavoritas)result.somenteFavoritas='true';
 return result;
}

export function lerPaginaCatalogo(resposta){
 if(!resposta||!Array.isArray(resposta.itens)||!Number.isSafeInteger(resposta.total)
    ||resposta.total<0||!Number.isSafeInteger(resposta.pagina)||resposta.pagina<0
    ||!Number.isSafeInteger(resposta.totalPaginas)||resposta.totalPaginas<0)
  throw new Error('A API retornou uma página de rotas inválida.');
 return resposta;
}
