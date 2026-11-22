# Homologação BeVans WebApp: infraestrutura e gates

**Verificado em 22/11/2026.** Este documento registra o que foi encontrado, o que pode ser configurado sem acesso a credenciais e o que depende de serviços externos.

## Estado comprovado

- Projeto Vercel: `pethersonzadas-projects/bevans-webapp`; integração Git para `main`, com deploy de produção `READY` no último SHA verificado.
- A Vercel tem somente `NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY` e `NEXT_PUBLIC_BEVANS_API_URL` para `production`. **Não** foram encontradas variáveis de API, Firebase ou Mapbox para `preview`.
- A Vercel protege Previews com SSO. Não remover essa proteção para forçar um teste verde.
- O backend Java 21/Spring Boot/PostgreSQL usa migrações em `bevans-backend/docs/migrations`; `HIBERNATE_DDL_AUTO=validate` não cria o esquema. O backend documenta uma infraestrutura com Nginx/PM2/Oracle Cloud, sem ambiente de homologação disponível neste conector.
- Não há token Mapbox conectado/fornecido. Criar um token `pk.*` **real**, com restrição exata de origens, quota e aprovação do responsável; nunca copiar valores de outro ambiente por adivinhação.

## Etapas seguras de provisionamento

1. **Banco e API isolados**: criar PostgreSQL separado, sem dados pessoais de produção. Fazer backup/restauração de ensaio e aplicar **somente** as migrações necessárias, da 001 à 022, verificadas contra o schema do ambiente. Executar API com `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `HIBERNATE_DDL_AUTO=validate`. Conferir /health, autenticação e logs sem PII. Não ativar workers FCM nem exclusão remota.
2. **Firebase de teste**: projeto Firebase separado, aplicativo Web registrado e contas descartáveis para MOTORISTA/PASSAGEIRO. Configurar Firebase Admin do backend apenas no servidor (credencial de serviço fora de Git, CI e `NEXT_PUBLIC_*`). Não usar credenciais reais nem dados de menores.
3. **Mapbox**: criar token público com URL restrictions para o domínio Preview aprovado e para produção separadamente; configurar `NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN` exclusivamente nos targets adequados. Mapbox GL/Directions exigem geolocalização com consentimento e HTTPS, mais teste real de renderização e múltiplas paradas.
4. **Vercel Preview**: na configuração do projeto, direcionar `NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY` (do Firebase de teste), `NEXT_PUBLIC_BEVANS_API_URL` (HTTPS do backend de teste) e `NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN` (token público restrito) apenas ao target **Preview** ou à branch `staging`. Nunca reutilizar URL de API ou chave Firebase de produção. Redefinir/recriar deployment Preview após modificar variáveis, pois Next.js embute `NEXT_PUBLIC_*` no build.
5. **CORS**: no backend staging permitir exatamente a origem HTTPS do deployment Preview autorizado. O CORS backend aceita `Authorization`, `Content-Type`, `X-Convite`, `X-Inscricao` conforme os contratos. Evitar `*`, CORS compartilhado com produção ou headers em logs.
6. **Verificações de publicação**: `npm test`, ESLint, build, Playwright com mocks. A cada push da `main`, o workflow `Deployment HTTP smoke (read only)` verifica o SHA realmente publicado, `/painel`, `/convite`, headers de privacidade e `robots.txt` com requisições GET sem credenciais. Para Preview, o modo manual só passa quando o host está autorizado e o SSO permite leitura aprovada; HTTP 401/403 deve **bloquear** a aprovação, não promover bypass.
7. **API staging**: definir GitHub Actions variables `BEVANS_STAGING_WEB_URL` e `BEVANS_STAGING_API_URL` somente depois que os serviços e origens estiverem **isolados**. Executar manualmente `Staging security smoke (read only)` com SHA de 40 caracteres. O script impede uso de domínio de produção, exige `preview`, checa CORS e consultas anônimas 401/403.
8. **E2E real**: navegador com contas e banco de teste, motorista e passageiro distintos, login/refresh/logout, GPS (aba visível e expiração), Mapbox, vínculos, vagas, conflitos 409, controle auditado e convites. Retenção/consentimentos devem ser aprovados antes de cenários com menores. Sem testes destrutivos em produção.

## Restrições verificáveis

- `robots.txt` no Preview bloqueia indexação integral, e o sitemap é vazio; em produção as páginas institucionais continuam indexáveis e rotas privadas bloqueadas.
- O smoke automático de produção **não chama** API de terceiros, Firebase, login, mutações ou endpoints de GPS; compara SHA informado pela Vercel com SHA do GitHub e inspeciona headers HTTP.
- Qualquer deploy `READY` é apenas disponibilidade de build; não equivale a E2E real. O script com SSO deve falhar fechado.
- Nunca informar `NEXT_PUBLIC_BEVANS_*_TOKEN` privado ou senhas em texto, nem copiar segredos de production para Preview. Os tokens `NEXT_PUBLIC_*` são publicamente acessíveis pelo browser.
- Não habilitar papel RESPONSAVEL/GPS de menores sem comprovação válida e autorização efetiva no backend.
- Não existe conta Firebase, API PostgreSQL ou Mapbox de staging provisionada por esta alteração; a configuração desses recursos demanda acesso ao provedor e credenciais próprias.

**Issues:** [#27](https://github.com/pethersonzada/bevans-webapp/issues/27) infraestrutura, [#20](https://github.com/pethersonzada/bevans-webapp/issues/20) homologação, [#35](https://github.com/pethersonzada/bevans-webapp/issues/35) observabilidade/release, [#3](https://github.com/pethersonzada/bevans-webapp/issues/3) privacidade.
