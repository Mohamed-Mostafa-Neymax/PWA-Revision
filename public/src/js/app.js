if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('/sw.js')
        .then(function () {
            console.log('Service worker registered!');
        });

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
});