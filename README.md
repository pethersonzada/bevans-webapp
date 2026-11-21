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

- **Next.js 16.3.3** com App Router e **React 19.2.8**.
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

# Opcional: percursos viários e instruções em mapas autorizados
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.seu_token_publico_mapbox
```

| Variável | Utilização |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Base de URLs para metadados e sitemap; usa `https://bevans-webapp.vercel.app` como padrão |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Destinatário do formulário comercial via `mailto:`; sem ela, o formulário não prepara o e-mail |
| `NEXT_PUBLIC_BEVANS_FIREBASE_API_KEY` | Chave pública web do Firebase usada pelo fluxo de login e recuperação de senha |
| `NEXT_PUBLIC_BEVANS_API_URL` | URL de origem da API BeVans; o cliente exige HTTPS, com HTTP permitido apenas para `localhost`/`127.0.0.1` no desenvolvimento |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Chave pública opcional para traçar percursos e exibir instruções viárias via Mapbox Directions, somente por ação explícita |

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

`app/painel/AuthEntry.jsx` expõe áreas de **início, turmas, rotas públicas, solicitações, excursões, notificações e operações**. O painel consome a API para buscar dados e oferecer ações conforme o perfil. A cobertura das ações varia por módulo e por papel. Não confunda a existência de uma seção web com paridade funcional completa com o aplicativo Android.

### Mapas, presença e GPS no painel web (implementação em validação)

O painel possui módulos web de **endereços, presença diária, turmas, coleta privada, rotas públicas, GPS, operações e excursões**. Estas integrações estão em validação no pull request [#18](https://github.com/pethersonzada/bevans-webapp/pull/18), antes de entrar na branch de produção.

- **Endereços:** cadastrar, editar e excluir endereços próprios com pin explicitamente selecionado no mapa. A precisão do pin deve ser conferida pelo usuário.
- **Presença:** confirmar ida, volta, ambos, ausência ou limpar a confirmação para a turma selecionada, usando `/rota/confirmar` e `/rota/minha-confirmacao`.
- **Turmas:** criar, editar cadastro e extremos, consultar passageiros, remover vínculo, regenerar código e pedir ingresso por código como passageiro.
- **Coleta privada:** motorista define pontos por sentido ou porta a porta; passageiro escolhe a própria parada e a presença respeita a configuração oficial.
- **Rotas públicas:** criar, editar, ordenar paradas, publicar, obter prévia de ordem e iniciar viagem pública com autenticação de motorista.
- **Viagens privadas:** início e encerramento do ciclo, com consulta de estado oficial e bloqueio antes do encerramento se houver passageiros embarcados.
- **Mapa operacional:** motorista autenticado consulta `/operacoes/VIAGEM/{id}/roteiro` e passageiros autorizados consultam somente a posição GPS da van. Posição obsoleta/expirada não é exibida como atual.
- **GPS do navegador:** motorista pode autorizar o envio de sua localização para `PUT /viagens/{id}/localizacao` durante viagem ativa, com frequência controlada. HTTPS e permissão de localização são obrigatórios; **o envio para ao ocultar a aba**. Não é substituto do rastreamento nativo contínuo em segundo plano.
- **Mapa externo:** Leaflet 1.9.4 com tiles OpenStreetMap. Em mapas privados e de endereços o carregamento depende de ação explícita, pois o provedor externo recebe solicitações de tiles. Linhas pontilhadas mostram apenas a sequência dos pontos, não vias.
- **Rotas pelas ruas:** opcionalmente, um motorista pode autorizar uma chamada ao Mapbox Directions (máximo 25 pontos válidos) para receber percurso por vias e instruções. O token público deve estar configurado. Essa consulta envia as coordenadas do roteiro ao Mapbox; uma confirmação antecede o envio.

- **Excursões no painel:** organizador pode criar/editar rascunho, configurar coleta, publicar/cancelar, emitir/revogar convites, consultar e confirmar inscrições, iniciar/finalizar execuções, registrar embarque/desembarque e transmitir GPS durante execução autorizada.
- **Inscrição por convite:** página `/convite` usa fragmento local `#token=...` e os cabeçalhos `X-Convite`/`X-Inscricao` nos contratos públicos. A credencial individual permanece em memória na aba; o usuário deve copiá-la e guardá-la antes de prosseguir. O fluxo de convite não concede acesso a localização privada nem perfis de terceiros.

**Limites atuais:** o navegador não oferece equivalência a GPS em segundo plano, navegação guiada/turn-by-turn nativa ou push do Expo. A operação web tem cobertura nova, sem equivalência funcional comprovada por testes ponta a ponta. **Dados de menores, consentimento verificável, política de retenção e revisão de CORS/privacidade exigem homologação antes de uso público.**

### Excursões e modalidades

- **Turmas e rotas**: fluxos de operação disponíveis no ecossistema BeVans.
- **Excursões**: funções de gestão e convite estão implementadas nesta branch web e no aplicativo, mas dependem de testes integrados antes de lançamento público.
- **Gestão de frotas**: evolução futura, sem promessa de disponibilidade no produto atual.
- Não há venda automatizada de planos nem cadastro público aberto no webapp.

## Estrutura principal

```text
app/
├── components/            # navegação, apresentação e seções da landing page
├── painel/
│   ├── AuthEntry.jsx      # login e áreas operacionais autenticadas
│   ├── MapaOperacional.jsx # mapa e roteamento opcional
│   ├── GestaoTurmaWeb.jsx # gestão de turmas e participantes
│   ├── ColetaPrivadaWeb.jsx # coleta e escolha de paradas
│   ├── EditorRotaWeb.jsx # editor de rotas públicas
│   ├── GestaoExcursaoWeb.jsx # excursões e convites
│   └── painel.css         # estilos do painel
├── lib/
│   ├── bevans-auth.mjs    # autenticação e recuperação pelo Firebase
│   └── bevans-api.mjs     # cliente HTTP, tratamento de erros e contratos
├── convite/               # inscrição individual por convite
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

A página `/convite` não envia tokens na URL da API. Como as credenciais individuais dão acesso à inscrição, **não** as compartilhe com outras pessoas nem registre cabeçalhos ou corpos dessas chamadas em ferramentas de observabilidade. Configurar CORS apenas para as origens necessárias e revisar a política de privacidade para os dados efetivamente tratados.

## Deploy e verificações

1. Configure as quatro variáveis de ambiente aplicáveis ao ambiente de hospedagem; as duas últimas são indispensáveis ao painel autenticado.
2. Disponibilize a API BeVans publicamente por HTTPS e configure no backend as origens permitidas para requisições do navegador.
3. Execute `npm test && npm run lint && npm run build`.
4. Valide o acesso com uma conta autorizada e as permissões correspondentes no backend.
5. Verifique experiência mobile, tema escuro, contatos e páginas institucionais.

O repositório usa a hospedagem de referência `https://bevans-webapp.vercel.app` como URL padrão para metadados. Atualize `NEXT_PUBLIC_SITE_URL` ao configurar domínio próprio.

## Limitações e próximos passos

- Cadastro público fechado.
- Cobertura web ainda parcial em relação aos recursos do aplicativo Android.
- Conteúdo ilustrativo da landing page não representa dados de viagens reais.
- O contato comercial depende de um aplicativo de e-mail instalado/configurado no dispositivo.
- Validações automatizadas não substituem testes de integração com Firebase/API e revisão visual.

## Licença e autoria

Consulte o arquivo `LICENSE` deste repositório para conhecer as condições vigentes de uso e distribuição do código.

Projeto **BeVans**. Documentação atualizada a partir da estrutura existente no repositório em novembro de 2026.
