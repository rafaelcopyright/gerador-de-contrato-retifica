# Contrato Fácil

Aplicativo em HTML, CSS e JavaScript para oficinas preencherem peças, valores e condições de serviço e gerarem um contrato para impressão ou PDF.

## Como usar

1. Abra `index.html` no Chrome, Edge ou Firefox atualizado.
2. Preencha os dados da oficina e do cliente.
3. Adicione peças ou serviços, quantidades e valores unitários.
4. Adicione e edite as cláusulas acordadas com o cliente.
5. Clique em **Imprimir / salvar PDF** e escolha a impressora ou **Salvar como PDF**.

Use papel A4 e desative cabeçalhos e rodapés na janela de impressão. O PDF contém os dados preenchidos, tabela de itens, total, cláusulas numeradas e espaços para assinatura.

## Recursos

- Campos com rótulos, letras grandes, foco visível e layout adaptado a telas menores.
- Adição e remoção de itens; totais automáticos em reais com cálculo em centavos.
- Criação, edição e remoção de cláusulas antes de imprimir.
- Validação de campos obrigatórios, quantidades inteiras e preços não negativos.
- Impressão A4, cabeçalho da tabela repetido em páginas seguintes e interface oculta no PDF.
- Funcionamento local e offline, sem instalação, cadastro ou dependências externas.

## Desenvolvimento

O arquivo `index.html` reúne estilos, HTML semântico e funções JavaScript pequenas, conforme as diretrizes em `.agents/skills/`. Os estilos são locais para permitir uso offline. Textos do usuário são inseridos no contrato com `textContent`, sem execução de HTML.

Não há servidor nem envio dos dados a serviços externos. Nesta versão, fechar ou recarregar a página limpa o preenchimento. A impressão é feita pela janela do navegador; nenhum arquivo é baixado automaticamente. As condições contratuais devem ser definidas pela oficina.

## Catálogo de peças e busca

O catálogo local contém 65 peças e insumos comuns, com nomes alternativos. Digite ao menos duas letras no campo **Peça ou serviço** para receber até seis sugestões. A busca ignora acentos e maiúsculas, prioriza correspondências diretas e usa distância de edição para tolerar pequenos erros, por exemplo `pistao`, `cabesote` e `virabrequin`.

Selecione com o mouse ou com **↑ / ↓ e Enter**. **Esc** fecha a lista e **Tab** segue para o próximo campo. O texto digitado permanece livre: peças fora do catálogo e serviços também podem ser usados.

Para ampliar o catálogo, edite o bloco JSON identificado por `catalogoPecas` em `index.html`. Cada entrada tem `nome` e uma lista de `apelidos`. Ele fica embutido no HTML para funcionar offline, inclusive abrindo o arquivo diretamente, sem servidor ou requisições de rede. O catálogo sugere nomes; não define preços nem confirma compatibilidade com veículos.

As duas cláusulas da versão original são carregadas como ponto de partida editável. Revise, altere ou remova esses textos conforme as condições da oficina antes de gerar cada contrato.

## Testes

Para usar o aplicativo, basta abrir `index.html`; Node.js é necessário apenas para desenvolvimento.

Com Node.js 20 ou superior e Google Chrome instalado:

```sh
npm ci
npm test
```

Os testes usam Playwright com Chrome em modo headless e verificam:

- Busca sem acentos, nomes alternativos e pequenos erros de digitação.
- Seleção por clique e teclado, fechamento da lista e edição livre.
- Cálculo em centavos, dados obrigatórios e bloqueio de valores inválidos.
- Criação, edição e remoção de cláusulas e itens.
- Conteúdo de impressão, geração de PDF e tratamento seguro de textos.
- Rótulos dos campos e ausência de rolagem horizontal em 375, 768 e 1440 pixels.

Também foi feita uma conferência visual do formulário e do modelo de impressão no Chrome. A validação automatizada não substitui testes com leitores de tela ou a conferência da impressora usada pela oficina.

## Estrutura

```text
index.html        Interface, estilos, catálogo JSON e lógica do aplicativo
.agents/skills/   Diretrizes locais de código limpo e layout acessível
tests/            Testes de fluxo no navegador
```

## Limitações atuais

- Dados e cláusulas alteradas não são salvos entre sessões. Salve o PDF antes de fechar a página.
- O catálogo é inicial e pode ser ampliado manualmente; a busca aproximada pode sugerir peças diferentes da desejada.
- A quantidade aceita apenas unidades inteiras. Valores unitários aceitam duas casas decimais, inclusive zero para itens sem cobrança.
- A paginação e o destino do PDF dependem das opções de impressão do navegador.
