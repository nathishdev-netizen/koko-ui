import Image from 'next/image';

import { ChilliIcon } from '@/components/icons';
import type { BlogPost } from '@/lib/api/types';

import { formatPostDate, tagLabel } from './format';

/**
 * Boxed post hero — the cover photograph under a dark scrim, with the tag,
 * title and byline sitting on it. Matches the legacy post page's opening.
 */
export function PostHero({ post }: { post: BlogPost }) {
  return (
    <header className="kf-post-hero">
      {post.coverImage ? (
        <div className="kf-post-hero-media">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || ''}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="kf-post-hero-img"
          />
        </div>
      ) : null}
      <div className="kf-post-hero-scrim" aria-hidden="true" />

      <div className="kf-post-hero-content">
        {post.tags[0] ? <span className="kf-post-hero-tag">{tagLabel(post.tags[0])}</span> : null}
        <h1 className="kf-post-hero-title">{post.title}</h1>
        <div className="kf-blog-meta kf-blog-meta--on-media">
          <span className="kf-blog-author">
            <span className="kf-blog-avatar" aria-hidden="true">
              <ChilliIcon />
            </span>
            {post.author.name}
          </span>
          <span className="kf-blog-dot" aria-hidden="true">
            ·
          </span>
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <span className="kf-blog-dot" aria-hidden="true">
            ·
          </span>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </header>
  );
}
