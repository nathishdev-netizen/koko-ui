import type { Metadata } from 'next';

import { BlogGrid } from '@/components/blog/BlogGrid';
import { BlogListingHero } from '@/components/blog/BlogListingHero';
import { JsonLd } from '@/components/ui/JsonLd';
import content from '@/content/blog.json';
import { getAllTags, getPosts } from '@/lib/api/blog';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

// Real ISR. The legacy blog shipped revalidate = 0 + force-dynamic.
//
// This page reads NO searchParams on purpose: doing so opts the route out of
// prerendering, and the listing would be server-rendered on every hit instead
// of served from the CDN. Tag filtering lives at /blog/tag/[tag], which is
// itself static — and gives every tag a canonical URL for search.
export const revalidate = 900;

export const metadata: Metadata = buildMetadata({
  title: 'Spice Blog — Recipes, Tips & Masala Stories',
  description:
    'Discover authentic Karnataka recipes, spice science, kitchen tips, and behind-the-scenes stories from the KokoFresh kitchen.',
  path: '/blog',
});

export default async function BlogPage() {
  const [tags, posts] = await Promise.all([
    getAllTags(),
    // Everything at once: "Load more" reveals client-side, as legacy did.
    getPosts({ pageSize: 60 }),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />

      <BlogListingHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        subtitle={content.hero.subtitle}
      />

      <div className="kf-container kf-blog-page">
        <BlogGrid posts={posts.items} tags={tags} activeTag={null} empty={content.empty} />
      </div>
    </>
  );
}
