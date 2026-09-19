'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker.
 *
 * Registration waits for `load` so it never competes with the first paint for
 * bandwidth — the worker is a second-visit optimisation and must not cost
 * anything on the first. Disabled in development, where a cached bundle makes
 * changes appear not to take effect.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // A failed registration is not worth surfacing: the site works without
        // it, and the browser already logs the reason.
      });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
