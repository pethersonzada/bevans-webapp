# BeVans WebApp

Landing page institucional do BeVans, desenvolvida com Next.js 16 (App Router), React 19 e Tailwind CSS 4.

## Executar localmente

Requer Node.js 20.9 ou superior e npm.

```bash
npm ci
npm run dev
```

Acesse http://localhost:3000. Execute `npm test`, `npm run lint` e `npm run build` antes de publicar. O workflow do GitHub Actions executa as três verificações em cada alteração.

## Configuração

Crie um arquivo `.env.local` com estas variáveis opcionais:

```env
NEXT_PUBLIC_CONTACT_EMAIL=contato@seu-dominio.com
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

**Não existe um e-mail comercial fixo no código.** Sem `NEXT_PUBLIC_CONTACT_EMAIL`, o formulário de contato exibe um aviso e impede o envio. Com a variável definida, o formulário prepara um e-mail no aplicativo do visitante; ele **não** envia uma solicitação por API nem salva dados em um banco.

O sitemap e os metadados usam como base padrão `https://bevans-webapp.vercel.app`. Configure `NEXT_PUBLIC_SITE_URL` caso utilize um domínio próprio.

## Rotas

- `/`: apresentação, funcionalidades, públicos, planos e FAQ.
- `/contato`: mensagem comercial via aplicativo de e-mail.
- `/termos`: informações institucionais e termos preliminares. Antes de operar com dados reais, é necessária revisão jurídica e política de privacidade completa.

## Importante

As telas de rota e os números apresentados são **ilustrativos**. A landing page não implementa rastreamento, cadastro, autenticação nem serviços de backend. Os preços devem ser confirmados antes de comercializar o serviço. A equipe deve validar os textos sobre recursos e condições antes da publicação.

© 2026 Autores do projeto BeVans. Todos os direitos reservados.

## Identidade visual

A identidade foi alinhada ao app mobile `pethersonzada/bevans-frontend`: azul primário `#007BFF`, azul escuro `#0056b3`, superfícies brancas e fundo `#F8F9FA`. A logo exibida no site usa a imagem oficial `assets/images/logo-app-sem-fundo-sem-titulo.png` do repositório mobile, referenciada por sua URL pública no GitHub. O componente `next/image` otimiza e armazena em cache a imagem via Next.js, mas a origem ainda depende de um arquivo remoto. Para remover essa dependência, é necessário importar o binário oficial do aplicativo em `public/images`.

## Qualidade e segurança

O pipeline `.github/workflows/quality.yml` executa testes de contato (`node --test`), lint e build em cada push e pull request. Cabeçalhos HTTP básicos são configurados em `next.config.mjs`. O formulário comercial continua sendo um fluxo `mailto:`, sem armazenamento nem envio de dados por API.

A política de privacidade do site (`/privacidade`) é separada dos termos (`/termos`) e não deve ser confundida com a documentação de privacidade do aplicativo React Native.

## Design de modalidades (prévia)

- `/excursoes`: apresentação do fluxo planejado pelo MVP (backend #28-32 e frontend mobile #16); sem convites, inscrições ou reserva de vaga ativos.
- `/login` e `/cadastro`: telas de prévia de interface, sem campos interativos, coleta de senhas, integrações com Firebase ou chamadas de API.
- `/#precos`: planos comerciais de referência; não pressupõem que os módulos futuros estejam disponíveis.

Nenhuma variável de ambiente, token ou segredo de Firebase/Mapbox foi adicionada com esta entrega. A integração será feita separadamente quando os contratos e regras de autorização estiverem definidos.

## Coerência entre produtos


## Administração

A antiga rota `/gestor` e o componente `ManagerPreview` foram removidos. Não há papel ADMINISTRADOR implementado no aplicativo/backend nem escopo formal de administração da plataforma. Uma futura interface administrativa exige definição de permissões no backend; não deve ser confundida com a gestão de turmas pelo motorista.

## Estado comercial

A seção de modalidades separa funcionalidades do aplicativo mobile de projetos futuros (excursões e gestão de frotas). Preços antigos não confirmados foram retirados da interface para evitar confusão com serviços já contratáveis.
