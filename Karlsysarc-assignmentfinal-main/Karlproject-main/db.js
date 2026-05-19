// Simple IndexedDB wrapper for storing users
const DB_NAME = 'ccs_app';
const DB_VERSION = 1;
const USER_STORE = 'users';

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(USER_STORE)) {
                const store = db.createObjectStore(USER_STORE, { keyPath: 'id' });
                store.createIndex('by_password', 'password', { unique: false });
            }
        };

        request.onsuccess = event => resolve(event.target.result);
        request.onerror = event => reject(event.target.error);
    });
}

async function addUser(user) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(USER_STORE, 'readwrite');
        const store = tx.objectStore(USER_STORE);
        const req = store.add(user);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}

async function getUser(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(USER_STORE, 'readonly');
        const store = tx.objectStore(USER_STORE);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// helper to authenticate user
async function getUserByCredentials(id, password) {
    const user = await getUser(id);
    if (user && user.password === password) {
        return user;
    }
    return null;
}

// expose functions globally if needed
window.db = {
    addUser,
    getUser,
    getUserByCredentials
};
