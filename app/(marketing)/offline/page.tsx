import type { Metadata } from 'next';

import { Button, Heading, Text, VStack } from '@/components/ui';

export const metadata: Metadata = {
  title: 'You are offline',
  // Never index the offline fallback — it is a device state, not a page.
  robots: { index: false, follow: false },
};

/**
 * Offline fallback, served by the service worker when a navigation fails.
 *
 * Deliberately does NOT show prices or product data: anything cached could be
 * stale, and a wrong price shown confidently is worse than no price at all.
 */
export default function OfflinePage() {
  return (
    <div className="kf-container kf-shop">
      <VStack gap={4} hAlign="center" padding={10} className="kf-center-text">
        <p className="kf-eyebrow">No connection</p>
        <Heading level={1}>You&rsquo;re offline</Heading>
        <span className="kf-rule" aria-hidden="true" />
        <Text color="secondary" className="kf-measure">
          Pages you&rsquo;ve already visited will still open. Anything with a
          price needs a connection, so we don&rsquo;t show you a figure that
          might have changed.
        </Text>
        <Button label="Try again" variant="primary" href="/" />
      </VStack>
    </div>
  );
}
