importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');
var CACHE_STATIC_NAME = 'STATIC';
var CACHE_DYNAMIC_NAME = 'DYNAMIC';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/idb.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName)
//     .then(function (cache) {
//       return cache.keys()
//         .then(function (keys) {
//           if (keys.length > maxItems) {
//             cache.delete(keys[0])
//               .then(trimCache(cacheName, maxItems));
//           }
//         });
//     })
// }

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(cache => {
                cache.addAll(STATIC_FILES);
            })
    )
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) {
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}


self.addEventListener('fetch', function (event) {
    var url = 'https://advanced-redux-65e37-default-rtdb.firebaseio.com/posts.json';
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            fetch(event.request)
                .then(function (res) {
                    const clonedRes = res.clone();
                    clearData('posts')
                        .then(clearRes => clonedRes.json())
                        .then(data => {
                            for (let key in data)
                                writeData('posts', data[key]);
                        });
                    return res;
                })
        );
    } else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response;
                    } else {
                        return fetch(event.request)
                            .then(function (res) {
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then(function (cache) {
                                        // trimCache(CACHE_DYNAMIC_NAME, 3);
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    })
                            })
                            .catch(function (_err) {
                                return caches.open(CACHE_STATIC_NAME)
                                    .then(function (cache) {
                                        if (event.request.headers.get('accept').includes('text/html')) {
                                            return cache.match('/offline.html');
                                        }
                                    });
                            });
                    }
                })
        );
    }
});

// This event will be excuted whenever whenever the SW reestablished the connectivity.
// OR
// This event will be excuted if the connectivity was always there as soon as a new task was registered.
self.addEventListener('sync', event => {
    console.log('SW Sync Event : ', event);
    if (event.tag === 'sync-new-post') {
        console.log('SW Sync New Post.');
        event.waitUntil(
            readData('sync-posts')
                .then(data => {
                    for (let dt of data) {
                        fetch('https://advanced-redux-65e37-default-rtdb.firebaseio.com/posts.json', {
                            method: 'POST',
                            body: JSON.stringify({
                                id: dt.id,
                                title: dt.title,
                                location: dt.location,
                                image: 'https://firebasestorage.googleapis.com/v0/b/advanced-redux-65e37.appspot.com/o/sf-boat.jpg?alt=media&token=84c8033d-86d8-4c1c-bbc9-e442469506d4'
                            }),
                            headers: {
                                'Content-Type': 'application/json',
                                'accept': 'application/json'
                            }
                        }).then(res => {
                            if (res.ok) 
                                deleteItem('sync-posts', dt.id);
                        }).catch(err => {
                            console.log('Error while sending data', err);
                        });
                    }
                })
        )
    }
});