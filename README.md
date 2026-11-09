# Contrato Fácil

Aplicativo offline para oficinas criarem contratos de peças, serviços e garantia, com histórico local e modelos reutilizáveis. Preencha os dados, confira o total e imprima ou salve em PDF.

**Um único HTML para o cliente, sem instalação, servidor ou cadastro. Somente a consulta opcional de CEP precisa de internet; as demais funções continuam locais.**

![Página inicial do Contrato Fácil](docs/pagina-inicial.png)

## Entrega e primeiros passos

Envie apenas `index.html` ao cliente. Ele abre o arquivo no navegador e começa a usar. Node.js, npm e os arquivos de desenvolvimento não são necessários para executar o aplicativo.

1. Em **Modelos de contrato**, confira os dados fixos da oficina, as cláusulas e os dados de pagamento.
2. Acesse **Gerar novo contrato** e escolha o modelo desejado.
3. Informe o cliente, o veículo, as peças ou serviços, quantidades e valores unitários.
4. Preencha informações complementares, prazos e revisões, quando necessários.
5. Clique em **Salvar no histórico** ou **Imprimir / salvar PDF**. Na janela de impressão, escolha papel A4 e o destino desejado.

O contrato é salvo antes de abrir a janela de impressão. Cancelar essa janela mantém o registro no histórico; o aplicativo não consegue confirmar se o documento foi efetivamente impresso.

## Página inicial e navegação

A página inicial apresenta dois blocos de consulta — **Histórico de contratos** e **Modelos de contrato** — e um bloco destacado para **Gerar novo contrato**.

O menu fica fixo à esquerda em telas de computador e passa para o topo em telas menores. As configurações ficam na parte inferior do menu. Durante o preenchimento, links âncora levam às seções do contrato.

## Histórico de contratos

Cada registro mostra cliente, modelo do veículo e placa, data/hora de criação, modelo usado e situação. A lista tem busca e paginação.

| Ação | Comportamento |
| --- | --- |
| Editar | Reabre os dados e atualiza o mesmo registro ao salvar, preservando a data de criação. |
| Copiar | Abre um novo preenchimento com os dados do original. Outro registro só é criado ao salvar. |
| Excluir | Remove o registro após confirmação. |

O histórico guarda os dados necessários para gerar novamente o documento, e não o arquivo PDF binário. Cada contrato mantém uma cópia do modelo utilizado: editar ou excluir um modelo não muda contratos já salvos.

## Modelos de contrato

Modelos podem ser criados, editados, copiados, excluídos e usados para iniciar um contrato. A listagem usa títulos maiores e ações por extenso.

O editor reúne nome e formato do modelo, dados fixos da oficina, informações bancárias e Pix, texto de abertura, cláusulas e opções do recibo. Mudanças feitas no navegador não alteram o arquivo HTML: use um backup para transferi-las a outro computador.

### Modelos iniciais Shekinah

Os dois modelos foram reconstruídos em HTML/CSS a partir dos PDFs e das cinco fotografias fornecidos:

| Modelo | Conteúdo |
| --- | --- |
| Prestação de serviço — Shekinah | Oficina, cliente, veículo, tabela de itens, cláusulas 1 a 16, pagamento e assinaturas. |
| Garantia e revisões — Shekinah | Termo de garantia, nota de serviço executado, três cupons de revisão e recibo de retirada opcional. |

O recibo está habilitado inicialmente no modelo de garantia e pode ser desativado em suas opções. As revisões recebem valores iniciais editáveis. Os intervalos padrão são somados à quilometragem informada em cada contrato.

As fotografias legíveis foram consideradas na transcrição. A cláusula 16 adicional do PDF de garantia foi preservada. Como as fotografias não mostram outra chave Pix, foram mantidos os dados bancários do PDF de prestação de serviço, disponíveis para edição no modelo.

Nomes, documentos, placas, valores e assinaturas dos clientes dos exemplos não são dados iniciais do aplicativo. Os PDFs e as fotografias originais não foram adicionados ao repositório.

Os modelos iniciais são carregados quando ainda não há dados locais. Atualizar o HTML não sobrescreve modelos já salvos neste navegador.

### Campos automáticos

As cláusulas podem usar os seguintes marcadores, substituídos pelos dados do contrato na impressão:

