# BeVans WebApp

Landing page institucional do BeVans, desenvolvida com Next.js 16 (App Router), React 19 e Tailwind CSS 4.

## Executar localmente

Requer Node.js 20.9 ou superior e npm.

```bash
npm ci
npm run dev
```

Acesse http://localhost:3000. Execute `npm run lint` e `npm run build` antes de publicar.

## Configuração

Crie um arquivo `.env.local` com estas variáveis opcionais:

```env
NEXT_PUBLIC_CONTACT_EMAIL=contato@seu-dominio.com
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

**Não existe um e-mail comercial fixo no código.** Sem `NEXT_PUBLIC_CONTACT_EMAIL`, o formulário de contato exibe um aviso e impede o envio. Com a variável definida, o formulário prepara um e-mail no aplicativo do visitante; ele **não** envia uma solicitação por API nem salva dados em um banco.

A URL canônica usada no sitemap só é criada quando `NEXT_PUBLIC_SITE_URL` estiver configurada.

## Rotas

- `/`: apresentação, funcionalidades, públicos, planos e FAQ.
- `/contato`: mensagem comercial via aplicativo de e-mail.
- `/gestor`: aviso transparente de que a autenticação ainda está em desenvolvimento.
- `/termos`: informações institucionais e termos preliminares. Antes de operar com dados reais, é necessária revisão jurídica e política de privacidade completa.

## Importante

As telas de rota e os números apresentados são **ilustrativos**. A landing page não implementa rastreamento, cadastro, autenticação nem serviços de backend. Os preços devem ser confirmados antes de comercializar o serviço. A equipe deve validar os textos sobre recursos e condições antes da publicação.

© 2026 Autores do projeto BeVans. Todos os direitos reservados.

## Identidade visual

A identidade foi alinhada ao app mobile `pethersonzada/bevans-frontend`: azul primário `#007BFF`, azul escuro `#0056b3`, superfícies brancas e fundo `#F8F9FA`. A logo exibida no site usa a imagem oficial `assets/images/logo-app-sem-fundo-sem-titulo.png` do repositório mobile, referenciada por sua URL pública no GitHub. Essa referência exige disponibilidade de rede e do arquivo remoto; uma futura migração para asset local é recomendada.
