# Skill: Clean Code e Filosofia KISS (Keep It Simple, Stupid)

No contexto do nosso Gerador de Contratos (arquivo único HTML/JS/CSS), aplicar Clean Code não significa usar arquiteturas complexas ou padrões de projeto avançados. Significa escrever um código legível, direto e fácil de manter, respeitando a regra de ouro: **KISS (Keep It Simple, Stupid)**.

## 1. Separação de Responsabilidades (em um arquivo único)
Mesmo estando tudo no arquivo `index.html`, devemos manter uma ordem lógica e estrita:
*   **Topo:** Metadados e Estilos (CDN do Tailwind e bloco `<style>` contendo apenas as regras do `@media print`).
*   **Meio:** Estrutura HTML semântica. Divida visualmente o código com comentários claros (ex: `<!-- TELA DO SISTEMA -->` e `<!-- MODELO DO CONTRATO -->`).
*   **Fundo:** Lógica Javascript na tag `<script>` no final do `<body>` para garantir que o DOM já foi carregado.

## 2. Nomenclatura Clara e Explícita
Como não temos TypeScript ou IDEs robustas vinculadas, os nomes das variáveis e funções devem contar a história do que fazem:
*   **CERTO:** `adicionarLinhaPeca()`, `calcularTotalGeral()`, `pdfTabelaItens`, `valorSubtotal`.
*   **ERRADO:** `add()`, `calc()`, `tb1`, `val`.

## 3. Funções Pequenas e Focadas
Cada função no JavaScript deve fazer apenas uma coisa.
*   A função `adicionarLinha()` deve apenas injetar o HTML da nova linha no DOM.
*   A função `gerarPDF()` deve ser orquestradora: ela coleta os dados, atualiza a interface oculta de impressão e chama o `window.print()`. Se o cálculo de totais ficar complexo, extraia para uma função `calcularTotal()`.

## 4. Evite Overengineering (Superengenharia)
*   **Sem dependências desnecessárias:** Se o `window.print()` e CSS `@media print` resolvem 100% do problema, não instale bibliotecas de terceiros (como `jspdf` ou `html2canvas`). 
*   **Vanilla JS:** Use apenas APIs nativas do navegador (`document.getElementById`, `querySelectorAll`, `Template Literals`). Não invente de colocar React ou Vue via CDN para um formulário de 5 campos.

## 5. Comentários Estratégicos
Não comente o óbvio (ex: `// soma um mais um`). Comente **o porquê** das coisas, especialmente os "truques" do projeto:
*   *Exemplo:* `/* O print-color-adjust garante que as cores de fundo apareçam no PDF final */`