const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
async function abrir(t) {
  const browser = await chromium.launch({ channel: 'chrome' }); t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const erros = []; page.on('pageerror', erro => erros.push(erro.message)); t.after(() => assert.deepEqual(erros, []));
  await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href + '#dados');
  await page.locator('#consultaVeiculo > summary').click();
  return page;
}
function respostas(provedor, tipo = 'carros') {
  const marca = tipo === 'caminhoes' ? '102' : tipo === 'motos' ? '80' : '59';
  const nome = tipo === 'caminhoes' ? 'AGRALE' : tipo === 'motos' ? 'HONDA' : 'VOLKSWAGEN';
  const base = provedor === 'brasilapi' ? 'https://brasilapi.com.br/api/fipe/' : `https://fipe.parallelum.com.br/api/v2/${{ carros: 'cars', motos: 'motorcycles', caminhoes: 'trucks' }[tipo]}/brands`;
  const urls = provedor === 'brasilapi'
    ? [`${base}marcas/v1/${tipo}`, `${base}veiculos/v1/${tipo}/${marca}`, `${base}anos/v1/${tipo}/${marca}/5940`, `${base}detalhes/v1/${tipo}/${marca}/5940/2014-3`]
    : [base, `${base}/${marca}/models`, `${base}/${marca}/models/5940/years`, `${base}/${marca}/models/5940/years/2014-3`];
  const dados = provedor === 'brasilapi'
    ? [[{ nome, valor: marca }], [{ modelo: 'Modelo de teste', valor: '5940' }], [{ nome: '2014 Diesel', valor: '2014-3' }], { marca: nome, modelo: 'Modelo de teste', anoModelo: 2014, combustivel: 'Diesel', codigoFipe: '005340-6', valor: 'R$ 100.000,00', mesReferencia: 'novembro de 2026' }]
    : [[{ name: nome, code: marca }], [{ name: 'Modelo de teste', code: '5940' }], [{ name: '2014 Diesel', code: '2014-3' }], { brand: nome, model: 'Modelo de teste', modelYear: 2014, fuel: 'Diesel', codeFipe: '005340-6', price: 'R$ 100.000,00', referenceMonth: 'novembro de 2026' }];
  return { urls, dados, marca, nome };
}
async function json(route, body, status = 200) {
  await route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });
}
async function montarRotas(page, fixture, observadas = []) {
  await page.route(/https:\/\/(brasilapi\.com\.br\/api\/fipe|fipe\.parallelum\.com\.br\/api\/v2)\//, route => {
    const url = route.request().url(); observadas.push(url);
    assert.equal(route.request().headers()['authorization'], undefined);
    assert.equal(route.request().headers()['x-subscription-token'], undefined);
    const indice = fixture.urls.indexOf(url);
    return json(route, indice === -1 ? { error: 'rota inesperada' } : fixture.dados[indice], indice === -1 ? 404 : 200);
  });
}
async function sucesso(page) { await page.waitForFunction(() => document.getElementById('statusVeiculo').dataset.state === 'success'); }
async function fluxo(page, fixture) {
  await page.locator('#carregarMarcas').click(); await sucesso(page);
  await page.locator('#marcaVeiculo').selectOption(fixture.marca); await sucesso(page);
  await page.locator('#modeloVeiculo').selectOption('5940'); await sucesso(page);
  await page.locator('#anoVeiculoFipe').selectOption('2014-3');
  await page.locator('#resultadoVeiculo').waitFor({ state: 'visible' });
}

