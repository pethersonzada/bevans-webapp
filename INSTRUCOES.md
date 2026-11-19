# BeVans WebApp | Correções de contraste e identidade no tema escuro

Aplicar sobre o projeto que **já recebeu** as atualizações `bevans-webapp-redesign-coerente.zip` e `bevans-webapp-tema-escuro.zip`. Este pacote contém apenas os arquivos modificados.

## Alterações

- Contraste dos títulos e textos destacados, rótulos, FAQ, cards, seções institucionais e componentes adicionais em dark.
- Cabeçalho e marca do painel com imagens oficiais distintas para modo claro/escuro. Sem filtros `brightness()` ou `invert()` para o logo.
- Títulos mais compactos e informativos nas seções principais; status das modalidades com indicadores discretos.
- Nenhuma alteração intencional em API, Firebase, autenticação e cadastro público.

## Atualizar no Windows

```powershell
cd C:\dev\bevans-webapp
# Opcional: veja as alterações não commitadas antes de sobrescrever arquivos
git status
Expand-Archive "$env:USERPROFILE\Downloads\bevans-webapp-contraste-dark-corrigido.zip" -DestinationPath "C:\dev\bevans-webapp" -Force
npm test
npm run lint
npm run build
npm run dev
```

Recarregar com `Ctrl + Shift + R`. Testar claro e escuro no computador e celular, principalmente cabeçalho, FAQ, modalidades, experiência, login e painel. Os controles de tema continuam funcionando pelo `ThemeToggle` já instalado.

## Validação neste ambiente

- 41/41 testes Node aprovados.
- Sintaxe JSX analisada sem erros.
- Cores de texto selecionadas calculadas com contraste >= 4,5:1 (WCAG AA em condições de cor correspondentes).
- Lint/Build Next.js: **não executados** por ausência de dependências Node completas neste ambiente.
- Renderização por Chromium não concluída, portanto validar os resultados visuais no navegador antes de publicar.

Não realizar push automático. Faça commit na `main` apenas após checar o resultado.
