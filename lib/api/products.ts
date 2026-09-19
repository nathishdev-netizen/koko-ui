import { isLive, request } from './client';
import { mockDelay, mockProducts } from './mocks';
import type {
  Paginated,
  Product,
  ProductListParams,
  ProductSort,
  ProductSummary,
} from './types';

const RESOURCE = 'products' as const;

/** Default page size. There is deliberately no hard item cap — the legacy
 *  `limit(100)` silently broke the catalogue past 100 SKUs. */
const DEFAULT_PAGE_SIZE = 24;

function toSummary(product: Product): ProductSummary {
  const {
    id, slug, name, shortDescription, image, priceFrom, compareAtPriceFrom,
    inStock, ribbon, rating, reviewCount, spiceLevel, collectionSlugs,
    primaryCollectionSlug,
  } = product;
  return {
    id, slug, name, shortDescription, image, priceFrom, compareAtPriceFrom,
    inStock, ribbon, rating, reviewCount, spiceLevel, collectionSlugs,
    primaryCollectionSlug,
    variantOptions: product.variants.map((v) => ({
      id: v.id,
      label: v.label,
      weightGrams: v.weightGrams,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      inStock: v.inStock,
    })),
  };
}

export async function getProducts(
  params: ProductListParams = {},
): Promise<Paginated<ProductSummary>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  if (isLive(RESOURCE)) {
    return request<Paginated<ProductSummary>>('/products', {
      searchParams: {
        page,
        pageSize,
        collection: params.collection,
        sort: params.sort,
        q: params.q,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
      },
      revalidate: 300,
      tags: ['products', params.collection ? `collection:${params.collection}` : 'products:all'],
    });
  }

  await mockDelay();

  let filtered = params.collection
    ? mockProducts.filter((p) => p.collectionSlugs.includes(params.collection!))
    : [...mockProducts];

  if (params.q) {
    const needle = params.q.trim().toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(needle));
  }

  // Price bounds compare against the cheapest variant — the figure the card
  // shows — so a product appears in the band the customer actually sees.
  if (params.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.priceFrom.amount >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.priceFrom.amount <= params.maxPrice!);
  }

  filtered = sortProducts(filtered, params.sort ?? 'featured');

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(toSummary);

  return {
    items,
    page,
    pageSize,
    total: filtered.length,
    hasMore: start + pageSize < filtered.length,
  };
}

/**
 * Mock-side sorting. The real backend sorts server-side; this mirrors it so
 * pages behave identically before and after the swap.
 *
 * Out-of-stock items always sink to the bottom regardless of sort — a
 * "coming soon" product at the top of a price sort is not a useful result.
 */
function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const byStock = (a: Product, b: Product) => Number(b.inStock) - Number(a.inStock);

  const comparators: Record<ProductSort, (a: Product, b: Product) => number> = {
    featured: (a, b) => Number(Boolean(b.ribbon)) - Number(Boolean(a.ribbon)),
    'price-asc': (a, b) => a.priceFrom.amount - b.priceFrom.amount,
    'price-desc': (a, b) => b.priceFrom.amount - a.priceFrom.amount,
    name: (a, b) => a.name.localeCompare(b.name),
  };

  return products.sort((a, b) => byStock(a, b) || comparators[sort](a, b));
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (isLive(RESOURCE)) {
    try {
      return await request<Product>(`/products/${encodeURIComponent(slug)}`, {
        revalidate: 300,
        tags: ['products', `product:${slug}`],
      });
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 404) return null;
      throw error;
    }
  }

  await mockDelay();
  return mockProducts.find((p) => p.slug === slug) ?? null;
}

/** Every product slug + its canonical collection, for generateStaticParams and sitemap. */
export async function getAllProductSlugs(): Promise<
  readonly { slug: string; collectionSlug: string }[]
> {
  if (isLive(RESOURCE)) {
    const all: { slug: string; collectionSlug: string }[] = [];
    let page = 1;
    // Page through rather than assuming a ceiling.
    for (;;) {
      const result = await getProducts({ page, pageSize: 100 });
      all.push(
        ...result.items.map((p) => ({ slug: p.slug, collectionSlug: p.primaryCollectionSlug })),
      );
      if (!result.hasMore) break;
      page += 1;
    }
    return all;
  }

  await mockDelay();
  return mockProducts.map((p) => ({ slug: p.slug, collectionSlug: p.primaryCollectionSlug }));
}
