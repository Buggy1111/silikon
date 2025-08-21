const CACHE_NAME = 'vmq-vyroba-v1.0.1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Instalace service workeru
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
  // Aktivovat nový service worker hned
  self.skipWaiting();
});

// Aktivace service workeru
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Převzít kontrolu nad všemi stránkami
  self.clients.claim();
});

// Fetch interceptor - Cache First strategie pro statické soubory
self.addEventListener('fetch', (event) => {
  // Pouze pro GET požadavky
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API požadavky - Network First
  if (event.request.url.includes('/api/') || event.request.url.includes('.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cachovat úspěšné API odpovědi
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback z cache pokud síť selže
          return caches.match(event.request);
        })
    );
    return;
  }

  // Statické soubory - Cache First s vylepšenou logikou
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Vrátit z cache pokud existuje
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }
        
        // Jinak fetch ze sítě a přidat do cache
        return fetch(event.request).then((response) => {
          // Kontrola platné odpovědi
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Cachovat pouze určité typy souborů
          const url = new URL(event.request.url);
          const shouldCache = 
            url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.jpg') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.ico') ||
            url.pathname === '/';

          if (shouldCache) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        });
      })
      .catch(() => {
        // Offline fallback pro navigační požadavky
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync pro odesílání dat když je síť dostupná
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'vmq-data-sync') {
    event.waitUntil(
      // Zde by bylo odesílání nahromaděných dat
      syncVMQData()
    );
  }
});

// Push notifications pro VMQ alerts
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nové upozornění z VMQ výroby',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Otevřít aplikaci',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Zavřít'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('VMQ Výroba', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Pomocná funkce pro sync dat
async function syncVMQData() {
  try {
    // Zde by byla logika pro synchronizaci dat
    console.log('[SW] Syncing VMQ data...');
    
    // Simulace úspěšné synchronizace
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Data sync failed:', error);
    throw error;
  }
}