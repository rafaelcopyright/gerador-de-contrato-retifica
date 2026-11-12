# Contrato Fácil

Aplicativo offline para oficinas criarem contratos de peças, serviços e garantia, com histórico local e modelos reutilizáveis. Preencha os dados, confira o total e imprima ou salve em PDF.

**Use abrindo o HTML diretamente ou como PWA instalável, publicado em HTTPS. O cliente não precisa de Node.js, npm ou cadastro. Após preparar o cache, a versão PWA também abre offline; somente a consulta de CEP precisa de internet.**

![Página inicial do Contrato Fácil](docs/pagina-inicial.png)

## Entrega e primeiros passos

Para uso por arquivo, envie apenas `index.html` ao cliente: ele abre no navegador e começa a usar. Para instalação como PWA, publique `index.html`, `manifest.webmanifest` e `sw.js` juntos em hospedagem estática HTTPS, mantendo os nomes e a mesma pasta. Node.js, npm e os testes são necessários apenas ao desenvolvimento, não ao cliente.

1. Em **Modelos de contrato**, confira os dados fixos da oficina, as cláusulas e os dados de pagamento.
2. Acesse **Gerar novo contrato** e escolha o modelo desejado.
3. Informe o cliente, o veículo, as peças ou serviços, quantidades e valores unitários.
4. Preencha informações complementares, prazos e revisões, quando necessários.
5. Clique em **Salvar no histórico** ou **Imprimir / salvar PDF**. Na janela de impressão, escolha papel A4 e o destino desejado.

O contrato é salvo antes de abrir a janela de impressão. Cancelar essa janela mantém o registro no histórico; o aplicativo não consegue confirmar se o documento foi efetivamente impresso.

## Página inicial e navegação

A página inicial é o painel **Emissão de contratos**: pesquisa por cliente, veículo ou placa em todo o histórico e exibe até dez registros, ordenados pela data de criação mais recente. Cada linha mostra cliente, veículo/placa, emissão, modelo e as ações **Reimprimir**, **Editar** e **Duplicar**. O botão **+ Gerar novo contrato** fica no cabeçalho.

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

Os dois modelos originais foram reconstruídos em HTML/CSS a partir dos PDFs e das cinco fotografias fornecidos. O terceiro foi adaptado do DOCX de serviço e garantia de cabeçote:

| Modelo | Conteúdo |
| --- | --- |
| Prestação de serviço — Shekinah | Oficina, cliente, veículo, tabela de itens, cláusulas 1 a 16, pagamento e assinaturas. |
| Serviço e garantia de cabeçote — Shekinah | Contrato e garantia de três meses adaptados do DOCX; sem nota, cupons ou recibo adicionais. |
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

- Seletor compacto **A− / A / A+** no rodapé: Normal (16 px), Grande (21 px) e Extra grande (24 px), com nomes acessíveis.
- Rótulos nos campos, foco visível e operação por teclado. Controles compactos no desktop e alvos de pelo menos 44 px para ações rápidas em dispositivos de toque.
- Uma seção de preenchimento aberta por vez e apenas um editor aberto em cada lista.
- Peças e cláusulas em páginas de cinco registros, com resumos para revisão.
- Botões de adicionar abaixo das listas de peças e cláusulas, junto da paginação.
- Novos registros abertos automaticamente, com foco no campo de preenchimento.
- Validação que revela a seção, a página e o editor do primeiro campo incorreto.
- Subtotais e total em reais, calculados em centavos.
- Sinalização de alterações não salvas e confirmação antes de substituir um preenchimento em andamento.

## Catálogo de peças

O catálogo inicial contém 114 peças e insumos comuns, incluindo nomes alternativos. Em **Catálogo de peças**, cadastre novas peças e apelidos, edite ou exclua seus cadastros locais. A lista tem pesquisa e paginação de dez registros. Os itens iniciais permanecem disponíveis; os contratos já salvos não são alterados ao editar o catálogo. Digite pelo menos duas letras para receber até seis sugestões. A busca ignora acentos e maiúsculas e usa distância de edição para tolerar pequenos erros, como `cabesote` e `virabrequin`.

