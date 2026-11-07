# Pesquisa de consulta veicular por placa

Pesquisa feita em 7 de novembro de 2026, nas documentações dos próprios fornecedores.

## Prioridade atual: FIPE API / Parallelum

A [FIPE API](https://fipe.api.br/docs/comece-aqui) é um serviço independente baseado na tabela FIPE, com banco próprio. Não é uma API oficial da Fundação FIPE. O catálogo permite selecionar marca, modelo e ano e obter combustível e preço de referência. A documentação prevê uso sem cadastro, limitado a 500 requisições diárias.

A [consulta por placa Alpha](https://fipe.api.br/docs/api/busca-por-placa-alpha) oferece `GET https://fipe.parallelum.com.br/api/v2/plates/{plate}`. Em 7/11/2026, a cota documentada sem token era de cinco consultas mensais. A resposta pode trazer marca, modelo, ano, cor, combustível, placa e chassi parcialmente oculto. A rota pode mudar por estar em testes.

**Avaliação:** o catálogo é viável para auxiliar a seleção manual de veículos no HTML. A consulta por placa é viável para experimentação, mas sua cota anônima é insuficiente para o uso diário da oficina. A documentação não oferece leitura atual do odômetro nem número de motor nessa resposta; potência não deve ser tratada como identificação do motor. O preço FIPE é do veículo, não das peças ou do serviço.

Não foi ativada uma nova consulta remota no aplicativo nem consumida a cota por placa. O preenchimento continua manual. Uma integração futura deve ser acionada explicitamente, tratar cota esgotada e falhas, preservar correções do operador e deixar campos ausentes para edição. Caso seja usado token, o fornecedor determina que ele fique no backend, fora do HTML e dos backups.

## Alternativa pesquisada anteriormente: API Placas

A [documentação da API Placas](https://apiplacas.com.br/documentacao) oferece consulta veicular por placa e descreve a rota básica:

```http
GET https://wdapi2.com.br/v3/basico/{placa}
Authorization: Bearer TOKEN_DO_FORNECEDOR
Accept: application/json
```

A placa deve estar sem espaços ou pontuação, no padrão antigo (`ABC1234`) ou Mercosul (`ABC1D23`). Os campos retornados dependem do produto e da disponibilidade dos dados do veículo. A documentação distingue os blocos de consulta; o produto contratado deve ser conferido para obter os campos desejados de modelo, cor, combustível e identificação do motor.

O fornecedor instrui a manter o token no servidor, em variável de ambiente, sem expô-lo em código de navegador ou em repositórios. Portanto, colocar essa chave diretamente no HTML distribuído ao cliente não atende ao modelo de integração documentado.

## O que falta para ativar

1. Conta e credencial do fornecedor, com produto que cubra os dados necessários. Não foi feita contratação nem consulta paga.
2. Um serviço HTTPS externo, administrado pela oficina, que guarde o token e autentique os usuários autorizados antes de consultar o fornecedor. Ele deve limitar requisições para controlar consumo e custo.
3. Liberação CORS adequada para o uso pelo HTML local, com tratamento do acesso a arquivos `file://`, e teste da autenticação no navegador do cliente.
4. Mapeamento do retorno real para os campos do formulário e teste de falhas, dados ausentes ou mascarados e resultados por placa.

Esse serviço pode ser hospedado; o cliente continuaria abrindo apenas o HTML, sem instalação. Entretanto, a consulta por placa passaria a depender desse serviço e de internet. Nenhuma credencial foi solicitada, embutida, armazenada ou enviada pelo aplicativo.

A consulta remota por placa **não está ativada nesta versão**. O campo de placa continua disponível para preenchimento manual. Quilometragem deve ser informada pelo operador, pois é uma leitura atual do veículo.

## CEP: integração já implementada

O [ViaCEP](https://viacep.com.br/) documenta consultas públicas no formato `https://viacep.com.br/ws/{cep}/json/`, sem exigir credencial. Um CEP deve ter oito dígitos; o retorno `erro` indica que ele não foi encontrado. Essa integração está ativa, com carregamento acessível, possibilidade de tentar novamente e edição manual em caso de indisponibilidade.

