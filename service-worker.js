/**
 * Service Worker para la PWA de Control de Acceso Vehicular
 * Proporciona funcionalidad offline básica y caché de recursos
 */

const CACHE_NAME = 'nfc-access-v1.0.0';
const STATIC_CACHE_NAME = 'nfc-access-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'nfc-access-dynamic-v1.0.0';

// Recursos estáticos para cachear
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    'https://bonaventurecclub.com/wp-content/uploads/2025/09/cropped-1.png'
];

// URLs de la API que deben ser cacheadas dinámicamente
const API_ENDPOINTS = [
    'https://api.bonaventurecclub.com/nfc_access/cards/owner/',
    'https://api.bonaventurecclub.com/nfc_access/access/log',
    'https://api.bonaventurecclub.com/nfc_access/cards/register'
];

/**
 * Evento de instalación del Service Worker
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cacheando recursos estáticos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error durante la instalación:', error);
            })
    );
});

/**
 * Evento de activación del Service Worker
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Eliminar caches antiguos
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Service Worker: Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activación completada');
                return self.clients.claim();
            })
    );
});

/**
 * Evento de interceptación de requests
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Estrategia para diferentes tipos de recursos
    if (request.method === 'GET') {
        // Recursos estáticos - Cache First
        if (STATIC_ASSETS.includes(url.pathname) || 
            url.hostname === 'fonts.googleapis.com' ||
            url.hostname === 'bonaventurecclub.com') {
            event.respondWith(cacheFirst(request));
        }
        // API calls - Network First con fallback a cache
        else if (url.hostname === 'api.bonaventurecclub.com') {
            event.respondWith(networkFirst(request));
        }
        // Otros recursos - Stale While Revalidate
        else {
            event.respondWith(staleWhileRevalidate(request));
        }
    } else {
        // Para requests POST/PUT/DELETE, siempre ir a la red
        event.respondWith(fetch(request));
    }
});

/**
 * Estrategia Cache First
 * Busca primero en cache, si no encuentra va a la red
 */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache First error:', error);
        // Retornar página offline si es una navegación
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        throw error;
    }
}

/**
 * Estrategia Network First
 * Intenta ir a la red primero, si falla usa cache
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network First: Red no disponible, usando cache');
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Si no hay cache y es una request de API, retornar error offline
        if (request.url.includes('api.bonaventurecclub.com')) {
            return new Response(
                JSON.stringify({
                    error: 'Sin conexión',
                    message: 'No se puede conectar con el servidor. Verifique su conexión a internet.',
                    offline: true
                }),
                {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        throw error;
    }
}

/**
 * Estrategia Stale While Revalidate
 * Retorna cache inmediatamente y actualiza en background
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Si falla la red, retornar cache si existe
        return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
}

/**
 * Evento de sincronización en background
 */
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Sincronización en background');
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

/**
 * Función para sincronización en background
 */
async function doBackgroundSync() {
    try {
        // Aquí se pueden implementar tareas de sincronización
        // como enviar datos pendientes cuando se recupere la conexión
        console.log('Service Worker: Ejecutando sincronización en background');
    } catch (error) {
        console.error('Service Worker: Error en sincronización:', error);
    }
}

/**
 * Evento de notificaciones push
 */
self.addEventListener('push', (event) => {
    console.log('Service Worker: Notificación push recibida');
    
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Nueva notificación del sistema de acceso',
            icon: 'https://bonaventurecclub.com/wp-content/uploads/2025/09/cropped-1.png',
            badge: 'https://bonaventurecclub.com/wp-content/uploads/2025/09/cropped-1.png',
            vibrate: [200, 100, 200],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey || 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Ver detalles',
                    icon: 'https://bonaventurecclub.com/wp-content/uploads/2025/09/cropped-1.png'
                },
                {
                    action: 'close',
                    title: 'Cerrar',
                    icon: 'https://bonaventurecclub.com/wp-content/uploads/2025/09/cropped-1.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Control de Acceso', options)
        );
    }
});

/**
 * Evento de click en notificaciones
 */
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Click en notificación');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Evento de mensajes del cliente
 */
self.addEventListener('message', (event) => {
    console.log('Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

/**
 * Función para limpiar cache antiguo
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('nfc-access-') && 
        name !== STATIC_CACHE_NAME && 
        name !== DYNAMIC_CACHE_NAME
    );
    
    return Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
    );
}

/**
 * Función para obtener estadísticas del cache
 */
async function getCacheStats() {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = keys.length;
    }
    
    return stats;
}

// Exportar funciones para uso en la aplicación principal
self.getCacheStats = getCacheStats;
self.cleanupOldCaches = cleanupOldCaches;
