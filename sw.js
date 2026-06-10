/* Service worker for "The Vision of the Heavens"
   Caches the app shell so it opens offline. Bible chapter text is handled
   separately by the app's own IndexedDB cache. */
var CACHE = "vision-of-heavens-v1";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // Add what we can; ignore any that 404 so install never fails
      return Promise.all(SHELL.map(function(url){
        return c.add(url).catch(function(){ /* skip missing */ });
      }));
    })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var url = new URL(e.request.url);
  // Never cache the Bible API calls — let the app's own logic handle them
  if (url.hostname.indexOf("getbible") >= 0 ||
      url.hostname.indexOf("jsdelivr") >= 0 ||
      url.hostname.indexOf("bible-api") >= 0){
    return; // default network behaviour
  }
  // App shell: cache-first, falling back to network, then to index.html
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy).catch(function(){}); });
        return res;
      }).catch(function(){
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
