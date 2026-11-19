# BeVans WebApp: reformulação visual do login e painel

Esta atualização é um **overlay** sobre o repositório `bevans-webapp` que já recebeu `bevans-webapp-implementacao-inicial.zip` e `bevans-webapp-acesso-melhorado.zip`.

## O que muda

- Login: layout em duas colunas no desktop, institucional em azul escuro, formulário sem caixa solta, opção de mostrar senha e recuperação preservadas.
- Painel: barra lateral para navegação desktop, navegação horizontal no mobile, cabeçalho, KPIs, atalhos e área de perfil.
- Todas as áreas operacionais existentes (`Turmas`, `Rotas públicas`, `Solicitações`, `Excursões`, `Notificações`, `Operações`) preservam os componentes e chamadas à API anteriores.
- O cadastro público continua fechado. Nenhuma criação de usuário foi introduzida.

## Instalação (PowerShell)

```powershell
cd C:\dev\bevans-webapp
git status
Expand-Archive "$env:USERPROFILE\Downloads\bevans-webapp-redesign.zip" -DestinationPath "C:\dev\bevans-webapp" -Force
npm test
npm run lint
npm run build
npm run dev
```

Atenção: o overlay contém `LEIA-ME.md` na raiz e arquivos em `app/painel/` e `tests/`. Se a sua pasta Downloads guardar o ZIP com outro nome, ajuste o caminho. Não inclui arquivos de ambiente, senhas ou tokens.

## Validação manual

1. Visite `/login` sem autenticação, verifique desktop e mobile (devtools responsivo).
2. Entre com uma conta já existente. Valide sidebar, navegação e dados oficiais.
3. Alterne as abas e cheque estados vazios/erros; teste logout e recuperação de senha.
4. Redimensione para ~390 px e confirme que a navegação mobile aparece e os cards não extravasam.
5. Confira console e Network para erros de API/CORS.

## Limitações

- Esta entrega redesenha as telas sem alterar a camada de autenticação nem contratos do backend.
- Os três testes incluídos passaram e o JSX foi analisado sem erro de sintaxe usando o parser do TypeScript. Não foi feito um `next build` completo neste ambiente, nem validação no seu navegador. Confira os comandos acima antes de qualquer commit ou push.
- Nenhuma tela de cadastro novo é exposta, mas regras de criação de contas devem ser impostas também no Firebase/backend; esconder UI, sozinho, não é controle de autorização.
