import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PostComments } from '@/components/blog/PostComments';
import { PostHero } from '@/components/blog/PostHero';
import { PostSidebar } from '@/components/blog/PostSidebar';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { tagLabel } from '@/components/blog/format';
import { BreadcrumbItem, Breadcrumbs } from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { brand } from '@/config/brand';
import content from '@/content/blog.json';
import { getAllPostSlugs, getPost, getRelatedPosts } from '@/lib/api/blog';
import { getComments } from '@/lib/api/comments';
import { getProducts } from '@/lib/api/products';
import { absoluteUrl, blogPostingJsonLd, breadcrumbJsonLd, withSeoOverrides } from '@/lib/seo';

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

  // Sidebar, discussion and related posts all resolve through lib/api, so they
  // swap to Frappe without touching this page.
  const [related, comments, blends] = await Promise.all([
    getRelatedPosts(post.slug, 3),
    getComments(post.slug),
    getProducts({ collection: 'signature-blends', pageSize: 6 }),
  ]);

  const path = `/blog/${post.slug}`;
  const url = absoluteUrl(path);
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

      <div className="kf-container kf-post-page">
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

        <PostHero post={post} />

        <div className="kf-post-layout">
          <article className="kf-post-main">
            {post.tags.length > 0 ? (
              <nav className="kf-post-tags" aria-label="Post topics">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`} className="kf-chip">
                    {tagLabel(tag)}
                  </Link>
                ))}
              </nav>
            ) : null}

            <ShareButtons title={post.title} url={url} />

            {/* Sanitised HTML authored in the CMS. */}
            <div className="kf-prose" dangerouslySetInnerHTML={{ __html: post.html }} />

            <PostComments postSlug={post.slug} comments={comments} copy={content.comments} />

            <footer className="kf-post-footer">
              <span className="kf-post-footer-rule" aria-hidden="true" />
              <ShareButtons title={post.title} url={url} />
              <Link href="/blog" className="kf-post-back">
                ← Back to all posts
              </Link>
            </footer>
          </article>

          <PostSidebar
            products={blends.items}
            instagramUrl={brand.socials?.instagram}
            copy={content.sidebar}
          />
        </div>
      </div>

      <RelatedPosts posts={related} title={content.related.title} />
    </>
  );
}