Use **↑ / ↓** e **Enter** para selecionar, **Esc** para fechar ou o mouse para clicar. O texto é livre: serviços e peças fora do catálogo também podem ser usados.

O catálogo sugere nomes, sem definir preços ou verificar compatibilidade com veículos. Os novos cadastros entram imediatamente nas sugestões e no backup JSON. Nomes duplicados são rejeitados, ignorando acentos e maiúsculas. O catálogo inicial continua embutido no bloco JSON `catalogoPecas`.

## Configurações, armazenamento e backup

As configurações incluem quatro paletas prontas e duas cores personalizáveis: destaque (accent) e barra lateral (accent-dark). Cada cor pode ser escolhida no seletor visual ou informada como hexadecimal de seis dígitos, por exemplo, #145a48. Ao escolher uma paleta pronta, seus dois campos de cor são atualizados; use Salvar configurações para aplicar. O texto sobre os fundos personalizados alterna entre preto e branco para manter o contraste. As preferências entram no backup, e backups antigos continuam compatíveis. Também é possível escolher cantos arredondados ou discretos, espaçamento das listas e modelo padrão para novos contratos. Cores, espaçamento e tamanho de fonte alteram a tela; os documentos continuam em preto e branco.

Modelos, contratos, peças e preferências ficam em `localStorage`, no navegador e endereço em que o HTML foi aberto. A consulta opcional envia somente o CEP ao ViaCEP. Contratos, nomes de clientes e placas não são enviados ao serviço.

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
index.html          Aplicativo, catálogo, modelos e SVGs inline
manifest.webmanifest Metadados de instalação e ícones SVG embutidos
sw.js               Cache offline e ciclo de atualizações do PWA
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

**Gerar novo contrato** é a ação principal do cabeçalho do painel. Os botões de adicionar peças e cláusulas ficam abaixo das respectivas listas, inclusive no editor de modelos. A paginação continua limitando a quantidade de registros exibidos.

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


## PWA: instalar e abrir offline

