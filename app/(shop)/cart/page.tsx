import type { Metadata } from 'next';

import { CartView } from '@/components/commerce/CartView';
import { AnimatedRule, Heading, VStack } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Your cart',
    description: 'Review your KokoFresh order.',
    path: '/cart',
  }),
  robots: 'noindex, follow',
};

export default function CartPage() {
  return (
    <div className="kf-container kf-shop">
      <VStack gap={5}>
        <VStack gap={1.5}>
          <p className="kf-eyebrow">Your order</p>
          <Heading level={1}>Cart</Heading>
          <AnimatedRule />
        </VStack>
        <CartView />
      </VStack>
    </div>
  );
}
