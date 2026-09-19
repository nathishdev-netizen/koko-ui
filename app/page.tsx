import type { Metadata } from 'next';

import { BestSellers } from '@/components/sections/BestSellers';
import { BrandStory } from '@/components/sections/BrandStory';
import { BundleGrid } from '@/components/sections/BundleGrid';
import { CollectionGrid } from '@/components/sections/CollectionGrid';
import { Hero, type HeroSlide } from '@/components/sections/Hero';
import { SocialProof } from '@/components/sections/SocialProof';
import { TrustBadges } from '@/components/sections/TrustBadges';
import { ValueProps } from '@/components/sections/ValueProps';
import { JsonLd } from '@/components/ui/JsonLd';
import content from '@/content/home.json';
import heroMedia from '@/content/hero-media.json';
import { getBundles } from '@/lib/api/bundles';
import { getCollections } from '@/lib/api/collections';
import { getProducts } from '@/lib/api/products';
import { brand } from '@/config/brand';
import { buildMetadata, siteUrl } from '@/lib/seo';

// Rebuilt periodically; on-demand revalidation lands with the Frappe webhooks.
export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: `${brand.name} — ${brand.tagline}`,
  description: brand.description,
  path: '/',
});

export default async function HomePage() {
  // All three resolve through lib/api, so they swap to Frappe without touching
  // this page.
  const [bundles, collections, bestSellers] = await Promise.all([
    getBundles(),
    getCollections(),
    getProducts({ collection: 'best-sellers', pageSize: 10 }),
  ]);

  // Best-sellers is a small collection today; top up from the full catalogue so
  // the rail never looks half-empty.
  const featured =
    bestSellers.items.length >= 4
      ? bestSellers.items
      : (await getProducts({ pageSize: 10 })).items;

  const slides: readonly HeroSlide[] = content.hero.slides.map((slide, i) => ({
    ...slide,
    image: heroMedia.slides[i]?.image ?? heroMedia.slides[0]!.image,
    alt: heroMedia.slides[i]?.alt ?? '',
  }));

  // Collections shown as browsable categories — "coming soon" is not one.
  const browsable = collections.filter((c) => c.slug !== 'coming-soon');

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/shop?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd data={websiteJsonLd} />

      <Hero eyebrow={content.hero.eyebrow} slides={slides} cta={content.hero.cta} />
      <TrustBadges items={content.trustBadges} />
      <BundleGrid bundles={bundles} />
      <BestSellers
        eyebrow={content.bestSellers.eyebrow}
        heading={content.bestSellers.heading}
        products={featured}
      />
      <BrandStory
        paragraphs={content.brandQuote.paragraphs}
        signature={content.brandQuote.signature}
        backdrop={content.brandQuote.backdrop}
      />
      <ValueProps
        heading={content.usp.heading}
        subheading={content.usp.subheading}
        items={content.usp.items}
      />
      <CollectionGrid
        heading={content.collections.heading}
        subheading={content.collections.subheading}
        cta={content.collections.cta}
        collections={browsable}
      />
      <SocialProof items={content.socialProof} />
    </>
  );
}
