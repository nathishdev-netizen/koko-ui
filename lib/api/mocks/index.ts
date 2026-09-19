/**
 * Mock data source.
 *
 * Seeded from the legacy catalogue: slugs and collection assignments are taken
 * verbatim from the legacy 301 redirect map, so they are real indexed URLs.
 * Prices and copy are representative and need confirming against live data
 * before launch.
 */
import type { Bundle, Collection, Product } from '../types';

import bundlesJson from './bundles.json';
import collectionsJson from './collections.json';
import productsJson from './products.json';

export const mockProducts = productsJson as unknown as readonly Product[];
export const mockCollections = collectionsJson as unknown as readonly Collection[];
export const mockBundles = bundlesJson as unknown as readonly Bundle[];

/** Simulates network latency so loading states are exercised in development. */
export async function mockDelay(ms = 40): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}
