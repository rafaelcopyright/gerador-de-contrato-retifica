const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
const chave = 'contrato-facil-dados-v1';
const enderecoSe = { cep: '01001-000', logradouro: 'Praça da Sé', bairro: 'Sé', localidade: 'São Paulo', uf: 'SP' };

async function abrir(t) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const erros = []; page.on('pageerror', erro => erros.push(erro.message));
  t.after(() => assert.deepEqual(erros, []));
  await page.goto(url + '#dados');
  return page;
}
async function responder(route, dados) {
  await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify(dados) });
}
async function esperarStatus(page, id, estado) {
  await page.waitForFunction(({ id, estado }) => document.getElementById(id).dataset.state === estado, { id, estado });
}
async function consultar(page, id, cep) {
  await page.locator('#' + id).fill(cep);
  await page.locator('#' + id).press('Tab');
}
async function revisoes(page) {
  return Promise.all(['revisao1', 'revisao2', 'revisao3', 'valorRevisao'].map(id => page.locator('#' + id).inputValue()));
}

test('CEP: carregamento, preenchimento e preservação de alterações durante a busca', async t => {
  const page = await abrir(t);
  let liberar; const aguardar = new Promise(resolve => { liberar = resolve; });
  await page.route('https://viacep.com.br/ws/01001000/json/', async route => { await aguardar; await responder(route, enderecoSe); });
  await consultar(page, 'cepOficina', '01001000');
  await esperarStatus(page, 'cepOficina-status', 'loading');
  assert.equal(await page.getByRole('button', { name: 'Buscar endereço pelo CEP da oficina', exact: true }).isDisabled(), true);
  assert.equal(await page.locator('#cepOficina').inputValue(), '01001-000');
  await page.locator('#bairroOficina').fill('Bairro corrigido manualmente');
  liberar();
  await esperarStatus(page, 'cepOficina-status', 'success');
  assert.equal(await page.locator('#endereco').inputValue(), 'Praça da Sé');
  assert.equal(await page.locator('#bairroOficina').inputValue(), 'Bairro corrigido manualmente');
  assert.equal(await page.locator('#cidadeOficina').inputValue(), 'São Paulo');
  assert.equal(await page.locator('#ufOficina').inputValue(), 'SP');
  assert.equal(await page.getByRole('button', { name: 'Buscar endereço pelo CEP da oficina', exact: true }).isDisabled(), false);
  await page.locator('#endereco').fill('Praça da Sé, 15');
  await page.unroute('https://viacep.com.br/ws/01001000/json/');
  await page.route('https://viacep.com.br/ws/01001000/json/', route => responder(route, enderecoSe));
  await page.getByRole('button', { name: 'Buscar endereço pelo CEP da oficina', exact: true }).click();
  await esperarStatus(page, 'cepOficina-status', 'success');
  assert.equal(await page.locator('#endereco').inputValue(), 'Praça da Sé, 15');
});

test('CEP: cliente e modelo com CEP antes do logradouro', async t => {
  const page = await abrir(t);
  await page.route('https://viacep.com.br/ws/**', route => responder(route, enderecoSe));
  await page.getByText('Mais dados do cliente e do veículo', { exact: true }).click();
  const antesDoEndereco = await page.evaluate(() => Boolean(document.getElementById('cepCliente').compareDocumentPosition(document.getElementById('enderecoCliente')) & Node.DOCUMENT_POSITION_FOLLOWING));
  assert.equal(antesDoEndereco, true);
  await consultar(page, 'cepCliente', '01001-000');
  await esperarStatus(page, 'cepCliente-status', 'success');
  assert.equal(await page.locator('#enderecoCliente').inputValue(), 'Praça da Sé');
  assert.equal(await page.locator('#bairroCliente').inputValue(), 'Sé');
  await page.locator('.sidebar a[href="#modelos"]').click();
  await page.locator('#paginaModelos').waitFor({ state: 'visible' });
  await page.locator('#novoModelo').click();
  await consultar(page, 'modelo-cep', '01001000');
  await esperarStatus(page, 'modelo-cep-status', 'success');
  assert.equal(await page.locator('#modelo-cidade').inputValue(), 'São Paulo');
  assert.equal(await page.locator('#modelo-uf').inputValue(), 'SP');
});

test('CEP: erro e falta de internet permitem edição manual e nova tentativa', async t => {
  const page = await abrir(t);
  let consultas = 0;
  await page.route('https://viacep.com.br/ws/**', async route => { consultas++; await responder(route, { erro: 'true' }); });
  await page.locator('#endereco').fill('Rua preenchida à mão, 10');
  await page.locator('#cepOficina').fill('123');
  await page.getByRole('button', { name: 'Buscar endereço pelo CEP da oficina', exact: true }).click();
  assert.equal(consultas, 0);
  assert.match(await page.locator('#cepOficina-status').innerText(), /8 números/);
  await consultar(page, 'cepOficina', '99999999');
  await esperarStatus(page, 'cepOficina-status', 'error');
  assert.match(await page.locator('#cepOficina-status').innerText(), /não encontrado/);
  assert.equal(await page.locator('#endereco').inputValue(), 'Rua preenchida à mão, 10');
  await page.unroute('https://viacep.com.br/ws/**');
  await page.route('https://viacep.com.br/ws/**', route => route.abort('failed'));
  await page.getByRole('button', { name: 'Buscar endereço pelo CEP da oficina', exact: true }).click();
  await page.waitForFunction(() => document.getElementById('cepOficina-status').textContent.includes('conectar'));
  await page.context().setOffline(true);
  await page.getByRole('button', { name: 'Buscar endereço pelo CEP da oficina', exact: true }).click();
  assert.match(await page.locator('#cepOficina-status').innerText(), /Sem internet/);
  await page.locator('#endereco').fill('Endereço manual sem conexão');
  assert.equal(await page.locator('#endereco').inputValue(), 'Endereço manual sem conexão');
});

