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
