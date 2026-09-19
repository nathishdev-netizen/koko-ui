import type { Metadata } from 'next';

import { ProductGrid } from '@/components/commerce/ProductGrid';
import { Heading, Text, VStack } from '@/components/ui';
import { getProducts } from '@/lib/api/products';
import { getWishlist, resolveWishlist } from '@/lib/api/wishlist';

export const metadata: Metadata = { title: 'Wishlist', robots: 'noindex, nofollow' };

export default async function WishlistPage() {
  // Server-persisted, so this list follows the customer across devices — the
  // legacy wishlist lived only in localStorage.
  const [slugs, catalogue] = await Promise.all([
    getWishlist(),
    getProducts({ pageSize: 100 }),
  ]);
  const products = resolveWishlist(slugs, catalogue.items);

  return (
    <VStack gap={3}>
      <Heading level={2}>Wishlist</Heading>
      {products.length === 0 ? (
        <Text color="secondary">
          Nothing saved yet. Tap the heart on any product to keep it here.
        </Text>
      ) : (
        <ProductGrid products={products} />
      )}
    </VStack>
  );
}
