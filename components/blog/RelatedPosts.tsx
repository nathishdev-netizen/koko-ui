import Image from 'next/image';
import Link from 'next/link';

import { Heading } from '@/components/ui';
import type { BlogPostSummary } from '@/lib/api/types';

import { tagLabel } from './format';

/** "You Might Also Enjoy" — three related posts on a tinted band. */
export function RelatedPosts({
  posts,
  title,
}: {
  posts: readonly BlogPostSummary[];
  title: string;
}) {
  if (posts.length === 0) return null;
  return (
    <section className="kf-related" aria-labelledby="related-posts">
      <div className="kf-container">
        <Heading level={2} id="related-posts" className="kf-related-title">
          {title}
        </Heading>
        <div className="kf-related-grid">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="kf-related-card"
              aria-label={`Read: ${post.title}`}
            >
              <div className="kf-related-media">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage.url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="kf-related-img"
                  />
                ) : null}
              </div>
              <div className="kf-related-body">
                {post.tags[0] ? (
                  <span className="kf-related-tag">{tagLabel(post.tags[0])}</span>
                ) : null}
                <h3 className="kf-related-heading">{post.title}</h3>
                <p className="kf-related-read">{post.readingMinutes} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
