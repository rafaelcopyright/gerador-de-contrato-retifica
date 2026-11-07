const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const chave = 'contrato-facil-dados-v1';
async function abrir(t) {
  const browser = await chromium.launch({ channel: 'chrome' }); t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const erros = []; page.on('pageerror', erro => erros.push(erro.message)); t.after(() => assert.deepEqual(erros, []));
  await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href + '#dados');
  await page.evaluate(() => { window.print = () => { window.impressoes = (window.impressoes || 0) + 1; }; });
  return page;
}
async function estado(page) { return page.evaluate(chave => JSON.parse(localStorage.getItem(chave)), chave); }
async function preencher(page, quantidade = '1') {
  await page.locator('#cliente').fill('Cliente Único');
  await page.locator('#veiculo').fill('Carro'); await page.locator('#placa').fill('ABC1D23');
  await page.locator('.sidebar a[href="#pecas"]').click();
  await page.locator('.descricao').fill('Peça de teste'); await page.locator('.preco').fill('10.10'); await page.locator('.quantidade').fill(quantidade);
}
async function historico(page) { await page.locator('.sidebar a[href="#historico"]').click(); await page.locator('#paginaHistorico').waitFor({ state: 'visible' }); }

test('oficina resumida, edição acessível e ordem dos contatos', async t => {
  const page = await abrir(t);
  assert.equal(await page.locator('#camposOficina').isVisible(), false);
  assert.match(await page.locator('#resumoOficina').innerText(), /SHEKINAH/);
  await page.getByRole('button', { name: 'Editar dados da oficina', exact: true }).click();
  await page.locator('#oficina').fill('Oficina editada');
  await page.getByRole('button', { name: 'Concluir edição dos dados da oficina', exact: true }).click();
  assert.equal(await page.locator('#camposOficina').isVisible(), false);
  assert.match(await page.locator('#resumoOficina').innerText(), /Oficina editada/);
  assert.equal(await page.evaluate(() => Boolean(document.getElementById('celularCliente').compareDocumentPosition(document.getElementById('telefoneCliente')) & Node.DOCUMENT_POSITION_FOLLOWING)), true);
  await preencher(page);
  await page.getByRole('button', { name: 'Imprimir / salvar PDF', exact: true }).click();
  assert.equal(await page.locator('#pdfOficina').textContent(), 'Oficina editada');
  await page.locator('.sidebar a[href="#dados"]').click();
  await page.locator('#editarOficina').click(); await page.locator('#oficina').fill(''); await page.locator('#editarOficina').click();
  await page.locator('#salvarContrato').click();
  assert.equal(await page.locator('#camposOficina').isVisible(), true);
  assert.equal(await page.locator('#oficina').evaluate(campo => campo === document.activeElement), true);
});

test('avisos temporários desaparecem, podem ser fechados e não cobrem ações de salvar', async t => {
  const page = await abrir(t); await page.clock.install();
  await preencher(page); await page.locator('#salvarContrato').click();
  assert.equal(await page.locator('#avisoTemporario').isVisible(), true);
  assert.match(await page.locator('#globalStatus').innerText(), /salvo/);
  const popup = await page.locator('#avisoTemporario').boundingBox(); const salvar = await page.locator('#salvarContrato').boundingBox();
  assert.ok(popup.y + popup.height < salvar.y);
  await page.clock.fastForward(7100);
  assert.equal(await page.locator('#avisoTemporario').isVisible(), false);
  await page.locator('#salvarContrato').click();
  await page.getByRole('button', { name: 'Fechar aviso', exact: true }).click();
  assert.equal(await page.locator('#avisoTemporario').isVisible(), false);
});

