import { ProductCard } from '@/components/commerce/ProductCard';
import { Button, Carousel, Heading, HStack, VStack } from '@/components/ui';
import type { ProductSummary } from '@/lib/api/types';

/**
 * Best sellers. Astryx Carousel handles snap, edge-fade and keyboard scrolling,
 * so this stays a server component — no auto-advancing rotation to babysit.
 */
export function BestSellers({
  eyebrow,
  heading,
  products,
}: {
  eyebrow: string;
  heading: string;
  products: readonly ProductSummary[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="kf-section" aria-labelledby="bestsellers-heading">
      <div className="kf-container">
        <VStack gap={4}>
          <HStack gap={3} hAlign="between" vAlign="end" wrap="wrap">
            <VStack gap={1}>
              <p className="kf-eyebrow">{eyebrow}</p>
              <Heading level={2} id="bestsellers-heading">
                {heading}
              </Heading>
            </VStack>
            <Button label="Shop all" href="/shop" variant="secondary" />
          </HStack>

          <Carousel gap={3} hasSnap aria-label={heading}>
            {products.map((product) => (
              <div key={product.slug} className="kf-carousel-item">
                <ProductCard product={product} />
              </div>
            ))}
          </Carousel>
        </VStack>
      </div>
    </section>
  );
}
