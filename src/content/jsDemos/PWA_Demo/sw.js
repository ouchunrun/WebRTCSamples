
self.addEventListener('install', function (e) {
    console.warn("install")
    e.waitUntil(
        caches.open('fox-store').then(function (cache) {
            console.log('Opened cache');
            return cache.addAll([
                './',
                './index.html',
                './index.js',
                './style.css',
                "./icon/fox-icon.png",
                "./icon/like-152x152.png",
                "./icon/like-512x512.png",
                "./video/yewen4.mp4",
                './images/fox1.jpg',
                './images/fox2.jpg',
                './images/fox3.jpg',
                './images/fox4.jpg',
                './src/jquery.min.js',
                './src/db.js',
                './src/webSocket.js'
            ]);
        })
    );
});

self.addEventListener('fetch', function(e) {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});
