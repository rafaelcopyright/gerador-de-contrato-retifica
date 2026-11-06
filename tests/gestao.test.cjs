const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const arquivo = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
const chave = 'contrato-facil-dados-v1';

async function navegador(t, scriptInicial) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', erro => errors.push(erro.message));
  t.after(() => assert.deepEqual(errors, []));
  if (scriptInicial) await page.addInitScript(scriptInicial);
  await page.goto(arquivo);
  await page.evaluate(() => { window.print = () => { window.impressoes = (window.impressoes || 0) + 1; }; });
  return page;
}

async function ir(page, pagina) {
  await page.locator(`.sidebar a[href="#${pagina}"]`).click();
  const paginas = { inicio: 'paginaInicio', historico: 'paginaHistorico', modelos: 'paginaModelos', configuracoes: 'paginaConfiguracoes', novo: 'paginaEditor' };
  if (paginas[pagina]) await page.waitForFunction(id => !document.getElementById(id).hidden, paginas[pagina]);
  else await page.waitForFunction(id => document.getElementById(id).open, pagina);
}
async function lerEstado(page) { return page.evaluate(chave => JSON.parse(localStorage.getItem(chave)), chave); }
async function preencherItem(page, descricao = 'Retífica do motor', preco = '25.10') {
  await ir(page, 'pecas');
  await page.locator('.descricao').fill(descricao);
  await page.locator('.preco').fill(preco);
}

test('modelos e histórico: criar, editar, copiar, excluir e preservar versões antigas', async t => {
  const page = await navegador(t);
  assert.equal(await page.locator('#paginaInicio').isVisible(), true);
  assert.equal(await page.locator('.home-grid .shortcut').count(), 3);
  await ir(page, 'modelos');
  await page.locator('#novoModelo').click();
  await page.locator('#nomeModelo').fill('Modelo personalizado');
  await page.locator('#modelo-empresa').fill('Oficina de teste');
  await page.locator('#modelo-pix').fill('pix-original@example.com');
  await page.locator('#adicionarClausulaModelo').click();
  await page.locator('#listaClausulasModelo textarea').fill('Serviço no valor de {{total}}. Pagamento via Pix: {{pix}}.');
  await page.locator('#formModelo button[type="submit"]').click();
  assert.equal(await page.locator('#dialogModelo').isVisible(), false);
  await page.getByRole('button', { name: 'Copiar modelo Modelo personalizado', exact: true }).click();
  assert.equal(await page.locator('#listaModelos article').count(), 4);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Excluir modelo Modelo personalizado (cópia)', exact: true }).click();
  await page.getByRole('button', { name: 'Usar modelo Modelo personalizado', exact: true }).click();
  await page.locator('#cliente').fill('Cliente Alfa');
  await page.locator('#veiculo').fill('Carro de teste');
  await page.locator('#placa').fill('ABC1D23');
  await preencherItem(page);
  await page.locator('#salvarContrato').click();
  const original = (await lerEstado(page)).contratos[0];
  assert.equal(original.modelo.oficina.pix, 'pix-original@example.com');
  await ir(page, 'historico');
  assert.match(await page.locator('#listaHistorico').innerText(), /Cliente Alfa.*Carro de teste.*ABC1D23/s);
  await page.reload();
  assert.equal(await page.locator('#listaHistorico article').count(), 1);
  await page.getByRole('button', { name: 'Editar contrato de Cliente Alfa', exact: true }).click();
  await page.locator('#cliente').fill('Cliente Revisado');
  await page.locator('#salvarContrato').click();
  const revisado = (await lerEstado(page)).contratos[0];
  assert.equal(revisado.id, original.id);
  assert.equal(revisado.criadoEm, original.criadoEm);
  assert.equal((await lerEstado(page)).contratos.length, 1);
  await ir(page, 'historico');
  await page.getByRole('button', { name: 'Copiar contrato de Cliente Revisado', exact: true }).click();
  assert.equal((await lerEstado(page)).contratos.length, 1, 'copiar abre um preenchimento sem gravar antes da confirmação');
  await page.locator('#cliente').fill('Cliente Cópia');
  await page.locator('#salvarContrato').click();
  assert.equal((await lerEstado(page)).contratos.length, 2);
  assert.notEqual((await lerEstado(page)).contratos[0].id, original.id);
  await ir(page, 'modelos');
  await page.getByRole('button', { name: 'Editar modelo Modelo personalizado', exact: true }).click();
  await page.locator('#modelo-pix').fill('pix-alterado@example.com');
  await page.locator('#formModelo button[type="submit"]').click();
  assert.equal((await lerEstado(page)).contratos[0].modelo.oficina.pix, 'pix-original@example.com');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Excluir modelo Modelo personalizado', exact: true }).click();
  await ir(page, 'historico');
  await page.getByRole('button', { name: 'Editar contrato de Cliente Cópia', exact: true }).click();
  assert.match(await page.locator('#modeloContrato option:checked').textContent(), /arquivado/);
  await page.evaluate(() => { window.print = () => { window.impressoes = 1; }; });
  await page.getByRole('button', { name: 'Imprimir / salvar PDF', exact: true }).click();
  assert.equal(await page.evaluate(() => window.impressoes), 1);
  assert.match(await page.locator('#pdfClausulas').textContent(), /pix-original@example.com/);
  assert.doesNotMatch(await page.locator('#pdfClausulas').textContent(), /pix-alterado@example.com/);
  await ir(page, 'historico');
  await page.locator('#buscarHistorico').fill('ABC1D23');
  assert.equal(await page.locator('#listaHistorico article').count(), 2);
  await page.locator('#buscarHistorico').fill('não existe');
  assert.match(await page.locator('#listaHistorico').innerText(), /Nenhum contrato encontrado/);
  await page.locator('#buscarHistorico').fill('');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Excluir contrato de Cliente Revisado', exact: true }).click();
  assert.equal((await lerEstado(page)).contratos.length, 2);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Excluir contrato de Cliente Revisado', exact: true }).click();
  assert.equal((await lerEstado(page)).contratos.length, 1);
});

