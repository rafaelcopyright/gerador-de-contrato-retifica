# Consulta externa de endereço

A única consulta externa ativa é o [ViaCEP](https://viacep.com.br/), para preencher endereço a partir do CEP da oficina ou do cliente. O usuário pode editar os dados manualmente e continuar sem internet.

A consulta envia apenas o CEP, sem credenciais, nome do cliente, placa ou conteúdo do contrato. O carregamento começa ao completar os oito dígitos ou clicar em **Buscar endereço**. Erros, ausência de conexão e tempo limite permitem nova tentativa e não apagam o endereço preenchido. Respostas atrasadas são descartadas ao trocar o CEP ou abrir outro contrato.

## Dados dos veículos

Os catálogos de veículos da BrasilAPI e da Fipe.api.br foram removidos do formulário e do JavaScript. Não há chamadas de consulta por marca, modelo, ano ou placa, nem cache de catálogos online.

Os dados do veículo são preenchidos manualmente. Informações anteriormente salvas, inclusive nomes com ano e combustível, continuam nos contratos e backups. O catálogo local de peças e a busca por sugestões permanecem disponíveis.
