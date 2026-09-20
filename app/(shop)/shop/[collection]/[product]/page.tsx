import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { ProductBuyBox } from '@/components/commerce/ProductBuyBox';
import { ProductGallery } from '@/components/commerce/ProductGallery';
import { ProductTrust } from '@/components/commerce/ProductTrust';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { ProductSections } from '@/components/commerce/ProductSections';
import { ChilliIcon } from '@/components/icons';
import { ReviewList } from '@/components/reviews/ReviewList';
import {
  BreadcrumbItem,
  Breadcrumbs,
  Divider,
  Grid,
  Heading,
  HStack,
  Text,
  VStack,
} from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { getCollection } from '@/lib/api/collections';
import { getAllProductSlugs, getProduct, getProducts } from '@/lib/api/products';
import { getReviews, summarise } from '@/lib/api/reviews';
import { breadcrumbJsonLd, productJsonLd, withSeoOverrides } from '@/lib/seo';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map(({ slug, collectionSlug }) => ({
    collection: collectionSlug,
    product: slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string; product: string }>;
}): Promise<Metadata> {
  const { collection, product: slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  return withSeoOverrides(
    {
      title: `Buy ${product.name} online`,
      description: product.shortDescription,
      path: `/shop/${collection}/${product.slug}`,
      image: product.image?.url,
    },
    product.seo,
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ collection: string; product: string }>;
}) {
  const { collection: collectionSlug, product: slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  // One canonical URL per product. Reaching it under the wrong collection is a
  // permanent redirect, never a 200 — duplicate URLs split ranking.
  if (product.primaryCollectionSlug !== collectionSlug) {
    redirect(`/shop/${product.primaryCollectionSlug}/${product.slug}`);
  }

  const [collection, related, reviews] = await Promise.all([
    getCollection(collectionSlug),
    getProducts({ collection: collectionSlug, pageSize: 5 }),
    getReviews(product.slug),
  ]);
  const reviewSummary = summarise(reviews);

  const path = `/shop/${collectionSlug}/${product.slug}`;
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    ...(collection ? [{ name: collection.name, path: `/shop/${collection.slug}` }] : []),
    { name: product.name, path },
  ];

  const others = related.items.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <>
      {/* Rating in the schema comes from APPROVED reviews, so what Google sees
          matches what the page shows. Never synthesised. */}
      <JsonLd
        data={[
          productJsonLd(
            {
              ...product,
              rating: reviewSummary.average,
              reviewCount: reviewSummary.total,
            },
            path,
          ),
          breadcrumbJsonLd(trail),
        ]}
      />

      <div className="kf-container kf-pdp">
        <VStack gap={6}>
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

          <div className="kf-pdp-grid">
            <ProductGallery
              images={product.images.length > 0 ? product.images : product.image ? [product.image] : []}
              productName={product.name}
            />

            <VStack gap={4}>
              <VStack gap={1.5}>
                {product.ribbon ? <p className="kf-eyebrow">{product.ribbon}</p> : null}
                <Heading level={1}>{product.name}</Heading>
                {product.rating !== null && product.reviewCount > 0 ? (
                  <HStack gap={1} vAlign="center">
                    <Text type="supporting" color="secondary">
                      {product.rating.toFixed(1)} ★ · {product.reviewCount} reviews
                    </Text>
                  </HStack>
                ) : null}
                {product.spiceLevel !== null && product.spiceLevel > 0 ? (
                  <span className="kf-spice" title={`Heat ${product.spiceLevel} of 5`}>
                    <span className="kf-sr-only">
                      Heat level {product.spiceLevel} of 5
                    </span>
                    {Array.from({ length: product.spiceLevel }, (_, i) => (
                      <ChilliIcon key={i} className="kf-chilli" aria-hidden="true" />
                    ))}
                  </span>
                ) : null}
                <Text className="kf-measure">{product.shortDescription}</Text>
              </VStack>

              <Divider />

              <ProductBuyBox product={product} />

              <ProductTrust />
            </VStack>
          </div>

          {product.sections.length > 0 ? (
            <VStack gap={3}>
              <Heading level={2}>About this blend</Heading>
              <ProductSections sections={product.sections} />
            </VStack>
          ) : null}

          <ReviewList reviews={reviews} summary={reviewSummary} />

          {others.length > 0 ? (
            <VStack gap={3}>
              <Heading level={2}>You may also like</Heading>
              <Grid gap={3} columns={{ minWidth: 200, repeat: 'fit' }}>
                <ProductGrid products={others} />
              </Grid>
            </VStack>
          ) : null}
        </VStack>
      </div>
    </>
  );
}
