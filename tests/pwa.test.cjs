const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
async function iniciar(t){
 let versao=1;
 let falhar=false;
 const servidor=http.createServer((req,res)=>{
   const nome=new URL(req.url,'http://localhost').pathname.replace(/^\/oficina\//,'');
   if(!['index.html','sw.js','manifest.webmanifest'].includes(nome)){res.writeHead(404).end();return;}
   if(falhar && nome==='manifest.webmanifest'){res.writeHead(503).end();return;}
   let texto=fs.readFileSync(path.resolve(__dirname,'../'+nome),'utf8');
   if(nome==='sw.js')texto=texto.replace("const VERSAO = 'v1'", "const VERSAO = 'v"+versao+"'");
   if(nome==='index.html')texto=texto.replace('<title>','<meta name="versao-teste" content="'+versao+'"><title>');
   res.setHeader('Content-Type',nome==='sw.js'?'text/javascript':nome==='manifest.webmanifest'?'application/manifest+json':'text/html; charset=utf-8');
   res.setHeader('Cache-Control','no-store');res.end(texto);
 });
 await new Promise(resolve=>servidor.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>servidor.close(resolve)));
 const temporario=require('node:os').tmpdir();
 const perfil=fs.mkdtempSync(path.join(temporario,'contrato-pwa-test-'));
 const contexto=await chromium.launchPersistentContext(perfil,{channel:'chrome'});
 t.after(async()=>{await contexto.close();if(path.dirname(perfil)===temporario && path.basename(perfil).startsWith('contrato-pwa-test-'))fs.rmSync(perfil,{recursive:true,force:true});});
 const pagina=await contexto.newPage();
 const erros=[];pagina.on('pageerror',erro=>erros.push(erro.message));t.after(()=>assert.deepEqual(erros,[]));
 const url='http://127.0.0.1:'+servidor.address().port+'/oficina/index.html';
 await pagina.goto(url);await pagina.waitForFunction(()=>navigator.serviceWorker.controller);
 return {pagina,contexto,url,atualizar:()=>versao++,falharAtualizacao:()=>{versao++;falhar=true;}};
}
test('PWA possui manifesto e ícones SVG válidos e gera contratos após reabrir offline',async t=>{
 const {pagina:p,contexto,url}=await iniciar(t);
 const cdp=await contexto.newCDPSession(p);await cdp.send('Page.enable');
 const manifesto=await cdp.send('Page.getAppManifest');assert.equal(manifesto.errors.length,0);
 const dados=JSON.parse(manifesto.data);assert.equal(dados.display,'standalone');
 assert.ok(dados.icons.every(icone=>icone.src.startsWith('data:image/svg+xml,')));
 const instalacao=await cdp.send('Page.getInstallabilityErrors');assert.deepEqual(instalacao.installabilityErrors,[]);
 await contexto.setOffline(true);await p.reload();
 await p.locator('.shortcut-new').click();await p.locator('#cliente').fill('Cliente PWA offline');
 await p.locator('.sidebar a[href="#pecas"]').click();await p.locator('.descricao').fill('Peça offline');await p.locator('.preco').fill('120');
 await p.locator('#salvarContrato').click();
 await p.evaluate(()=>{window.print=()=>{window.imprimiu=true;window.dispatchEvent(new Event('afterprint'));};});
 await p.getByRole('button',{name:'Imprimir / salvar PDF',exact:true}).click();assert.equal(await p.evaluate(()=>window.imprimiu),true);
 await p.goto(url+'#historico');assert.match(await p.locator('#listaHistorico').innerText(),/Cliente PWA offline/);
 const cache=await p.evaluate(async()=>{const cache=await caches.open((await caches.keys()).find(x=>x.startsWith('contrato-facil-')));return (await cache.keys()).map(x=>new URL(x.url).pathname);});
 assert.deepEqual(cache.sort(),['/oficina/index.html','/oficina/manifest.webmanifest']);
});
test('atualização aguarda fechar o app, preserva rascunho e não remove caches de outros sistemas',async t=>{
 const {pagina:p,contexto,url,atualizar}=await iniciar(t);
 await p.evaluate(()=>caches.open('outro-sistema'));
 await p.locator('.shortcut-new').click();await p.locator('#cliente').fill('Rascunho preservado');
 atualizar();await p.evaluate(async()=>{const registro=await navigator.serviceWorker.getRegistration();await registro.update();});
 await p.waitForFunction(async()=>Boolean((await navigator.serviceWorker.getRegistration()).waiting));
 assert.equal(await p.locator('#cliente').inputValue(),'Rascunho preservado');
 assert.equal(await p.locator('meta[name="versao-teste"]').getAttribute('content'),'1');
 await p.waitForFunction(()=>document.getElementById('statusPwa').textContent.includes('Atualização disponível'));
 await p.evaluate(()=>{alterado=false;});await p.close();
 const nova=await contexto.newPage();await nova.goto(url);
 await nova.waitForFunction(()=>document.querySelector('meta[name="versao-teste"]').content==='2');
 const cachesAtivos=await nova.evaluate(()=>caches.keys());assert.ok(cachesAtivos.includes('outro-sistema'));assert.ok(!cachesAtivos.some(x=>x.endsWith('-v1')));
});


test('falha ao baixar atualização mantém a versão anterior disponível offline',async t=>{
 const {pagina:p,contexto,falharAtualizacao}=await iniciar(t);falharAtualizacao();
 await p.evaluate(async()=>{
   const registro=await navigator.serviceWorker.getRegistration();
   const terminou=new Promise(resolve=>registro.addEventListener('updatefound',()=>{
     const worker=registro.installing;worker.addEventListener('statechange',()=>{if(worker.state==='redundant')resolve();});
   },{once:true}));
   await registro.update();await terminou;
 });
 await contexto.setOffline(true);await p.reload();
 assert.equal(await p.locator('meta[name="versao-teste"]').getAttribute('content'),'1');
 assert.equal(await p.locator('.shortcut-new').isVisible(),true);
});
