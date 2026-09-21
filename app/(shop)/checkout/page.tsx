import type { Metadata } from 'next';

import { CheckoutForm } from '@/components/commerce/CheckoutForm';
import { AnimatedRule, Heading, VStack } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Checkout',
    description: 'Complete your KokoFresh order.',
    path: '/checkout',
  }),
  robots: 'noindex, nofollow',
};

export default function CheckoutPage() {
  return (
    <div className="kf-container kf-shop">
      <VStack gap={5}>
        <VStack gap={1.5}>
          <p className="kf-eyebrow">Almost there</p>
          <Heading level={1}>Checkout</Heading>
          <AnimatedRule />
        </VStack>
        <CheckoutForm />
      </VStack>
    </div>
  );
}
