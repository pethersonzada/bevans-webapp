# Demonstração do BeVans em 10 minutos

Prepare dois perfis separados do navegador, um para cada papel. Use contas autorizadas de homologação, uma de motorista e outra de passageiro, sem vínculos entre si. Use a turma fictícia “Ensaio Caruaru”, turno Noite, 12 assentos. O código de convite deve vir do servidor. O ensaio exige um Preview conectado ao Firebase e à API de homologação. Reserve os três primeiros minutos para a área pública e o login caso as contas ainda precisem de autenticação.

| Tempo | Ação e evidência na tela |
| --- | --- |
| 0:00 a 1:00 | Abra a página inicial e mostre as modalidades. Explique quem organiza a viagem e quem solicita entrada. |
| 1:00 a 2:30 | Entre como motorista. Apresente o painel e abra Turmas. |
| 2:30 a 4:00 | Em Nova turma, informe nome, turno e assentos. Atualize a lista e copie o convite da turma criada. |
| 4:00 a 5:30 | No segundo perfil, entre como passageiro. Em Mais, Minhas turmas, escolha Entrar com convite. Envie o código e leia a confirmação do pedido. |
| 5:30 a 6:30 | Volte ao motorista. Em Mais, Solicitações, confira passageiro e turma antes de aprovar. Atualize os pendentes. |
| 6:30 a 7:30 | Atualize Minhas turmas no perfil do passageiro. Mostre o vínculo confirmado pelo servidor. |
| 7:30 a 8:15 | Abra Rotas. Mostre o catálogo ou seu estado vazio. Mostre acompanhamento apenas se existir viagem de ensaio ativa. |
| 8:15 a 9:15 | Abra o assistente e selecione “Como entrar em uma turma?”. Mostre a orientação do FAQ no próprio site. |
| 9:15 a 10:00 | Explique o papel de Next.js e React na interface, Firebase na identidade e Spring Boot nas permissões e vínculos. Encerre com o vínculo visível nas duas contas. |

Antes da banca, confirme o SHA em /api/build-info e reserve uma gravação local de um ensaio autorizado, identificando ambiente e contas fictícias. Se Firebase ou a API falhar, apresente o fluxo gravado ou o teste Playwright explicitamente simulado. Se faltar mapa ou viagem, mostre a lista e o estado exibido. Se faltar internet ou a Vercel ficar indisponível, use o material local. Sem gravação ou ambiente preparado, concentre a apresentação nas telas e resultados já verificados. Nunca tente completar o ensaio alterando dados de passageiros reais.
