// Menu de tarefas: poucos destinos principais e ferramentas agrupadas por contexto.
// A lista é definida pelo papel, sem alterar as verificações de permissão da API.
const motoristaPrincipal = [
 {id:'inicio',rotulo:'Início',icone:'inicio'},
 {id:'turmas',rotulo:'Turmas',icone:'turmas'},
 {id:'viagens',rotulo:'Viagens',icone:'viagens'},
 {id:'rotas',rotulo:'Rotas',icone:'rotas'},
 {id:'mais',rotulo:'Mais',icone:'mais'},
];
const passageiroPrincipal = [
 {id:'inicio',rotulo:'Início',icone:'inicio'},
 {id:'rotas',rotulo:'Rotas',icone:'rotas'},
 {id:'solicitacoes',rotulo:'Pedidos',icone:'pedidos'},
 {id:'viagens',rotulo:'Viagens',icone:'viagens'},
 {id:'mais',rotulo:'Mais',icone:'mais'},
];

const motoristaGrupos = [
 {titulo:'Minha operação',descricao:'Acompanhe a rotina e as confirmações do transporte.',itens:[
  {id:'solicitacoes',rotulo:'Solicitações',descricao:'Analise pedidos de vínculo e embarque.',icone:'pedidos'},
  {id:'operacao',rotulo:'Embarques e operações',descricao:'Confirme estados e acompanhe o histórico.',icone:'operacao'},
  {id:'notificacoes',rotulo:'Notificações',descricao:'Consulte avisos relacionados às viagens.',icone:'notificacoes'},
 ]},
 {titulo:'Planejamento',descricao:'Configure rotas, pontos e viagens ocasionais.',itens:[
  {id:'editor-rotas',rotulo:'Editor de rotas',descricao:'Crie ou ajuste seus itinerários.',icone:'rotas'},
  {id:'coleta',rotulo:'Coleta privada',descricao:'Organize o embarque da turma.',icone:'pontos'},
  {id:'enderecos',rotulo:'Endereços e pontos',descricao:'Revise locais de partida e chegada.',icone:'pontos'},
  {id:'excursoes',rotulo:'Excursões',descricao:'Veja suas excursões cadastradas.',icone:'viagens'},
  {id:'gestao-excursoes',rotulo:'Gestão de excursões',descricao:'Organize participantes e execuções.',icone:'turmas'},
 ]},
 {titulo:'Minha conta',descricao:'Preferências e dados pessoais.',itens:[
  {id:'configuracoes',rotulo:'Configurações',descricao:'Gerencie seu perfil e suas preferências.',icone:'configuracoes'},
 ]},
];
const passageiroGrupos = [
 {titulo:'Minha jornada',descricao:'Tudo sobre seus vínculos e embarques.',itens:[
  {id:'turmas',rotulo:'Minhas turmas',descricao:'Confira grupos e vínculos aprovados.',icone:'turmas'},
  {id:'operacao',rotulo:'Meu embarque',descricao:'Acompanhe seu estado e seu histórico.',icone:'operacao'},
  {id:'excursoes',rotulo:'Excursões',descricao:'Acesse informações de viagens ocasionais.',icone:'viagens'},
  {id:'coleta',rotulo:'Coleta privada',descricao:'Consulte pontos da sua turma autorizada.',icone:'pontos'},
  {id:'enderecos',rotulo:'Meus endereços',descricao:'Atualize seus locais de embarque.',icone:'pontos'},
  {id:'notificacoes',rotulo:'Notificações',descricao:'Consulte avisos e atualizações.',icone:'notificacoes'},
 ]},
 {titulo:'Minha conta',descricao:'Seus dados e preferências.',itens:[
  {id:'configuracoes',rotulo:'Configurações',descricao:'Gerencie seu perfil com segurança.',icone:'configuracoes'},
 ]},
];

const nomesDeTelas={
 inicio:'Início',turmas:'Turmas',rotas:'Rotas públicas',solicitacoes:'Solicitações',
 viagens:'Mapa e viagens',excursoes:'Excursões',notificacoes:'Notificações',
 operacao:'Operações',enderecos:'Endereços e pontos',coleta:'Coleta privada',
 configuracoes:'Configurações','editor-rotas':'Editor de rotas',
 'gestao-excursoes':'Gestão de excursões',mais:'Mais ferramentas',
};
export function obterMenuPainel(motorista){
 return motorista
  ?{principal:motoristaPrincipal,grupos:motoristaGrupos}
  :{principal:passageiroPrincipal,grupos:passageiroGrupos};
}
export function telaPermitida(motorista,aba){
 const menu=obterMenuPainel(motorista);
 return menu.principal.some(item=>item.id===aba)
  ||menu.grupos.some(grupo=>grupo.itens.some(item=>item.id===aba));
}
export function abaAtivaNoMenu(motorista,aba){
 if(!telaPermitida(motorista,aba))return 'inicio';
 return obterMenuPainel(motorista).principal.some(item=>item.id===aba)?aba:'mais';
}
export function tituloDaTela(motorista,aba){
 if(!telaPermitida(motorista,aba))return 'Início';
 const item=obterMenuPainel(motorista).grupos.flatMap(grupo=>grupo.itens).find(item=>item.id===aba);
 return item?.rotulo||nomesDeTelas[aba]||'Início';
}
