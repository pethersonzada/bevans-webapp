# BeVans WebApp

Site institucional e painel web do **BeVans**, plataforma para organização de transporte por van, com áreas para motoristas e passageiros.

> **Estado do produto (novembro de 2026):** o site apresenta as modalidades do BeVans e o painel já utiliza autenticação Firebase e endpoints do backend. O **cadastro público permanece fechado**. O aplicativo mobile oferece fluxos operacionais que ainda não têm equivalência completa no painel web. Imagens de rotas, indicadores e representações visuais da landing page são ilustrativos.

## Ecossistema

| Repositório | Responsabilidade |
| --- | --- |
| [bevans-frontend](https://github.com/pethersonzada/bevans-frontend) | Aplicativo mobile React Native/Expo para motoristas e passageiros |
| [bevans-backend](https://github.com/pethersonzada/bevans-backend) | API REST Java/Spring Boot, persistência, autorização e operações |
| **[bevans-webapp](https://github.com/pethersonzada/bevans-webapp)** | Site institucional, login e painel web |
| [bevans-agente](https://github.com/pethersonzada/bevans-agente) | Agente de suporte com busca em FAQ (RAG), projeto separado |

## Stack

- **Next.js 16.4.6** com App Router e **React 19.2.8**.
- **Tailwind CSS 4**, CSS do site e do painel, design responsivo e temas claro/escuro.
- Autenticação via **Firebase Identity Toolkit REST**.
- Integração com **API BeVans** usando token Firebase no cabeçalho `Authorization: Bearer <token>`.
- Testes via **Node.js test runner**, ESLint e build de produção Next.js.

## Requisitos e execução local

- Node.js **20.9+** e npm.
- Acesso ao projeto Firebase correto e à API BeVans para testar login e operações reais.
- Para acessar apenas a landing page, não é necessário configurar a API.

```bash
git clone https://github.com/pethersonzada/bevans-webapp.git
cd bevans-webapp
npm ci
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Configuração

Crie um arquivo `.env.local` **sem versionar credenciais**:

```dotenv
# Site institucional
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
NEXT_PUBLIC_CONTACT_EMAIL=contato@seu-dominio.com

# Login/painel web (necessários para funcionalidades autenticadas)
NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY=sua_chave_web_publica_firebase
NEXT_PUBLIC_BEVANS_API_URL=https://sua-api-bevans.exemplo.com
NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN=pk.seu_token_publico_mapbox
```

| Variável | Utilização |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Base de URLs para metadados e sitemap; usa `https://bevans-webapp.vercel.app` como padrão |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Destinatário do formulário comercial via `mailto:`; sem ela, o formulário não prepara o e-mail |
| `NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY` | Chave pública web do Firebase usada pelo fluxo de login e recuperação de senha |
| `NEXT_PUBLIC_BEVANS_API_URL` | URL de origem da API BeVans; o cliente exige HTTPS, com HTTP permitido apenas para `localhost`/`127.0.0.1` no desenvolvimento |
| `NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN` | Token **público** Mapbox restrito a domínios autorizados para exibir mapas e calcular direções no painel |

> Variáveis `NEXT_PUBLIC_*` ficam visíveis no JavaScript entregue ao navegador. **Nunca** armazene nelas chaves privadas, contas de serviço, tokens secretos ou senhas. A chave web pública do Firebase não substitui as regras de segurança e autorização do backend.

### Comandos

```bash
npm run dev     # servidor local
npm test        # testes do repositório
npm run lint    # ESLint
npm run build   # build de produção
npm start       # servidor de produção após build
```

O workflow em `.github/workflows/quality.yml` também executa verificações automatizadas. Antes de publicar, confira especialmente login, requisições autenticadas, páginas institucionais e os dois temas em um navegador real.

## Rotas e funcionalidades

| Rota | Situação / finalidade |
| --- | --- |
| `/` | Landing page: recursos do aplicativo, modalidades, demonstrações e FAQ |
| `/login` | **Login funcional** usando Firebase, seguido de consulta de perfil à API |
| `/painel` | Painel autenticado com áreas operacionais por perfil |
| `/cadastro` | Página informativa: **novos cadastros públicos indisponíveis** |
| `/excursoes` | Apresentação das excursões e distinção entre app mobile e painel web |
| `/convite#<token>` | Inscrição pública por convite de excursão, sem Firebase. O segredo é lido do fragmento e enviado exclusivamente via headers. |
| `/contato` | Contato comercial preparado no cliente por `mailto:` |
| `/termos` | Termos institucionais |
| `/privacidade` | Política de privacidade do site |

### Autenticação e autorização

1. A pessoa informa e-mail e senha na interface de `app/painel/AuthEntry.jsx`.
2. `app/lib/bevans-auth.mjs` chama o Firebase Identity Toolkit para autenticar.
3. O cliente solicita o perfil em `/usuarios/por-uid/{uid}`, com Bearer token.
4. O painel apresenta opções segundo o perfil recuperado (`MOTORISTA`, `PASSAGEIRO` ou `ALUNO`).
5. As chamadas do painel passam por `app/lib/bevans-api.mjs`; a **autorização definitiva** de acesso a dados e operações pertence ao backend.

A sessão é mantida **em memória da aba**, incluindo o token de atualização. Ao recarregar a página pode ser necessário entrar novamente; nenhuma persistência de sessão em cookies está implementada nesse cliente. O login contempla recuperação de senha pelo fluxo Firebase, conforme a configuração do projeto.

### Painel operacional

`app/painel/AuthEntry.jsx` expõe áreas de **início, turmas, rotas públicas, solicitações, excursões, notificações, operações, mapa e viagens, endereços, coleta privada e configurações**. Para motoristas, inclui também editores de rotas públicas e excursões. O painel consome a API para buscar dados e oferecer ações conforme o perfil. A cobertura das ações varia por módulo e por papel. Não confunda a existência de uma seção web com paridade funcional completa com o aplicativo Android.

### Excursões e modalidades

- **Turmas e rotas**: fluxos de operação disponíveis no ecossistema BeVans.
- **Excursões**: o app mobile oferece os fluxos operacionais; no webapp existem cadastro, publicação, modo de coleta, paradas, convites, inscrições, prévia, execuções e acompanhamento, sujeitos à homologação com o backend.
- **Gestão de frotas**: evolução futura, sem promessa de disponibilidade no produto atual.
- Não há venda automatizada de planos nem cadastro público aberto no webapp.

## Estrutura principal

```text
app/
├── components/            # navegação, apresentação e seções da landing page
├── painel/
│   ├── AuthEntry.jsx      # login e áreas operacionais autenticadas
│   ├── ColetaPrivadaWeb.jsx # configuração, sugestão e escolha de paradas
│   ├── ColetaExcursaoWeb.jsx # editor de coleta para excursões
│   ├── ConfiguracoesWeb.jsx # preferências e contato comercial
│   ├── ViagensWeb.jsx      # GPS, viagem, presença e manobras
│   ├── RotasEditorWeb.jsx  # rotas públicas e paradas
│   └── painel.css         # estilos do painel
├── lib/
│   ├── bevans-auth.mjs    # autenticação e recuperação pelo Firebase
│   └── bevans-api.mjs     # cliente HTTP, tratamento de erros e contratos
├── convite/               # inscrição pública com credencial individual
├── login/                 # entrada autenticada
├── cadastro/              # aviso de cadastro público fechado
├── excursoes/             # apresentação das excursões
├── contato/               # contato comercial
├── termos/                # termos institucionais
├── privacidade/           # privacidade do site
├── layout.js              # metadados, fontes, tema
└── page.js                # página inicial
tests/                     # testes Node
public/images/             # assets oficiais e institucionais
next.config.mjs            # imagens remotas e cabeçalhos HTTP
```

## Contato, privacidade e segurança

O formulário de contato **não possui backend de envio**: prepara um e-mail no aplicativo do visitante, caso `NEXT_PUBLIC_CONTACT_EMAIL` esteja configurado. Não armazena as mensagens no webapp.

O cliente exige HTTPS para o endereço da API fora do desenvolvimento local, envia token no cabeçalho e emprega timeout. O `next.config.mjs` define cabeçalhos como `X-Content-Type-Options`, `X-Frame-Options` e `Referrer-Policy`. A verificação de permissões e de propriedade dos recursos **deve ocorrer no servidor**.

Este repositório não deve conter arquivos `.env.local` com valores reais, segredos Firebase Admin nem tokens de acesso. A política em `/privacidade` e os termos em `/termos` exigem revisão jurídica e operacional antes de serviços comerciais envolvendo dados reais.

## Deploy e verificações

1. Configure as variáveis de ambiente aplicáveis ao ambiente de hospedagem: `NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY`, `NEXT_PUBLIC_BEVANS_API_URL` e `NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN` para mapas.
2. Disponibilize a API BeVans publicamente por HTTPS e configure no backend as origens permitidas para requisições do navegador.
3. Execute `npm test && npm run lint && npm run build`.
4. Valide o acesso com uma conta autorizada e as permissões correspondentes no backend.
5. Verifique experiência mobile, tema escuro, contatos e páginas institucionais.

O repositório usa a hospedagem de referência `https://bevans-webapp.vercel.app` como URL padrão para metadados. Atualize `NEXT_PUBLIC_SITE_URL` ao configurar domínio próprio.

## Limitações e próximos passos

- Cadastro público fechado.
- **PR #19 já integrado à main:** mapas Mapbox, GPS autorizado, presença, endereços, rotas e excursões.
- **PR #23 integrado à main:** coleta privada com paradas e seleção pelo passageiro, entrada em turma com convite, coleta e paradas das excursões, publicação/disponibilidade/pontos excepcionais de rotas, preferências de notificações e contato comercial, recuperação voluntária por credencial individual de inscrição, guia manual de manobras Mapbox.
- Cobertura web ainda parcial em relação aos recursos do aplicativo Android, especialmente navegação automática assistida por GPS, notificações push para navegador, gestão de responsáveis, perfil completo, testes reais de homologação e recursos específicos de segundo plano.
- GPS no navegador depende de HTTPS, permissão explícita, aba visível e autorização do backend. O envio limita a frequência a pelo menos cinco segundos e é interrompido quando a aba fica oculta. Não há localização em segundo plano.
- A rota rodoviária usa a API Directions do Mapbox quando solicitada, limitada a 25 coordenadas e sem omitir paradas.
- O fluxo público de convites exige revisão de consentimentos e privacidade, especialmente para menores, antes de produção. A credencial individual nunca é salva automaticamente em `localStorage`, cookie ou URL; o titular deve copiá-la para reabrir a inscrição.
- A navegação no webapp mostra manobras da API Directions do Mapbox em sequência **manual**. Não realiza condução por voz ou avanço automático do GPS.
- O backend precisa permitir CORS para a origem do webapp, manter autenticação/autorização em todas as operações privadas e limitar localização a perfis autorizados.
- Conteúdo ilustrativo da landing page não representa dados de viagens reais.
- O contato comercial depende de um aplicativo de e-mail instalado/configurado no dispositivo.
- Validações automatizadas não substituem testes de integração com Firebase/API e revisão visual.

## Licença e autoria

Consulte o arquivo `LICENSE` deste repositório para conhecer as condições vigentes de uso e distribuição do código.

Projeto **BeVans**. Documentação atualizada a partir da estrutura existente no repositório em novembro de 2026.


### Verificação de implantação e homologação

A `main` conta com um workflow `Deployment HTTP smoke (read only)` que verifica o SHA publicado em `https://bevans-webapp.vercel.app/api/build-info`, os cabeçalhos de segurança, `robots.txt` e a página de convite. São apenas requisições GET sem autenticação; não valida Firebase, API ou GPS.

O workflow `Staging security smoke (read only)` é manual e exige duas origens **isoladas** (web e API) e um SHA esperado. Antes de usá-lo, siga [docs/staging-setup-web.md](docs/staging-setup-web.md). Previews Vercel são protegidos por SSO; testes não devem desabilitar essa proteção por conveniência.

Um deploy `READY` significa que a versão foi construída e disponibilizada, não que o fluxo completo foi homologado.


## Assistente virtual na versão web

A rota pública [`/assistente`](https://bevans-webapp.vercel.app/assistente) incorpora o [Assistente BeVans](https://bevans-suporte.streamlit.app/) usando `https://bevans-suporte.streamlit.app/?embed=true`. A Vercel hospeda apenas a página Next.js; a conversa, o RAG e o FAQ continuam hospedados no **Streamlit Community Cloud** e mantidos no repositório `pethersonzada/bevans-agente`.

- A URL pública fica em `app/lib/assistente.mjs`; altere as duas constantes se o aplicativo do Streamlit mudar de endereço. Não é necessário configurar variável de ambiente para esse endereço público.
- Não coloque `OPENAI_API_KEY`, tokens do Firebase ou credenciais Python em `NEXT_PUBLIC_*` ou no navegador. O assistente é externo e **não recebe automaticamente** a sessão BeVans. A integração é um iframe, sem API nativa de chat no webapp.
- Para testar localmente, execute `npm ci && npm test && npm run lint && npm run build && npm run dev`; acesse `http://localhost:3000/assistente`, confira o menu desktop/móvel, o tema claro/escuro, a moldura e o link **Abrir assistente em nova aba**.
- Para homologar na Vercel, confirme a publicação do SHA esperado, abra `/assistente` em navegador real e faça uma pergunta fictícia ao FAQ. Verifique que o Streamlit está **público e acordado**; em caso de bloqueio por iframe, extensões, CSP ou indisponibilidade, use o link externo sempre visível. O evento `onload` de um iframe não comprova que o chat ficou utilizável.
- No projeto Streamlit, configure `OPENAI_API_KEY` exclusivamente nos **Secrets do Streamlit**. Não exponha nomes, endereços, localização, senhas, credenciais ou dados de menores nas perguntas.
- O CSS e a moldura estão em `app/assistente/assistente.css`. `next.config.mjs` não contém regra `frame-src` que impeça este domínio; qualquer nova política CSP deve permitir **somente** a origem `https://bevans-suporte.streamlit.app` para o iframe.

Os testes Playwright usam uma resposta **simulada** para o iframe, portanto comprovam navegação, composição e alternativa externa, não a geração de respostas da OpenAI nem a disponibilidade permanente do Streamlit.
