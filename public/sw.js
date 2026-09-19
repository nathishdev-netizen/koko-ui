/*
 * Service worker — deliberately conservative.
 *
 * The cardinal rule for a shop: NEVER serve a cached price. Anything that can
 * carry money (pages, API responses) is network-first, so a stale figure can
 * only ever appear when the user is genuinely offline — and then it is framed
 * as offline, not presented as current.
 *
 * What gets cached, and why:
 *   - Build assets (/_next/static/*): immutable, content-hashed. Cache-first
 *     forever; a new build emits new URLs, so staleness is impossible.
 *   - Images: cache-first with a cap. Product photography is large and rarely
 *     changes; this is where the offline win actually comes from.
 *   - Pages & API: network-first, falling back to cache only when offline.
 *   - Anything non-GET (add to cart, checkout): never touched.
 */
const VERSION = 'v1';
const STATIC_CACHE = `kf-static-${VERSION}`;
const IMAGE_CACHE = `kf-images-${VERSION}`;
const PAGE_CACHE = `kf-pages-${VERSION}`;
const OFFLINE_URL = '/offline';

const MAX_IMAGES = 60;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      // A failed precache must not block activation — the worker is still
      // useful without the offline page.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.endsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Keeps a cache from growing without bound; evicts oldest first. */
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only GET is ever cacheable. A POST to /api/v1/checkout must always hit the
  // network — caching a mutation would be a correctness bug, not an optimisation.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cross-origin (CDN images, fonts) — let the browser handle it.
  if (url.origin !== self.location.origin) return;

  // Never cache auth or checkout routes, even on GET: they are session-shaped
  // and a cached response could leak one customer's view to another.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/account')) {
    return;
  }

  // 1. Immutable build output — safe to cache forever.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // 2. Images — cache-first, capped.
  if (
    request.destination === 'image' ||
    url.pathname.startsWith('/_next/image')
  ) {
    event.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;
        return fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(IMAGE_CACHE).then((c) => {
                c.put(request, copy);
                trim(IMAGE_CACHE, MAX_IMAGES);
              });
            }
            return res;
          })
          .catch(() => hit);
      }),
    );
    return;
  }

  // Next's client router fetches RSC payloads (?_rsc=) rather than doing a real
  // navigation, so an in-app link while offline never reaches the `navigate`
  // branch below — it fails in the router and renders the not-found boundary.
  // Letting these fail fast is correct: the payload carries prices, and a stale
  // one is worse than an error the app can handle.
  if (url.searchParams.has('_rsc')) return;

  // 3. Pages — network-first. A cached page is a fallback for being offline,
  //    never a performance shortcut, because pages carry prices.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGE_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match(OFFLINE_URL)),
        ),
    );
  }
});
