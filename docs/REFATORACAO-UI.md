# Refatoração do painel operacional

A interface foi reorganizada para atendimento de balcão, sem migração de framework. HTML, CSS e JavaScript nativos preservam a entrega por arquivo único e o PWA.

## Decisões

- **Prioridade:** pesquisa e registros recentes no início; emissão como ação primária. Foram removidos os blocos de boas-vindas, slogans e explicações redundantes.
- **Componente de registros:** tabela semântica no desktop, com cliente, veículo/placa, emissão, modelo e ações. Em telas estreitas, cada linha ganha rótulos e distribuição em duas colunas.
- **Densidade:** cabeçalhos menores, campos com bordas mais escuras, raios de 4–6 px e espaçamento reduzido. Configurações de cores e marca continuam funcionando.
- **Tipografia:** Inter variável embutida, com licença no HTML. Impressão mantém Arial e o mesmo bloco CSS de impressão.
- **Acessibilidade:** preferências de 16/21/24 px preservadas; seletores A− / A / A+ compactos e rotulados para tecnologia assistiva. Alvos de ações rápidas aumentam para 44 px em dispositivos de toque.
- **Conectividade:** badge distingue arquivo local, cache offline pronto e falta de conexão. Não faz requisição externa de diagnóstico. Prontidão do cache depende da ativação do service worker; navigator.onLine é um sinal do navegador, não uma garantia de acesso à internet.

## Fluxos

A pesquisa percorre toda a base, sem restringir a consulta aos dez registros inicialmente exibidos. A lista é ordenada por criação, mais recente primeiro. Sem registros e sem resultados são estados distintos; Limpar busca devolve o foco ao campo.

Reimprimir abre a cópia salva no editor e a impressão sem gravar outro contrato nem modificar datas ou conteúdo do registro. Um rascunho aberto exige confirmação antes da substituição. Editar mantém o registro; Duplicar abre um novo preenchimento e preserva a prevenção de duplicatas ao salvar.

O histórico completo mantém paginação, busca, edição, cópia e exclusão. Os modelos continuam com título personalizado, revisão de quilômetros/preços, cláusulas e proteção ao descartar alterações. Backup e restauração continuam disponíveis.

## Skills e evidências

Aplicadas: senior-ui-ux-orchestrator, webapp-ui-skill e ux-audit-skill, com critérios visuais de design-critic-skill. Fluxo local; apenas a fonte e sua licença foram obtidas de URLs públicas, sem envio de código, capturas ou dados de cliente.

### Ran

- `npm test`: [log completo](../reports/ui-ux/operacional-tests.txt), incluindo três novos testes em `tests/painel.test.cjs`. Cobrem busca fora dos dez recentes, ordenação, estados vazios, foco da busca, reimpressão sem mutação de histórico, proteção do rascunho, duplicação e layout responsivo.
- Chrome/Playwright: captura desktop em 1280 × 800, móvel em 390 × 844 e móvel com fonte de 24 px. Testes de transbordamento em 375, 390, 768, 1280 e 1440 px.
- Captura pública do README em 1440 × 900: [painel](pagina-inicial.png), somente dados fictícios. Capturas locais de comparação em `reports/ui-ux/operacional/`, ignoradas pelo Git.
- Comparação do bloco CSS de impressão com a revisão anterior: idêntico após normalizar finais de linha. Suíte existente verifica impressão, contratos, cláusulas, valores e fontes em mídia print.
- Script `check_state_coverage.ts`: [resultado](../reports/ui-ux/operacional-state-coverage.json). Marcadores estáticos encontrados, exceto `submitting`. Revisão manual: salvamento local é síncrono; falhas de gravação e repetição de ações são testadas. O scanner não prova cobertura de comportamento.
- `git diff --check`: sem erros de espaços após limpeza.

### Skipped

- `visual_smoke_test.mjs`: substituído por testes reais com Chrome/Playwright; o script da skill apenas verifica resposta HTTP e não gera capturas. A suíte PWA também usa servidor HTTP local.
- axe, Lighthouse, leitor de tela e impressora física: não executados. Não se afirma conformidade integral com WCAG ou pontuação de desempenho.

### Manual

A conferência visual confirmou prioridade do botão de emissão, seis registros completos visíveis no exemplo desktop de 1280 × 800, ações alinhadas por linha e ausência de blocos promocionais. No móvel, a fonte ampliada exige mais rolagem vertical, preservando a legibilidade e os dados.

## Limites

O painel apresenta dez resultados por vez; o histórico completo continua sendo o destino para percorrer toda a listagem. Não há autenticação nem sincronização: dados continuam no navegador. A imagem externa da marca e o CEP ainda podem exigir internet.
