import type { Metadata } from 'next';
import Link from 'next/link';

import { ProductGrid } from '@/components/commerce/ProductGrid';
import { ShopFilters, type SortKey } from '@/components/commerce/ShopFilters';
import { AnimatedRule, HStack, Heading, Text, VStack } from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { getCollections } from '@/lib/api/collections';
import { getProducts } from '@/lib/api/products';
import type { ProductSort } from '@/lib/api/types';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { PRICE_BANDS } from '@/lib/shop/priceBands';

export const revalidate = 300;

const PAGE_SIZE = 24;

export const metadata: Metadata = buildMetadata({
  title: 'Shop all Karnataka spice blends',
  description:
    'Every KokoFresh blend — signature masalas, heritage chutney powders, single-origin spices and everyday superfoods. Stone-ground fresh, made only after you order.',
  path: '/shop',
});

const SORT_KEYS: readonly SortKey[] = ['featured', 'price-asc', 'price-desc', 'name'];

function parseSort(value: string | undefined): ProductSort {
  return SORT_KEYS.includes(value as SortKey) ? (value as ProductSort) : 'featured';
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const single = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const collectionParam = single('collection') ?? null;
  const sort = parseSort(single('sort'));
  const page = Math.max(1, Number(single('page') ?? 1) || 1);
  const query = single('q') ?? '';

  // An unrecognised band is ignored rather than returning an empty grid.
  const bandKey = single('price') ?? null;
  const band = PRICE_BANDS.find((b) => b.key === bandKey) ?? null;

  const [collections, result] = await Promise.all([
    getCollections(),
    // No category default: /shop shows the whole catalogue. The legacy shop
    // silently defaulted to "Best Sellers" and hid most products.
    getProducts({
      page,
      pageSize: PAGE_SIZE,
      collection: collectionParam ?? undefined,
      sort,
      q: query || undefined,
      minPrice: band?.min,
      maxPrice: band?.max,
    }),
  ]);

  const browsable = collections.filter((c) => c.slug !== 'coming-soon');
  const hasFilters =
    collectionParam !== null || query !== '' || band !== null || sort !== 'featured';
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
        ])}
      />

      <div className="kf-container kf-shop">
        <VStack gap={5}>
          <div className="kf-shop-head">
            <VStack gap={1.5}>
              <p className="kf-eyebrow">All products</p>
              <Heading level={1}>Shop</Heading>
              <AnimatedRule />
              <Text color="secondary" className="kf-measure">
                Every blend is stone-ground in small batches and packed only after you
                order, so it reaches you at its most fragrant.
              </Text>
            </VStack>

            <Link href="/shop/bundles" className="kf-shop-bundles">
              <GiftIcon />
              Shop Bundles
            </Link>
          </div>

          <ShopFilters
            collections={browsable}
            activeCollection={collectionParam}
            activeSort={sort}
            activeQuery={query}
            activePriceBand={band?.key ?? null}
            total={result.total}
          />

          {/* Keyed on the active filters so React remounts the grid when they
              change — the cards then replay their entry animation instead of
              the new results appearing instantly in place. */}
          <ProductGrid
            key={`${collectionParam ?? 'all'}|${query}|${bandKey ?? 'any'}|${sort}|${page}`}
            products={result.items}
          />

          {/* Legacy showed this only when a filter is narrowing the grid, and
              it CLEARS the filters rather than navigating — the customer has
              filtered themselves into a corner and wants the whole catalogue
              back. Hidden on an unfiltered /shop, where it would do nothing. */}
          {hasFilters && result.items.length > 0 ? (
            <HStack hAlign="center">
              <Link href="/shop" className="kf-view-all">
                View All Products
                <span className="kf-view-all-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </HStack>
          ) : null}

          {totalPages > 1 ? (
            <HStack gap={2} hAlign="center" vAlign="center" as="nav" aria-label="Pagination">
              {page > 1 ? (
                <Link href={pageHref(params, page - 1)} className="kf-page-link">
                  ← Previous
                </Link>
              ) : null}
              <Text type="supporting" color="secondary">
                Page {page} of {totalPages}
              </Text>
              {result.hasMore ? (
                <Link href={pageHref(params, page + 1)} className="kf-page-link">
                  Next →
                </Link>
              ) : null}
            </HStack>
          ) : null}

        </VStack>
      </div>

      {/* Cross-sell strip — the live site's bundle prompt at the foot of the
          grid, for a customer who has browsed and not yet committed. */}
      <aside className="kf-bundle-strip">
        <VStack gap={1}>
          <p className="kf-eyebrow">Better value</p>
          <Heading level={2}>Save More with Bundles</Heading>
          <Text color="secondary" className="kf-measure">
            Curated combos of our bestsellers — crafted for every kitchen. Get
            more for less.
          </Text>
        </VStack>
        <Link href="/shop/bundles" className="kf-bundle-strip-cta">
          <GiftIcon />
          Explore Bundles
          <span aria-hidden="true">→</span>
        </Link>
      </aside>
    </>
  );
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 20 20" className="kf-gift-icon" aria-hidden="true">
      <path
        d="M17 8v9a1 1 0 01-1 1H4a1 1 0 01-1-1V8h14zM10 8v10M2.5 5.5h15V8h-15V5.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 5.5S8.8 2.5 7 2.5a1.75 1.75 0 100 3.5h3zm0 0s1.2-3 3-3a1.75 1.75 0 110 3.5h-3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Preserves the active filters when paging. */
function pageHref(
  params: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'page' || value === undefined) continue;
    next.set(key, Array.isArray(value) ? (value[0] ?? '') : value);
  }
  if (page > 1) next.set('page', String(page));
  const query = next.toString();
  return query ? `/shop?${query}` : '/shop';
}
