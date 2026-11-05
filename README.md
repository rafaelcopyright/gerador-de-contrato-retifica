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
