# Revisão final de UI/UX

Revisão de 09/11/2026 do aplicativo local, com foco no preenchimento rápido de contratos por pessoas leigas e no uso de fonte ampliada.

Skills: senior-ui-ux-orchestrator (coordenação), ux-audit-skill (auditoria) e webapp-ui-skill (correções e validação). Referência do conjunto: https://github.com/sergekostenchuk/ui-ux-agent-skill-system. Execução local; nenhum código, captura ou dado de cliente enviado a ferramentas externas.

## Achados e correções

| Prioridade | Evidência | Problema observado | Correção | Verificação |
| --- | --- | --- | --- | --- |
| P1 | source | Cancelar ou Esc descartava alterações do modelo sem confirmação. | Compara o conteúdo atual com o inicial, inclusive inclusão/remoção de cláusulas; confirma o descarte e inclui o modelo na proteção ao sair do navegador. Salvar continua sem confirmação extra. | Teste de Cancelar/Esc com recusa e aceitação; cláusula adicionada também protegida. |
| P2 | source, DOM, automated | Recriar as listas ao salvar, copiar ou excluir removia o controle que detinha o foco. | Foco no botão Editar do registro salvo/copiado ou em um registro restante. Lista vazia volta a Criar modelo/Busca do histórico. | Testes de salvar, copiar e excluir modelos. |
| P2 | source, DOM, automated | Fechar o aviso temporário podia deixar o foco no corpo da página. | Retorna ao controle anterior quando ainda visível; usa destino seguro quando ele deixou de existir. | Teste de fechamento do aviso pelo teclado. |
| P2 | screenshot | Modal em 390 px com fonte extra grande tinha margens internas sucessivas que reduziam o espaço de edição. | Redução localizada do espaçamento interno no celular, preservando campos grandes e ações fixas do modal. | Capturas antes/depois e medição de transbordamento. |

## Ran

- `npm test`: evidência em [tests.txt](tests.txt). Inclui três novos testes de regressão em `tests/ui-ux.test.cjs`.
- Chrome/Playwright: oito telas e o modal em 1280 × 800 e 390 × 844, com fonte de 24 px. Nenhum transbordamento horizontal nas 18 verificações: [antes](before/checks.json) e [depois](after/checks.json).
- Capturas locais antes/depois de início, configurações, peças e modal nas duas resoluções. Arquivos PNG em `before/` e `after/` permanecem locais e são ignorados pelo Git. Conferência visual do editor de peças desktop e do modal/configurações móvel; as demais capturas servem como evidência para comparação.
- `check_state_coverage.ts`: [state-coverage.json](state-coverage.json). Busca estática por palavras, sem comprovar comportamento; a ausência do termo inglês `submitting` foi analisada manualmente.
- `visual_smoke_test.mjs`: [http-smoke/summary.json](http-smoke/summary.json). Servidor HTTP local temporário; resposta e HTML conferidos. Esse script não produz screenshots; as capturas foram feitas separadamente com Playwright.
- `git diff --check`: sem erros de espaços.

## Estados e limites

| Estado | Evidência / decisão |
| --- | --- |
| Carregamento e erro de rede | Testes existentes de ViaCEP com respostas controladas, timeout e resposta atrasada. |
| Vazio | Histórico sem contratos e lista sem resultados possuem orientação textual; cenário inicial visitado no navegador. |
| Desabilitado | Paginação e consulta de CEP já têm controles desabilitados quando indisponíveis. |
| Foco, selecionado e sucesso | Rótulos e fonte ampliada cobertos nos testes existentes; novos testes de foco e proteção do modelo. |
| Salvamento em andamento | Manual: localStorage síncrono, sem espera de rede; adicionar um spinner criaria um estado artificial. Falha de gravação e repetição de ações são cobertas pela suíte existente. |

## Skipped

- Validador validate_evidence_report.py: não encontrado na instalação local das skills; caminhos e evidências conferidos diretamente.
- axe, Lighthouse e leitores de tela: não executados nesta rodada. Não se afirma conformidade integral com WCAG nem pontuação de desempenho.
- Impressora física: não disponível; a impressão permanece coberta pela suíte existente. Nenhuma alteração no layout de impressão nesta revisão.
- Serviços externos de design e upload de capturas: desnecessários para esta revisão local.

## Manual

Mantidos os tamanhos originais dos links da barra lateral, o fieldset de fonte no bloco inferior e os atalhos da página inicial. A rolagem vertical da barra lateral permanece disponível quando a altura ou a fonte ampliada exigirem. As melhorias se concentram em proteção contra descarte, continuidade do teclado e espaço útil no modal.

## Risco residual

A confirmação de saída do navegador depende das regras do próprio navegador e de interação prévia do usuário. Dados continuam locais: o backup permanece necessário para recuperação ou transferência. A validação com leitores de tela e com a impressora real da oficina continua recomendada antes da entrega final.

Resultado da suíte completa: **29 testes passaram, sem falhas**.
