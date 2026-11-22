# Auditoria e plano de implementação do BeVans WebApp

**Data da inspeção:** 22/11/2026. **Repositório:** `pethersonzada/bevans-webapp` (`main` em `61375a7` durante a auditoria). **Escopo:** código, 22 issues abertas e respectivos comentários, PRs integrados, contratos do `bevans-backend`, comparação de funcionalidades com `bevans-frontend`, GitHub Actions e metadados não secretos da Vercel.

## 1. Limites da evidência

Este documento distingue:

1. **Código existente:** interfaces, serviços e chamadas versionadas.
2. **CI aprovado:** testes unitários, ESLint, build e smoke com serviços **simulados** no commit `61375a7`.
3. **Integração real homologada:** **não comprovada** nesta inspeção; faltam credenciais/contas descartáveis, API de teste e token Mapbox restrito.
4. **Navegador real:** o Playwright usa Chromium, porém com Firebase/API simulados. Isso não valida GPS, backend, entrega push ou políticas de produção.
5. **Publicado em produção:** a última implantação Vercel `READY` consultada estava no SHA `9e9ac4c`, anterior aos PRs #24/#26, enquanto o GitHub estava em `61375a7`.

Não foram executadas mutações ou exclusões em serviços de produção. Nenhum segredo foi recuperado.

### Arquitetura verificada

- Next.js 16.4.6 App Router, React 19, JSX/JS e módulos ES; CSS específico do painel e institucional.
- Autenticação Firebase Identity Toolkit por REST em `app/lib/bevans-auth.mjs`, token mantido em memória da aba; requisições privadas via `app/lib/bevans-api.mjs`.
- API pública de excursões consumida pelo cliente `app/convite/ConviteClient.jsx`; segredo em fragmento local, transferido em headers `X-Convite` e `X-Inscricao`.
- Painel em `app/painel/AuthEntry.jsx` e módulos para viagens, endereço, coleta privada, rotas públicas, excursões e configurações.
- Mapbox GL no navegador e Directions para trechos de até 25 coordenadas; GPS depende de HTTPS, permissão e aba visível.
- GitHub Actions `quality.yml`, `browser-smoke.yml` e `staging-readonly.yml`; testes em `tests/*.test.mjs` e `e2e/smoke.spec.mjs`.
- Integrações documentadas no backend: `docs/controle-operacional-api.md`, `docs/embarques-api.md`, `docs/roteiro-operacional-api.md`, `docs/notificacoes-api.md`, `docs/responsaveis-api.md`, `docs/exclusao-contas-api.md` e contratos de excursões.
- Referência mobile: `src/services/roteiroNavegacao.ts`, `operacoes.ts`, `embarques.ts`, `push.ts`, `conta.ts`, `telemetria.ts` e telas de perfil, GPS e rotas.

### PRs relevantes já integrados

- #19: mapa, viagem, GPS, presença, endereços e excursão.
- #23: coleta configurável, paradas, convites, modo de excursão, preferências, pontos excepcionais e manobras manuais.
- #24: corrigiu renderização do mapa e bloqueio de geolocalização; introduziu Playwright e smoke de staging não destrutivo.
- #26: corrigiu intervalo vulnerável do Next.js para 16.4.6.

Nenhuma dessas entregas é automaticamente sinônimo de homologação real.

## 2. Inventário das 22 issues abertas

Legenda: **Parcial** = há código relacionado mas faltam critérios; **Ausente** = não há entrega do fluxo completo; **Bloqueada** = depende de ambiente, segurança ou decisão externa; **Futura** = fora do MVP atual.

| Issue | Situação verificada | Bloqueio ou aceite faltante |
|---|---|---|
| #1 Canal comercial | Parcial | Confirmar canal real e teste de envio; Vercel não expôs variável pública de contato |
| #3 Privacidade/termos | Bloqueada | Revisão factual/jurídica, retenção, menores, mapa e provedor externo |
| #5 SEO | Parcial | `/convite` não aparece entre os caminhos excluídos em `app/robots.js`; falta produção |
| #6 Design/acessibilidade | Parcial | Há tema e smoke mobile; faltam contraste, teclado e regressão visual completos |
| #7 Assets/performance | Parcial | Logos versionadas; medir Lighthouse/LCP/CLS e otimizar sem alterar marca |
| #11 Login/permissões | Parcial | Firebase/API em código; falta sessão real homologada e matriz de 401/403 |
| #12 ADMIN global | Futura/bloqueada | Papel e autorização no backend não disponibilizados para este MVP |
| #13 GESTOR frota | Futura/bloqueada | Contrato de organização e papel GESTOR no backend |
| #14 Inscrição convite | Parcial | Três modos e credencial em código; faltam E2E real, privacidade e concorrência |
| #15 Relatório operacional | Futura | Autorização, minimização, período, exportação e proteção contra CSV injection |
| #20 QA real | Bloqueada | Staging com contas, Mapbox, Firebase/API e provas de autorização |
| #22 Paridade | Épico aberto | Integra todas as issues; não declarar 100% sem ambiente real |
| #25 Dependências | Parcial | Next.js 16.4.6; último audit relatou 10 alertas (7 moderados/3 altos) sem triagem detalhada |
| #27 Deploy/staging | Bloqueada | Vercel `READY` antigo; `build-rate-limit`, token Mapbox e staging ausentes |
| #28 Web Push | Ausente | Service Worker/FCM Web, opt-in, token por instalação, revogação e backend |
| #29 Navegação | Parcial | Roteiro viário/manual; falta progresso por snapshot e navegação consistente |
| #30 Perfil/conta | Ausente em web | E-mail com reautenticação Firebase e exclusão HTTP 202/409 |
| #31 Responsáveis | Bloqueada | Backend nega comprovação real em produção; consentimento/jurídico/verificação |
| #32 Operação auditada | Parcial | Há embarque e desembarque; faltam correção com motivo, histórico e conflitos |
| #33 Rotas públicas | Parcial | Editor e paradas; faltam jornada de pin excepcional e embarques por dia/sentido |
| #34 Excursão anônima | Parcial | Inscrição e consulta existem; falta controle operacional e histórico individual |
| #35 Release/observabilidade | Parcial nesta etapa | Falta proveniência comprovável do deploy, monitoramento seguro e rollback homologado |

