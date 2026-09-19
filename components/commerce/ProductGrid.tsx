import { ProductCard } from '@/components/commerce/ProductCard';
import { Heading, Text, VStack } from '@/components/ui';
import type { ProductSummary } from '@/lib/api/types';

/**
 * Product grid with an explicit empty state.
 *
 * Server component — filtering happens on the server via searchParams, so the
 * listing is crawlable and shareable by URL rather than living in client state.
 */
export function ProductGrid({ products }: { products: readonly ProductSummary[] }) {
  if (products.length === 0) {
    return (
      <VStack gap={2} padding={8} hAlign="center" className="kf-center-text">
        <Heading level={2}>Nothing matches those filters</Heading>
        <Text color="secondary">Try widening your search or clearing a filter.</Text>
      </VStack>
    );
  }

  // Astryx's Grid uses `auto-fit`, which COLLAPSES empty tracks and stretches
  // the surviving cards across the full row: a one-result filter rendered a
  // single 1200px-wide, 1405px-tall card. The grid below keeps a fixed column
  // size, so a card looks identical whether the filter returns 1 or 22.
  return (
    <div className="kf-product-grid">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
