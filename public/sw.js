self.addEventListener('install', event => {
    console.log('EVENT INSTALL');
});

self.addEventListener('activate', event => {
    console.log('EVENT ACTIVATE');
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    console.log('EVENT FETCH');
    event.respondWith(
        fetch(event.request)
    )
});