import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogGrid } from '@/components/blog/BlogGrid';
import { BlogListingHero } from '@/components/blog/BlogListingHero';
import { tagLabel } from '@/components/blog/format';
import { JsonLd } from '@/components/ui/JsonLd';
import content from '@/content/blog.json';
import { getAllTags, getPosts } from '@/lib/api/blog';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

export const revalidate = 900;

/** One static page per tag — prerendered, and a canonical URL for search. */
export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const label = tagLabel(tag);
  return buildMetadata({
    title: `${label} — Spice Blog`,
    description: `Recipes, tips and stories about ${label.toLowerCase()} from the KokoFresh kitchen.`,
    path: `/blog/tag/${tag}`,
  });
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const tags = await getAllTags();
  // An unknown tag is a 404, not an empty listing.
  if (!tags.includes(tag)) notFound();

  const posts = await getPosts({ pageSize: 60, tag });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: tagLabel(tag), path: `/blog/tag/${tag}` },
        ])}
      />

      <BlogListingHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        subtitle={content.hero.subtitle}
      />

      <div className="kf-container kf-blog-page">
        <BlogGrid posts={posts.items} tags={tags} activeTag={tag} empty={content.empty} />
      </div>
    </>
  );
}
