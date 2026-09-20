import { isLive, request } from './client';
import { mockDelay } from './mocks';
import type { BlogPost, BlogPostSummary, Paginated } from './types';

import postsJson from './mocks/blog.json';

const RESOURCE = 'blog' as const;

const mockPosts = postsJson as unknown as readonly BlogPost[];

export async function getPosts(
  params: { page?: number; pageSize?: number; tag?: string } = {},
): Promise<Paginated<BlogPostSummary>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;

  if (isLive(RESOURCE)) {
    return request<Paginated<BlogPostSummary>>('/blog', {
      searchParams: { page, pageSize, tag: params.tag },
      // Real ISR. The legacy blog shipped `revalidate = 0` plus
      // `dynamic = "force-dynamic"` — dev config in production, which defeated
      // generateStaticParams and hit the backend on every request.
      revalidate: 900,
      tags: ['blog'],
    });
  }

  await mockDelay();
  const pool = params.tag
    ? mockPosts.filter((post) => post.tags.includes(params.tag!))
    : mockPosts;
  const sorted = [...pool].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize).map(toSummary);

  return {
    items,
    page,
    pageSize,
    total: sorted.length,
    hasMore: start + pageSize < sorted.length,
  };
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  if (isLive(RESOURCE)) {
    try {
      return await request<BlogPost>(`/blog/${encodeURIComponent(slug)}`, {
        revalidate: 900,
        tags: ['blog', `post:${slug}`],
      });
    } catch {
      return null;
    }
  }
  await mockDelay();
  return mockPosts.find((post) => post.slug === slug) ?? null;
}

export async function getAllPostSlugs(): Promise<readonly string[]> {
  if (isLive(RESOURCE)) {
    const all: string[] = [];
    let page = 1;
    for (;;) {
      const result = await getPosts({ page, pageSize: 100 });
      all.push(...result.items.map((p) => p.slug));
      if (!result.hasMore) break;
      page += 1;
    }
    return all;
  }
  return mockPosts.map((post) => post.slug);
}

/** Every tag in use, alphabetical — feeds the listing's filter pills. */
export async function getAllTags(): Promise<readonly string[]> {
  if (isLive(RESOURCE)) {
    return request<readonly string[]>('/blog/tags', { revalidate: 900, tags: ['blog'] });
  }
  return [...new Set(mockPosts.flatMap((post) => post.tags))].sort();
}

/**
 * Posts related to one, ranked by how many tags they share. Falls back to the
 * newest posts so the "You might also enjoy" strip is never empty on a
 * thinly-tagged post.
 */
export async function getRelatedPosts(
  slug: string,
  limit = 3,
): Promise<readonly BlogPostSummary[]> {
  if (isLive(RESOURCE)) {
    return request<readonly BlogPostSummary[]>(
      `/blog/${encodeURIComponent(slug)}/related`,
      { searchParams: { limit }, revalidate: 900, tags: ['blog', `post:${slug}`] },
    );
  }
  await mockDelay();
  const current = mockPosts.find((post) => post.slug === slug);
  if (!current) return [];
  const mine = new Set(current.tags);
  return [...mockPosts]
    .filter((post) => post.slug !== slug)
    .map((post) => ({ post, shared: post.tags.filter((t) => mine.has(t)).length }))
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        Date.parse(b.post.publishedAt) - Date.parse(a.post.publishedAt),
    )
    .slice(0, limit)
    .map(({ post }) => toSummary(post));
}

function toSummary(post: BlogPost): BlogPostSummary {
  const { html, seo, ...summary } = post;
  void html;
  void seo;
  return summary;
}
