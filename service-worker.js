const CACHE_NAME = "sobhi-geo-v4";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./about.html",
  "./dashboard.html",
  "./projects.html",
  "./publications.html",
  "./consulting.html",
  "./skills.html",
  "./teaching.html",
  "./downloads.html",
  "./contact.html",
  "./cv.html",
  "./projects/hydrologic-flash-flood-risk.html",
  "./projects/environmental-disaster-geodatabase.html",
  "./projects/saudi-electricity-infrastructure-gis.html",
  "./projects/khamis-mushait-municipal-gis.html",
  "./projects/port-said-environmental-hazards.html",
  "./projects/suez-canal-emissions-modeling.html",
  "./projects/slope-hazard-zoning.html",
  "./projects/national-environmental-atlases.html",
  "./assets/css/style.css",
  "./assets/js/data.js",
  "./assets/js/main.js",
  "./assets/images/favicon.svg",
  "./assets/images/hero-geospatial.jpg",
  "./assets/images/hero-geospatial.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