- Valor: `{{total}}` e `{{valorExtenso}}`.
- Prazos: `{{prazoNacional}}` e `{{prazoDiesel}}`.
- Revisões: `{{revisao1}}`, `{{revisao2}}` e `{{revisao3}}`.
- Oficina e pagamento: `{{empresa}}`, `{{banco}}`, `{{agencia}}`, `{{conta}}`, `{{titular}}` e `{{pix}}`.

O valor por extenso é digitado pelo usuário. Campos opcionais não informados aparecem como espaços para preenchimento manual.

## Preenchimento rápido e acessibilidade

- Três tamanhos de fonte: **Normal**, **Grande** e **Extra grande**.
- Rótulos nos campos, foco visível, botões grandes e operação por teclado.
- Uma seção de preenchimento aberta por vez e apenas um editor aberto em cada lista.
- Peças e cláusulas em páginas de cinco registros, com resumos para revisão.
- Botões de adicionar abaixo das listas de peças e cláusulas, junto da paginação.
- Novos registros abertos automaticamente, com foco no campo de preenchimento.
- Validação que revela a seção, a página e o editor do primeiro campo incorreto.
- Subtotais e total em reais, calculados em centavos.
- Sinalização de alterações não salvas e confirmação antes de substituir um preenchimento em andamento.

## Catálogo de peças

O catálogo local contém 65 peças e insumos comuns, incluindo nomes alternativos. Digite pelo menos duas letras para receber até seis sugestões. A busca ignora acentos e maiúsculas e usa distância de edição para tolerar pequenos erros, como `cabesote` e `virabrequin`.

Use **↑ / ↓** e **Enter** para selecionar, **Esc** para fechar ou o mouse para clicar. O texto é livre: serviços e peças fora do catálogo também podem ser usados.

O catálogo sugere nomes, sem definir preços ou verificar compatibilidade com veículos. Para ampliá-lo, edite o bloco JSON `catalogoPecas` em `index.html`.

## Configurações, armazenamento e backup

As configurações incluem quatro paletas prontas e duas cores personalizáveis: destaque (accent) e barra lateral (accent-dark). Cada cor pode ser escolhida no seletor visual ou informada como hexadecimal de seis dígitos, por exemplo, #145a48. Ao escolher uma paleta pronta, seus dois campos de cor são atualizados; use Salvar configurações para aplicar. O texto sobre os fundos personalizados alterna entre preto e branco para manter o contraste. As preferências entram no backup, e backups antigos continuam compatíveis. Também é possível escolher cantos arredondados ou discretos, espaçamento das listas e modelo padrão para novos contratos. Cores, espaçamento e tamanho de fonte alteram a tela; os documentos continuam em preto e branco.

Modelos, contratos e preferências ficam em `localStorage`, no navegador e endereço em que o HTML foi aberto. A consulta opcional envia somente o CEP ao ViaCEP. Contratos, nomes de clientes e placas não são enviados ao serviço.

**Exporte backups regularmente em Configurações.** Limpar os dados do navegador, mover o HTML ou mudar de computador pode tornar os dados locais indisponíveis.

O backup JSON inclui contratos, modelos e preferências, mas não alterações ainda não salvas. Ele contém dados dos clientes e deve ser guardado em local adequado. A restauração valida o arquivo e pede confirmação antes de substituir os dados atuais.

Falhas de leitura ou gravação são informadas sem anunciar um salvamento inexistente. Dados locais inválidos não são sobrescritos automaticamente. Alterações em outra aba bloqueiam novas gravações até recarregar ou restaurar, evitando sobrescrever versões diferentes.

## Impressão e PDF

Os documentos usam papel A4 e margens de 15 mm. A interface fica oculta na impressão. Todos os itens e cláusulas são incluídos, mesmo em seções fechadas ou outras páginas da tela. A tabela repete seu cabeçalho quando necessário.

O estilo de impressão usa caixas de margem vazias para remover data/hora, título do aplicativo, URL e paginação automáticos do navegador. Essa saída foi validada no Chrome 156 com a opção de cabeçalhos e rodapés ligada e desligada. Em outros navegadores ou configurações personalizadas, pode ser necessário desmarcar **Cabeçalhos e rodapés** em **Mais configurações**.

