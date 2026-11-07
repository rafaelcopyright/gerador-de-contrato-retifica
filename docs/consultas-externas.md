# Consultas externas de endereço e veículos

## Integrações disponíveis no HTML

| Serviço | Uso no aplicativo | Credencial no HTML |
| --- | --- | --- |
| ViaCEP | Preencher endereço pelo CEP | Nenhuma |
| BrasilAPI | Catálogo FIPE: marca → modelo → ano → detalhes | Nenhuma |
| Fipe.api.br / Parallelum | Catálogo FIPE: marca → modelo → ano → detalhes | Nenhuma |

O usuário escolhe o provedor no formulário. As consultas de veículo começam somente ao clicar em **Carregar marcas**, e continuam conforme as seleções. Os dados encontrados aparecem para conferência; só são aplicados após **Usar dados no contrato**.

O catálogo preenche o nome do veículo com ano e, quando informado, combustível. Placa, cor, número de motor, chassi e quilometragem continuam manuais. O preço de referência é do veículo: nunca é usado como preço de peça, serviço ou revisão.

## BrasilAPI

Referências: [documentação pública](https://brasilapi.com.br/docs#tag/FIPE) e [especificação no repositório oficial](https://github.com/BrasilAPI/BrasilAPI/blob/main/pages/docs/doc/fipe.json).

A base REST é `https://brasilapi.com.br/api/fipe`. Tipos aceitos: `carros`, `motos` e `caminhoes`.

| Etapa | Caminho GET |
| --- | --- |
| Marcas | `/marcas/v1/{tipo}` |
| Modelos | `/veiculos/v1/{tipo}/{marca}` |
| Anos | `/anos/v1/{tipo}/{marca}/{modelo}` |
| Detalhes | `/detalhes/v1/{tipo}/{marca}/{modelo}/{ano}` |

As listas usam `valor` como identificador, com `nome` ou `modelo` como descrição. Os detalhes incluem `marca`, `modelo`, `anoModelo`, `combustivel`, `codigoFipe`, `valor` e `mesReferencia`. Essa API de catálogo não documenta consulta de veículo por placa nesses endpoints.

## Fipe.api.br / Parallelum

Referências: [introdução](https://fipe.api.br/docs/comece-aqui) e [endpoints REST JSON](https://fipe.api.br/docs/api/fipe).

A base REST vigente documentada é `https://fipe.parallelum.com.br/api/v2`, e não a URL das páginas de documentação. Tipos: `cars`, `motorcycles` e `trucks`, mapeados a partir das opções em português na tela.

| Etapa | Caminho GET |
| --- | --- |
| Marcas | `/{tipo}/brands` |
| Modelos | `/{tipo}/brands/{marca}/models` |
| Anos | `/{tipo}/brands/{marca}/models/{modelo}/years` |
| Detalhes | `/{tipo}/brands/{marca}/models/{modelo}/years/{ano}` |

As listas usam `code` e `name`. Os detalhes usam `brand`, `model`, `modelYear`, `fuel`, `codeFipe`, `price` e `referenceMonth`. A documentação prevê 500 requisições diárias sem autenticação e 1.000 com token gratuito. O aplicativo usa somente acesso anônimo; não solicita nem armazena tokens. Os limites de catálogo não equivalem à cota de consulta por placa.

### Consulta por placa

A [rota por placa Alpha](https://fipe.api.br/docs/api/busca-por-placa-alpha) é outro produto, com cota documentada de cinco consultas mensais sem token em 7/11/2026. Essa rota não foi ativada nem consultada durante os testes. Ela não fornece leitura atual do odômetro e pode devolver chassi mascarado; potência não é número de motor.

O serviço Parallelum usa dados da tabela FIPE e banco próprio; não é a API oficial da Fundação FIPE. Para eventual uso autenticado, a documentação exige manter tokens no backend, fora do HTML público e dos backups.

## Falhas e proteção do preenchimento

- Carregamento e erros são mostrados na área da consulta; erros também geram aviso temporário.
- O limite de espera é de dez segundos por requisição. O botão **Tentar novamente** repete a etapa que falhou.
- Mudar provedor, tipo ou uma seleção cancela requisições antigas e limpa os resultados dependentes.
- Abrir outro contrato, mudar de modelo de contrato ou sair do editor descarta a consulta em andamento.
- Preenchimentos manuais existentes só são substituídos após confirmação ao aplicar o resultado.
- Respostas inválidas, listas vazias, HTTP 404/429/500 e ausência de conexão mantêm a edição manual disponível.
- Listas e detalhes válidos são guardados em memória por dez minutos, com até cem entradas, separados pela URL completa. Falhas não entram no cache. O cache não vai para backups.
- Não há troca automática de provedor, consulta em lote nem carregamento de catálogo ao abrir o app.

As requisições enviam apenas tipo e identificadores públicos do catálogo, sem nome do cliente, placa, dados do contrato, cookies ou token. O preenchimento e a impressão permanecem disponíveis offline.

## Validação realizada em 7/11/2026

### Testes reais, abrindo o HTML no Chrome

| Requisição | Resultado observado |
| --- | --- |
| BrasilAPI: marcas de carros | Tempo limite |
| BrasilAPI: marcas de motos | HTTP 500 |
| BrasilAPI: marcas de caminhões | HTTP 200, 29 marcas em uma consulta |
| BrasilAPI: nova consulta de caminhões pela interface | HTTP 500 |
| Parallelum v2: marcas de carros | HTTP 404, erro de obtenção dos dados na origem |

Esses resultados mostram oscilação do serviço, sem garantir disponibilidade posterior. Não foi possível confirmar um fluxo real completo até os detalhes do veículo. A implementação está disponível para ambos os provedores e trata falhas sem bloquear o contrato; o êxito do preenchimento online depende da recuperação dos serviços.

### Testes end-to-end controlados

Os testes de navegador interceptam as requisições e verificam os caminhos e formatos publicados: fluxo completo dos dois provedores para os três tipos, confirmação de substituição, cache, erros, limite de cota, modo offline, tempo esgotado e cancelamento de resultados atrasados. Esses testes validam o aplicativo, não a disponibilidade dos fornecedores.

## CEP

A consulta [ViaCEP](https://viacep.com.br/) continua disponível para a oficina e para o cliente, com validação de oito dígitos, possibilidade de nova tentativa e preservação de edições. Ela envia apenas o CEP.
