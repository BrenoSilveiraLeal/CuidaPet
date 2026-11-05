/* Service worker do CuidaPet: deixa o app instalável e abrindo mesmo sem internet. */
const CACHE = 'cuidapet-v30';
const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/css/base.css',
  'assets/css/app.css',
  'assets/js/data.js',
  'assets/js/store.js',
  'assets/js/app.js',
  'assets/data/vacinas.json',
  'assets/img/hero.jpg',
  'assets/img/boi.png',
  'assets/img/bode.png',
  'assets/icons/icon-192.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // fontes etc. vão direto para a rede
  // Rede primeiro (sempre a versão mais nova); cache como reserva offline
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
  );
});
