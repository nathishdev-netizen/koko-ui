/**
 * Shared SEO helpers.
 *
 * Every route builds metadata through buildMetadata() so canonicals, OG and
 * robots stay consistent. JSON-LD builders return plain objects; render them
 * with <JsonLd /> — the legacy site computed LocalBusiness schema and never
 * rendered it, so the schema was simply absent from the site.
 */
import type { Metadata } from 'next';

import { brand } from '@/config/brand';
import type { Product, SeoFields } from '@/lib/api/types';

export const siteUrl = brand.url;

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export function formatPrice(amountInPaise: number): string {
  return (amountInPaise / 100).toFixed(2);
}

type BuildMetadataInput = {
  readonly title: string;
  readonly description: string;
  /** Site-relative path, e.g. "/shop/signature-blends". Becomes the canonical. */
  readonly path: string;
  readonly image?: string;
  readonly keywords?: readonly string[];
  readonly robots?: string;
  readonly type?: 'website' | 'article';
};

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.image ?? brand.ogImage;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords ? [...input.keywords] : undefined,
    alternates: { canonical: url },
    robots: input.robots,
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: brand.name,
      locale: brand.locale.replace('-', '_'),
      type: input.type ?? 'website',
      images: [{ url: absoluteUrl(image) }],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [absoluteUrl(image)],
    },
  };
}

/** Merges content-team SEO overrides over computed defaults. */
export function withSeoOverrides(base: BuildMetadataInput, seo: SeoFields): Metadata {
  return buildMetadata({
    ...base,
    title: seo.title ?? base.title,
    description: seo.description ?? base.description,
    path: seo.canonical ?? base.path,
    image: seo.ogImage ?? base.image,
    keywords: seo.keywords ?? base.keywords,
    robots: seo.robots ?? base.robots,
  });
}

// --- JSON-LD builders ------------------------------------------------------

export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    legalName: brand.legalName,
    url: siteUrl,
    logo: absoluteUrl(brand.logo.src),
    description: brand.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: brand.legal.address.locality,
      addressRegion: brand.legal.address.region,
      addressCountry: brand.legal.address.country,
    },
    sameAs: Object.values(brand.socials).filter(Boolean),
  };
}

export function breadcrumbJsonLd(
  trail: readonly { name: string; path: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Article schema for a blog post. */
export function blogPostingJsonLd(post: {
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  author: { name: string };
  coverImage: { url: string } | null;
}, path: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: post.author.name },
    publisher: {
      '@type': 'Organization',
      name: brand.name,
      logo: { '@type': 'ImageObject', url: absoluteUrl(brand.logo.src) },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
    ...(post.coverImage ? { image: [post.coverImage.url] } : {}),
  };
}

export function productJsonLd(product: Product, path: string): Record<string, unknown> {
  const prices = product.variants.map((v) => v.price.amount);
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    sku: product.variants[0]?.sku,
    image: product.images.map((i) => i.url),
    brand: { '@type': 'Brand', name: brand.name },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: formatPrice(Math.min(...prices)),
      highPrice: formatPrice(Math.max(...prices)),
      offerCount: product.variants.length,
      offers: product.variants.map((variant) => ({
        '@type': 'Offer',
        sku: variant.sku,
        name: `${product.name} — ${variant.label}`,
        price: formatPrice(variant.price.amount),
        priceCurrency: 'INR',
        priceValidUntil: validUntil.toISOString().slice(0, 10),
        itemCondition: 'https://schema.org/NewCondition',
        availability: variant.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: absoluteUrl(path),
        seller: { '@type': 'Organization', name: brand.name },
      })),
    },
    // Ratings are emitted only when real. Never synthesise review data.
    ...(product.rating !== null && product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}
