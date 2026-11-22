# Runbook de release e rollback do BeVans WebApp

**Escopo:** referência operacional do issue #35. Este documento não autoriza executar deploy, alterar ambiente, reconfigurar Firebase/Mapbox, revogar tokens ou realizar rollback de produção.

## Preparar homologação

- Isolar backend/banco/Firebase de teste e token público Mapbox restrito ao domínio; não migrar dados pessoais de produção.
- Rodar `npm ci`, `npm test`, `npm run lint`, `npm run build` e o workflow Playwright Chromium com mocks.
- Revisar a saída de `npm audit`, alterações de autorização, permissão e exposição de coordenadas. Necessário sign-off de privacidade e consentimentos de menores antes da operação real.
- Exigir que o deploy em ambiente `preview` esteja `READY` no painel Vercel e pertença ao SHA do PR revisado. Nunca interpretar apenas um commit da branch como publicação.
- Executar o workflow manual `Staging security smoke (read only)`, passando o SHA completo do deploy. Ele compara `GET /api/build-info`, testa políticas HTTP/CORS e rejeição de consultas anônimas. Qualquer divergência bloqueia a liberação.
- Executar cenários E2E **reais de homologação**, com duas contas descartáveis e dados inventados. Registrar referência do ambiente, SHA, resultados, falhas e autorização. Não usar GPS de terceiros.

## O que significa `/api/build-info`

`GET /api/build-info` devolve **somente** `{"commit":"<SHA ou null>","environment":"preview|production|development|unknown"}` sem informações de conta ou credenciais. A origem é a variável de sistema `VERCEL_GIT_COMMIT_SHA`, validada em 40 caracteres hexadecimais, e `VERCEL_ENV`. Não consulta banco nem API.

- Se `commit` for `null` ou `environment` for `unknown`, **não** assumir uma versão nem aprovar a etapa.
- Se o SHA diferir do esperado, **não** declarar staging/produção atualizados.
- SHA correto **não** prova estado READY, banco migrado ou integração com Firebase/Mapbox.
- Cache desabilitado (`no-store`); não indexável (`X-Robots-Tag: noindex`).
- Não acrescentar emails, nomes, IDs internos, coordenadas, tokens ou URLs privadas nesse retorno.

## Gate de produção (somente com autorização explícita)

1. Aprovação do PR e das evidências de CI + homologação e segurança.
2. Conferir time, projeto, domínio, branch, SHA e configurações específicas de produção.
3. Verificar disponibilidade da plataforma, limite de builds e custo Mapbox.
4. Confirmar estratégia de migração/compatibilidade antes de publicar; não remover tabelas ou histórico para retornar versão.
5. Efetuar publicação **apenas após autorização separada**.
6. Verificar status `READY` no painel Vercel, SHA consultado em `/api/build-info`, login/rotas públicas e erros sem dados pessoais.
7. Anotar evidência, hora da publicação, versão, testes e responsável.

## Falhas e fallback

- **Mapa indisponível:** informar a indisponibilidade; não ocultar paradas obrigatórias nem inventar rota alternativa.
- **GPS negado/expirado/aba oculta:** parar transmissão ou exibir posição indisponível; nunca reutilizar coordenadas antigas.
- **API 401/403:** exigir nova sessão ou explicar falta de permissão; não usar dados de cache de outro usuário.
- **API 409/timeout:** reconsultar estado oficial antes de repetir mutação, evitando duplicações.
- **Push indisponível:** conservar feed individual como alternativa, sem ativar notificações sem consentimento.
- **Exclusão de conta:** 202 indica processamento pendente e não remoção remota concluída.
- **Responsável sem comprovação:** negar acesso operacional/GPS; não criar bypass pela UI.

## Observabilidade e privacidade

- Métricas permitidas após aprovação: contagem agregada de erros 5xx, tempo de resposta, falhas de build, disponibilidade HTTP e taxas de carga de página sem IDs pessoais.
- **Não** registrar URL com fragmentos de convite, headers `Authorization`, `X-Convite`, `X-Inscricao`, payloads, nomes, localização, endereços, números de telefone ou dados de menores.
- Política de retenção e acesso aos registros deve ser definida e revisada antes de conectar ferramentas externas. **Nenhum sistema de telemetria foi instalado nesta etapa.**

## Rollback (planejamento)

- Testar rollback **primeiro em homologação** e conferir versão da API, compatibilidade do schema e preservação de outbox/histórico.
- Na Vercel, rollback/promote é ação explícita e separada: pode afetar atribuição automática do domínio. Conferir manualmente o SHA de destino e autorização.
- Regressões com migrações: avaliar roll-forward antes de restaurar código incompatível; **não** executar DROP de tabelas como recuperação.
- Verificar pós-rollback com o mesmo SHA gate read-only e testes operacionais de staging; documentar incidentes e impacto sem expor PII.

**Pendências do #35:** monitoramento agregado com retenção definida, alertas, rollout e rollback comprovados em homologação, implantação READY atualizada. A automação de identidade do build é apenas a primeira entrega.