for (const provedor of ['brasilapi', 'parallelum']) for (const tipo of ['carros', 'motos', 'caminhoes']) {
  test(`catálogo completo: ${provedor}, ${tipo}, confirmação e cache`, async t => {
    const page = await abrir(t); const fixture = respostas(provedor, tipo); const observadas = [];
    await montarRotas(page, fixture, observadas);
    await page.locator('#provedorVeiculo').selectOption(provedor); await page.locator('#tipoVeiculo').selectOption(tipo);
    await page.locator('#placa').fill('ABC1D23');
    await fluxo(page, fixture);
    assert.equal(await page.locator('#veiculo').inputValue(), '');
    assert.match(await page.locator('#detalhesVeiculo').innerText(), /100\.000,00/);
    await page.locator('#usarVeiculo').click();
    assert.equal(await page.locator('#veiculo').inputValue(), `${fixture.nome} Modelo de teste (2014)`);
    assert.equal(await page.locator('#combustivel').inputValue(), 'Diesel');
    assert.equal(await page.locator('#placa').inputValue(), 'ABC1D23');
    assert.equal(await page.locator('#motor').inputValue(), '');
    assert.equal(await page.locator('#quilometragem').inputValue(), '');
    assert.equal(await page.locator('.preco').inputValue(), '');
    assert.match(await page.locator('#totalGeral').innerText(), /0,00/);
    assert.deepEqual(observadas, fixture.urls);
    await page.locator('#carregarMarcas').click(); await sucesso(page);
    assert.equal(observadas.length, 4, 'o cache evita repetir a chamada de marcas');
  });
}

test('falhas HTTP, cota, resposta inválida, nova tentativa e modo offline', async t => {
  const page = await abrir(t); const fixture = respostas('brasilapi');
  let resposta = { status: 500, body: { message: 'erro' } }; let chamadas = 0;
  await page.route('https://brasilapi.com.br/api/fipe/**', route => { chamadas++; return json(route, resposta.body, resposta.status); });
  for (const status of [500, 404, 429]) {
    resposta = { status, body: { error: 'indisponível' } };
    await page.locator('#carregarMarcas').click();
    await page.waitForFunction(() => document.getElementById('statusVeiculo').dataset.state === 'error');
    assert.match(await page.locator('#statusVeiculo').innerText(), status === 429 ? /limite de consultas/ : new RegExp(`HTTP ${status}`));
    assert.equal(await page.locator('#repetirConsultaVeiculo').isVisible(), true);
  }
  resposta = { status: 200, body: { error: 'não é uma lista' } };
  await page.locator('#repetirConsultaVeiculo').click();
  await page.waitForFunction(() => document.getElementById('statusVeiculo').textContent.includes('lista inválida'));
  resposta = { status: 200, body: fixture.dados[0] };
  await page.locator('#repetirConsultaVeiculo').click(); await sucesso(page);
  assert.equal(chamadas, 5, 'falhas não são guardadas no cache');
  await page.context().setOffline(true);
  await page.locator('#marcaVeiculo').selectOption('59');
  assert.match(await page.locator('#statusVeiculo').innerText(), /Sem internet/);
  await page.locator('#veiculo').fill('Veículo manual');
  assert.equal(await page.locator('#veiculo').inputValue(), 'Veículo manual');
});

test('trocar o provedor descarta respostas antigas e não marca o contrato como editado', async t => {
  const page = await abrir(t); let liberar; const aguardar = new Promise(resolve => { liberar = resolve; });
  const brasil = respostas('brasilapi'); const fipe = respostas('parallelum');
  await page.route('https://brasilapi.com.br/api/fipe/**', async route => { await aguardar; await json(route, brasil.dados[0]).catch(() => {}); });
  await page.route('https://fipe.parallelum.com.br/api/v2/**', route => json(route, fipe.dados[0]));
  await page.locator('#carregarMarcas').click();
  await page.waitForFunction(() => document.getElementById('statusVeiculo').dataset.state === 'loading');
  await page.locator('#provedorVeiculo').selectOption('parallelum');
  assert.equal(await page.locator('#marcaVeiculo').isDisabled(), true);
  await page.locator('#carregarMarcas').click(); await sucesso(page);
  liberar();
  assert.equal(await page.locator('#marcaVeiculo option').last().textContent(), fipe.nome);
  assert.equal(await page.locator('#situacaoContrato').innerText(), 'Ainda não salvo');
});

