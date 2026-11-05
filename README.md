# Contrato Fácil

Aplicativo local para oficinas preencherem peças, valores e condições de serviço e gerarem um contrato para impressão ou PDF. Feito com HTML, CSS e JavaScript, com foco em rapidez, legibilidade e uso por pessoas sem experiência técnica.

## Entrega ao cliente: um único arquivo

Envie somente **`index.html`**. O cliente abre o arquivo no navegador, sem instalar Node.js, npm ou dependências. O aplicativo funciona offline e não envia os dados a serviços externos.

Node.js e Playwright são usados exclusivamente nos testes de desenvolvimento. Os arquivos `package.json`, `package-lock.json`, `tests/` e `.agents/` não precisam acompanhar a entrega.

## Como usar

1. Abra `index.html` no navegador. A impressão foi validada no Google Chrome.
2. Preencha os dados da oficina, do cliente e, se desejar, do veículo.
3. Acesse **Peças e serviços** pelo menu, adicione os itens e informe quantidades e valores unitários.
4. Em **Cláusulas**, revise os textos e adicione, edite ou remova as condições necessárias.
5. Clique em **Imprimir / salvar PDF** e escolha a impressora ou **Salvar como PDF**, usando papel A4.

Salve o PDF antes de fechar ou recarregar a página: os dados do contrato não são mantidos entre sessões.

## Recursos e usabilidade

- Menu fixo à esquerda no computador, com links âncora para cada seção e para a impressão. Em telas menores, a navegação passa para o topo.
- Três tamanhos de fonte: **Normal**, **Grande** e **Extra grande**. A preferência é mantida neste navegador quando o armazenamento local está disponível e não muda a fonte do PDF.
- Uma seção de preenchimento aberta por vez. Os editores de peças e cláusulas são recolhíveis e mostram resumos para facilitar a revisão.
- Listas divididas em páginas de cinco registros, com apenas um editor aberto por lista. Todos os registros são incluídos no contrato, mesmo em páginas ou seções fechadas.
- Botões de adicionar em barras que acompanham a seção durante a rolagem. Novos registros abrem na última página, já com foco no campo de preenchimento.
- Totais automáticos em reais, calculados em centavos, com subtotais por item.
- Validação de dados obrigatórios, quantidades inteiras e preços não negativos. Um erro abre automaticamente sua seção, página e editor para correção.
- Campos com rótulos, foco visível, botões grandes e navegação por teclado.
- Cláusulas numeradas automaticamente e espaços para assinatura no contrato.

As duas cláusulas da versão original são carregadas como ponto de partida editável. Revise os textos conforme as condições da oficina antes de gerar cada contrato.

## Catálogo local de peças

O catálogo contém 65 peças e insumos comuns, com nomes alternativos. Digite ao menos duas letras no campo **Peça ou serviço** para receber até seis sugestões.

A busca ignora acentos e maiúsculas, prioriza correspondências diretas e usa distância de edição para tolerar pequenos erros, como `pistao`, `cabesote` e `virabrequin`.

- **↑ / ↓:** percorrem as sugestões.
- **Enter:** seleciona a sugestão destacada.
- **Esc:** fecha a lista.
- **Tab:** segue para o próximo campo.

Também é possível selecionar com o mouse ou escrever livremente peças e serviços fora do catálogo. As sugestões não preenchem preços nem verificam compatibilidade com veículos.

Para ampliar o catálogo, edite o bloco JSON `catalogoPecas` em `index.html`. Cada entrada contém `nome` e uma lista de `apelidos`. O catálogo fica embutido no HTML para permitir a abertura direta do arquivo, sem servidor ou acesso à rede.

## Impressão e PDF

O contrato usa papel A4 com margens de 15 mm. A interface e os controles de navegação ficam ocultos na impressão. A tabela repete o cabeçalho nas páginas seguintes, e cláusulas longas podem continuar na próxima página sem serem cortadas.

O estilo de impressão declara caixas de margem vazias para suprimir data/hora, título do aplicativo, URL e numeração inseridos pelo navegador. A remoção foi validada no **Chrome 156.0.8078.80**, comparando PDFs com a opção de cabeçalhos e rodapés ligada e desligada, inclusive com múltiplas páginas.

Se outro navegador ou uma configuração personalizada ainda mostrar esses elementos, desmarque **Cabeçalhos e rodapés** em **Mais configurações** na janela de impressão. A data escolhida no formulário permanece no corpo do contrato.

A janela de impressão também pode ser aberta pelo atalho do navegador; o contrato é atualizado antes de imprimir. A geração não baixa um arquivo automaticamente: o usuário escolhe o destino nessa janela.

## Desenvolvimento e testes

O projeto segue as skills locais de código limpo e layout acessível em `.agents/skills/`. O código usa APIs nativas do navegador e funções pequenas. Os textos do usuário são inseridos no contrato com `textContent`, sem execução de HTML.

Com Node.js 20 ou superior e Google Chrome instalado:

```sh
npm ci
npm test
```

Os testes usam Playwright com Chrome em modo headless e cobrem:

- Busca aproximada, nomes alternativos, seleção por mouse e teclado.
- Totais, validação, tratamento seguro de textos e edição de cláusulas.
- Navegação por âncoras, abertura de editores e paginação de listas extensas.
- Foco em erros de campos recolhidos ou fora da página atual.
- Três tamanhos de fonte, preferência entre recargas e layout em 375, 768, 1200 e 1440 pixels.
- Inclusão de todos os itens e cláusulas no PDF e equivalência da saída com cabeçalhos automáticos ligados ou desligados.

Também foi feita conferência visual do formulário e de um PDF de quatro páginas com cláusula longa. A validação automatizada não substitui testes com leitores de tela ou a conferência da impressora usada pela oficina.

## Estrutura

```text
index.html        Interface, estilos, catálogo JSON e lógica do aplicativo
.agents/skills/   Diretrizes locais de código limpo e layout acessível
tests/            Testes de fluxo no navegador
package.json      Comandos e dependências exclusivas de desenvolvimento
```

## Limitações atuais

- Dados do contrato e cláusulas alteradas não são salvos entre sessões; apenas a preferência de fonte pode ser mantida.
- O catálogo é inicial e ampliado manualmente. A busca aproximada pode sugerir peças diferentes da desejada.
- A quantidade aceita unidades inteiras. Valores unitários aceitam duas casas decimais, inclusive zero para itens sem cobrança.
- O destino do PDF e ajustes personalizados da impressão dependem do navegador.
