import { isLive, request } from './client';
import type { ProductSummary } from './types';

const RESOURCE = 'wishlist' as const;

/**
 * Wishlist — SERVER-persisted, scoped to the session.
 *
 * The legacy wishlist was localStorage-only: `useApiStorage` was initialised
 * false and never set true, and the backing collection was never created. So a
 * wishlist did not survive a device change even though it required login. This
 * one round-trips to the backend.
 *
 * The mock is module-level so it behaves like shared state within a session.
 */
let mockSlugs: string[] = [];

export async function getWishlist(): Promise<readonly string[]> {
  if (isLive(RESOURCE)) {
    return request<readonly string[]>('/wishlist', { revalidate: 0 });
  }
  return mockSlugs;
}

export async function addToWishlist(productSlug: string): Promise<readonly string[]> {
  if (isLive(RESOURCE)) {
    return request<readonly string[]>('/wishlist', {
      method: 'POST',
      body: { productSlug },
      revalidate: 0,
    });
  }
  if (!mockSlugs.includes(productSlug)) mockSlugs = [...mockSlugs, productSlug];
  return mockSlugs;
}

export async function removeFromWishlist(
  productSlug: string,
): Promise<readonly string[]> {
  if (isLive(RESOURCE)) {
    return request<readonly string[]>('/wishlist', {
      method: 'DELETE',
      body: { productSlug },
      revalidate: 0,
    });
  }
  mockSlugs = mockSlugs.filter((slug) => slug !== productSlug);
  return mockSlugs;
}

/** Resolves saved slugs to products for display. */
export function resolveWishlist(
  slugs: readonly string[],
  catalogue: readonly ProductSummary[],
): readonly ProductSummary[] {
  return slugs
    .map((slug) => catalogue.find((p) => p.slug === slug))
    .filter((p): p is ProductSummary => Boolean(p));
}
