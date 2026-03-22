// @odoo-module ignore
// POS Service Worker - scope: /pos
/* global self, caches, fetch, setTimeout, clearTimeout, Response, URL */
(function () {
    "use strict";

    var CACHE_NAME = "pos-pwa-cache-v1";
    var OFFLINE_URL = "/pos/offline";

    // URLs to pre-cache during install
    var PRECACHE_URLS = [OFFLINE_URL];

    // Cache strategy configuration
    var CACHE_STRATEGIES = {
        // Static assets: cache-first with background update (stale-while-revalidate)
        assets: {
            match: function (url) {
                return (
                    url.pathname.startsWith("/web/assets/") ||
                    url.pathname.startsWith("/web/static/") ||
                    url.pathname.startsWith("/point_of_sale/static/") ||
                    url.pathname.startsWith("/pos_pwa/static/") ||
                    url.pathname.startsWith("/pos_offline/static/")
                );
            },
            strategy: "stale-while-revalidate",
        },
        // Fonts and images: cache-first, long duration
        fonts: {
            match: function (url) {
                return /\.(woff2?|ttf|eot|otf)(\?.*)?$/.test(url.pathname);
            },
            strategy: "cache-first",
        },
        images: {
            match: function (url) {
                return (
                    /\.(png|jpg|jpeg|gif|ico|svg|webp)(\?.*)?$/.test(url.pathname) ||
                    url.pathname.startsWith("/web/image")
                );
            },
            strategy: "cache-first",
        },
        // POS HTML shell: network-first with timeout
        shell: {
            match: function (url) {
                return url.pathname.startsWith("/pos/ui");
            },
            strategy: "network-first",
            timeout: 4000,
        },
        // RPC/API calls: network-only (PosData manages its own queue)
        rpc: {
            match: function (url) {
                return (
                    url.pathname.startsWith("/web/dataset/") ||
                    url.pathname.startsWith("/web/action/") ||
                    (url.pathname.startsWith("/web/") && url.pathname.includes("call"))
                );
            },
            strategy: "network-only",
        },
    };

    // ===== Cache Strategies =====

    function fetchWithTimeout(request, timeout) {
        return new Promise(function (resolve, reject) {
            var timer = setTimeout(function () {
                reject(new Error("Timeout"));
            }, timeout);
            fetch(request)
                .then(function (response) {
                    clearTimeout(timer);
                    resolve(response);
                })
                .catch(function (err) {
                    clearTimeout(timer);
                    reject(err);
                });
        });
    }

    function cacheFirst(request) {
        return caches.match(request).then(function (cached) {
            if (cached) {
                return cached;
            }
            return fetch(request)
                .then(function (response) {
                    if (response.ok) {
                        var cache = caches.open(CACHE_NAME);
                        cache.then(function (c) {
                            c.put(request, response.clone());
                        });
                    }
                    return response;
                })
                .catch(function () {
                    return new Response("Network error", {
                        status: 503,
                        statusText: "Service Unavailable",
                    });
                });
        });
    }

    function staleWhileRevalidate(request) {
        return caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(request).then(function (cached) {
                var fetchPromise = fetch(request)
                    .then(function (response) {
                        if (response.ok) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    })
                    .catch(function () {
                        if (cached) {
                            return cached;
                        }
                        return new Response("Network error", {
                            status: 503,
                            statusText: "Service Unavailable",
                        });
                    });

                // Return cached version immediately if available, otherwise wait for network
                return cached || fetchPromise;
            });
        });
    }

    function networkFirst(request, timeout) {
        return caches.open(CACHE_NAME).then(function (cache) {
            return fetchWithTimeout(request, timeout)
                .then(function (response) {
                    if (response.ok) {
                        cache.put(request, response.clone());
                    }
                    return response;
                })
                .catch(function () {
                    return cache.match(request).then(function (cached) {
                        if (cached) {
                            return cached;
                        }

                        // For navigation requests, show offline page
                        if (request.mode === "navigate") {
                            return cache
                                .match(OFFLINE_URL)
                                .then(function (offlinePage) {
                                    if (offlinePage) {
                                        return offlinePage;
                                    }
                                    return new Response("Network error", {
                                        status: 503,
                                        statusText: "Service Unavailable",
                                    });
                                });
                        }

                        return new Response("Network error", {
                            status: 503,
                            statusText: "Service Unavailable",
                        });
                    });
                });
        });
    }

    // ===== Lifecycle Events =====

    self.addEventListener("install", function (event) {
        event.waitUntil(
            caches.open(CACHE_NAME).then(function (cache) {
                return cache.addAll(PRECACHE_URLS);
            })
        );
        // Activate immediately without waiting for existing clients to close
        self.skipWaiting();
    });

    self.addEventListener("activate", function (event) {
        event.waitUntil(
            caches.keys().then(function (cacheNames) {
                return Promise.all(
                    cacheNames
                        .filter(function (name) {
                            return (
                                name.startsWith("pos-pwa-cache-") && name !== CACHE_NAME
                            );
                        })
                        .map(function (name) {
                            return caches.delete(name);
                        })
                );
            })
        );
        // Take control of all open clients immediately
        self.clients.claim();
    });

    // ===== Fetch Event =====

    self.addEventListener("fetch", function (event) {
        var url = new URL(event.request.url);

        // Only handle same-origin requests
        if (url.origin !== self.location.origin) {
            return;
        }

        // Skip POST requests (RPC calls) - let them pass through
        if (event.request.method !== "GET") {
            return;
        }

        // Find matching strategy
        var strategies = Object.values(CACHE_STRATEGIES);
        for (var i = 0; i < strategies.length; i++) {
            var config = strategies[i];
            if (config.match(url)) {
                switch (config.strategy) {
                    case "cache-first":
                        event.respondWith(cacheFirst(event.request));
                        return;
                    case "stale-while-revalidate":
                        event.respondWith(staleWhileRevalidate(event.request));
                        return;
                    case "network-first":
                        event.respondWith(
                            networkFirst(event.request, config.timeout || 4000)
                        );
                        return;
                    case "network-only":
                        // Let the browser handle it normally
                        return;
                }
            }
        }

        // For navigation requests to /pos/*, use network-first with offline fallback
        if (event.request.mode === "navigate" && url.pathname.startsWith("/pos")) {
            event.respondWith(networkFirst(event.request, 4000));
        }
    });
})();
