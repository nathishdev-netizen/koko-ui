'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { BlogPostSummary } from '@/lib/api/types';

import { BlogCard } from './BlogCard';
import { tagLabel } from './format';

const INITIAL = 9;
const STEP = 6;

/**
 * Tag pills + card grid + "Load more".
 *
 * The active tag is a route (`/blog/tag/[tag]`), so every filtered view is a
 * real, linkable, STATIC page — the legacy kept it in client state, which made
 * filtered views unshareable and invisible to search. A `?tag=` query would
 * have been simpler but reading searchParams makes the route dynamic and costs
 * the listing its CDN prerender. "Load more" stays
 * client-side over the already-fetched list, exactly as legacy did (9, then
 * +6), so revealing more posts costs no request.
 */
export function BlogGrid({
  posts,
  tags,
  activeTag,
  empty,
}: {
  posts: readonly BlogPostSummary[];
  tags: readonly string[];
  activeTag: string | null;
  empty: { title: string; body: string };
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL);
  const visible = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <div className="kf-blog-listing">
      <nav className="kf-blog-tags" aria-label="Filter by topic">
        <Link
          href="/blog"
          className="kf-chip"
          data-active={activeTag === null || undefined}
          aria-current={activeTag === null ? 'page' : undefined}
        >
          All
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog/tag/${encodeURIComponent(tag)}`}
            className="kf-chip"
            data-active={activeTag === tag || undefined}
            aria-current={activeTag === tag ? 'page' : undefined}
          >
            {tagLabel(tag)}
          </Link>
        ))}
      </nav>

      {visible.length === 0 ? (
        <div className="kf-blog-empty">
          <span className="kf-blog-empty-icon" aria-hidden="true">
            🌶️
          </span>
          <p className="kf-blog-empty-title">{empty.title}</p>
          <p className="kf-blog-empty-body">{empty.body}</p>
        </div>
      ) : (
        <div className="kf-blog-grid">
          {visible.map((post, i) => (
            <BlogCard
              key={post.slug}
              post={post}
              isFeatured={i === 0 && activeTag === null}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="kf-blog-more">
          <button
            type="button"
            className="kf-blog-more-btn"
            onClick={() => setVisibleCount((c) => c + STEP)}
          >
            Load More Posts
          </button>
        </div>
      ) : null}
    </div>
  );
}