A paginação se adapta ao conteúdo. Na amostra conferida, o modelo de prestação de serviço ocupou duas páginas, e o de garantia ocupou cinco com o recibo habilitado. Itens extensos ou cláusulas maiores podem acrescentar páginas. A janela de impressão permite escolher quais páginas imprimir.

## Desenvolvimento

O código usa HTML semântico, CSS local e APIs nativas do navegador, seguindo as skills de código limpo e layout acessível em `.agents/skills/`. Os textos do usuário são inseridos no documento com `textContent`, sem execução de HTML.

```text
index.html          Aplicativo, catálogo e modelos iniciais embutidos
.agents/skills/     Diretrizes locais de desenvolvimento
tests/              Testes de fluxo no navegador
docs/               Imagem da interface para documentação
package.json        Comandos e dependências de desenvolvimento
```

### Testes

Com Node.js 20 ou superior e Google Chrome instalado:

```sh
npm ci
npm test
```

Os testes com Playwright verificam busca e teclado, cálculos, validação, listas extensas, CRUD de modelos e contratos, preservação do histórico, backup e restauração, falhas de armazenamento, segurança dos textos e impressão com e sem cabeçalhos automáticos.

Também cobrem fonte ampliada, rótulos e ausência de rolagem horizontal em 375, 768, 1200 e 1440 pixels. Os dois modelos foram renderizados e conferidos visualmente. A verificação automatizada não substitui testes com leitores de tela nem a conferência da impressora usada pela oficina.

## Limitações atuais

- Os dados não são sincronizados entre computadores ou navegadores; a transferência é feita por backup.
- O preenchimento em andamento precisa ser salvo antes de fechar a página.
- A quantidade aceita unidades inteiras; o preço unitário aceita duas casas decimais, inclusive zero.
- O catálogo é ampliado manualmente e pode sugerir peças diferentes da desejada.
- A geração usa a janela de impressão do navegador; não há download automático nem confirmação física da impressão.

## Consulta de endereço por CEP

