const CACHE_NAME = 'power-wordle-v1';
const urlsToCache = [
  '.',
  'index.html',
  'styles.css',
  'script.js',
  'words.js',
  'answers.js',
  'manifest.json',
  'data/words5.txt',
  'data/answers.txt'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
});
