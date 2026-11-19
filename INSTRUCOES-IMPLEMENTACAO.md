# BeVans WebApp — primeira implementação operacional

Fonte consultada: `pethersonzada/bevans-webapp` (main) e serviços do `bevans-frontend` no commit `dcb49e4`.

## Conteúdo entregue
- Substitui `/login` demonstrativo por login Firebase Identity Toolkit e verificação de perfil no backend.
- Cria `/painel` protegido por sessão em memória, com motorista/passageiro.
- Turmas: consulta e criação básica para motoristas.
- Rotas: lista das próprias rotas ou catálogo, detalhes, publicação pelo motorista e favoritos/vínculos/pedido em parada fixa pelo passageiro.
- Solicitações: vínculos pendentes e pedidos por rota/data/sentido, aprovação e recusa, além da visão do passageiro.
- Excursões: listagem e leitura das execuções do motorista.
- Notificações: histórico, leitura e acesso direto às solicitações.
- Operações: consulta de viagem ativa, contadores, embarque/ausência/desembarque para motorista e embarque do passageiro.
- Contratos HTTP, validação básica, erros explícitos, timeout e testes unitários.

## Limitações importantes
**Este é um primeiro incremento utilizável, não equivalência integral com o Android.** Ainda não foram portados cadastro de usuário Firebase+backend, editor completo de rotas, editor de excursões, mapa com Mapbox, navegação/GPS, convites e inscrições de excursões, atualização em tempo real, notificações push web, pagamentos e gestão de perfis. O webapp original é uma landing page; essas funções exigem desenvolvimento, QA e adaptações próprias do navegador.

O backend precisa aceitar CORS para o domínio do webapp. Nenhum endpoint foi inventado para contornar autorização. O cadastro em `/cadastro` permanece demonstrativo. O login utiliza sessão *apenas em memória* e por isso exige novo login ao recarregar. Há confirmação em ações de escrita; resultados incertos devem ser conferidos antes de repetir a alteração.

## Aplicação no Windows
1. Entre em `C:\dev\bevans-webapp` (clone do repositório webapp, **não** frontend).
2. Faça backup/commit das mudanças existentes; `git status` deve estar limpo.
3. Extraia o ZIP na raiz desse diretório com `Expand-Archive ... -DestinationPath 'C:\dev\bevans-webapp' -Force`.
4. `Copy-Item .env.local.example .env.local` e preencha os valores reais, sem publicar `.env.local`.
5. `npm ci`, `npm test`, `npm run lint`, `npm run build`, `npm run dev`.
6. Acesse `/login`; teste somente com contas de teste autorizadas. Verifique CORS e backend antes de ações de escrita.
7. Antes de publicar, revise fluxo de sessão, validação de respostas, CSRF e controles de autorização da API, e teste em navegador e dispositivos reais.

**Não há push ou commit automático.** Alterações aplicadas localmente devem ser revisadas e commitadas pelo usuário.
