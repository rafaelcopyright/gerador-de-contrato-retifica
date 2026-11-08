const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const chave = 'contrato-facil-dados-v1';
async function abrir(t) {
  const browser = await chromium.launch({channel: 'chrome'}); t.after(() => browser.close());
  const page = await browser.newPage();
  const erros = []; page.on('pageerror', erro => erros.push(erro.message)); t.after(() => assert.deepEqual(erros, []));
  await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
  return page;
}
async function dados(page) {
  await page.locator('#cliente').fill('Cliente Revisões');
  await page.locator('.sidebar a[href="#pecas"]').click();
  await page.locator('.descricao').fill('Serviço'); await page.locator('.preco').fill('100');
}
async function valores(page) {
  return page.evaluate(() => ['revisao1','revisao2','revisao3','valorRevisao','valorRevisao2','valorRevisao3'].map(id => document.getElementById(id).value));
}
test('atalho principal, ações abaixo das listas e nome seguro do PDF', async t => {
  const page = await abrir(t);
  assert.equal(await page.locator('.shortcut').first().getAttribute('href'), '#novo');
  for (const [lista, botao] of [['listaItens','adicionarItem'],['listaClausulas','adicionarClausula'],['listaClausulasModelo','adicionarClausulaModelo']]) {
    assert.equal(await page.evaluate(([lista,botao]) => Boolean(document.getElementById(lista).compareDocumentPosition(document.getElementById(botao)) & Node.DOCUMENT_POSITION_FOLLOWING), [lista,botao]), true);
  }
  await page.locator('.shortcut').first().click(); await dados(page);
  await page.locator('.sidebar a[href="#dados"]').click();
  await page.locator('#veiculo').fill('Chevrolet/Onix: LT'); await page.locator('#placa').fill('abc1d23');
  const titulo = await page.title();
  await page.evaluate(() => { window.print = () => { window.nomePDF = document.title; window.dispatchEvent(new Event('afterprint')); }; });
  await page.getByRole('button', {name:'Imprimir / salvar PDF',exact:true}).click();
  assert.match(await page.evaluate(() => window.nomePDF), /^Contrato-.*-Chevrolet-Onix-LT-ABC1D23-\d{4}-\d{2}-\d{2}$/);
  assert.equal(await page.title(), titulo);
  await page.evaluate(() => { window.print = () => { throw Error('Indisponível'); }; });
  await page.getByRole('button', {name:'Imprimir / salvar PDF',exact:true}).click();
  assert.equal(await page.title(), titulo);
  assert.match(await page.locator('#globalStatus').innerText(), /Não foi possível/);
  assert.equal(await page.evaluate(chave => JSON.parse(localStorage.getItem(chave)).contratos.length, chave), 1);
});
test('modelo com três intervalos e preços, inclusive revisão gratuita, preserva histórico', async t => {
  const page = await abrir(t);
  await page.locator('.sidebar a[href="#modelos"]').click();
  const nome = 'Garantia e revisões — Shekinah';
  await page.getByRole('button',{name:'Editar modelo '+nome,exact:true}).click();
  for (const [id,valor] of Object.entries({'modelo-revisao1':'1000','modelo-revisao2':'2000','modelo-revisao3':'6000','modelo-valorRevisao':'10.50','modelo-valorRevisao2':'20.25','modelo-valorRevisao3':'0'})) await page.locator('#'+id).fill(valor);
  await page.locator('#formModelo button[type="submit"]').click();
  await page.getByRole('button',{name:'Usar modelo '+nome,exact:true}).click();
  await page.getByText('Mais dados do cliente e do veículo',{exact:true}).click();
  await page.locator('#quilometragem').fill('10000');
  assert.deepEqual(await valores(page), ['11000','12000','16000','10.50','20.25','0.00']);
  await dados(page);
  await page.evaluate(() => { window.print = () => window.dispatchEvent(new Event('afterprint')); });
  await page.getByRole('button',{name:'Imprimir / salvar PDF',exact:true}).click();
  const cupons = await page.locator('#pdfCupons .coupon').allTextContents();
  ['10,50','20,25','0,00'].forEach((valor,i) => assert.ok(cupons[i].includes(valor)));
  await page.locator('.sidebar a[href="#historico"]').click();
  await page.getByRole('button',{name:'Editar contrato de Cliente Revisões',exact:true}).click();
  assert.deepEqual(await valores(page), ['11000','12000','16000','10.50','20.25','0.00']);
  if (!await page.locator('#quilometragem').isVisible()) await page.getByText('Mais dados do cliente e do veículo',{exact:true}).click();
  await page.locator('#quilometragem').fill('20000');
  assert.deepEqual((await valores(page)).slice(0,3), ['11000','12000','16000']);
  if (!await page.locator('#valorRevisao').isVisible()) await page.getByText('Pagamento, observações e revisões',{exact:true}).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button',{name:'Reaplicar revisões do modelo',exact:true}).click();
  assert.deepEqual(await valores(page), ['21000','22000','26000','10.50','20.25','0.00']);
});
test('contratos antigos repetem preço legado sem criar cópia duplicada', async t => {
  const page = await abrir(t); await page.locator('.shortcut').first().click(); await dados(page); await page.locator('#salvarContrato').click();
  await page.evaluate(chave => {
    const estado = JSON.parse(localStorage.getItem(chave));
    for (const modelo of estado.modelos) delete modelo.revisoes;
    const contrato = estado.contratos[0]; delete contrato.modelo.revisoes;
    contrato.campos.valorRevisao = '77.50'; delete contrato.campos.valorRevisao2; delete contrato.campos.valorRevisao3;
    estado.configuracoes.revisoes = {primeira:1000, segunda:4000, terceira:7000, valor:850};
    localStorage.setItem(chave, JSON.stringify(estado)); alterado = false;
  }, chave);
  await page.reload();
  assert.equal(await page.locator('#storageError').isVisible(),false);
  await page.locator('.sidebar a[href="#historico"]').click();
  await page.getByRole('button',{name:'Copiar contrato de Cliente Revisões',exact:true}).click();
  assert.deepEqual((await valores(page)).slice(3), ['77.50','77.50','77.50']);
  await page.locator('#salvarContrato').click();
  assert.equal(await page.evaluate(chave => JSON.parse(localStorage.getItem(chave)).contratos.length,chave),1);
});


test('modelo rejeita intervalos fora de ordem sem alterar os dados salvos', async t => {
  const page = await abrir(t); await page.locator('.sidebar a[href="#modelos"]').click();
  const antes = await page.evaluate(chave => localStorage.getItem(chave), chave);
  await page.getByRole('button',{name:'Editar modelo Garantia e revisões — Shekinah',exact:true}).click();
  await page.locator('#modelo-revisao1').fill('5000'); await page.locator('#modelo-revisao2').fill('1000');
  await page.locator('#formModelo button[type="submit"]').click();
  assert.equal(await page.locator('#modelo-revisao1').isVisible(),true);
  assert.match(await page.locator('#erroModelo').innerText(), /revis/i);
  assert.equal(await page.evaluate(chave => localStorage.getItem(chave),chave),antes);
});
