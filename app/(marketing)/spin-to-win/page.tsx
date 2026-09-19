import type { Metadata } from 'next';

import { SpinWheel } from '@/components/sections/SpinWheel';
import { Heading, Text, VStack } from '@/components/ui';
import { getSpinPrizes } from '@/lib/api/promotions';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Spin to win',
    description: 'Spin the wheel for a KokoFresh discount code.',
    path: '/spin-to-win',
  }),
  robots: 'noindex, follow',
};

export default async function SpinToWinPage() {
  const prizes = await getSpinPrizes();

  return (
    <div className="kf-container kf-shop">
      <VStack gap={5} hAlign="center" className="kf-center-text">
        <VStack gap={1.5} hAlign="center">
          <p className="kf-eyebrow">One spin per visit</p>
          <Heading level={1}>Spin to win</Heading>
          <span className="kf-rule" aria-hidden="true" />
          <Text color="secondary" className="kf-measure">
            Discount codes, free shipping, or nothing at all. Worth a spin.
          </Text>
        </VStack>

        <SpinWheel prizes={prizes} />
      </VStack>
    </div>
  );
}
