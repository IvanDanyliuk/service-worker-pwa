const staticCacheName = 's-app-v3';
const assetsUrls = [
    'index.html',
    'js/index.js',
    'css/style.css'
]

self.addEventListener('install', async event => {
    const cache = await caches.open(staticCacheName);
    await cache.addAll(assetsUrls);
});

self.addEventListener('activate', async event => {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames
            .filter(name => name !== staticCacheName)
            .map(name => caches.delete(name))
    )
});

self.addEventListener('fetch', event => {
    console.log('Fetch', event.request.url);
    event.respondWith(cacheFirst(event.request));
});

const cacheFirst = async (request) => {
    const cashedData = await caches.match(request);
    return cashedData ?? fetch(request);
}