test('CEP: resposta atrasada não preenche outro endereço ou um novo contrato', async t => {
  const page = await abrir(t);
  let liberar; const aguardar = new Promise(resolve => { liberar = resolve; });
  await page.route('https://viacep.com.br/ws/01001000/json/', async route => { await aguardar; await responder(route, enderecoSe).catch(() => {}); });
  const outro = { cep: '90010-000', logradouro: 'Rua de teste', bairro: 'Centro', localidade: 'Porto Alegre', uf: 'RS' };
  await page.route('https://viacep.com.br/ws/90010000/json/', route => responder(route, outro));
  await consultar(page, 'cepOficina', '01001000');
  await esperarStatus(page, 'cepOficina-status', 'loading');
  await consultar(page, 'cepOficina', '90010000');
  await esperarStatus(page, 'cepOficina-status', 'success');
  liberar();
  assert.equal(await page.locator('#cidadeOficina').inputValue(), 'Porto Alegre');
  let liberarOutro; const esperarOutro = new Promise(resolve => { liberarOutro = resolve; });
  await page.unroute('https://viacep.com.br/ws/90010000/json/');
  await page.route('https://viacep.com.br/ws/90010000/json/', async route => { await esperarOutro; await responder(route, outro).catch(() => {}); });
  await page.getByRole('button', { name: 'Buscar endereço pelo CEP da oficina', exact: true }).click();
  await esperarStatus(page, 'cepOficina-status', 'loading');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('.sidebar a[href="#novo"]').click();
  await page.waitForFunction(() => document.getElementById('cepOficina').value === '03988-000');
  liberarOutro();
  assert.equal(await page.locator('#cidadeOficina').inputValue(), 'São Paulo');
});

test('revisões: padrões configuráveis, quilometragem e preservação de edições', async t => {
  const page = await abrir(t);
  assert.deepEqual(await revisoes(page), ['1000', '4000', '7000', '850.00']);
  await page.getByText('Mais dados do cliente e do veículo', { exact: true }).click();
  await page.locator('#quilometragem').fill('241025');
  assert.deepEqual(await revisoes(page), ['242025', '245025', '248025', '850.00']);
  await page.getByText('Pagamento, observações e revisões', { exact: true }).click();
  await page.locator('#revisao1').fill('250000');
  await page.locator('#valorRevisao').fill('99');
  await page.locator('#quilometragem').fill('241100');
  assert.deepEqual(await revisoes(page), ['250000', '245100', '248100', '99']);
  await page.locator('#cliente').fill('Cliente de revisão');
  await page.locator('.sidebar a[href="#pecas"]').click();
  await page.locator('.descricao').fill('Serviço'); await page.locator('.preco').fill('100');
  await page.locator('#salvarContrato').click();
  await page.locator('.sidebar a[href="#configuracoes"]').click();
  await page.locator('#paginaConfiguracoes').waitFor({ state: 'visible' });
  await page.locator('#padraoRevisao1').fill('500'); await page.locator('#padraoRevisao2').fill('1000'); await page.locator('#padraoRevisao3').fill('1500'); await page.locator('#padraoValorRevisao').fill('200');
  await page.locator('#formConfiguracoes button').click();
  await page.locator('.sidebar a[href="#novo"]').click();
  await page.waitForFunction(() => document.getElementById('paginaEditor').hidden === false);
  assert.deepEqual(await revisoes(page), ['500', '1000', '1500', '200.00']);
  await page.locator('.sidebar a[href="#historico"]').click();
  await page.getByRole('button', { name: 'Editar contrato de Cliente de revisão', exact: true }).click();
  assert.deepEqual(await revisoes(page), ['250000', '245100', '248100', '99']);
  if (!await page.locator('#quilometragem').isVisible()) await page.getByText('Mais dados do cliente e do veículo', { exact: true }).click();
  await page.locator('#quilometragem').fill('242000');
  assert.deepEqual(await revisoes(page), ['250000', '245100', '248100', '99']);
  const legado = await page.evaluate(chave => JSON.parse(localStorage.getItem(chave)), chave);
  delete legado.configuracoes.revisoes;
  for (const id of ['cepOficina', 'bairroOficina', 'cidadeOficina', 'ufOficina']) delete legado.contratos[0].campos[id];
  await page.evaluate(({ chave, legado }) => localStorage.setItem(chave, JSON.stringify(legado)), { chave, legado });
  await page.evaluate(() => { alterado = false; });
  await page.reload();
  assert.equal(await page.locator('#storageError').isVisible(), false);
});

test('CEP: tempo limite libera uma nova tentativa sem perder o endereço', async t => {
  const page = await abrir(t);
  await page.clock.install();
  await page.route('https://viacep.com.br/ws/**', () => {});
  await page.locator('#endereco').fill('Endereço preservado');
  await consultar(page, 'cepOficina', '01001000');
  await esperarStatus(page, 'cepOficina-status', 'loading');
  await page.clock.fastForward(10100);
  await esperarStatus(page, 'cepOficina-status', 'error');
  assert.match(await page.locator('#cepOficina-status').innerText(), /demorou demais/);
  assert.equal(await page.locator('#endereco').inputValue(), 'Endereço preservado');
  assert.equal(await page.getByRole('button', { name: 'Buscar endereço pelo CEP da oficina', exact: true }).isDisabled(), false);
});
