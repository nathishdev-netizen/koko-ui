import Image from 'next/image';
import Link from 'next/link';

import { ChilliIcon } from '@/components/icons';
import type { BlogPostSummary } from '@/lib/api/types';

import { formatPostDate, tagLabel } from './format';

/**
 * A post card. The first card on an unfiltered listing is `featured`: it spans
 * the grid and lays out image-beside-text, the way the legacy blog gave its
 * newest post the top of the page.
 */
export function BlogCard({
  post,
  isFeatured = false,
}: {
  post: BlogPostSummary;
  isFeatured?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="kf-blog-card"
      data-featured={isFeatured || undefined}
      aria-label={`Read: ${post.title}`}
    >
      <div className="kf-blog-card-media">
        {post.coverImage ? (
          <Image
            src={post.coverImage.url}
            alt=""
            fill
            sizes={
              isFeatured
                ? '(max-width: 900px) 100vw, 60vw'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
            className="kf-blog-card-img"
            priority={isFeatured}
          />
        ) : null}
        {post.tags[0] ? (
          <span className="kf-blog-card-tag">{tagLabel(post.tags[0])}</span>
        ) : null}
      </div>

      <div className="kf-blog-card-body">
        <h2 className="kf-blog-card-title">{post.title}</h2>
        <p className="kf-blog-card-excerpt">{post.excerpt}</p>

        <div className="kf-blog-meta">
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
    </Link>
  );
}