test('aparência, backup e rejeição de restauração inválida sem perder dados', async t => {
  const page = await navegador(t);
  await ir(page, 'novo');
  await page.locator('#cliente').fill('Cliente Backup');
  await preencherItem(page);
  await page.locator('#salvarContrato').click();
  await ir(page, 'configuracoes');
  await page.locator('#tema').selectOption('azul');
  await page.locator('#estilo').selectOption('reto');
  await page.locator('#densidade').selectOption('compacto');
  await page.locator('#modeloPadrao').selectOption('shekinah-garantia');
  await page.locator('#formConfiguracoes button').click();
  await page.reload();
  assert.equal(await page.locator('#tema').inputValue(), 'azul');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()), '#174f88');
  await ir(page, 'novo');
  assert.equal(await page.locator('#modeloContrato').inputValue(), 'shekinah-garantia');
  await ir(page, 'configuracoes');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportarBackup').click();
  const download = await downloadPromise;
  const stream = await download.createReadStream(); const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const backup = Buffer.concat(chunks);
  const exportado = JSON.parse(backup.toString('utf8'));
  assert.equal(exportado.contratos.length, 1);
  assert.equal(exportado.configuracoes.tema, 'azul');
  const antes = await lerEstado(page);
  await page.locator('#arquivoBackup').setInputFiles({ name: 'invalido.json', mimeType: 'application/json', buffer: Buffer.from('{"versao":1}') });
  await page.locator('#importarBackup').click();
  await page.waitForFunction(() => document.getElementById('globalStatus').textContent.includes('Não foi possível restaurar'));
  assert.match(await page.locator('#globalStatus').innerText(), /backup válido/);
  assert.deepEqual(await lerEstado(page), antes);
  await page.locator('#tema').selectOption('vinho');
  await page.locator('#formConfiguracoes button').click();
  await page.locator('#arquivoBackup').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: backup });
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#importarBackup').click();
  await page.waitForFunction(() => document.getElementById('globalStatus').textContent.includes('Backup restaurado'));
  assert.equal((await lerEstado(page)).configuracoes.tema, 'azul');
  assert.equal((await lerEstado(page)).contratos[0].campos.cliente, 'Cliente Backup');
});

