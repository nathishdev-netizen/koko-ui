import { isLive, request } from './client';
import { mockBundles, mockDelay } from './mocks';
import type { Bundle } from './types';

const RESOURCE = 'bundles' as const;

export async function getBundles(): Promise<readonly Bundle[]> {
  if (isLive(RESOURCE)) {
    return request<readonly Bundle[]>('/bundles', {
      revalidate: 600,
      tags: ['bundles'],
    });
  }
  await mockDelay();
  return mockBundles;
}

export async function getBundle(slug: string): Promise<Bundle | null> {
  const bundles = await getBundles();
  return bundles.find((b) => b.slug === slug) ?? null;
}
