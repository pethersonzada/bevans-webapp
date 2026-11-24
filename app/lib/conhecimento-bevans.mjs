// Base compartilhada pelo FAQ público e pelo assistente nativo.
// A base original do agente BeVans contém também regras propostas; publicamos aqui
// apenas comportamentos apresentados como existentes e informações confirmadas no site.
export const FAQ_PUBLICO=[
 {q:'Quais funcionalidades já estão disponíveis?',a:'O aplicativo BeVans dispõe de turmas, rotas públicas fixas e flexíveis, solicitações, viagens de ida e volta, mapas, acompanhamento operacional e excursões. Alguns recursos, como o envio de notificações push, ainda dependem de validação de infraestrutura.'},
 {q:'Como funcionam as excursões?',a:'O organizador cria a excursão no aplicativo, configura o roteiro e compartilha um convite. Participantes podem se inscrever no navegador usando o link. O organizador confirma os participantes e acompanha embarques e desembarques nas execuções de ida e volta.'},
 {q:'O BeVans já oferece gestão de frotas?',a:'O papel de gestor, cadastro de organizações, atribuição de veículos e administração de vários motoristas ainda está em planejamento.'},
 {q:'Posso entrar pelo navegador?',a:'Sim. Contas existentes podem usar o login do painel web para consultar os módulos já integrados. Nem todas as ferramentas do aplicativo Android foram adaptadas à web.'},
 {q:'Posso criar uma conta neste site?',a:'O cadastro público permanece fechado. O acesso ao painel é reservado a contas já autorizadas.'},
 {q:'Como posso falar com a equipe?',a:'A página de contato prepara um e-mail no aplicativo do visitante quando um endereço comercial está configurado. Não há contratação ou cobrança automática neste site.'},
];

export const CONHECIMENTO_BEVANS=[
 ...FAQ_PUBLICO.map(item=>({pergunta:item.q,resposta:item.a,origem:'FAQ do site'})),
 {pergunta:'Como o motorista cria uma turma?',resposta:'No aplicativo, o motorista autorizado acessa Turmas, cria uma turma e informa nome, turno, origem e destino. A turma tem um código próprio para pedidos de entrada.',origem:'Manual do agente'},
 {pergunta:'Como entrar em uma turma como passageiro?',resposta:'No painel do passageiro, abra Mais, Minhas turmas e Entrar com convite. Informe o código fornecido pelo motorista e envie a solicitação. Após a aprovação, a turma aparece em Minhas turmas.',origem:'Manual do agente'},
 {pergunta:'Meu código de turma não funciona. O que faço?',resposta:'Confira os seis caracteres, sem espaços extras, e peça ao motorista para confirmar se a turma continua ativa e se o código está atualizado.',origem:'Manual do agente'},
 {pergunta:'Como o motorista aprova uma solicitação?',resposta:'O motorista revisa o pedido de entrada na área de solicitações ou notificações e decide se aprova ou recusa. O passageiro só recebe acesso aos dados da turma após a aprovação.',origem:'Manual do agente'},
 {pergunta:'Como confirmar presença na van?',resposta:'Depois de aprovado na turma, o passageiro acessa a confirmação diária e informa se vai na ida, volta, em ambos os sentidos ou se não vai. Endereços de embarque e desembarque devem estar corretos.',origem:'Manual do agente'},
 {pergunta:'Posso alterar a presença ou o endereço?',resposta:'A regra do manual permite alterar a resposta da enquete e os endereços antes de o motorista iniciar a rota. Depois do início, procure o responsável pela viagem.',origem:'Manual do agente'},
 {pergunta:'Como salvar endereços?',resposta:'O passageiro pode cadastrar endereços favoritos com nomes como Casa e Trabalho, para selecionar mais rápido os locais de embarque e desembarque.',origem:'Manual do agente'},
 {pergunta:'Como acompanhar o mapa ou o GPS da van?',resposta:'O acompanhamento depende de uma viagem ativa e de autorização de acesso. Se o mapa não carregar, verifique a conexão e confirme com o motorista se a viagem foi iniciada. Atualizações podem sofrer atrasos de rede ou GPS.',origem:'Manual do agente'},
 {pergunta:'Como o motorista inicia as viagens?',resposta:'O motorista autorizado pode iniciar viagens de ida ou volta na turma. Os passageiros vinculados acompanham as informações da execução conforme suas permissões.',origem:'Manual do agente'},
 {pergunta:'Como participar de uma excursão pelo convite?',resposta:'Abra o link compartilhado pelo organizador e siga o formulário de inscrição no navegador. A confirmação e o acompanhamento da inscrição dependem das regras e credenciais da excursão.',origem:'Manual do agente'},
 {pergunta:'É preciso enviar foto na excursão?',resposta:'Não. O FAQ original informa que o envio de foto na inscrição da excursão é opcional.',origem:'Manual do agente'},
 {pergunta:'O que são rotas públicas fixas e flexíveis?',resposta:'Rotas fixas seguem pontos definidos. Rotas flexíveis consideram solicitações ou endereços previstos no planejamento. O catálogo e as informações disponíveis dependem da rota publicada.',origem:'Manual do agente'},
 {pergunta:'Minhas notificações não chegam. Como resolver?',resposta:'Verifique permissões de notificações e conexão. No navegador, o envio de notificações push ainda depende de validação de infraestrutura.',origem:'FAQ do site'},
 {pergunta:'Outros passageiros podem ver meus dados pessoais?',resposta:'As informações sensíveis de colegas, como CPF, telefone e endereços privados, não devem ser expostas a outros passageiros. A visualização de viagem é limitada pelas permissões de acesso.',origem:'Manual do agente'},
 {pergunta:'Sou motorista. Posso gerenciar mais de uma turma?',resposta:'O manual do aplicativo prevê que um motorista autorizado administre diferentes turmas, turnos e instituições separadamente.',origem:'Manual do agente'},
 {pergunta:'Como recuperar minha senha?',resposta:'Use o fluxo de recuperação de acesso da tela de login quando disponível. Nunca envie sua senha, token ou CPF para o assistente. Se precisar de suporte, use os canais oficiais.',origem:'Orientação de segurança'},
];

