const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

// Chrome instalado evita exigir download de um navegador para os testes.
test('contrato local: busca, teclado, cálculos, cláusulas, validação e impressão', async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.evaluate(() => { window.print = () => { window.impressoes = (window.impressoes || 0) + 1; }; });
    assert.equal(await page.locator('.item').count(), 1);
    assert.equal(await page.locator('#listaClausulas textarea').count(), 2);
    await page.locator('a[href="#clausulas"]').click();
    while (await page.locator('#listaClausulas button').count()) {
      if (!await page.locator('#listaClausulas > details').first().evaluate(cartao => cartao.open)) {
        await page.locator('#listaClausulas > details > summary').first().click();
      }
      await page.locator('#listaClausulas button').first().click();
    }
    const catalogo = await page.evaluate(() => JSON.parse(document.getElementById('catalogoPecas').textContent));
    assert.equal(new Set(catalogo.map(peca => peca.nome)).size, catalogo.length);
    for (const [consulta, esperado] of [['pistao', 'Pistão do motor'], ['cabesote', 'Cabeçote do motor'], ['virabrequin', 'Virabrequim'], ['motor de arranque', 'Motor de partida']]) {
      assert.ok((await page.evaluate(texto => buscarPecas(texto), consulta)).includes(esperado), consulta);
    }
    assert.deepEqual(await page.evaluate(() => buscarPecas('zzzzzzzzzz')), []);
    await page.locator('a[href="#pecas"]').click();
    await page.locator('.descricao').fill('pistao');
    assert.equal(await page.locator('.descricao').getAttribute('aria-expanded'), 'true');
    await page.locator('.descricao').press('ArrowDown');
    await page.locator('.descricao').press('Enter');
    assert.equal(await page.locator('.descricao').inputValue(), 'Pistão do motor');
    assert.equal(await page.locator('.descricao').getAttribute('aria-expanded'), 'false');
    await page.locator('.descricao').fill('filtro');
    await page.locator('.descricao').press('ArrowUp');
    assert.equal(await page.locator('[role="option"]').last().getAttribute('aria-selected'), 'true');
    await page.locator('.descricao').press('Escape');
    assert.equal(await page.locator('.descricao').getAttribute('aria-expanded'), 'false');
    await page.locator('.descricao').fill('pistao');
    await page.getByRole('option', { name: 'Pistão do motor', exact: true }).click();
    await page.locator('a[href="#dados"]').click();
    await page.locator('#oficina').fill('Oficina Exemplo');
    await page.locator('#cliente').fill('Maria da Silva');
    await page.locator('a[href="#pecas"]').click();
    await page.locator('.quantidade').fill('3');
    await page.locator('.preco').fill('10.10');
    assert.match(await page.locator('#totalGeral').innerText(), /30,30/);
    await page.locator('#adicionarItem').click();
    const segundo = page.locator('.item').nth(1);
    await segundo.locator('.descricao').fill('<img src=x onerror=alert(1)>');
    await segundo.locator('.preco').fill('0.20');
    await page.locator('a[href="#clausulas"]').click();
    await page.locator('#adicionarClausula').click();
    await page.locator('textarea').fill('Pagamento na entrega.\nCondição combinada com o cliente.');
    await page.getByRole('button', { name: 'Imprimir / salvar PDF' }).click();
    assert.equal(await page.evaluate(() => window.impressoes), 1);
    assert.match(await page.locator('#pdfTotal').innerText(), /30,50/);
    assert.equal(await page.locator('#pdfTabelaItens img').count(), 0);
    assert.match(await page.locator('#pdfTabelaItens').innerText(), /<img src=x/);
    assert.match(await page.locator('#pdfClausulas').innerText(), /1\. Pagamento na entrega/);
    await page.locator('textarea').fill('Condição editada.');
    await page.getByRole('button', { name: 'Imprimir / salvar PDF' }).click();
    assert.equal(await page.locator('#pdfClausulas').innerText(), '1. Condição editada.');
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('main').isVisible(), false);
    assert.equal(await page.locator('#documento').isVisible(), true);
    const pdf = await page.pdf({ preferCSSPageSize: true });
    assert.ok(pdf.length > 10000);
    await page.emulateMedia({ media: 'screen' });
    await page.locator('a[href="#pecas"]').click();
    await segundo.locator('button').click();
    await page.locator('.item > summary').click();
    await page.locator('.quantidade').fill('-1');
    assert.equal(await page.locator('.quantidade').evaluate(campo => campo.checkValidity()), false);
    await page.locator('.quantidade').fill('1.5');
    assert.equal(await page.locator('.quantidade').evaluate(campo => campo.checkValidity()), false);
    await page.locator('.quantidade').fill('1');
    await page.locator('.preco').fill('-0.01');
    assert.equal(await page.locator('.preco').evaluate(campo => campo.checkValidity()), false);
    await page.locator('.preco').fill('0');
    await page.locator('.descricao').fill('   ');
    await page.getByRole('button', { name: 'Imprimir / salvar PDF' }).click();
    assert.match(await page.locator('#error').innerText(), /Espaços em branco/);
    await page.locator('a[href="#clausulas"]').click();
    await page.locator('#listaClausulas button').click();
    await page.locator('a[href="#pecas"]').click();
    await page.locator('.descricao').fill('Serviço livre');
    await page.getByRole('button', { name: 'Imprimir / salvar PDF' }).click();
    assert.equal(await page.locator('#pdfTermos').evaluate(elemento => elemento.hidden), true);
    await page.locator('.item button').click();
    await page.getByRole('button', { name: 'Imprimir / salvar PDF' }).click();
    assert.match(await page.locator('#error').innerText(), /pelo menos uma/);
    await page.locator('#adicionarItem').click();
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `largura ${width}`);
    }
    const semRotulo = await page.locator('main input, main textarea').evaluateAll(campos => campos.filter(campo => !campo.labels.length).map(campo => campo.id));
    assert.deepEqual(semRotulo, []);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
