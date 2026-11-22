import test from 'node:test';
import assert from 'node:assert/strict';
import {obterMenuPainel,telaPermitida,abaAtivaNoMenu,tituloDaTela} from '../app/lib/painel-menu.mjs';

test('motorista vê cinco áreas principais e ferramentas agrupadas',()=>{
 const {principal,grupos}=obterMenuPainel(true);
 assert.deepEqual(principal.map(x=>x.id),['inicio','turmas','viagens','rotas','mais']);
 assert.equal(new Set(principal.map(x=>x.id)).size,5);
 assert.ok(grupos.some(g=>g.itens.some(x=>x.id==='operacao')));
 assert.ok(grupos.some(g=>g.itens.some(x=>x.id==='notificacoes')));
 assert.ok(grupos.some(g=>g.itens.some(x=>x.id==='gestao-excursoes')));
 assert.equal(abaAtivaNoMenu(true,'operacao'),'mais');
 assert.equal(tituloDaTela(true,'operacao'),'Embarques e operações');
});

test('passageiro mantém atalhos pertinentes, sem áreas exclusivas do motorista',()=>{
 const menu=obterMenuPainel(false);
 assert.deepEqual(menu.principal.map(x=>x.id),['inicio','rotas','solicitacoes','viagens','mais']);
 assert.equal(abaAtivaNoMenu(false,'solicitacoes'),'solicitacoes');
 for(const area of ['editor-rotas','gestao-excursoes'])assert.equal(telaPermitida(false,area),false);
 assert.equal(telaPermitida(false,'operacao'),true);
 assert.equal(abaAtivaNoMenu(false,'notificacoes'),'mais');
 assert.equal(tituloDaTela(false,'operacao'),'Meu embarque');
});

test('rotas desconhecidas não aparecem na navegação por perfil',()=>{
 for(const motorista of [true,false]){
  assert.equal(telaPermitida(motorista,'pagina-inexistente'),false);
  assert.equal(abaAtivaNoMenu(motorista,'pagina-inexistente'),'inicio');
  assert.equal(tituloDaTela(motorista,'pagina-inexistente'),'Início');
  assert.equal(telaPermitida(motorista,'configuracoes'),true);
 }
});
