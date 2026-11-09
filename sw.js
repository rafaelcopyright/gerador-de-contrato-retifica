/* Altere a versão quando publicar mudanças nos arquivos do aplicativo.
   Sem skipWaiting: uma atualização nunca substitui uma sessão em edição. */
const VERSAO = 'v2';
const PREFIXO = 'contrato-facil-' + new URL(self.registration.scope).pathname + '-';
const CACHE = PREFIXO + VERSAO;
const ARQUIVOS = ['./index.html', './manifest.webmanifest'];
const INICIO = new URL('./index.html', self.registration.scope).href;
const RECURSOS = ARQUIVOS.map(caminho => new URL(caminho, self.registration.scope).href);

self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ARQUIVOS)));
});

self.addEventListener('activate', evento => {
  evento.waitUntil((async () => {
    const chaves = await caches.keys();
    await Promise.all(chaves.filter(chave => chave.startsWith(PREFIXO) && chave !== CACHE).map(chave => caches.delete(chave)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', evento => {
  const requisicao = evento.request;
  const url = new URL(requisicao.url);
  // Não intercepta CEP nem guarda dados de clientes, backups ou páginas de outros apps.
  if (requisicao.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (requisicao.mode === 'navigate') {
    evento.respondWith(caches.open(CACHE).then(async cache => (await cache.match(INICIO)) || fetch(requisicao)));
  } else if (RECURSOS.includes(url.href)) {
    evento.respondWith(caches.open(CACHE).then(async cache => (await cache.match(requisicao)) || fetch(requisicao)));
  }
});
