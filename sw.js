const staticCacheName = 's-app-v3';
const dynamicCacheName = 'd-app-v3';
const assetsUrls = [
    'index.html',
    'js/index.js',
    'css/style.css',
    'offline.html'
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
            .filter(name => name !== dynamicCacheName)
            .map(name => caches.delete(name))
    )
});

self.addEventListener('fetch', event => {
    const {request} = event;
    const url = new URL(request.url);

    if(url.origin === location.origin) {
        event.respondWith(cacheFirst(request));
    } else {
        event.respondWith(networkFirst(request));
    }    
});

const cacheFirst = async request => {
    const cashedData = await caches.match(request);
    return cashedData ?? await fetch(request);
};

const networkFirst = async request => {
    const cacheData = await caches.open(dynamicCacheName);
    try {
        const response = await fetch(request);
        await cacheData.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await cacheData.match(request);
        return cached ?? await caches.match('/offline.html');
    }
    
}