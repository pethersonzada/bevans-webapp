# Homologação do BeVans WebApp

Esta etapa separa três provas diferentes: testes unitários, smoke **com navegadores e serviços simulados**, e homologação **real** contra Firebase/API/Mapbox de teste. Um resultado verde de CI não substitui as outras etapas.

## O que já é automatizado

- `npm test`: contratos HTTP, coordenadas, ordem/versão da coleta e regras locais.
- `npm run lint && npm run build`: lint e compilação Next.js.
- `Browser smoke (isolated mocks)`: workflow de PR e `main`, com Playwright Chromium e API/Firebase sintéticos. Testa tela de acesso, segregação de menus por papel, logout sem persistência, convite por header, mapa sem token e viewport mobile.
- `Staging security smoke (read only)`: workflow **manual**, sem autenticação ou alterações, acionado apenas em ambiente de homologação explicitamente identificado.

Os testes simulados não enviam dados a terceiros nem executam `POST`, `PUT` ou `DELETE` contra o backend real.

## Provisionar homologação antes dos testes reais

1. Criar ambiente isolado de backend e banco (sem cópia de dados pessoais, sem menores reais). Aplicar migrações e verificar `validate`.
2. Criar projeto Firebase de teste e duas contas descartáveis: MOTORISTA e PASSAGEIRO, com vínculos/rotas/endereços igualmente fictícios.
3. Criar domínio HTTPS de homologação do webapp. Configurar suas variáveis **para Preview ou um ambiente customizado**, sem copiar credenciais ou URL de produção:
   - `NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY` (projeto Firebase de teste)
   - `NEXT_PUBLIC_BEVANS_API_URL` (backend HTTPS de teste)
   - `NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN` (token **público** Mapbox, restrito aos domínios de homologação e de produção adequados)
4. Autorizar a origem exata do webapp no CORS do backend; aceitar o header `Authorization` e `Content-Type`. Para convites, permitir `X-Convite` e `X-Inscricao` somente nos endpoints correspondentes. Não usar CORS `*` com credenciais.
5. Definir nas **GitHub Actions variables** `BEVANS_STAGING_WEB_URL` e `BEVANS_STAGING_API_URL`. O script recusa hosts que não tenham `staging`, `homolog`, `qa`, `preview` ou `-git-` no nome. Hosts de produção são recusados por precaução.
6. Disparar manualmente o workflow `Staging security smoke (read only)`, informando o `expected_sha` **com os 40 caracteres do commit implantado em Preview**. O script exige o endpoint `GET /api/build-info`, compara o SHA retornado, verifica ambiente `preview`, cabeçalhos, CORS e resposta 401/403 para consultas privadas sem autenticação. Um SHA diferente ou não informado bloqueia o aceite. O endpoint publica somente `commit` e `environment`, sem segredos. Não executa mutações.
7. O retorno do endpoint identifica o **build**, mas não comprova status `READY` da Vercel ou E2E real. Conferir esses itens separadamente no painel da plataforma e na matriz de aceite.

## Roteiro de aceite funcional (contas de teste)

| Papel / fluxo | Prova necessária |
| --- | --- |
| Não autenticado | Abrir `/painel` e confirmar formulário de login; APIs protegidas retornam 401/403 |
| Motorista | Login real; criar turma fictícia; editar origem/destino e configurar coleta IDA/VOLTA |
| Passageiro | Login real; solicitar vínculo, obter aprovação pelo motorista e escolher parada da própria turma |
| Presença | Validar IDA, VOLTA, AMBOS, NÃO VOU; no modo `PARADAS_DEFINIDAS`, não exigir endereço residencial |
| Privacidade | Conta não vinculada não consulta GPS, endereços, listas ou contato de outra turma |
| Mapa | Carregar tiles com token público restrito; ajustar pins; traçar e inspecionar sequência completa do itinerário |
| GPS | Com HTTPS e autorização explícita, enviar localização somente com aba visível; interromper ao ocultar, sair e encerrar viagem; não mostrar posição expirada |
| Excursão | Criar excursão fictícia, editar coleta e paradas, gerar convite, inscrever identidade de teste, validar confirmação e cancelamento |
| Convite | Segredo no fragmento, removido da URL; requisições usam `X-Convite`/`X-Inscricao`; outro participante não consulta inscrição alheia |
| Contato | Divulgação apenas após consentimento do motorista e apenas a usuários aprovados; revogar e testar novamente |
| Notificações | Preferências persistem; avisos da central não dependem de push; push web ainda é pendência |
| UI | Navegação em 390px, desktop, teclado, tema escuro, rede lenta e falhas de backend |

Use dados descartáveis. Nunca faça testes de GPS ou exclusão de contas sobre viagens, pessoas ou credenciais reais. Verifique logs e limites de uso Mapbox antes de ampliar o tráfego.

