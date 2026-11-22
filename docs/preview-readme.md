# BeVans WebApp Preview

Esta branch contém uma versão de teste do webapp. Ela deve permanecer protegida pelo SSO da Vercel.

**Estado do provisionamento (22/11/2026):** frontend Preview inicializado. A variável pública `NEXT_PUBLIC_SITE_URL` foi configurada somente para Preview da branch `staging`, apontando para o alias da própria branch. Firebase Auth, API PostgreSQL e Mapbox de homologação continuam sem configuração. Não reutilize credenciais de produção.

As instruções de ativação e os gates de aceite estão em [docs/staging-setup-web.md](staging-setup-web.md). A configuração das variáveis deve ser específica deste target/branch no painel da Vercel. A publicação de um Preview `READY` não prova integração real.

Nenhum teste deve criar, excluir ou modificar dados de pessoas reais. Os testes de integração exigem projeto Firebase e banco isolados, contas descartáveis e autorização da equipe.