test('salvar, imprimir, copiar e recarregar não criam duplicados idênticos', async t => {
  const page = await abrir(t); await preencher(page);
  await page.locator('#salvarContrato').dblclick();
  const primeiro = (await estado(page)).contratos[0];
  assert.equal((await estado(page)).contratos.length, 1);
  await page.getByRole('button', { name: 'Imprimir / salvar PDF', exact: true }).dblclick();
  assert.equal((await estado(page)).contratos.length, 1);
  assert.equal(await page.evaluate(() => window.impressoes), 2);
  await historico(page); await page.getByRole('button', { name: 'Copiar contrato de Cliente Único', exact: true }).click();
  assert.notEqual(await page.locator('#numeroContrato').inputValue(), primeiro.campos.numeroContrato);
  await page.locator('#salvarContrato').click();
  assert.equal((await estado(page)).contratos.length, 1);
  assert.equal((await estado(page)).contratos[0].id, primeiro.id);
  assert.equal((await estado(page)).contratos[0].criadoEm, primeiro.criadoEm);
  assert.equal((await estado(page)).sequencia, 2);
  assert.match(await page.locator('#globalStatus').innerText(), /reutilizado/);
  await page.reload();
  await page.locator('.sidebar a[href="#novo"]').click();
  await page.locator('#paginaEditor').waitFor({ state: 'visible' });
  await preencher(page); await page.locator('#salvarContrato').click();
  assert.equal((await estado(page)).contratos.length, 1);
  assert.equal((await estado(page)).contratos[0].id, primeiro.id);
  assert.equal((await estado(page)).sequencia, 2);
});

test('dados diferentes criam novo contrato; edição não pode duplicar outro registro', async t => {
  const page = await abrir(t); await preencher(page); await page.locator('#salvarContrato').click();
  await historico(page); await page.getByRole('button', { name: 'Copiar contrato de Cliente Único', exact: true }).click();
  await page.locator('.sidebar a[href="#pecas"]').click();
  if (!await page.locator('.quantidade').isVisible()) await page.locator('.item > summary').click();
  await page.locator('.quantidade').fill('2'); await page.locator('#salvarContrato').click();
  const anterior = await estado(page); assert.equal(anterior.contratos.length, 2);
  await page.locator('.quantidade').fill('1'); await page.locator('#salvarContrato').click();
  assert.deepEqual(await estado(page), anterior);
  assert.match(await page.locator('#globalStatus').innerText(), /Já existe outro contrato/);
});

test('modelo copiado sem mudanças não duplica contrato nem altera o modelo original do registro', async t => {
  const page = await abrir(t); await preencher(page); await page.locator('#salvarContrato').click();
  const original = (await estado(page)).contratos[0];
  await page.locator('.sidebar a[href="#modelos"]').click();
  await page.locator('#paginaModelos').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Copiar modelo ' + original.modelo.nome, exact: true }).click();
  await page.getByRole('button', { name: 'Usar modelo ' + original.modelo.nome + ' (cópia)', exact: true }).click();
  await preencher(page); await page.locator('#salvarContrato').click();
  const salvo = await estado(page);
  assert.equal(salvo.contratos.length, 1);
  assert.equal(salvo.contratos[0].id, original.id);
  assert.deepEqual(salvo.contratos[0].modelo, original.modelo);
  assert.equal(await page.locator('#modeloContrato').inputValue(), original.modelo.id);
});

test('veículo manual sem catálogos externos preserva os dados no histórico', async t => {
  const page = await abrir(t); const requisicoes = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) requisicoes.push(request.url()); });
  assert.equal(await page.locator('#consultaVeiculo').count(), 0);
  await preencher(page);
  await page.locator('.sidebar a[href="#dados"]').click();
  await page.getByText('Mais dados do cliente e do veículo', { exact: true }).click();
  await page.locator('#combustivel').fill('Diesel');
  await page.locator('#motor').fill('MOTOR123');
  await page.locator('#quilometragem').fill('100000');
  await page.locator('#salvarContrato').click();
  const original = (await estado(page)).contratos[0];
  await page.reload(); await historico(page);
  await page.getByRole('button', { name: 'Editar contrato de Cliente Único', exact: true }).click();
  assert.equal(await page.locator('#veiculo').inputValue(), 'Carro');
  assert.equal(await page.locator('#placa').inputValue(), 'ABC1D23');
  assert.equal(await page.locator('#combustivel').inputValue(), 'Diesel');
  assert.equal(await page.locator('#motor').inputValue(), 'MOTOR123');
  assert.equal(await page.locator('#quilometragem').inputValue(), '100000');
  assert.equal((await estado(page)).contratos[0].id, original.id);
  assert.deepEqual(requisicoes, []);
});
