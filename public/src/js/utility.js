let dbPromise = idb.open('posts-store', 1, db => {
    if (!db.objectStoreNames.contains('posts'))
        db.createObjectStore('posts', { keyPath: 'id' });
    if (!db.objectStoreNames.contains('sync-posts'))
        db.createObjectStore('sync-posts', { keyPath: 'id' });
});

function writeData(st, data) {
    return dbPromise
        .then(db => {
            const transaction = db.transaction(st, 'readwrite');
            const store = transaction.objectStore(st);
            store.put(data);
            return transaction.complete;
        })
}

function readData(st) {
    return dbPromise
        .then(db => {
            const transaction = db.transaction(st, 'readonly');
            const store = transaction.objectStore(st);
            return store.getAll();
        })
}

function clearData(st) {
    return dbPromise
        .then(db => {
            const transaction = db.transaction(st, 'readwrite');
            const store = transaction.objectStore(st);
            store.clear();
            return transaction.complete;
        })
}

function deleteItem(st, id) {
    dbPromise
        .then(db => {
            const transaction = db.transaction(st, 'readwrite');
            const store = transaction.objectStore(st);
            store.delete(id);
            return transaction.complete;
        })
        .then(deleteRes => {
            console.log('Item deleted!');
        })
}