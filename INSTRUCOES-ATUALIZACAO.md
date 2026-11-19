# Atualização do BeVans WebApp

Este ZIP é um **overlay incremental** para aplicar sobre o `bevans-webapp` com a primeira implementação operacional já instalada.

Inclui:
- Botão Entrar no cabeçalho fixo, visível em desktop e mobile, sem abrir menu.
- CTA de login na abertura do site e no rodapé.
- Bloqueio público da rota `/cadastro`, sem coleta de dados ou formulário.
- Login com mostrar/ocultar senha, recuperação de senha pelo Firebase, estados de carregamento e mensagem genérica.
- Pequenos refinamentos responsivos e testes da política de acesso.

## Aplicar

```powershell
cd C:\dev\bevans-webapp
git status
Expand-Archive "$env:USERPROFILE\Downloads\bevans-webapp-acesso-melhorado.zip" -DestinationPath "C:\dev\bevans-webapp" -Force
npm test
npm run lint
npm run build
npm run dev
```

**Atenção:** `app/globals-access.css` precisa ser importado no layout via `app/layout.js`. Este pacote inclui `app/layout.js` atualizado apenas com o import; os demais estilos da landing permanecem.

Configurar a chave pública Firebase no `.env.local` e conferir o template de e-mail de redefinição no Firebase Authentication. O botão de recuperação não cria conta.

Não publique antes de rodar os testes e validar com suas contas de teste. Não houve push nem alteração remota.