O CEP é o primeiro campo de endereço no contrato (oficina e cliente) e no editor do modelo. Ao completar oito números, o aplicativo consulta o [ViaCEP](https://viacep.com.br/) e preenche logradouro, bairro, cidade e UF. O botão **Buscar endereço** permite tentar novamente. Confira e acrescente o número do imóvel.

A consulta mostra carregamento, sucesso, CEP não encontrado, erro de conexão ou tempo esgotado. Não apaga o endereço em caso de erro nem substitui campos corrigidos durante uma consulta. Respostas de consultas antigas são descartadas ao trocar o CEP ou abrir outro contrato/modelo.

A busca por CEP precisa de internet e envia somente o CEP ao ViaCEP, sem dados do cliente, credenciais ou informações do contrato. O preenchimento manual e as demais funções continuam disponíveis offline. Não há consultas automáticas ao simplesmente abrir contratos já salvos.

## Revisões com valores iniciais

Novos contratos começam com intervalos de **1.000, 4.000 e 7.000 km** e valor de **R$ 850,00 por revisão**, com base nos exemplos fornecidos. Ajuste os intervalos e os três preços em cada modelo. Configurações fornece os padrões para modelos sem revisões próprias.

Ao informar a quilometragem atual, os intervalos são somados automaticamente: com 241.025 km, as revisões ficam em 242.025, 245.025 e 248.025 km. Sem leitura informada, a base é zero. Confira os valores antes de imprimir.

Uma revisão alterada manualmente deixa de acompanhar o cálculo automático naquele preenchimento. Contratos reabertos ou copiados preservam as quilometragens e o preço registrados, mesmo que os padrões das configurações tenham mudado. Os novos campos são opcionais na validação de backups antigos, mantendo a compatibilidade com os dados já salvos.

## Dados do veículo

Modelo, placa, combustível e demais dados do veículo são preenchidos manualmente. Os catálogos online foram removidos; contratos e backups existentes mantêm as informações já salvas. A consulta de CEP continua disponível, conforme [Consultas externas](docs/consultas-externas.md).

Os testes adicionais usam respostas controladas do ViaCEP para verificar carregamento, preenchimento, falhas, ausência de internet, tempo limite, respostas atrasadas e preservação de edições. Também verificam os padrões de revisão e a leitura de dados antigos. Uma consulta real ao CEP público de exemplo `01001-000` foi conferida no Chrome, abrindo o HTML diretamente como arquivo local.

## Resumo da oficina, avisos e proteção contra duplicação

No preenchimento do contrato, os dados da oficina aparecem agrupados em um resumo. O botão com lápis **Editar** abre os campos; **Concluir edição** recolhe o editor. Os dados continuam no PDF e podem ser ajustados nesse contrato sem alterar o modelo. A validação abre o editor se um dado obrigatório precisar de correção.

Celular aparece antes do telefone nos dados complementares do cliente e no documento. O rodapé foi reduzido a uma orientação curta de impressão. Confirmações e mensagens operacionais aparecem em avisos temporários, que podem ser fechados e permanecem enquanto recebem foco ou passam sob o mouse. Erros que exigem correção continuam identificados junto ao formulário.

Salvar várias vezes ou imprimir novamente atualiza o mesmo registro. Ao salvar uma cópia ou um novo preenchimento com os mesmos dados, o registro existente é reutilizado, sem consumir outro número. A comparação considera os dados, itens, valores, cláusulas e conteúdo do modelo, ignorando o número automático e normalizando espaços e diferenças de caixa. A data do contrato é considerada: contratos de datas diferentes podem ser registros distintos. Se editar um registro para ficar igual a outro já salvo, a gravação é bloqueada sem excluir os dados existentes. Registros antigos não são apagados automaticamente.

## Ações de preenchimento e nome do PDF

**Gerar novo contrato** é o primeiro atalho da página inicial. Os botões de adicionar peças e cláusulas ficam abaixo das respectivas listas, inclusive no editor de modelos. A paginação continua limitando a quantidade de registros exibidos.

Ao abrir a impressão, o título do documento sugere um nome como `Contrato-Garantia-Chevrolet-Onix-ABC1D23-2026-11-08.pdf`, incluindo tipo de contrato, modelo e placa do veículo e data. Caracteres incompatíveis com nomes de arquivo são substituídos. Dados ausentes usam `Veiculo` e `Sem-placa`. O navegador permite escolher outro nome ao salvar; o título do aplicativo é restaurado ao sair da impressão.

## Revisões por modelo e por contrato

Cada modelo agora permite definir três intervalos de revisão e três preços independentes. Os quilômetros são distâncias após o odômetro atual: com leitura de 10.000 km e intervalos de 1.000 / 2.000 / 6.000 km, os cupons recebem 11.000 / 12.000 / 16.000 km.

Em **Modelos de contrato → Editar → Revisões: quilômetros e valores**, ajuste os seis campos. Modelos sem configuração própria herdam os padrões de Configurações, que também permitem preços separados. Os intervalos devem ser positivos e crescentes; preços aceitam zero e duas casas decimais.

No contrato, os três preços continuam editáveis individualmente e cada cupom imprime seu próprio valor. A opção **Reaplicar revisões do modelo** restaura intervalos e preços após confirmação. Alterações em modelos não modificam contratos já salvos.

Backups antigos com preço único continuam aceitos: o preço original é aplicado às três revisões ao reabrir ou copiar esses registros. Os novos campos são opcionais no formato anterior e não apagam os dados existentes.


A cobertura de testes também verifica a ordem dos atalhos, ações abaixo das listas, nome sugerido do PDF, recuperação após falha de impressão, intervalos e preços por modelo, revisão gratuita, rejeição de intervalos fora de ordem e compatibilidade de contratos antigos sem duplicação. Os cupons foram conferidos visualmente em PDF A4 com preços diferentes.


O controle de tamanho da fonte fica no bloco inferior da barra lateral, junto de Configurações. Em janelas de computador com até 900 px de altura, apenas o fieldset e seus botões usam espaçamento compacto; os links mantêm seu tamanho original e acompanham a fonte escolhida. A rolagem permanece disponível quando necessária para acessar todos os controles.

## Revisão final de UI/UX

O editor de modelos pede confirmação antes de descartar alterações por Cancelar ou Esc e participa do aviso de saída do navegador. As ações de salvar, copiar e excluir preservam um destino útil para o teclado. Fechar um popup devolve o foco ao controle anterior. No celular, o modal usa menos margens internas e mantém campos grandes.

A revisão e seus limites estão em [reports/ui-ux/REVISAO.md](reports/ui-ux/REVISAO.md), incluindo as skills utilizadas, evidências locais, verificações de fonte extra grande e testes de regressão.
