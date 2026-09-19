import { isLive, request } from './client';
import { mockCollections, mockDelay } from './mocks';
import type { Collection } from './types';

const RESOURCE = 'collections' as const;

export async function getCollections(): Promise<readonly Collection[]> {
  if (isLive(RESOURCE)) {
    return request<readonly Collection[]>('/collections', {
      revalidate: 3600,
      tags: ['collections'],
    });
  }
  await mockDelay();
  return mockCollections;
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const collections = await getCollections();
  return collections.find((c) => c.slug === slug) ?? null;
}
