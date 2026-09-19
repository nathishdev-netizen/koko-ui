import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Grid, Heading, HStack, Text, VStack } from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { getPosts } from '@/lib/api/blog';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

// Real ISR. The legacy blog shipped revalidate = 0 + force-dynamic.
export const revalidate = 900;

export const metadata: Metadata = buildMetadata({
  title: 'Spice notes & kitchen stories',
  description:
    'How Karnataka blends are made, how to store them, and how to cook with them — from the KokoFresh kitchen.',
  path: '/blog',
});

export default async function BlogPage() {
  const posts = await getPosts({ pageSize: 24 });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />

      <div className="kf-container kf-shop">
        <VStack gap={5}>
          <VStack gap={1.5}>
            <p className="kf-eyebrow">From the kitchen</p>
            <Heading level={1}>Spice notes</Heading>
            <span className="kf-rule" aria-hidden="true" />
            <Text color="secondary" className="kf-measure">
              How these blends are made, how to keep them fragrant, and what to cook
              with them.
            </Text>
          </VStack>

          {posts.items.length === 0 ? (
            <Text color="secondary">No posts yet.</Text>
          ) : (
            <Grid gap={4} columns={{ minWidth: 280, repeat: 'fit' }}>
              {posts.items.map((post) => (
                <article key={post.slug} className="kf-post-card">
                  <Link href={`/blog/${post.slug}`} className="kf-post-link">
                    <VStack gap={2}>
                      {post.coverImage ? (
                        <div className="kf-post-media">
                          <Image
                            src={post.coverImage.url}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, 380px"
                            className="kf-post-img"
                          />
                        </div>
                      ) : null}

                      <HStack gap={1.5} vAlign="center" wrap="wrap">
                        <Text type="supporting" color="secondary">
                          <time dateTime={post.publishedAt}>
                            {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </time>
                        </Text>
                        <Text type="supporting" color="secondary">
                          · {post.readingMinutes} min read
                        </Text>
                      </HStack>

                      <Heading level={2}>{post.title}</Heading>
                      <Text color="secondary">{post.excerpt}</Text>
                    </VStack>
                  </Link>
                </article>
              ))}
            </Grid>
          )}
        </VStack>
      </div>
    </>
  );
}
