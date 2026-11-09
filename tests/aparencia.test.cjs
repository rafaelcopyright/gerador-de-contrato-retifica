const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
async function abrir(t){
 const browser=await chromium.launch({channel:'chrome'});t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:1366,height:650}});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);return page;
}
test('cores por seletor e hexadecimal persistem, mantêm contraste e rejeitam entrada inválida',async t=>{
 const p=await abrir(t);await p.locator('.sidebar a[href="#configuracoes"]').click();
 await p.locator('#corPrincipalHex').fill('#ffffff');await p.locator('#corEscuraHex').fill('#ffff00');
 assert.equal(await p.locator('#corPrincipal').inputValue(),'#ffffff');
 await p.locator('#formConfiguracoes button[type="submit"]').click();
 assert.deepEqual(await p.evaluate(()=>['--accent','--accent-dark','--on-accent','--on-accent-dark'].map(v=>document.documentElement.style.getPropertyValue(v))),['#ffffff','#ffff00','#000000','#000000']);
 await p.reload();assert.equal(await p.locator('#corEscuraHex').inputValue(),'#ffff00');
 const salvo=await p.evaluate(()=>localStorage.getItem('contrato-facil-dados-v1'));
 await p.locator('#corPrincipalHex').fill('#xyzxyz');await p.locator('#formConfiguracoes button[type="submit"]').click();
 assert.equal(await p.evaluate(()=>localStorage.getItem('contrato-facil-dados-v1')),salvo);
 await p.locator('#corPrincipal').evaluate(input=>{input.value='#123456';input.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal(await p.locator('#corPrincipalHex').inputValue(),'#123456');
 await p.locator('#tema').selectOption('azul');assert.equal(await p.locator('#corPrincipalHex').inputValue(),'#174f88');
});
test('barra lateral completa cabe em janelas baixas com todas as opções de fonte',async t=>{
 const p=await abrir(t);await p.locator('.sidebar a[href="#novo"]').click();
 for(const altura of [699,650,600]){
   await p.setViewportSize({width:1366,height:altura});
   for(const fonte of ['18','21','24']){
     await p.locator('[data-font="'+fonte+'"]').click();
     const dimensoes=await p.locator('.sidebar').evaluate(el=>({conteudo:el.scrollHeight,altura:el.clientHeight}));
     assert.ok(dimensoes.conteudo<=dimensoes.altura,JSON.stringify({altura,fonte,...dimensoes}));
   }
 }
});
