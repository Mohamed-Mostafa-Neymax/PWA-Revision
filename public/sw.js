self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('STATIC')
            .then(cache => {
                cache.addAll([
                    '/',
                    '/index.html',
                    '/offline.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/promise.js',
                    '/src/js/fetch.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/main-image.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ]);
            })
    )
});

self.addEventListener('activate', event => {
    console.log('EVENT ACTIVATE');
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    console.log('EVENT FETCH');
    // Basic
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request)
                        .then(res => {
                            return caches.open('DYNAMIC')
                                .then(cache => {
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                })
                        })
                        .catch(err => caches.open('STATIC').then(cache => cache.match('/offline.html')))
                }
            })
    )
});