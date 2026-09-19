import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BundleConfigurator } from '@/components/commerce/BundleConfigurator';
import { BundleAbout } from '@/components/sections/BundleAbout';
import { BundleCompare } from '@/components/sections/BundleCompare';
import { BundleFaq, BUNDLE_FAQS } from '@/components/sections/BundleFaq';
import { BundleTrust } from '@/components/sections/BundleTrust';
import { BreadcrumbItem, Breadcrumbs, Heading, Text, VStack } from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { getBundle, getBundles } from '@/lib/api/bundles';
import { getProducts } from '@/lib/api/products';
import type { ProductSummary } from '@/lib/api/types';
import { absoluteUrl, breadcrumbJsonLd, formatPrice, withSeoOverrides } from '@/lib/seo';

export const revalidate = 600;

export async function generateStaticParams() {
  const bundles = await getBundles();
  return bundles.map((bundle) => ({ slug: bundle.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getBundle(slug);
  if (!bundle) return {};

  return withSeoOverrides(
    {
      title: bundle.name,
      description: bundle.description,
      path: `/shop/bundles/${bundle.slug}`,
    },
    bundle.seo,
  );
}

export default async function BundlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // The compare table needs every bundle, not just this one.
  const [bundle, allBundles] = await Promise.all([getBundle(slug), getBundles()]);
  if (!bundle) notFound();

  // Eligible products per rule, resolved by COLLECTION — never by matching
  // words in a product name, which is how the legacy build sorted these and
  // why "Rasam Chutney Powder" would land in both buckets.
  const pools = await Promise.all(
    bundle.rules.map(async (rule) => {
      const result = await getProducts({ collection: rule.collectionSlug, pageSize: 48 });
      return [rule.collectionSlug, result.items.filter((p) => p.inStock)] as const;
    }),
  );
  const catalogue = Object.fromEntries(pools) as Record<string, readonly ProductSummary[]>;

  const everything = await getProducts({ pageSize: 100 });
  const included = bundle.includedSlugs
    .map((s) => everything.items.find((p) => p.slug === s))
    .filter((p): p is ProductSummary => Boolean(p));

  const path = `/shop/bundles/${bundle.slug}`;
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Bundles', path: '/shop/bundles' },
    { name: bundle.name, path },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(trail),
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: bundle.name,
            description: bundle.description,
            url: absoluteUrl(path),
            offers: {
              '@type': 'Offer',
              price: formatPrice(bundle.price.amount),
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
              url: absoluteUrl(path),
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: BUNDLE_FAQS.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
          },
        ]}
      />

      <div className="kf-container kf-shop">
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

          <VStack gap={1.5}>
            <p className="kf-eyebrow">Build your box</p>
            <Heading level={1}>{bundle.name}</Heading>
            <span className="kf-rule" aria-hidden="true" />
            <Text color="secondary" className="kf-measure">
              {bundle.description}
            </Text>
          </VStack>

          {/* The lower content is passed INTO the configurator so it lands in
              the scrolling column beside the sticky rail — the legacy layout,
              where the bundle card stays put while everything else moves. */}
          <BundleConfigurator
            bundle={bundle}
            catalogue={catalogue}
            included={included}
          >
            <div className="kf-bundle-lower">
              <VStack gap={10}>
                <BundleTrust />
                <BundleAbout bundle={bundle} />
                <BundleCompare bundles={allBundles} currentSlug={bundle.slug} />
                <BundleFaq />
              </VStack>
            </div>
          </BundleConfigurator>
        </VStack>
      </div>
    </>
  );
}
