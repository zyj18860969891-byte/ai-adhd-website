// Service Worker for ADHD Task Manager PWA

const CACHE_NAME = 'adhd-task-manager-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('Failed to cache resources:', error);
            // Continue installation even if caching fails
            return Promise.resolve();
          });
      })
  )
})

// Fetch event - serve cached resources or fetch from network
self.addEventListener('fetch', (event) => {
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response
        }

        // Clone the request because it's consumed by fetch
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response because it's consumed by cache.put
            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
                  .catch(error => {
                    console.error('Failed to cache response:', error);
                  });
              })

            return response
          }
        ).catch(error => {
          console.error('Fetch failed:', error);
          // Return a fallback response or let it fail gracefully
          return new Response('Service Unavailable', { status: 503 });
        });
      })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '你有新的任务提醒',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/icon-192x192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('ADHD Task Manager', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  } else {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})