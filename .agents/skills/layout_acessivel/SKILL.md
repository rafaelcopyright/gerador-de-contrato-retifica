# Skill: Layout Amigável (UI/UX) e Acessibilidade (A11y)

Nosso público-alvo são pessoas leigas (mecânicos, atendentes de oficina, donos de pequenos negócios) operando um sistema local. A interface deve ser "à prova de erros" e acessível por padrão.

## 1. UX para Leigos (Interface Intuitiva)
*   **Ocultar Complexidade:** O usuário não precisa ver o contrato se montando em tempo real se isso for confuso. A tela inicial deve ser apenas o formulário limpo (`print:hidden`). O contrato real só aparece na hora da impressão (`print:block`).
*   **Feedback Imediato:** Botões de ação primária (como "Salvar como PDF") devem ser grandes, com cores de destaque (ex: Azul ou Verde) e usar ícones universais (🖨️).
*   **Prevenção de Erros:** Campos de valores devem usar `type="number"` e `step="0.01"` para evitar que o usuário digite texto onde deveria ter preço.

## 2. Acessibilidade Obrigatória (A11y)
A acessibilidade garante que o sistema seja usável por pessoas com deficiências (visuais, motoras) e melhora a navegação por teclado, o que agiliza o trabalho na oficina.

### A. Semântica HTML
*   Use as tags corretas: `<main>` para o conteúdo principal, `<h1>` a `<h3>` respeitando a hierarquia de títulos, e `<label>` obrigatoriamente associada aos seus respectivos `<input>` (através do atributo `for="id_do_input"`).

### B. Navegação por Teclado (Focus)
*   O usuário de uma oficina muitas vezes digita rápido e usa o botão `TAB` para pular de campo. Certifique-se de que todos os inputs e botões são alcançáveis por teclado.
*   **Atenção aos botões de exclusão:** O botão de deletar uma linha (o "X" vermelho) deve ser uma tag `<button type="button">`, nunca uma `<div>` ou `<span>` com um evento de clique.

### C. Textos Alternativos e ARIA Labels
*   Botões que possuem apenas ícones ou abreviações (como o "X" de excluir linha) precisam ser lidos corretamente por leitores de tela.
*   **Implementação:** `<button aria-label="Remover este item" class="...">X</button>`.

### D. Contraste de Cores (WCAG)
*   Garanta um alto contraste entre a cor do texto e a cor de fundo.
*   O fundo cinza-claro (`bg-gray-100`) com texto escuro (`text-gray-800` ou `black`) atende às normas de contraste.
*   Nunca use cor como única forma de passar informação (ex: borda vermelha para erro). Adicione também um texto descritivo.

## 3. Responsividade (Mesmo em Desktop)
Embora o foco seja uso local em computadores, o layout não deve quebrar se o usuário usar o navegador em meia-tela. O uso do Tailwind (`w-full`, `max-w-3xl`, `flex`) já garante que o layout se adapte suavemente a janelas menores.