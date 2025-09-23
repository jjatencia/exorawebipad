/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-6856d41d'], (function (workbox) { 'use strict';

  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "404.html",
    "revision": "33f9628aea58511b4d7c3ddc8e09a8f6"
  }, {
    "url": "assets/index-DafujoJG.css",
    "revision": null
  }, {
    "url": "assets/index-Dhybm7KA.js",
    "revision": null
  }, {
    "url": "assets/router-DOm5wjR5.js",
    "revision": null
  }, {
    "url": "assets/ui-DJNPBiSa.js",
    "revision": null
  }, {
    "url": "assets/utils-Dq7FJXLK.js",
    "revision": null
  }, {
    "url": "assets/vendor-BnAv-nsF.js",
    "revision": null
  }, {
    "url": "Captura de pantalla 2025-09-16 a las 23.43.22.png",
    "revision": "190b69be05f091997440b5e191d06f5b"
  }, {
    "url": "favicon.ico",
    "revision": "6cd697262c627b110ff82fd806ae9895"
  }, {
    "url": "icon-192.png",
    "revision": "da0dd28cdd6661650bcdc0a6841609db"
  }, {
    "url": "icon-512.png",
    "revision": "675d51f54f725d0c522485b4ee280a0d"
  }, {
    "url": "icon-pwa.svg",
    "revision": "3c1b33fe7ef6cfe41aa589d62d06c7e9"
  }, {
    "url": "icon.svg",
    "revision": "cde90bd6b9783d445ccd8b52c81c97a8"
  }, {
    "url": "index.html",
    "revision": "aab81aab7a0b8ed6227f3ee5f307497f"
  }, {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "favicon.ico",
    "revision": "6cd697262c627b110ff82fd806ae9895"
  }, {
    "url": "icon-192.png",
    "revision": "da0dd28cdd6661650bcdc0a6841609db"
  }, {
    "url": "icon-512.png",
    "revision": "675d51f54f725d0c522485b4ee280a0d"
  }, {
    "url": "icon-pwa.svg",
    "revision": "3c1b33fe7ef6cfe41aa589d62d06c7e9"
  }, {
    "url": "manifest.webmanifest",
    "revision": "10a9c61f3af4a10bc63ae99181ed02dc"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/api\./i, new workbox.NetworkFirst({
    "cacheName": "api-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 900
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
