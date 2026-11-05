// Service worker: permite abrir Rinde sin internet (por ejemplo, dentro del supermercado).
const CACHE = 'rinde-v1';
const SHELL = ['/', '/index.html', '/assets/styles.css', '/assets/datos.js', '/assets/app.js', '/favicon.svg', '/manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Precios: primero la red, si no hay conexión usa la última copia
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; }).catch(() => caches.match(req)));
    return;
  }
  // Resto: responde con la copia guardada y la renueva en segundo plano
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => { if (res.ok && (url.origin === location.origin || url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com'))) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