test('falha de gravação não informa sucesso nem abre impressão', async t => {
  const page = await navegador(t, () => { Storage.prototype.setItem = () => { throw new DOMException('Sem espaço', 'QuotaExceededError'); }; });
  await ir(page, 'novo');
  await page.locator('#cliente').fill('Cliente Não Salvo');
  await preencherItem(page);
  await page.getByRole('button', { name: 'Imprimir / salvar PDF', exact: true }).click();
  assert.equal(await page.locator('#storageError').isVisible(), true);
  assert.match(await page.locator('#storageError').innerText(), /Não foi possível salvar/);
  assert.notEqual(await page.locator('#situacaoContrato').innerText(), 'Salvo no histórico');
  assert.equal(await page.evaluate(() => window.impressoes || 0), 0);
});

test('dados locais corrompidos são preservados para recuperação', async t => {
  const page = await navegador(t, () => localStorage.setItem('contrato-facil-dados-v1', '{corrompido'));
  assert.match(await page.locator('#storageError').innerText(), /não serão sobrescritos/);
  await page.getByRole('button', { name: 'Grande', exact: true }).click();
  assert.equal(await page.evaluate(chave => localStorage.getItem(chave), chave), '{corrompido');
});

test('garantia: cláusulas, dados variáveis, nota, cupons, recibo e impressão segura', async t => {
  const page = await navegador(t);
  await ir(page, 'novo');
  await page.locator('#modeloContrato').selectOption('shekinah-garantia');
  await page.locator('#cliente').fill('Cliente Garantia');
  await page.locator('#veiculo').fill('Veículo de teste');
  await page.locator('#placa').fill('XYZ1A23');
  await page.getByText('Pagamento, observações e revisões', { exact: true }).click();
  await page.locator('#revisao1').fill('1000');
  await page.locator('#revisao2').fill('4000');
  await page.locator('#revisao3').fill('7000');
  await page.locator('#valorRevisao').fill('850');
  await preencherItem(page, '<script>alert(1)</script>', '1000.10');
  await page.getByRole('button', { name: 'Imprimir / salvar PDF', exact: true }).click();
  assert.equal(await page.locator('#pdfClausulas p, #pdfClausulasRestantes p').count(), 16);
  assert.match(await page.locator('#pdfClausulas').textContent(), /1 ANO COM KM ILIMITADO/);
  assert.match(await page.locator('#pdfClausulasRestantes').textContent(), /até 3 dias/);
  assert.equal(await page.locator('#pdfCupons .coupon').count(), 3);
  assert.match(await page.locator('#pdfCupons').textContent(), /1000.*4000.*7000/s);
  assert.match(await page.locator('#pdfRecibo').textContent(), /Cliente Garantia/);
  assert.equal(await page.locator('#pdfRecibo script').count(), 0);
  assert.doesNotMatch(await page.locator('#documento').textContent(), /\{\{/);
  const duplicados = await page.locator('[id]').evaluateAll(elementos => elementos.map(e => e.id).filter((id, i, ids) => ids.indexOf(id) !== i));
  assert.deepEqual(duplicados, []);
  const normalizar = buffer => buffer.toString('latin1').replace(/\/(CreationDate|ModDate) \(D:[^)]+\)/g, '');
  const ligado = await page.pdf({ preferCSSPageSize: true, displayHeaderFooter: true });
  const desligado = await page.pdf({ preferCSSPageSize: true, displayHeaderFooter: false });
  assert.equal(normalizar(ligado), normalizar(desligado));
});

test('páginas novas e editor de modelos: fonte ampliada, rótulos e funcionamento offline', async t => {
  const page = await navegador(t);
  const externos = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) externos.push(request.url()); });
  await page.getByRole('button', { name: 'Extra grande', exact: true }).click();
  for (const pagina of ['inicio', 'historico', 'modelos', 'configuracoes']) {
    await ir(page, pagina);
    for (const width of [375, 768, 1200, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${pagina} em ${width}px`);
    }
  }
  await ir(page, 'modelos');
  await page.locator('#novoModelo').click();
  await page.setViewportSize({ width: 375, height: 900 });
  assert.equal(await page.locator('#dialogModelo').evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth), true);
  const semRotulo = await page.locator('input, textarea, select').evaluateAll(campos => campos.filter(campo => !campo.labels.length).map(campo => campo.id));
  assert.deepEqual(semRotulo, []);
  await page.locator('#cancelarModelo').click();
  assert.deepEqual(externos, []);
});
