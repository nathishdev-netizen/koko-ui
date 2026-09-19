import type { Metadata } from 'next';

import { Button, Heading, Text, VStack } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Order confirmed',
    description: 'Thank you for your order.',
    path: '/checkout/confirmed',
  }),
  robots: 'noindex, nofollow',
};

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.order;
  const orderId = Array.isArray(raw) ? raw[0] : raw;

  return (
    <div className="kf-container kf-shop">
      <VStack gap={4} hAlign="center" className="kf-center-text" padding={8}>
        <p className="kf-eyebrow">Thank you</p>
        <Heading level={1}>Your order is confirmed</Heading>
        <span className="kf-rule" aria-hidden="true" />
        {orderId ? (
          <Text color="secondary">
            Order <strong>{orderId}</strong> — we have emailed your receipt.
          </Text>
        ) : null}
        <Text color="secondary" className="kf-measure">
          Your blends are ground fresh after you order, so they reach you at their most
          fragrant. Expect delivery in 3–5 days.
        </Text>
        <Button label="Keep shopping" href="/shop" variant="primary" size="lg" />
      </VStack>
    </div>
  );
}
