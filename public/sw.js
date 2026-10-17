const CACHE_VERSION = 'flo-for-haimi-v5'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const PAGE_CACHE = `${CACHE_VERSION}-pages`

const CORE_ASSETS = ['/', '/favicon.svg', '/manifest.webmanifest']
const STATIC_DESTINATIONS = new Set(['font', 'image', 'manifest', 'script', 'style'])
const STATIC_FILE_PATTERN = /\.(?:avif|css|gif|ico|jpe?g|js|png|svg|webp|woff2?)$/i

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Cache small critical assets — must succeed for install to complete.
      await cache.addAll(CORE_ASSETS)
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => !cacheName.startsWith(CACHE_VERSION))
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  // Always fetch version.json from the network so update checks are never stale
  if (new URL(request.url).pathname === '/version.json') {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  const url = new URL(request.url)

  const isBuiltAsset = url.pathname.startsWith('/assets/')
  const isPublicAsset =
    STATIC_DESTINATIONS.has(request.destination) && !url.pathname.startsWith('/src/')
  const isStaticAsset =
    isBuiltAsset || (isPublicAsset && STATIC_FILE_PATTERN.test(url.pathname))

  if (url.origin === self.location.origin && isStaticAsset) {
    event.respondWith(cacheFirst(request))
  }
})

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  const response = await fetch(request)

  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE)
    await cache.put(request, response.clone())
  }

  return response
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE)

  try {
    const response = await fetch(request)

    if (response.ok) {
      await cache.put(request, response.clone())
    }

    return response
  } catch {
    return (await cache.match(request)) || caches.match('/')
  }
}
