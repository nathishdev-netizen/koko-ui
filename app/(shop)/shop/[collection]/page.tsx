import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProductGrid } from '@/components/commerce/ProductGrid';
import { Breadcrumbs, BreadcrumbItem, Heading, Text, VStack } from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { getCollection, getCollections } from '@/lib/api/collections';
import { getProducts } from '@/lib/api/products';
import { absoluteUrl, breadcrumbJsonLd, withSeoOverrides } from '@/lib/seo';

// Set explicitly: the legacy category pages had no revalidate at all and could
// serve a stale product list indefinitely.
export const revalidate = 300;

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ collection: collection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return {};

  return withSeoOverrides(
    {
      title: collection.name,
      description: collection.description,
      path: `/shop/${collection.slug}`,
    },
    collection.seo,
  );
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  const result = await getProducts({ collection: slug, pageSize: 48 });

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: collection.name, path: `/shop/${collection.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(trail),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: collection.name,
            description: collection.description,
            url: absoluteUrl(`/shop/${collection.slug}`),
          },
        ]}
      />

      <div className="kf-container kf-shop">
        <VStack gap={5}>
          <Breadcrumbs label="Breadcrumb">
            {trail.map((crumb, i) => (
              <BreadcrumbItem
                key={crumb.path}
                // The last item is the current page: no href, and Breadcrumbs
                // marks it aria-current automatically.
                href={i === trail.length - 1 ? undefined : crumb.path}
              >
                {crumb.name}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>

          <VStack gap={1.5}>
            <p className="kf-eyebrow">Collection</p>
            <Heading level={1}>{collection.name}</Heading>
            <span className="kf-rule" aria-hidden="true" />
            <Text color="secondary" className="kf-measure">
              {collection.description}
            </Text>
          </VStack>

          <ProductGrid products={result.items} />
        </VStack>
      </div>
    </>
  );
}
