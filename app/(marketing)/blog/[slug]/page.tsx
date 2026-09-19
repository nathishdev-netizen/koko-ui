import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { BreadcrumbItem, Breadcrumbs, Heading, HStack, Text, VStack } from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { getAllPostSlugs, getPost } from '@/lib/api/blog';
import { blogPostingJsonLd, breadcrumbJsonLd, withSeoOverrides } from '@/lib/seo';

export const revalidate = 900;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  // Per-post overrides win over the computed defaults: the content team
  // controls title, description, robots, canonical and keywords per post.
  // Blog rankings depend on this, so it must survive the CMS migration.
  return withSeoOverrides(
    {
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      image: post.coverImage?.url,
      type: 'article',
    },
    post.seo,
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path },
  ];

  return (
    <>
      <JsonLd
        data={[
          blogPostingJsonLd(post, path),
          breadcrumbJsonLd(trail),
          // Arbitrary JSON-LD the content team attached to this post.
          ...(post.seo.jsonLd ?? []),
        ]}
      />

      <div className="kf-container kf-article">
        <VStack gap={5}>
          <Breadcrumbs label="Breadcrumb" variant="supporting">
            {trail.map((crumb, i) => (
              <BreadcrumbItem
                key={crumb.path}
                href={i === trail.length - 1 ? undefined : crumb.path}
              >
                {crumb.name}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>

          <VStack gap={2}>
            <p className="kf-eyebrow">{post.tags[0] ?? 'Spice notes'}</p>
            <Heading level={1}>{post.title}</Heading>
            <span className="kf-rule" aria-hidden="true" />
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
                · {post.author.name} · {post.readingMinutes} min read
              </Text>
            </HStack>
          </VStack>

          {post.coverImage ? (
            <div className="kf-article-media">
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.alt || ''}
                fill
                sizes="(max-width: 860px) 100vw, 760px"
                className="kf-article-img"
                priority
              />
            </div>
          ) : null}

          {/* Sanitised HTML authored in the CMS. */}
          <div
            className="kf-prose"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </VStack>
      </div>
    </>
  );
}
