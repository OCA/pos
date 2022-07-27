# Copyright 2021 Tecnativa - Alexandre D. Díaz
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo.addons.pos_pwa_oca.controllers.service_worker import ServiceWorker


class ServiceWorkerCache(ServiceWorker):

    JS_PWA_CACHE = """
        self.importScripts(...{});
    """

    JS_PWA_CACHE_CONFIRMATION = """
        if (workbox) {{
          console.log('Yay! Workbox is loaded!');
        }} else {{
          console.log("Boo! Workbox didn't load!");
        }}
        
        workbox.loadModule('workbox-strategies');   
    """

    JS_PWA_CACHE_REGISTRATION = """
        workbox.core.setCacheNameDetails({{prefix: 'pos-cache'}});
        workbox.routing.registerRoute(/\.(?:js|css|png|woff)$/, new workbox.strategies.StaleWhileRevalidate({{cacheName: 'pos-cache-scripts'}}));
        workbox.routing.registerRoute(new RegExp('.*/web.*|.*/static/.*|.*/binary/.*|.*/webclient.*'),
            new workbox.strategies.StaleWhileRevalidate({{
                cacheName: 'pos-cache-page',
                cacheExpiration: {{
                    maxEntries: 50,
                    maxAgeSeconds: 300
                }},
                cacheableResponse: {{statuses: [0, 200]}}
            }})
        );
        
        {post_requests} 
    """

    JS_PWA_MAIN = """
        self.importScripts(...{pwa_scripts});
        {pwa_cache}
        
        odoo.define("pos_pwa_oca.ServiceWorker", function (require) {{
            "use strict";
            
            {pwa_cache_confirmation}
            
            {pwa_requires}

            {pwa_init}
            {pwa_core_event_install}
            {pwa_core_event_activate}
            {pwa_core_event_fetch}

            {pwa_cache_registration}
        }});
    """

    def _get_post_resquests(self):
        return """
            self.addEventListener('fetch', async (event) => {
              if (event.request.method === 'POST') {
                event.respondWith(staleWhileRevalidate(event));
              }
            });
            
            async function staleWhileRevalidate(event) {
              let promise = null;
              let cachedResponse = await getCache(event.request.clone());
              let fetchResponse = null;
              try {
                fetchResponse = await fetch(event.request.clone());
                setCache(event.request.clone(), fetchResponse.clone());
              } catch (err) {
                fetchResponse = null
              }

              return fetchResponse ? fetchResponse : Promise.resolve(cachedResponse);
            }
            
            async function serializeResponse(response) {
              let serializedHeaders = {};
              for (var entry of response.headers.entries()) {
                serializedHeaders[entry[0]] = entry[1];
              }
              let serialized = {
                headers: serializedHeaders,
                status: response.status,
                statusText: response.statusText
              };
              serialized.body = await response.json();
              return serialized;
            }
            
            async function setCache(request, response) {
              let body = await request.json();
              let id = CryptoJS.MD5(request.url + body.query).toString();
              
              var entry = {
                query: body.query,
                response: await serializeResponse(response),
                timestamp: Date.now()
              };
              
              localforage.setItem(id, entry).then(function (value) {
                console.log('Save at cache! ' + value);
              });
            }
            
            async function getCache(request) {
              try {
                let body = await request.json();
                let id = CryptoJS.MD5(request.url + body.query).toString();
                console.log(`Load response from cache.`);
                let reponseCache = null
                try {
                    reponseCache = await localforage.getItem(id);
                } catch (err) {
                    return null;
                }
                return new Response(JSON.stringify(reponseCache.response.body), reponseCache.response);
              } catch (err) {
                return null;
              }
            }
        """

    def _get_pwa_cache_scripts(self):
        """Scripts to be imported in the service worker (Order is important)"""
        return [
            "/pos_pwa_cache_oca/static/src/js/aes.js",
            "/pos_pwa_cache_oca/static/src/js/workbox-sw.js",
            "/pos_pwa_cache_oca/static/src/js/localforage.min.js",
        ]

    def _get_sw_code(self):
        sw_code = self.JS_PWA_MAIN.format(**{
            'pwa_scripts': self._get_pwa_scripts(),
            'pwa_requires': self._get_js_pwa_requires(),
            'pwa_init': self._get_js_pwa_init(),
            'pwa_core_event_install': self.JS_PWA_CORE_EVENT_INSTALL.format(
                self._get_js_pwa_core_event_install_impl()),
            'pwa_core_event_activate': self.JS_PWA_CORE_EVENT_ACTIVATE.format(
                self._get_js_pwa_core_event_activate_impl()),
            'pwa_core_event_fetch': self.JS_PWA_CORE_EVENT_FETCH.format(
                self._get_js_pwa_core_event_fetch_impl()),
            'pwa_cache': self.JS_PWA_CACHE.format(
                self._get_pwa_cache_scripts()),
            'pwa_cache_confirmation': self.JS_PWA_CACHE_CONFIRMATION,
            'pwa_cache_registration': self.JS_PWA_CACHE_REGISTRATION.format(**{
                'post_requests': self._get_post_resquests()
            })
        })

        return sw_code
