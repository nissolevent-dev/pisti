// Pişti — bildirim service worker'ı
// GitHub'daki zamanlanmış görevin (bildirim/gonder.js) gönderdiği bildirimleri gösterir,
// bildirime dokununca uygulamayı "Kim var?" anketiyle açar.

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var p = {};
  try { p = e.data ? e.data.json() : {}; } catch (x) { p = {}; }
  var d = p.data || {}, n = p.notification || {};
  var baslik = d.title || n.title || 'Pişti 🃏';
  var govde = d.body || n.body || 'Kim var?';
  e.waitUntil(self.registration.showNotification(baslik, {
    body: govde,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'pisti-anket',
    renotify: true,
    data: { gun: d.gun || '', url: d.url || '' }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var veri = e.notification.data || {};
  var gun = veri.gun || '';
  var taban = veri.url || self.registration.scope;
  var hedef = taban + (taban.indexOf('?') >= 0 ? '&' : '?') + 'anket=' + encodeURIComponent(gun);
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (pencereler) {
    for (var i = 0; i < pencereler.length; i++) {
      var c = pencereler[i];
      if ('focus' in c) {
        c.postMessage({ tip: 'anket', gun: gun });
        return c.focus();
      }
    }
    return self.clients.openWindow(hedef);
  }));
});
