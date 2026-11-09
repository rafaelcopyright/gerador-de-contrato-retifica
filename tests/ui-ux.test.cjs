const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
async function abrir(t){
 const browser=await chromium.launch({channel:'chrome'});t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const erros=[];page.on('pageerror',erro=>erros.push(erro.message));t.after(()=>assert.deepEqual(erros,[]));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href+'#modelos');return page;
}
const modelo='Garantia e revisões — Shekinah';
test('modelo protege edições ao cancelar ou usar Esc, incluindo cláusulas adicionadas',async t=>{
 const p=await abrir(t);await p.getByRole('button',{name:'Editar modelo '+modelo,exact:true}).click();
 await p.locator('#nomeModelo').fill('Modelo alterado');
 p.once('dialog',d=>d.dismiss());await p.locator('#cancelarModelo').click();
 assert.equal(await p.locator('#dialogModelo').isVisible(),true);
 assert.equal(await p.locator('#nomeModelo').inputValue(),'Modelo alterado');
 p.once('dialog',d=>d.dismiss());await p.locator('#nomeModelo').press('Escape');
 assert.equal(await p.locator('#dialogModelo').isVisible(),true);
 p.once('dialog',d=>d.accept());await p.locator('#cancelarModelo').click();
 assert.equal(await p.locator('#dialogModelo').isVisible(),false);
 await p.getByRole('button',{name:'Editar modelo '+modelo,exact:true}).click();
 assert.equal(await p.locator('#nomeModelo').inputValue(),modelo);
 await p.locator('#adicionarClausulaModelo').click();
 p.once('dialog',d=>d.dismiss());await p.locator('#cancelarModelo').click();
 assert.equal(await p.locator('#dialogModelo').isVisible(),true);
});
test('salvar, copiar e excluir modelos preserva um destino útil para o teclado',async t=>{
 const p=await abrir(t);await p.getByRole('button',{name:'Editar modelo '+modelo,exact:true}).click();
 await p.locator('#nomeModelo').fill('Modelo revisado');await p.locator('#formModelo button[type="submit"]').click();
 assert.equal(await p.getByRole('button',{name:'Editar modelo Modelo revisado',exact:true}).evaluate(e=>e===document.activeElement),true);
 await p.getByRole('button',{name:'Copiar modelo Modelo revisado',exact:true}).click();
 assert.equal(await p.getByRole('button',{name:'Editar modelo Modelo revisado (cópia)',exact:true}).evaluate(e=>e===document.activeElement),true);
 p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Excluir modelo Modelo revisado (cópia)',exact:true}).click();
 assert.equal(await p.evaluate(()=>document.activeElement.closest('#listaModelos')!==null),true);
});
test('fechar um aviso devolve o foco ao controle anterior',async t=>{
 const p=await abrir(t);await p.locator('[data-font="24"]').click();
 await p.locator('#fecharAviso').focus();await p.locator('#fecharAviso').press('Enter');
 assert.equal(await p.locator('#avisoTemporario').isVisible(),false);
 assert.equal(await p.locator('[data-font="24"]').evaluate(e=>e===document.activeElement),true);
});