Os comentários históricos das issues #1, #3 e #14 foram revisados. Alguns descrevem versões anteriores do repositório e foram tratados como histórico, não como estado atual.

## 3. Matriz de risco e ordem de execução

### Etapa 0: bloqueios de produção (P0, dependências externas)

- **#27:** liberar builds e configurar Vercel/Mapbox, staging HTTPS com banco e Firebase de teste. Exige ação autorizada do proprietário do ambiente. **Proibido publicar sem autorização expressa.**
- **#3 e #31:** definir tratamento de dados de menores e processo de comprovação de responsáveis. Backend `VerificacaoResponsabilidadePendente` nega acesso a GPS; não contornar.
- **#20:** homologar com usuários descartáveis e API real, não com mocks.

### Etapa 1: segurança e evidências independentes (P1, execução segura)

1. **#35, parcela A (esta branch):** endpoint público somente leitura com SHA real ou `null`; smoke manual exige SHA esperado e ambiente `preview`; documentação de aceite e rollback. Não envia telemetria pessoal nem altera deploy.
2. **#25:** executar `npm audit --json` do lock atual em CI sem segredos, classificar as cadeias restantes e propor patches isolados com lockfile gerado pelo npm; preservar branch protegida.
3. **#35, parcela B:** monitoramento sanitizado de falhas sem IDs, localização, credenciais ou payload de API; alertas e evidência de rollback exclusivamente em staging.

### Etapa 2: contratos existentes e valor operacional (P1, PRs separados)

4. **#32:** estados e histórico de embarque/desembarque para motorista/passageiro, `versao`, 409 e correções com motivo. API `/operacoes/{tipo}/{id}` documentada.
5. **#33:** solicitação/aprovação de embarque em rotas FIXA/FLEXIVEL; ponto excepcional exige pin confirmado e autorização real. API `/rotas-publicas/{id}/embarques`.
6. **#34 e #14:** operação individual de excursão por `X-Inscricao`, sem Firebase e sem expor outros participantes; jamais criar recuperação de credencial por contato não verificado.
7. **#29:** validar snapshot completo da operação, limites da Directions, próxima parada e progresso. Não prometer navegação de fundo ou inferir embarque pelo GPS.
8. **#30 e #11:** perfil da própria conta, alteração de e-mail com reautenticação e compensação segura, exclusão apenas como pendente HTTP 202.

### Etapa 3: recursos condicionados (P1/P2)

9. **#28:** Web Push somente com VAPID/FCM Web, dispositivo por conta, opt-in e revogação; não copiar token Expo.
10. **#31:** telas de responsáveis somente após adaptação confiável do backend e aprovação jurídica.
11. **#1/#5/#6/#7/#15:** contato comercial, SEO/noindex, acessibilidade, performance, relatórios. **#12/#13** permanecem futuros e dependem dos papéis específicos de servidor.

## 4. Regras de entrega por issue

Para cada PR: contexto e contratos examinados; arquivos afetados; validação de entrada e autorização; erros 401/403/404/409/timeouts; tratamento de corrida; testes locais; lint e build; Playwright quando pertinente; evidências de homologação separadas; critérios pendentes explicitados; **sem merge ou deploy automático nesta execução**.

Os fluxos de GPS e menores nunca podem usar localização desatualizada, tokens pessoais em URLs, coordenadas em logs ou permissões de responsável presumidas. Não se envia token ao Mapbox; roteiros privados enviados a serviços de mapa exigem revisão de finalidade/consentimento.

## 5. Comprovação e limitações da parcela A do #35

- O endpoint `GET /api/build-info` deverá devolver somente `commit` (SHA de 40 dígitos ou `null`) e `environment` permitido; `Cache-Control: no-store` e `noindex`.
- Não declarar `READY` nem sucesso de API a partir dessa resposta.
- O workflow manual de staging recebe o SHA completo esperado, compara a resposta do deploy e somente então continua testes read-only de CORS e autenticação anônima; não executa `POST`/`PUT`/`DELETE`.
- Se o provedor não fornecer SHA confiável ou o ambiente não for `preview`, o gate deve falhar. Isso é comportamento de segurança.
- O CI testa lógica e resposta local, mas **o gate de staging não estará validado** até existir ambiente separado; a publicação/rollback também não ocorrerá nesta etapa.