## Critério de liberação

É necessário: CI verde, smoke de navegador verde, smoke não destrutivo de staging verde, testes manuais por perfil concluídos e revisão de segurança/privacidade dos acessos à localização. E2E real de escrita e operação precisa de fixture isolada com limpeza explícita e aprovação; esse fluxo ainda não está automatizado.

## Limites conhecidos

- Sem token `NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN`, o webapp informa que o mapa não foi configurado.
- O navegador não garante GPS em segundo plano; a navegação por manobras é manual.
- Não há Web Push para navegadores ou navegação guiada por voz; exigir implementação e aceite separados.
- A política de privacidade e consentimentos sobre localização de menores exigem revisão especializada antes de operação com dados reais.



## Evidências automáticas com serviços reais (preparação em 23/11/2026)

Foi criado o workflow **Jornadas reais de homologação (somente leitura)** em `.github/workflows/jornadas-reais-staging.yml`. Ele é **manual**, limitado à branch `main`, exige confirmação explícita de fixtures descartáveis e usa o ambiente GitHub `homologacao`. Configure **required reviewers** e restrição de branch desse ambiente nas configurações do repositório, antes de adicionar as credenciais. A execução não deve ser confundida com o smoke simulado.

Antes de executar, o responsável pela infraestrutura deve provisionar **serviços separados**, sem importar dados de produção: API Java + PostgreSQL migrado; Firebase de teste com motorista e passageiro distintos e registros fictícios coerentes; token público Mapbox restrito ao domínio e com quota; URL HTTPS de Preview com proteção ativa. Não copiar nem descriptografar as variáveis de production. O Streamlit do assistente é independente dessas credenciais.

Configure o Preview da Vercel na branch `staging` usando exclusivamente o Firebase e a API de homologação; o hostname do frontend aprovado por este workflow é `bevans-webapp-git-staging-pethersonzadas-projects.vercel.app`. Depois do deploy Preview, configure os seguintes **nomes**, sem escrever valores em Git:

- GitHub Actions **variables**: `BEVANS_STAGING_WEB_URL` e `BEVANS_STAGING_API_URL`. A URL de API deve ter identificação explícita de staging/homologação. Não use os hosts de produção.
- GitHub Actions **secrets do ambiente homologacao**: `BEVANS_STAGING_MOTORISTA_EMAIL`, `BEVANS_STAGING_MOTORISTA_PASSWORD`, `BEVANS_STAGING_PASSAGEIRO_EMAIL`, `BEVANS_STAGING_PASSAGEIRO_PASSWORD`. Use contas de teste, nunca contas reais.
- Opcional, somente quando autorizado pela equipe Vercel: `BEVANS_STAGING_VERCEL_BYPASS`. É enviado **apenas** ao hostname WebApp de Preview no preflight e navegador; proteção do Preview permanece ativada.

No GitHub Actions selecione manualmente o workflow, a branch `main`, informe `expected_sha` com o SHA de **40 caracteres da versão Preview** e marque a confirmação dos dados descartáveis. Primeiro ocorre o smoke read-only: SHA/ambiente Preview, CORS e 401/403 anônimos. Depois o Playwright testa login real de motorista e passageiro, menus segregados, logout e viewport móvel. Não realiza mutações, GPS ou operações com viagens. Os testes **não capturam** vídeos, traces ou screenshots de dados de conta.

**Somente após a conclusão verde** é emitido um artefato `homologacao-real-somente-leitura/resultado.json` (retenção de 14 dias), contendo SHA, tipo de teste, identificador da execução e IDs dos cenários, **sem e-mails, senhas, tokens ou PII**. A execução com resultado vermelho ou bloqueada por staging ausente **não gera** aprovação.

| Prova | Situação conhecida em 23/11/2026 |
| --- | --- |
| Unitários, lint, build e browser com mocks | Automatizados no PR e na branch principal; são evidências **sintéticas** |
| Vercel production SHA e publicação | Verificados pelo deploy e pelo smoke HTTP de produção, sem autenticação |
| Preview de staging com Firebase/API/PostgreSQL/Mapbox independentes | **Bloqueado**: recursos/variáveis de teste ainda não disponíveis |
| Login real de motorista e passageiro, perfis e logout | **Não executado** até provisionar contas e executar o workflow manual |
| Turmas, presença, GPS, vagas concorrentes, excursões e acesso cruzado | **Não homologado**; precisam de fixtures e jornadas operacionais autorizadas |
| Consentimentos e responsável por menores | **Bloqueados** por revisão jurídico-operacional e comprovação de identidade |

Nunca crie uma evidência `aprovado` manualmente nem use mocks como se fossem backend real. Se o Preview estiver protegido por SSO sem bypass autorizado, a verificação deve falhar e permanecer bloqueada.
