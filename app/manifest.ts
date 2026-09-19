import type { MetadataRoute } from 'next';

import { brand } from '@/config/brand';

/**
 * PWA manifest, generated from `config/brand.json` rather than written as a
 * static file — so a white-label brand gets its own name, colours and icons
 * with no extra step.
 *
 * `theme_color` deliberately matches the announcement bar rather than the page
 * ground: it tints the browser/OS chrome, and matching the topmost band is what
 * makes an installed app look seamless rather than seamed.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — ${brand.tagline}`,
    short_name: brand.name,
    description: brand.description,
    start_url: '/',
    // `standalone` drops the browser chrome so an installed app feels native.
    display: 'standalone',
    background_color: '#FBF3E4',
    theme_color: '#33240F',
    orientation: 'portrait',
    lang: brand.locale,
    categories: ['shopping', 'food'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // `maskable` lets Android crop to its own shape without clipping the mark.
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Shop', short_name: 'Shop', url: '/shop' },
      { name: 'Bundles', short_name: 'Bundles', url: '/shop/bundles' },
      { name: 'Cart', short_name: 'Cart', url: '/cart' },
    ],
  };
}
