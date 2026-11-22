import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filtrosCatalogoIniciais,normalizarFiltrosCatalogo,lerPaginaCatalogo} from '../app/lib/catalogo-rotas.mjs';

test('filtros de pesquisa usam somente parâmetros aceitos pelo backend',()=>{
 const aplicados=normalizarFiltrosCatalogo({
  ...filtrosCatalogoIniciais,q:'  Universidade  ',cidade:' Recife ',destino:'Campus',
  turno:'Manhã',categoria:'UNIVERSITARIA',dia:'MONDAY',somenteComVagas:true,somenteFavoritas:true,
 });
 assert.deepEqual(aplicados,{
  q:'Universidade',cidade:'Recife',destino:'Campus',turno:'Manhã',
  categoria:'UNIVERSITARIA',dia:'MONDAY',somenteComVagas:'true',somenteFavoritas:'true',
 });
 assert.equal(new URLSearchParams(aplicados).get('somenteFavoritas'),'true');
});

test('campos vazios não restringem o catálogo e valores desconhecidos são ignorados',()=>{
 assert.deepEqual(normalizarFiltrosCatalogo({...filtrosCatalogoIniciais,privado:'não enviar'}),{});
});

test('filtros recusam categorias, dias e textos inválidos',()=>{
 assert.throws(()=>normalizarFiltrosCatalogo({categoria:'GESTOR'}),/Categoria inválida/);
 assert.throws(()=>normalizarFiltrosCatalogo({dia:'TERCA'}),/Dia de operação inválido/);
 assert.throws(()=>normalizarFiltrosCatalogo({q:'x'.repeat(161)}),/160 caracteres/);
});

test('resposta paginada exige campos numéricos e preserva totais',()=>{
 const resposta={itens:[{id:1,nome:'Rota'}],pagina:0,total:25,totalPaginas:2,tamanho:20};
 assert.equal(lerPaginaCatalogo(resposta),resposta);
 assert.throws(()=>lerPaginaCatalogo({itens:[],pagina:0,totalPaginas:'2',total:0}),/página/);
 assert.throws(()=>lerPaginaCatalogo({itens:[1],pagina:-1,total:1,totalPaginas:2}),/página/);
 assert.throws(()=>lerPaginaCatalogo(null),/página/);
});