Publique os três arquivos de produção em um endereço HTTPS, na raiz ou em uma subpasta. Não é necessário backend nem processo de compilação. A abertura via arquivo local continua funcionando, mas não registra service worker nem habilita instalação. Para desenvolvimento, um servidor estático em localhost também permite testar o PWA. Consulte os [requisitos de instalação documentados pela MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

1. Abra o endereço publicado com internet e aguarde a preparação do modo offline, indicada em **Configurações → Instalar aplicativo**.
2. Use **Instalar Contrato Fácil** quando o navegador disponibilizar o botão, ou a opção de instalação no próprio menu do navegador. A disponibilidade depende do navegador e do sistema; não há instalação automática.
3. Depois da preparação, o app pode ser reaberto e usado offline para criar, salvar e imprimir contratos. A consulta de CEP continua exigindo internet.

Os ícones foram desenhados em SVG: o símbolo na interface é inline, o favicon e os ícones do manifesto usam data URLs, incluindo uma variante maskable com fundo preenchido. Não dependem de fontes, bibliotecas ou serviços externos. Manifesto e ícones foram validados pelo Chrome através do protocolo DevTools; a instalação efetiva no sistema operacional não foi automatizada.

### Dados, atualização e publicação

O cache contém apenas o HTML e o manifesto; os SVGs já estão embutidos. Nenhum endereço consultado, backup ou dado de cliente é incluído no Cache Storage. Os contratos continuam no localStorage do navegador. Instalar não cria sincronização nem backup.

**Antes de trocar do HTML local para o endereço publicado, exporte o backup e restaure-o no novo endereço.** Arquivo local, domínio, porta e perfil de navegador distintos têm armazenamentos separados. Mantenha o endereço de publicação para preservar o acesso aos dados.

Ao publicar mudanças, altere `VERSAO` em `sw.js` e envie os três arquivos atualizados. O novo worker prepara seu próprio cache e aguarda o fechamento das janelas que ainda usam a versão anterior. O app não força recarregamento nem substitui um formulário em edição; Configurações informa quando há atualização aguardando. Depois de salvar o trabalho, feche todas as janelas do app, inclusive abas abertas no navegador, e reabra para usar a versão nova. A ativação remove apenas caches antigos deste aplicativo e escopo.

Se a hospedagem estiver indisponível ou algum arquivo estiver ausente durante a instalação da atualização, o worker anterior continua disponível. Hospedagem deve servir `sw.js` como JavaScript e o manifesto como JSON/application/manifest+json. Evite cache HTTP prolongado do service worker.

### Testes do PWA

`npm test` inclui testes em servidor HTTP local com subpasta, perfil temporário do Chrome, validação do manifesto e critérios de instalação, reabertura offline, criação/impressão offline, persistência do histórico e atualização com rascunho aberto. Também verifica isolamento do cache de outro sistema e manutenção da versão anterior quando o download de uma atualização falha. Os testes anteriores continuam verificando abertura direta do HTML.

### Tipografia da interface

A interface usa **Inter variável (pesos 400–800)**, embutida em WOFF2 no próprio HTML para funcionar offline. Copyright e [SIL Open Font License](https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt) estão no bloco `licencaInter`. Não há consulta ao Google Fonts durante o uso.

As novas famílias são aplicadas apenas à tela. O documento impresso mantém Arial e todas as regras de impressão anteriores. O cache do PWA foi atualizado para distribuir a alteração na próxima ativação.


O tamanho Normal da interface é **16 px**, com opções Grande (21 px) e Extra grande (24 px). Preferências e backups antigos de 18 px são convertidos para o novo Normal; os tamanhos ampliados são preservados. Links da barra lateral usam padding de 10 px × 12 px, e a marca tem margem inferior de 16 px. As fontes de impressão permanecem inalteradas.


O campo **Valor por extenso** permanece manual e sua label não exibe “opcional”. A conversão automática do total ainda não está implementada.


## Marca do sistema

Em **Configurações → Marca do sistema**, personalize o título, informe a URL da imagem exibida acima dele e escolha alinhamento à esquerda, ao centro ou à direita. O título tem até 80 caracteres. Para remover a imagem, deixe a URL vazia e salve. Essas opções alteram somente a interface; não mudam a oficina nem os cabeçalhos dos PDFs.

A imagem é carregada da URL pública HTTP/HTTPS informada, sem envio do endereço da página no Referer. Em páginas HTTPS, prefira imagem também HTTPS para evitar bloqueio de conteúdo misto. Se houver falha ou ausência de internet, o título permanece disponível e Configurações informa o problema. A URL entra no backup, mas a imagem externa não é incluída no cache offline. A imagem é solicitada ao servidor indicado pelo usuário. Preferências antigas usam “Contrato Fácil”, sem imagem e alinhado à esquerda.

## Modelo de cabeçote

**Serviço e garantia de cabeçote — Shekinah** preserva as condições de garantia, exclusões, obrigações, análise técnica e disposições finais do documento fornecido. A identificação das partes e do veículo e a relação de serviços usam o layout de impressão existente. Dados pessoais, veículo, serviços específicos, preços e pagamentos do exemplo não foram incorporados ao modelo. Preencha os serviços efetivamente contratados na lista de itens.

Há campos de **Ano do veículo**, **Forma de pagamento** (inclusive pagamentos divididos) e **Data de conclusão do serviço**. Nas cláusulas, use `{{formaPagamento}}` e `{{dataConclusao}}`; o total continua vindo da soma dos itens. O título do documento pode ser personalizado em Modelos → Editar. A opção de fluxo contínuo de cláusulas evita a quebra fixa no novo modelo; modelos anteriores mantêm sua paginação.

O novo modelo é disponibilizado também em bases anteriores, sem sobrescrever os modelos existentes. A inclusão fica registrada na próxima gravação; se o usuário o excluir, ele não será adicionado novamente. Backups anteriores continuam aceitos. Os contratos históricos preservam seu próprio modelo e seus valores. Na base com o limite de 200 modelos atingido, libere um espaço antes de receber o novo modelo.


## Painel operacional

A interface usa raios de 4–6 px, espaçamento reduzido e bordas de campos com maior contraste. Em telas estreitas, as linhas da tabela se reorganizam em registros com rótulos, sem rolagem horizontal da página. O histórico completo e o cadastro de modelos continuam disponíveis pelo painel e pelo menu. A captura de tela deste README usa exclusivamente dados fictícios.

A pesquisa do painel percorre todos os contratos, inclusive os que não estão nos dez registros iniciais. **Limpar busca** restaura a lista recente. **Reimprimir** abre o contrato salvo e a impressão, preservando conteúdo e datas do registro. Se houver rascunho não salvo, a troca exige confirmação. **Duplicar** abre uma cópia para edição; salvar conteúdo idêntico continua reutilizando o registro existente.

O badge no rodapé distingue arquivo local, cache offline pronto e ausência de conexão sem cache. O estado de cache pronto só aparece depois da ativação do service worker; a consulta de CEP e a imagem externa da marca ainda podem precisar de internet. Atualizações, preferências de cores/marca, backups e fontes dos PDFs mantêm o comportamento anterior.

A validação desta refatoração está em [docs/REFATORACAO-UI.md](docs/REFATORACAO-UI.md).


## JSON automático em pastas

Em **Configurações → Gravação automática em JSON**, escolha a pasta principal e, opcionalmente, outra pasta para a segunda cópia. Você pode escolher a pasta do HTML. O navegador exige autorização explícita e pode bloquear pastas protegidas do sistema; não existe gravação silenciosa arbitrária em C:\Windows, Documentos ou na pasta do HTML. A disponibilidade depende do navegador/contexto; Chrome/Edge compatíveis oferecem o seletor. Se indisponível, use Exportar backup.

Após autorizar, o app atualiza **contrato-facil-banco-v1.json** quando dados são salvos, incluindo criação, edição e exclusão de modelos, contratos, peças e preferências. O arquivo tem o formato do backup e pode ser restaurado pelo fluxo existente. Rascunhos não salvos não entram no JSON. São até 2.000 peças locais, cada uma com até 20 apelidos.

As permissões das pastas ficam no IndexedDB, fora dos backups. Elas podem expirar: use **Reautorizar**. Não há tentativa automática de solicitar permissão durante a gravação. Confira os estados de cada pasta e aguarde “JSON salvo” antes de fechar; a cópia no disco é assíncrona, embora o salvamento no navegador seja imediato. Uma falha numa pasta não impede a outra.

Para remover uma pasta da rotina, use **Desativar**; nenhum arquivo existente é apagado. Não há leitura/restauração automática ao abrir o app: isso evita substituir dados sem confirmação. Para recuperar uma base perdida, restaure o JSON pelo botão de backup. Se a base atual foi substituída ou um arquivo mudou externamente, a gravação é bloqueada até selecionar novamente a pasta e confirmar.

O app confirma antes de substituir um JSON já existente na seleção da pasta e recusa arquivos inválidos. As gravações são enfileiradas para evitar que uma gravação antiga termine depois da mais recente. Uma identificação da base e a assinatura do arquivo protegem contra sobrescritas acidentais entre sessões. A cópia automática é um espelho do estado atual, inclusive exclusões; mantenha também exportações históricas. Isso não é um banco compartilhado para vários usuários editarem simultaneamente.

Validação: testes em Chrome com diretórios OPFS reais e handles persistidos no IndexedDB, seletor de pastas substituído no teste. Foram verificados dois destinos, cadastro/edição/exclusão, persistência, reabertura, erro de permissão, alteração externa e troca de base. A autorização de pastas físicas não foi automatizada. Referências: [File System Access](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access) e [seletor de pastas](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker).


A paginação do catálogo exibe **Página X de Y** entre os botões Anterior e Próxima, atualizada ao navegar ou filtrar.


O catálogo inicial foi atualizado conforme a lista fornecida, com 114 peças e seus apelidos. Cadastros locais e contratos existentes são preservados. Se uma peça local também existir na lista inicial, ela aparece uma única vez, mantendo o cadastro local editável e reunindo os apelidos.