test('correções manuais só são substituídas com confirmação e preço do serviço é preservado', async t => {
  const page = await abrir(t); const fixture = respostas('brasilapi'); await montarRotas(page, fixture);
  await page.locator('#veiculo').fill('Modelo escrito manualmente');
  await page.getByText('Mais dados do cliente e do veículo', { exact: true }).click();
  await page.locator('#combustivel').fill('Gasolina'); await page.locator('#motor').fill('MOTOR123'); await page.locator('#corVeiculo').fill('Prata'); await page.locator('#quilometragem').fill('100000');
  await fluxo(page, fixture);
  page.once('dialog', dialog => dialog.dismiss()); await page.locator('#usarVeiculo').click();
  assert.equal(await page.locator('#veiculo').inputValue(), 'Modelo escrito manualmente');
  page.once('dialog', dialog => dialog.accept()); await page.locator('#usarVeiculo').click();
  assert.equal(await page.locator('#combustivel').inputValue(), 'Diesel');
  assert.equal(await page.locator('#motor').inputValue(), 'MOTOR123');
  assert.equal(await page.locator('#corVeiculo').inputValue(), 'Prata');
  assert.equal(await page.locator('#quilometragem').inputValue(), '100000');
});

test('tempo limite permite tentar novamente e novo contrato cancela o catálogo', async t => {
  const page = await abrir(t); await page.clock.install();
  await page.route('https://brasilapi.com.br/api/fipe/**', () => {});
  await page.locator('#carregarMarcas').click();
  await page.clock.fastForward(10100);
  await page.waitForFunction(() => document.getElementById('statusVeiculo').dataset.state === 'error');
  assert.match(await page.locator('#statusVeiculo').innerText(), /demorou demais/);
  assert.equal(await page.locator('#repetirConsultaVeiculo').isVisible(), true);
  await page.locator('#repetirConsultaVeiculo').click();
  await page.locator('.sidebar a[href="#novo"]').click();
  await page.waitForFunction(() => document.getElementById('marcaVeiculo').disabled && document.getElementById('consultaVeiculo').getAttribute('aria-busy') === 'false');
  assert.equal(await page.locator('#resultadoVeiculo').isVisible(), false);
});

test('ano divergente não é aplicado; campo ausente não apaga combustível manual', async t => {
  const page = await abrir(t); const fixture = respostas('brasilapi');
  fixture.dados[3].anoModelo = 2015;
  await montarRotas(page, fixture);
  await page.getByText('Mais dados do cliente e do veículo', { exact: true }).click();
  await page.locator('#combustivel').fill('Combustível informado pela oficina');
  await page.locator('#carregarMarcas').click(); await sucesso(page);
  await page.locator('#marcaVeiculo').selectOption(fixture.marca); await sucesso(page);
  await page.locator('#modeloVeiculo').selectOption('5940'); await sucesso(page);
  await page.locator('#anoVeiculoFipe').selectOption('2014-3');
  await page.waitForFunction(() => document.getElementById('statusVeiculo').dataset.state === 'error');
  assert.match(await page.locator('#statusVeiculo').innerText(), /não corresponde/);
  assert.equal(await page.locator('#resultadoVeiculo').isVisible(), false);
  fixture.dados[3].anoModelo = 2014; delete fixture.dados[3].combustivel;
  await page.locator('#repetirConsultaVeiculo').click();
  await page.locator('#resultadoVeiculo').waitFor({ state: 'visible' });
  await page.locator('#usarVeiculo').click();
  assert.equal(await page.locator('#combustivel').inputValue(), 'Combustível informado pela oficina');
});

test('catálogo vazio permite nova tentativa; formulário mantém legibilidade ampliada', async t => {
  const page = await abrir(t); const fixture = respostas('brasilapi'); let vazio = true;
  await page.route('https://brasilapi.com.br/api/fipe/**', route => json(route, vazio ? [] : fixture.dados[0]));
  await page.locator('#carregarMarcas').click();
  await page.waitForFunction(() => document.getElementById('statusVeiculo').dataset.state === 'error');
  assert.equal(await page.locator('#marcaVeiculo').isDisabled(), true);
  vazio = false; await page.locator('#repetirConsultaVeiculo').click(); await sucesso(page);
  await page.getByRole('button', { name: 'Extra grande', exact: true }).click();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  const semRotulo = await page.locator('#consultaVeiculo select').evaluateAll(campos => campos.filter(campo => !campo.labels.length).map(campo => campo.id));
  assert.deepEqual(semRotulo, []);
});
